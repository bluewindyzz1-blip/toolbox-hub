import { useEffect, useMemo, useState } from "react";
import { CatalogBreadcrumb, CalculatorActions, SeoHead, ToolKnowledge, ToolMetaResolver } from "@/components/CatalogSupport";
import { CommaNumberInput } from "@/components/CommaNumberInput";
import { ToolFrame } from "@/components/ToolLayout";
import {
  calculateCurrencyExchange,
  calculateElectricityUsage,
  calculateFee,
  calculateGpaConversion,
  calculateInstallment,
  calculateLaborCost,
  calculateMonthlyBudget,
  calculatePaintAmount,
  calculateParkingFee,
  calculateProjectQuote,
  calculateRankPercent,
  calculateRecipeServings,
  calculateReturnRate,
  calculateRewardPoints,
  calculateSavingsGoal,
  calculateSimpleInterest,
  calculateSleepDuration,
  calculateTargetScore,
  calculateTravelBudget,
  calculateUnitPrice,
} from "@shared/toolbox";

type Kind = "unit-price" | "fee" | "parking-fee" | "travel-budget" | "recipe-servings" | "sleep-duration" | "electricity-usage" | "paint-amount" | "savings-goal" | "simple-interest" | "installment" | "currency-exchange" | "gpa-conversion" | "target-score" | "rank-percent" | "labor-cost" | "project-quote" | "monthly-budget" | "reward-points" | "return-rate";
type InputSpec = { label: string; unit: string; value: number; min?: number; max?: number };
type ToolSpec = { title: string; tag: string; index: string; desc: string; method: string; example: string; caution: string; inputs: InputSpec[] };
type ViewResult = { main: string; unit: string; rows: Array<[string, string]> };

const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
const percent = (value: number) => `${decimal.format(value)}%`;
const minutesToCopy = (total: number) => `${Math.floor(total / 60)}시간 ${total % 60}분`;

const specs: Record<Kind, ToolSpec> = {
  "unit-price": { title: "단가 계산기", tag: "SHOPPING", index: "30", desc: "총 금액과 수량을 입력하면 1개당 단가를 계산합니다.", method: "총 금액을 수량으로 나눠 1개당 가격을 구합니다.", example: "12개 묶음 18,000원을 입력하면 1개당 1,500원이 계산됩니다.", caution: "배송비·쿠폰·적립금은 총 금액에 직접 반영해 계산하세요.", inputs: [{ label: "총 금액", unit: "원", value: 18000 }, { label: "수량", unit: "개", value: 12 }] },
  fee: { title: "수수료 계산기", tag: "BUSINESS", index: "31", desc: "거래 금액과 수수료율로 수수료와 수수료 제외 금액을 계산합니다.", method: "거래 금액에 수수료율을 곱해 수수료를 구한 뒤 거래 금액에서 뺍니다.", example: "100,000원에 3.3% 수수료를 적용하면 3,300원 수수료와 96,700원이 계산됩니다.", caution: "부가세·정산 주기·최소 수수료 등 실제 계약 조건은 별도로 확인하세요.", inputs: [{ label: "거래 금액", unit: "원", value: 100000 }, { label: "수수료율", unit: "%", value: 3.3, max: 100 }] },
  "parking-fee": { title: "주차비 계산기", tag: "DRIVE", index: "32", desc: "주차 시간과 기본·추가 요금 기준으로 예상 주차비를 계산합니다.", method: "기본 시간 이후의 시간을 추가 시간 단위로 올림 처리해 추가 요금을 더합니다.", example: "150분 주차, 기본 60분 3,000원, 이후 30분당 1,000원을 입력하면 6,000원이 계산됩니다.", caution: "무료 회차·일 최대요금·할인 등록 등 주차장별 조건은 반영하지 않습니다.", inputs: [{ label: "주차 시간", unit: "분", value: 150 }, { label: "기본 시간", unit: "분", value: 60 }, { label: "기본 요금", unit: "원", value: 3000 }, { label: "추가 시간 단위", unit: "분", value: 30 }, { label: "추가 요금", unit: "원", value: 1000 }] },
  "travel-budget": { title: "여행 경비 계산기", tag: "TRAVEL", index: "33", desc: "교통·숙소·식비·기타 경비와 인원 수로 총 여행 경비와 1인당 금액을 계산합니다.", method: "각 경비 항목을 합산하고 인원 수로 나눕니다.", example: "총 경비 600,000원을 3명이 나누면 1인당 200,000원이 계산됩니다.", caution: "환전 수수료, 여행자보험, 현지 세금은 필요한 경우 기타 경비에 포함하세요.", inputs: [{ label: "교통비", unit: "원", value: 180000 }, { label: "숙소비", unit: "원", value: 240000 }, { label: "식비", unit: "원", value: 120000 }, { label: "기타 경비", unit: "원", value: 60000 }, { label: "인원 수", unit: "명", value: 3 }] },
  "recipe-servings": { title: "레시피 인분 계산기", tag: "LIFESTYLE", index: "34", desc: "원래 레시피 인분과 목표 인분으로 재료량을 비례 조정합니다.", method: "목표 인분을 원래 인분으로 나눈 배율을 재료량에 곱합니다.", example: "2인분 재료 200g을 5인분으로 늘리면 500g이 계산됩니다.", caution: "조미료·조리시간은 재료 비율과 완전히 비례하지 않을 수 있습니다.", inputs: [{ label: "원래 인분", unit: "인분", value: 2 }, { label: "목표 인분", unit: "인분", value: 5 }, { label: "원래 재료량", unit: "g", value: 200 }] },
  "sleep-duration": { title: "수면 시간 계산기", tag: "HEALTH", index: "35", desc: "취침·기상 시각으로 자정을 넘는 경우까지 포함해 수면 시간을 계산합니다.", method: "취침 시각과 기상 시각의 차이를 분 단위로 계산합니다.", example: "23시 30분에 자고 7시 10분에 일어나면 7시간 40분이 계산됩니다.", caution: "수면 시간은 참고용 기록이며 수면의 질이나 건강 상태를 평가하지 않습니다.", inputs: [{ label: "취침 시", unit: "시", value: 23, min: 0, max: 23 }, { label: "취침 분", unit: "분", value: 30, min: 0, max: 59 }, { label: "기상 시", unit: "시", value: 7, min: 0, max: 23 }, { label: "기상 분", unit: "분", value: 10, min: 0, max: 59 }] },
  "electricity-usage": { title: "전력 사용량 계산기", tag: "HOME", index: "36", desc: "소비전력·사용 시간·단가로 예상 전력 사용량과 비용을 계산합니다.", method: "소비전력(W)과 시간·일수를 곱해 kWh로 환산한 뒤 단가를 적용합니다.", example: "1,000W 기기를 하루 2시간, 30일 사용하고 1kWh당 150원을 적용하면 약 9,000원이 계산됩니다.", caution: "누진제·기본요금·계절별 요금은 반영하지 않은 단순 사용량 기준입니다.", inputs: [{ label: "소비전력", unit: "W", value: 1000 }, { label: "하루 사용 시간", unit: "시간", value: 2 }, { label: "사용 일수", unit: "일", value: 30 }, { label: "1kWh 단가", unit: "원", value: 150 }] },
  "paint-amount": { title: "페인트 필요량 계산기", tag: "HOME", index: "37", desc: "벽 면적·도포 횟수·커버 면적으로 예상 페인트 필요량을 계산합니다.", method: "벽의 총 면적에 도포 횟수를 곱한 뒤 1L당 도포 면적으로 나눕니다.", example: "가로 4m, 세로 2.5m 벽 2면을 2회 칠하고 1L당 10㎡를 도포하면 약 4L가 계산됩니다.", caution: "창문·문 면적, 표면 상태와 여유분은 현장 조건에 맞게 추가로 고려하세요.", inputs: [{ label: "벽 가로", unit: "m", value: 4 }, { label: "벽 세로", unit: "m", value: 2.5 }, { label: "벽 면 수", unit: "면", value: 2 }, { label: "도포 횟수", unit: "회", value: 2 }, { label: "1L당 도포 면적", unit: "㎡", value: 10 }] },
  "savings-goal": { title: "목표 저축 계산기", tag: "MONEY", index: "38", desc: "목표 금액·현재 금액·월 저축액으로 목표까지 남은 기간을 계산합니다.", method: "남은 목표 금액을 월 저축액으로 나눈 뒤 개월 수를 올림 처리합니다.", example: "목표 3,000,000원, 현재 600,000원, 월 200,000원을 입력하면 약 12개월이 계산됩니다.", caution: "이자·수익률·물가 변동은 반영하지 않은 단순 저축 계획입니다.", inputs: [{ label: "목표 금액", unit: "원", value: 3000000 }, { label: "현재 금액", unit: "원", value: 600000 }, { label: "월 저축액", unit: "원", value: 200000 }] },
  "simple-interest": { title: "단리 이자 계산기", tag: "MONEY", index: "39", desc: "원금·연 이율·기간으로 단리 기준 예상 이자와 만기 금액을 계산합니다.", method: "원금에 연 이율과 기간(년)을 곱해 단리 이자를 계산합니다.", example: "1,000,000원, 연 3%, 12개월을 입력하면 이자 30,000원이 계산됩니다.", caution: "실제 금융상품의 세금·우대조건·일수 계산과 이자 지급 방식은 상품설명서가 우선합니다.", inputs: [{ label: "원금", unit: "원", value: 1000000 }, { label: "연 이율", unit: "%", value: 3 }, { label: "기간", unit: "개월", value: 12 }] },
  installment: { title: "카드 할부 계산기", tag: "MONEY", index: "40", desc: "결제 금액·할부 개월·월 수수료율로 예상 월 납입액과 수수료를 계산합니다.", method: "단순 월 수수료율을 결제 금액과 할부 개월에 적용해 총액을 계산합니다.", example: "300,000원 6개월, 월 수수료율 0.5%를 입력하면 예상 총 수수료와 월 납입액이 계산됩니다.", caution: "카드사별 할부 수수료, 무이자 행사, 결제일 기준은 실제 카드사 안내가 우선합니다.", inputs: [{ label: "결제 금액", unit: "원", value: 300000 }, { label: "할부 개월", unit: "개월", value: 6 }, { label: "월 수수료율", unit: "%", value: 0.5 }] },
  "currency-exchange": { title: "환율 계산기", tag: "TRAVEL", index: "41", desc: "금액과 직접 입력한 기준 환율로 환산 금액을 계산합니다.", method: "원래 금액에 사용자가 입력한 환율을 곱합니다.", example: "100달러와 1달러당 1,350원을 입력하면 135,000원이 계산됩니다.", caution: "실시간 환율을 제공하지 않습니다. 실제 환전·결제에는 은행·카드사의 적용 환율과 수수료를 확인하세요.", inputs: [{ label: "환산할 금액", unit: "외화", value: 100 }, { label: "기준 환율", unit: "원", value: 1350 }] },
  "gpa-conversion": { title: "학점 환산 계산기", tag: "STUDY", index: "42", desc: "현재 평점과 양쪽 만점 기준으로 환산 평점과 백분율을 계산합니다.", method: "현재 평점을 현재 만점으로 나눈 비율에 목표 만점을 곱합니다.", example: "4.5 만점의 3.8점은 4.3 만점 기준 약 3.63점으로 환산됩니다.", caution: "학교·기관별 환산식, 반올림 방식과 등급 기준이 다를 수 있습니다.", inputs: [{ label: "현재 평점", unit: "점", value: 3.8 }, { label: "현재 기준 만점", unit: "점", value: 4.5 }, { label: "목표 기준 만점", unit: "점", value: 4.3 }] },
  "target-score": { title: "목표 점수 계산기", tag: "STUDY", index: "43", desc: "현재 성적·반영 비율·목표 점수로 남은 평가에서 필요한 점수를 계산합니다.", method: "목표 총점에서 현재 반영 점수를 뺀 뒤 남은 비율로 나눕니다.", example: "현재 80점이 60% 반영되고 목표가 85점이면 남은 40%에서 92.5점이 필요합니다.", caution: "과제·시험별 가중치와 반올림 방식은 수업의 실제 평가계획을 확인하세요.", inputs: [{ label: "현재 평균", unit: "점", value: 80 }, { label: "현재 반영 비율", unit: "%", value: 60, max: 100 }, { label: "목표 점수", unit: "점", value: 85 }] },
  "rank-percent": { title: "등수 백분율 계산기", tag: "STUDY", index: "44", desc: "전체 인원과 등수로 상위 비율과 백분위 참고값을 계산합니다.", method: "등수를 전체 인원으로 나눠 상위 비율을 계산합니다.", example: "100명 중 5등이면 상위 5%로 계산됩니다.", caution: "기관별 백분위 산정식과 동점자 처리 방식은 다를 수 있습니다.", inputs: [{ label: "등수", unit: "등", value: 5 }, { label: "전체 인원", unit: "명", value: 100 }] },
  "labor-cost": { title: "인건비 계산기", tag: "BUSINESS", index: "45", desc: "시급·인원·근무 시간으로 1인당과 총 인건비를 계산합니다.", method: "시급에 인원 수와 근무 시간을 곱합니다.", example: "시급 12,000원, 3명, 8시간을 입력하면 총 288,000원이 계산됩니다.", caution: "주휴수당·4대보험·퇴직충당금·부가세 등 부대비용은 포함하지 않습니다.", inputs: [{ label: "시급", unit: "원", value: 12000 }, { label: "인원 수", unit: "명", value: 3 }, { label: "근무 시간", unit: "시간", value: 8 }] },
  "project-quote": { title: "프로젝트 견적 계산기", tag: "BUSINESS", index: "46", desc: "시간당 단가·예상 시간·추가 비용·마진율로 참고 견적을 계산합니다.", method: "인건비와 추가 비용을 합산한 원가에 마진율을 적용합니다.", example: "시간당 50,000원, 20시간, 추가비 100,000원, 마진 20%를 입력하면 견적이 계산됩니다.", caution: "계약 범위, 세금, 수정 횟수, 라이선스와 지급 조건은 견적서에 별도로 명시하세요.", inputs: [{ label: "시간당 단가", unit: "원", value: 50000 }, { label: "예상 시간", unit: "시간", value: 20 }, { label: "추가 비용", unit: "원", value: 100000 }, { label: "마진율", unit: "%", value: 20 }] },
  "monthly-budget": { title: "월 예산 계산기", tag: "LIFESTYLE", index: "47", desc: "월 예산과 고정·변동 지출로 남은 예산과 사용률을 계산합니다.", method: "고정 지출과 변동 지출을 합산해 예산에서 뺍니다.", example: "예산 2,000,000원, 고정 900,000원, 변동 650,000원을 입력하면 450,000원이 남습니다.", caution: "예상하지 못한 지출과 저축 목표는 별도 항목으로 관리하세요.", inputs: [{ label: "월 예산", unit: "원", value: 2000000 }, { label: "고정 지출", unit: "원", value: 900000 }, { label: "변동 지출", unit: "원", value: 650000 }] },
  "reward-points": { title: "적립금 계산기", tag: "SHOPPING", index: "48", desc: "결제 금액·적립률·사용 적립금으로 실결제액과 적립 예정액을 계산합니다.", method: "사용 적립금을 뺀 실결제액에 적립률을 곱합니다.", example: "50,000원 결제에 2% 적립, 5,000원 사용이면 45,000원 결제와 900점 적립이 계산됩니다.", caution: "적립 제외 상품, 적립 한도와 포인트 사용 조건은 판매처 정책을 확인하세요.", inputs: [{ label: "결제 금액", unit: "원", value: 50000 }, { label: "적립률", unit: "%", value: 2 }, { label: "사용 적립금", unit: "원", value: 5000 }] },
  "return-rate": { title: "수익률 계산기", tag: "BUSINESS", index: "49", desc: "매입·매도 금액과 비용으로 순손익과 수익률을 계산합니다.", method: "매도 금액에서 매입 금액과 비용을 뺀 뒤 총 투자금으로 나눕니다.", example: "매입 100,000원, 매도 130,000원, 비용 5,000원을 입력하면 순손익 25,000원과 수익률이 계산됩니다.", caution: "세금·수수료·슬리피지·기회비용은 입력 비용에 직접 반영해야 하며 투자 판단을 대신하지 않습니다.", inputs: [{ label: "매입 금액", unit: "원", value: 100000 }, { label: "매도 금액", unit: "원", value: 130000 }, { label: "비용", unit: "원", value: 5000 }] },
};

function getResult(kind: Kind, values: number[]): ViewResult {
  if (kind === "unit-price") { const result = calculateUnitPrice(values[0], values[1]); return { main: result.valid ? won.format(result.unitPrice) : "—", unit: result.valid ? "원 / 1개" : "", rows: [["총 금액", `${won.format(result.totalAmount)}원`], ["수량", result.valid ? `${decimal.format(result.quantity)}개` : result.message]] }; }
  if (kind === "fee") { const result = calculateFee(values[0], values[1]); return { main: won.format(result.fee), unit: "원 수수료", rows: [["수수료율", percent(result.feeRate)], ["수수료 제외 금액", `${won.format(result.netAmount)}원`]] }; }
  if (kind === "parking-fee") { const result = calculateParkingFee(values[0], values[1], values[2], values[3], values[4]); return { main: result.valid ? won.format(result.totalFee) : "—", unit: result.valid ? "원" : "", rows: [["추가 적용", result.valid ? `${result.extraBlocks}회` : result.message], ["주차 시간", `${decimal.format(result.durationMinutes)}분`]] }; }
  if (kind === "travel-budget") { const result = calculateTravelBudget(values[0], values[1], values[2], values[3], values[4]); return { main: won.format(result.total), unit: "원 총 경비", rows: [["1인당 경비", `${won.format(result.perPerson)}원`], ["참여 인원", `${result.people}명`]] }; }
  if (kind === "recipe-servings") { const result = calculateRecipeServings(values[0], values[1], values[2]); return { main: result.valid ? decimal.format(result.adjustedAmount) : "—", unit: result.valid ? "g" : "", rows: [["조정 배율", result.valid ? `${decimal.format(result.multiplier)}배` : result.message], ["목표 인분", `${decimal.format(result.targetServings)}인분`]] }; }
  if (kind === "sleep-duration") { const result = calculateSleepDuration(...values as [number, number, number, number]); return { main: result.valid ? minutesToCopy(result.totalMinutes) : "—", unit: result.valid ? "수면" : "", rows: [["자정 경과", result.valid ? (result.crossesMidnight ? "포함" : "없음") : result.message], ["총 분", `${result.totalMinutes}분`]] }; }
  if (kind === "electricity-usage") { const result = calculateElectricityUsage(values[0], values[1], values[2], values[3]); return { main: won.format(result.estimatedCost), unit: "원 예상", rows: [["예상 사용량", `${decimal.format(result.kwh)}kWh`], ["사용 일수", `${decimal.format(result.days)}일`]] }; }
  if (kind === "paint-amount") { const result = calculatePaintAmount(values[0], values[1], values[2], values[3], values[4]); return { main: result.valid ? decimal.format(result.liters) : "—", unit: result.valid ? "L 필요" : "", rows: [["총 도장 면적", `${decimal.format(result.totalArea)}㎡`], ["도포 면적", result.valid ? `${decimal.format(result.coverageSqmPerLiter)}㎡ / L` : result.message]] }; }
  if (kind === "savings-goal") { const result = calculateSavingsGoal(values[0], values[1], values[2]); return { main: result.valid ? String(result.months) : "—", unit: result.valid ? "개월 예상" : "", rows: [["남은 금액", `${won.format(result.remaining)}원`], ["월 저축액", result.valid ? `${won.format(result.monthlySaving)}원` : result.message]] }; }
  if (kind === "simple-interest") { const result = calculateSimpleInterest(values[0], values[1], values[2]); return { main: won.format(result.interest), unit: "원 이자", rows: [["만기 예상액", `${won.format(result.total)}원`], ["기간", `${decimal.format(result.months)}개월`]] }; }
  if (kind === "installment") { const result = calculateInstallment(values[0], values[1], values[2]); return { main: won.format(result.monthlyPayment), unit: "원 / 월", rows: [["예상 총 수수료", `${won.format(result.fee)}원`], ["총 납부액", `${won.format(result.total)}원`]] }; }
  if (kind === "currency-exchange") { const result = calculateCurrencyExchange(values[0], values[1]); return { main: won.format(result.convertedAmount), unit: "원", rows: [["환산 금액", `${decimal.format(result.sourceAmount)} 외화`], ["입력 환율", `${won.format(result.exchangeRate)}원`]] }; }
  if (kind === "gpa-conversion") { const result = calculateGpaConversion(values[0], values[1], values[2]); return { main: result.valid ? decimal.format(result.convertedGpa) : "—", unit: result.valid ? "/ 목표 만점" : "", rows: [["백분율 환산", result.valid ? percent(result.percentage) : result.message], ["현재 평점", `${decimal.format(result.currentGpa)} / ${decimal.format(result.sourceScale)}`]] }; }
  if (kind === "target-score") { const result = calculateTargetScore(values[0], values[1], values[2]); return { main: result.valid ? decimal.format(result.requiredScore) : "—", unit: result.valid ? "점 필요" : "", rows: [["남은 반영 비율", percent(result.remainingRate)], ["현재 반영 비율", result.valid ? percent(result.completedRate) : result.message]] }; }
  if (kind === "rank-percent") { const result = calculateRankPercent(values[0], values[1]); return { main: percent(result.topPercent), unit: "상위", rows: [["백분위 참고", percent(result.percentile)], ["뒤 인원", `${result.peopleBehind}명`]] }; }
  if (kind === "labor-cost") { const result = calculateLaborCost(values[0], values[1], values[2]); return { main: won.format(result.totalCost), unit: "원 총 인건비", rows: [["1인당 인건비", `${won.format(result.perPersonCost)}원`], ["인원 / 시간", `${decimal.format(result.people)}명 / ${decimal.format(result.hours)}시간`]] }; }
  if (kind === "project-quote") { const result = calculateProjectQuote(values[0], values[1], values[2], values[3]); return { main: won.format(result.quote), unit: "원 참고 견적", rows: [["기본 비용", `${won.format(result.baseCost)}원`], ["마진 금액", `${won.format(result.marginAmount)}원`]] }; }
  if (kind === "monthly-budget") { const result = calculateMonthlyBudget(values[0], values[1], values[2]); return { main: won.format(Math.abs(result.remaining)), unit: result.overBudget ? "원 초과" : "원 남음", rows: [["예산 사용률", percent(result.usageRate)], ["총 지출", `${won.format(result.spent)}원`]] }; }
  if (kind === "reward-points") { const result = calculateRewardPoints(values[0], values[1], values[2]); return { main: won.format(result.earnedPoints), unit: "점 적립 예상", rows: [["실결제 예상액", `${won.format(result.cashPayment)}원`], ["사용 적립금", `${won.format(result.usePoints)}원`]] }; }
  const result = calculateReturnRate(values[0], values[1], values[2]);
  return { main: percent(result.returnRate), unit: "수익률", rows: [["순손익", `${won.format(result.profit)}원`], ["총 투자금", `${won.format(result.invested)}원`]] };
}

export default function EverydayCalculators({ kind }: { kind: Kind }) {
  const spec = specs[kind]; const defaults = useMemo(() => spec.inputs.map((input) => input.value), [spec]);
  const [values, setValues] = useState<number[]>(defaults); const [applied, setApplied] = useState<number[]>(defaults);
  useEffect(() => { setValues(defaults); setApplied(defaults); }, [defaults, kind]);
  const result = getResult(kind, applied);
  const updateValue = (index: number, value: number) => setValues((current) => current.map((item, currentIndex) => currentIndex === index ? value : item));
  const reset = () => { setValues(defaults); setApplied(defaults); };
  return <ToolMetaResolver slug={kind}>{tool => <ToolFrame index={spec.index} tag={spec.tag} title={spec.title} description={spec.desc}>
    <SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} />
    <CatalogBreadcrumb toolSlug={tool.slug} />
    <section className="calculator-layout"><div className="calculator-form"><p className="eyebrow">INPUT</p>
      {spec.inputs.map((input, index) => <label key={input.label}>{input.label}<div className="input-suffix"><CommaNumberInput ariaLabel={input.label} value={values[index] ?? 0} onValueChange={(value) => updateValue(index, input.min !== undefined ? Math.max(input.min, input.max !== undefined ? Math.min(input.max, value) : value) : value)} /><span>{input.unit}</span></div></label>)}
      <CalculatorActions onCalculate={() => setApplied([...values])} onReset={reset} />
    </div><div className="calculator-output black-output"><p className="eyebrow">RESULT</p><h2>예상 결과</h2><strong>{result.main}<small>{result.unit}</small></strong><div className="result-rows">{result.rows.map(([label, value]) => <p key={label}><span>{label}</span><b>{value}</b></p>)}</div></div></section>
    <ToolKnowledge tool={tool} method={spec.method} example={spec.example} caution={spec.caution} />
  </ToolFrame>}</ToolMetaResolver>;
}
