import { useState } from "react";
import { ArrowRightLeft, Landmark, WalletCards } from "lucide-react";
import { ToolFrame } from "@/components/ToolLayout";
import { CatalogBreadcrumb, CalculatorActions, SeoHead, ToolKnowledge, ToolMetaResolver } from "@/components/CatalogSupport";
import { CommaNumberInput } from "@/components/CommaNumberInput";
import { calculateRent } from "@shared/toolbox";

const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

export default function RentCalculator() {
  const [deposit, setDeposit] = useState(10000);
  const [monthlyRent, setMonthlyRent] = useState(70);
  const [rate, setRate] = useState(5.5);
  const [applied, setApplied] = useState({ deposit: 10000, monthlyRent: 70, rate: 5.5 });
  const result = calculateRent(applied.deposit * 10000, applied.monthlyRent * 10000, applied.rate);
  const reset = () => { setDeposit(10000); setMonthlyRent(70); setRate(5.5); setApplied({ deposit: 10000, monthlyRent: 70, rate: 5.5 }); };
  return (
    <ToolMetaResolver slug="monthly-rent">{(tool) => <ToolFrame index="03" tag="HOUSING CALCULATOR" title="월세 계산기" description="보증금의 월 환산 비용과 월세를 함께 계산해 현재 계약의 실질 월 지출을 확인하세요.">
      <SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} />
      <section className="calculator-layout">
        <div className="calculator-form">
          <p className="eyebrow">INPUT / KRW</p>
          <label>보증금 <div className="input-suffix"><CommaNumberInput ariaLabel="보증금" value={deposit} onValueChange={setDeposit} /><span>만원</span></div></label>
          <label>월세 <div className="input-suffix"><CommaNumberInput ariaLabel="월세" value={monthlyRent} onValueChange={setMonthlyRent} /><span>만원</span></div></label>
          <label>전월세 전환율 <div className="input-suffix"><CommaNumberInput ariaLabel="전월세 전환율" value={rate} onValueChange={setRate} /><span>%</span></div></label>
          <p className="form-footnote">전환율은 계약 조건 또는 지역별 법정 상한을 확인해 입력하세요.</p>
          <CalculatorActions onCalculate={() => setApplied({ deposit, monthlyRent, rate })} onReset={reset} />
        </div>
        <div className="calculator-output red-output">
          <p className="eyebrow">EQUIVALENT MONTHLY COST</p><h2>실질 월 지출</h2>
          <strong>{won.format(result.monthlyEquivalent)}<small>원 / 월</small></strong>
          <div className="result-rows"><p><span>월세</span><b>{won.format(applied.monthlyRent * 10000)}원</b></p><p><span>보증금 월 환산액</span><b>{won.format(result.monthlyDepositCost)}원</b></p></div>
        </div>
      </section>
      <section className="insight-grid"><article><Landmark size={22} /><p>연간 현금 월세</p><strong>{won.format(result.yearlyCashOutflow)}원</strong></article><article><ArrowRightLeft size={22} /><p>환산 전세 보증금</p><strong>{won.format(result.equivalentDeposit)}원</strong><small>동일 전환율 기준</small></article><article><WalletCards size={22} /><p>계산 기준</p><strong>{applied.rate}%</strong><small>연 전환율</small></article></section>
      <ToolKnowledge tool={tool} method="보증금에 입력한 전환율을 적용해 월 환산액을 구한 다음 월세와 더합니다." example="보증금 1억원, 월세 70만원, 전환율 5.5%를 입력하면 실질 월 지출을 확인할 수 있습니다." caution="전환율과 계약 조건은 지역, 계약 시점, 법정 상한에 따라 다를 수 있습니다." />
    </ToolFrame>}</ToolMetaResolver>
  );
}
