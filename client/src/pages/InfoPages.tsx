import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Calculator, FileText, Landmark, Mail, Search, Send, WalletCards } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/ToolLayout";
import { SeoHead } from "@/components/CatalogSupport";
import { useCatalog } from "@/hooks/useCatalog";
import { getToolPath } from "@shared/catalog";

const pages = {
  about: { title: "도구상자 소개", body: "도구상자는 생활에 필요한 계산기와 파일 변환 도구를 한곳에서 이용할 수 있도록 만든 온라인 유틸리티 모음입니다. 각 도구는 목적에 맞는 입력, 계산 결과, 참고 정보와 함께 제공됩니다." },
  faq: { title: "자주 묻는 질문", body: "계산 결과는 입력값을 바탕으로 한 참고용 결과입니다. 파일 변환은 현재 브라우저에서 처리되며, 탭을 닫으면 결과 파일도 유지되지 않습니다." },
  privacy: { title: "개인정보처리방침", body: "도구상자는 현재 회원가입이나 사용자 프로필 정보를 운영 목적으로 수집하지 않습니다. 계산 입력값과 파일 변환 대상은 브라우저 안에서 처리하며 서버에 저장하지 않습니다. 문의하기 화면은 현재 전송 기능을 제공하지 않으며, 이메일과 문의 내용이 서버에 저장되지 않습니다. 향후 문의 접수 또는 분석 기능이 추가되면 실제 처리 방식에 맞춰 이 안내를 갱신합니다." },
  terms: { title: "이용약관", body: "도구상자는 온라인 계산 및 파일 변환 기능을 제공합니다. 이용자는 관련 법령과 타인의 권리를 침해하지 않는 범위에서 서비스를 이용해야 합니다. 기능 변경, 점검 또는 개선에 따라 서비스의 일부가 변경되거나 중단될 수 있습니다." },
  disclaimer: { title: "면책조항", body: "계산 결과는 참고용 정보이며 개인의 실제 금융, 세무, 법률, 급여, 부동산 계약 또는 제도 적용 결과와 다를 수 있습니다. 대출, 전월세, 세금, 연봉, 퇴직금 등 중요한 의사결정 전에는 금융기관, 정부기관, 세무 전문가 또는 관련 기관의 최신 기준을 확인하세요. 도구상자는 공식적인 법률·세무·금융 자문을 제공하지 않습니다." },
  cookie: { title: "쿠키 및 광고 안내", body: "현재 도구상자는 서비스 품질과 방문 통계를 위해 브라우저 기반 분석 도구를 사용할 수 있습니다. 광고 영역은 향후 광고 서비스를 연결할 수 있도록 마련되어 있으나 현재 광고 코드는 삽입하지 않았습니다. 광고 또는 쿠키 처리 방식이 변경되면 이 페이지에 반영합니다." },
};

const guideTopics = [
  { id: "guide-finance", icon: Landmark, eyebrow: "LOAN · FINANCE", title: "대출과 이자, 무엇을 비교해야 할까요?", description: "월 납입금만 보지 말고 상환 방식, 총이자, 중도상환수수료와 우대 조건까지 같은 기준으로 확인하세요.", slugs: ["loan-interest", "loan-amortization", "equal-principal", "early-repayment-fee"] },
  { id: "guide-real-estate", icon: Calculator, eyebrow: "REAL ESTATE", title: "집 계약 전 실제 현금흐름을 확인하세요.", description: "전월세 비용, 전세대출 이자, 취득세와 중개보수까지 함께 계산해야 계약 후 부담을 줄일 수 있습니다.", slugs: ["monthly-rent", "jeonse-loan-interest", "mortgage", "acquisition-tax", "brokerage-fee"] },
  { id: "guide-salary", icon: WalletCards, eyebrow: "SALARY · EMPLOYMENT", title: "급여와 퇴직, 내 숫자를 확인하세요.", description: "연봉·월급 실수령액은 급여명세서와 대조하고, 퇴직금과 실업급여는 근속·가입 조건을 함께 확인하세요.", slugs: ["annual-take-home", "monthly-take-home", "retirement-pay", "unemployment-benefit"] },
  { id: "guide-tax", icon: FileText, eyebrow: "TAX · BUSINESS", title: "세금과 사업 비용은 증빙부터 준비하세요.", description: "부가세와 취득세 결과는 참고값입니다. 신고·납부 전에는 과세 유형, 감면과 증빙을 공식 기준으로 확인하세요.", slugs: ["vat-calculator", "acquisition-tax", "property-tax"] },
  { id: "guide-pdf", icon: FileText, eyebrow: "PDF · FILE", title: "파일 변환 후에는 결과 파일을 검수하세요.", description: "PDF 변환과 병합은 브라우저에서 처리됩니다. 변환 후 페이지 순서, 글자, 표와 서식을 반드시 열어 확인하세요.", slugs: ["pdf-convert", "pdf-to-excel", "pdf-to-hwp", "pdf-merge"] },
] as const;

function GuideHub() {
  const { data } = useCatalog();
  const tools = data?.tools ?? [];
  const categories = data?.categories ?? [];
  return <div className="site-page"><SeoHead title="계산 결과 활용 가이드 | 도구상자" description="대출, 부동산, 급여, 세금과 PDF 도구의 계산 결과를 확인하고 다음 행동으로 연결하는 실용 가이드입니다." path="/guide" kind="CollectionPage" /><SiteHeader /><main className="container guide-hub">
    <section className="guide-hub-intro"><p className="eyebrow">PRACTICAL GUIDES / 2026</p><h1>계산 후, 무엇을<br />확인해야 할까요?</h1><p>도구의 결과를 저장하는 데서 끝내지 않고, 비교할 조건과 공식 확인 항목, 다음에 사용할 도구까지 한 번에 정리했습니다.</p><div className="guide-flow"><span>01 결과 확인</span><span>02 조건 비교</span><span>03 공식 기준 확인</span><span>04 다음 문서 준비</span></div></section>
    <section className="guide-topic-grid" aria-label="주제별 계산 결과 활용 가이드">{guideTopics.map((topic) => { const Icon = topic.icon; const linked = topic.slugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter(Boolean); return <article key={topic.id} id={topic.id}><div className="guide-topic-head"><Icon size={24} /><p className="eyebrow">{topic.eyebrow}</p></div><h2>{topic.title}</h2><p>{topic.description}</p><div>{linked.map((tool) => tool ? <Link key={tool.id} href={getToolPath(tool, categories)}>{tool.title}<ArrowUpRight size={16} /></Link> : null)}</div></article>; })}</section>
    <section className="guide-checklist"><p className="eyebrow">BEFORE YOU DECIDE</p><h2>중요한 숫자는 이렇게 확인하세요.</h2><div><article><strong>계산기 결과</strong><p>입력값과 결과 요약을 저장하거나 인쇄해 비교 기준으로 남기세요.</p></article><article><strong>공식 기준</strong><p>세율, 수수료, 대출 조건과 자격 요건은 결과 화면의 공식 확인 링크를 우선 확인하세요.</p></article><article><strong>실제 계약·신고</strong><p>계약서, 급여명세서, 고지서와 증빙은 계산 결과보다 우선합니다.</p></article></div></section>
  </main><SiteFooter /></div>;
}

export function InfoPage({ type }: { type: keyof typeof pages | "guide" }) {
  if (type === "guide") return <GuideHub />;
  const page = pages[type];
  return <div className="site-page"><SeoHead title={`${page.title} | 도구상자`} description={page.body} path={`/${type === "about" ? "about" : type === "faq" ? "faq" : type === "cookie" ? "cookie-policy" : type}`} kind="CollectionPage" /><SiteHeader /><main className="container info-page"><p className="eyebrow">INFORMATION / 2026</p><h1>{page.title}</h1><p>{page.body}</p><Link href="/">도구상자 홈으로 돌아가기</Link></main><SiteFooter /></div>;
}

export function SearchPage() { const { data } = useCatalog(); const [query, setQuery] = useState(""); const results = useMemo(() => { const key=query.trim().toLowerCase(); if(!key || !data) return []; return data.tools.filter(tool => { const category = data.categories.find((item) => item.id === tool.categoryId); const parent = category?.parentId ? data.categories.find((item) => item.id === category.parentId) : undefined; const haystack = [tool.title, tool.description, ...(tool.searchKeywords ?? []), category?.name ?? "", category?.description ?? "", parent?.name ?? "", parent?.description ?? ""].join(" ").toLowerCase(); return haystack.includes(key); }).slice(0,30); },[data,query]); return <div className="site-page"><SeoHead title="도구 검색 | 도구상자" description="계산기와 파일 변환 도구를 검색합니다."/><SiteHeader/><main className="container search-page"><p className="eyebrow">TOOL FINDER</p><h1>도구 검색</h1><label className="search-input"><Search size={22}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="전세대출, 주담대, 취득세, 복리, PDF"/></label>{query && <div className="search-results">{results.length?results.map(tool=>{const cat=data.categories.find(c=>c.id===tool.categoryId);const parent=cat?.parentId?data.categories.find(c=>c.id===cat.parentId):undefined;return <Link key={tool.id} href={getToolPath(tool,data.categories)}><span>{parent ? `${parent.name} · ${cat?.name}` : cat?.name}</span><strong>{tool.title}</strong><p>{tool.description}</p><small>바로가기 →</small></Link>}):<p>일치하는 도구가 없습니다.</p>}</div>}</main><SiteFooter/></div>; }
export function ContactPage() { const [sent,setSent]=useState(false); const submit=(e:FormEvent)=>{e.preventDefault();setSent(true);}; return <div className="site-page"><SeoHead title="문의하기 | 도구상자" description="도구상자 오류와 개선 의견을 확인합니다."/><SiteHeader/><main className="container info-page contact-page"><p className="eyebrow">CONTACT / LOCAL FORM</p><h1>문의하기</h1><p>계산 오류, 기능 오류, 파일 변환 오류, 개인정보 문의, 기타 의견을 정리할 수 있습니다. 현재 이 양식은 서버에 저장하거나 이메일을 전송하지 않습니다.</p><form onSubmit={submit}><label>문의 유형<select required><option>계산 오류</option><option>기능 오류</option><option>파일 변환 오류</option><option>개인정보 문의</option><option>기타 문의</option></select></label><label>이메일<input type="email" required placeholder="답변 받을 이메일"/></label><label>문의 내용<textarea required minLength={10} placeholder="재현 방법과 사용한 입력값을 함께 적어주세요."/></label><button className="primary-action"><Send size={17}/>문의 내용 확인</button></form>{sent&&<p className="form-notice"><Mail size={17}/>현재 전송은 설정되지 않았습니다. 관리자 이메일 연결 후 실제 전송 기능을 활성화할 수 있습니다.</p>}</main><SiteFooter/></div>; }
