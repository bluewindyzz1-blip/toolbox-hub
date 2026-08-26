import { Link } from "wouter";
import { Download, Printer, RotateCcw } from "lucide-react";
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

export function SeoHead({ title, description, path, kind = "WebApplication" }: { title: string; description: string; path?: string; kind?: "WebApplication" | "CollectionPage" }) {
  useEffect(() => {
    document.title = title;
    const url = `${window.location.origin}${path ?? window.location.pathname}`;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('link[rel="canonical"]', { rel: "canonical", href: url });
    let jsonLd = document.getElementById("catalog-jsonld");
    if (!jsonLd) { jsonLd = document.createElement("script"); jsonLd.id = "catalog-jsonld"; jsonLd.setAttribute("type", "application/ld+json"); document.head.appendChild(jsonLd); }
    jsonLd.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": kind, name: title, description, url });
  }, [title, description, path, kind]);
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

export function AdSlot({ slot }: { slot: "AD_TOP" | "AD_MIDDLE" | "AD_RESULT" | "AD_CONTENT" | "AD_RELATED" }) {
  return <aside className="ad-slot" aria-label={`${slot} 광고 영역`}><span>ADVERTISEMENT</span><strong>{slot}</strong><small>광고 코드 연결 영역</small></aside>;
}

function recordToolEvent(name: string, detail: Record<string, string> = {}) {
  try {
    window.dispatchEvent(new CustomEvent("carculate:tool-event", { detail: { name, path: window.location.pathname, ...detail } }));
    const key = `carculate:event:${name}`;
    localStorage.setItem(key, String(Number(localStorage.getItem(key) ?? "0") + 1));
  } catch { /* 브라우저 저장소가 차단되어도 도구 사용은 계속합니다. */ }
}

export function CalculatorActions({ onCalculate, onReset }: { onCalculate: () => void; onReset: () => void }) {
  return <div className="calculator-actions"><button className="primary-action" onClick={() => { onCalculate(); recordToolEvent("calculate"); }}>계산하기</button><button className="reset-action" onClick={() => { onReset(); recordToolEvent("reset"); }}><RotateCcw size={16} />초기화</button></div>;
}

function downloadResultSummary(tool: CatalogTool) {
  const output = document.querySelector(".calculator-output")?.textContent?.replace(/\s+/g, " ").trim() ?? "결과 화면이 아직 없습니다.";
  const inputs = Array.from(document.querySelectorAll(".calculator-form input, .calculator-form select")).map((element) => `${element.getAttribute("aria-label") ?? element.getAttribute("name") ?? "입력값"}: ${(element as HTMLInputElement).value}`).join("\n");
  const text = [`Carculate 결과 요약`, `도구: ${tool.title}`, `주소: ${window.location.href}`, `확인일: ${new Date().toLocaleDateString("ko-KR")}`, ``, `입력값`, inputs || "입력값 없음", ``, `결과`, output, ``, `참고`, "이 결과는 입력값에 따른 참고용 계산이며 실제 계약·세금·금융기관 결과를 대신하지 않습니다."].join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${tool.title.replace(/\s+/g, "-")}-결과요약.txt`; anchor.click(); URL.revokeObjectURL(url);
  recordToolEvent("download-summary");
}

const coreDecisionTools = [
  ["연봉 실수령액", "/calculator/salary/annual-net"], ["월급 실수령액", "/calculator/salary/monthly-take-home"], ["퇴직금", "/calculator/salary/retirement-pay"], ["실업급여", "/calculator/salary/unemployment-benefit"],
  ["대출 이자", "/calculator/finance/loan-interest"], ["원리금균등상환", "/calculator/finance/loan-amortization"], ["예금 이자", "/calculator/finance/deposit-interest"], ["적금 만기액", "/calculator/finance/savings"], ["복리", "/calculator/finance/compound-interest"], ["중도상환수수료", "/calculator/finance/early-repayment-fee"],
  ["전세대출 이자", "/calculator/real-estate/jeonse-loan-interest"], ["주택담보대출", "/calculator/real-estate/mortgage"], ["전월세 전환", "/calculator/real-estate/monthly-rent"], ["취득세", "/calculator/real-estate/acquisition-tax"], ["중개보수", "/calculator/real-estate/brokerage-fee"],
  ["부가세", "/calculator/tax/vat-calculator"], ["재산세", "/calculator/real-estate/property-tax"], ["평수 변환", "/calculator/real-estate/pyeong"], ["퍼센트", "/calculator/finance/percentage"], ["PDF 합치기", "/convert/pdf-edit/pdf-merge"],
] as const;

function ResultDecisionSupport({ tool }: { tool: CatalogTool }) {
  return <section className="decision-support" aria-label="결과 활용 안내">
    <div className="decision-support-head"><div><p className="eyebrow">DECISION SUPPORT</p><h2>결과를 다음 행동으로 연결하세요.</h2></div><div className="decision-support-actions"><button type="button" onClick={() => downloadResultSummary(tool)}><Download size={15} />결과 요약 저장</button><button type="button" onClick={() => { window.print(); recordToolEvent("print"); }}><Printer size={15} />인쇄</button></div></div>
    <div className="decision-support-grid"><article><strong>계산 근거</strong><p>{tool.formula ?? "입력한 값을 기준으로 도구에 등록된 산식을 적용합니다."}</p></article><article><strong>적용 가정</strong><p>입력값과 안내된 계산 방법을 기준으로 한 예상치입니다. 수수료·개별 계약조건·공식 고시값은 별도 확인이 필요합니다.</p></article><article><strong>기준일·검토</strong><p>페이지에 표시된 계산 기준을 우선 적용합니다. 금융·세금·부동산 결과는 실제 이용 전 관련 기관의 최신 기준을 확인하세요.</p></article></div>
    <div className="next-actions"><strong>다음에 확인할 것</strong><div><Link href="/search">관련 도구 다시 찾기</Link><Link href="/guide">계산 가이드 보기</Link><Link href="/contact">결과 또는 기능 문의하기</Link><Link href="/disclaimer">계산 결과 이용 안내</Link></div></div>
    <div className="core-tool-links"><p className="eyebrow">NEXT TOOL</p><h3>다음 결정을 위한 대표 도구</h3><div>{coreDecisionTools.filter(([, href]) => href !== window.location.pathname).slice(0, 5).map(([label, href]) => <Link key={href} href={href}>{label}<span>↗</span></Link>)}</div></div>
  </section>;
}

export function ToolKnowledge({ tool, method, example, caution, children }: PropsWithChildren<{ tool: CatalogTool; method: string; example: string; caution: string }>) {
  const { data } = useCatalog();
  const related = (tool.relatedToolIds ?? []).map((id) => data?.tools.find((item) => item.id === id)).filter((item): item is CatalogTool => Boolean(item));
  return <section className="tool-knowledge">
    <AdSlot slot="AD_CONTENT" />
    <div className="knowledge-grid"><article><p className="eyebrow">FORMULA</p><h2>계산 공식</h2><p>{tool.formula ?? "입력값을 기준으로 계산합니다."}</p></article><article><p className="eyebrow">METHOD</p><h2>계산 방법</h2><p>{method}</p></article><article><p className="eyebrow">EXAMPLE</p><h2>계산 예시</h2><p>{example}</p></article><article><p className="eyebrow">NOTICE</p><h2>주의사항</h2><p>{caution}</p></article></div>
    <ResultDecisionSupport tool={tool} />
    {children}
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
