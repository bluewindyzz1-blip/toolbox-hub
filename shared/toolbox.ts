export type LoanMethod = "annuity" | "principal" | "bullet";

export type LoanScheduleItem = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export function calculateVat(value: number, mode: "supply" | "total") {
  const normalized = Math.max(0, Number.isFinite(value) ? value : 0);
  if (mode === "supply") {
    const vat = normalized * 0.1;
    return { supply: normalized, vat, total: normalized + vat };
  }
  const supply = normalized / 1.1;
  return { supply, vat: normalized - supply, total: normalized };
}

export function calculateRent(deposit: number, monthlyRent: number, conversionRate: number) {
  const safeDeposit = Math.max(0, Number.isFinite(deposit) ? deposit : 0);
  const safeMonthlyRent = Math.max(0, Number.isFinite(monthlyRent) ? monthlyRent : 0);
  const rate = Math.max(0, Number.isFinite(conversionRate) ? conversionRate : 0) / 100;
  const monthlyDepositCost = (safeDeposit * rate) / 12;

  return {
    monthlyDepositCost,
    monthlyEquivalent: safeMonthlyRent + monthlyDepositCost,
    yearlyCashOutflow: safeMonthlyRent * 12,
    equivalentDeposit: rate > 0 ? safeDeposit + (safeMonthlyRent * 12) / rate : safeDeposit,
  };
}

export function calculateLoan(amount: number, annualRate: number, months: number, method: LoanMethod) {
  const principalAmount = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const period = Math.max(1, Math.round(Number.isFinite(months) ? months : 1));
  const monthlyRate = Math.max(0, Number.isFinite(annualRate) ? annualRate : 0) / 100 / 12;
  const schedule: LoanScheduleItem[] = [];
  let balance = principalAmount;

  const annuityPayment = monthlyRate === 0
    ? principalAmount / period
    : (principalAmount * monthlyRate * (1 + monthlyRate) ** period) / ((1 + monthlyRate) ** period - 1);
  const fixedPrincipal = principalAmount / period;

  for (let month = 1; month <= period; month += 1) {
    const interest = balance * monthlyRate;
    const principal = method === "annuity"
      ? Math.min(balance, annuityPayment - interest)
      : method === "bullet"
        ? (month === period ? balance : 0)
        : Math.min(balance, fixedPrincipal);
    const payment = principal + interest;
    balance = Math.max(0, balance - principal);
    schedule.push({ month, payment, principal, interest, balance });
  }

  const totalPayment = schedule.reduce((sum, item) => sum + item.payment, 0);
  const totalInterest = schedule.reduce((sum, item) => sum + item.interest, 0);
  return { schedule, totalPayment, totalInterest, firstPayment: schedule[0]?.payment ?? 0 };
}

type UnitDefinition = { label: string; factor: number; offset?: number };

export const unitDefinitions: Record<string, Record<string, UnitDefinition>> = {
  length: {
    mm: { label: "밀리미터 (mm)", factor: 0.001 },
    cm: { label: "센티미터 (cm)", factor: 0.01 },
    m: { label: "미터 (m)", factor: 1 },
    km: { label: "킬로미터 (km)", factor: 1000 },
    in: { label: "인치 (in)", factor: 0.0254 },
    ft: { label: "피트 (ft)", factor: 0.3048 },
  },
  weight: {
    g: { label: "그램 (g)", factor: 0.001 },
    kg: { label: "킬로그램 (kg)", factor: 1 },
    t: { label: "톤 (t)", factor: 1000 },
    lb: { label: "파운드 (lb)", factor: 0.45359237 },
    oz: { label: "온스 (oz)", factor: 0.028349523125 },
  },
  area: {
    sqm: { label: "제곱미터 (㎡)", factor: 1 },
    pyeong: { label: "평 (평)", factor: 3.305785 },
    sqft: { label: "제곱피트 (ft²)", factor: 0.092903 },
    hectare: { label: "헥타르 (ha)", factor: 10000 },
  },
  temperature: {
    c: { label: "섭씨 (°C)", factor: 1 },
    f: { label: "화씨 (°F)", factor: 1 },
    k: { label: "켈빈 (K)", factor: 1 },
  },
  volume: {
    ml: { label: "밀리리터 (mL)", factor: 0.001 },
    l: { label: "리터 (L)", factor: 1 },
    cup: { label: "컵 (cup)", factor: 0.236588 },
    gallon: { label: "갤런 (gal)", factor: 3.78541 },
    m3: { label: "세제곱미터 (m³)", factor: 1000 },
  },
  speed: {
    ms: { label: "미터/초 (m/s)", factor: 1 },
    kmh: { label: "킬로미터/시 (km/h)", factor: 0.2777777778 },
    mph: { label: "마일/시 (mph)", factor: 0.44704 },
    knot: { label: "노트 (kn)", factor: 0.5144444444 },
  },
  data: {
    byte: { label: "바이트 (B)", factor: 1 },
    kb: { label: "킬로바이트 (KB)", factor: 1024 },
    mb: { label: "메가바이트 (MB)", factor: 1024 ** 2 },
    gb: { label: "기가바이트 (GB)", factor: 1024 ** 3 },
    tb: { label: "테라바이트 (TB)", factor: 1024 ** 4 },
  },
};

export function convertUnit(value: number, category: string, from: string, to: string) {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (category === "temperature") {
    const celsius = from === "f" ? (safeValue - 32) * (5 / 9) : from === "k" ? safeValue - 273.15 : safeValue;
    return to === "f" ? celsius * (9 / 5) + 32 : to === "k" ? celsius + 273.15 : celsius;
  }
  const definition = unitDefinitions[category];
  if (!definition?.[from] || !definition[to]) return 0;
  return (safeValue * definition[from].factor) / definition[to].factor;
}

export function calculateAnnualNet(annualSalary: number, dependents: number) {
  const salary = Math.max(0, Number.isFinite(annualSalary) ? annualSalary : 0);
  const people = Math.max(0, Math.floor(Number.isFinite(dependents) ? dependents : 0));
  const monthlyGross = salary / 12;
  const pension = Math.min(monthlyGross, 6_170_000) * 0.045;
  const health = monthlyGross * 0.03545;
  const longTermCare = health * 0.1295;
  const employment = monthlyGross * 0.009;
  const estimatedIncomeTax = Math.max(0, monthlyGross * (salary <= 50_000_000 ? 0.028 : 0.055) - people * 15_000);
  const localIncomeTax = estimatedIncomeTax * 0.1;
  const totalMonthlyDeductions = pension + health + longTermCare + employment + estimatedIncomeTax + localIncomeTax;
  return { monthlyGross, pension, health, longTermCare, employment, estimatedIncomeTax, localIncomeTax, totalMonthlyDeductions, monthlyNet: Math.max(0, monthlyGross - totalMonthlyDeductions), annualNet: Math.max(0, salary - totalMonthlyDeductions * 12) };
}

export function calculatePyeong(value: number, mode: "sqm" | "pyeong") {
  const normalized = Math.max(0, Number.isFinite(value) ? value : 0);
  return mode === "sqm" ? { sqm: normalized, pyeong: normalized / 3.305785 } : { sqm: normalized * 3.305785, pyeong: normalized };
}

export function calculateRetirementPay(threeMonthWages: number, workingDays: number, years: number) {
  const wages = Math.max(0, Number.isFinite(threeMonthWages) ? threeMonthWages : 0);
  const days = Math.max(1, Math.floor(Number.isFinite(workingDays) ? workingDays : 1));
  const serviceYears = Math.max(0, Number.isFinite(years) ? years : 0);
  const dailyAverageWage = wages / days;
  const retirementPay = dailyAverageWage * 30 * serviceYears;
  return { dailyAverageWage, retirementPay };
}

export function calculateRentConversion(deposit: number, monthlyRent: number, annualRate: number) { const rate=Math.max(0,annualRate)/100; const monthlyEquivalent=(Math.max(0,deposit)*rate/12)+Math.max(0,monthlyRent); return { monthlyEquivalent, jeonseEquivalent: rate>0?deposit+(monthlyRent*12)/rate:deposit }; }
export function calculateDeposit(principal:number, annualRate:number, months:number) { const interest=Math.max(0,principal)*Math.max(0,annualRate)/100*Math.max(1,months)/12; return { interest, total: Math.max(0,principal)+interest }; }
export function calculateSavings(monthly:number, annualRate:number, months:number) { const amount=Math.max(0,monthly), n=Math.max(1,Math.floor(months)), r=Math.max(0,annualRate)/100/12; const principal=amount*n; const interest=r===0?0:amount*r*((n*(n+1))/2); return { principal, interest, total:principal+interest }; }

function nonNegative(value: number) { return Math.max(0, Number.isFinite(value) ? value : 0); }

export function calculateJeonseLoanInterest(amount: number, annualRate: number, months: number) {
  const principal = nonNegative(amount);
  const period = Math.max(1, Math.floor(nonNegative(months)));
  const rate = nonNegative(annualRate) / 100;
  const monthlyInterest = principal * rate / 12;
  return { principal, monthlyInterest, totalInterest: monthlyInterest * period, totalPayment: principal + monthlyInterest * period, months: period };
}

export function calculateEarlyRepaymentFee(remainingPrincipal: number, feeRate: number, remainingDays: number, graceDays = 0) {
  const principal = nonNegative(remainingPrincipal);
  const rate = nonNegative(feeRate) / 100;
  const days = Math.max(0, Math.floor(nonNegative(remainingDays)));
  const grace = Math.max(0, Math.floor(nonNegative(graceDays)));
  const chargeableDays = Math.max(0, days - grace);
  const fee = principal * rate * chargeableDays / 365;
  return { remainingPrincipal: principal, feeRate: rate, remainingDays: days, chargeableDays, fee };
}

export type BrokerageTransaction = "sale" | "lease";
export function calculateBrokerageFee(transaction: BrokerageTransaction, amount: number) {
  const transactionAmount = nonNegative(amount);
  const table = transaction === "sale"
    ? [
        { max: 50_000_000, rate: 0.006, cap: 250_000 },
        { max: 200_000_000, rate: 0.005, cap: 800_000 },
        { max: 900_000_000, rate: 0.004, cap: null },
        { max: 1_200_000_000, rate: 0.005, cap: null },
        { max: 1_500_000_000, rate: 0.006, cap: null },
        { max: Infinity, rate: 0.007, cap: null },
      ]
    : [
        { max: 50_000_000, rate: 0.005, cap: 200_000 },
        { max: 100_000_000, rate: 0.004, cap: 300_000 },
        { max: 600_000_000, rate: 0.003, cap: null },
        { max: 1_200_000_000, rate: 0.004, cap: null },
        { max: 1_500_000_000, rate: 0.005, cap: null },
        { max: Infinity, rate: 0.006, cap: null },
      ];
  const bracket = table.find((item) => transactionAmount < item.max) ?? table[table.length - 1];
  const beforeCap = transactionAmount * bracket.rate;
  return { transactionAmount, rate: bracket.rate, cap: bracket.cap, fee: bracket.cap === null ? beforeCap : Math.min(beforeCap, bracket.cap), beforeCap };
}

export type AcquisitionHomeCount = 1 | 2 | 3 | 4;
export function calculateAcquisitionTax(price: number, homeCount: AcquisitionHomeCount = 1, regulatedArea = false) {
  const acquisitionPrice = nonNegative(price);
  let rate: number;
  if (homeCount === 1) {
    rate = acquisitionPrice <= 600_000_000 ? 0.01 : acquisitionPrice < 900_000_000 ? (acquisitionPrice / 100_000_000 * 2 / 3 - 3) / 100 : 0.03;
  } else if (homeCount === 2) {
    rate = regulatedArea ? 0.08 : acquisitionPrice <= 600_000_000 ? 0.01 : acquisitionPrice < 900_000_000 ? (acquisitionPrice / 100_000_000 * 2 / 3 - 3) / 100 : 0.03;
  } else if (homeCount === 3) {
    rate = regulatedArea ? 0.12 : 0.08;
  } else {
    rate = 0.12;
  }
  const acquisitionTax = acquisitionPrice * Math.max(0, rate);
  return { acquisitionPrice, homeCount, regulatedArea, rate: Math.max(0, rate), acquisitionTax };
}

export function calculatePropertyTax(officialPrice: number) {
  const price = nonNegative(officialPrice);
  const taxBase = price * 0.6;
  const rate = taxBase <= 60_000_000 ? 0.001 : taxBase <= 150_000_000 ? 0.0015 : taxBase <= 300_000_000 ? 0.0025 : 0.004;
  let tax: number;
  if (taxBase <= 60_000_000) tax = taxBase * 0.001;
  else if (taxBase <= 150_000_000) tax = 60_000 + (taxBase - 60_000_000) * 0.0015;
  else if (taxBase <= 300_000_000) tax = 195_000 + (taxBase - 150_000_000) * 0.0025;
  else tax = 570_000 + (taxBase - 300_000_000) * 0.004;
  return { officialPrice: price, taxBase, rate, propertyTax: tax };
}

export function calculateCompoundInterest(principal: number, annualRate: number, years: number) {
  const amount = nonNegative(principal);
  const rate = nonNegative(annualRate) / 100;
  const period = nonNegative(years);
  const total = amount * (1 + rate) ** period;
  return { principal: amount, annualRate: rate, years: period, interest: total - amount, total };
}

export type PercentageMode = "of" | "change" | "increase" | "decrease";
export function calculatePercentage(a: number, b: number, mode: PercentageMode) {
  const first = nonNegative(a);
  const second = nonNegative(b);
  if (mode === "of") return { result: first * second / 100, percentage: second, base: first, difference: first * second / 100 };
  if (mode === "change") {
    const difference = second - first;
    return { result: first === 0 ? 0 : difference / first * 100, percentage: first === 0 ? 0 : difference / first * 100, base: first, difference };
  }
  const delta = first * second / 100;
  return { result: mode === "increase" ? first + delta : Math.max(0, first - delta), percentage: second, base: first, difference: mode === "increase" ? delta : -delta };
}


/** 2026년 직장가입자 기본 부담률. 산재·사업장별 고용안정 부담분은 별도 산정 대상입니다. */
export const PAYROLL_2026 = {
  pensionEmployeeRate: 0.0475,
  pensionEmployerRate: 0.0475,
  pensionMinimumBase: 410_000,
  pensionMaximumBase: 6_590_000,
  healthEmployeeRate: 0.03595,
  healthEmployerRate: 0.03595,
  longTermCareRateOnHealth: 0.1314,
  employmentEmployeeRate: 0.009,
  employmentEmployerBaseRate: 0.009,
  minimumHourlyWage: 10_320,
  unemploymentDailyMinimum: 66_048,
  unemploymentDailyMaximum: 68_100,
} as const;

function safeInteger(value: number, minimum = 0) { return Math.max(minimum, Math.floor(Number.isFinite(value) ? value : minimum)); }
function progressiveIncomeTax(taxBase: number) {
  const base = nonNegative(taxBase);
  if (base <= 14_000_000) return base * 0.06;
  if (base <= 50_000_000) return 840_000 + (base - 14_000_000) * 0.15;
  if (base <= 88_000_000) return 6_240_000 + (base - 50_000_000) * 0.24;
  if (base <= 150_000_000) return 15_360_000 + (base - 88_000_000) * 0.35;
  if (base <= 300_000_000) return 37_060_000 + (base - 150_000_000) * 0.38;
  if (base <= 500_000_000) return 94_060_000 + (base - 300_000_000) * 0.4;
  if (base <= 1_000_000_000) return 174_060_000 + (base - 500_000_000) * 0.42;
  return 384_060_000 + (base - 1_000_000_000) * 0.45;
}
function earnedIncomeDeduction(annualPay: number) {
  const pay = nonNegative(annualPay);
  if (pay <= 5_000_000) return pay * 0.7;
  if (pay <= 15_000_000) return 3_500_000 + (pay - 5_000_000) * 0.4;
  if (pay <= 45_000_000) return 7_500_000 + (pay - 15_000_000) * 0.15;
  if (pay <= 100_000_000) return 12_000_000 + (pay - 45_000_000) * 0.05;
  return 14_750_000 + (pay - 100_000_000) * 0.02;
}
function earnedIncomeTaxCredit(calculatedTax: number) { return Math.min(1_300_000, nonNegative(calculatedTax) * 0.55); }
function childTaxCredit(children: number) {
  const count = safeInteger(children);
  if (count === 0) return 0;
  if (count === 1) return 150_000;
  if (count === 2) return 350_000;
  return 650_000 + (count - 3) * 300_000;
}

export type PayrollInputs = { monthlyGross: number; dependents: number; children: number; nonTaxable: number };
export function calculatePayrollTakeHome(monthlyGross: number, dependents = 1, children = 0, nonTaxable = 0) {
  const gross = nonNegative(monthlyGross);
  const family = Math.max(1, safeInteger(dependents, 1));
  const childCount = safeInteger(children);
  const exempt = Math.min(gross, nonNegative(nonTaxable));
  const insurableMonthlyPay = Math.max(0, gross - exempt);
  const pensionBase = insurableMonthlyPay === 0 ? 0 : Math.min(PAYROLL_2026.pensionMaximumBase, Math.max(PAYROLL_2026.pensionMinimumBase, Math.floor(insurableMonthlyPay / 1_000) * 1_000));
  const pension = pensionBase * PAYROLL_2026.pensionEmployeeRate;
  const health = insurableMonthlyPay * PAYROLL_2026.healthEmployeeRate;
  const longTermCare = health * PAYROLL_2026.longTermCareRateOnHealth;
  const employment = insurableMonthlyPay * PAYROLL_2026.employmentEmployeeRate;
  const annualGross = gross * 12;
  const annualNonTaxable = exempt * 12;
  const annualTaxBase = Math.max(0, annualGross - annualNonTaxable - earnedIncomeDeduction(annualGross - annualNonTaxable) - family * 1_500_000 - pension * 12);
  const annualCalculatedTax = progressiveIncomeTax(annualTaxBase);
  const annualIncomeTax = Math.max(0, annualCalculatedTax - earnedIncomeTaxCredit(annualCalculatedTax) - childTaxCredit(childCount));
  const incomeTax = annualIncomeTax / 12;
  const localIncomeTax = incomeTax * 0.1;
  const totalDeductions = pension + health + longTermCare + employment + incomeTax + localIncomeTax;
  return { monthlyGross: gross, nonTaxable: exempt, insurableMonthlyPay, dependents: family, children: childCount, pension, health, longTermCare, employment, incomeTax, localIncomeTax, totalDeductions, monthlyNet: Math.max(0, gross - totalDeductions), annualNet: Math.max(0, annualGross - totalDeductions * 12), annualTaxBase, annualIncomeTax };
}

export function calculateServicePeriod(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`); const end = new Date(`${endDate}T00:00:00`);
  if (!startDate || !endDate || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) return { valid: false, days: 0, years: 0, message: "입사일보다 늦은 퇴사일을 입력하세요." };
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000);
  return { valid: true, days, years: days / 365, message: "" };
}

function serviceYearsDeduction(years: number) {
  const value = Math.max(1, safeInteger(years, 1));
  if (value <= 5) return value * 1_000_000;
  if (value <= 10) return 5_000_000 + (value - 5) * 2_000_000;
  if (value <= 20) return 15_000_000 + (value - 10) * 2_500_000;
  return 40_000_000 + (value - 20) * 3_000_000;
}
function convertedIncomeDeduction(convertedIncome: number) {
  const value = nonNegative(convertedIncome);
  if (value <= 8_000_000) return value;
  if (value <= 70_000_000) return 8_000_000 + (value - 8_000_000) * 0.6;
  if (value <= 100_000_000) return 45_200_000 + (value - 70_000_000) * 0.55;
  if (value <= 300_000_000) return 61_700_000 + (value - 100_000_000) * 0.45;
  return 151_700_000 + (value - 300_000_000) * 0.35;
}
export function calculateRetirementIncomeTax(retirementPay: number, serviceYears: number, nonTaxableIncome = 0) {
  const gross = nonNegative(retirementPay); const years = Math.max(1, safeInteger(serviceYears, 1)); const nonTaxable = Math.min(gross, nonNegative(nonTaxableIncome));
  const retirementIncome = gross - nonTaxable; const serviceDeduction = Math.min(retirementIncome, serviceYearsDeduction(years));
  const convertedIncome = Math.max(0, (retirementIncome - serviceDeduction) / years * 12);
  const conversionDeduction = Math.min(convertedIncome, convertedIncomeDeduction(convertedIncome));
  const taxBase = Math.max(0, convertedIncome - conversionDeduction);
  const incomeTax = progressiveIncomeTax(taxBase) / 12 * years; const localIncomeTax = incomeTax * 0.1;
  return { gross, years, nonTaxable, retirementIncome, serviceDeduction, convertedIncome, conversionDeduction, taxBase, incomeTax, localIncomeTax, totalTax: incomeTax + localIncomeTax, estimatedNet: Math.max(0, gross - incomeTax - localIncomeTax) };
}

export function calculateWeeklyHolidayPay(hourlyWage: number, weeklyHours: number, workDays: number, completedWeek = true) {
  const hourly = nonNegative(hourlyWage); const hours = Math.min(40, nonNegative(weeklyHours)); const days = Math.max(1, safeInteger(workDays, 1)); const eligible = completedWeek && hours >= 15;
  const dailyHours = Math.min(8, hours / days); const basicWage = hourly * hours; const holidayPay = eligible ? hourly * dailyHours : 0;
  return { hourlyWage: hourly, weeklyHours: hours, workDays: days, eligible, dailyHours, basicWage, holidayPay, weeklyPay: basicWage + holidayPay, monthlyEstimate: (basicWage + holidayPay) * (365 / 12 / 7) };
}

export function calculateAnnualLeavePay(hourlyWage: number, hoursPerDay: number, unusedDays: number) {
  const hourly = nonNegative(hourlyWage); const hours = Math.min(24, nonNegative(hoursPerDay)); const days = nonNegative(unusedDays);
  const dailyOrdinaryWage = hourly * hours;
  return { hourlyWage: hourly, hoursPerDay: hours, unusedDays: days, dailyOrdinaryWage, annualLeavePay: dailyOrdinaryWage * days };
}

export type HourlyWageMode = "from-monthly" | "from-hourly";
export function calculateHourlyWage(mode: HourlyWageMode, amount: number, monthlyHours: number) {
  const value = nonNegative(amount); const hours = Math.max(1, nonNegative(monthlyHours));
  const hourlyWage = mode === "from-monthly" ? value / hours : value;
  return { mode, amount: value, monthlyHours: hours, hourlyWage, monthlyWage: hourlyWage * hours, weeklyEstimate: hourlyWage * hours / (365 / 12 / 7) };
}

function parseTimeToMinutes(value: string) { const match = /^(\d{2}):(\d{2})$/.exec(value); if (!match) return null; const hour = Number(match[1]); const minute = Number(match[2]); return hour >= 0 && hour < 24 && minute >= 0 && minute < 60 ? hour * 60 + minute : null; }
export function calculateWorkHours(startTime: string, endTime: string, breakMinutes: number) {
  const start = parseTimeToMinutes(startTime); const end = parseTimeToMinutes(endTime); const breakTime = safeInteger(breakMinutes);
  if (start === null || end === null) return { valid: false, message: "시작시간과 종료시간을 시:분 형식으로 입력하세요.", totalMinutes: 0, breakMinutes: breakTime, workMinutes: 0, crossesMidnight: false };
  let totalMinutes = end - start; const crossesMidnight = totalMinutes <= 0; if (crossesMidnight) totalMinutes += 24 * 60;
  if (breakTime > totalMinutes) return { valid: false, message: "휴게시간은 전체 근무시간보다 길 수 없습니다.", totalMinutes, breakMinutes: breakTime, workMinutes: 0, crossesMidnight };
  return { valid: true, message: "", totalMinutes, breakMinutes: breakTime, workMinutes: totalMinutes - breakTime, crossesMidnight };
}

export function calculateFourInsurance(monthlyPay: number) {
  const gross = nonNegative(monthlyPay); const pensionBase = gross === 0 ? 0 : Math.min(PAYROLL_2026.pensionMaximumBase, Math.max(PAYROLL_2026.pensionMinimumBase, Math.floor(gross / 1_000) * 1_000));
  const pensionEmployee = pensionBase * PAYROLL_2026.pensionEmployeeRate; const pensionEmployer = pensionBase * PAYROLL_2026.pensionEmployerRate;
  const healthEmployee = gross * PAYROLL_2026.healthEmployeeRate; const healthEmployer = gross * PAYROLL_2026.healthEmployerRate;
  const careEmployee = healthEmployee * PAYROLL_2026.longTermCareRateOnHealth; const careEmployer = healthEmployer * PAYROLL_2026.longTermCareRateOnHealth;
  const employmentEmployee = gross * PAYROLL_2026.employmentEmployeeRate; const employmentEmployer = gross * PAYROLL_2026.employmentEmployerBaseRate;
  const employeeTotal = pensionEmployee + healthEmployee + careEmployee + employmentEmployee; const employerBaseTotal = pensionEmployer + healthEmployer + careEmployer + employmentEmployer;
  return { monthlyPay: gross, pensionBase, pensionEmployee, pensionEmployer, healthEmployee, healthEmployer, careEmployee, careEmployer, employmentEmployee, employmentEmployer, employeeTotal, employerBaseTotal };
}

export function calculateUnemploymentBenefit(monthlyWage: number, age: number, insuredMonths: number) {
  const wage = nonNegative(monthlyWage); const ageAtSeparation = safeInteger(age); const months = safeInteger(insuredMonths);
  const averageDailyWage = wage / 30; const rawDailyBenefit = averageDailyWage * 0.6;
  const dailyBenefit = Math.min(PAYROLL_2026.unemploymentDailyMaximum, Math.max(PAYROLL_2026.unemploymentDailyMinimum, rawDailyBenefit));
  const group = ageAtSeparation >= 50 ? "senior" : "standard";
  let payableDays = 0;
  // UI 입력값은 '개월' 단위다. 실제 수급요건의 180일은 약 6개월 이상 가입으로 간이 환산한다.
  if (months >= 6 && months < 12) payableDays = 120;
  else if (months >= 12 && months < 36) payableDays = group === "senior" ? 180 : 150;
  else if (months >= 36 && months < 60) payableDays = group === "senior" ? 210 : 180;
  else if (months >= 60 && months < 120) payableDays = group === "senior" ? 240 : 210;
  else if (months >= 120) payableDays = group === "senior" ? 270 : 240;
  return { monthlyWage: wage, age: ageAtSeparation, insuredMonths: months, averageDailyWage, rawDailyBenefit, dailyBenefit: payableDays > 0 ? dailyBenefit : 0, payableDays, totalBenefit: payableDays > 0 ? dailyBenefit * payableDays : 0, eligibleByMonths: months >= 6, ageGroup: group };
}
