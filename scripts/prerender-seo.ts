import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultCatalog } from "../shared/catalog";
import { getSeoPublicPaths, resolveSeoRoute, SITE_NAME, toAbsoluteUrl } from "../shared/seo";

const distDir = resolve(import.meta.dirname, "..", "dist", "public");
const origin = (process.env.SITEMAP_ORIGIN || process.env.CANONICAL_ORIGIN || "https://carculate.moneyko.co.kr").replace(/\/$/, "");

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function routeOutputPath(path: string) {
  if (path === "/") return resolve(distDir, "index.html");
  return resolve(distDir, `${path.replace(/^\//, "")}.html`);
}

function renderStructuredData(path: string) {
  const route = resolveSeoRoute(path, defaultCatalog);
  const url = toAbsoluteUrl(route.canonicalPath, origin);
  const pageEntity: Record<string, unknown> = { "@type": route.kind, name: route.title, description: route.description, url };
  if (route.collectionItems.length) {
    pageEntity.mainEntity = {
      "@type": "ItemList",
      numberOfItems: route.collectionItems.length,
      itemListElement: route.collectionItems.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: toAbsoluteUrl(item.path, origin) })),
    };
  }
  const graph: Record<string, unknown>[] = [pageEntity];

  if (path === "/") {
    graph.push({ "@type": "Organization", name: SITE_NAME, url: origin, email: "infokokk1@naver.com" });
  }
  if (route.breadcrumbs.length > 1) {
    graph.push({ "@type": "BreadcrumbList", itemListElement: route.breadcrumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: toAbsoluteUrl(item.path, origin) })) });
  }
  if (route.faq.length) {
    graph.push({ "@type": "FAQPage", mainEntity: route.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function renderHead(path: string) {
  const route = resolveSeoRoute(path, defaultCatalog);
  const url = toAbsoluteUrl(route.canonicalPath, origin);
  const jsonLd = renderStructuredData(path);
  return [
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
    `<meta name="robots" content="${route.robots}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<script id="catalog-jsonld" type="application/ld+json">${jsonLd}</script>`,
    `<title>${escapeHtml(route.title)}</title>`,
  ].join("\n    ");
}

function renderSeoFallback(path: string) {
  const route = resolveSeoRoute(path, defaultCatalog);
  const calculator = path.startsWith("/calculator/");
  const guide = path.startsWith("/guides/");
  const usage = calculator
    ? "필요한 입력값을 입력한 뒤 계산하기 버튼을 누르면 예상 결과와 계산 근거를 확인할 수 있습니다."
    : guide
      ? "관련 계산기를 열어 필요한 값을 직접 입력하고, 아래 설명과 계산 예시를 함께 확인할 수 있습니다."
      : "카테고리 또는 도구를 선택하면 필요한 기능을 바로 사용할 수 있습니다.";
  const result = calculator
    ? "표시되는 결과는 입력값에 따른 참고용 계산 결과이며 실제 금융·세금·계약·지급 결과와 다를 수 있습니다."
    : "중요한 의사결정 전에는 관련 기관 또는 전문가의 최신 기준을 확인하세요.";
  return `<noscript><main class="seo-fallback"><h1>${escapeHtml(route.title)}</h1><p>${escapeHtml(route.description)}</p><h2>사용 방법</h2><p>${escapeHtml(usage)}</p><h2>결과 안내</h2><p>${escapeHtml(result)}</p></main></noscript>`;
}

function injectRouteSeo(html: string, path: string) {
  const route = resolveSeoRoute(path, defaultCatalog);
  const metaPattern = /\s*<meta name="description"[\s\S]*?<title>[\s\S]*?<\/title>/;
  const replacement = `\n    ${renderHead(path)}`;
  if (!metaPattern.test(html)) throw new Error("기본 HTML에서 SEO 메타데이터 블록을 찾지 못했습니다.");
  return html.replace(metaPattern, replacement).replace("<!--app-head-->", `<!--app-head--><!-- pre-rendered metadata: ${route.canonicalPath} -->${renderSeoFallback(path)}`);
}

const template = await readFile(resolve(distDir, "index.html"), "utf8");
const paths = getSeoPublicPaths(defaultCatalog);
for (const path of paths) {
  const outputPath = routeOutputPath(path);
  await mkdir(resolve(outputPath, ".."), { recursive: true });
  await writeFile(outputPath, injectRouteSeo(template, path), "utf8");
}

const searchTemplate = injectRouteSeo(template, "/search");
await writeFile(resolve(distDir, "search.html"), searchTemplate, "utf8");

console.log(`Generated route-specific SEO HTML for ${paths.length} indexable URLs and 1 noindex search route.`);
