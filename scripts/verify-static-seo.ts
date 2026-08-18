import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultCatalog } from "../shared/catalog";
import { getSeoPublicPaths, resolveSeoRoute, toAbsoluteUrl } from "../shared/seo";

const distDir = resolve(import.meta.dirname, "..", "dist", "public");
const origin = "https://carculate.moneyko.co.kr";
const failures: Array<{ path: string; issue: string }> = [];

function outputPath(path: string) {
  return path === "/" ? resolve(distDir, "index.html") : resolve(distDir, `${path.replace(/^\//, "")}.html`);
}

async function assertRoute(path: string) {
  const expected = resolveSeoRoute(path, defaultCatalog);
  const html = await readFile(outputPath(path), "utf8");
  const checks = [
    [`<title>${expected.title}</title>`, "title"],
    [`<meta name="description" content="${expected.description}" />`, "description"],
    [`<link rel="canonical" href="${toAbsoluteUrl(expected.canonicalPath, origin)}" />`, "canonical"],
    [`<meta name="robots" content="${expected.robots}" />`, "robots"],
    ["id=\"catalog-jsonld\"", "jsonld"],
  ] as const;
  for (const [needle, issue] of checks) if (!html.includes(needle)) failures.push({ path, issue });
  if (html.includes('src="/src/')) failures.push({ path, issue: "unbundled-source-reference" });
}

const paths = getSeoPublicPaths(defaultCatalog);
for (const path of paths) await assertRoute(path);
await assertRoute("/search");

const sitemap = await readFile(resolve(distDir, "sitemap.xml"), "utf8");
const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]);
if (locs.length !== paths.length) failures.push({ path: "/sitemap.xml", issue: `url-count:${locs.length}` });
for (const path of paths) if (!locs.includes(toAbsoluteUrl(path, origin))) failures.push({ path: "/sitemap.xml", issue: `missing:${path}` });

const robots = await readFile(resolve(distDir, "robots.txt"), "utf8");
if (!robots.includes(`${origin}/sitemap.xml`)) failures.push({ path: "/robots.txt", issue: "missing-sitemap-reference" });
if (!robots.includes("DaumWebMasterTool:")) failures.push({ path: "/robots.txt", issue: "missing-daum-verification" });

for (const path of ["index.html", "calculator/salary/monthly-take-home.html", "convert/pdf-edit/pdf-merge.html"]) {
  try { await stat(resolve(distDir, path)); } catch { failures.push({ path, issue: "missing-static-file" }); }
}

const report = { checkedIndexableRoutes: paths.length, checkedNoindexRoutes: 1, sitemapUrls: locs.length, failures };
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
