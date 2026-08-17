import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultCatalog, getCategoryPath, getToolPath } from "../shared/catalog";

const origin = (process.env.SITEMAP_ORIGIN || process.env.CANONICAL_ORIGIN || "https://toolbox-hub-h4sq.vercel.app").replace(/\/$/, "");
const staticPaths = ["/", "/about", "/guide", "/faq", "/privacy", "/terms", "/disclaimer", "/cookie-policy", "/contact", "/document"];
const descendantCategoryIds = (id: number): number[] => [id, ...defaultCatalog.categories.filter((category) => category.parentId === id).flatMap((category) => descendantCategoryIds(category.id))];
const categoryPaths = defaultCatalog.categories
  .filter((category) => category.parentId === null || defaultCatalog.categories.some((root) => root.id === category.parentId && root.parentId === null))
  .filter((category) => defaultCatalog.tools.some((tool) => descendantCategoryIds(category.id).includes(tool.categoryId)))
  .map((category) => getCategoryPath(category, defaultCatalog.categories));
const toolPaths = defaultCatalog.tools.map((tool) => getToolPath(tool, defaultCatalog.categories));
const paths = [...new Set([...staticPaths, ...categoryPaths, ...toolPaths])].sort();
const today = new Date().toISOString().slice(0, 10);
const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc><lastmod>${today}</lastmod><changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq></url>`).join("\n")}\n</urlset>\n`;

const outputDir = resolve(import.meta.dirname, "..", "client", "public");
await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, "sitemap.xml"), xml, "utf8");
console.log(`Generated sitemap.xml with ${paths.length} public URLs for ${origin}.`);
