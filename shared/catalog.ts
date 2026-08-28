export type CatalogStatus = "active" | "inactive" | "draft";
export type CatalogKind = "calculator" | "converter" | "unit";

export type CatalogCategory = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  status: CatalogStatus;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CatalogTool = {
  id: number;
  categoryId: number;
  slug: string;
  title: string;
  description: string;
  kind: CatalogKind;
  inputs: Record<string, unknown> | null;
  formula: string | null;
  faq: Array<{ question: string; answer: string }> | null;
  relatedToolIds: number[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: CatalogStatus;
  sortOrder: number;
  logicKey: string | null;
  isPopular?: boolean;
  searchKeywords?: string[] | null;
};

export type CatalogSnapshot = { categories: CatalogCategory[]; tools: CatalogTool[] };

export const rootPathBySlug: Record<string, string> = {
  calculator: "/calculator",
  convert: "/convert",
  units: "/units",
};

export const legacyToolPaths: Record<string, string> = {
  "monthly-rent": "/rent",
  "loan-interest": "/loan",
  "vat-calculator": "/vat",
  "pdf-convert": "/pdf",
  "image-convert": "/image",
  "unit-convert": "/unit",
};

function findCategory(id: number | null, categories: CatalogCategory[]) {
  return id === null ? undefined : categories.find((item) => item.id === id);
}

export function getCategoryLineage(category: CatalogCategory, categories: CatalogCategory[]) {
  const lineage: CatalogCategory[] = [];
  let current: CatalogCategory | undefined = category;
  while (current) {
    lineage.unshift(current);
    current = findCategory(current.parentId, categories);
  }
  return lineage;
}

export function getRootCategory(category: CatalogCategory, categories: CatalogCategory[]) {
  return getCategoryLineage(category, categories)[0];
}

export function getRootPath(root: CatalogCategory) {
  return rootPathBySlug[root.slug] ?? `/catalog/${root.slug}`;
}

export function getToolPath(tool: CatalogTool, categories: CatalogCategory[]) {
  const category = findCategory(tool.categoryId, categories);
  if (!category) return "/";
  const lineage = getCategoryLineage(category, categories);
  const root = lineage[0];
  const firstBranch = lineage[1];
  if (!root) return "/";
  return firstBranch ? `${getRootPath(root)}/${firstBranch.slug}/${tool.slug}` : `${getRootPath(root)}/${tool.slug}`;
}

export function getCategoryPath(category: CatalogCategory, categories: CatalogCategory[]) {
  const lineage = getCategoryLineage(category, categories);
  const root = lineage[0];
  const firstBranch = lineage[1];
  if (!root) return "/";
  return firstBranch ? `${getRootPath(root)}/${firstBranch.slug}` : getRootPath(root);
}

const tool = (values: Omit<CatalogTool, "isPopular" | "searchKeywords"> & { isPopular?: boolean; searchKeywords?: string[] }): CatalogTool => values;

export const defaultCatalog: CatalogSnapshot = {
  categories: [
    { id: 1, parentId: null, name: "계산기", slug: "calculator", description: "생활과 업무에 필요한 계산기", icon: "Calculator", sortOrder: 1, status: "active", seoTitle: "실용 계산기 모음", seoDescription: "금융, 부동산, 급여, 세금 계산기를 제공합니다." },
    { id: 2, parentId: 1, name: "금융 계산기", slug: "finance", description: "대출, 이자와 비율 관련 계산", icon: "Landmark", sortOrder: 1, status: "active", seoTitle: "금융 계산기", seoDescription: "대출 상환, 이자, 수익과 비율을 계산합니다." },
    { id: 3, parentId: 1, name: "부동산 계산기", slug: "real-estate", description: "전월세, 대출, 비용과 세금 계산", icon: "Building2", sortOrder: 2, status: "active", seoTitle: "부동산 계산기", seoDescription: "전월세, 주택 대출, 부동산 비용과 세금을 계산합니다." },
    { id: 4, parentId: 1, name: "급여·직장인 계산기", slug: "salary", description: "급여와 퇴직금 추정", icon: "WalletCards", sortOrder: 3, status: "active", seoTitle: "급여 계산기", seoDescription: "연봉 실수령액과 퇴직금을 추정합니다." },
    { id: 5, parentId: 1, name: "세금 계산기", slug: "tax", description: "사업과 생활 세금 계산", icon: "ReceiptText", sortOrder: 4, status: "active", seoTitle: "세금 계산기", seoDescription: "부가세를 간편하게 계산합니다." },
    { id: 6, parentId: 1, name: "생활 계산기", slug: "lifestyle", description: "일상에서 쓰는 계산", icon: "Clock3", sortOrder: 5, status: "active", seoTitle: "생활 계산기", seoDescription: "일상 생활 계산 도구를 제공합니다." },
    { id: 7, parentId: 1, name: "건강 계산기", slug: "health", description: "건강 지표 계산", icon: "HeartPulse", sortOrder: 6, status: "active", seoTitle: "건강 계산기", seoDescription: "건강 관련 계산 도구입니다." },
    { id: 8, parentId: null, name: "파일 변환", slug: "convert", description: "브라우저 안에서 처리하는 파일 도구", icon: "FileOutput", sortOrder: 2, status: "active", seoTitle: "파일 변환 도구", seoDescription: "PDF와 이미지를 브라우저에서 변환합니다." },
    { id: 9, parentId: 8, name: "PDF 변환", slug: "pdf", description: "PDF와 이미지 변환", icon: "FileText", sortOrder: 1, status: "active", seoTitle: "PDF 변환", seoDescription: "PDF를 이미지나 Word 호환 문서로 변환합니다." },
    { id: 10, parentId: 8, name: "PDF 편집", slug: "pdf-edit", description: "PDF 편집 도구", icon: "FilePenLine", sortOrder: 2, status: "active", seoTitle: "PDF 편집", seoDescription: "PDF 편집 도구를 준비 중입니다." },
    { id: 11, parentId: 8, name: "이미지 변환", slug: "image", description: "이미지 포맷과 크기 변환", icon: "Image", sortOrder: 3, status: "active", seoTitle: "이미지 변환", seoDescription: "JPG, PNG, WebP를 변환합니다." },
    { id: 12, parentId: 8, name: "문서 변환", slug: "document", description: "문서 파일 변환", icon: "Files", sortOrder: 4, status: "active", seoTitle: "문서 변환", seoDescription: "문서 변환 도구를 준비 중입니다." },
    { id: 13, parentId: 8, name: "파일 압축", slug: "compression", description: "파일 크기 최적화", icon: "Archive", sortOrder: 5, status: "active", seoTitle: "파일 압축", seoDescription: "파일 압축 도구를 준비 중입니다." },
    { id: 14, parentId: null, name: "단위 변환", slug: "units", description: "자주 쓰는 단위 환산", icon: "Ruler", sortOrder: 3, status: "active", seoTitle: "단위 변환기", seoDescription: "길이, 면적, 무게, 온도를 변환합니다." },
    { id: 15, parentId: 14, name: "길이", slug: "length", description: "길이 단위 변환", icon: "MoveHorizontal", sortOrder: 1, status: "active", seoTitle: "길이 단위 변환", seoDescription: "길이 단위를 빠르게 변환합니다." },
    { id: 16, parentId: 14, name: "면적", slug: "area", description: "면적과 평수 변환", icon: "SquareDashed", sortOrder: 2, status: "active", seoTitle: "면적 단위 변환", seoDescription: "면적과 평수를 변환합니다." },
    { id: 17, parentId: 14, name: "무게", slug: "weight", description: "무게 단위 변환", icon: "Weight", sortOrder: 3, status: "active", seoTitle: "무게 단위 변환", seoDescription: "무게 단위를 변환합니다." },
    { id: 18, parentId: 14, name: "부피", slug: "volume", description: "부피 단위 변환", icon: "FlaskConical", sortOrder: 4, status: "active", seoTitle: "부피 단위 변환", seoDescription: "부피 단위를 변환합니다." },
    { id: 19, parentId: 14, name: "온도", slug: "temperature", description: "온도 단위 변환", icon: "Thermometer", sortOrder: 5, status: "active", seoTitle: "온도 단위 변환", seoDescription: "온도 단위를 변환합니다." },
    { id: 20, parentId: 14, name: "속도", slug: "speed", description: "속도 단위 변환", icon: "Gauge", sortOrder: 6, status: "active", seoTitle: "속도 단위 변환", seoDescription: "속도 단위를 변환합니다." },
    { id: 21, parentId: 14, name: "데이터", slug: "data", description: "데이터 용량 변환", icon: "Database", sortOrder: 7, status: "active", seoTitle: "데이터 단위 변환", seoDescription: "데이터 단위를 변환합니다." },
    { id: 22, parentId: 3, name: "대출", slug: "real-estate-loan", description: "전세·주택담보 대출 비용", icon: "Landmark", sortOrder: 1, status: "active", seoTitle: "부동산 대출 계산기", seoDescription: "전세대출 이자와 주택담보대출 상환액을 계산합니다." },
    { id: 23, parentId: 3, name: "부동산 비용", slug: "real-estate-cost", description: "중도상환·중개보수 비용", icon: "BadgeDollarSign", sortOrder: 2, status: "active", seoTitle: "부동산 비용 계산기", seoDescription: "중도상환수수료와 부동산 중개보수를 계산합니다." },
    { id: 24, parentId: 3, name: "부동산 세금", slug: "real-estate-tax", description: "주택 취득·보유 세금", icon: "Landmark", sortOrder: 3, status: "active", seoTitle: "부동산 세금 계산기", seoDescription: "취득세와 재산세의 기본 계산을 제공합니다." },
    { id: 25, parentId: 2, name: "이자·수익", slug: "finance-return", description: "복리 수익 계산", icon: "ChartNoAxesCombined", sortOrder: 1, status: "active", seoTitle: "이자 수익 계산기", seoDescription: "복리 기준의 원금과 이자를 계산합니다." },
    { id: 26, parentId: 2, name: "대출", slug: "finance-loan", description: "상환 방식별 대출 계산", icon: "CircleDollarSign", sortOrder: 2, status: "active", seoTitle: "대출 상환 계산기", seoDescription: "원금균등과 만기일시상환을 계산합니다." },
    { id: 27, parentId: 2, name: "퍼센트·비율", slug: "finance-percentage", description: "비율과 증감 계산", icon: "Percent", sortOrder: 3, status: "active", seoTitle: "퍼센트 계산기", seoDescription: "퍼센트 값과 증감률을 계산합니다." },
    { id: 28, parentId: 4, name: "급여", slug: "salary-pay", description: "연봉·월급 실수령액과 4대보험", icon: "WalletCards", sortOrder: 1, status: "active", seoTitle: "급여 계산기", seoDescription: "연봉과 월급의 예상 실수령액, 4대보험을 계산합니다." },
    { id: 29, parentId: 4, name: "근로·수당", slug: "salary-allowance", description: "주휴·연차·시급·근무시간", icon: "Clock3", sortOrder: 2, status: "active", seoTitle: "근로 수당 계산기", seoDescription: "주휴수당, 연차수당, 시급과 근무시간을 계산합니다." },
    { id: 30, parentId: 4, name: "퇴직·고용", slug: "salary-retirement", description: "퇴직금·퇴직소득세·실업급여", icon: "BriefcaseBusiness", sortOrder: 3, status: "active", seoTitle: "퇴직 및 고용 계산기", seoDescription: "퇴직금, 퇴직소득세와 실업급여를 추정합니다." },
    { id: 31, parentId: 1, name: "날짜·시간 계산기", slug: "date", description: "날짜, D-Day, 나이와 시간 계산", icon: "CalendarDays", sortOrder: 7, status: "active", seoTitle: "날짜 계산기", seoDescription: "날짜 더하기, 날짜 차이, D-Day, 나이와 시간 계산기를 제공합니다." },
  ],
  tools: [
    tool({ id: 401, categoryId: 31, slug: "date-calculator", title: "날짜 계산기", description: "기준일에서 연·월·일을 더하거나 빼 결과 날짜를 계산합니다.", kind: "calculator", inputs: null, formula: "기준일에 연·월·일을 더하거나 뺍니다.", faq: null, relatedToolIds: [402, 405, 406], seoTitle: "날짜 계산기 | 날짜 더하기·빼기", seoDescription: "기준일에서 연·월·일을 더하거나 빼 계산 결과 날짜를 확인합니다.", status: "active", sortOrder: 1, logicKey: "date-calculator", isPopular: true, searchKeywords: ["날짜 계산", "날짜 더하기", "날짜 빼기"] }),
    tool({ id: 402, categoryId: 31, slug: "d-day", title: "D-Day 계산기", description: "기준일과 목표일을 입력해 D-Day와 남은 일수를 계산합니다.", kind: "calculator", inputs: null, formula: "D-Day = 목표일 − 기준일", faq: null, relatedToolIds: [401, 405, 403], seoTitle: "D-Day 계산기 | 디데이·남은 날짜", seoDescription: "기준일과 목표일을 입력해 D-Day와 남은 날짜를 계산합니다.", status: "active", sortOrder: 2, logicKey: "d-day", isPopular: true, searchKeywords: ["D-Day", "디데이", "남은 날짜", "기념일"] }),
    tool({ id: 403, categoryId: 31, slug: "age", title: "나이 계산기", description: "생년월일과 기준일로 만 나이·세는 나이·연 나이를 비교합니다.", kind: "calculator", inputs: null, formula: "기준연도와 출생연도의 차이에 생일 경과 여부를 반영합니다.", faq: null, relatedToolIds: [404, 405], seoTitle: "나이 계산기 | 만 나이·세는 나이", seoDescription: "생년월일과 기준일로 만 나이, 세는 나이와 연 나이를 계산합니다.", status: "active", sortOrder: 3, logicKey: "age", searchKeywords: ["나이 계산", "만 나이", "세는 나이", "연 나이"] }),
    tool({ id: 404, categoryId: 31, slug: "man-age", title: "만 나이 계산기", description: "생년월일과 기준일로 현재 만 나이와 다음 생일까지 남은 날짜를 계산합니다.", kind: "calculator", inputs: null, formula: "기준일의 생일 경과 여부를 반영해 만 나이를 계산합니다.", faq: null, relatedToolIds: [403, 405], seoTitle: "만 나이 계산기 | 현재 만 나이", seoDescription: "생년월일과 기준일로 현재 만 나이와 다음 생일까지 남은 날짜를 계산합니다.", status: "active", sortOrder: 4, logicKey: "man-age", searchKeywords: ["만 나이", "만나이 계산", "한국 나이"] }),
    tool({ id: 405, categoryId: 31, slug: "date-difference", title: "날짜 차이 계산기", description: "시작일과 종료일 사이의 총 일수, 주수와 완전한 개월 수를 계산합니다.", kind: "calculator", inputs: null, formula: "종료일 − 시작일", faq: null, relatedToolIds: [401, 402, 403], seoTitle: "날짜 차이 계산기 | 기간·며칠 차이", seoDescription: "시작일과 종료일 사이의 날짜 차이, 주수와 개월 수를 계산합니다.", status: "active", sortOrder: 5, logicKey: "date-difference", searchKeywords: ["날짜 차이", "기간 계산", "며칠 차이", "날짜 계산"] }),
    tool({ id: 406, categoryId: 31, slug: "time-calculator", title: "시간 계산기", description: "기준 시각에 시간과 분을 더하거나 빼 결과 시각을 계산합니다.", kind: "calculator", inputs: null, formula: "기준 시각에 시간·분을 더하거나 뺍니다.", faq: null, relatedToolIds: [401, 405], seoTitle: "시간 계산기 | 시간 더하기·빼기", seoDescription: "기준 시각에 시간과 분을 더하거나 빼 결과 시각을 계산합니다.", status: "active", sortOrder: 6, logicKey: "time-calculator", searchKeywords: ["시간 계산", "시간 더하기", "시간 빼기"] }),
    tool({ id: 101, categoryId: 3, slug: "monthly-rent", title: "월세 계산기", description: "보증금·월세·전환율로 실질 월 지출을 계산합니다.", kind: "calculator", inputs: null, formula: "실질 월 지출 = 월세 + (보증금 × 전환율 ÷ 12)", faq: null, relatedToolIds: [104, 107, 108, 109], seoTitle: "월세 계산기 | 도구상자", seoDescription: "보증금과 월세를 바탕으로 실질 월 지출을 계산합니다.", status: "active", sortOrder: 1, logicKey: "monthly-rent", isPopular: true, searchKeywords: ["월세", "보증금", "전월세"] }),
    tool({ id: 102, categoryId: 2, slug: "loan-interest", title: "대출 이자 계산기", description: "원리금균등과 원금균등 상환 방식의 이자를 비교합니다.", kind: "calculator", inputs: null, formula: "월 이자율 = 연 이자율 ÷ 12", faq: null, relatedToolIds: [110, 120, 121, 115], seoTitle: "대출 이자 계산기 | 도구상자", seoDescription: "대출 상환 방식별 월 납입금과 총 이자를 계산합니다.", status: "active", sortOrder: 1, logicKey: "loan-interest", isPopular: true, searchKeywords: ["대출", "이자", "원리금", "상환"] }),
    tool({ id: 103, categoryId: 4, slug: "annual-net", title: "연봉 실수령액 계산기", description: "4대 보험과 간이 소득세를 반영해 월 예상 실수령액을 추정합니다.", kind: "calculator", inputs: null, formula: "월 실수령액 ≈ 월 급여 − 사회보험료 − 추정 소득세", faq: null, relatedToolIds: [105], seoTitle: "연봉 실수령액 계산기 | 도구상자", seoDescription: "연봉 기준 월 예상 실수령액을 추정합니다.", status: "inactive", sortOrder:  99, logicKey: "annual-net", searchKeywords: ["연봉", "실수령", "월급"] }),
    tool({ id: 104, categoryId: 3, slug: "pyeong", title: "평수 계산기", description: "제곱미터와 평을 양방향으로 변환합니다.", kind: "calculator", inputs: null, formula: "1평 = 3.305785㎡", faq: null, relatedToolIds: [101], seoTitle: "평수 계산기 | 도구상자", seoDescription: "제곱미터와 평을 빠르게 변환합니다.", status: "active", sortOrder: 2, logicKey: "pyeong", isPopular: true, searchKeywords: ["평", "제곱미터", "면적"] }),
    tool({ id: 105, categoryId: 30, slug: "retirement-pay", title: "퇴직금 계산기", description: "평균 임금과 근속 기간으로 예상 퇴직금을 계산합니다.", kind: "calculator", inputs: null, formula: "예상 퇴직금 = 1일 평균임금 × 30일 × 계속 근로연수", faq: null, relatedToolIds: [123, 130, 127, 129, 131], seoTitle: "퇴직금 계산기 | 도구상자", seoDescription: "평균 임금과 근속 기간으로 퇴직금을 추정합니다.", status: "active", sortOrder: 0, logicKey: "retirement-pay", isPopular: true, searchKeywords: ["퇴직", "퇴직금", "평균임금", "퇴직 정산"] }),
    tool({ id: 106, categoryId: 5, slug: "vat-calculator", title: "부가세 계산기", description: "공급가액과 부가세 포함 금액을 양방향 계산합니다.", kind: "calculator", inputs: null, formula: "부가세 = 공급가액 × 10%", faq: null, relatedToolIds: null, seoTitle: "부가세 계산기 | 도구상자", seoDescription: "공급가액과 부가세 포함 금액을 계산합니다.", status: "active", sortOrder: 1, logicKey: "vat", isPopular: true, searchKeywords: ["부가세", "VAT", "공급가"] }),
    tool({ id: 201, categoryId: 9, slug: "pdf-convert", title: "PDF 변환", description: "PDF를 이미지·Word·Excel·한글 호환 문서로 바꾸고 이미지를 PDF로 만듭니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [203, 204, 202], seoTitle: "PDF 변환 | Word·Excel·한글 파일 무료 변환", seoDescription: "파일을 서버로 보내지 않고 브라우저에서 PDF를 이미지와 문서 호환 파일로 변환합니다.", status: "active", sortOrder: 1, logicKey: "pdf", isPopular: true, searchKeywords: ["PDF", "피디에프", "PDF 워드", "PDF 엑셀", "PDF 한글"] }),
    tool({ id: 203, categoryId: 9, slug: "pdf-to-excel", title: "PDF → Excel 변환", description: "PDF 텍스트를 Excel에서 열 수 있는 CSV 파일로 저장합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [201, 204], seoTitle: "PDF 엑셀 변환 무료 | PDF를 CSV로 바꾸는 방법", seoDescription: "텍스트 PDF를 브라우저에서 Excel 호환 CSV로 변환합니다. 표 구조는 달라질 수 있습니다.", status: "active", sortOrder: 2, logicKey: "pdf-excel", searchKeywords: ["PDF 엑셀", "PDF Excel", "PDF CSV"] }),
    tool({ id: 204, categoryId: 9, slug: "pdf-to-hwp", title: "PDF → 한글 호환 변환", description: "PDF 텍스트를 한글에서 열 수 있는 HTML 문서로 저장합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [201, 203], seoTitle: "PDF 한글 변환 무료 | 한글에서 열 수 있는 문서 만들기", seoDescription: "텍스트 PDF를 한글에서 열 수 있는 HTML 문서로 브라우저에서 변환합니다.", status: "active", sortOrder: 3, logicKey: "pdf-hwp", searchKeywords: ["PDF 한글", "PDF HWP", "PDF 한글파일"] }),
    tool({ id: 210, categoryId: 9, slug: "images-to-pdf", title: "JPG·PNG → PDF 변환", description: "여러 JPG·PNG 이미지를 하나의 PDF로 저장합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [201, 202], seoTitle: "JPG PNG PDF 변환 무료 | 이미지를 PDF로 만들기", seoDescription: "이미지를 서버에 업로드하지 않고 브라우저에서 PDF로 변환합니다.", status: "active", sortOrder: 4, logicKey: "pdf", searchKeywords: ["이미지 PDF", "JPG PDF", "PNG PDF"] }),
    tool({ id: 211, categoryId: 9, slug: "pdf-to-images", title: "PDF → JPG·PNG 변환", description: "PDF 각 페이지를 JPG 또는 PNG 이미지로 저장합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [201, 210], seoTitle: "PDF JPG PNG 변환 무료 | PDF 페이지 이미지 저장", seoDescription: "PDF 페이지를 브라우저에서 JPG 또는 PNG 이미지로 변환합니다.", status: "active", sortOrder: 5, logicKey: "pdf-images", searchKeywords: ["PDF JPG", "PDF PNG", "PDF 이미지"] }),
    tool({ id: 202, categoryId: 11, slug: "image-convert", title: "이미지 변환", description: "JPG·PNG·WebP 변환과 이미지 리사이즈를 제공합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [201], seoTitle: "이미지 변환 | 도구상자", seoDescription: "브라우저에서 이미지 포맷과 크기를 변환합니다.", status: "active", sortOrder: 1, logicKey: "image", searchKeywords: ["이미지", "JPG", "PNG", "WebP"] }),
    tool({ id: 205, categoryId: 10, slug: "pdf-merge", title: "PDF 합치기", description: "여러 PDF를 선택한 순서대로 하나의 파일로 합칩니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [206, 207, 208], seoTitle: "PDF 합치기 무료 | 여러 PDF 파일 하나로 병합", seoDescription: "여러 PDF를 서버 업로드 없이 브라우저에서 하나의 PDF로 합칩니다.", status: "active", sortOrder: 1, logicKey: "pdf-merge", searchKeywords: ["PDF 합치기", "PDF 병합", "PDF merge"] }),
    tool({ id: 206, categoryId: 10, slug: "pdf-split", title: "PDF 분할", description: "PDF를 페이지별 개별 파일로 분할합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [205, 207], seoTitle: "PDF 분할 무료 | PDF 페이지별 나누기", seoDescription: "PDF를 페이지별 파일로 브라우저에서 분할합니다.", status: "active", sortOrder: 2, logicKey: "pdf-split", searchKeywords: ["PDF 분할", "PDF 나누기", "PDF 페이지 분리"] }),
    tool({ id: 207, categoryId: 10, slug: "pdf-page-edit", title: "PDF 페이지 편집", description: "페이지 추출·삭제·순서 변경·회전을 한 화면에서 처리합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [205, 206, 208], seoTitle: "PDF 페이지 편집 무료 | 추출·삭제·순서 변경·회전", seoDescription: "PDF 페이지를 선택해 추출, 삭제, 순서 변경과 회전을 처리합니다.", status: "active", sortOrder: 3, logicKey: "pdf-page-edit", searchKeywords: ["PDF 페이지 편집", "PDF 페이지 삭제", "PDF 회전"] }),
    tool({ id: 208, categoryId: 10, slug: "pdf-watermark", title: "PDF 워터마크", description: "PDF 모든 페이지 중앙에 텍스트 워터마크를 추가합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [205, 207], seoTitle: "PDF 워터마크 넣기 무료 | 텍스트 삽입 방법", seoDescription: "PDF에 투명 텍스트 워터마크를 브라우저에서 추가합니다.", status: "active", sortOrder: 4, logicKey: "pdf-watermark", searchKeywords: ["PDF 워터마크", "PDF 글자 넣기", "PDF 도장"] }),
    tool({ id: 209, categoryId: 10, slug: "pdf-page-numbers", title: "PDF 페이지 번호 넣기", description: "PDF 페이지 하단 중앙에 페이지 번호를 추가합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [207, 208], seoTitle: "PDF 페이지 번호 넣기 무료 | 페이지 번호 추가", seoDescription: "PDF 모든 페이지 하단에 번호를 추가해 새 파일로 저장합니다.", status: "active", sortOrder: 5, logicKey: "pdf-page-numbers", searchKeywords: ["PDF 페이지 번호", "PDF 쪽번호", "PDF 번호 넣기"] }),
    tool({ id: 212, categoryId: 10, slug: "pdf-extract-pages", title: "PDF 페이지 추출", description: "선택한 페이지만 새 PDF로 추출합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [205, 207], seoTitle: "PDF 페이지 추출 무료 | 원하는 페이지만 저장", seoDescription: "PDF에서 필요한 페이지만 선택해 새 PDF로 저장합니다.", status: "active", sortOrder: 6, logicKey: "pdf-extract-pages", searchKeywords: ["PDF 페이지 추출", "PDF 일부 저장"] }),
    tool({ id: 213, categoryId: 10, slug: "pdf-delete-pages", title: "PDF 페이지 제거", description: "선택한 페이지를 PDF에서 제거합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [205, 207], seoTitle: "PDF 페이지 삭제 무료 | 불필요한 페이지 제거", seoDescription: "PDF에서 불필요한 페이지를 선택해 제거합니다.", status: "active", sortOrder: 7, logicKey: "pdf-delete-pages", searchKeywords: ["PDF 페이지 삭제", "PDF 페이지 제거"] }),
    tool({ id: 214, categoryId: 10, slug: "pdf-reorder-pages", title: "PDF 페이지 순서 변경", description: "PDF 페이지 순서를 원하는 순서로 재배열합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [207, 205], seoTitle: "PDF 페이지 순서 변경 무료 | 페이지 재배열", seoDescription: "PDF 페이지 순서를 브라우저에서 원하는 순서로 바꿉니다.", status: "active", sortOrder: 8, logicKey: "pdf-reorder-pages", searchKeywords: ["PDF 페이지 순서", "PDF 재배열"] }),
    tool({ id: 215, categoryId: 10, slug: "pdf-rotate-pages", title: "PDF 페이지 회전", description: "PDF 페이지를 90도 단위로 회전합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [207], seoTitle: "PDF 페이지 회전 무료 | PDF 방향 바꾸기", seoDescription: "PDF 페이지를 브라우저에서 90도 단위로 회전해 저장합니다.", status: "active", sortOrder: 9, logicKey: "pdf-rotate-pages", searchKeywords: ["PDF 회전", "PDF 방향 변경"] }),
    tool({ id: 216, categoryId: 10, slug: "pdf-metadata", title: "PDF 메타데이터 편집", description: "PDF 제목·작성자·주제 메타데이터를 설정합니다.", kind: "converter", inputs: null, formula: null, faq: null, relatedToolIds: [207, 208], seoTitle: "PDF 메타데이터 편집 무료 | 제목·작성자 수정", seoDescription: "PDF의 제목, 작성자와 주제를 브라우저에서 수정합니다.", status: "active", sortOrder: 10, logicKey: "pdf-metadata", searchKeywords: ["PDF 메타데이터", "PDF 제목 수정", "PDF 작성자 변경"] }),
    tool({ id: 301, categoryId: 15, slug: "unit-convert", title: "단위 변환기", description: "길이·무게·온도·면적 단위를 한 번에 환산합니다.", kind: "unit", inputs: null, formula: null, faq: null, relatedToolIds: [104], seoTitle: "단위 변환기 | 도구상자", seoDescription: "생활에 필요한 단위를 빠르게 변환합니다.", status: "active", sortOrder: 1, logicKey: "unit", searchKeywords: ["단위", "환산", "길이", "무게"] }),
    tool({ id: 107, categoryId: 3, slug: "rent-conversion", title: "전월세 전환율 계산기", description: "보증금과 월세의 전환 비용을 계산합니다.", kind: "calculator", inputs: null, formula: "월 환산액 = 보증금 × 전환율 ÷ 12", faq: null, relatedToolIds: [101, 108, 109, 113], seoTitle: "전월세 전환율 계산기 | 도구상자", seoDescription: "전월세 전환율 기준의 월 비용을 계산합니다.", status: "active", sortOrder: 3, logicKey: "rent-conversion", searchKeywords: ["전월세", "전환율", "보증금"] }),
    tool({ id: 108, categoryId: 3, slug: "jeonse-to-monthly", title: "전세 → 월세 계산기", description: "전세 보증금을 월세로 환산합니다.", kind: "calculator", inputs: null, formula: "월세 환산액 = 전세금 × 전환율 ÷ 12", faq: null, relatedToolIds: [101, 107, 113], seoTitle: "전세 월세 계산기 | 도구상자", seoDescription: "전세 보증금을 월세 기준으로 환산합니다.", status: "active", sortOrder: 4, logicKey: "jeonse-to-monthly", searchKeywords: ["전세", "월세", "전환"] }),
    tool({ id: 109, categoryId: 3, slug: "monthly-to-jeonse", title: "월세 → 전세 계산기", description: "월세를 전세 보증금으로 환산합니다.", kind: "calculator", inputs: null, formula: "전세 환산액 = 월세 × 12 ÷ 전환율", faq: null, relatedToolIds: [101, 107, 113], seoTitle: "월세 전세 계산기 | 도구상자", seoDescription: "월세를 전세 보증금 기준으로 환산합니다.", status: "active", sortOrder: 5, logicKey: "monthly-to-jeonse", searchKeywords: ["월세", "전세", "환산"] }),
    tool({ id: 110, categoryId: 2, slug: "loan-amortization", title: "원리금균등상환 계산기", description: "원리금균등 월 상환액을 계산합니다.", kind: "calculator", inputs: null, formula: "원리금균등 상환 공식", faq: null, relatedToolIds: [102, 120, 121, 115], seoTitle: "원리금균등상환 계산기 | 도구상자", seoDescription: "원리금균등 월 상환액과 이자를 계산합니다.", status: "active", sortOrder: 2, logicKey: "loan-amortization", searchKeywords: ["원리금", "대출", "상환"] }),
    tool({ id: 111, categoryId: 2, slug: "deposit-interest", title: "예금 이자 계산기", description: "예치금의 예상 이자를 계산합니다.", kind: "calculator", inputs: null, formula: "이자 = 원금 × 연이율 × 기간", faq: null, relatedToolIds: [112, 119], seoTitle: "예금 이자 계산기 | 도구상자", seoDescription: "예금 원금과 금리로 예상 이자를 계산합니다.", status: "active", sortOrder: 3, logicKey: "deposit-interest", searchKeywords: ["예금", "이자", "금리"] }),
    tool({ id: 112, categoryId: 2, slug: "savings", title: "적금 계산기", description: "매월 납입하는 적금의 예상 만기액을 계산합니다.", kind: "calculator", inputs: null, formula: "만기액 = 납입 원금 + 예상 이자", faq: null, relatedToolIds: [111, 119], seoTitle: "적금 계산기 | 도구상자", seoDescription: "월 납입액과 금리로 적금 만기액을 계산합니다.", status: "active", sortOrder: 4, logicKey: "savings", searchKeywords: ["적금", "예금", "금리"] }),
    tool({ id: 113, categoryId: 22, slug: "jeonse-loan-interest", title: "전세대출 이자 계산기", description: "전세대출 금액·연 이자율·기간으로 월 이자와 총 이자를 계산합니다.", kind: "calculator", inputs: null, formula: "총 이자 = 대출금액 × 연 이자율 × 대출기간(개월) ÷ 12", faq: [{ question: "원금 상환을 반영하나요?", answer: "이 도구는 이자만 납부하는 단순 기준으로 계산합니다. 원금 상환 방식이 있는 상품은 약정 상환표를 확인하세요." }], relatedToolIds: [101, 107, 108, 114], seoTitle: "전세대출 이자 계산기 | 도구상자", seoDescription: "전세대출의 월 이자와 대출 기간 전체 예상 이자를 계산합니다.", status: "active", sortOrder: 1, logicKey: "jeonse-loan-interest", isPopular: true, searchKeywords: ["전세대출", "전세자금", "전세 이자", "전세대출이자"] }),
    tool({ id: 114, categoryId: 22, slug: "mortgage", title: "주택담보대출 계산기", description: "주택담보대출의 월 상환액·총 이자·월별 상환 구조를 계산합니다.", kind: "calculator", inputs: null, formula: "월 상환액 = 원금 × 월이자율 × (1+월이자율)^기간 ÷ ((1+월이자율)^기간−1)", faq: [{ question: "주담대 금리는 고정인가요?", answer: "입력한 하나의 연 이자율을 전체 기간에 적용한 고정금리 가정입니다." }], relatedToolIds: [102, 120, 121, 115], seoTitle: "주택담보대출 계산기 | 도구상자", seoDescription: "주담대 원리금균등 기준 월 납입액, 총 상환액과 월별 상환표를 계산합니다.", status: "active", sortOrder: 2, logicKey: "mortgage", isPopular: true, searchKeywords: ["주택담보대출", "주담대", "아파트 대출", "모기지"] }),
    tool({ id: 115, categoryId: 23, slug: "early-repayment-fee", title: "중도상환수수료 계산기", description: "중도상환 원금·수수료율·잔여일수로 예상 중도상환수수료를 계산합니다.", kind: "calculator", inputs: null, formula: "중도상환수수료 = 중도상환원금 × 수수료율 × 적용일수 ÷ 365", faq: [{ question: "면제 기간은 어떻게 적용하나요?", answer: "입력한 면제일수만큼 잔여일수에서 차감하며, 은행별 약정이 우선합니다." }], relatedToolIds: [114, 102, 120, 121], seoTitle: "중도상환수수료 계산기 | 도구상자", seoDescription: "대출 중도상환 시 원금과 잔여 기간을 기준으로 예상 수수료를 계산합니다.", status: "active", sortOrder: 1, logicKey: "early-repayment-fee", searchKeywords: ["중도상환", "중도상환수수료", "상환수수료"] }),
    tool({ id: 116, categoryId: 23, slug: "brokerage-fee", title: "부동산 중개수수료 계산기", description: "매매·임대차 거래금액에 따른 주택 중개보수 상한액을 계산합니다.", kind: "calculator", inputs: null, formula: "중개보수 = 거래금액 × 구간별 상한요율(한도액 적용)", faq: [{ question: "부가가치세가 포함되나요?", answer: "중개보수 상한액만 계산하며, 부가가치세는 별도일 수 있습니다." }], relatedToolIds: [117, 118, 101], seoTitle: "부동산 중개수수료 계산기 | 도구상자", seoDescription: "주택 매매·임대차 거래금액별 부동산 중개보수 상한액을 계산합니다.", status: "active", sortOrder: 2, logicKey: "brokerage-fee", isPopular: true, searchKeywords: ["중개수수료", "복비", "부동산 수수료", "중개보수"] }),
    tool({ id: 117, categoryId: 24, slug: "acquisition-tax", title: "취득세 계산기", description: "일반 개인 주택 유상취득의 기본 취득세를 주택 수와 지역 조건에 따라 계산합니다.", kind: "calculator", inputs: null, formula: "취득세 = 취득가액 × 적용 세율", faq: [{ question: "부가세목도 포함되나요?", answer: "이 도구는 취득세 본세 기준입니다. 지방교육세·농어촌특별세, 감면과 중과는 위택스에서 확인하세요." }], relatedToolIds: [118, 116], seoTitle: "취득세 계산기 | 도구상자", seoDescription: "주택 취득가액, 보유 주택 수와 조정대상지역 여부로 기본 취득세를 계산합니다.", status: "active", sortOrder: 1, logicKey: "acquisition-tax", isPopular: true, searchKeywords: ["취득세", "주택 취득세", "아파트 취득세"] }),
    tool({ id: 118, categoryId: 24, slug: "property-tax", title: "재산세 계산기", description: "주택 공시가격 기준의 과세표준과 재산세 본세를 간이 계산합니다.", kind: "calculator", inputs: null, formula: "과세표준 = 주택 공시가격 × 60%, 재산세 = 과세표준 × 누진세율", faq: [{ question: "고지서 금액과 왜 다를 수 있나요?", answer: "세부담상한, 도시지역분, 지역자원시설세, 1세대 1주택 특례 등이 반영되지 않은 본세 기준입니다." }], relatedToolIds: [117, 116], seoTitle: "재산세 계산기 | 도구상자", seoDescription: "주택 공시가격을 기준으로 재산세 과세표준과 본세를 계산합니다.", status: "active", sortOrder: 2, logicKey: "property-tax", isPopular: true, searchKeywords: ["재산세", "보유세", "공시가격", "주택 재산세"] }),
    tool({ id: 119, categoryId: 25, slug: "compound-interest", title: "복리 계산기", description: "원금·연 이자율·기간을 기준으로 복리 수익과 만기 금액을 계산합니다.", kind: "calculator", inputs: null, formula: "만기금액 = 원금 × (1 + 연 이자율)^기간", faq: [{ question: "세금과 수수료를 반영하나요?", answer: "세전 연복리 기준입니다. 실제 금융상품의 세금·수수료·복리 주기는 상품설명서를 확인하세요." }], relatedToolIds: [111, 112], seoTitle: "복리 계산기 | 도구상자", seoDescription: "원금, 연 이자율과 기간으로 복리 이자와 만기 예상 금액을 계산합니다.", status: "active", sortOrder: 1, logicKey: "compound-interest", isPopular: true, searchKeywords: ["복리", "복리이자", "복리 계산", "연복리"] }),
    tool({ id: 120, categoryId: 26, slug: "equal-principal", title: "대출 원금균등상환 계산기", description: "원금을 매월 동일하게 나누어 갚는 대출의 상환액과 이자를 계산합니다.", kind: "calculator", inputs: null, formula: "매월 원금상환액 = 대출원금 ÷ 상환개월수", faq: [{ question: "첫 달 납입액이 큰 이유는 무엇인가요?", answer: "원금은 일정하지만 잔액이 큰 첫 달의 이자가 가장 크기 때문입니다." }], relatedToolIds: [102, 110, 114, 121], seoTitle: "대출 원금균등상환 계산기 | 도구상자", seoDescription: "대출 원금균등상환의 첫 달 납입액, 총 이자와 월별 상환표를 계산합니다.", status: "active", sortOrder: 1, logicKey: "equal-principal", isPopular: true, searchKeywords: ["원금균등", "원금균등상환", "대출 상환"] }),
    tool({ id: 121, categoryId: 26, slug: "bullet-loan", title: "대출 만기일시상환 계산기", description: "만기일에 원금을 상환하고 매월 이자를 납부하는 대출의 비용을 계산합니다.", kind: "calculator", inputs: null, formula: "월 이자 = 대출원금 × 연 이자율 ÷ 12, 만기 상환액 = 원금 + 마지막 달 이자", faq: [{ question: "매월 납입액이 같은가요?", answer: "고정금리 가정에서는 만기 전까지 이자만 같고, 마지막 달에는 원금이 함께 청구됩니다." }], relatedToolIds: [102, 110, 114, 120], seoTitle: "대출 만기일시상환 계산기 | 도구상자", seoDescription: "만기일시상환 대출의 월 이자, 만기 상환액과 전체 상환표를 계산합니다.", status: "active", sortOrder: 2, logicKey: "bullet-loan", searchKeywords: ["만기일시", "만기일시상환", "이자만", "대출 상환"] }),
    tool({ id: 122, categoryId: 27, slug: "percentage", title: "퍼센트 계산기", description: "기준값의 퍼센트, 증감액과 증감률을 계산합니다.", kind: "calculator", inputs: null, formula: "결과 = 기준값 × 퍼센트 ÷ 100", faq: [{ question: "0에서의 증감률은 계산되나요?", answer: "0을 기준으로 한 증감률은 정의하기 어려워 이 도구에서는 0%로 표시합니다." }], relatedToolIds: [119, 111, 112], seoTitle: "퍼센트 계산기 | 도구상자", seoDescription: "기준값의 퍼센트와 증감률을 빠르게 계산합니다.", status: "active", sortOrder: 1, logicKey: "percentage", isPopular: true, searchKeywords: ["퍼센트", "백분율", "비율", "증감률", "할인"] }),
    tool({ id: 123, categoryId: 28, slug: "annual-take-home", title: "연봉 실수령액 계산기", description: "연봉, 부양가족·자녀 수와 비과세 급여를 반영해 예상 실수령액을 계산합니다.", kind: "calculator", inputs: null, formula: "월 실수령액 = 월 세전급여 − 4대보험 근로자 부담분 − 간이 추정 소득세", faq: [{ question: "실제 원천징수와 왜 다른가요?", answer: "비과세 구성, 간이세액표 선택비율, 공제요건과 연말정산에 따라 실제 원천징수액이 달라질 수 있습니다." }], relatedToolIds: [124, 125, 128], seoTitle: "연봉 실수령액 계산기 | 도구상자", seoDescription: "2026년 일반 직장가입자 기준으로 연봉의 월·연 예상 실수령액과 공제 항목을 계산합니다.", status: "active", sortOrder: 0, logicKey: "annual-take-home", isPopular: true, searchKeywords: ["연봉", "연봉 실수령액", "연봉계산", "세후 연봉", "연봉 월급"] }),
    tool({ id: 124, categoryId: 28, slug: "monthly-take-home", title: "월급 실수령액 계산기", description: "월 세전 급여와 비과세액을 기준으로 공제 항목별 예상 실수령액을 계산합니다.", kind: "calculator", inputs: null, formula: "월 실수령액 = 월 세전급여 − 사회보험료 − 간이 추정 소득세", faq: [{ question: "비과세 급여는 무엇인가요?", answer: "식대 등 법정 요건을 충족하는 비과세 항목은 보험·소득세 산정에 차이가 있을 수 있습니다." }], relatedToolIds: [123, 125, 128], seoTitle: "월급 실수령액 계산기 | 도구상자", seoDescription: "월 급여의 4대보험, 소득세, 지방소득세와 예상 실수령액을 계산합니다.", status: "active", sortOrder: 0, logicKey: "monthly-take-home", isPopular: true, searchKeywords: ["월급", "월급 실수령액", "월급계산", "세후 월급", "급여 실수령"] }),
    tool({ id: 125, categoryId: 28, slug: "four-insurance", title: "4대보험 계산기", description: "월 보수 기준 국민연금·건강·장기요양·고용보험의 부담액을 계산합니다.", kind: "calculator", inputs: null, formula: "보험료 = 보수월액 × 보험료율", faq: [{ question: "사업주 부담액이 실제와 다른 이유는 무엇인가요?", answer: "고용안정·직업능력개발 부담분과 산재보험은 사업장 규모·업종에 따라 다를 수 있습니다." }], relatedToolIds: [123, 124, 128], seoTitle: "4대보험 계산기 | 도구상자", seoDescription: "2026년 일반 직장가입자 기준의 4대보험 근로자·사업주 기본 부담액을 계산합니다.", status: "active", sortOrder: 3, logicKey: "four-insurance", searchKeywords: ["4대보험", "사대보험", "국민연금", "건강보험", "장기요양보험", "고용보험"] }),
    tool({ id: 126, categoryId: 29, slug: "weekly-holiday-pay", title: "주휴수당 계산기", description: "시급·주당 근로시간·근무일수로 주휴수당과 예상 주급을 계산합니다.", kind: "calculator", inputs: null, formula: "주휴수당 = 시급 × 1일 소정근로시간", faq: [{ question: "주 15시간 미만도 주휴수당을 받나요?", answer: "주 평균 소정근로시간이 15시간 미만이면 이 도구의 주휴수당 추정 대상이 아닙니다." }], relatedToolIds: [128, 129, 124], seoTitle: "주휴수당 계산기 | 도구상자", seoDescription: "시급과 주당 소정근로시간을 기준으로 주휴수당과 주급을 계산합니다.", status: "active", sortOrder: 1, logicKey: "weekly-holiday-pay", searchKeywords: ["주휴수당", "주휴", "주급", "알바 주휴수당", "주 15시간"] }),
    tool({ id: 127, categoryId: 29, slug: "annual-leave-pay", title: "연차수당 계산기", description: "통상시급과 미사용 연차일수로 예상 연차수당을 계산합니다.", kind: "calculator", inputs: null, formula: "연차수당 = 1일 통상임금 × 미사용 연차일수", faq: [{ question: "모든 미사용 연차가 수당이 되나요?", answer: "사용촉진, 소멸과 회사 운영 방식에 따라 실제 지급 여부가 달라질 수 있습니다." }], relatedToolIds: [105, 129, 128], seoTitle: "연차수당 계산기 | 도구상자", seoDescription: "통상시급, 1일 근로시간과 미사용 연차일수로 예상 연차수당을 계산합니다.", status: "active", sortOrder: 2, logicKey: "annual-leave-pay", searchKeywords: ["연차수당", "미사용 연차", "연차 정산", "연차 계산"] }),
    tool({ id: 128, categoryId: 29, slug: "hourly-wage", title: "시급 계산기", description: "월급에서 시급을 계산하거나 시급에서 월급을 환산합니다.", kind: "calculator", inputs: null, formula: "시급 = 월급 ÷ 월 환산 근로시간", faq: [{ question: "월 209시간을 항상 사용하나요?", answer: "주 40시간·유급주휴를 포함한 일반 환산 예시입니다. 계약에 따라 월 환산시간이 달라질 수 있습니다." }], relatedToolIds: [126, 129, 124], seoTitle: "시급 계산기 | 도구상자", seoDescription: "월급과 월 환산 근로시간으로 시급을 계산하고 시급에서 월급을 환산합니다.", status: "active", sortOrder: 3, logicKey: "hourly-wage", searchKeywords: ["시급", "시급계산", "월급 시급", "209시간", "알바 시급"] }),
    tool({ id: 129, categoryId: 29, slug: "work-hours", title: "근무시간 계산기", description: "시작·종료시간과 휴게시간으로 자정 경과 근무를 포함한 실근무시간을 계산합니다.", kind: "calculator", inputs: null, formula: "실근무시간 = 전체 근무시간 − 휴게시간", faq: [{ question: "자정을 넘는 근무도 계산되나요?", answer: "종료시간이 시작시간보다 이르면 다음 날 종료로 보고 계산합니다." }], relatedToolIds: [126, 128, 127], seoTitle: "근무시간 계산기 | 도구상자", seoDescription: "시작시간, 종료시간, 휴게시간으로 실근무시간을 계산합니다.", status: "active", sortOrder: 4, logicKey: "work-hours", searchKeywords: ["근무시간", "근로시간", "야간근무", "휴게시간", "근무시간 계산"] }),
    tool({ id: 130, categoryId: 30, slug: "retirement-income-tax", title: "퇴직소득세 계산기", description: "퇴직급여와 근속연수로 퇴직소득세·지방소득세와 예상 수령액을 계산합니다.", kind: "calculator", inputs: null, formula: "산출세액 = 환산 과세표준 세액 ÷ 12 × 근속연수", faq: [{ question: "실제 세액이 달라질 수 있나요?", answer: "중간정산·과세이연·비과세소득 및 귀속연도별 특례가 있어 국세청 프로그램 확인이 필요합니다." }], relatedToolIds: [105, 127, 129], seoTitle: "퇴직소득세 계산기 | 도구상자", seoDescription: "퇴직급여와 근속연수를 기준으로 퇴직소득세, 지방소득세와 예상 실수령액을 계산합니다.", status: "active", sortOrder: 2, logicKey: "retirement-income-tax", searchKeywords: ["퇴직소득세", "퇴직세", "퇴직금 세금", "퇴직소득"] }),
    tool({ id: 131, categoryId: 30, slug: "unemployment-benefit", title: "실업급여 계산기", description: "퇴직 전 월급·나이·고용보험 가입기간으로 예상 실업급여를 계산합니다.", kind: "calculator", inputs: null, formula: "구직급여 = 1일 평균임금 × 60% × 소정급여일수", faq: [{ question: "계산 결과만으로 수급할 수 있나요?", answer: "아닙니다. 퇴사사유, 피보험단위기간과 재취업활동 등 법정 요건을 고용센터가 최종 판단합니다." }], relatedToolIds: [105, 124, 125], seoTitle: "실업급여 계산기 | 도구상자", seoDescription: "퇴직 전 월급과 고용보험 가입기간을 기준으로 예상 1일 지급액·지급일수·총액을 계산합니다.", status: "active", sortOrder: 0, logicKey: "unemployment-benefit", isPopular: true, searchKeywords: ["실업급여", "구직급여", "고용보험 실업급여", "실업급여 계산", "실업급여 기간"] }),
  ],
};
