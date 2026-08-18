import { describe, expect, it } from "vitest";
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
} from "../shared/toolbox";

describe("추가 생활·업무 계산기", () => {
  it("단가·수수료를 계산하고 0 수량을 막는다", () => {
    expect(calculateUnitPrice(18_000, 12)).toMatchObject({ unitPrice: 1_500, valid: true });
    expect(calculateUnitPrice(18_000, 0).valid).toBe(false);
    expect(calculateFee(100_000, 3.3)).toMatchObject({ fee: 3_300, netAmount: 96_700 });
  });

  it("주차비·여행 경비·레시피 재료량을 계산한다", () => {
    expect(calculateParkingFee(150, 60, 3_000, 30, 1_000)).toMatchObject({ extraBlocks: 3, totalFee: 6_000, valid: true });
    expect(calculateTravelBudget(180_000, 240_000, 120_000, 60_000, 3)).toMatchObject({ total: 600_000, perPerson: 200_000 });
    expect(calculateRecipeServings(2, 5, 200)).toMatchObject({ multiplier: 2.5, adjustedAmount: 500, valid: true });
  });

  it("자정 경과 수면 시간과 전력·페인트 사용량을 계산한다", () => {
    expect(calculateSleepDuration(23, 30, 7, 10)).toMatchObject({ totalMinutes: 460, hours: 7, minutes: 40, crossesMidnight: true, valid: true });
    expect(calculateElectricityUsage(1_000, 2, 30, 150)).toMatchObject({ kwh: 60, estimatedCost: 9_000 });
    expect(calculatePaintAmount(4, 2.5, 2, 2, 10)).toMatchObject({ totalArea: 40, liters: 4, valid: true });
  });

  it("목표 저축·단리·카드 할부를 계산한다", () => {
    expect(calculateSavingsGoal(3_000_000, 600_000, 200_000)).toMatchObject({ remaining: 2_400_000, months: 12, valid: true });
    expect(calculateSimpleInterest(1_000_000, 3, 12)).toMatchObject({ interest: 30_000, total: 1_030_000 });
    expect(calculateInstallment(300_000, 6, 0.5)).toMatchObject({ fee: 9_000, total: 309_000, monthlyPayment: 51_500 });
  });

  it("환율·학점·목표 점수·등수 비율을 계산한다", () => {
    expect(calculateCurrencyExchange(100, 1_350).convertedAmount).toBe(135_000);
    expect(calculateGpaConversion(3.8, 4.5, 4.3).convertedGpa).toBeCloseTo(3.6311, 3);
    expect(calculateTargetScore(80, 60, 85).requiredScore).toBeCloseTo(92.5);
    expect(calculateRankPercent(5, 100)).toMatchObject({ topPercent: 5, percentile: 95, peopleBehind: 95 });
  });

  it("업무 견적·예산·적립·수익률을 계산한다", () => {
    expect(calculateLaborCost(12_000, 3, 8)).toMatchObject({ perPersonCost: 96_000, totalCost: 288_000 });
    expect(calculateProjectQuote(50_000, 20, 100_000, 20)).toMatchObject({ baseCost: 1_100_000, marginAmount: 220_000, quote: 1_320_000 });
    expect(calculateMonthlyBudget(2_000_000, 900_000, 650_000)).toMatchObject({ remaining: 450_000, usageRate: 77.5, overBudget: false });
    expect(calculateRewardPoints(50_000, 2, 5_000)).toMatchObject({ cashPayment: 45_000, earnedPoints: 900 });
    expect(calculateReturnRate(100_000, 130_000, 5_000)).toMatchObject({ invested: 105_000, profit: 25_000 });
    expect(calculateReturnRate(100_000, 130_000, 5_000).returnRate).toBeCloseTo(23.8095, 3);
  });
});
