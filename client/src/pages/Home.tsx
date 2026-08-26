import { ArrowUpRight, Calculator, FileText, Ruler, ShieldCheck, Zap, Wrench } from "lucide-react";
import { Link } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/ToolLayout";

const kindIcons = { calculator: Calculator, converter: FileText, unit: Ruler };

export default function Home() {
  const featuredTools = [
    ["연봉 5천 실수령액 계산", "/calculator/salary/annual-net", "calculator"], ["월급 실수령액 계산", "/calculator/salary/monthly-take-home", "calculator"], ["퇴직금 계산", "/calculator/salary/retirement-pay", "calculator"], ["실업급여 계산", "/calculator/salary/unemployment-benefit", "calculator"],
    ["대출 1억 이자 계산", "/calculator/finance/loan-interest", "calculator"], ["원리금균등상환 계산", "/calculator/finance/loan-amortization", "calculator"], ["예금 세후 이자 계산", "/calculator/finance/deposit-interest", "calculator"], ["적금 만기수령액 계산", "/calculator/finance/savings", "calculator"], ["복리 이자 계산", "/calculator/finance/compound-interest", "calculator"], ["중도상환수수료 계산", "/calculator/finance/early-repayment-fee", "calculator"],
    ["전세대출 이자 계산", "/calculator/real-estate/jeonse-loan-interest", "calculator"], ["주택담보대출 계산", "/calculator/real-estate/mortgage", "calculator"], ["전월세 비용 비교", "/calculator/real-estate/monthly-rent", "calculator"], ["주택 취득세 계산", "/calculator/real-estate/acquisition-tax", "calculator"], ["부동산 중개보수 계산", "/calculator/real-estate/brokerage-fee", "calculator"],
    ["부가세 계산", "/calculator/tax/vat-calculator", "calculator"], ["재산세 계산", "/calculator/real-estate/property-tax", "calculator"], ["평수·제곱미터 변환", "/calculator/real-estate/pyeong", "calculator"], ["퍼센트 증감 계산", "/calculator/finance/percentage", "calculator"], ["PDF 합치기", "/convert/pdf-edit/pdf-merge", "converter"],
  ];
  return (
    <div className="site-page">
      <SiteHeader />
      <main>
        <section className="hero container"><div className="hero-info"><p className="eyebrow">UTILITY SYSTEM / 2026</p><h1>일을 더<br /><em>간단하게.</em></h1><p className="hero-copy">파일 변환부터 생활 계산까지. 자주 필요한 도구를 빠르고 정확하게, 한 곳에 모았습니다.</p><Link href="/pdf" className="hero-cta">도구 시작하기 <ArrowUpRight size={21} /></Link></div><div className="hero-art" aria-hidden="true"><span className="art-number">06</span><div className="red-block" /><div className="art-label">ONE PLACE<br />SIX TOOLS</div></div></section>
        <section className="tool-directory container"><div className="directory-head"><div><p className="eyebrow">DECISION TOOLS</p><h2>결정을 끝내는 도구.</h2></div><p>검색자가 자주 찾는 질문을 바로 계산하고,<br />결과 해석과 다음 행동까지 이어갑니다.</p></div><div className="tool-grid featured-tool-grid">{featuredTools.map(([title, href, kind], index) => { const Icon = kindIcons[kind as keyof typeof kindIcons] ?? Wrench; return <Link key={href} href={href} className="tool-card"><div className="card-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{kind.toUpperCase()}</span></div><Icon className="card-icon" strokeWidth={1.5} size={36} /><div className="card-bottom"><h3>{title}</h3><p>입력 → 계산 → 결과 해석 → 다음 행동</p></div><ArrowUpRight className="card-arrow" size={20} /></Link>; })}</div><div className="directory-more"><Link href="/calculator">전체 계산기 보기 <ArrowUpRight size={16} /></Link><Link href="/convert">전체 파일 도구 보기 <ArrowUpRight size={16} /></Link></div></section>
        <section className="principles container"><div className="principles-title"><p className="eyebrow">PRINCIPLES</p><h2>필요한 순간,<br />명확한 결과.</h2></div><div className="principle-list"><article><span>01</span><Zap size={22} /><h3>즉시 사용</h3><p>가입 없이 필요한 도구를 바로 열고 계산할 수 있습니다.</p></article><article><span>02</span><ShieldCheck size={22} /><h3>내 기기에서 처리</h3><p>변환 대상 파일은 서버가 아닌 브라우저에서 처리합니다.</p></article><article><span>03</span><Calculator size={22} /><h3>계산 근거 제시</h3><p>결과만 보여주지 않고 입력 값과 산식 기준을 함께 정리합니다.</p></article></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
