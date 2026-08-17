import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { CatalogBreadcrumb, CalculatorActions, SeoHead, ToolKnowledge, ToolMetaResolver } from "@/components/CatalogSupport";
import { CommaNumberInput } from "@/components/CommaNumberInput";
import { ToolFrame } from "@/components/ToolLayout";
import { calculatePyeong } from "@shared/toolbox";

const formatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 3 });
export default function PyeongCalculator() {
  const [mode, setMode] = useState<"sqm" | "pyeong">("sqm"); const [value, setValue] = useState(84); const [applied, setApplied] = useState({ mode: "sqm" as "sqm" | "pyeong", value: 84 });
  const result = calculatePyeong(applied.value, applied.mode); const reset = () => { setMode("sqm"); setValue(84); setApplied({ mode: "sqm", value: 84 }); };
  return <ToolMetaResolver slug="pyeong">{(tool) => <ToolFrame index="11" tag="AREA CALCULATOR" title="평수 계산기" description="제곱미터와 평을 양방향으로 빠르게 변환합니다."><SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} /><CatalogBreadcrumb toolSlug={tool.slug} /><section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">INPUT / AREA</p><div className="method-picker"><button className={mode === "sqm" ? "selected" : ""} onClick={() => setMode("sqm")}>㎡ → 평</button><button className={mode === "pyeong" ? "selected" : ""} onClick={() => setMode("pyeong")}>평 → ㎡</button></div><label>{mode === "sqm" ? "면적" : "평수"}<div className="input-suffix"><CommaNumberInput ariaLabel={mode === "sqm" ? "제곱미터" : "평수"} value={value} onValueChange={setValue} /><span>{mode === "sqm" ? "㎡" : "평"}</span></div></label><CalculatorActions onCalculate={() => setApplied({ mode, value })} onReset={reset} /></div><div className="calculator-output red-output"><p className="eyebrow">CONVERSION RESULT</p><h2>{applied.mode === "sqm" ? "환산 평수" : "환산 면적"}</h2><strong>{formatter.format(applied.mode === "sqm" ? result.pyeong : result.sqm)}<small>{applied.mode === "sqm" ? "평" : "㎡"}</small></strong><div className="result-rows"><p><span>제곱미터</span><b>{formatter.format(result.sqm)}㎡</b></p><p><span>평수</span><b>{formatter.format(result.pyeong)}평</b></p></div></div></section><ToolKnowledge tool={tool} method="입력값에 1평당 3.305785㎡의 기준을 적용해 두 단위를 서로 변환합니다." example="84㎡를 입력하면 약 25.41평으로 변환됩니다." caution="공급면적, 전용면적, 계약면적은 서로 다를 수 있으므로 부동산 계약서의 면적 기준을 확인하세요." /></ToolFrame>}</ToolMetaResolver>;
}
