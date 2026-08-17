import { useState } from "react";
import { CatalogBreadcrumb, CalculatorActions, SeoHead, ToolKnowledge, ToolMetaResolver } from "@/components/CatalogSupport";
import { CommaNumberInput } from "@/components/CommaNumberInput";
import { ToolFrame } from "@/components/ToolLayout";
import { calculateAnnualNet } from "@shared/toolbox";

const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
export default function AnnualNetCalculator() {
  const [annualSalary, setAnnualSalary] = useState(50_000_000); const [dependents, setDependents] = useState(1); const [applied, setApplied] = useState({ annualSalary: 50_000_000, dependents: 1 });
  const result = calculateAnnualNet(applied.annualSalary, applied.dependents);
  const reset = () => { setAnnualSalary(50_000_000); setDependents(1); setApplied({ annualSalary: 50_000_000, dependents: 1 }); };
  return <ToolMetaResolver slug="annual-net">{(tool) => <ToolFrame index="10" tag="SALARY CALCULATOR" title="연봉 실수령액 계산기" description="연봉과 부양가족 수를 기준으로 월 예상 실수령액을 추정합니다."><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">INPUT / SALARY</p><label>연봉<div className="input-suffix"><CommaNumberInput ariaLabel="연봉" value={annualSalary} onValueChange={setAnnualSalary} /><span>원</span></div></label><label>부양가족 수<div className="input-suffix"><CommaNumberInput ariaLabel="부양가족 수" value={dependents} onValueChange={setDependents} /><span>명</span></div></label><CalculatorActions onCalculate={() => setApplied({ annualSalary, dependents })} onReset={reset} /></div><div className="calculator-output black-output"><p className="eyebrow">ESTIMATED MONTHLY NET</p><h2>월 예상 실수령액</h2><strong>{won.format(result.monthlyNet)}<small>원</small></strong><div className="result-rows"><p><span>월 급여</span><b>{won.format(result.monthlyGross)}원</b></p><p><span>월 공제 추정액</span><b>{won.format(result.totalMonthlyDeductions)}원</b></p><p><span>연 실수령 추정액</span><b>{won.format(result.annualNet)}원</b></p></div></div></section><ToolKnowledge tool={tool} method="연봉을 12개월로 나누고 국민연금·건강보험·장기요양·고용보험과 간이 추정 소득세를 계산합니다." example="연봉 5,000만원, 부양가족 1명을 입력하면 월 예상 실수령액을 확인할 수 있습니다." caution="실제 원천징수액은 비과세 항목, 부양가족, 회사 정책과 세법에 따라 달라질 수 있습니다." /></ToolFrame>}</ToolMetaResolver>;
}
