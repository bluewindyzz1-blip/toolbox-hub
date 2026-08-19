import { useEffect, useMemo, useState } from "react";
import { CalculatorActions, CatalogBreadcrumb, SeoHead, ToolKnowledge, ToolMetaResolver } from "@/components/CatalogSupport";
import { CommaNumberInput } from "@/components/CommaNumberInput";
import { ToolFrame } from "@/components/ToolLayout";
import {
  calculateCarMaintenance,
  calculateFamilyLoanInterest,
  calculateJeonseVsMonthly,
  calculateRetirementFund,
  calculateRoas,
  type ExpansionCalculatorKind,
  type FamilyLoanRepayment,
} from "@shared/toolbox";

type InputSpec = { label: string; unit: string; value: number; min?: number; max?: number };
type ToolSpec = { title: string; tag: string; index: string; desc: string; method: string; example: string; caution: string; inputs: InputSpec[] };
type ViewResult = { main: string; unit: string; rows: Array<[string, string]> };

const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
const percent = (value: number) => `${decimal.format(value)}%`;
const money = (value: number) => `${won.format(Math.round(value))}원`;

const specs: Record<ExpansionCalculatorKind, ToolSpec> = {
  "jeonse-vs-monthly": { title: "전세 vs 월세 비교 계산기", tag: "REAL ESTATE", index: "60", desc: "전세 보증금과 월세 조건을 같은 기준의 월간·연간 비용으로 비교합니다.", method: "전세는 자기자금 기회비용과 대출 이자를 더하고, 월세는 월세와 보증금 기회비용을 더해 동일한 기간으로 비교합니다.", example: "전세 보증금 2억원, 월세 보증금 5,000만원·월세 80만원과 가정 수익률을 입력하면 두 선택지의 월간·연간 비용 차이를 확인할 수 있습니다.", caution: "지역 시세, 관리비, 보증보험료, 세금과 실제 금융상품 조건은 반영하지 않은 비교용 계산입니다.", inputs: [{ label: "전세 보증금", unit: "원", value: 200000000 }, { label: "월세 보증금", unit: "원", value: 50000000 }, { label: "월세", unit: "원 / 월", value: 800000 }, { label: "전세 대출금", unit: "원", value: 100000000 }, { label: "전세 대출금리", unit: "% / 년", value: 4 }, { label: "예상 자금수익률", unit: "% / 년", value: 3 }] },
  "family-loan-interest": { title: "가족간 차용증 이자 계산기", tag: "FAMILY FINANCE", index: "61", desc: "가족간 차용금액·기간·약정이율과 상환방식으로 이자와 총 상환액을 계산합니다.", method: "약정이율을 월 이율로 바꾸고 상환방식에 따라 월 이자, 원금균등 또는 원리금균등 상환액을 계산합니다.", example: "5,000만원을 연 4%로 36개월 빌리는 경우 상환방식별 월 부담과 총 이자를 비교할 수 있습니다.", caution: "차용증 작성, 실제 자금 이동, 이자 지급 기록과 세법상 인정 여부는 별도로 확인하세요. 이 계산기는 법률·세무 판단을 대신하지 않습니다.", inputs: [{ label: "차용금액", unit: "원", value: 50000000 }, { label: "기간", unit: "개월", value: 36 }, { label: "약정이율", unit: "% / 년", value: 4 }] },
  roas: { title: "ROAS 계산기", tag: "BUSINESS", index: "62", desc: "광고비·광고매출·상품원가·플랫폼 수수료로 ROAS와 광고 후 이익을 계산합니다.", method: "ROAS는 광고매출을 광고비로 나눈 값이며, 광고 후 이익에서는 상품원가·플랫폼 수수료·기타 비용을 함께 차감합니다.", example: "광고비 100만원, 광고매출 400만원, 상품원가와 수수료를 입력하면 ROAS와 손익분기 ROAS를 함께 확인할 수 있습니다.", caution: "반품·부가세·인건비·간접비와 실제 정산 방식은 입력한 기타 비용에 직접 반영해야 합니다.", inputs: [{ label: "광고비", unit: "원", value: 1000000 }, { label: "광고 매출", unit: "원", value: 4000000 }, { label: "상품 원가", unit: "원", value: 1200000 }, { label: "플랫폼 수수료율", unit: "%", value: 10, max: 99.99 }, { label: "기타 비용", unit: "원", value: 200000 }] },
  "maintenance-cost": { title: "자동차 유지비 계산기", tag: "AUTOMOBILE", index: "63", desc: "주행거리·연비·유류비와 자동차세·보험료·정비비로 차량 유지비를 계산합니다.", method: "연간 주행거리를 연비로 나눠 연료비를 구한 뒤 세금·보험·정비·기타 비용을 합산합니다.", example: "연 15,000km 주행, 연비 12km/L, 유류비 1,700원과 연간 고정비를 입력하면 월·연간·km당 비용을 확인할 수 있습니다.", caution: "감가상각, 주차비, 통행료, 실제 보험료 변동과 수리비 편차는 기타 비용 또는 차량가격을 참고해 별도로 판단하세요.", inputs: [{ label: "차량가격", unit: "원", value: 30000000 }, { label: "연간 주행거리", unit: "km", value: 15000 }, { label: "연비", unit: "km / L", value: 12 }, { label: "유류비", unit: "원 / L", value: 1700 }, { label: "자동차세", unit: "원 / 년", value: 300000 }, { label: "보험료", unit: "원 / 년", value: 1000000 }, { label: "정비비", unit: "원 / 년", value: 800000 }, { label: "기타 비용", unit: "원 / 년", value: 500000 }] },
  "retirement-fund": { title: "은퇴자금 계산기", tag: "RETIREMENT", index: "64", desc: "은퇴 나이·예상 수명·생활비·연금과 수익률을 바탕으로 필요한 은퇴자금을 추정합니다.", method: "은퇴 시점까지 자산 성장과 물가를 반영하고, 은퇴 후 생활비에서 연금을 뺀 부족분의 현재가치를 계산합니다.", example: "현재 40세, 60세 은퇴, 90세 기대수명, 월 생활비 300만원과 연금 100만원을 입력해 필요한 자산과 추가 저축액을 추정할 수 있습니다.", caution: "투자수익률·물가·수명은 가정값이며 실제 시장수익, 세금, 의료비와 상속 계획은 반영하지 않은 참고용 계산입니다.", inputs: [{ label: "현재 나이", unit: "세", value: 40, min: 1, max: 100 }, { label: "은퇴 나이", unit: "세", value: 60, min: 2, max: 110 }, { label: "예상 수명", unit: "세", value: 90, min: 3, max: 120 }, { label: "현재 자산", unit: "원", value: 100000000 }, { label: "월 생활비", unit: "원 / 월", value: 3000000 }, { label: "예상 월 연금", unit: "원 / 월", value: 1000000 }, { label: "예상 투자수익률", unit: "% / 년", value: 4 }, { label: "물가상승률", unit: "% / 년", value: 2 }] },
};

function getResult(kind: ExpansionCalculatorKind, values: number[], repayment: FamilyLoanRepayment): ViewResult {
  if (kind === "jeonse-vs-monthly") {
    const result = calculateJeonseVsMonthly(...values as [number, number, number, number, number, number]);
    return { main: result.valid ? money(result.differenceAnnual) : "—", unit: result.valid ? "연간 비용 차이" : "", rows: [["전세 월간 비용", result.valid ? money(result.jeonseMonthly) : result.recommendation], ["월세 월간 비용", result.valid ? money(result.monthlyMonthly) : "—"], ["판단", result.valid ? result.recommendation : "입력값을 확인하세요."]] };
  }
  if (kind === "family-loan-interest") {
    const result = calculateFamilyLoanInterest(values[0], values[1], values[2], repayment);
    return { main: result.valid ? money(result.monthlyPayment) : "—", unit: result.valid ? "월 상환액" : "", rows: [["연간 이자", result.valid ? money(result.annualInterest) : "입력값을 확인하세요."], ["총 이자", result.valid ? money(result.totalInterest) : "—"], ["원금 포함 총 상환액", result.valid ? money(result.totalRepayment) : "—"]] };
  }
  if (kind === "roas") {
    const result = calculateRoas(...values as [number, number, number, number, number]);
    return { main: result.valid ? percent(result.roas) : "—", unit: result.valid ? "ROAS" : "", rows: [["광고비 비율", result.valid ? percent(result.advertisingRatio) : "입력값을 확인하세요."], ["광고 후 이익", result.valid ? money(result.profitAfterAds) : "—"], ["손익분기 ROAS", result.valid ? percent(result.breakEvenRoas) : "—"]] };
  }
  if (kind === "maintenance-cost") {
    const result = calculateCarMaintenance(...values as [number, number, number, number, number, number, number, number]);
    return { main: result.valid ? money(result.monthlyTotal) : "—", unit: result.valid ? "월 유지비" : "", rows: [["연간 유지비", result.valid ? money(result.annualTotal) : "입력값을 확인하세요."], ["5년 예상 비용", result.valid ? money(result.fiveYearTotal) : "—"], ["km당 비용", result.valid ? `${decimal.format(result.perKm)}원` : "—"]] };
  }
  const result = calculateRetirementFund(...values as [number, number, number, number, number, number, number, number]);
  return { main: result.valid ? money(result.requiredAssets) : "—", unit: result.valid ? "은퇴 필요자금" : "", rows: [["은퇴까지", result.valid ? `${result.yearsToRetirement}년` : "입력값을 확인하세요."], ["예상 부족자금", result.valid ? money(result.shortage) : "—"], ["추가 월 저축액", result.valid ? money(result.additionalMonthlySaving) : "—"], ["자금 소진 예상", result.valid && result.depletionYears ? `${result.depletionYears}년 후` : result.valid ? "계산 기간 내 소진 없음" : "—"]] };
}

export default function ExpansionCalculators({ kind }: { kind: ExpansionCalculatorKind }) {
  const spec = specs[kind];
  const defaults = useMemo(() => spec.inputs.map((input) => input.value), [spec]);
  const [values, setValues] = useState<number[]>(defaults);
  const [applied, setApplied] = useState<number[]>(defaults);
  const [repayment, setRepayment] = useState<FamilyLoanRepayment>("equal-payment");
  useEffect(() => { setValues(defaults); setApplied(defaults); }, [defaults, kind]);
  const result = getResult(kind, applied, repayment);
  const updateValue = (index: number, value: number) => setValues((current) => current.map((item, currentIndex) => currentIndex === index ? value : item));
  const reset = () => { setValues(defaults); setApplied(defaults); setRepayment("equal-payment"); };
  return <ToolMetaResolver slug={kind}>{tool => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.desc}>
    <SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} />
    <CatalogBreadcrumb toolSlug={tool.slug} />
    <section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">INPUT</p>
      {kind === "family-loan-interest" && <label>상환방식<select value={repayment} onChange={(event) => setRepayment(event.target.value as FamilyLoanRepayment)}><option value="interest-only">만기일시상환</option><option value="equal-payment">원리금균등상환</option><option value="equal-principal">원금균등상환</option></select></label>}
      {spec.inputs.map((input, index) => <label key={input.label}>{input.label}<div className="input-suffix"><CommaNumberInput ariaLabel={input.label} value={values[index] ?? 0} onValueChange={(value) => setValues((current) => current.map((item, currentIndex) => currentIndex === index ? Math.max(input.min ?? 0, input.max !== undefined ? Math.min(input.max, value) : value) : item))} /><span>{input.unit}</span></div></label>)}
      <CalculatorActions onCalculate={() => setApplied([...values])} onReset={reset} />
    </div><div className="calculator-output black-output"><p className="eyebrow">RESULT</p><h2>예상 결과</h2><strong>{result.main}<small>{result.unit}</small></strong><div className="result-rows">{result.rows.map(([label, value]) => <p key={label}><span>{label}</span><b>{value}</b></p>)}</div></div></section>
    <ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution} />
  </ToolFrame>}</ToolMetaResolver>;
}
