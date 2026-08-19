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
    m3: { label: "세제곱미터 (m³)", factor: 1000 },
    cup: { label: "미터법 컵 (250mL)", factor: 0.25 },
    gal_us: { label: "미국 갤런 (US gal)", factor: 3.785411784 },
  },
  speed: {
    ms: { label: "미터/초 (m/s)", factor: 1 },
    kmh: { label: "킬로미터/시 (km/h)", factor: 0.2777777778 },
    mph: { label: "마일/시 (mph)", factor: 0.44704 },
    knot: { label: "노트 (kt)", factor: 0.5144444444 },
  },
  data: {
    b: { label: "바이트 (B)", factor: 1 },
    kb: { label: "킬로바이트 (KB)", factor: 1000 },
    mb: { label: "메가바이트 (MB)", factor: 1000 ** 2 },
    gb: { label: "기가바이트 (GB)", factor: 1000 ** 3 },
    kib: { label: "키비바이트 (KiB)", factor: 1024 },
    mib: { label: "메비바이트 (MiB)", factor: 1024 ** 2 },
    gib: { label: "기비바이트 (GiB)", factor: 1024 ** 3 },
  },
  time: {
    second: { label: "초 (s)", factor: 1 },
    minute: { label: "분 (min)", factor: 60 },
    hour: { label: "시간 (h)", factor: 3600 },
    day: { label: "일 (d)", factor: 86400 },
    week: { label: "주 (week)", factor: 604800 },
  },
  pressure: {
    pa: { label: "파스칼 (Pa)", factor: 1 },
    kpa: { label: "킬로파스칼 (kPa)", factor: 1000 },
    bar: { label: "바 (bar)", factor: 100000 },
    atm: { label: "기압 (atm)", factor: 101325 },
    psi: { label: "psi", factor: 6894.757293 },
  },
  energy: {
    j: { label: "줄 (J)", factor: 1 },
    kj: { label: "킬로줄 (kJ)", factor: 1000 },
    cal: { label: "칼로리 (cal)", factor: 4.184 },
    kcal: { label: "킬로칼로리 (kcal)", factor: 4184 },
    wh: { label: "와트시 (Wh)", factor: 3600 },
    kwh: { label: "킬로와트시 (kWh)", factor: 3_600_000 },
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


/** 4·5차 확장 계산기의 표시·검증 기준값. 실제 신고·수급 금액을 확정하지 않는 간이 추정용이다. */
export const POLICY_2026 = {
  incomeTaxBrackets: [
    { max: 14_000_000, rate: 0.06, deduction: 0 },
    { max: 50_000_000, rate: 0.15, deduction: 840_000 },
    { max: 88_000_000, rate: 0.24, deduction: 6_240_000 },
    { max: 150_000_000, rate: 0.35, deduction: 15_360_000 },
    { max: 300_000_000, rate: 0.38, deduction: 37_060_000 },
    { max: 500_000_000, rate: 0.4, deduction: 94_060_000 },
    { max: 1_000_000_000, rate: 0.42, deduction: 174_060_000 },
    { max: Infinity, rate: 0.45, deduction: 384_060_000 },
  ],
  inheritanceGiftBrackets: [
    { max: 100_000_000, rate: 0.1, deduction: 0 },
    { max: 500_000_000, rate: 0.2, deduction: 10_000_000 },
    { max: 1_000_000_000, rate: 0.3, deduction: 60_000_000 },
    { max: 3_000_000_000, rate: 0.4, deduction: 160_000_000 },
    { max: Infinity, rate: 0.5, deduction: 460_000_000 },
  ],
  nationalPension: { averageMonthlyIncome: 3_000_000, incomeReplacementRate: 0.4, requiredMonths: 120 },
  healthInsurance: { totalRate: 0.0719, longTermCareRate: 0.009448, regionalPropertyPointValue: 211.5 },
  minimumHourlyWage: 10_320,
} as const;

function bounded(value: number, maximum: number) { return Math.min(maximum, nonNegative(value)); }
function progressiveTaxWithBrackets(taxBase: number, brackets: readonly { max: number; rate: number; deduction: number }[]) {
  const base = nonNegative(taxBase);
  const bracket = brackets.find((item) => base <= item.max) ?? brackets[brackets.length - 1];
  return { taxBase: base, rate: bracket.rate, deduction: bracket.deduction, tax: Math.max(0, base * bracket.rate - bracket.deduction) };
}

export function calculateComprehensiveIncomeTax(revenue: number, expenses: number, incomeDeductions: number, taxCredits: number, prepaidTax: number) {
  const grossIncome = nonNegative(revenue);
  const necessaryExpenses = bounded(expenses, grossIncome);
  const incomeAmount = grossIncome - necessaryExpenses;
  const deduction = bounded(incomeDeductions, incomeAmount);
  const taxableIncome = Math.max(0, incomeAmount - deduction);
  const assessed = progressiveTaxWithBrackets(taxableIncome, POLICY_2026.incomeTaxBrackets);
  const credit = bounded(taxCredits, assessed.tax);
  const incomeTax = Math.max(0, assessed.tax - credit);
  const localIncomeTax = incomeTax * 0.1;
  const totalTax = incomeTax + localIncomeTax;
  const prepaid = nonNegative(prepaidTax);
  return {
    grossIncome, necessaryExpenses, incomeAmount, incomeDeductions: deduction, taxableIncome,
    appliedRate: assessed.rate, progressiveDeduction: assessed.deduction, calculatedIncomeTax: assessed.tax,
    taxCredits: credit, incomeTax, localIncomeTax, totalTax, prepaidTax: prepaid,
    additionalPayment: Math.max(0, totalTax - prepaid), refund: Math.max(0, prepaid - totalTax),
  };
}

function dateAtUtc(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}
function toDateKey(date: Date) { return date.toISOString().slice(0, 10); }
function daysBetween(start: Date, end: Date) { return Math.round((end.getTime() - start.getTime()) / 86_400_000); }
function addMonthsClamped(date: Date, months: number) {
  const year = date.getUTCFullYear(); const month = date.getUTCMonth(); const day = date.getUTCDate();
  const targetMonthIndex = month + months; const targetYear = year + Math.floor(targetMonthIndex / 12); const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, normalizedMonth, Math.min(day, lastDay)));
}

export function calculateCapitalGainsTax(salePrice: number, purchasePrice: number, expenses: number, acquisitionDate: string, transferDate: string, basicDeduction = 2_500_000) {
  const acquired = dateAtUtc(acquisitionDate); const transferred = dateAtUtc(transferDate);
  const sale = nonNegative(salePrice); const purchase = nonNegative(purchasePrice); const costs = nonNegative(expenses);
  if (!acquired || !transferred || transferred.getTime() <= acquired.getTime()) {
    return { valid: false, message: "취득일보다 늦은 양도일을 입력하세요.", salePrice: sale, purchasePrice: purchase, expenses: costs, holdingDays: 0, holdingYears: 0, gain: 0, taxBase: 0, rate: 0, incomeTax: 0, localIncomeTax: 0, totalTax: 0 };
  }
  const holdingDays = daysBetween(acquired, transferred); const gain = Math.max(0, sale - purchase - costs);
  const taxBase = Math.max(0, gain - nonNegative(basicDeduction));
  const shortTermRate = holdingDays < 365 ? 0.7 : holdingDays < 730 ? 0.6 : null;
  const assessed = shortTermRate === null ? progressiveTaxWithBrackets(taxBase, POLICY_2026.incomeTaxBrackets) : { rate: shortTermRate, deduction: 0, tax: taxBase * shortTermRate };
  const localIncomeTax = assessed.tax * 0.1;
  return { valid: true, message: "일반 자산의 간이 계산입니다. 1세대 1주택 비과세, 다주택 중과·감면 및 장기보유특별공제는 반영하지 않습니다.", salePrice: sale, purchasePrice: purchase, expenses: costs, holdingDays, holdingYears: holdingDays / 365, gain, basicDeduction: nonNegative(basicDeduction), taxBase, rate: assessed.rate, incomeTax: assessed.tax, localIncomeTax, totalTax: assessed.tax + localIncomeTax };
}

export type GiftRelation = "spouse" | "ascendant" | "descendant" | "relative" | "other";
function giftAllowance(relation: GiftRelation, minor: boolean) {
  if (relation === "spouse") return 600_000_000;
  if (relation === "ascendant") return minor ? 20_000_000 : 50_000_000;
  if (relation === "descendant") return 50_000_000;
  if (relation === "relative") return 10_000_000;
  return 0;
}
function inheritanceGiftTax(taxBase: number) { return progressiveTaxWithBrackets(taxBase, POLICY_2026.inheritanceGiftBrackets); }

export function calculateGiftTax(assetValue: number, assumedDebt: number, relation: GiftRelation, minor: boolean, previousGifts: number) {
  const asset = nonNegative(assetValue); const debt = bounded(assumedDebt, asset); const prior = nonNegative(previousGifts);
  const taxableGift = Math.max(0, asset - debt + prior); const allowance = giftAllowance(relation, minor); const taxBase = Math.max(0, taxableGift - allowance);
  const assessed = inheritanceGiftTax(taxBase); const filingCredit = assessed.tax * 0.03;
  return { assetValue: asset, assumedDebt: debt, previousGifts: prior, taxableGift, allowance, taxBase, appliedRate: assessed.rate, progressiveDeduction: assessed.deduction, calculatedTax: assessed.tax, filingCredit, estimatedPayment: Math.max(0, assessed.tax - filingCredit) };
}

export function calculateInheritanceTax(assetValue: number, debtsAndCosts: number, deductions: number, previousGifts: number) {
  const assets = nonNegative(assetValue); const debt = bounded(debtsAndCosts, assets); const prior = nonNegative(previousGifts);
  const taxableEstate = Math.max(0, assets - debt + prior); const deduction = bounded(deductions, taxableEstate); const taxBase = Math.max(0, taxableEstate - deduction);
  const assessed = inheritanceGiftTax(taxBase); const filingCredit = assessed.tax * 0.03;
  return { assetValue: assets, debtsAndCosts: debt, previousGifts: prior, taxableEstate, deductions: deduction, taxBase, appliedRate: assessed.rate, progressiveDeduction: assessed.deduction, calculatedTax: assessed.tax, filingCredit, estimatedPayment: Math.max(0, assessed.tax - filingCredit) };
}

export function calculateYearEndRefund(grossPay: number, nonTaxablePay: number, dependents: number, additionalDeductions: number, taxCredits: number, prepaidIncomeTax: number, prepaidLocalTax: number) {
  const gross = nonNegative(grossPay); const nonTaxable = bounded(nonTaxablePay, gross); const taxablePay = gross - nonTaxable;
  const earnedDeduction = earnedIncomeDeduction(taxablePay); const familyDeduction = Math.max(1, safeInteger(dependents, 1)) * 1_500_000;
  const deductions = bounded(additionalDeductions, Math.max(0, taxablePay - earnedDeduction - familyDeduction));
  const taxBase = Math.max(0, taxablePay - earnedDeduction - familyDeduction - deductions);
  const assessed = progressiveTaxWithBrackets(taxBase, POLICY_2026.incomeTaxBrackets);
  const credit = bounded(taxCredits, assessed.tax); const finalIncomeTax = Math.max(0, assessed.tax - credit); const finalLocalTax = finalIncomeTax * 0.1;
  const prepaid = nonNegative(prepaidIncomeTax) + nonNegative(prepaidLocalTax); const finalTax = finalIncomeTax + finalLocalTax;
  return { grossPay: gross, nonTaxablePay: nonTaxable, taxablePay, earnedDeduction, familyDeduction, additionalDeductions: deductions, taxBase, calculatedIncomeTax: assessed.tax, taxCredits: credit, finalIncomeTax, finalLocalTax, finalTax, prepaid, refund: Math.max(0, prepaid - finalTax), additionalPayment: Math.max(0, finalTax - prepaid) };
}

export function calculateNationalPensionEstimate(monthlyIncome: number, insuredMonths: number, additionalMonths: number) {
  const income = Math.max(0, Math.min(PAYROLL_2026.pensionMaximumBase, nonNegative(monthlyIncome)));
  const currentMonths = safeInteger(insuredMonths); const futureMonths = safeInteger(additionalMonths); const totalMonths = currentMonths + futureMonths;
  const totalYears = totalMonths / 12;
  const averageBase = (income + POLICY_2026.nationalPension.averageMonthlyIncome) / 2;
  const estimatedMonthlyPension = totalMonths >= POLICY_2026.nationalPension.requiredMonths ? averageBase * POLICY_2026.nationalPension.incomeReplacementRate * (totalYears / 40) : 0;
  return { monthlyIncome: income, insuredMonths: currentMonths, additionalMonths: futureMonths, totalMonths, totalYears, eligible: totalMonths >= POLICY_2026.nationalPension.requiredMonths, requiredMonths: POLICY_2026.nationalPension.requiredMonths, averageBase, estimatedMonthlyPension, estimatedAnnualPension: estimatedMonthlyPension * 12 };
}

export type HealthInsuranceType = "workplace" | "regional";
export function calculateHealthInsurance(type: HealthInsuranceType, monthlyIncome: number, propertyPoints = 0) {
  const income = nonNegative(monthlyIncome); const points = nonNegative(propertyPoints); const totalHealth = type === "workplace" ? income * POLICY_2026.healthInsurance.totalRate : income * POLICY_2026.healthInsurance.totalRate + points * POLICY_2026.healthInsurance.regionalPropertyPointValue;
  const totalCare = totalHealth * POLICY_2026.healthInsurance.longTermCareRate / POLICY_2026.healthInsurance.totalRate;
  const contributionShare = type === "workplace" ? 0.5 : 1;
  const healthContribution = totalHealth * contributionShare; const careContribution = totalCare * contributionShare;
  return { type, monthlyIncome: income, propertyPoints: points, totalHealth, totalCare, healthContribution, careContribution, totalContribution: healthContribution + careContribution, employerHealth: type === "workplace" ? totalHealth * 0.5 : 0, employerCare: type === "workplace" ? totalCare * 0.5 : 0 };
}

export function calculateMinimumWageMonthly(hourlyWage: number, hoursPerDay: number, daysPerWeek: number, includeWeeklyHoliday: boolean) {
  const hourly = nonNegative(hourlyWage); const hours = Math.min(24, nonNegative(hoursPerDay)); const days = Math.min(7, safeInteger(daysPerWeek)); const weeklyHours = hours * days;
  const weeklyBasic = hourly * weeklyHours; const eligibleForHoliday = includeWeeklyHoliday && weeklyHours >= 15 && days > 0; const weeklyHoliday = eligibleForHoliday ? hourly * hours : 0;
  const weeklyPay = weeklyBasic + weeklyHoliday; const monthlyHours = weeklyHours * (365 / 12 / 7) + (eligibleForHoliday ? hours * (365 / 12 / 7) : 0);
  return { hourlyWage: hourly, legalMinimumHourly: POLICY_2026.minimumHourlyWage, meetsMinimum: hourly >= POLICY_2026.minimumHourlyWage, hoursPerDay: hours, daysPerWeek: days, weeklyHours, weeklyBasic, weeklyHoliday, eligibleForHoliday, weeklyPay, monthlyHours, estimatedMonthlyPay: weeklyPay * (365 / 12 / 7) };
}

export function calculateDateOperation(baseDate: string, years: number, months: number, days: number, mode: "add" | "subtract") {
  const base = dateAtUtc(baseDate);
  if (!base) return { valid: false, message: "올바른 기준일을 입력하세요.", baseDate, resultDate: "", differenceDays: 0 };
  const sign = mode === "add" ? 1 : -1; const yearShifted = new Date(Date.UTC(base.getUTCFullYear() + safeInteger(years) * sign, base.getUTCMonth(), base.getUTCDate()));
  const monthShifted = addMonthsClamped(yearShifted, safeInteger(months) * sign); const result = new Date(monthShifted.getTime() + safeInteger(days) * sign * 86_400_000);
  return { valid: true, message: "", baseDate: toDateKey(base), resultDate: toDateKey(result), differenceDays: daysBetween(base, result) };
}

export function calculateDDay(baseDate: string, targetDate: string) {
  const base = dateAtUtc(baseDate); const target = dateAtUtc(targetDate);
  if (!base || !target) return { valid: false, message: "기준일과 목표일을 올바르게 입력하세요.", days: 0, label: "—" };
  const days = daysBetween(base, target); const label = days === 0 ? "D-Day" : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
  return { valid: true, message: "", days, label, weeks: Math.floor(Math.abs(days) / 7), remainingDays: Math.abs(days) % 7 };
}

function birthdayInYear(birth: Date, year: number) {
  const month = birth.getUTCMonth(); const day = birth.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
}
export function calculateAge(birthDate: string, referenceDate: string) {
  const birth = dateAtUtc(birthDate); const reference = dateAtUtc(referenceDate);
  if (!birth || !reference || reference.getTime() < birth.getTime()) return { valid: false, message: "기준일보다 이른 생년월일을 입력하세요.", fullAge: 0, koreanAge: 0, yearAge: 0, nextBirthdayDays: 0 };
  const birthdayThisYear = birthdayInYear(birth, reference.getUTCFullYear());
  const fullAge = reference.getUTCFullYear() - birth.getUTCFullYear() - (reference.getTime() < birthdayThisYear.getTime() ? 1 : 0);
  const nextBirthday = reference.getTime() <= birthdayThisYear.getTime() ? birthdayThisYear : birthdayInYear(birth, reference.getUTCFullYear() + 1);
  return { valid: true, message: "", fullAge, koreanAge: reference.getUTCFullYear() - birth.getUTCFullYear() + 1, yearAge: reference.getUTCFullYear() - birth.getUTCFullYear(), nextBirthdayDays: daysBetween(reference, nextBirthday), birthdayPassed: reference.getTime() >= birthdayThisYear.getTime() };
}

function completeMonthsBetween(start: Date, end: Date) {
  let months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
  if (end.getUTCDate() < start.getUTCDate()) months -= 1;
  return Math.max(0, months);
}
export function calculateDateDifference(startDate: string, endDate: string, inclusive = false) {
  const start = dateAtUtc(startDate); const end = dateAtUtc(endDate);
  if (!start || !end || end.getTime() < start.getTime()) return { valid: false, message: "시작일보다 같거나 늦은 종료일을 입력하세요.", days: 0, inclusiveDays: 0, weeks: 0, remainingDays: 0, months: 0, monthRemainingDays: 0 };
  const days = daysBetween(start, end); const months = completeMonthsBetween(start, end); const afterMonths = addMonthsClamped(start, months); const monthRemainingDays = daysBetween(afterMonths, end);
  return { valid: true, message: "", days, inclusiveDays: days + 1, selectedDays: inclusive ? days + 1 : days, weeks: Math.floor(days / 7), remainingDays: days % 7, months, monthRemainingDays };
}

export function calculateTimeOperation(baseTime: string, hours: number, minutes: number, mode: "add" | "subtract") {
  const base = parseTimeToMinutes(baseTime); if (base === null) return { valid: false, message: "시:분 형식의 기준 시각을 입력하세요.", resultTime: "", dayOffset: 0, totalMinutes: 0 };
  const sign = mode === "add" ? 1 : -1; const delta = (safeInteger(hours) * 60 + safeInteger(minutes)) * sign; const total = base + delta;
  const dayOffset = Math.floor(total / 1440); const normalized = ((total % 1440) + 1440) % 1440;
  return { valid: true, message: "", resultTime: `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`, dayOffset, totalMinutes: delta };
}


/** 생활·업무 계산기: 입력값을 바탕으로 한 참고용 수식이며, 의료·금융·계약 판단을 대신하지 않는다. */
export function calculateDiscount(originalPrice: number, discountRate: number) {
  const price = nonNegative(originalPrice);
  const rate = Math.min(100, nonNegative(discountRate));
  const discount = price * rate / 100;
  return { originalPrice: price, discountRate: rate, discount, finalPrice: price - discount };
}

export function calculateMargin(salesPrice: number, cost: number) {
  const sales = nonNegative(salesPrice);
  const purchaseCost = nonNegative(cost);
  const profit = sales - purchaseCost;
  return {
    salesPrice: sales,
    cost: purchaseCost,
    profit,
    marginRate: sales > 0 ? profit / sales * 100 : 0,
    markupRate: purchaseCost > 0 ? profit / purchaseCost * 100 : 0,
  };
}

export function calculateBreakEven(fixedCost: number, unitPrice: number, unitVariableCost: number) {
  const fixed = nonNegative(fixedCost);
  const price = nonNegative(unitPrice);
  const variable = nonNegative(unitVariableCost);
  const contributionMargin = price - variable;
  const valid = contributionMargin > 0;
  const units = valid ? Math.ceil(fixed / contributionMargin) : 0;
  return {
    fixedCost: fixed,
    unitPrice: price,
    unitVariableCost: variable,
    contributionMargin,
    valid,
    units,
    revenueAtBreakEven: valid ? units * price : 0,
    message: valid ? "" : "판매 단가는 변동비보다 커야 손익분기점을 계산할 수 있습니다.",
  };
}

export function calculateFuelCost(distanceKm: number, kmPerLiter: number, fuelPricePerLiter: number) {
  const distance = nonNegative(distanceKm);
  const efficiency = nonNegative(kmPerLiter);
  const fuelPrice = nonNegative(fuelPricePerLiter);
  const valid = efficiency > 0;
  const liters = valid ? distance / efficiency : 0;
  return { distanceKm: distance, kmPerLiter: efficiency, fuelPricePerLiter: fuelPrice, valid, liters, cost: liters * fuelPrice, message: valid ? "" : "연비는 0보다 커야 합니다." };
}

export function calculateSplitBill(totalAmount: number, people: number, tipRate = 0) {
  const total = nonNegative(totalAmount);
  const count = Math.max(1, safeInteger(people, 1));
  const rate = Math.min(100, nonNegative(tipRate));
  const tip = total * rate / 100;
  const grandTotal = total + tip;
  return { totalAmount: total, people: count, tipRate: rate, tip, grandTotal, perPerson: grandTotal / count };
}

export function calculateAverage(values: number[]) {
  const validValues = values.filter((value) => Number.isFinite(value));
  const sum = validValues.reduce((total, value) => total + value, 0);
  return {
    values: validValues,
    count: validValues.length,
    sum,
    average: validValues.length ? sum / validValues.length : 0,
    minimum: validValues.length ? Math.min(...validValues) : 0,
    maximum: validValues.length ? Math.max(...validValues) : 0,
  };
}

export function calculateBmi(weightKg: number, heightCm: number) {
  const weight = nonNegative(weightKg);
  const height = nonNegative(heightCm);
  const meters = height / 100;
  const valid = meters > 0;
  const bmi = valid ? weight / (meters ** 2) : 0;
  const category = !valid ? "계산 불가" : bmi < 18.5 ? "낮음" : bmi < 23 ? "일반 범위" : bmi < 25 ? "높음" : "매우 높음";
  return { weightKg: weight, heightCm: height, bmi, category, valid, message: valid ? "" : "키는 0보다 커야 합니다." };
}

export type BmrSex = "female" | "male";
export function calculateBmr(sex: BmrSex, age: number, weightKg: number, heightCm: number) {
  const normalizedAge = Math.max(0, safeInteger(age));
  const weight = nonNegative(weightKg);
  const height = nonNegative(heightCm);
  const valid = normalizedAge > 0 && weight > 0 && height > 0;
  const bmr = valid ? 10 * weight + 6.25 * height - 5 * normalizedAge + (sex === "male" ? 5 : -161) : 0;
  return { sex, age: normalizedAge, weightKg: weight, heightCm: height, bmr, valid, message: valid ? "" : "나이, 키, 체중을 모두 입력하세요." };
}

export type ActivityKind = "walking" | "cycling" | "jogging";
const activityMet: Record<ActivityKind, number> = { walking: 3.5, cycling: 6, jogging: 8 };
export function calculateCaloriesBurned(activity: ActivityKind, weightKg: number, minutes: number) {
  const weight = nonNegative(weightKg);
  const duration = nonNegative(minutes);
  const met = activityMet[activity];
  const calories = met * 3.5 * weight / 200 * duration;
  return { activity, met, weightKg: weight, minutes: duration, calories };
}

export type GpaItem = { credits: number; gradePoint: number };
export function calculateGpa(items: GpaItem[]) {
  const validItems = items.map((item) => ({ credits: nonNegative(item.credits), gradePoint: Math.min(4.5, Math.max(0, Number.isFinite(item.gradePoint) ? item.gradePoint : 0)) })).filter((item) => item.credits > 0);
  const totalCredits = validItems.reduce((sum, item) => sum + item.credits, 0);
  const weightedPoints = validItems.reduce((sum, item) => sum + item.credits * item.gradePoint, 0);
  return { items: validItems, totalCredits, weightedPoints, gpa: totalCredits > 0 ? weightedPoints / totalCredits : 0 };
}


/** 추가 생활·업무 계산기: 모두 입력값을 기반으로 한 참고용 간이 계산이다. */
export function calculateUnitPrice(totalAmount: number, quantity: number) {
  const total = nonNegative(totalAmount); const count = nonNegative(quantity); const valid = count > 0;
  return { totalAmount: total, quantity: count, unitPrice: valid ? total / count : 0, valid, message: valid ? "" : "수량은 0보다 커야 합니다." };
}

export function calculateFee(amount: number, feeRate: number) {
  const transactionAmount = nonNegative(amount); const rate = Math.min(100, nonNegative(feeRate)); const fee = transactionAmount * rate / 100;
  return { transactionAmount, feeRate: rate, fee, netAmount: transactionAmount - fee };
}

export function calculateParkingFee(durationMinutes: number, baseMinutes: number, baseFee: number, extraMinutes: number, extraFee: number) {
  const duration = nonNegative(durationMinutes); const included = nonNegative(baseMinutes); const base = nonNegative(baseFee); const interval = nonNegative(extraMinutes); const additionalFee = nonNegative(extraFee);
  const remainingMinutes = Math.max(0, duration - included); const extraBlocks = remainingMinutes > 0 && interval > 0 ? Math.ceil(remainingMinutes / interval) : 0;
  const valid = remainingMinutes === 0 || interval > 0;
  return { durationMinutes: duration, baseMinutes: included, baseFee: base, extraMinutes: interval, extraFee: additionalFee, remainingMinutes, extraBlocks, totalFee: valid ? base + extraBlocks * additionalFee : 0, valid, message: valid ? "" : "추가 시간 단위는 0보다 커야 합니다." };
}

export function calculateTravelBudget(transport: number, lodging: number, meals: number, other: number, people: number) {
  const values = [transport, lodging, meals, other].map(nonNegative); const count = Math.max(1, safeInteger(people, 1)); const total = values.reduce((sum, value) => sum + value, 0);
  return { transport: values[0], lodging: values[1], meals: values[2], other: values[3], people: count, total, perPerson: total / count };
}

export function calculateRecipeServings(originalServings: number, targetServings: number, ingredientAmount: number) {
  const original = nonNegative(originalServings); const target = nonNegative(targetServings); const ingredient = nonNegative(ingredientAmount); const valid = original > 0;
  const multiplier = valid ? target / original : 0;
  return { originalServings: original, targetServings: target, ingredientAmount: ingredient, multiplier, adjustedAmount: ingredient * multiplier, valid, message: valid ? "" : "원래 인분은 0보다 커야 합니다." };
}

export function calculateSleepDuration(bedHour: number, bedMinute: number, wakeHour: number, wakeMinute: number) {
  const validHour = (value: number) => Number.isInteger(value) && value >= 0 && value < 24;
  const validMinute = (value: number) => Number.isInteger(value) && value >= 0 && value < 60;
  const valid = validHour(bedHour) && validMinute(bedMinute) && validHour(wakeHour) && validMinute(wakeMinute);
  if (!valid) return { valid: false, message: "시각은 0~23시, 분은 0~59분으로 입력하세요.", totalMinutes: 0, hours: 0, minutes: 0, crossesMidnight: false };
  const bedtime = bedHour * 60 + bedMinute; const wakeTime = wakeHour * 60 + wakeMinute; let totalMinutes = wakeTime - bedtime;
  const crossesMidnight = totalMinutes <= 0; if (crossesMidnight) totalMinutes += 24 * 60;
  return { valid: true, message: "", totalMinutes, hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60, crossesMidnight };
}

export function calculateElectricityUsage(powerWatts: number, dailyHours: number, days: number, pricePerKwh: number) {
  const watts = nonNegative(powerWatts); const hours = nonNegative(dailyHours); const period = nonNegative(days); const price = nonNegative(pricePerKwh); const kwh = watts * hours * period / 1000;
  return { powerWatts: watts, dailyHours: hours, days: period, pricePerKwh: price, kwh, estimatedCost: kwh * price };
}

export function calculatePaintAmount(widthMeters: number, heightMeters: number, wallCount: number, coats: number, coverageSqmPerLiter: number) {
  const width = nonNegative(widthMeters); const height = nonNegative(heightMeters); const walls = nonNegative(wallCount); const coatCount = nonNegative(coats); const coverage = nonNegative(coverageSqmPerLiter); const totalArea = width * height * walls * coatCount; const valid = coverage > 0;
  return { widthMeters: width, heightMeters: height, wallCount: walls, coats: coatCount, coverageSqmPerLiter: coverage, totalArea, liters: valid ? totalArea / coverage : 0, valid, message: valid ? "" : "페인트 1L당 도포 면적은 0보다 커야 합니다." };
}

export function calculateSavingsGoal(goalAmount: number, currentAmount: number, monthlySaving: number) {
  const goal = nonNegative(goalAmount); const current = Math.min(goal, nonNegative(currentAmount)); const monthly = nonNegative(monthlySaving); const remaining = Math.max(0, goal - current); const complete = remaining === 0; const valid = complete || monthly > 0;
  return { goalAmount: goal, currentAmount: current, monthlySaving: monthly, remaining, months: complete ? 0 : valid ? Math.ceil(remaining / monthly) : 0, valid, message: valid ? "" : "월 저축액은 0보다 커야 합니다." };
}

export function calculateSimpleInterest(principal: number, annualRate: number, months: number) {
  const amount = nonNegative(principal); const rate = nonNegative(annualRate) / 100; const period = nonNegative(months); const interest = amount * rate * period / 12;
  return { principal: amount, annualRate: rate, months: period, interest, total: amount + interest };
}

export function calculateInstallment(amount: number, months: number, monthlyFeeRate: number) {
  const purchaseAmount = nonNegative(amount); const period = Math.max(1, safeInteger(months, 1)); const feeRate = nonNegative(monthlyFeeRate) / 100; const fee = purchaseAmount * feeRate * period;
  return { purchaseAmount, months: period, monthlyFeeRate: feeRate, fee, total: purchaseAmount + fee, monthlyPayment: (purchaseAmount + fee) / period };
}

export function calculateCurrencyExchange(amount: number, exchangeRate: number) {
  const sourceAmount = nonNegative(amount); const rate = nonNegative(exchangeRate); return { sourceAmount, exchangeRate: rate, convertedAmount: sourceAmount * rate };
}

export function calculateGpaConversion(currentGpa: number, sourceScale: number, targetScale: number) {
  const source = nonNegative(sourceScale); const target = nonNegative(targetScale); const gpa = Math.max(0, Math.min(source, nonNegative(currentGpa))); const valid = source > 0;
  return { currentGpa: gpa, sourceScale: source, targetScale: target, convertedGpa: valid ? gpa / source * target : 0, percentage: valid ? gpa / source * 100 : 0, valid, message: valid ? "" : "현재 평점 기준 만점은 0보다 커야 합니다." };
}

export function calculateTargetScore(currentScore: number, completedRate: number, targetScore: number) {
  const current = nonNegative(currentScore); const completed = Math.min(100, nonNegative(completedRate)); const target = nonNegative(targetScore); const remainingRate = 100 - completed; const requiredScore = remainingRate > 0 ? (target * 100 - current * completed) / remainingRate : 0;
  return { currentScore: current, completedRate: completed, targetScore: target, remainingRate, requiredScore, valid: remainingRate > 0, message: remainingRate > 0 ? "" : "완료 비율이 100%이면 남은 평가 점수를 계산할 수 없습니다." };
}

export function calculateRankPercent(rank: number, totalPeople: number) {
  const total = Math.max(1, safeInteger(totalPeople, 1)); const normalizedRank = Math.min(total, Math.max(1, safeInteger(rank, 1)));
  return { rank: normalizedRank, totalPeople: total, topPercent: normalizedRank / total * 100, percentile: (total - normalizedRank) / total * 100, peopleBehind: total - normalizedRank };
}

export function calculateLaborCost(hourlyRate: number, people: number, hours: number) {
  const rate = nonNegative(hourlyRate); const count = nonNegative(people); const duration = nonNegative(hours); return { hourlyRate: rate, people: count, hours: duration, perPersonCost: rate * duration, totalCost: rate * count * duration };
}

export function calculateProjectQuote(hourlyRate: number, estimatedHours: number, additionalCost: number, marginRate: number) {
  const rate = nonNegative(hourlyRate); const hours = nonNegative(estimatedHours); const extra = nonNegative(additionalCost); const margin = nonNegative(marginRate) / 100; const baseCost = rate * hours + extra;
  return { hourlyRate: rate, estimatedHours: hours, additionalCost: extra, marginRate: margin, baseCost, marginAmount: baseCost * margin, quote: baseCost * (1 + margin) };
}

export function calculateMonthlyBudget(budget: number, fixedExpense: number, variableExpense: number) {
  const totalBudget = nonNegative(budget); const fixed = nonNegative(fixedExpense); const variable = nonNegative(variableExpense); const spent = fixed + variable; const remaining = totalBudget - spent;
  return { budget: totalBudget, fixedExpense: fixed, variableExpense: variable, spent, remaining, usageRate: totalBudget > 0 ? spent / totalBudget * 100 : 0, overBudget: remaining < 0 };
}

export function calculateRewardPoints(purchaseAmount: number, rewardRate: number, usePoints: number) {
  const purchase = nonNegative(purchaseAmount); const rate = nonNegative(rewardRate) / 100; const used = Math.min(purchase, nonNegative(usePoints)); const cashPayment = purchase - used; return { purchaseAmount: purchase, rewardRate: rate, usePoints: used, cashPayment, earnedPoints: cashPayment * rate };
}

export function calculateReturnRate(purchaseAmount: number, saleAmount: number, costs: number) {
  const purchase = nonNegative(purchaseAmount); const sale = nonNegative(saleAmount); const expense = nonNegative(costs); const invested = purchase + expense; const profit = sale - invested; return { purchaseAmount: purchase, saleAmount: sale, costs: expense, invested, profit, returnRate: invested > 0 ? profit / invested * 100 : 0 };
}


export type FamilyLoanRepayment = "interest-only" | "equal-payment" | "equal-principal";

export function calculateJeonseVsMonthly(jeonseDeposit: number, monthlyDeposit: number, monthlyRent: number, jeonseLoan: number, loanRate: number, expectedReturnRate: number) {
  const values = [jeonseDeposit, monthlyDeposit, monthlyRent, jeonseLoan, loanRate, expectedReturnRate];
  if (values.some((value) => !Number.isFinite(value) || value < 0) || jeonseDeposit < jeonseLoan) return { valid: false, jeonseAnnual: 0, monthlyAnnual: 0, jeonseMonthly: 0, monthlyMonthly: 0, differenceMonthly: 0, differenceAnnual: 0, recommendation: "입력값을 확인하세요." };
  const jeonseMonthly = ((jeonseDeposit - jeonseLoan) * expectedReturnRate / 100 + jeonseLoan * loanRate / 100) / 12;
  const monthlyMonthly = monthlyRent + monthlyDeposit * expectedReturnRate / 100 / 12;
  const jeonseAnnual = jeonseMonthly * 12;
  const monthlyAnnual = monthlyMonthly * 12;
  const differenceMonthly = monthlyMonthly - jeonseMonthly;
  const differenceAnnual = differenceMonthly * 12;
  return { valid: true, jeonseAnnual, monthlyAnnual, jeonseMonthly, monthlyMonthly, differenceMonthly, differenceAnnual, recommendation: differenceAnnual > 0 ? "입력 조건에서는 전세의 연간 비용이 더 낮습니다." : differenceAnnual < 0 ? "입력 조건에서는 월세의 연간 비용이 더 낮습니다." : "입력 조건에서는 두 선택지의 연간 비용이 같습니다." };
}

export function calculateFamilyLoanInterest(principal: number, months: number, annualRate: number, repayment: FamilyLoanRepayment) {
  if (![principal, months, annualRate].every((value) => Number.isFinite(value) && value >= 0) || principal <= 0 || months <= 0) return { valid: false, monthlyPayment: 0, annualInterest: 0, totalInterest: 0, totalRepayment: 0, repayment };
  const monthlyRate = annualRate / 100 / 12;
  if (repayment === "interest-only") {
    const monthlyInterest = principal * monthlyRate;
    return { valid: true, monthlyPayment: monthlyInterest, annualInterest: monthlyInterest * 12, totalInterest: monthlyInterest * months, totalRepayment: principal + monthlyInterest * months, repayment };
  }
  if (repayment === "equal-principal") {
    const principalPayment = principal / months;
    const totalInterest = principal * monthlyRate * (months + 1) / 2;
    return { valid: true, monthlyPayment: principalPayment + principal * monthlyRate, annualInterest: totalInterest / months * 12, totalInterest, totalRepayment: principal + totalInterest, repayment };
  }
  const monthlyPayment = monthlyRate === 0 ? principal / months : principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalRepayment = monthlyPayment * months;
  return { valid: true, monthlyPayment, annualInterest: (totalRepayment - principal) / months * 12, totalInterest: totalRepayment - principal, totalRepayment, repayment };
}

export function calculateRoas(adSpend: number, adRevenue: number, productCost: number, platformFeeRate: number, otherCosts: number) {
  const values = [adSpend, adRevenue, productCost, platformFeeRate, otherCosts];
  if (values.some((value) => !Number.isFinite(value) || value < 0) || platformFeeRate >= 100 || adSpend <= 0) return { valid: false, roas: 0, advertisingRatio: 0, profitAfterAds: 0, breakEvenRoas: 0, totalCosts: 0 };
  const platformFee = adRevenue * platformFeeRate / 100;
  const totalCosts = adSpend + productCost + platformFee + otherCosts;
  const profitAfterAds = adRevenue - totalCosts;
  const breakEvenRevenue = (adSpend + productCost + otherCosts) / (1 - platformFeeRate / 100);
  return { valid: true, roas: adRevenue / adSpend * 100, advertisingRatio: adRevenue > 0 ? adSpend / adRevenue * 100 : 0, profitAfterAds, breakEvenRoas: breakEvenRevenue / adSpend * 100, totalCosts };
}

export function calculateCarMaintenance(vehiclePrice: number, annualDistance: number, fuelEfficiency: number, fuelPrice: number, annualTax: number, annualInsurance: number, annualMaintenance: number, annualOther: number) {
  const values = [vehiclePrice, annualDistance, fuelEfficiency, fuelPrice, annualTax, annualInsurance, annualMaintenance, annualOther];
  if (values.some((value) => !Number.isFinite(value) || value < 0) || annualDistance <= 0 || fuelEfficiency <= 0) return { valid: false, annualFuel: 0, annualTotal: 0, monthlyTotal: 0, fiveYearTotal: 0, perKm: 0 };
  const annualFuel = annualDistance / fuelEfficiency * fuelPrice;
  const annualTotal = annualFuel + annualTax + annualInsurance + annualMaintenance + annualOther;
  return { valid: true, annualFuel, annualTotal, monthlyTotal: annualTotal / 12, fiveYearTotal: annualTotal * 5 + vehiclePrice, perKm: annualTotal / annualDistance };
}

export function calculateRetirementFund(currentAge: number, retirementAge: number, lifeExpectancy: number, currentAssets: number, monthlyLiving: number, monthlyPension: number, expectedReturnRate: number, inflationRate: number) {
  const values = [currentAge, retirementAge, lifeExpectancy, currentAssets, monthlyLiving, monthlyPension, expectedReturnRate, inflationRate];
  if (values.some((value) => !Number.isFinite(value) || value < 0) || retirementAge <= currentAge || lifeExpectancy <= retirementAge || monthlyLiving < monthlyPension) return { valid: false, yearsToRetirement: 0, retirementLiving: 0, requiredAssets: 0, projectedAssets: 0, shortage: 0, additionalMonthlySaving: 0, depletionYears: null as number | null };
  const yearsToRetirement = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  const monthlyReturn = Math.pow(1 + expectedReturnRate / 100, 1 / 12) - 1;
  const monthlyInflation = Math.pow(1 + inflationRate / 100, 1 / 12) - 1;
  const realMonthlyReturn = (1 + monthlyReturn) / (1 + monthlyInflation) - 1;
  const retirementLiving = monthlyLiving * Math.pow(1 + inflationRate / 100, yearsToRetirement);
  const retirementPension = monthlyPension * Math.pow(1 + inflationRate / 100, yearsToRetirement);
  const monthlyGap = Math.max(retirementLiving - retirementPension, 0);
  const realMonthlyGap = monthlyGap / Math.pow(1 + inflationRate / 100, yearsToRetirement);
  const requiredAssets = realMonthlyReturn === 0 ? realMonthlyGap * retirementYears * 12 : realMonthlyGap * (1 - Math.pow(1 + realMonthlyReturn, -retirementYears * 12)) / realMonthlyReturn;
  const projectedAssets = currentAssets * Math.pow(1 + expectedReturnRate / 100, yearsToRetirement);
  const shortage = Math.max(requiredAssets - projectedAssets, 0);
  const monthsToRetirement = yearsToRetirement * 12;
  const annuityFactor = monthlyReturn === 0 ? monthsToRetirement : (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn;
  const additionalMonthlySaving = shortage / Math.max(annuityFactor, 1);
  let balance = projectedAssets;
  let depletionYears: number | null = null;
  for (let year = 1; year <= retirementYears; year += 1) {
    const annualGap = Math.max(monthlyLiving - monthlyPension, 0) * 12 * Math.pow(1 + inflationRate / 100, yearsToRetirement + year - 1);
    balance = balance * (1 + expectedReturnRate / 100) - annualGap;
    if (balance <= 0) { depletionYears = year; break; }
  }
  return { valid: true, yearsToRetirement, retirementLiving, requiredAssets, projectedAssets, shortage, additionalMonthlySaving, depletionYears };
}

export type ExpansionCalculatorKind = "jeonse-vs-monthly" | "family-loan-interest" | "roas" | "maintenance-cost" | "retirement-fund";
