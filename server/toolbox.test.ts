import { describe, expect, it } from "vitest";
import { calculateAcquisitionTax, calculateAge, calculateAnnualLeavePay, calculateAnnualNet, calculateBrokerageFee, calculateCapitalGainsTax, calculateComprehensiveIncomeTax, calculateCompoundInterest, calculateDateDifference, calculateDateOperation, calculateDDay, calculateDeposit, calculateEarlyRepaymentFee, calculateFourInsurance, calculateGiftTax, calculateHealthInsurance, calculateHourlyWage, calculateInheritanceTax, calculateJeonseLoanInterest, calculateLoan, calculateMinimumWageMonthly, calculateNationalPensionEstimate, calculatePayrollTakeHome, calculatePercentage, calculatePropertyTax, calculatePyeong, calculateRent, calculateRentConversion, calculateRetirementIncomeTax, calculateRetirementPay, calculateSavings, calculateServicePeriod, calculateTimeOperation, calculateUnemploymentBenefit, calculateVat, calculateWeeklyHolidayPay, calculateWorkHours, calculateYearEndRefund, convertUnit } from "../shared/toolbox";
import { defaultCatalog, getToolPath } from "../shared/catalog";

describe("실용 계산기 로직", () => {
  it("공급가액에서 부가세 포함 금액을 계산한다", () => {
    expect(calculateVat(1_000_000, "supply")).toEqual({ supply: 1_000_000, vat: 100_000, total: 1_100_000 });
  });

  it("보증금의 월 환산액을 실질 월세에 반영한다", () => {
    const result = calculateRent(100_000_000, 700_000, 5.5);
    expect(result.monthlyDepositCost).toBeCloseTo(458_333.333, 2);
    expect(result.monthlyEquivalent).toBeCloseTo(1_158_333.333, 2);
  });

  it("대출 원리금균등 상환 결과에 월별 스케줄을 생성한다", () => {
    const result = calculateLoan(12_000_000, 6, 12, "annuity");
    expect(result.schedule).toHaveLength(12);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.schedule.at(-1)?.balance).toBeCloseTo(0, 4);
  });

  it("온도와 길이 단위를 변환한다", () => {
    expect(convertUnit(1, "length", "m", "cm")).toBe(100);
    expect(convertUnit(32, "temperature", "f", "c")).toBeCloseTo(0);
  });

  it("연봉 실수령액을 사회보험·세금 공제액을 반영해 추정한다", () => {
    const result = calculateAnnualNet(50_000_000, 1);
    expect(result.monthlyGross).toBeCloseTo(4_166_666.667, 2);
    expect(result.monthlyNet).toBeGreaterThan(0);
    expect(result.monthlyNet).toBeLessThan(result.monthlyGross);
  });

  it("제곱미터와 평을 양방향 변환한다", () => {
    expect(calculatePyeong(84, "sqm").pyeong).toBeCloseTo(25.41, 2);
    expect(calculatePyeong(10, "pyeong").sqm).toBeCloseTo(33.05785, 4);
  });

  it("최근 3개월 임금과 근속연수로 퇴직금을 추정한다", () => {
    const result = calculateRetirementPay(9_000_000, 90, 3);
    expect(result.dailyAverageWage).toBe(100_000);
    expect(result.retirementPay).toBe(9_000_000);
  });

  it("기존 도구와 신규 도구가 카테고리 데이터에서 독립 URL을 계산한다", () => {
    const annualNet = defaultCatalog.tools.find((tool) => tool.slug === "annual-net");
    const monthlyRent = defaultCatalog.tools.find((tool) => tool.slug === "monthly-rent");
    expect(annualNet && getToolPath(annualNet, defaultCatalog.categories)).toBe("/calculator/salary/annual-net");
    expect(monthlyRent && getToolPath(monthlyRent, defaultCatalog.categories)).toBe("/calculator/real-estate/monthly-rent");
  });

  it("전월세·예금·적금 계산 결과를 생성한다", () => {
    expect(calculateRentConversion(100_000_000, 700_000, 5.5).monthlyEquivalent).toBeCloseTo(1_158_333.33, 1);
    expect(calculateDeposit(10_000_000, 3.5, 12).total).toBe(10_350_000);
    expect(calculateSavings(500_000, 3.5, 12).total).toBeGreaterThan(6_000_000);
  });

  it("전세대출 이자와 주택담보대출 원리금균등 상환을 계산한다", () => {
    const jeonse = calculateJeonseLoanInterest(150_000_000, 3.5, 24);
    const mortgage = calculateLoan(300_000_000, 4, 360, "annuity");
    expect(jeonse.monthlyInterest).toBeCloseTo(437_500);
    expect(jeonse.totalInterest).toBeCloseTo(10_500_000);
    expect(mortgage.schedule).toHaveLength(360);
    expect(mortgage.schedule.at(-1)?.balance).toBeCloseTo(0, 4);
    expect(mortgage.totalPayment).toBeGreaterThan(300_000_000);
  });

  it("중도상환수수료와 서울시 주택 중개보수 상한액을 계산한다", () => {
    const fee = calculateEarlyRepaymentFee(100_000_000, 1.2, 180);
    const brokerage = calculateBrokerageFee("sale", 600_000_000);
    expect(fee.fee).toBeCloseTo(591_780.82, 2);
    expect(fee.chargeableDays).toBe(180);
    expect(brokerage.rate).toBe(0.004);
    expect(brokerage.fee).toBe(2_400_000);
    expect(calculateBrokerageFee("lease", 40_000_000).fee).toBe(200_000);
  });

  it("일반 주택 취득세와 주택 재산세 본세를 계산한다", () => {
    expect(calculateAcquisitionTax(500_000_000, 1, false).acquisitionTax).toBe(5_000_000);
    expect(calculateAcquisitionTax(700_000_000, 1, false).rate).toBeCloseTo(0.0166667, 5);
    const property = calculatePropertyTax(500_000_000);
    expect(property.taxBase).toBe(300_000_000);
    expect(property.propertyTax).toBe(570_000);
  });

  it("복리·원금균등·만기일시·퍼센트 계산을 수행한다", () => {
    const compound = calculateCompoundInterest(10_000_000, 5, 10);
    const principal = calculateLoan(120_000_000, 6, 12, "principal");
    const bullet = calculateLoan(120_000_000, 6, 12, "bullet");
    expect(compound.total).toBeCloseTo(16_288_946.27, 2);
    expect(principal.schedule[0].payment).toBeGreaterThan(principal.schedule.at(-1)?.payment ?? 0);
    expect(principal.schedule.at(-1)?.balance).toBeCloseTo(0, 4);
    expect(bullet.schedule[0].principal).toBe(0);
    expect(bullet.schedule.at(-1)?.principal).toBe(120_000_000);
    expect(calculatePercentage(1_000_000, 15, "of").result).toBe(150_000);
    expect(calculatePercentage(800_000, 1_000_000, "change").result).toBe(25);
  });

  it("새 계산기는 빈 값·0·음수·소수·큰 수 입력을 안전하게 처리한다", () => {
    expect(calculateJeonseLoanInterest(Number.NaN, -3.5, 0).totalInterest).toBe(0);
    expect(calculateEarlyRepaymentFee(-1, -1, -1).fee).toBe(0);
    expect(calculateBrokerageFee("sale", -1).fee).toBe(0);
    expect(calculateAcquisitionTax(-1, 1, false).acquisitionTax).toBe(0);
    expect(calculatePropertyTax(-1).propertyTax).toBe(0);
    expect(calculateCompoundInterest(1_000.5, 3.25, 2.5).total).toBeGreaterThan(1_000.5);
    expect(calculateLoan(1_000_000_000_000, 0.1, 1, "principal").totalPayment).toBeGreaterThan(1_000_000_000_000);
    expect(calculatePercentage(-100, -20, "increase").result).toBe(0);
  });

  it("신규 도구의 독립 URL을 상위 부동산·금융 카테고리에 유지한다", () => {
    const mortgage = defaultCatalog.tools.find((tool) => tool.slug === "mortgage");
    const acquisitionTax = defaultCatalog.tools.find((tool) => tool.slug === "acquisition-tax");
    const compound = defaultCatalog.tools.find((tool) => tool.slug === "compound-interest");
    expect(mortgage && getToolPath(mortgage, defaultCatalog.categories)).toBe("/calculator/real-estate/mortgage");
    expect(acquisitionTax && getToolPath(acquisitionTax, defaultCatalog.categories)).toBe("/calculator/real-estate/acquisition-tax");
    expect(compound && getToolPath(compound, defaultCatalog.categories)).toBe("/calculator/finance/compound-interest");
  });

  it("연봉·월급 실수령액은 2026년 보험료 가정과 간이 세금 공제를 반영한다", () => {
    const annual = calculatePayrollTakeHome(50_000_000 / 12, 1, 0, 200_000);
    const monthly = calculatePayrollTakeHome(3_500_000, 1, 0, 200_000);
    expect(annual.monthlyNet).toBeGreaterThan(0);
    expect(annual.monthlyNet).toBeLessThan(annual.monthlyGross);
    expect(annual.pension).toBeGreaterThan(0);
    expect(monthly.monthlyNet).toBeLessThan(3_500_000);
    expect(monthly.health).toBeGreaterThan(0);
  });

  it("기존 퇴직금과 퇴직소득세 계산 결과를 생성하고 날짜 근속기간을 검증한다", () => {
    const retirement = calculateRetirementPay(9_000_000, 90, 3);
    const tax = calculateRetirementIncomeTax(50_000_000, 8);
    const period = calculateServicePeriod("2024-01-01", "2025-01-01");
    expect(retirement.retirementPay).toBe(9_000_000);
    expect(tax.totalTax).toBeGreaterThan(0);
    expect(tax.estimatedNet).toBeLessThan(50_000_000);
    expect(period.valid).toBe(true);
    expect(period.days).toBe(366);
    expect(calculateServicePeriod("2025-01-02", "2025-01-01").valid).toBe(false);
    expect(calculateServicePeriod("invalid", "2025-01-01").valid).toBe(false);
  });

  it("주휴수당과 연차수당을 근로시간·통상시급으로 계산한다", () => {
    const weekly = calculateWeeklyHolidayPay(10_320, 20, 5, true);
    const leave = calculateAnnualLeavePay(15_000, 8, 5);
    expect(weekly.holidayPay).toBe(41_280);
    expect(weekly.weeklyPay).toBe(247_680);
    expect(calculateWeeklyHolidayPay(10_320, 14, 5, true).holidayPay).toBe(0);
    expect(leave.dailyOrdinaryWage).toBe(120_000);
    expect(leave.annualLeavePay).toBe(600_000);
  });

  it("시급 환산과 자정 경과 근무시간을 계산한다", () => {
    const hourly = calculateHourlyWage("from-monthly", 2_500_000, 209);
    const night = calculateWorkHours("22:00", "06:00", 60);
    expect(hourly.hourlyWage).toBeCloseTo(11_961.72, 2);
    expect(calculateHourlyWage("from-hourly", 12_000, 209).monthlyWage).toBe(2_508_000);
    expect(night.valid).toBe(true);
    expect(night.crossesMidnight).toBe(true);
    expect(night.totalMinutes).toBe(480);
    expect(night.workMinutes).toBe(420);
    expect(calculateWorkHours("09:00", "18:00", 600).valid).toBe(false);
    expect(calculateWorkHours("bad", "18:00", 60).valid).toBe(false);
  });

  it("4대보험과 실업급여의 근로자 기본 부담·가입기간별 추정 결과를 계산한다", () => {
    const insurance = calculateFourInsurance(3_500_000);
    const benefit = calculateUnemploymentBenefit(3_000_000, 35, 24);
    expect(insurance.pensionEmployee).toBe(166_250);
    expect(insurance.healthEmployee).toBeCloseTo(125_825, 2);
    expect(insurance.employeeTotal).toBeGreaterThan(0);
    expect(benefit.eligibleByMonths).toBe(true);
    expect(benefit.payableDays).toBe(150);
    expect(benefit.dailyBenefit).toBeGreaterThan(0);
    expect(calculateUnemploymentBenefit(-1, -1, 0).totalBenefit).toBe(0);
  });

  it("직장인·급여 계산기 10종은 기존 salary URL 규칙을 유지한다", () => {
    const expectedSlugs = ["annual-take-home", "monthly-take-home", "retirement-pay", "retirement-income-tax", "weekly-holiday-pay", "annual-leave-pay", "hourly-wage", "work-hours", "four-insurance", "unemployment-benefit"];
    for (const slug of expectedSlugs) {
      const tool = defaultCatalog.tools.find((item) => item.slug === slug);
      expect(tool && getToolPath(tool, defaultCatalog.categories)).toBe(`/calculator/salary/${slug}`);
    }
  });

  it("급여 계산기는 빈값·0·음수·큰 수·소수를 안전하게 정규화한다", () => {
    expect(calculatePayrollTakeHome(Number.NaN, -1, -1, -1).monthlyNet).toBe(0);
    expect(calculateAnnualLeavePay(-1, -8, -1).annualLeavePay).toBe(0);
    expect(calculateHourlyWage("from-monthly", 1_000_000_000_000, 0.5).hourlyWage).toBeGreaterThan(0);
    expect(calculateWorkHours("00:00", "00:00", 0).workMinutes).toBe(1_440);
    expect(calculateRetirementIncomeTax(-1, 0).estimatedNet).toBe(0);
  });
});


describe("4·5차 확장 계산기 로직", () => {
  it("종합소득세·연말정산의 세액과 환급·추가납부를 계산한다", () => {
    const income = calculateComprehensiveIncomeTax(60_000_000, 20_000_000, 5_000_000, 0, 0);
    const yearEnd = calculateYearEndRefund(50_000_000, 2_400_000, 1, 3_000_000, 500_000, 2_000_000, 200_000);
    expect(income.taxableIncome).toBe(35_000_000);
    expect(income.totalTax).toBeGreaterThan(0);
    expect(yearEnd.finalTax).toBeGreaterThan(0);
    expect(yearEnd.refund + yearEnd.additionalPayment).toBeGreaterThanOrEqual(0);
  });

  it("양도·증여·상속세 간이 계산의 공제와 누진세액을 생성한다", () => {
    const capital = calculateCapitalGainsTax(700_000_000, 500_000_000, 20_000_000, "2021-01-01", "2025-01-01");
    const gift = calculateGiftTax(100_000_000, 0, "ascendant", false, 0);
    const inheritance = calculateInheritanceTax(1_000_000_000, 50_000_000, 500_000_000, 0);
    expect(capital.valid).toBe(true);
    expect(capital.gain).toBe(180_000_000);
    expect(capital.totalTax).toBeGreaterThan(0);
    expect(gift.allowance).toBe(50_000_000);
    expect(gift.estimatedPayment).toBeGreaterThan(0);
    expect(inheritance.taxBase).toBe(450_000_000);
    expect(inheritance.estimatedPayment).toBeGreaterThan(0);
    expect(calculateCapitalGainsTax(1, 1, 1, "bad", "2025-01-01").valid).toBe(false);
  });

  it("국민연금·건강보험·최저임금의 기준별 결과를 계산한다", () => {
    const pension = calculateNationalPensionEstimate(3_500_000, 120, 240);
    const workplace = calculateHealthInsurance("workplace", 3_500_000);
    const regional = calculateHealthInsurance("regional", 3_500_000, 100);
    const minimum = calculateMinimumWageMonthly(10_320, 8, 5, true);
    expect(pension.eligible).toBe(true);
    expect(pension.estimatedMonthlyPension).toBeGreaterThan(0);
    expect(workplace.totalContribution).toBeGreaterThan(0);
    expect(regional.totalContribution).toBeGreaterThan(workplace.totalContribution);
    expect(minimum.meetsMinimum).toBe(true);
    expect(minimum.weeklyHoliday).toBe(82_560);
    expect(calculateMinimumWageMonthly(-1, -1, -1, true).estimatedMonthlyPay).toBe(0);
  });

  it("날짜·시간 계산이 윤년, 월말, 자정 경과를 정확하게 처리한다", () => {
    const date = calculateDateOperation("2024-01-31", 0, 1, 0, "add");
    const dday = calculateDDay("2024-02-28", "2024-03-01");
    const age = calculateAge("2000-02-29", "2025-02-28");
    const difference = calculateDateDifference("2024-02-28", "2024-03-01", true);
    const time = calculateTimeOperation("23:30", 2, 45, "add");
    expect(date.resultDate).toBe("2024-02-29");
    expect(dday.days).toBe(2);
    expect(age.fullAge).toBe(25);
    expect(difference.selectedDays).toBe(3);
    expect(time.resultTime).toBe("02:15");
    expect(time.dayOffset).toBe(1);
    expect(calculateDateDifference("2025-01-02", "2025-01-01").valid).toBe(false);
    expect(calculateTimeOperation("25:00", 1, 0, "add").valid).toBe(false);
  });

  it("4·5차 신규 도구가 기존 URL 생성 규칙에 따라 등록된다", () => {
    const expected = [
      ["comprehensive-income-tax", "/calculator/tax/comprehensive-income-tax"],
      ["capital-gains-tax", "/calculator/tax/capital-gains-tax"],
      ["national-pension", "/calculator/lifestyle/national-pension"],
      ["minimum-wage", "/calculator/salary/minimum-wage"],
      ["date-calculator", "/calculator/date/date-calculator"],
      ["d-day", "/calculator/date/d-day"],
      ["age", "/calculator/date/age"],
      ["man-age", "/calculator/date/man-age"],
      ["date-difference", "/calculator/date/date-difference"],
      ["time-calculator", "/calculator/date/time-calculator"],
    ];
    for (const [slug, path] of expected) {
      const tool = defaultCatalog.tools.find((item) => item.slug === slug);
      expect(tool && getToolPath(tool, defaultCatalog.categories)).toBe(path);
    }
  });

  it("부피·온도·평수 단위 변환과 큰 수 입력을 안전하게 처리한다", () => {
    expect(convertUnit(1, "volume", "l", "ml")).toBe(1000);
    expect(convertUnit(1, "volume", "gal_us", "l")).toBeCloseTo(3.785411784, 6);
    expect(convertUnit(212, "temperature", "f", "c")).toBeCloseTo(100);
    expect(calculateNationalPensionEstimate(1_000_000_000_000, 0, 120).estimatedMonthlyPension).toBeGreaterThan(0);
  });
});
