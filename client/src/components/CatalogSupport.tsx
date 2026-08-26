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

type DocumentTemplate = { label: string; filename: string; title: string; sections: string[] };
const documentTemplates: Record<string, DocumentTemplate[]> = {
  "annual-net": [{ label: "급여 확인 메모", filename: "급여-실수령액-확인메모.txt", title: "급여 실수령액 확인 메모", sections: ["회사·직장명:", "확인할 급여월:", "급여명세서와 계산기 결과를 비교하세요."] }],
  "monthly-take-home": [{ label: "급여 확인 메모", filename: "월급-실수령액-확인메모.txt", title: "월급 실수령액 확인 메모", sections: ["급여월:", "세전 급여:", "공제항목과 실제 급여명세서를 대조하세요."] }],
  "retirement-pay": [{ label: "퇴직금 확인 체크리스트", filename: "퇴직금-확인체크리스트.txt", title: "퇴직금 확인 체크리스트", sections: ["입사일:", "퇴사 예정일:", "최근 급여명세서와 근속기간을 준비하세요.", "실제 지급액은 회사와 고용노동부 기준을 확인하세요."] }],
  "unemployment-benefit": [{ label: "실업급여 준비 메모", filename: "실업급여-준비메모.txt", title: "실업급여 신청 준비 메모", sections: ["최종 근무일:", "이직 사유:", "피보험단위기간과 수급자격을 고용보험에서 확인하세요."] }],
  "monthly-rent": [{ label: "임대차 비용 비교표", filename: "임대차-비용-비교표.txt", title: "임대차 비용 비교표", sections: ["주소:", "보증금:", "월세:", "관리비:", "계약서의 특약과 전환율을 별도로 확인하세요."] }],
  "jeonse-loan-interest": [{ label: "전세대출 비교 메모", filename: "전세대출-비교메모.txt", title: "전세대출 비교 메모", sections: ["대출 희망금액:", "확인 금융기관:", "금리·보증료·중도상환 조건을 함께 비교하세요."] }],
  "mortgage": [{ label: "주택자금 점검표", filename: "주택자금-점검표.txt", title: "주택자금 점검표", sections: ["주택 가격:", "대출 예정액:", "취득세·중개보수·이사비 등 부대비용을 함께 준비하세요."] }],
  "acquisition-tax": [{ label: "취득 비용 준비표", filename: "취득비용-준비표.txt", title: "주택 취득 비용 준비표", sections: ["매매가격:", "주택 수:", "취득일 기준 세율과 감면 요건을 위택스에서 확인하세요."] }],
  "vat": [{ label: "부가세 신고 준비 메모", filename: "부가세-신고준비메모.txt", title: "부가세 신고 준비 메모", sections: ["사업자등록번호:", "신고기간:", "매출·매입 증빙과 과세유형을 확인하세요."] }],
  "loan-interest": [{ label: "대출 비교 메모", filename: "대출-비교메모.txt", title: "대출 조건 비교 메모", sections: ["금융기관:", "대출 금리:", "상환 방식:", "총이자뿐 아니라 보증료·수수료·우대조건을 비교하세요."] }],
};

function downloadDocumentTemplate(template: DocumentTemplate, tool: CatalogTool) {
  const output = document.querySelector(".calculator-output")?.textContent?.replace(/\\s+/g, " ").trim() ?? "계산 전 결과 없음";
  const inputs = Array.from(document.querySelectorAll(".calculator-form input, .calculator-form select")).map((element) => `${element.getAttribute("aria-label") ?? element.getAttribute("name") ?? "입력값"}: ${(element as HTMLInputElement).value}`).join("\\n");
  const text = [template.title, `작성일: ${new Date().toLocaleDateString("ko-KR")}`, `도구: ${tool.title}`, "", ...template.sections, "", "입력값 요약", inputs || "입력값 없음", "", "계산 결과", output, "", "주의: 이 문서는 확인용 초안이며 계약·신고·지급 서류를 대신하지 않습니다."].join("\\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = template.filename; anchor.click(); URL.revokeObjectURL(url);
  recordToolEvent("download-template", { template: template.filename });
}

function DocumentTemplateActions({ tool }: { tool: CatalogTool }) {
  const templates = documentTemplates[tool.logicKey ?? ""] ?? [];
  if (!templates.length) return null;
  return <section className="document-template-actions" aria-label="관련 문서 템플릿"><p className="eyebrow">DOCUMENT NEXT STEP</p><h3>다음 문서를 준비하세요.</h3><p>계산 결과와 입력값을 포함한 확인용 초안을 브라우저에서 저장할 수 있습니다.</p><div>{templates.map((template) => <button type="button" key={template.filename} onClick={() => downloadDocumentTemplate(template, tool)}><Download size={15} />{template.label}</button>)}</div><small>저장 파일은 확인용 초안이며 실제 계약서·신고서·법정 서식을 대신하지 않습니다.</small></section>;
}

const coreDecisionTools = [
  ["연봉 실수령액", "/calculator/salary/annual-net"], ["월급 실수령액", "/calculator/salary/monthly-take-home"], ["퇴직금", "/calculator/salary/retirement-pay"], ["실업급여", "/calculator/salary/unemployment-benefit"],
  ["대출 이자", "/calculator/finance/loan-interest"], ["원리금균등상환", "/calculator/finance/loan-amortization"], ["예금 이자", "/calculator/finance/deposit-interest"], ["적금 만기액", "/calculator/finance/savings"], ["복리", "/calculator/finance/compound-interest"], ["중도상환수수료", "/calculator/finance/early-repayment-fee"],
  ["전세대출 이자", "/calculator/real-estate/jeonse-loan-interest"], ["주택담보대출", "/calculator/real-estate/mortgage"], ["전월세 전환", "/calculator/real-estate/monthly-rent"], ["취득세", "/calculator/real-estate/acquisition-tax"], ["중개보수", "/calculator/real-estate/brokerage-fee"],
  ["부가세", "/calculator/tax/vat-calculator"], ["재산세", "/calculator/real-estate/property-tax"], ["평수 변환", "/calculator/real-estate/pyeong"], ["퍼센트", "/calculator/finance/percentage"], ["PDF 합치기", "/convert/pdf-edit/pdf-merge"],
] as const;

type DecisionMeta = { interpretation: string; reviewDate: string; sourceLabel: string; sourceUrl?: string; nextAction: string; guidePath: string };
const decisionMeta: Record<string, DecisionMeta> = {
  "annual-net": { interpretation: "결과는 입력한 연봉에서 예상 공제액을 뺀 월 실수령액입니다. 부양가족·비과세 수당·연말정산에 따라 실제 급여명세서와 달라질 수 있습니다.", reviewDate: "2026-01-01", sourceLabel: "국세청 홈택스", sourceUrl: "https://www.hometax.go.kr", nextAction: "급여명세서와 비과세 수당을 대조하세요.", guidePath: "/guide/annual-net" },
  "monthly-take-home": { interpretation: "월 급여를 기준으로 사회보험과 추정 소득세를 반영한 참고용 실수령액입니다.", reviewDate: "2026-01-01", sourceLabel: "국세청 홈택스", sourceUrl: "https://www.hometax.go.kr", nextAction: "근로계약서의 세전 급여와 공제항목을 확인하세요.", guidePath: "/guide/monthly-take-home" },
  "retirement-pay": { interpretation: "계속근로기간과 평균임금을 이용한 예상 퇴직금입니다. 평균임금 산정기간과 지급 사유에 따라 달라질 수 있습니다.", reviewDate: "2026-01-01", sourceLabel: "고용노동부", sourceUrl: "https://www.moel.go.kr", nextAction: "퇴직 전 급여명세서와 근속기간을 확인하세요.", guidePath: "/guide/retirement-pay" },
  "unemployment-benefit": { interpretation: "고용보험 가입기간과 평균임금 등을 바탕으로 한 예상치이며, 수급자격 판단을 대신하지 않습니다.", reviewDate: "2026-01-01", sourceLabel: "고용보험", sourceUrl: "https://www.ei.go.kr", nextAction: "이직 사유와 피보험단위기간을 고용보험에서 확인하세요.", guidePath: "/guide/unemployment-benefit" },
  "loan-interest": { interpretation: "원금·금리·기간과 선택한 상환방식으로 계산한 예상 이자입니다. 실제 약정의 우대금리와 일할 계산은 금융기관 조건이 우선합니다.", reviewDate: "2026-01-01", sourceLabel: "금융감독원 금융상품 한눈에", sourceUrl: "https://finlife.fss.or.kr", nextAction: "금융기관의 금리·수수료·중도상환 조건을 비교하세요.", guidePath: "/guide/loan-interest" },
  "loan-amortization": { interpretation: "원리금균등 방식에서 매월 같은 금액을 납부한다고 가정한 상환액입니다.", reviewDate: "2026-01-01", sourceLabel: "금융감독원 금융상품 한눈에", sourceUrl: "https://finlife.fss.or.kr", nextAction: "상환방식별 총이자를 비교하세요.", guidePath: "/guide/loan-amortization" },
  "deposit-interest": { interpretation: "예치기간과 금리를 기준으로 계산한 세전·세후 예상 이자입니다. 금융기관의 상품 조건과 이자 지급방식을 확인하세요.", reviewDate: "2026-01-01", sourceLabel: "금융위원회", sourceUrl: "https://www.fsc.go.kr", nextAction: "예금자보호와 상품별 우대조건을 확인하세요.", guidePath: "/guide/deposit-interest" },
  "savings": { interpretation: "정기적으로 납입하는 금액과 기간을 기준으로 계산한 만기 예상액입니다.", reviewDate: "2026-01-01", sourceLabel: "금융감독원 금융상품 한눈에", sourceUrl: "https://finlife.fss.or.kr", nextAction: "월 납입액과 만기일을 상품 설명서와 대조하세요.", guidePath: "/guide/savings" },
  "compound-interest": { interpretation: "이자가 원금에 다시 더해진다고 가정한 복리 시뮬레이션입니다. 실제 수익률은 세금·수수료·변동성에 따라 달라집니다.", reviewDate: "2026-01-01", sourceLabel: "금융위원회", sourceUrl: "https://www.fsc.go.kr", nextAction: "기간·수익률·수수료를 보수적으로 다시 계산하세요.", guidePath: "/guide/compound-interest" },
  "early-repayment-fee": { interpretation: "중도상환 원금과 수수료율을 이용한 예상 비용입니다. 금융기관의 면제 조건과 잔여기간 산식이 우선합니다.", reviewDate: "2026-01-01", sourceLabel: "금융감독원 금융소비자정보포털 파인", sourceUrl: "https://fine.fss.or.kr", nextAction: "갈아타기 전 중도상환수수료와 절감 이자를 함께 비교하세요.", guidePath: "/guide/early-repayment-fee" },
  "monthly-rent": { interpretation: "보증금의 기회비용을 월세에 더해 비교하는 단순 환산값입니다. 계약 조건과 법정 전월세전환율을 별도로 확인하세요.", reviewDate: "2026-01-01", sourceLabel: "국가법령정보센터", sourceUrl: "https://www.law.go.kr", nextAction: "계약서의 보증금·월세·특약을 확인하세요.", guidePath: "/guide/monthly-rent" },
  "jeonse-loan-interest": { interpretation: "전세대출 원금과 금리를 기준으로 한 예상 부담액이며 보증료와 변동금리는 포함되지 않을 수 있습니다.", reviewDate: "2026-01-01", sourceLabel: "주택도시보증공사", sourceUrl: "https://www.khug.or.kr", nextAction: "대출금리뿐 아니라 보증료와 보증 조건을 함께 확인하세요.", guidePath: "/guide/jeonse-loan-interest" },
  "mortgage": { interpretation: "주택담보대출의 원금·금리·기간에 따른 예상 상환액입니다. 실제 한도·담보평가·우대조건은 금융기관 심사 결과가 우선합니다.", reviewDate: "2026-01-01", sourceLabel: "금융감독원 금융상품 한눈에", sourceUrl: "https://finlife.fss.or.kr", nextAction: "취득 부대비용과 월 현금흐름까지 함께 계산하세요.", guidePath: "/guide/mortgage" },
  "vat": { interpretation: "일반적인 부가가치세율을 가정한 공급가액·세액·합계액 계산입니다. 과세유형과 거래별 적용 여부를 확인하세요.", reviewDate: "2026-01-01", sourceLabel: "국세청", sourceUrl: "https://www.nts.go.kr", nextAction: "사업자 유형과 신고기간을 국세청에서 확인하세요.", guidePath: "/guide/vat" },
  "acquisition-tax": { interpretation: "입력한 주택 가격과 조건을 기준으로 한 취득세 참고 계산입니다. 주택 수·지역·감면 여부에 따라 실제 세액이 달라질 수 있습니다.", reviewDate: "2026-01-01", sourceLabel: "위택스", sourceUrl: "https://www.wetax.go.kr", nextAction: "취득일 기준 주택 수와 감면 요건을 확인하세요.", guidePath: "/guide/acquisition-tax" },
  "property-tax": { interpretation: "공시가격과 세율 가정을 이용한 참고값입니다. 실제 고지세액은 공시가격·세부담상한·지방세 규정에 따라 달라집니다.", reviewDate: "2026-01-01", sourceLabel: "위택스", sourceUrl: "https://www.wetax.go.kr", nextAction: "공시가격과 지방세 고지서를 대조하세요.", guidePath: "/guide/property-tax" },
  "brokerage-fee": { interpretation: "거래금액과 거래유형을 기준으로 한 중개보수 상한 참고값입니다. 지역 조례와 계약 조건을 확인하세요.", reviewDate: "2026-01-01", sourceLabel: "국가법령정보센터", sourceUrl: "https://www.law.go.kr", nextAction: "중개대상물 확인설명서와 보수 협의 내용을 확인하세요.", guidePath: "/guide/brokerage-fee" },
  "pyeong": { interpretation: "제곱미터와 평 사이의 고정 환산값을 적용한 결과입니다.", reviewDate: "상시 기준", sourceLabel: "국가표준인증 통합정보시스템", sourceUrl: "https://standard.go.kr", nextAction: "공식 계약·공고 문서의 표시 단위를 우선 확인하세요.", guidePath: "/guide/pyeong" },
  "percentage": { interpretation: "입력한 기준값 대비 증감 또는 비율을 계산한 결과입니다.", reviewDate: "상시 기준", sourceLabel: "국가표준인증 통합정보시스템", sourceUrl: "https://standard.go.kr", nextAction: "비교 기준과 기간이 같은지 확인하세요.", guidePath: "/guide/percentage" },
  "pdf": { interpretation: "파일을 서버로 전송하지 않고 현재 브라우저에서 처리하는 PDF 작업입니다. 복잡한 폰트·표·암호화 문서는 결과가 달라질 수 있습니다.", reviewDate: "상시 기준", sourceLabel: "브라우저 내 처리 안내", nextAction: "변환 후 파일을 열어 페이지·서식·텍스트를 확인하세요.", guidePath: "/guide/pdf" },
  "pdf-merge": { interpretation: "선택한 PDF의 페이지를 브라우저에서 하나의 PDF로 결합합니다. 파일 순서와 페이지 수를 결과 파일에서 반드시 확인하세요.", reviewDate: "상시 기준", sourceLabel: "브라우저 내 처리 안내", nextAction: "병합 전 파일 순서를 정하고 병합 후 페이지를 열어 확인하세요.", guidePath: "/guide" },
  "pdf-excel": { interpretation: "텍스트 PDF에서 읽을 수 있는 내용을 CSV 형태로 추출하는 기능입니다. 표의 열·행과 서식은 원본과 달라질 수 있습니다.", reviewDate: "상시 기준", sourceLabel: "브라우저 내 처리 안내", nextAction: "CSV를 Excel에서 열어 열 구분과 숫자 형식을 확인하세요.", guidePath: "/guide" },
};

function ResultDecisionSupport({ tool }: { tool: CatalogTool }) {
  const meta = decisionMeta[tool.logicKey ?? ""];
  return <section className="decision-support" aria-label="결과 활용 안내">
    <div className="decision-support-head"><div><p className="eyebrow">DECISION SUPPORT</p><h2>결과를 다음 행동으로 연결하세요.</h2></div><div className="decision-support-actions"><button type="button" onClick={() => downloadResultSummary(tool)}><Download size={15} />결과 요약 저장</button><button type="button" onClick={() => { window.print(); recordToolEvent("print"); }}><Printer size={15} />인쇄</button></div></div>
    <div className="decision-support-grid"><article><strong>결과 해석</strong><p>{meta?.interpretation ?? "입력값에 따른 참고용 결과입니다. 결과의 의미는 각 도구의 계산 방법과 주의사항을 함께 확인하세요."}</p></article><article><strong>계산 근거·적용 가정</strong><p>{tool.formula ?? "입력한 값을 기준으로 도구에 등록된 산식을 적용합니다."} 입력값과 안내된 계산 방법을 기준으로 한 예상치이며 수수료·개별 계약조건은 별도 확인이 필요합니다.</p></article><article><strong>기준일·마지막 검토</strong><p>{meta?.reviewDate ?? "상시 기준"} 기준 안내입니다. 제도·세율·상품 조건은 변경될 수 있으므로 실제 이용 전 최신 공식 정보를 확인하세요.</p>{meta?.sourceUrl && <a className="official-source" href={meta.sourceUrl} target="_blank" rel="noreferrer">공식 확인: {meta.sourceLabel} ↗</a>}</article></div>
    <div className="next-actions"><strong>다음 행동</strong><p>{meta?.nextAction ?? "관련 조건과 결과를 다시 확인하세요."}</p><div><Link href="/guide">관련 계산 가이드 보기</Link><Link href="/search">관련 도구 다시 찾기</Link><Link href="/contact">결과 또는 기능 문의하기</Link><Link href="/disclaimer">계산 결과 이용 안내</Link></div></div>
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
    <DocumentTemplateActions tool={tool} />
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

export function GuideDiscovery() {
  return <section className="guide-discovery" aria-label="계산 가이드"><div><p className="eyebrow">GUIDE</p><h2>계산 결과를 이해하고 다음 결정을 준비하세요.</h2><p>계산기 결과의 기준과 주의사항을 확인하고 필요한 다음 도구로 이동할 수 있습니다.</p></div><Link href="/guide">가이드 둘러보기 <span>↗</span></Link></section>;
}

export function categoryToolGroups(categories: CatalogCategory[], tools: CatalogTool[], root: CatalogCategory) {
  const descendants = (id: number): number[] => {
    const children = categories.filter((item) => item.parentId === id);
    return [id, ...children.flatMap((child) => descendants(child.id))];
  };
  return categories.filter((item) => item.parentId === root.id).map((subcategory) => ({ subcategory, tools: tools.filter((tool) => descendants(subcategory.id).includes(tool.categoryId)) }));
}
