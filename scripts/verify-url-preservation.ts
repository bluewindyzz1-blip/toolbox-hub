import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultCatalog, getCategoryPath, getToolPath } from "../shared/catalog";
import { toAbsoluteUrl } from "../shared/seo";
import { getGuideContent, getGuidePath, guideContents } from "../shared/content";

const origin = "https://carculate.moneyko.co.kr";
const root = resolve(import.meta.dirname, "..");
const baselinePath = resolve(root, "reports/url-preservation-baseline-2026-08-19.txt");
const robotsBaselinePath = resolve(root, "reports/robots-preservation-baseline-2026-08-19.txt");
const sitemapPath = resolve(root, "client/public/sitemap.xml");
const robotsPath = resolve(root, "client/public/robots.txt");
const distDir = resolve(root, "dist", "public");
const failures: string[] = [];
const readLines = (path: string) => readFileSync(path, "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const baseline = new Set(readLines(baselinePath));
const sitemapXml = readFileSync(sitemapPath, "utf8");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapSet = new Set(sitemapUrls);
const approvedNewUrls = new Set([
  "/calculator/finance/family-loan-interest",
  "/calculator/real-estate/jeonse-vs-monthly",
  "/calculator/business",
  "/calculator/business/roas",
  "/calculator/automobile",
  "/calculator/automobile/maintenance-cost",
  "/calculator/retirement",
  "/calculator/retirement/retirement-fund",
  "/guides",
  ...guideContents.map((guide) => getGuidePath(guide.slug)),
].map((path) => toAbsoluteUrl(path, origin)));

for (const url of baseline) if (!sitemapSet.has(url)) failures.push(`기존 sitemap URL 누락: ${url}`);
for (const url of sitemapSet) if (!baseline.has(url) && !approvedNewUrls.has(url)) failures.push(`승인되지 않은 신규 sitemap URL: ${url}`);
for (const url of baseline) if (sitemapUrls.filter((item) => item === url).length > 1) failures.push(`기존 URL 중복: ${url}`);
if (sitemapUrls.length !== sitemapSet.size) failures.push(`sitemap 중복 개수: ${sitemapUrls.length - sitemapSet.size}`);

if (existsSync(robotsBaselinePath) && existsSync(robotsPath)) {
  const expectedRobots = readFileSync(robotsBaselinePath, "utf8").trim();
  const actualRobots = readFileSync(robotsPath, "utf8").trim();
  if (expectedRobots !== actualRobots) failures.push("robots.txt가 기준선과 달라졌습니다.");
} else failures.push("robots.txt 기준선 또는 생성 파일이 없습니다.");

for (const url of approvedNewUrls) {
  const path = new URL(url).pathname;
  const htmlPath = resolve(distDir, `${path.slice(1)}.html`);
  if (!existsSync(htmlPath)) { failures.push(`신규 정적 HTML 누락: ${path}`); continue; }
  const html = readFileSync(htmlPath, "utf8");
  const canonical = `rel="canonical" href="${url}"`;
  if (!html.includes(canonical)) failures.push(`신규 canonical 누락: ${path}`);
}

for (const guide of guideContents) {
  for (const toolSlug of guide.relatedToolSlugs) if (!defaultCatalog.tools.some((tool) => tool.slug === toolSlug)) failures.push(`가이드 계산기 링크 누락: ${guide.slug} -> ${toolSlug}`);
  for (const guideSlug of guide.relatedGuideSlugs) if (!getGuideContent(guideSlug)) failures.push(`가이드 콘텐츠 링크 누락: ${guide.slug} -> ${guideSlug}`);
}

for (const slug of ["family-loan-interest", "jeonse-vs-monthly", "roas", "maintenance-cost", "retirement-fund"]) {
  const tool = defaultCatalog.tools.find((item) => item.slug === slug);
  if (!tool) { failures.push(`신규 카탈로그 도구 누락: ${slug}`); continue; }
  const toolPath = getToolPath(tool, defaultCatalog.categories);
  const category = defaultCatalog.categories.find((item) => item.id === tool.categoryId);
  if (!category) { failures.push(`신규 도구 카테고리 누락: ${slug}`); continue; }
  const categoryPath = getCategoryPath(category, defaultCatalog.categories);
  const categoryHtmlPath = resolve(distDir, `${categoryPath.slice(1)}.html`);
  if (existsSync(categoryHtmlPath) && !readFileSync(categoryHtmlPath, "utf8").includes(toolPath)) failures.push(`신규 도구 내부링크 누락: ${categoryPath} -> ${toolPath}`);
}

console.log(JSON.stringify({ baselineCount: baseline.size, sitemapCount: sitemapSet.size, approvedNewCount: approvedNewUrls.size, failures }, null, 2));
if (failures.length) process.exit(1);
