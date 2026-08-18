import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultCatalog, getCategoryPath } from "../shared/catalog";
import { getSeoPublicPaths, resolveSeoRoute, toAbsoluteUrl } from "../shared/seo";

const origin = "https://carculate.moneyko.co.kr";
const distDir = resolve(import.meta.dirname, "..", "dist", "public");
const calculatorRoot = defaultCatalog.categories.find((category) => category.slug === "calculator" && category.parentId === null);
if (!calculatorRoot) throw new Error("계산기 대분류를 찾지 못했습니다.");

const indexedPaths = new Set(getSeoPublicPaths(defaultCatalog));
const categoryPaths = defaultCatalog.categories
  .filter((category) => category.id === calculatorRoot.id || category.parentId === calculatorRoot.id)
  .map((category) => getCategoryPath(category, defaultCatalog.categories))
  .filter((path) => indexedPaths.has(path));

const failures: string[] = [];
for (const path of categoryPaths) {
  const route = resolveSeoRoute(path, defaultCatalog);
  const filePath = path === "/" ? resolve(distDir, "index.html") : resolve(distDir, `${path.slice(1)}.html`);
  if (!existsSync(filePath)) {
    failures.push(`${path}: 정적 HTML이 없습니다.`);
    continue;
  }
  const html = readFileSync(filePath, "utf8");
  const expectedUrl = toAbsoluteUrl(route.canonicalPath, origin);
  const checks: Array<[string, string]> = [
    ["title", `<title>${route.title}</title>`],
    ["description", `name="description" content="${route.description}"`],
    ["canonical", `rel="canonical" href="${expectedUrl}"`],
    ["Open Graph title", `property="og:title" content="${route.title}"`],
    ["Open Graph URL", `property="og:url" content="${expectedUrl}"`],
    ["CollectionPage", '"@type":"CollectionPage"'],
    ["ItemList", '"@type":"ItemList"'],
    ["BreadcrumbList", '"@type":"BreadcrumbList"'],
  ];
  if (route.faq.length) checks.push(["FAQPage", '"@type":"FAQPage"']);
  for (const [name, value] of checks) if (!html.includes(value)) failures.push(`${path}: ${name} 누락`);
}

console.log(JSON.stringify({ checkedPaths: categoryPaths, failures }, null, 2));
if (failures.length) process.exit(1);
