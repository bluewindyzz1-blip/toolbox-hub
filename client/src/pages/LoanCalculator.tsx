import { useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { ToolFrame } from "@/components/ToolLayout";
import { CatalogBreadcrumb, CalculatorActions, SeoHead, ToolKnowledge, ToolMetaResolver } from "@/components/CatalogSupport";
import { CommaNumberInput } from "@/components/CommaNumberInput";
import { calculateLoan, LoanMethod } from "@shared/toolbox";

const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

export default function LoanCalculator() {
  const [amount, setAmount] = useState(30000);
  const [rate, setRate] = useState(4.2);
  const [years, setYears] = useState(3);
  const [method, setMethod] = useState<LoanMethod>("annuity");
  const [applied, setApplied] = useState({ amount: 30000, rate: 4.2, years: 3, method: "annuity" as LoanMethod });
  const [showSchedule, setShowSchedule] = useState(false);
  const calculation = calculateLoan(applied.amount * 10000, applied.rate, applied.years * 12, applied.method);
  const reset = () => { setAmount(30000); setRate(4.2); setYears(3); setMethod("annuity"); setApplied({ amount: 30000, rate: 4.2, years: 3, method: "annuity" }); };
  return (
    <ToolMetaResolver slug="loan-interest">{(tool) => <ToolFrame index="04" tag="LOAN CALCULATOR" title="대출 이자 계산기" description="원리금균등·원금균등 상환 방식을 비교하고 월별 원금과 이자를 확인하세요.">
      <SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} />
      <section className="calculator-layout loan-layout">
        <div className="calculator-form">
          <p className="eyebrow">LOAN SETTINGS</p>
          <label>대출 금액 <div className="input-suffix"><CommaNumberInput ariaLabel="대출 금액" value={amount} onValueChange={setAmount} /><span>만원</span></div></label>
          <label>연 이자율 <div className="input-suffix"><CommaNumberInput ariaLabel="연 이자율" value={rate} onValueChange={setRate} /><span>%</span></div></label>
          <label>상환 기간 <div className="input-suffix"><CommaNumberInput ariaLabel="상환 기간" value={years} onValueChange={setYears} min={1} /><span>년</span></div></label>
          <div className="method-picker"><button className={method === "annuity" ? "selected" : ""} onClick={() => setMethod("annuity")}>원리금균등</button><button className={method === "principal" ? "selected" : ""} onClick={() => setMethod("principal")}>원금균등</button></div>
          <CalculatorActions onCalculate={() => setApplied({ amount, rate, years, method })} onReset={reset} />
        </div>
        <div className="calculator-output black-output"><p className="eyebrow">TOTAL INTEREST</p><h2>전체 이자</h2><strong>{won.format(calculation.totalInterest)}<small>원</small></strong><div className="result-rows"><p><span>총 상환액</span><b>{won.format(calculation.totalPayment)}원</b></p><p><span>첫 달 상환액</span><b>{won.format(calculation.firstPayment)}원</b></p></div></div>
      </section>
      <section className="schedule-section"><button className="schedule-toggle" onClick={() => setShowSchedule((visible) => !visible)}><span><Calculator size={18} />월별 상환 스케줄 ({applied.years * 12}개월)</span><ChevronDown className={showSchedule ? "rotated" : ""} size={20} /></button>{showSchedule && <div className="table-wrap"><table><thead><tr><th>회차</th><th>상환액</th><th>원금</th><th>이자</th><th>잔액</th></tr></thead><tbody>{calculation.schedule.map((item) => <tr key={item.month}><td>{item.month}</td><td>{won.format(item.payment)}</td><td>{won.format(item.principal)}</td><td>{won.format(item.interest)}</td><td>{won.format(item.balance)}</td></tr>)}</tbody></table></div>}</section>
      <ToolKnowledge tool={tool} method="입력한 원금, 연 이자율, 기간을 월 단위로 환산한 뒤 선택한 상환 방식에 따라 월별 원금과 이자를 계산합니다." example="3억원을 연 4.2%, 3년 원리금균등으로 입력하면 월별 납입 예상액과 총 이자를 확인할 수 있습니다." caution="실제 대출의 금리, 중도상환수수료, 거치기간, 일할 계산과 우대 조건은 금융기관의 계약 내용을 확인하세요." />
    </ToolFrame>}</ToolMetaResolver>
  );
}
