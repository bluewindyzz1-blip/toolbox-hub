import type { CatalogTool } from "@shared/catalog";

export const CALCULATOR_STANDARDS = {
  version: "2026",
  lastUpdated: "2026-08-26",
  financialReviewDate: "2026-01-01",
  generalReviewDate: "상시 기준",
} as const;

export type HubGroup = {
  id: "loan" | "real-estate" | "finance" | "tax" | "salary" | "automobile" | "life";
  label: string;
  description: string;
  logicKeys: string[];
  fallbackPath: string;
  status?: "active" | "planned";
};

export const hubGroups: HubGroup[] = [
  { id: "loan", label: "대출", description: "금리·상환방식·중도상환 비용", logicKeys: ["loan-interest", "loan-amortization", "equal-principal", "bullet-loan", "mortgage", "jeonse-loan-interest", "early-repayment-fee"], fallbackPath: "/calculator/finance" },
  { id: "real-estate", label: "부동산", description: "전월세·주택대출·취득 비용", logicKeys: ["monthly-rent", "rent-conversion", "jeonse-to-monthly", "monthly-to-jeonse", "jeonse-loan-interest", "mortgage", "acquisition-tax", "brokerage-fee", "property-tax", "pyeong"], fallbackPath: "/calculator/real-estate" },
  { id: "finance", label: "금융", description: "예금·적금·복리·비율", logicKeys: ["deposit-interest", "savings", "compound-interest", "percentage", "loan-interest", "loan-amortization"], fallbackPath: "/calculator/finance" },
  { id: "tax", label: "세금", description: "부가세·취득세·재산세", logicKeys: ["vat", "vat-calculator", "acquisition-tax", "property-tax", "retirement-income-tax"], fallbackPath: "/calculator/tax" },
  { id: "salary", label: "급여/직장", description: "연봉·월급·근로·퇴직", logicKeys: ["annual-net", "annual-take-home", "monthly-take-home", "four-insurance", "weekly-holiday-pay", "annual-leave-pay", "hourly-wage", "work-hours", "retirement-pay", "retirement-income-tax", "unemployment-benefit"], fallbackPath: "/calculator/salary" },
  { id: "automobile", label: "자동차", description: "자동차 비용 도구는 준비 중입니다.", logicKeys: [], fallbackPath: "/search" , status: "planned" },
  { id: "life", label: "날짜/생활", description: "평수·퍼센트·단위처럼 일상에서 쓰는 계산", logicKeys: ["pyeong", "percentage", "unit"], fallbackPath: "/calculator/lifestyle" },
];

const relatedLogicKeyMap: Record<string, string[]> = {
  mortgage: ["jeonse-loan-interest", "early-repayment-fee", "acquisition-tax", "brokerage-fee", "monthly-rent", "rent-conversion"],
  "loan-interest": ["loan-amortization", "equal-principal", "bullet-loan", "early-repayment-fee", "mortgage"],
  "loan-amortization": ["loan-interest", "equal-principal", "bullet-loan", "early-repayment-fee", "mortgage"],
  "equal-principal": ["loan-interest", "loan-amortization", "bullet-loan", "early-repayment-fee", "mortgage"],
  "bullet-loan": ["loan-interest", "loan-amortization", "equal-principal", "early-repayment-fee", "mortgage"],
  "jeonse-loan-interest": ["monthly-rent", "rent-conversion", "jeonse-to-monthly", "mortgage", "brokerage-fee"],
  "early-repayment-fee": ["loan-interest", "mortgage", "loan-amortization", "equal-principal"],
  "acquisition-tax": ["brokerage-fee", "mortgage", "monthly-rent", "property-tax"],
  "brokerage-fee": ["acquisition-tax", "mortgage", "monthly-rent", "rent-conversion"],
  "monthly-rent": ["rent-conversion", "jeonse-to-monthly", "monthly-to-jeonse", "jeonse-loan-interest", "brokerage-fee"],
  "rent-conversion": ["monthly-rent", "jeonse-to-monthly", "monthly-to-jeonse", "jeonse-loan-interest"],
  "annual-take-home": ["monthly-take-home", "four-insurance", "retirement-pay", "unemployment-benefit"],
  "monthly-take-home": ["annual-take-home", "four-insurance", "hourly-wage", "retirement-pay"],
  "retirement-pay": ["retirement-income-tax", "unemployment-benefit", "annual-take-home"],
  "vat": ["percentage"],
  "vat-calculator": ["percentage"],
};

export function getContextualRelatedTools(tool: CatalogTool, tools: CatalogTool[]) {
  const desiredKeys = relatedLogicKeyMap[tool.logicKey ?? ""] ?? [];
  const contextual = desiredKeys.map((logicKey) => tools.find((candidate) => candidate.logicKey === logicKey)).filter((candidate): candidate is CatalogTool => Boolean(candidate));
  const explicit = (tool.relatedToolIds ?? []).map((id) => tools.find((candidate) => candidate.id === id)).filter((candidate): candidate is CatalogTool => Boolean(candidate));
  const sameCategory = tools.filter((candidate) => candidate.categoryId === tool.categoryId && candidate.id !== tool.id);
  return [...contextual, ...explicit, ...sameCategory].filter((candidate, index, list) => candidate.id !== tool.id && list.findIndex((item) => item.id === candidate.id) === index).slice(0, 6);
}

export type SharedLoanValues = { amount: number; rate: number; years: number; method?: string };

function safeNumber(value: string | null, fallback: number, min = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
}

export function readSharedLoanValues(defaults: SharedLoanValues): SharedLoanValues {
  if (typeof window === "undefined") return defaults;
  const params = new URLSearchParams(window.location.search);
  if (params.get("share") !== "1") return defaults;
  return {
    amount: safeNumber(params.get("amount"), defaults.amount),
    rate: safeNumber(params.get("rate"), defaults.rate),
    years: safeNumber(params.get("years"), defaults.years, 1),
    method: params.get("method") ?? defaults.method,
  };
}

export async function copySharedLoanUrl(values: SharedLoanValues) {
  if (typeof window === "undefined") return false;
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("share", "1");
  url.searchParams.set("amount", String(values.amount));
  url.searchParams.set("rate", String(values.rate));
  url.searchParams.set("years", String(values.years));
  if (values.method) url.searchParams.set("method", values.method);
  try {
    await navigator.clipboard.writeText(url.toString());
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = url.toString();
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}

export function standardFor(tool: CatalogTool) {
  const variableKeys = new Set(["annual-net", "annual-take-home", "monthly-take-home", "four-insurance", "retirement-pay", "retirement-income-tax", "unemployment-benefit", "loan-interest", "loan-amortization", "equal-principal", "bullet-loan", "mortgage", "jeonse-loan-interest", "early-repayment-fee", "monthly-rent", "rent-conversion", "jeonse-to-monthly", "monthly-to-jeonse", "acquisition-tax", "property-tax", "brokerage-fee", "vat", "vat-calculator"]);
  return {
    basis: variableKeys.has(tool.logicKey ?? "") ? `${CALCULATOR_STANDARDS.version}년 기준` : CALCULATOR_STANDARDS.generalReviewDate,
    lastUpdated: CALCULATOR_STANDARDS.lastUpdated,
  };
}
