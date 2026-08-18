import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultCatalog, getToolPath } from "../shared/catalog";
import { resolveSeoRoute, toAbsoluteUrl } from "../shared/seo";

const origin = "https://carculate.moneyko.co.kr";
const distDir = resolve(import.meta.dirname, "..", "dist", "public");
const slugs = ["unit-price", "fee", "parking-fee", "currency-exchange", "return-rate", "json-pretty", "csv-to-markdown", "url-encode", "base64-encode"];
const failures: string[] = [];

for (const slug of slugs) {
  const tool = defaultCatalog.tools.find((item) => item.slug === slug);
  if (!tool) { failures.push(`${slug}: 카탈로그 도구가 없습니다.`); continue; }
  const path = getToolPath(tool, defaultCatalog.categories);
  const route = resolveSeoRoute(path, defaultCatalog);
  const filePath = resolve(distDir, `${path.slice(1)}.html`);
  if (!existsSync(filePath)) { failures.push(`${path}: 정적 HTML이 없습니다.`); continue; }
  const html = readFileSync(filePath, "utf8");
  const expectedUrl = toAbsoluteUrl(route.canonicalPath, origin);
  const checks: Array<[string, string]> = [
    ["title", `<title>${route.title}</title>`],
    ["description", `name="description" content="${route.description}"`],
    ["canonical", `rel="canonical" href="${expectedUrl}"`],
    ["BreadcrumbList", '"@type":"BreadcrumbList"'],
  ];
  if (tool.faq?.length) checks.push(["FAQPage", '"@type":"FAQPage"'], ["첫 FAQ", tool.faq[0].question]);
  for (const [name, expected] of checks) if (!html.includes(expected)) failures.push(`${path}: ${name} 누락`);
}

console.log(JSON.stringify({ checkedCount: slugs.length, failures }, null, 2));
if (failures.length) process.exit(1);
