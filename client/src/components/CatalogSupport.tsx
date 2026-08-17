import { Link } from "wouter";
import { RotateCcw } from "lucide-react";
import { PropsWithChildren, useEffect } from "react";
import { CatalogCategory, CatalogTool, getCategoryLineage, getCategoryPath, getToolPath } from "@shared/catalog";
import { useCatalog } from "@/hooks/useCatalog";

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    element = selector.includes("canonical") ? document.createElement("link") : document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

export function SeoHead({ title, description, path, kind = "WebApplication", noindex = false }: { title: string; description: string; path?: string; kind?: "WebApplication" | "CollectionPage"; noindex?: boolean }) {
  useEffect(() => {
    document.title = title;
    const configuredOrigin = import.meta.env.VITE_CANONICAL_ORIGIN?.trim().replace(/\/$/, "");
    const origin = configuredOrigin || window.location.origin;
    const url = `${origin}${path ?? window.location.pathname}`;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('link[rel="canonical"]', { rel: "canonical", href: url });
    upsertMeta('meta[name="robots"]', { name: "robots", content: noindex ? "noindex,nofollow" : "index,follow" });
    let jsonLd = document.getElementById("catalog-jsonld");
    if (!jsonLd) { jsonLd = document.createElement("script"); jsonLd.id = "catalog-jsonld"; jsonLd.setAttribute("type", "application/ld+json"); document.head.appendChild(jsonLd); }
    jsonLd.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": kind, name: title, description, url });
  }, [title, description, path, kind, noindex]);
  return null;
}

export function CatalogBreadcrumb({ toolSlug, categorySlug, rootSlug }: { toolSlug?: string; categorySlug?: string; rootSlug?: string }) {
  const { data } = useCatalog();
  const catalog = data;
  const tool = toolSlug ? catalog?.tools.find((item) => item.slug === toolSlug) : undefined;
  const category = tool ? catalog?.categories.find((item) => item.id === tool.categoryId) : categorySlug ? catalog?.categories.find((item) => item.slug === categorySlug) : rootSlug ? catalog?.categories.find((item) => item.slug === rootSlug && item.parentId === null) : undefined;
  const lineage = category && catalog ? getCategoryLineage(category, catalog.categories) : [];
  const items: Array<{ name: string; href?: string }> = [{ name: "홈", href: "/" }, ...lineage.map((item) => ({ name: item.name, href: getCategoryPath(item, catalog?.categories ?? []) }))];
  if (tool) items.push({ name: tool.title });
  return <nav className="breadcrumb" aria-label="현재 위치">{items.map((item, index) => <span key={`${item.name}-${index}`}>{item.href ? <Link href={item.href}>{item.name}</Link> : item.name}{index < items.length - 1 && <b>/</b>}</span>)}</nav>;
}

type AdSlotName = "AD_TOP" | "AD_MIDDLE" | "AD_RESULT" | "AD_CONTENT" | "AD_RELATED";

declare global { interface Window { adsbygoogle?: unknown[]; } }

const adSlotIds: Partial<Record<AdSlotName, string | undefined>> = {
  AD_TOP: import.meta.env.VITE_ADSENSE_SLOT_AD_TOP,
  AD_MIDDLE: import.meta.env.VITE_ADSENSE_SLOT_AD_MIDDLE,
  AD_RESULT: import.meta.env.VITE_ADSENSE_SLOT_AD_RESULT,
  AD_CONTENT: import.meta.env.VITE_ADSENSE_SLOT_AD_CONTENT,
  AD_RELATED: import.meta.env.VITE_ADSENSE_SLOT_AD_RELATED,
};

function validPublisherId(value?: string) { return Boolean(value && /^ca-pub-\d+$/.test(value)); }

export function AdSlot({ slot }: { slot: AdSlotName }) {
  const publisher = import.meta.env.VITE_ADSENSE_PUBLISHER_ID?.trim();
  const slotId = adSlotIds[slot]?.trim();
  const enabled = validPublisherId(publisher) && Boolean(slotId);
  useEffect(() => {
    if (!enabled || !publisher || !slotId) return;
    const scriptId = "toolbox-adsense-script";
    if (!document.getElementById(scriptId)) { const script = document.createElement("script"); script.id = scriptId; script.async = true; script.crossOrigin = "anonymous"; script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`; document.head.appendChild(script); }
    const timer = window.setTimeout(() => { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* 광고 차단기 또는 네트워크 오류에서는 콘텐츠 레이아웃을 유지합니다. */ } }, 0);
    return () => window.clearTimeout(timer);
  }, [enabled, publisher, slotId]);
  if (!enabled || !publisher || !slotId) return null;
  return <aside className="ad-slot" aria-label="광고"><ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={publisher} data-ad-slot={slotId} data-ad-format="auto" data-full-width-responsive="true" /></aside>;
}

const officialReferenceGroups = [
  { match: /종합소득세|양도소득세|증여세|상속세|부가세|연말정산|취득세|재산세/, label: "국세청·위택스 세금 안내", href: "https://www.nts.go.kr/" },
  { match: /최저임금|주휴수당|연차수당|퇴직금|퇴직소득세|실업급여|근무시간|시급|연봉|월급|4대보험/, label: "고용노동부 노동 기준 안내", href: "https://www.moel.go.kr/" },
  { match: /국민연금/, label: "국민연금공단 공식 안내", href: "https://www.nps.or.kr/" },
  { match: /건강보험/, label: "국민건강보험공단 공식 안내", href: "https://www.nhis.or.kr/" },
  { match: /중개수수료|전월세|주택담보|전세대출|월세/, label: "국토교통부 주택·부동산 안내", href: "https://www.molit.go.kr/" },
];

function OfficialReference({ tool }: { tool: CatalogTool }) {
  const reference = officialReferenceGroups.find((item) => item.match.test(tool.title));
  if (!reference) return null;
  return <section className="official-reference"><p className="eyebrow">OFFICIAL REFERENCE</p><h2>공식 참고자료</h2><p>이 도구는 참고용 간이 계산입니다. 제도 적용·신고·계약 전에는 기준일과 세부 요건이 최신인지 아래 공식 안내에서 확인하세요.</p><a href={reference.href} target="_blank" rel="noreferrer">{reference.label} <span aria-hidden="true">↗</span></a></section>;
}

export function CalculatorActions({ onCalculate, onReset }: { onCalculate: () => void; onReset: () => void }) {
  return <div className="calculator-actions"><button className="primary-action" onClick={onCalculate}>계산하기</button><button className="reset-action" onClick={onReset}><RotateCcw size={16} />초기화</button></div>;
}

export function ToolKnowledge({ tool, method, example, caution, children }: PropsWithChildren<{ tool: CatalogTool; method: string; example: string; caution: string }>) {
  const { data } = useCatalog();
  const related = (tool.relatedToolIds ?? []).map((id) => data?.tools.find((item) => item.id === id)).filter((item): item is CatalogTool => Boolean(item));
  return <section className="tool-knowledge">
    <AdSlot slot="AD_CONTENT" />
    <div className="knowledge-grid"><article><p className="eyebrow">FORMULA</p><h2>계산 공식</h2><p>{tool.formula ?? "입력값을 기준으로 계산합니다."}</p></article><article><p className="eyebrow">METHOD</p><h2>계산 방법</h2><p>{method}</p></article><article><p className="eyebrow">EXAMPLE</p><h2>계산 예시</h2><p>{example}</p></article><article><p className="eyebrow">NOTICE</p><h2>주의사항</h2><p>{caution}</p></article></div>
    {children}
    <OfficialReference tool={tool} />
    <section className="faq-section"><p className="eyebrow">FAQ</p><h2>자주 묻는 질문</h2>{(tool.faq ?? []).map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}<details><summary>계산 결과를 실제 계약 또는 지급 금액으로 사용해도 되나요?</summary><p>이 도구는 입력값에 따른 참고용 결과를 제공합니다. 실제 계약, 세금, 금융 상품 조건은 관련 기관 또는 전문가에게 확인하세요.</p></details><details><summary>입력한 정보는 저장되나요?</summary><p>계산 입력값은 현재 브라우저에서만 사용되며, 카테고리나 도구 데이터와 별도로 저장하지 않습니다.</p></details></section>
    <AdSlot slot="AD_RELATED" />
    <section className="related-tools"><p className="eyebrow">RELATED TOOLS</p><h2>관련 도구</h2>{related.length ? <div>{related.map((item) => <Link key={item.id} href={getToolPath(item, data?.categories ?? [])}><span>{item.kind.toUpperCase()}</span><strong>{item.title}</strong><small>{item.description}</small></Link>)}</div> : <p className="empty-copy">같은 카테고리의 도구를 카테고리 관리 화면에서 연결할 수 있습니다.</p>}</section>
  </section>;
}

export function ToolMetaResolver({ slug, children }: { slug: string; children: (tool: CatalogTool) => React.ReactNode }) {
  const { data } = useCatalog();
  const tool = data?.tools.find((item) => item.slug === slug);
  if (!tool) return null;
  return <>{children(tool)}</>;
}

export function categoryToolGroups(categories: CatalogCategory[], tools: CatalogTool[], root: CatalogCategory) {
  const descendants = (id: number): number[] => {
    const children = categories.filter((item) => item.parentId === id);
    return [id, ...children.flatMap((child) => descendants(child.id))];
  };
  return categories.filter((item) => item.parentId === root.id).map((subcategory) => ({ subcategory, tools: tools.filter((tool) => descendants(subcategory.id).includes(tool.categoryId)) }));
}
