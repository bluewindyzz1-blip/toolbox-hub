import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultCatalog, getCategoryPath, getToolPath } from "../shared/catalog";
import { toAbsoluteUrl } from "../shared/seo";

const origin = "https://carculate.moneyko.co.kr";
const root = resolve(import.meta.dirname, "..");
const distDir = resolve(root, "dist", "public");
const sitemapPath = resolve(root, "client/public/sitemap.xml");
const failures: string[] = [];
const expectedPaths = new Set<string>();
const addPath = (path: string, label: string) => {
  if (expectedPaths.has(path)) failures.push(`경로 중복: ${label} -> ${path}`);
  expectedPaths.add(path);
  const htmlPath = resolve(distDir, `${path === "/" ? "index" : path.slice(1)}.html`);
  if (!existsSync(htmlPath)) failures.push(`정적 HTML 누락: ${label} -> ${path}`);
  else {
    const html = readFileSync(htmlPath, "utf8");
    if (html.includes("href=\"/undefined") || html.includes("href=\"[object Object]")) failures.push(`잘못된 내부 링크: ${path}`);
    if (!html.includes(`rel=\"canonical\" href=\"${toAbsoluteUrl(path, origin)}\"`)) failures.push(`canonical 불일치 또는 누락: ${path}`);
  }
};

for (const category of defaultCatalog.categories) {
  if (category.parentId === null) addPath(getCategoryPath(category, defaultCatalog.categories), `category:${category.slug}`);
}
for (const tool of defaultCatalog.tools) addPath(getToolPath(tool, defaultCatalog.categories), `tool:${tool.slug}`);

const sitemap = readFileSync(sitemapPath, "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
const sitemapSet = new Set(sitemapUrls);
if (sitemapUrls.length !== sitemapSet.size) failures.push(`sitemap 중복: ${sitemapUrls.length - sitemapSet.size}개`);
for (const path of expectedPaths) if (!sitemapSet.has(path)) failures.push(`sitemap 누락: ${path}`);
for (const path of sitemapSet) {
  const htmlPath = resolve(distDir, `${path === "/" ? "index" : path.slice(1)}.html`);
  if (!existsSync(htmlPath)) failures.push(`sitemap 정적 HTML 누락: ${path}`);
  else {
    const html = readFileSync(htmlPath, "utf8");
    if (!html.includes(`rel=\"canonical\" href=\"${toAbsoluteUrl(path, origin)}\"`)) failures.push(`sitemap URL canonical 누락: ${path}`);
  }
}

console.log(JSON.stringify({ categories: defaultCatalog.categories.length, tools: defaultCatalog.tools.length, expectedStaticRoutes: expectedPaths.size, sitemapUrls: sitemapSet.size, failures }, null, 2));
if (failures.length) process.exit(1);
