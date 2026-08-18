import { describe, expect, it } from "vitest";
import {
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
} from "../shared/toolbox";

describe("생활·업무 계산기", () => {
  it("할인 금액과 최종 가격을 계산한다", () => {
    expect(calculateDiscount(50_000, 20)).toMatchObject({ discount: 10_000, finalPrice: 40_000 });
  });

  it("마진율과 마크업률을 구분한다", () => {
    const result = calculateMargin(30_000, 18_000);
    expect(result.profit).toBe(12_000);
    expect(result.marginRate).toBeCloseTo(40);
    expect(result.markupRate).toBeCloseTo(66.6667, 3);
  });

  it("손익분기 수량은 올림 처리하고, 음수 공헌이익은 막는다", () => {
    expect(calculateBreakEven(1_000_000, 20_000, 8_000)).toMatchObject({ valid: true, units: 84, revenueAtBreakEven: 1_680_000 });
    expect(calculateBreakEven(1_000_000, 8_000, 8_000).valid).toBe(false);
  });

  it("거리·연비·유가로 주유비를 계산한다", () => {
    const result = calculateFuelCost(300, 12, 1_700);
    expect(result.liters).toBeCloseTo(25);
    expect(result.cost).toBeCloseTo(42_500);
  });

  it("더치페이에 팁과 인원을 반영한다", () => {
    expect(calculateSplitBill(96_000, 4, 10)).toMatchObject({ tip: 9_600, grandTotal: 105_600, perPerson: 26_400 });
  });

  it("평균·최솟값·최댓값을 계산한다", () => {
    expect(calculateAverage([80, 90, 100])).toMatchObject({ count: 3, sum: 270, average: 90, minimum: 80, maximum: 100 });
  });

  it("BMI와 BMR을 입력값 기반 참고 지표로 계산한다", () => {
    expect(calculateBmi(65, 170).bmi).toBeCloseTo(22.4913, 3);
    expect(calculateBmi(65, 0).valid).toBe(false);
    expect(calculateBmr("male", 30, 70, 175).bmr).toBeCloseTo(1648.75);
  });

  it("운동 종류별 MET를 적용한 칼로리 추정값을 계산한다", () => {
    expect(calculateCaloriesBurned("walking", 65, 60).calories).toBeCloseTo(238.875);
    expect(calculateCaloriesBurned("jogging", 65, 60).calories).toBeGreaterThan(calculateCaloriesBurned("walking", 65, 60).calories);
  });

  it("학점과 평점으로 가중 GPA를 계산한다", () => {
    const result = calculateGpa([{ credits: 3, gradePoint: 4.5 }, { credits: 3, gradePoint: 4 }, { credits: 2, gradePoint: 3.5 }]);
    expect(result.totalCredits).toBe(8);
    expect(result.gpa).toBeCloseTo(4.0625);
  });
});
