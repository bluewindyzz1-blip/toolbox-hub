import { useEffect, useMemo, useState } from "react";
import { CatalogBreadcrumb, CalculatorActions, SeoHead, ToolKnowledge, ToolMetaResolver } from "@/components/CatalogSupport";
import { CommaNumberInput } from "@/components/CommaNumberInput";
import { ToolFrame } from "@/components/ToolLayout";
import {
  ActivityKind,
  BmrSex,
  calculateAverage,
  calculateBmi,
  calculateBmr,
  calculateBreakEven,
  calculateCaloriesBurned,
  calculateDiscount,
  calculateFuelCost,
  calculateGpa,
  calculateMargin,
  calculateSplitBill,
} from "@shared/toolbox";

type Kind = "discount" | "margin" | "break-even" | "fuel-cost" | "split-bill" | "average" | "bmi" | "bmr" | "calories-burned" | "gpa";
type InputSpec = { label: string; unit: string; value: number };
type ToolSpec = {
  title: string;
  tag: string;
  index: string;
  desc: string;
  method: string;
  example: string;
  caution: string;
  inputs: InputSpec[];
};

const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

const specs: Record<Kind, ToolSpec> = {
  discount: {
    title: "할인율 계산기", tag: "SHOPPING", index: "20", desc: "정가와 할인율을 입력하면 할인 금액과 최종 결제 예상액을 계산합니다.",
    method: "정가에 할인율을 곱해 할인 금액을 구하고, 이를 정가에서 뺍니다.", example: "정가 50,000원에 20% 할인을 적용하면 10,000원 할인, 40,000원 결제 예상액이 계산됩니다.", caution: "쿠폰 중복, 배송비와 카드 할인 등 판매처별 조건은 반영하지 않습니다.",
    inputs: [{ label: "정가", unit: "원", value: 50000 }, { label: "할인율", unit: "%", value: 20 }],
  },
  margin: {
    title: "마진율 계산기", tag: "BUSINESS", index: "21", desc: "판매가와 원가를 입력해 이익, 마진율과 마크업률을 비교합니다.",
    method: "이익은 판매가에서 원가를 뺀 값이며, 마진율은 판매가를 기준으로 계산합니다.", example: "판매가 30,000원, 원가 18,000원을 입력하면 이익 12,000원과 마진율 40%가 표시됩니다.", caution: "결제 수수료, 광고비, 부가세와 인건비는 입력 원가에 별도로 반영해야 합니다.",
    inputs: [{ label: "판매가", unit: "원", value: 30000 }, { label: "원가", unit: "원", value: 18000 }],
  },
  "break-even": {
    title: "손익분기점 계산기", tag: "BUSINESS", index: "22", desc: "고정비·판매단가·단위당 변동비로 손익분기 판매수량을 계산합니다.",
    method: "고정비를 단위당 공헌이익(판매단가−변동비)으로 나눈 뒤, 필요한 판매수량을 올림 처리합니다.", example: "고정비 1,000,000원, 판매단가 20,000원, 변동비 8,000원이면 약 84개 판매가 필요합니다.", caution: "단가와 변동비가 일정하다는 가정의 단순 모델이며 실제 재고·반품 비용은 반영하지 않습니다.",
    inputs: [{ label: "고정비", unit: "원", value: 1000000 }, { label: "판매단가", unit: "원", value: 20000 }, { label: "단위당 변동비", unit: "원", value: 8000 }],
  },
  "fuel-cost": {
    title: "주유비 계산기", tag: "DRIVE", index: "23", desc: "이동거리·연비·유가를 입력하면 예상 사용 연료량과 주유비를 계산합니다.",
    method: "이동거리를 연비로 나눠 필요한 연료량을 구한 뒤 리터당 가격을 곱합니다.", example: "300km, 12km/L, 리터당 1,700원을 입력하면 약 25L와 42,500원이 계산됩니다.", caution: "정체, 공회전, 경사와 실제 연비 변동은 반영하지 않는 참고용 추정입니다.",
    inputs: [{ label: "이동거리", unit: "km", value: 300 }, { label: "연비", unit: "km/L", value: 12 }, { label: "리터당 유가", unit: "원", value: 1700 }],
  },
  "split-bill": {
    title: "더치페이 계산기", tag: "LIFESTYLE", index: "24", desc: "총 금액과 인원 수, 선택한 팁 비율을 기준으로 1인당 금액을 계산합니다.",
    method: "총 금액에 팁을 더한 뒤 참여 인원 수로 균등 분할합니다.", example: "총 96,000원을 4명이 나누면 1인당 24,000원이 계산됩니다.", caution: "개별 주문 차이, 할인 분배와 송금 수수료는 반영하지 않습니다.",
    inputs: [{ label: "총 금액", unit: "원", value: 96000 }, { label: "인원 수", unit: "명", value: 4 }, { label: "팁 비율", unit: "%", value: 0 }],
  },
  average: {
    title: "평균 계산기", tag: "STUDY", index: "25", desc: "여러 수치를 입력하면 합계, 평균, 최솟값과 최댓값을 계산합니다.",
    method: "입력된 값의 합계를 입력 개수로 나눠 산술평균을 계산합니다.", example: "80, 90, 100을 입력하면 합계 270, 평균 90이 표시됩니다.", caution: "비중이 서로 다른 값은 단순평균 대신 가중평균을 사용해야 할 수 있습니다.",
    inputs: [{ label: "값 1", unit: "", value: 80 }, { label: "값 2", unit: "", value: 90 }, { label: "값 3", unit: "", value: 100 }, { label: "값 4", unit: "", value: 0 }, { label: "값 5", unit: "", value: 0 }],
  },
  bmi: {
    title: "BMI 계산기", tag: "HEALTH", index: "26", desc: "키와 체중을 입력하면 체질량지수(BMI)를 참고용으로 계산합니다.",
    method: "체중(kg)을 키(m)의 제곱으로 나눠 BMI를 계산합니다.", example: "키 170cm, 체중 65kg을 입력하면 BMI 약 22.49가 표시됩니다.", caution: "BMI는 일반적인 참고 지표일 뿐, 개인의 건강 상태나 질환을 진단하지 않습니다. 건강 관련 판단은 의료 전문가와 상의하세요.",
    inputs: [{ label: "키", unit: "cm", value: 170 }, { label: "체중", unit: "kg", value: 65 }],
  },
  bmr: {
    title: "기초대사량 계산기", tag: "HEALTH", index: "27", desc: "성별·나이·키·체중을 입력하면 하루 기초대사량을 참고용으로 추정합니다.",
    method: "Mifflin–St Jeor 식의 입력값 기반 추정식을 사용합니다.", example: "남성, 30세, 175cm, 70kg을 입력하면 하루 기초대사량 추정치가 표시됩니다.", caution: "기초대사량은 개인의 체성분·건강 상태·활동량에 따라 달라집니다. 식단이나 치료 결정에 단독으로 사용하지 마세요.",
    inputs: [{ label: "나이", unit: "세", value: 30 }, { label: "키", unit: "cm", value: 175 }, { label: "체중", unit: "kg", value: 70 }],
  },
  "calories-burned": {
    title: "칼로리 소모 계산기", tag: "HEALTH", index: "28", desc: "운동 종류·체중·운동 시간을 입력하면 활동 중 소모 열량을 참고용으로 추정합니다.",
    method: "활동별 대사당량(MET), 체중과 시간을 곱한 일반적 추정식을 사용합니다.", example: "체중 65kg으로 60분 걷기를 선택하면 예상 소모 열량이 표시됩니다.", caution: "운동 강도·심박수·개인 체력에 따라 실제 소모량은 다릅니다. 건강 진단이나 처방 용도로 사용하지 마세요.",
    inputs: [{ label: "체중", unit: "kg", value: 65 }, { label: "운동 시간", unit: "분", value: 60 }],
  },
  gpa: {
    title: "학점 평균 계산기", tag: "STUDY", index: "29", desc: "과목별 학점과 평점을 입력하면 가중 학점 평균을 계산합니다.",
    method: "각 과목의 학점×평점을 합산하고, 총 학점으로 나눠 가중평균을 구합니다.", example: "3학점 A+(4.5), 3학점 A(4.0), 2학점 B+(3.5)를 입력하면 가중평균이 계산됩니다.", caution: "대학별 평점 체계와 P/F 과목 반영 방식은 다르므로 학교 학칙을 확인하세요.",
    inputs: [{ label: "과목 1 학점", unit: "학점", value: 3 }, { label: "과목 1 평점", unit: "/4.5", value: 4.5 }, { label: "과목 2 학점", unit: "학점", value: 3 }, { label: "과목 2 평점", unit: "/4.5", value: 4.0 }, { label: "과목 3 학점", unit: "학점", value: 2 }, { label: "과목 3 평점", unit: "/4.5", value: 3.5 }],
  },
};

function getResult(kind: Kind, values: number[], sex: BmrSex, activity: ActivityKind) {
  if (kind === "discount") { const result = calculateDiscount(values[0], values[1]); return { main: won.format(result.finalPrice), unit: "원", rows: [["할인 금액", `${won.format(result.discount)}원`], ["할인율", `${decimal.format(result.discountRate)}%`]] }; }
  if (kind === "margin") { const result = calculateMargin(values[0], values[1]); return { main: won.format(result.profit), unit: "원 이익", rows: [["마진율", `${decimal.format(result.marginRate)}%`], ["마크업률", `${decimal.format(result.markupRate)}%`]] }; }
  if (kind === "break-even") { const result = calculateBreakEven(values[0], values[1], values[2]); return { main: result.valid ? won.format(result.units) : "—", unit: result.valid ? "개 판매" : "", rows: [["손익분기 매출", result.valid ? `${won.format(result.revenueAtBreakEven)}원` : result.message], ["단위당 공헌이익", `${won.format(result.contributionMargin)}원`]] }; }
  if (kind === "fuel-cost") { const result = calculateFuelCost(values[0], values[1], values[2]); return { main: result.valid ? won.format(result.cost) : "—", unit: result.valid ? "원" : "", rows: [["예상 연료량", result.valid ? `${decimal.format(result.liters)}L` : result.message], ["이동 거리", `${decimal.format(result.distanceKm)}km`]] }; }
  if (kind === "split-bill") { const result = calculateSplitBill(values[0], values[1], values[2]); return { main: won.format(result.perPerson), unit: "원 / 1인", rows: [["팁 포함 총액", `${won.format(result.grandTotal)}원`], ["참여 인원", `${result.people}명`]] }; }
  if (kind === "average") { const result = calculateAverage(values.filter((value) => value !== 0)); return { main: decimal.format(result.average), unit: "평균", rows: [["합계", decimal.format(result.sum)], ["최솟값 / 최댓값", result.count ? `${decimal.format(result.minimum)} / ${decimal.format(result.maximum)}` : "값을 입력하세요"]] }; }
  if (kind === "bmi") { const result = calculateBmi(values[1], values[0]); return { main: result.valid ? decimal.format(result.bmi) : "—", unit: "BMI", rows: [["참고 범위", result.category], ["입력값", `${decimal.format(result.heightCm)}cm / ${decimal.format(result.weightKg)}kg`]] }; }
  if (kind === "bmr") { const result = calculateBmr(sex, values[0], values[2], values[1]); return { main: result.valid ? won.format(result.bmr) : "—", unit: "kcal / 일", rows: [["성별", sex === "male" ? "남성 기준" : "여성 기준"], ["입력값", `${result.age}세 / ${result.heightCm}cm / ${result.weightKg}kg`]] }; }
  if (kind === "calories-burned") { const result = calculateCaloriesBurned(activity, values[0], values[1]); const label = activity === "walking" ? "걷기" : activity === "cycling" ? "자전거" : "조깅"; return { main: won.format(result.calories), unit: "kcal", rows: [["활동", `${label} · MET ${result.met}`], ["운동 시간", `${decimal.format(result.minutes)}분`]] }; }
  const result = calculateGpa([{ credits: values[0], gradePoint: values[1] }, { credits: values[2], gradePoint: values[3] }, { credits: values[4], gradePoint: values[5] }]);
  return { main: decimal.format(result.gpa), unit: "/ 4.5", rows: [["총 이수 학점", `${decimal.format(result.totalCredits)}학점`], ["가중 평점 합계", decimal.format(result.weightedPoints)]] };
}

export default function DailyWorkCalculators({ kind }: { kind: Kind }) {
  const spec = specs[kind];
  const defaults = useMemo(() => spec.inputs.map((input) => input.value), [spec]);
  const [values, setValues] = useState<number[]>(defaults);
  const [applied, setApplied] = useState<number[]>(defaults);
  const [sex, setSex] = useState<BmrSex>("male");
  const [appliedSex, setAppliedSex] = useState<BmrSex>("male");
  const [activity, setActivity] = useState<ActivityKind>("walking");
  const [appliedActivity, setAppliedActivity] = useState<ActivityKind>("walking");

  useEffect(() => { setValues(defaults); setApplied(defaults); setSex("male"); setAppliedSex("male"); setActivity("walking"); setAppliedActivity("walking"); }, [kind, defaults]);

  const result = getResult(kind, applied, appliedSex, appliedActivity);
  const updateValue = (index: number, value: number) => setValues((current) => current.map((item, currentIndex) => currentIndex === index ? value : item));
  const reset = () => { setValues(defaults); setApplied(defaults); setSex("male"); setAppliedSex("male"); setActivity("walking"); setAppliedActivity("walking"); };

  return <ToolMetaResolver slug={kind}>{tool => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.desc}>
    <SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} />
    <CatalogBreadcrumb toolSlug={tool.slug} />
    <section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">INPUT</p>
      {kind === "bmr" && <label>성별<select value={sex} onChange={(event) => setSex(event.target.value as BmrSex)}><option value="male">남성</option><option value="female">여성</option></select></label>}
      {kind === "calories-burned" && <label>운동 종류<select value={activity} onChange={(event) => setActivity(event.target.value as ActivityKind)}><option value="walking">걷기</option><option value="cycling">자전거</option><option value="jogging">조깅</option></select></label>}
      {spec.inputs.map((input, index) => <label key={input.label}>{input.label}<div className="input-suffix"><CommaNumberInput ariaLabel={input.label} value={values[index] ?? 0} onValueChange={(value) => updateValue(index, value)} /><span>{input.unit}</span></div></label>)}
      <CalculatorActions onCalculate={() => { setApplied([...values]); setAppliedSex(sex); setAppliedActivity(activity); }} onReset={reset} />
    </div><div className="calculator-output black-output"><p className="eyebrow">RESULT</p><h2>예상 결과</h2><strong>{result.main}<small>{result.unit}</small></strong><div className="result-rows">{result.rows.map(([label, value]) => <p key={label}><span>{label}</span><b>{value}</b></p>)}</div></div></section>
    <ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution} />
  </ToolFrame>}</ToolMetaResolver>;
}
