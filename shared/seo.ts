import {
  CatalogCategory,
  CatalogSnapshot,
  CatalogTool,
  defaultCatalog,
  getCategoryLineage,
  getCategoryPath,
  getToolPath,
  legacyToolPaths,
} from "./catalog";

export type SeoPageKind = "WebSite" | "WebApplication" | "CollectionPage" | "WebPage";

export type BreadcrumbItem = { name: string; path: string };
export type ToolFaq = { question: string; answer: string };
export type SeoCollectionItem = { name: string; path: string };

export type SeoRoute = {
  title: string;
  description: string;
  canonicalPath: string;
  kind: SeoPageKind;
  robots: "index,follow" | "noindex,nofollow";
  breadcrumbs: BreadcrumbItem[];
  faq: Array<{ question: string; answer: string }>;
  collectionItems: SeoCollectionItem[];
};

export const SITE_NAME = "도구상자";
export const SITE_DESCRIPTION = "생활 계산기, PDF·이미지·문서 파일 변환, 단위 환산을 브라우저에서 바로 사용하는 도구상자";

const staticRouteMeta: Record<string, Pick<SeoRoute, "title" | "description" | "kind" | "robots">> = {
  "/": {
    title: "도구상자 | 생활 계산기·PDF·이미지 파일 변환",
    description: "급여·세금·대출·부동산 계산기와 PDF·이미지·문서 변환, 단위 환산을 설치 없이 한곳에서 이용하세요.",
    kind: "WebSite",
    robots: "index,follow",
  },
  "/about": { title: "도구상자 소개 | 생활 계산기·파일 변환", description: "생활 계산과 브라우저 기반 파일 변환을 제공하는 도구상자의 운영 원칙과 제공 기능을 안내합니다.", kind: "WebPage", robots: "index,follow" },
  "/guide": { title: "도구상자 이용방법 | 계산기·파일 변환 사용 안내", description: "계산기 입력, 파일 변환, 결과 다운로드와 참고사항을 도구상자 이용방법에서 확인하세요.", kind: "WebPage", robots: "index,follow" },
  "/faq": { title: "자주 묻는 질문 | 도구상자", description: "계산 결과의 참고 범위, 브라우저 파일 처리, 개인정보와 광고 안내에 관한 자주 묻는 질문입니다.", kind: "WebPage", robots: "index,follow" },
  "/privacy": { title: "개인정보처리방침 | 도구상자", description: "도구상자의 파일·계산기 입력 처리 방식과 개인정보 보호 방침을 안내합니다.", kind: "WebPage", robots: "index,follow" },
  "/terms": { title: "이용약관 | 도구상자", description: "도구상자 온라인 계산 및 브라우저 기반 파일 처리 서비스의 이용약관입니다.", kind: "WebPage", robots: "index,follow" },
  "/disclaimer": { title: "면책조항 | 도구상자", description: "도구상자 계산 결과와 파일 처리 기능의 참고 범위 및 이용 시 유의사항을 안내합니다.", kind: "WebPage", robots: "index,follow" },
  "/cookie-policy": { title: "쿠키 및 광고 안내 | 도구상자", description: "도구상자의 쿠키, 방문 통계와 Google AdSense 광고 처리 안내입니다.", kind: "WebPage", robots: "index,follow" },
  "/contact": { title: "문의하기 | 도구상자", description: "계산 오류, 파일 변환 오류, 개인정보 문의와 서비스 개선 의견을 도구상자 운영 이메일로 보낼 수 있습니다.", kind: "WebPage", robots: "index,follow" },
  "/document": { title: "문서 변환 도구 | CSV·Excel·JSON·TXT 변환 | 도구상자", description: "CSV·Excel·JSON·TXT 파일을 브라우저에서 형식에 맞게 변환하는 문서 변환 도구입니다.", kind: "WebApplication", robots: "index,follow" },
  "/search": { title: "도구 검색 | 도구상자", description: "계산기, PDF, 이미지, 문서 변환과 단위 변환 도구를 검색합니다.", kind: "WebPage", robots: "noindex,nofollow" },
};

const staticRouteFaq: Record<string, ToolFaq[]> = {
  "/faq": [
    { question: "계산 결과를 실제 계약·신고·급여 지급에 그대로 사용해도 되나요?", answer: "아니요. 계산기는 입력값을 바탕으로 한 참고용 추정입니다. 세금, 금융, 부동산, 급여처럼 중요한 판단 전에는 공식 기관의 최신 기준, 계약서 또는 전문가 안내를 확인하세요." },
    { question: "파일은 서버에 업로드되거나 저장되나요?", answer: "현재 제공되는 파일 도구는 브라우저 안에서 처리합니다. 선택 파일과 처리 결과는 서버에 업로드하거나 장기 저장하지 않으며, 탭을 닫거나 초기화하면 작업 데이터가 사라집니다." },
    { question: "파일 변환이 실패하면 어떻게 하나요?", answer: "파일 형식과 크기를 먼저 확인하고, 브라우저를 새로고침한 뒤 다시 시도하세요. 복잡한 PDF, 암호화된 파일 또는 기기 메모리 제한에 따라 일부 기능이 실패할 수 있으므로 원본 파일은 별도로 보관하세요." },
    { question: "도구상자는 무료로 사용할 수 있나요?", answer: "현재 공개된 계산기와 브라우저 기반 파일 도구는 별도 회원가입 없이 사용할 수 있습니다. 광고 표시 여부와 기능 제공 범위는 운영 정책에 따라 달라질 수 있습니다." },
    { question: "오류나 개선 의견은 어디에 문의하나요?", answer: "문의하기 페이지의 양식을 이용하면 사용 중인 이메일 앱에서 운영 이메일로 메시지를 보낼 수 있습니다. 계산 오류는 입력값과 재현 방법을 함께 보내면 확인에 도움이 됩니다." },
  ],
};

const coreCalculatorFaq: Record<string, ToolFaq[]> = {
  "monthly-rent": [
    { question: "관리비도 실질 월 지출에 포함되나요?", answer: "이 계산기는 입력한 월세와 보증금의 월 환산액을 기준으로 합니다. 관리비, 공과금, 이사비 등은 계약 조건에 따라 달라 별도로 더해 확인하세요." },
    { question: "보증금 전환율은 무엇을 입력하면 되나요?", answer: "계약서나 비교하려는 기준의 연 전환율을 입력하세요. 전환율은 보증금을 월 비용으로 비교하기 위한 가정값이므로, 실제 계약의 월세·보증금 조건이 우선합니다." },
  ],
  "loan-interest": [
    { question: "원리금균등과 원금균등상환은 무엇이 다른가요?", answer: "원리금균등은 매월 납입액이 비교적 일정하고, 원금균등은 매월 갚는 원금이 같아 초기 납입액이 더 크지만 시간이 갈수록 줄어듭니다." },
    { question: "계산 결과가 금융기관 상환표와 다른 이유는 무엇인가요?", answer: "실제 대출은 납입일, 거치기간, 중도상환, 금리 변동, 원 단위 절사와 상품 조건에 따라 달라질 수 있습니다. 약정서와 금융기관 상환표를 확인하세요." },
  ],
  "annual-net": [
    { question: "간편 연봉 실수령액과 실제 급여명세서는 왜 다를 수 있나요?", answer: "비과세 급여, 부양가족, 원천징수 선택 비율, 상여금과 연말정산 결과에 따라 실제 공제액이 달라질 수 있습니다. 이 도구는 빠른 참고용 추정입니다." },
    { question: "연봉을 월급으로 나눌 때 상여금도 포함하나요?", answer: "입력한 연봉을 기준으로 월 단위 예상 금액을 계산합니다. 상여금 지급 시기나 급여 구성은 회사의 급여 규정과 근로계약서를 확인하세요." },
  ],
  "pyeong": [
    { question: "1평은 몇 제곱미터인가요?", answer: "1평은 약 3.305785제곱미터입니다. 이 도구는 이 환산 기준으로 평과 제곱미터를 서로 변환합니다." },
    { question: "전용면적과 공급면적은 어떻게 다른가요?", answer: "전용면적은 실제로 단독 사용 가능한 면적이고, 공급면적은 주거공용면적을 더한 면적입니다. 광고나 계약서를 볼 때 어떤 면적인지 함께 확인하세요." },
  ],
  "retirement-pay": [
    { question: "퇴직금은 누구나 받을 수 있나요?", answer: "계속 근로기간과 주 평균 소정근로시간 등 법정 요건에 따라 달라질 수 있습니다. 실제 수급 요건과 지급 기준은 고용노동부 안내 및 회사 규정을 확인하세요." },
    { question: "퇴직금 계산의 평균임금은 어떻게 확인하나요?", answer: "통상적으로 퇴직 전 일정 기간의 임금 총액을 기준으로 산정하지만, 임금 항목과 산정 기간에 따라 달라질 수 있습니다. 급여명세서와 회사의 정산 내역을 함께 확인하세요." },
  ],
  "vat-calculator": [
    { question: "부가세 포함 금액에서 공급가액은 어떻게 계산하나요?", answer: "일반적인 10% 부가세 기준에서는 부가세 포함 금액을 1.1로 나누어 공급가액을 구하고, 차액을 부가세로 볼 수 있습니다." },
    { question: "계산 결과로 부가세 신고 금액을 확정할 수 있나요?", answer: "아니요. 매출·매입 세액공제, 영세율, 면세, 가산세와 신고 요건은 반영하지 않은 기본 계산입니다. 실제 신고는 국세청 안내와 증빙을 기준으로 확인하세요." },
  ],
  "rent-conversion": [
    { question: "전월세 전환율은 어떻게 비교하면 되나요?", answer: "보증금과 월세를 한 기준으로 비교하기 위한 연 환산 비율입니다. 같은 계약 조건에서 여러 전환율을 넣어 월 부담 차이를 비교해 볼 수 있습니다." },
    { question: "법정 전환율과 계약 전환율은 항상 같은가요?", answer: "적용 기준과 계약 유형, 시점에 따라 확인해야 할 사항이 있을 수 있습니다. 이 도구는 입력한 전환율로 환산만 하므로 실제 계약 전에는 최신 공식 기준과 계약서를 확인하세요." },
  ],
  "jeonse-to-monthly": [
    { question: "전세금을 월세로 바꿀 때 무엇을 확인해야 하나요?", answer: "전세 보증금, 적용 전환율, 관리비와 계약 기간을 함께 비교하세요. 이 계산은 보증금의 월 환산액을 보여 주는 참고값입니다." },
    { question: "환산한 월세에 관리비가 포함되나요?", answer: "포함되지 않습니다. 관리비와 공과금은 별도 조건이므로 실제 월 부담을 비교할 때 추가하세요." },
  ],
  "monthly-to-jeonse": [
    { question: "월세를 전세 보증금으로 환산할 때 전환율이 왜 필요한가요?", answer: "월세와 전세 보증금은 단위가 달라 바로 비교하기 어렵습니다. 전환율은 월세를 보증금 기준으로 바꾸기 위한 가정값입니다." },
    { question: "환산 보증금이 실제 계약 가능 금액을 뜻하나요?", answer: "아니요. 지역 시세, 주택 상태, 계약 기간과 협상 조건은 반영하지 않은 산술 환산 결과입니다." },
  ],
  "loan-amortization": [
    { question: "원리금균등상환의 월 납입액은 왜 거의 일정한가요?", answer: "매월 원금과 이자의 합계가 일정하도록 계산하는 방식입니다. 기간이 지날수록 이자 비중은 줄고 원금 비중은 커집니다." },
    { question: "거치기간이 있는 대출도 계산할 수 있나요?", answer: "이 도구는 일반적인 상환 시작 기준을 제공합니다. 거치기간이나 변동금리가 있으면 실제 상환표와 다를 수 있습니다." },
  ],
  "deposit-interest": [
    { question: "예금 이자는 세전 금액인가요?", answer: "이 도구의 결과는 입력한 금리와 기간으로 계산한 예상 이자입니다. 실제 세후 수령액은 상품의 과세 방식과 우대금리 조건을 함께 확인하세요." },
    { question: "중도 해지하면 같은 금리가 적용되나요?", answer: "일반적으로 중도 해지 시 약정금리와 다른 중도해지 이율이 적용될 수 있습니다. 상품설명서와 금융기관 조건을 확인하세요." },
  ],
  "savings": [
    { question: "적금은 매월 같은 날 납입해야 하나요?", answer: "이 도구는 일정하게 납입하는 일반적인 경우를 가정합니다. 실제 상품의 납입일, 자유적립 여부와 우대 조건에 따라 결과가 달라질 수 있습니다." },
    { question: "적금 만기 예상액은 세후 금액인가요?", answer: "세금과 우대금리 충족 여부는 반영 범위가 다를 수 있습니다. 실제 만기 수령액은 상품설명서의 이자 계산 및 과세 조건을 확인하세요." },
  ],
};

const prioritySearchFaq: Record<string, ToolFaq[]> = {
  "monthly-take-home": [
    { question: "월급 실수령액은 왜 사람마다 다른가요?", answer: "월 세전 급여가 같아도 비과세 급여, 부양가족·자녀 수, 보수월액, 원천징수 선택비율과 연말정산 공제에 따라 공제액이 달라질 수 있습니다." },
  ],
  "annual-take-home": [
    { question: "같은 연봉인데 월 실수령액이 다른 이유는 무엇인가요?", answer: "상여금 지급 방식, 비과세 항목, 부양가족과 자녀 수, 원천징수와 연말정산 조건에 따라 실제 월별 수령액은 달라질 수 있습니다." },
  ],
  "four-insurance": [
    { question: "4대보험과 사대보험은 같은 말인가요?", answer: "일반적으로 국민연금, 건강보험, 장기요양보험, 고용보험을 묶어 4대보험 또는 사대보험이라고 부릅니다. 사업장과 가입 유형에 따라 실제 부담 항목은 달라질 수 있습니다." },
  ],
  "weekly-holiday-pay": [
    { question: "주 15시간이면 주휴수당을 받을 수 있나요?", answer: "주 평균 소정근로시간, 해당 주 개근 여부와 근로계약 조건을 함께 확인해야 합니다. 이 도구는 입력한 시간과 개근 가정으로 참고용 금액을 보여 줍니다." },
  ],
  "unemployment-benefit": [
    { question: "계산 결과가 나오면 실업급여를 받을 수 있나요?", answer: "아니요. 퇴사 사유, 피보험단위기간, 재취업활동 등 수급 요건은 고용센터가 최종 판단합니다. 이 도구는 입력한 월급·나이·가입기간에 따른 참고용 추정입니다." },
  ],
  "retirement-pay": [
    { question: "퇴직금 계산에 최근 3개월 임금 합계를 넣는 이유는 무엇인가요?", answer: "이 도구는 최근 임금과 총일수를 바탕으로 평균임금을 구해 예상 퇴직금을 계산합니다. 실제 임금 항목과 산정 기간은 급여명세서·회사 정산 내역을 함께 확인하세요." },
  ],
  "loan-interest": [
    { question: "원리금균등과 원금균등의 월 상환액은 왜 다른가요?", answer: "원리금균등은 매월 납입액이 비교적 일정하도록 계산하고, 원금균등은 매월 같은 원금을 갚아 초기 납입액이 더 크지만 시간이 갈수록 줄어듭니다." },
  ],
  "monthly-rent": [
    { question: "관리비도 실질 월세에 포함되나요?", answer: "이 도구는 입력한 월세와 보증금의 월 환산액을 계산합니다. 관리비·공과금·이사비 등 계약별 비용은 별도로 더해 비교하세요." },
  ],
  "brokerage-fee": [
    { question: "복비와 부동산 중개수수료는 같은 뜻인가요?", answer: "일상적으로 복비는 부동산 중개보수 또는 중개수수료를 뜻합니다. 이 도구는 주택 거래금액별 중개보수 상한액을 계산하며 실제 지급액은 협의와 지역 기준을 확인해야 합니다." },
  ],
};

const calculatorCategoryFaq: Record<string, ToolFaq[]> = {
  calculator: [
    { question: "어떤 계산기를 찾을 수 있나요?", answer: "급여·직장인, 금융, 부동산, 세금, 날짜·시간, 생활 분야로 나누어 필요한 계산기를 찾을 수 있습니다. 각 도구는 입력값에 따라 예상 결과를 빠르게 보여 드립니다." },
    { question: "계산 결과를 계약이나 신고에 바로 사용해도 되나요?", answer: "아니요. 계산 결과는 입력값 기준의 참고용 추정입니다. 실제 급여, 대출, 세금, 부동산 계약은 최신 공식 기준과 계약서 또는 전문가 안내를 함께 확인하세요." },
  ],
  finance: [
    { question: "금융 계산기에서는 무엇을 계산할 수 있나요?", answer: "대출 이자와 상환 방식, 예금·적금 이자, 복리 수익, 퍼센트와 증감률을 입력 조건에 따라 계산할 수 있습니다." },
    { question: "대출 상환액이 금융기관 안내와 다를 수 있나요?", answer: "그럴 수 있습니다. 실제 상환액은 납입일, 거치기간, 변동금리, 수수료, 원 단위 절사와 상품 약정에 따라 달라질 수 있으므로 약정서와 상환표를 확인하세요." },
  ],
  "real-estate": [
    { question: "부동산 계산기로 어떤 비용을 비교할 수 있나요?", answer: "월세·전세 환산, 전세·주택담보대출 이자, 부동산 중개수수료, 취득세·재산세와 중도상환수수료를 조건별로 비교할 수 있습니다." },
    { question: "부동산 계산 결과가 실제 계약 비용과 같은가요?", answer: "아니요. 거래 유형, 지역, 주택 조건, 적용 시점과 협의 내용에 따라 실제 비용은 달라질 수 있습니다. 계약 전에는 최신 공식 기준과 계약서를 확인하세요." },
  ],
  salary: [
    { question: "급여 계산기에는 어떤 항목이 있나요?", answer: "연봉·월급 실수령액, 4대보험, 퇴직금, 주휴수당, 연차수당, 시급·근무시간과 실업급여 관련 참고 계산기를 제공합니다." },
    { question: "실수령액이 급여명세서와 다른 이유는 무엇인가요?", answer: "비과세 항목, 부양가족, 상여금, 근무시간, 원천징수와 연말정산 조건에 따라 실제 공제와 지급액은 달라질 수 있습니다." },
  ],
  tax: [
    { question: "세금 계산기 결과로 신고 금액을 확정할 수 있나요?", answer: "아니요. 이 도구는 일반적인 입력 조건의 참고 계산입니다. 공제·가산세·특례·신고 의무 등 실제 세무 판단은 최신 국세 안내와 증빙을 기준으로 확인하세요." },
    { question: "어떤 세금 계산기를 제공하나요?", answer: "부가세, 종합소득세, 연말정산 환급금, 양도소득세, 증여세와 상속세의 기본 입력값 기반 계산기를 제공합니다." },
  ],
  lifestyle: [
    { question: "생활 계산기에는 어떤 도구가 있나요?", answer: "할인율, 마진율, 손익분기점, 주유비, 더치페이, 평균, BMI, 기초대사량, 칼로리 소모와 학점 평균 계산기를 제공합니다." },
    { question: "BMI와 기초대사량 결과는 건강 진단인가요?", answer: "아니요. 건강 관련 결과는 입력값을 바탕으로 한 일반적인 참고 지표이며, 건강 상태의 진단이나 치료 결정을 대신하지 않습니다." },
  ],
  date: [
    { question: "날짜 계산기에서 무엇을 확인할 수 있나요?", answer: "기준일에서 날짜를 더하거나 빼는 계산, 두 날짜 차이, D-Day, 만 나이·세는 나이, 시간 단위 환산을 확인할 수 있습니다." },
    { question: "D-Day 계산에 기준일과 목표일을 모두 입력해야 하나요?", answer: "네. 기준일과 목표일을 입력하면 남은 일수 또는 지난 일수를 계산합니다. 시간대나 당일 포함 여부에 따라 실제 일정 표기와 차이가 날 수 있습니다." },
  ],
};

const defaultFaq: ToolFaq[] = [
  { question: "계산 결과를 실제 계약 또는 지급 금액으로 사용해도 되나요?", answer: "이 도구는 입력값에 따른 참고용 결과를 제공합니다. 실제 계약, 세금, 금융 상품 조건은 관련 기관 또는 전문가에게 확인하세요." },
  { question: "입력한 정보는 저장되나요?", answer: "계산 입력값은 현재 브라우저에서만 사용되며, 카테고리나 도구 데이터와 별도로 저장하지 않습니다." },
];

export function getVisibleToolFaq(tool: CatalogTool): ToolFaq[] {
  const merged = [...(tool.faq ?? []), ...(coreCalculatorFaq[tool.slug] ?? []), ...(prioritySearchFaq[tool.slug] ?? [])];
  return merged.filter((item, index) => merged.findIndex((candidate) => candidate.question === item.question) === index);
}

export function getStaticRouteFaq(path: string): ToolFaq[] {
  return staticRouteFaq[normalizePath(path)] ?? [];
}

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  const value = path.split("?")[0].replace(/\/+$/, "");
  return value.startsWith("/") ? value : `/${value}`;
}

function withBrand(title: string) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

function getCatalog(catalog?: CatalogSnapshot) {
  return catalog ?? defaultCatalog;
}

function findToolByPath(path: string, catalog: CatalogSnapshot) {
  const canonical = catalog.tools.find((tool) => getToolPath(tool, catalog.categories) === path);
  if (canonical) return canonical;
  return catalog.tools.find((tool) => legacyToolPaths[tool.slug] === path);
}

function categoryBreadcrumbs(category: CatalogCategory, catalog: CatalogSnapshot): BreadcrumbItem[] {
  return [
    { name: "홈", path: "/" },
    ...getCategoryLineage(category, catalog.categories).map((item) => ({ name: item.name, path: getCategoryPath(item, catalog.categories) })),
  ];
}

function categoryCollectionItems(category: CatalogCategory, catalog: CatalogSnapshot): SeoCollectionItem[] {
  return catalog.tools
    .filter((tool) => tool.status === "active")
    .filter((tool) => {
      const toolCategory = catalog.categories.find((item) => item.id === tool.categoryId);
      return Boolean(toolCategory && getCategoryLineage(toolCategory, catalog.categories).some((item) => item.id === category.id));
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    .slice(0, 24)
    .map((tool) => ({ name: tool.title, path: getToolPath(tool, catalog.categories) }));
}

function fallback(path: string): SeoRoute {
  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    canonicalPath: path,
    kind: "WebPage",
    robots: "index,follow",
    breadcrumbs: [{ name: "홈", path: "/" }],
    faq: [],
    collectionItems: [],
  };
}

export function resolveSeoRoute(rawPath: string, suppliedCatalog?: CatalogSnapshot): SeoRoute {
  const path = normalizePath(rawPath);
  const catalog = getCatalog(suppliedCatalog);
  const staticMeta = staticRouteMeta[path];
  if (staticMeta) {
    return {
      ...staticMeta,
      canonicalPath: path,
      breadcrumbs: path === "/" ? [{ name: "홈", path: "/" }] : [{ name: "홈", path: "/" }, { name: staticMeta.title.replace(` | ${SITE_NAME}`, ""), path }],
      faq: getStaticRouteFaq(path),
      collectionItems: [],
    };
  }

  const tool = findToolByPath(path, catalog);
  if (tool) {
    const category = catalog.categories.find((item) => item.id === tool.categoryId);
    const canonicalPath = getToolPath(tool, catalog.categories);
    const breadcrumbs = category ? [...categoryBreadcrumbs(category, catalog), { name: tool.title, path: canonicalPath }] : [{ name: "홈", path: "/" }, { name: tool.title, path: canonicalPath }];
    return {
      title: withBrand(tool.seoTitle?.trim() || tool.title),
      description: tool.seoDescription?.trim() || tool.description,
      canonicalPath,
      kind: "WebApplication",
      robots: "index,follow",
      breadcrumbs,
      faq: tool.kind === "calculator" ? [...getVisibleToolFaq(tool), ...defaultFaq] : [],
      collectionItems: [],
    };
  }

  const category = catalog.categories.find((item) => getCategoryPath(item, catalog.categories) === path);
  if (category) {
    return {
      title: withBrand(category.seoTitle?.trim() || category.name),
      description: category.seoDescription?.trim() || category.description || SITE_DESCRIPTION,
      canonicalPath: path,
      kind: "CollectionPage",
      robots: "index,follow",
      breadcrumbs: categoryBreadcrumbs(category, catalog),
      faq: category.slug in calculatorCategoryFaq ? calculatorCategoryFaq[category.slug] : [],
      collectionItems: categoryCollectionItems(category, catalog),
    };
  }

  return fallback(path);
}

export function getSeoPublicPaths(catalog: CatalogSnapshot = defaultCatalog) {
  const staticPaths = Object.keys(staticRouteMeta).filter((path) => path !== "/search");
  const categoryPaths = catalog.categories
    .filter((category) => category.parentId === null || catalog.categories.some((root) => root.id === category.parentId && root.parentId === null))
    .filter((category) => catalog.tools.some((tool) => getCategoryLineage(catalog.categories.find((item) => item.id === tool.categoryId)!, catalog.categories).some((lineage) => lineage.id === category.id)))
    .map((category) => getCategoryPath(category, catalog.categories));
  const toolPaths = catalog.tools.filter((tool) => tool.status === "active").map((tool) => getToolPath(tool, catalog.categories));
  return Array.from(new Set([...staticPaths, ...categoryPaths, ...toolPaths])).sort();
}

export function toAbsoluteUrl(path: string, origin?: string) {
  const base = (origin || "https://carculate.moneyko.co.kr").replace(/\/$/, "");
  return `${base}${normalizePath(path)}`;
}
