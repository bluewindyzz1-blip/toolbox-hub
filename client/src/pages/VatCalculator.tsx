import { useState } from "react";
import { ArrowRightLeft, ReceiptText } from "lucide-react";
import { ToolFrame } from "@/components/ToolLayout";
import { CatalogBreadcrumb, CalculatorActions, SeoHead, ToolKnowledge, ToolMetaResolver } from "@/components/CatalogSupport";
import { CommaNumberInput } from "@/components/CommaNumberInput";
import { calculateVat } from "@shared/toolbox";

const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

export default function VatCalculator() {
  const [mode, setMode] = useState<"supply" | "total">("supply");
  const [value, setValue] = useState(1000000);
  const [applied, setApplied] = useState({ mode: "supply" as "supply" | "total", value: 1000000 });
  const result = calculateVat(applied.value, applied.mode);
  const reset = () => { setMode("supply"); setValue(1000000); setApplied({ mode: "supply", value: 1000000 }); };
  return (
    <ToolMetaResolver slug="vat-calculator">{(tool) => <ToolFrame index="06" tag="BUSINESS CALCULATOR" title="부가세 계산기" description="공급가액과 부가세 포함 금액을 양방향으로 계산합니다. 부가세율은 10% 기준입니다.">
      <SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} />
      <section className="vat-shell"><div className="vat-input"><div className="mode-tabs small"><button className={mode === "supply" ? "selected" : ""} onClick={() => setMode("supply")}>공급가액에서 계산</button><button className={mode === "total" ? "selected" : ""} onClick={() => setMode("total")}>합계에서 계산</button></div><label>{mode === "supply" ? "공급가액" : "부가세 포함 합계"}<div className="large-input"><CommaNumberInput ariaLabel="부가세 기준 금액" value={value} onValueChange={setValue} /><span>원</span></div></label><p><ArrowRightLeft size={16} />입력 기준을 바꾸면 역산합니다.</p><CalculatorActions onCalculate={() => setApplied({ mode, value })} onReset={reset} /></div><div className="vat-result"><ReceiptText size={28} /><p>CALCULATION RESULT</p><div><span>공급가액</span><strong>{won.format(result.supply)}원</strong></div><div><span>부가세 (10%)</span><strong>{won.format(result.vat)}원</strong></div><div className="total-row"><span>합계</span><strong>{won.format(result.total)}원</strong></div></div></section>
      <ToolKnowledge tool={tool} method="공급가액 기준에서는 10%를 더하고, 합계 기준에서는 1.1로 나누어 공급가액과 부가세를 역산합니다." example="공급가액 100만원을 입력하면 부가세 10만원과 합계 110만원을 확인합니다." caution="일부 거래는 영세율 또는 면세 적용 여부가 다를 수 있으므로 실제 신고 전 세무 기준을 확인하세요." />
    </ToolFrame>}</ToolMetaResolver>
  );
}
