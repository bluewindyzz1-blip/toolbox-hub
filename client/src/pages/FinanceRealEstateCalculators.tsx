import { ChevronDown, Calculator } from "lucide-react";
import { useState } from "react";
import { CatalogBreadcrumb, CalculatorActions, SeoHead, ToolKnowledge, ToolMetaResolver } from "@/components/CatalogSupport";
import { CommaNumberInput } from "@/components/CommaNumberInput";
import { ToolFrame } from "@/components/ToolLayout";
import {
  AcquisitionHomeCount,
  BrokerageTransaction,
  PercentageMode,
  calculateAcquisitionTax,
  calculateBrokerageFee,
  calculateCompoundInterest,
  calculateEarlyRepaymentFee,
  calculateJeonseLoanInterest,
  calculateLoan,
  calculatePercentage,
  calculatePropertyTax,
} from "@shared/toolbox";

const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

type CalculatorKind = "jeonse-loan-interest" | "mortgage" | "early-repayment-fee" | "brokerage-fee" | "acquisition-tax" | "property-tax" | "compound-interest" | "equal-principal" | "bullet-loan" | "percentage";

type ToolSpec = {
  index: string;
  tag: string;
  title: string;
  description: string;
  method: string;
  example: string;
  caution: string;
  useCase: string;
  interpretation: string;
};

const specs: Record<CalculatorKind, ToolSpec> = {
  "jeonse-loan-interest": {
    index: "19", tag: "REAL ESTATE / LOAN", title: "전세대출 이자 계산기", description: "전세대출 금액과 금리, 대출 기간을 입력해 매월 이자와 전체 예상 이자를 확인하세요.",
    method: "대출 원금에 연 이자율을 적용한 뒤 12개월로 나누어 월 이자를 구하고, 이를 대출 기간만큼 합산합니다.", example: "전세대출 1억 5천만원, 연 3.5%, 24개월이면 월 이자는 437,500원이고 총 이자는 1,050만원입니다.", caution: "이자만 납부하는 단순 기준입니다. 원금 상환, 거치기간, 우대금리와 일할 계산은 약정서를 확인하세요.", useCase: "전세 계약 전에 월 현금흐름과 대출 기간 전체의 이자 부담을 가늠할 때 사용합니다.", interpretation: "총 이자는 금리와 기간에 비례합니다. 실제 실행 전에는 금융기관의 적용금리와 상환조건을 다시 확인하세요.",
  },
  mortgage: {
    index: "20", tag: "REAL ESTATE / LOAN", title: "주택담보대출 계산기", description: "주택담보대출의 원리금균등 월 납입액, 총 상환액, 이자와 월별 상환 구조를 계산합니다.",
    method: "입력한 연 이자율을 월 이자율로 바꾸고, 원리금균등 상환 공식으로 매월 동일한 납입액을 계산합니다.", example: "3억원을 연 4.0%, 30년으로 상환하면 첫 달 납입액과 전체 상환표를 함께 확인할 수 있습니다.", caution: "고정금리·원리금균등 가정입니다. 변동금리, 거치, 대출 실행일, 보증료 및 인지세는 포함하지 않습니다.", useCase: "주택 매수 또는 대환 전에 예상 월 상환액과 장기 이자 부담을 비교할 때 사용합니다.", interpretation: "초기에는 이자 비중이 높고 시간이 갈수록 원금 상환 비중이 커집니다.",
  },
  "early-repayment-fee": {
    index: "21", tag: "REAL ESTATE / COST", title: "중도상환수수료 계산기", description: "중도상환 원금, 약정 수수료율과 남은 기간을 기준으로 예상 수수료를 계산합니다.",
    method: "중도상환 원금에 약정 수수료율을 곱한 뒤, 수수료 적용일수 비율을 365일 기준으로 반영합니다.", example: "중도상환 원금 1억원, 수수료율 1.2%, 잔여 180일이면 예상 수수료는 약 591,781원입니다.", caution: "은행마다 면제기간, 산식, 일수 기준이 다릅니다. 반드시 대출 약정서와 금융기관의 안내를 우선 확인하세요.", useCase: "대환, 매도, 여유자금 상환 전에 발생 가능한 비용을 미리 비교할 때 사용합니다.", interpretation: "잔여일수가 짧거나 면제기간이 길수록 적용일수와 예상 수수료가 줄어듭니다.",
  },
  "brokerage-fee": {
    index: "22", tag: "REAL ESTATE / COST", title: "부동산 중개수수료 계산기", description: "주택 매매·전월세 거래금액을 기준으로 부동산 중개보수(복비) 상한액을 계산합니다.",
    method: "거래 유형과 금액 구간에 따른 상한요율을 적용하고, 해당 구간에 한도액이 있으면 한도액을 넘지 않도록 계산합니다.", example: "6억원 주택 매매는 0.4% 상한요율을 적용해 중개보수 상한액 240만원이 계산됩니다.", caution: "서울시 주택 기준의 상한요율이며, 실제 보수는 지역 조례, 개업공인중개사와의 협의, 부가가치세 여부에 따라 달라질 수 있습니다.", useCase: "주택 매매나 전·월세 계약의 초기 부대비용과 복비 상한을 추정할 때 사용합니다.", interpretation: "표시 금액은 복비의 상한액이며 실제 지급액과 부가가치세는 계약 전에 확인해야 합니다.",
  },
  "acquisition-tax": {
    index: "23", tag: "REAL ESTATE / TAX", title: "취득세 계산기", description: "주택 취득가액, 보유 주택 수와 조정대상지역 여부를 기준으로 취득세 본세를 계산합니다.",
    method: "일반 개인 주택 유상취득의 기본 세율을 적용해 취득가액에 곱합니다. 6억~9억원 구간의 1주택 기본세율은 가격 연동식으로 계산합니다.", example: "취득가액 5억원의 1주택 유상취득은 기본 취득세율 1.0%를 적용해 500만원으로 계산됩니다.", caution: "취득세 본세 기준입니다. 지방교육세·농어촌특별세, 감면, 일시적 2주택과 다주택 중과는 요건이 복잡하므로 위택스에서 최종 확인하세요.", useCase: "주택 매수 전 취득 단계의 기본 세금 규모를 가늠할 때 사용합니다.", interpretation: "주택 수와 조정대상지역 여부에 따라 세율 차이가 커질 수 있으므로 보유 주택 판정이 중요합니다.",
  },
  "property-tax": {
    index: "24", tag: "REAL ESTATE / TAX", title: "재산세 계산기", description: "주택 공시가격을 입력해 과세표준과 주택 재산세 본세를 간이 계산합니다.",
    method: "주택 공시가격에 공정시장가액비율 60%를 곱해 과세표준을 구하고, 구간별 누진세율을 적용합니다.", example: "공시가격 5억원이면 과세표준은 3억원이며, 본세는 누진 계산 기준 57만원입니다.", caution: "세부담상한, 도시지역분, 지역자원시설세, 1세대 1주택 특례 등은 반영하지 않은 본세 기준입니다.", useCase: "보유 중인 주택의 기본 재산세 부담을 간단히 추정할 때 사용합니다.", interpretation: "공시가격과 과세표준이 높아질수록 누진 구간이 적용되어 재산세가 증가합니다.",
  },
  "compound-interest": {
    index: "25", tag: "FINANCE / RETURN", title: "복리 계산기", description: "원금, 연 이자율과 기간을 입력해 세전 연복리 기준의 이자와 만기 예상 금액을 계산합니다.",
    method: "원금에 (1 + 연 이자율)을 기간만큼 거듭제곱해 만기 금액을 구하고 원금을 빼 이자를 계산합니다.", example: "1천만원을 연 5%, 10년 연복리로 운용하면 만기 예상 금액은 약 1,628.9만원입니다.", caution: "세전 연복리 가정입니다. 실제 상품의 복리 주기, 납입일, 세금, 수수료와 원금손실 가능성은 반영하지 않습니다.", useCase: "장기 예·적금, 투자 목표금액이나 수익률 시나리오를 비교할 때 사용합니다.", interpretation: "기간이 길수록 이자에도 이자가 붙는 복리 효과가 커집니다.",
  },
  "equal-principal": {
    index: "26", tag: "FINANCE / LOAN", title: "대출 원금균등상환 계산기", description: "매월 같은 원금을 갚는 원금균등상환의 납입액, 총 이자와 상환표를 계산합니다.",
    method: "대출 원금을 상환개월수로 균등 분할하고, 매월 남은 잔액에 대한 이자를 더해 상환액을 계산합니다.", example: "1억원을 연 4%, 3년 원금균등으로 상환하면 첫 달 납입액이 가장 크고 이후 매월 감소합니다.", caution: "고정금리와 매월 동일한 납입일을 가정합니다. 실제 상품의 거치, 일할 이자와 수수료는 반영하지 않습니다.", useCase: "초기 상환 여력이 충분한 경우, 원리금균등과 총 이자를 비교할 때 사용합니다.", interpretation: "원금이 빠르게 줄기 때문에 보통 원리금균등상환보다 총 이자가 적지만 초반 납입액이 큽니다.",
  },
  "bullet-loan": {
    index: "27", tag: "FINANCE / LOAN", title: "대출 만기일시상환 계산기", description: "매월 이자를 납부하고 만기에 원금을 갚는 만기일시상환의 비용과 상환표를 계산합니다.",
    method: "대출 기간 동안 원금은 유지되므로 매월 같은 이자를 계산하고, 마지막 달에 원금과 이자를 함께 상환합니다.", example: "1억원을 연 4%, 3년 만기일시상환으로 이용하면 월 이자는 약 33.3만원이고 마지막 달에 원금이 함께 상환됩니다.", caution: "만기 원금 상환 재원이 필요합니다. 실제 상품의 연장 조건, 거치, 일할 이자와 수수료는 약정을 확인하세요.", useCase: "이자 납부와 원금 상환 시점이 분리된 대출의 현금흐름을 확인할 때 사용합니다.", interpretation: "기간 중 월 납입액은 낮지만, 만기 시 큰 원금 상환 부담이 남습니다.",
  },
  percentage: {
    index: "28", tag: "FINANCE / RATIO", title: "퍼센트 계산기", description: "기준값의 퍼센트, 증감액과 증감률을 한 화면에서 계산합니다.",
    method: "퍼센트 값은 기준값에 비율을 곱해 계산하고, 증감률은 변경액을 기존값으로 나누어 구합니다.", example: "100만원의 15%는 15만원이며, 80만원에서 100만원으로 증가한 증감률은 25%입니다.", caution: "0을 기준으로 한 증감률은 정의하기 어려워 0%로 표시합니다. 반올림 전 실제 수치를 함께 확인하세요.", useCase: "할인율, 수수료, 목표 대비 달성률, 가격과 수치의 증감을 빠르게 확인할 때 사용합니다.", interpretation: "기준값과 비교값의 순서를 정확히 입력해야 증감률의 방향을 올바르게 해석할 수 있습니다.",
  },
};

function NumberField({ label, value, onChange, unit, min = 0 }: { label: string; value: number; onChange: (value: number) => void; unit: string; min?: number }) {
  return <label>{label}<div className="input-suffix"><CommaNumberInput ariaLabel={label} value={value} onValueChange={onChange} min={min} /><span>{unit}</span></div></label>;
}

function Schedule({ schedule }: { schedule: ReturnType<typeof calculateLoan>["schedule"] }) {
  const [open, setOpen] = useState(false);
  return <section className="schedule-section"><button className="schedule-toggle" onClick={() => setOpen((visible) => !visible)}><span><Calculator size={18} />월별 상환 스케줄 ({schedule.length}개월)</span><ChevronDown className={open ? "rotated" : ""} size={20} /></button>{open && <div className="table-wrap"><table><thead><tr><th>회차</th><th>상환액</th><th>원금</th><th>이자</th><th>잔액</th></tr></thead><tbody>{schedule.map((item) => <tr key={item.month}><td>{item.month}</td><td>{won.format(item.payment)}</td><td>{won.format(item.principal)}</td><td>{won.format(item.interest)}</td><td>{won.format(item.balance)}</td></tr>)}</tbody></table></div>}</section>;
}

function SeoGuide({ spec }: { spec: ToolSpec }) {
  return <section className="tool-knowledge"><div className="knowledge-grid"><article><p className="eyebrow">WHEN TO USE</p><h2>어떤 경우에 사용하나요?</h2><p>{spec.useCase}</p></article><article><p className="eyebrow">RESULT GUIDE</p><h2>결과 해석</h2><p>{spec.interpretation}</p></article></div></section>;
}

function LoanTool({ kind }: { kind: "mortgage" | "equal-principal" | "bullet-loan" }) {
  const spec = specs[kind];
  const [amount, setAmount] = useState(30000);
  const [rate, setRate] = useState(4);
  const [years, setYears] = useState(30);
  const [applied, setApplied] = useState({ amount: 30000, rate: 4, years: 30 });
  const method = kind === "mortgage" ? "annuity" : kind === "equal-principal" ? "principal" : "bullet";
  const calculation = calculateLoan(applied.amount * 10000, applied.rate, applied.years * 12, method);
  const reset = () => { setAmount(30000); setRate(4); setYears(30); setApplied({ amount: 30000, rate: 4, years: 30 }); };
  return <ToolMetaResolver slug={kind}>{(tool) => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.description}><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout loan-layout"><div className="calculator-form"><p className="eyebrow">LOAN SETTINGS</p><NumberField label="대출 금액" value={amount} onChange={setAmount} unit="만원" /><NumberField label="연 이자율" value={rate} onChange={setRate} unit="%" /><NumberField label="상환 기간" value={years} onChange={setYears} unit="년" min={1} /><CalculatorActions onCalculate={() => setApplied({ amount, rate, years })} onReset={reset} /></div><div className="calculator-output black-output"><p className="eyebrow">TOTAL INTEREST</p><h2>전체 이자</h2><strong>{won.format(calculation.totalInterest)}<small>원</small></strong><div className="result-rows"><p><span>총 상환액</span><b>{won.format(calculation.totalPayment)}원</b></p><p><span>{kind === "bullet-loan" ? "마지막 달 상환액" : "첫 달 상환액"}</span><b>{won.format(kind === "bullet-loan" ? calculation.schedule.at(-1)?.payment ?? 0 : calculation.firstPayment)}원</b></p></div></div></section><Schedule schedule={calculation.schedule} /><ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution}><SeoGuide spec={spec} /></ToolKnowledge></ToolFrame>}</ToolMetaResolver>;
}

function JeonseLoanTool() {
  const kind = "jeonse-loan-interest" as const; const spec = specs[kind];
  const [amount, setAmount] = useState(15000); const [rate, setRate] = useState(3.5); const [months, setMonths] = useState(24); const [applied, setApplied] = useState({ amount: 15000, rate: 3.5, months: 24 });
  const result = calculateJeonseLoanInterest(applied.amount * 10000, applied.rate, applied.months);
  const reset = () => { setAmount(15000); setRate(3.5); setMonths(24); setApplied({ amount: 15000, rate: 3.5, months: 24 }); };
  return <ToolMetaResolver slug={kind}>{(tool) => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.description}><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">JEONSE LOAN SETTINGS</p><NumberField label="대출 금액" value={amount} onChange={setAmount} unit="만원" /><NumberField label="연 이자율" value={rate} onChange={setRate} unit="%" /><NumberField label="대출 기간" value={months} onChange={setMonths} unit="개월" min={1} /><CalculatorActions onCalculate={() => setApplied({ amount, rate, months })} onReset={reset} /></div><div className="calculator-output black-output"><p className="eyebrow">EXPECTED INTEREST</p><h2>전체 예상 이자</h2><strong>{won.format(result.totalInterest)}<small>원</small></strong><div className="result-rows"><p><span>월 이자</span><b>{won.format(result.monthlyInterest)}원</b></p><p><span>원금 포함 총액</span><b>{won.format(result.totalPayment)}원</b></p></div></div></section><ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution}><SeoGuide spec={spec} /></ToolKnowledge></ToolFrame>}</ToolMetaResolver>;
}

function EarlyRepaymentTool() {
  const kind = "early-repayment-fee" as const; const spec = specs[kind];
  const [amount, setAmount] = useState(10000); const [rate, setRate] = useState(1.2); const [days, setDays] = useState(180); const [grace, setGrace] = useState(0); const [applied, setApplied] = useState({ amount: 10000, rate: 1.2, days: 180, grace: 0 });
  const result = calculateEarlyRepaymentFee(applied.amount * 10000, applied.rate, applied.days, applied.grace);
  const reset = () => { setAmount(10000); setRate(1.2); setDays(180); setGrace(0); setApplied({ amount: 10000, rate: 1.2, days: 180, grace: 0 }); };
  return <ToolMetaResolver slug={kind}>{(tool) => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.description}><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">REPAYMENT SETTINGS</p><NumberField label="중도상환 원금" value={amount} onChange={setAmount} unit="만원" /><NumberField label="약정 수수료율" value={rate} onChange={setRate} unit="%" /><NumberField label="상환 예정일까지 잔여일수" value={days} onChange={setDays} unit="일" /><NumberField label="면제 기간" value={grace} onChange={setGrace} unit="일" /><CalculatorActions onCalculate={() => setApplied({ amount, rate, days, grace })} onReset={reset} /></div><div className="calculator-output black-output"><p className="eyebrow">EXPECTED FEE</p><h2>예상 중도상환수수료</h2><strong>{won.format(result.fee)}<small>원</small></strong><div className="result-rows"><p><span>적용 일수</span><b>{won.format(result.chargeableDays)}일</b></p><p><span>수수료율</span><b>{decimal.format(result.feeRate * 100)}%</b></p></div></div></section><ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution}><SeoGuide spec={spec} /></ToolKnowledge></ToolFrame>}</ToolMetaResolver>;
}

function BrokerageTool() {
  const kind = "brokerage-fee" as const; const spec = specs[kind];
  const [transaction, setTransaction] = useState<BrokerageTransaction>("sale"); const [amount, setAmount] = useState(60000); const [applied, setApplied] = useState({ transaction: "sale" as BrokerageTransaction, amount: 60000 });
  const result = calculateBrokerageFee(applied.transaction, applied.amount * 10000);
  const reset = () => { setTransaction("sale"); setAmount(60000); setApplied({ transaction: "sale", amount: 60000 }); };
  return <ToolMetaResolver slug={kind}>{(tool) => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.description}><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">BROKERAGE SETTINGS</p><label>거래 유형<select value={transaction} onChange={(event) => setTransaction(event.target.value as BrokerageTransaction)}><option value="sale">매매·교환</option><option value="lease">임대차</option></select></label><NumberField label="거래 금액" value={amount} onChange={setAmount} unit="만원" /><CalculatorActions onCalculate={() => setApplied({ transaction, amount })} onReset={reset} /></div><div className="calculator-output black-output"><p className="eyebrow">MAXIMUM FEE</p><h2>중개보수 상한액</h2><strong>{won.format(result.fee)}<small>원</small></strong><div className="result-rows"><p><span>적용 상한요율</span><b>{decimal.format(result.rate * 100)}%</b></p><p><span>한도액</span><b>{result.cap === null ? "없음" : `${won.format(result.cap)}원`}</b></p></div></div></section><ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution}><SeoGuide spec={spec} /></ToolKnowledge></ToolFrame>}</ToolMetaResolver>;
}

function AcquisitionTaxTool() {
  const kind = "acquisition-tax" as const; const spec = specs[kind];
  const [price, setPrice] = useState(50000); const [count, setCount] = useState<AcquisitionHomeCount>(1); const [regulated, setRegulated] = useState(false); const [applied, setApplied] = useState({ price: 50000, count: 1 as AcquisitionHomeCount, regulated: false });
  const result = calculateAcquisitionTax(applied.price * 10000, applied.count, applied.regulated);
  const reset = () => { setPrice(50000); setCount(1); setRegulated(false); setApplied({ price: 50000, count: 1, regulated: false }); };
  return <ToolMetaResolver slug={kind}>{(tool) => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.description}><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">ACQUISITION SETTINGS</p><NumberField label="주택 취득가액" value={price} onChange={setPrice} unit="만원" /><label>취득 후 보유 주택 수<select value={count} onChange={(event) => setCount(Number(event.target.value) as AcquisitionHomeCount)}><option value="1">1주택</option><option value="2">2주택</option><option value="3">3주택</option><option value="4">4주택 이상</option></select></label><label className="checkbox-field"><input type="checkbox" checked={regulated} onChange={(event) => setRegulated(event.target.checked)} />조정대상지역 내 주택 취득</label><CalculatorActions onCalculate={() => setApplied({ price, count, regulated })} onReset={reset} /></div><div className="calculator-output black-output"><p className="eyebrow">ACQUISITION TAX</p><h2>예상 취득세 본세</h2><strong>{won.format(result.acquisitionTax)}<small>원</small></strong><div className="result-rows"><p><span>적용 세율</span><b>{decimal.format(result.rate * 100)}%</b></p><p><span>취득가액</span><b>{won.format(result.acquisitionPrice)}원</b></p></div></div></section><ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution}><SeoGuide spec={spec} /></ToolKnowledge></ToolFrame>}</ToolMetaResolver>;
}

function PropertyTaxTool() {
  const kind = "property-tax" as const; const spec = specs[kind];
  const [price, setPrice] = useState(50000); const [applied, setApplied] = useState({ price: 50000 }); const result = calculatePropertyTax(applied.price * 10000);
  const reset = () => { setPrice(50000); setApplied({ price: 50000 }); };
  return <ToolMetaResolver slug={kind}>{(tool) => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.description}><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">PROPERTY TAX SETTINGS</p><NumberField label="주택 공시가격" value={price} onChange={setPrice} unit="만원" /><CalculatorActions onCalculate={() => setApplied({ price })} onReset={reset} /></div><div className="calculator-output black-output"><p className="eyebrow">PROPERTY TAX</p><h2>예상 재산세 본세</h2><strong>{won.format(result.propertyTax)}<small>원</small></strong><div className="result-rows"><p><span>과세표준</span><b>{won.format(result.taxBase)}원</b></p><p><span>최고 적용세율</span><b>{decimal.format(result.rate * 100)}%</b></p></div></div></section><ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution}><SeoGuide spec={spec} /></ToolKnowledge></ToolFrame>}</ToolMetaResolver>;
}

function CompoundTool() {
  const kind = "compound-interest" as const; const spec = specs[kind];
  const [amount, setAmount] = useState(1000); const [rate, setRate] = useState(5); const [years, setYears] = useState(10); const [applied, setApplied] = useState({ amount: 1000, rate: 5, years: 10 }); const result = calculateCompoundInterest(applied.amount * 10000, applied.rate, applied.years);
  const reset = () => { setAmount(1000); setRate(5); setYears(10); setApplied({ amount: 1000, rate: 5, years: 10 }); };
  return <ToolMetaResolver slug={kind}>{(tool) => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.description}><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">COMPOUND SETTINGS</p><NumberField label="원금" value={amount} onChange={setAmount} unit="만원" /><NumberField label="연 이자율" value={rate} onChange={setRate} unit="%" /><NumberField label="기간" value={years} onChange={setYears} unit="년" /><CalculatorActions onCalculate={() => setApplied({ amount, rate, years })} onReset={reset} /></div><div className="calculator-output black-output"><p className="eyebrow">COMPOUND RESULT</p><h2>만기 예상 금액</h2><strong>{won.format(result.total)}<small>원</small></strong><div className="result-rows"><p><span>원금</span><b>{won.format(result.principal)}원</b></p><p><span>복리 이자</span><b>{won.format(result.interest)}원</b></p></div></div></section><ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution}><SeoGuide spec={spec} /></ToolKnowledge></ToolFrame>}</ToolMetaResolver>;
}

function PercentageTool() {
  const kind = "percentage" as const; const spec = specs[kind];
  const [mode, setMode] = useState<PercentageMode>("of"); const [first, setFirst] = useState(1000000); const [second, setSecond] = useState(15); const [applied, setApplied] = useState({ mode: "of" as PercentageMode, first: 1000000, second: 15 }); const result = calculatePercentage(applied.first, applied.second, applied.mode);
  const modeText: Record<PercentageMode, string> = { of: "기준값의 퍼센트", change: "두 값의 증감률", increase: "퍼센트 증가", decrease: "퍼센트 감소" };
  const reset = () => { setMode("of"); setFirst(1000000); setSecond(15); setApplied({ mode: "of", first: 1000000, second: 15 }); };
  return <ToolMetaResolver slug={kind}>{(tool) => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.description}><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">PERCENTAGE SETTINGS</p><label>계산 유형<select value={mode} onChange={(event) => setMode(event.target.value as PercentageMode)}>{Object.entries(modeText).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><NumberField label={mode === "change" ? "기존값" : "기준값"} value={first} onChange={setFirst} unit="" /><NumberField label={mode === "change" ? "변경값" : "퍼센트"} value={second} onChange={setSecond} unit={mode === "change" ? "" : "%"} /><CalculatorActions onCalculate={() => setApplied({ mode, first, second })} onReset={reset} /></div><div className="calculator-output black-output"><p className="eyebrow">PERCENTAGE RESULT</p><h2>{mode === "change" ? "증감률" : "계산 결과"}</h2><strong>{mode === "change" ? decimal.format(result.result) : won.format(result.result)}<small>{mode === "change" ? "%" : ""}</small></strong><div className="result-rows"><p><span>{mode === "change" ? "변경액" : "계산 기준"}</span><b>{won.format(mode === "change" ? result.difference : result.base)}{mode === "change" ? "" : ""}</b></p><p><span>입력 비율</span><b>{decimal.format(result.percentage)}%</b></p></div></div></section><ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution}><SeoGuide spec={spec} /></ToolKnowledge></ToolFrame>}</ToolMetaResolver>;
}

export default function FinanceRealEstateCalculators({ kind }: { kind: CalculatorKind }) {
  if (kind === "mortgage" || kind === "equal-principal" || kind === "bullet-loan") return <LoanTool kind={kind} />;
  if (kind === "jeonse-loan-interest") return <JeonseLoanTool />;
  if (kind === "early-repayment-fee") return <EarlyRepaymentTool />;
  if (kind === "brokerage-fee") return <BrokerageTool />;
  if (kind === "acquisition-tax") return <AcquisitionTaxTool />;
  if (kind === "property-tax") return <PropertyTaxTool />;
  if (kind === "compound-interest") return <CompoundTool />;
  return <PercentageTool />;
}
