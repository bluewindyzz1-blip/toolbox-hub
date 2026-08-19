import { describe, expect, it } from "vitest";
import { calculateCarMaintenance, calculateFamilyLoanInterest, calculateJeonseVsMonthly, calculateRetirementFund, calculateRoas } from "@shared/toolbox";

describe("finance and lifestyle expansion calculators", () => {
  it("compares jeonse and monthly housing costs", () => {
    const result = calculateJeonseVsMonthly(200_000_000, 50_000_000, 800_000, 100_000_000, 4, 3);
    expect(result.valid).toBe(true);
    expect(result.jeonseMonthly).toBeCloseTo(583_333.33, 1);
    expect(result.monthlyMonthly).toBeCloseTo(925_000, 1);
    expect(result.differenceAnnual).toBeGreaterThan(0);
  });

  it("supports family loan repayment methods", () => {
    const interestOnly = calculateFamilyLoanInterest(50_000_000, 36, 4, "interest-only");
    const equalPayment = calculateFamilyLoanInterest(50_000_000, 36, 4, "equal-payment");
    const equalPrincipal = calculateFamilyLoanInterest(50_000_000, 36, 4, "equal-principal");
    expect(interestOnly.totalInterest).toBeCloseTo(6_000_000, 0);
    expect(equalPayment.totalInterest).toBeLessThan(interestOnly.totalInterest);
    expect(equalPrincipal.totalRepayment).toBeCloseTo(50_000_000 + 3_083_333.33, 0);
  });

  it("calculates roas, profit and break-even roas", () => {
    const result = calculateRoas(1_000_000, 4_000_000, 1_200_000, 10, 200_000);
    expect(result.valid).toBe(true);
    expect(result.roas).toBeCloseTo(400, 5);
    expect(result.profitAfterAds).toBeCloseTo(1_200_000, 0);
    expect(result.breakEvenRoas).toBeGreaterThan(100);
  });

  it("calculates car maintenance cost", () => {
    const result = calculateCarMaintenance(30_000_000, 15_000, 12, 1_700, 300_000, 1_000_000, 800_000, 500_000);
    expect(result.valid).toBe(true);
    expect(result.annualFuel).toBeCloseTo(2_125_000, 0);
    expect(result.annualTotal).toBeCloseTo(4_725_000, 0);
    expect(result.fiveYearTotal).toBeCloseTo(53_625_000, 0);
  });

  it("estimates retirement funding and validates impossible ages", () => {
    const result = calculateRetirementFund(40, 60, 90, 100_000_000, 3_000_000, 1_000_000, 4, 2);
    expect(result.valid).toBe(true);
    expect(result.requiredAssets).toBeGreaterThan(0);
    expect(result.additionalMonthlySaving).toBeGreaterThanOrEqual(0);
    expect(calculateRetirementFund(60, 40, 90, 0, 3_000_000, 0, 4, 2).valid).toBe(false);
  });
});
