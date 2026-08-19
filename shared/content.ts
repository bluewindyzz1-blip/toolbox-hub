export type GuideSection = { heading: string; paragraphs: string[] };

export type GuideContent = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  coreAnswer?: string;
  example?: string;
  caution?: string;
  sections: GuideSection[];
  faq: Array<{ question: string; answer: string }>;
  relatedToolSlugs: string[];
  relatedGuideSlugs: string[];
  monetizationCategory: "finance" | "real-estate" | "tax" | "business" | "automobile" | "retirement";
};

export const guideContents: GuideContent[] = [
  {
    slug: "jeonse-vs-monthly-cost-guide",
    title: "전세와 월세 비용 비교 방법: 보증금·월세를 같은 기준으로 계산하기",
    description: "전세와 월세를 비교할 때 보증금 기회비용, 월세, 전환율을 어떤 순서로 계산하는지 설명하고 비교 계산기로 연결합니다.",
    eyebrow: "REAL ESTATE GUIDE",
    intro: "전세와 월세 중 어느 조건이 유리한지는 월세만 보고 결정하기 어렵습니다. 보증금이 묶이는 비용과 월세를 같은 기간 기준으로 바꾸면 두 계약의 차이를 더 명확하게 비교할 수 있습니다.",
    sections: [
      { heading: "전세와 월세 비교에서 먼저 정리할 입력값", paragraphs: ["전세 보증금, 월세 보증금, 월세, 비교 기간, 보증금에 적용할 가정 수익률을 따로 적습니다. 계약 조건이 다르면 관리비·대출이자·보증보험료처럼 실제 부담에 영향을 주는 항목도 별도로 기록해야 합니다.", "이 계산은 특정 계약을 추천하는 것이 아니라 입력한 가정의 비용 차이를 보여주는 참고용 비교입니다."] },
      { heading: "보증금 기회비용을 월 비용으로 바꾸는 방법", paragraphs: ["보증금 차액에 가정한 연 수익률을 곱해 연간 기회비용을 구한 뒤 12개월로 나누면 월 단위 비교가 가능합니다. 실제 대출금리나 투자수익률은 사람마다 다르므로 한 가지 값만 넣기보다 낮은 값과 높은 값을 함께 비교하는 편이 안전합니다.", "계산 결과 아래의 전세 vs 월세 비교 계산기에 보증금과 월세 조건을 넣으면 월간·연간 차이를 한 화면에서 확인할 수 있습니다."] },
      { heading: "계약 전에 추가로 확인할 항목", paragraphs: ["전세대출 이자, 보증보험 가입 가능 여부, 갱신 조건, 중도 해지 비용, 관리비와 수리 책임은 단순 월세 환산에 포함되지 않을 수 있습니다. 계약서와 금융기관 안내를 최종 기준으로 확인하세요."] },
    ],
    faq: [
      { question: "전세 보증금 전체를 비용으로 봐야 하나요?", answer: "보증금 자체는 반환을 전제로 하는 자산이지만, 자금이 묶이거나 대출을 이용한다면 기회비용과 이자가 발생할 수 있습니다. 비교 목적에 따라 보증금 차액의 기회비용을 월 비용으로 환산합니다." },
      { question: "전세와 월세 중 어느 쪽이 항상 유리한가요?", answer: "금리, 보증금, 월세, 거주기간, 보증보험료와 자금 여건에 따라 달라집니다. 계산기는 입력한 가정에 따른 비교값만 제공합니다." },
    ],
    relatedToolSlugs: ["jeonse-vs-monthly", "monthly-rent", "jeonse-loan-interest"],
    relatedGuideSlugs: ["retirement-fund-how-much-guide", "vat-supply-price-guide"],
    monetizationCategory: "real-estate",
  },
  {
    slug: "family-loan-io-document-guide",
    title: "가족간 차용증 작성 전 확인할 항목과 이자 계산 방법",
    description: "가족간 금전거래에서 차용금액·기간·상환방식·이자율을 정리하는 방법과 참고용 이자 계산기를 안내합니다.",
    eyebrow: "FINANCE GUIDE",
    intro: "가족 사이의 돈 거래도 나중에 사실관계와 상환 흐름을 설명할 수 있도록 조건을 명확히 남기는 것이 중요합니다. 차용증은 법률·세무 판단을 대신하지 않지만 거래 조건을 정리하는 출발점이 될 수 있습니다.",
    sections: [
      { heading: "차용증에 정리할 핵심 조건", paragraphs: ["대여일, 원금, 만기일 또는 분할상환 일정, 약정이율, 이자 지급일, 상환 계좌와 연체 시 처리 방법을 구체적으로 적습니다. 당사자와 실제 자금 이동을 확인할 수 있는 자료도 함께 보관하는 것이 좋습니다.", "가족간 거래의 세무상 인정 여부는 거래의 목적·금액·상환능력·실제 이행 등 여러 사실관계에 따라 달라질 수 있습니다."] },
      { heading: "이자 계산에서 상환방식이 중요한 이유", paragraphs: ["만기일시상환은 기간 동안 이자를 계산하고 만기에 원금을 갚는 방식이며, 원금균등분할상환은 원금이 줄어드는 만큼 이자도 달라집니다. 같은 원금·이율이라도 상환방식이 다르면 월별 현금흐름이 달라집니다.", "가족간 차용증 이자 계산기에 원금·기간·이율과 상환방식을 입력하면 방식별 이자와 총 상환액을 비교할 수 있습니다."] },
      { heading: "세무·법률 확인이 필요한 경우", paragraphs: ["무이자 또는 낮은 이율, 큰 금액, 부동산 취득자금, 미성년자 거래, 상환능력과 다른 금액의 거래는 세무사·변호사 또는 관련 기관에 구체적인 사실관계를 확인하세요. 이 페이지와 계산기는 신고나 계약의 결론을 제공하지 않습니다."] },
    ],
    faq: [
      { question: "가족간 차용증에 반드시 이자를 적어야 하나요?", answer: "거래의 성격과 세무·법률 적용은 사실관계에 따라 달라질 수 있습니다. 이자율과 지급일을 포함한 조건을 명확히 기록하고, 실제 이행 여부와 관련된 자료를 보관하는 것이 좋습니다." },
      { question: "계산기 결과가 세무상 인정되는 이자를 의미하나요?", answer: "아닙니다. 계산기는 입력한 원금·기간·이율·상환방식에 따른 산술 결과만 제공합니다. 적용 기준과 신고 여부는 최신 공식 안내 또는 전문가에게 확인해야 합니다." },
    ],
    relatedToolSlugs: ["family-loan-interest", "compound-interest", "simple-interest"],
    relatedGuideSlugs: ["vat-supply-price-guide", "annual-net-pay-guide"],
    monetizationCategory: "finance",
  },
  {
    slug: "retirement-fund-how-much-guide",
    title: "은퇴자금은 얼마가 필요할까? 생활비·연금·물가를 함께 계산하는 방법",
    description: "은퇴 후 생활비와 연금의 차이, 은퇴기간, 물가와 수익률을 반영해 필요한 은퇴자금을 추정하는 방법을 설명합니다.",
    eyebrow: "RETIREMENT GUIDE",
    intro: "은퇴자금은 하나의 정답이 있는 금액이 아니라 은퇴 시점·예상 수명·생활비·연금·물가·수익률 가정에 따라 달라지는 추정치입니다. 먼저 어떤 가정을 사용했는지 확인하면 계산 결과를 더 현실적으로 해석할 수 있습니다.",
    sections: [
      { heading: "은퇴자금 추정에 필요한 입력값", paragraphs: ["현재 나이와 은퇴 나이로 준비 기간을 정하고, 예상 수명으로 은퇴 후 기간을 계산합니다. 월 생활비에서 예상 연금을 뺀 금액이 은퇴 후 매달 필요한 부족액이며, 현재 자산과 예상 수익률을 함께 넣어 부족자금을 추정합니다.", "생활비는 현재 금액만 입력하기보다 의료비·주거비·여가비처럼 은퇴 후 변동할 수 있는 항목을 나누어 생각하는 것이 좋습니다."] },
      { heading: "결과를 한 가지 숫자로 해석하지 않는 방법", paragraphs: ["수익률이 낮아지거나 물가가 높아지면 필요한 자금은 증가할 수 있습니다. 기본값 하나만 믿기보다 보수적·기준·낙관 시나리오를 나누어 비교하세요.", "은퇴자금 계산기는 은퇴 시점 필요자금과 현재 자산 대비 부족자금, 추가 월 저축액을 참고용으로 보여줍니다."] },
      { heading: "연금과 퇴직금은 따로 확인하기", paragraphs: ["국민연금 예상수령액, 퇴직금, 개인연금은 지급 시기와 조건이 서로 다릅니다. 계산기에 입력한 연금이 세전인지 세후인지, 평생 지급인지, 물가에 따라 조정되는지 확인해야 합니다."] },
    ],
    faq: [
      { question: "은퇴자금 계산에서 물가상승률을 넣는 이유는 무엇인가요?", answer: "현재의 월 생활비가 은퇴 시점에도 같은 구매력을 갖는다고 보기 어렵기 때문입니다. 물가상승률은 미래 생활비를 추정하는 가정이며 실제 물가와 다를 수 있습니다." },
      { question: "은퇴자금 결과를 금융상품 가입 기준으로 사용해도 되나요?", answer: "계산기는 참고용 시뮬레이션입니다. 금융상품의 수익률·수수료·세금·지급 조건과 개인의 위험 성향은 별도로 확인해야 합니다." },
    ],
    relatedToolSlugs: ["retirement-fund", "national-pension", "retirement-pay"],
    relatedGuideSlugs: ["pension-retirement-income-guide", "annual-net-pay-guide"],
    monetizationCategory: "retirement",
  },
  {
    slug: "car-monthly-maintenance-cost-guide",
    title: "자동차 월 유지비 계산 항목: 유류비·보험료·세금·정비비 정리",
    description: "자동차 유지비를 월 단위로 비교할 때 필요한 유류비·보험료·자동차세·정비비·주차비 항목을 정리합니다.",
    eyebrow: "AUTOMOBILE GUIDE",
    intro: "자동차 유지비는 주유비만으로 결정되지 않습니다. 주행거리와 연비를 바탕으로 한 유류비에 고정비와 주기적으로 발생하는 비용을 나누어 더하면 차종별 월 부담을 비교하기 쉬워집니다.",
    sections: [
      { heading: "월 유지비를 고정비와 변동비로 나누기", paragraphs: ["유류비·통행료·주차비는 사용량에 따라 바뀌는 변동비이고, 자동차세·보험료·정기점검·소모품은 월 환산이 필요한 비용입니다. 연간 비용은 12개월로 나누고, 주행거리에 따라 달라지는 항목은 별도로 계산합니다.", "자동차 유지비 계산기는 주행거리·연비·유류비와 자동차세·보험료·정비비를 함께 입력해 월·연간 비용을 추정합니다."] },
      { heading: "차량을 비교할 때 같은 조건을 쓰기", paragraphs: ["차량마다 연비·보험료·정비비·세금이 다르므로 같은 월 주행거리와 같은 유류비 가정을 사용해야 비교가 가능합니다. 신차와 중고차는 감가·수리비·보증기간이 달라 별도 항목으로 두세요."] },
      { heading: "자동차 비용과 사업 경비를 구분하기", paragraphs: ["사업용 차량의 비용 처리 여부는 운행 목적·명의·증빙·세법과 사업 형태에 따라 달라질 수 있습니다. 일반 가계의 유지비 계산 결과를 사업자 세무 처리 금액으로 바로 사용하지 마세요."] },
    ],
    faq: [
      { question: "자동차 유지비에 감가상각이나 차량 할부금을 넣어야 하나요?", answer: "목적에 따라 다릅니다. 실제 보유 비용을 비교하려면 할부금·감가·주차비를 별도 항목으로 추가하고, 운행비만 비교하려면 유류비·세금·보험·정비처럼 운영비 중심으로 계산합니다." },
      { question: "자동차 유지비 계산 결과가 실제 비용과 다른 이유는 무엇인가요?", answer: "주행거리, 보험 경력, 지역, 차종, 정비 시기와 유류비가 달라질 수 있기 때문입니다. 계산기는 입력값에 따른 비교용 추정치입니다." },
    ],
    relatedToolSlugs: ["maintenance-cost", "fuel-cost", "parking-fee"],
    relatedGuideSlugs: ["small-business-fixed-cost-guide", "vat-supply-price-guide"],
    monetizationCategory: "automobile",
  },
  {
    slug: "roas-break-even-guide",
    title: "손익분기 ROAS 계산 방법: 광고비·원가·수수료까지 반영하기",
    description: "ROAS가 높아도 이익이 아닐 수 있는 이유와 광고비·상품원가·플랫폼 수수료를 반영한 손익분기 ROAS 계산 방법을 설명합니다.",
    eyebrow: "BUSINESS GUIDE",
    intro: "ROAS는 광고매출을 광고비로 나눈 비율이지만, 상품 원가와 플랫폼 수수료까지 반영한 실제 이익과는 다릅니다. 광고 의사결정에는 ROAS와 광고 후 이익을 함께 보는 것이 필요합니다.",
    sections: [
      { heading: "ROAS와 광고 후 이익은 다른 지표", paragraphs: ["광고비 100만원으로 매출 400만원이 발생하면 ROAS는 400%입니다. 그러나 상품 원가·수수료·배송·반품·기타 비용을 차감하면 실제 이익은 달라집니다.", "ROAS 계산기에 광고비·광고매출·상품 원가·플랫폼 수수료율·기타 비용을 넣으면 기본 ROAS와 광고 후 이익을 함께 확인할 수 있습니다."] },
      { heading: "손익분기 ROAS를 해석하는 방법", paragraphs: ["손익분기 ROAS는 입력한 원가율과 수수료율 조건에서 광고 후 이익이 0원이 되는 최소 수준을 의미합니다. 상품 마진이 낮으면 손익분기 ROAS가 높아지고, 광고 외 고정비를 넣으면 결과가 달라질 수 있습니다."] },
      { heading: "캠페인 비교 전에 동일한 비용 범위 사용하기", paragraphs: ["캠페인마다 매출 집계 기간, 쿠폰, 무료배송, 반품과 부가세 포함 여부가 다르면 ROAS만 비교하기 어렵습니다. 동일한 매출 정의와 비용 범위를 정한 뒤 비교하세요."] },
    ],
    faq: [
      { question: "ROAS가 300%면 무조건 흑자인가요?", answer: "아닙니다. 상품 원가율과 수수료율, 배송·반품·쿠폰·인건비 등 광고 외 비용에 따라 손익분기점이 달라집니다." },
      { question: "목표 ROAS는 어떻게 정하나요?", answer: "판매가에서 상품 원가와 변동비를 제외한 기여이익을 확인한 뒤 광고비를 감당할 수 있는 수준을 기준으로 정합니다. 계산기는 입력값에 따른 참고값을 제공합니다." },
    ],
    relatedToolSlugs: ["roas", "margin", "break-even"],
    relatedGuideSlugs: ["small-business-fixed-cost-guide", "annual-net-pay-guide"],
    monetizationCategory: "business",
  },
  {
    slug: "annual-net-pay-guide",
    title: "연봉 실수령액과 월급 실수령액이 달라지는 이유",
    description: "연봉을 12개월로 나눈 금액과 실제 월급이 다른 이유, 비과세액·공제·상여를 비교하는 방법을 설명합니다.",
    eyebrow: "SALARY GUIDE",
    intro: "연봉을 12개월로 나눈 금액은 세전 월 환산액일 뿐 실제 입금액과 같지 않습니다. 공제 항목과 비과세 수당, 상여 지급 방식이 달라지면 같은 연봉에서도 월 실수령액이 달라질 수 있습니다.",
    sections: [
      { heading: "연봉에서 월 실수령액으로 내려가는 과정", paragraphs: ["세전 급여에서 4대보험과 소득세·지방소득세 등 공제액을 빼고, 비과세 수당이 있다면 과세 대상 급여와 구분합니다. 회사의 급여 구성과 개인의 부양가족·공제 조건에 따라 실제 원천징수액이 달라질 수 있습니다.", "연봉 실수령액 계산기와 월급 실수령액 계산기를 각각 사용하면 연봉 기준과 월 급여 기준의 차이를 비교할 수 있습니다."] },
      { heading: "연봉 비교 때 확인할 계약 조건", paragraphs: ["퇴직금 포함 여부, 고정 상여, 성과급, 식대·차량 유지비 같은 비과세 또는 수당 항목, 수습기간 급여를 확인해야 합니다. 채용 제안의 연봉 숫자만 비교하면 실제 현금흐름을 놓칠 수 있습니다."] },
      { heading: "계산 결과를 급여명세서와 비교하기", paragraphs: ["계산기는 일반적인 조건의 참고값입니다. 실제 급여명세서에서는 국민연금·건강보험·고용보험·소득세의 산정 기준과 회사 급여 규정을 확인하세요."] },
    ],
    faq: [
      { question: "연봉을 12로 나누면 월 실수령액인가요?", answer: "아닙니다. 12로 나눈 값은 보통 세전 월 환산액이며, 실제 지급액은 공제와 비과세·상여 조건을 반영한 뒤 달라집니다." },
      { question: "실수령액 계산기는 정확한 급여명세서를 대신하나요?", answer: "아닙니다. 계산기는 입력 조건에 따른 참고용 추정이며, 실제 급여는 회사의 급여 규정과 최신 공제 기준을 적용합니다." },
    ],
    relatedToolSlugs: ["annual-take-home", "monthly-take-home", "four-insurance"],
    relatedGuideSlugs: ["retirement-fund-how-much-guide", "vat-supply-price-guide"],
    monetizationCategory: "finance",
  },
  {
    slug: "vat-supply-price-guide",
    title: "부가세 포함 금액에서 공급가액과 부가세를 역산하는 방법",
    description: "부가세 포함 금액과 공급가액의 차이, 10% 부가세를 기준으로 양방향 계산하는 방법과 주의사항을 설명합니다.",
    eyebrow: "TAX GUIDE",
    intro: "견적서나 영수증의 금액이 부가세 포함인지 별도인지에 따라 공급가액과 세액을 해석하는 방법이 달라집니다. 금액의 기준을 먼저 확인한 뒤 역산해야 합니다.",
    sections: [
      { heading: "공급가액과 부가세 포함 금액 구분하기", paragraphs: ["공급가액은 부가세를 제외한 과세 대상 금액이고, 부가세 포함 금액은 공급가액과 세액을 더한 금액입니다. 일반적인 10% 부가세 가정에서는 포함 금액을 1.1로 나누어 공급가액을 추정합니다.", "부가세 계산기는 공급가액에서 포함 금액을 계산하거나, 포함 금액에서 공급가액과 세액을 역산하는 양방향 기능을 제공합니다."] },
      { heading: "거래 유형과 세율 확인하기", paragraphs: ["실제 신고에는 과세·면세·영세율 여부, 매입세액 공제, 사업자 유형과 거래 증빙이 영향을 줍니다. 모든 거래에 동일한 계산을 적용할 수 있는 것은 아닙니다."] },
      { heading: "견적과 신고 금액을 구분하기", paragraphs: ["계산기 결과는 견적·가격 검토용 참고값입니다. 신고서 작성이나 환급·납부 판단에는 국세청 최신 안내와 세무 전문가의 확인이 필요합니다."] },
    ],
    faq: [
      { question: "부가세 포함 금액에서 부가세 10%를 바로 빼면 되나요?", answer: "포함 금액의 10%가 세액인 것은 아닙니다. 일반적인 10% 가정에서는 포함 금액을 11로 나눈 값이 세액에 해당하고, 공급가액은 포함 금액에서 세액을 뺀 값입니다." },
      { question: "모든 사업자가 같은 부가세 계산을 사용하나요?", answer: "사업자 유형, 거래의 과세 여부와 적용 세율에 따라 달라질 수 있습니다. 계산기는 일반적인 입력값에 따른 참고용 산술 결과입니다." },
    ],
    relatedToolSlugs: ["vat-calculator", "margin", "fee"],
    relatedGuideSlugs: ["small-business-fixed-cost-guide", "annual-net-pay-guide"],
    monetizationCategory: "tax",
  },
  {
    slug: "small-business-fixed-cost-guide",
    title: "소상공인 손익분기점 계산: 고정비와 판매량을 나누어 보기",
    description: "임대료·인건비 같은 고정비와 판매단가·변동비를 구분해 사업 손익분기 판매량을 계산하는 방법을 안내합니다.",
    eyebrow: "BUSINESS GUIDE",
    intro: "사업의 매출이 늘어도 변동비가 함께 증가하면 이익이 바로 늘지 않을 수 있습니다. 고정비와 변동비를 나누면 몇 개를 팔아야 비용을 회수하는지 더 명확하게 볼 수 있습니다.",
    sections: [
      { heading: "고정비와 변동비 구분하기", paragraphs: ["임대료·기본 인건비·구독료처럼 판매량과 관계없이 발생하는 비용은 고정비로, 재료비·판매 수수료·포장비처럼 판매량에 따라 늘어나는 비용은 변동비로 분류합니다.", "손익분기점 계산기는 고정비·판매단가·변동비를 입력해 손익분기 판매수량과 매출을 참고 계산합니다."] },
      { heading: "판매량 목표와 실제 이익은 다르다", paragraphs: ["손익분기점은 이익이 0원이 되는 지점입니다. 목표 이익을 만들려면 손익분기 판매량에 목표 이익을 더해 판매단가와 단위당 공헌이익을 다시 계산해야 합니다.", "마진율 계산기와 ROAS 계산기를 함께 사용하면 판매가·원가·광고비를 나누어 볼 수 있습니다."] },
      { heading: "월별 현금흐름으로 다시 확인하기", paragraphs: ["세금 납부, 재고 구매, 카드 매출 입금 시차, 대출 상환은 손익계산과 현금흐름에 다르게 영향을 줍니다. 손익분기점 결과만으로 자금 부족 여부를 판단하지 마세요."] },
    ],
    faq: [
      { question: "손익분기점 판매량이 낮으면 사업이 안전한가요?", answer: "그것만으로 판단할 수 없습니다. 판매량 변동, 현금흐름, 재고, 세금, 부채와 실제 고객 확보 비용을 함께 확인해야 합니다." },
      { question: "광고비는 고정비인가요 변동비인가요?", answer: "캠페인 운영 방식에 따라 다릅니다. 판매량과 함께 증가하면 변동비에 가깝고, 월 정액 집행이면 고정비처럼 관리할 수 있습니다. 분석 목적에 맞춰 일관되게 분류하세요." },
    ],
    relatedToolSlugs: ["break-even", "margin", "roas"],
    relatedGuideSlugs: ["roas-break-even-guide", "vat-supply-price-guide"],
    monetizationCategory: "business",
  },
  {
    slug: "pension-retirement-income-guide",
    title: "국민연금·퇴직금·은퇴자금을 함께 확인하는 순서",
    description: "은퇴 준비에서 국민연금 예상액·퇴직금·개인 자산을 어떤 순서로 확인하고 부족자금을 추정하는지 안내합니다.",
    eyebrow: "RETIREMENT GUIDE",
    intro: "은퇴 준비는 하나의 계산기 결과보다 연금과 자산을 같은 기간 기준으로 정리하는 과정에 가깝습니다. 지급 시기와 금액의 성격이 다른 항목을 분리한 뒤 부족한 생활비를 추정하세요.",
    sections: [
      { heading: "먼저 현금흐름 시점을 정리하기", paragraphs: ["국민연금·퇴직연금·개인연금은 지급 개시 연령과 방식이 다를 수 있습니다. 은퇴 직후부터 연금이 나오는지, 일시금인지, 물가 조정이 있는지 확인한 후 월 생활비와 비교합니다.", "국민연금 예상수령액 계산기와 퇴직금 계산기를 각각 사용한 뒤 은퇴자금 계산기의 예상 월 연금 입력값에 반영할 수 있습니다."] },
      { heading: "부족자금은 가정별로 비교하기", paragraphs: ["생활비·물가·수익률·예상 수명을 바꾸어 보수적 시나리오와 기준 시나리오를 비교하세요. 연금이 있어도 의료비·주거비·간병비처럼 별도 준비가 필요한 항목이 있을 수 있습니다."] },
      { heading: "공식 예상액과 계산기 추정치를 구분하기", paragraphs: ["사이트 계산기는 입력값을 바탕으로 한 참고용 추정치입니다. 실제 연금 가입 기록과 지급 예상액은 국민연금공단 등 공식 기관의 조회 결과를 기준으로 확인하세요."] },
    ],
    faq: [
      { question: "국민연금 예상액을 은퇴자금 계산기에 그대로 넣어도 되나요?", answer: "지급 시점·세전 여부·물가 반영 여부를 확인한 뒤 계산 목적에 맞게 입력해야 합니다. 공식 조회 결과와 계산기의 가정이 다르면 결과도 달라질 수 있습니다." },
      { question: "퇴직금과 은퇴자금은 같은 금액인가요?", answer: "아닙니다. 퇴직금은 근로기간과 임금 등에 따라 산정되는 별도 항목이며, 은퇴자금은 은퇴 후 생활비를 충당하기 위해 필요한 전체 자산을 의미합니다." },
    ],
    relatedToolSlugs: ["national-pension", "retirement-pay", "retirement-fund"],
    relatedGuideSlugs: ["retirement-fund-how-much-guide", "annual-net-pay-guide"],
    monetizationCategory: "retirement",
  },
  {
    slug: "four-insurance-payroll-guide",
    title: "월급에서 4대보험 공제액이 달라지는 이유와 확인 순서",
    description: "월급에서 국민연금·건강보험·고용보험·장기요양보험 공제가 어떻게 달라지는지 계산기와 함께 확인합니다.",
    eyebrow: "SALARY & TAX GUIDE",
    intro: "같은 세전 월급이라도 보수월액, 비과세 항목, 가입 유형과 기준 시점에 따라 4대보험 공제액이 달라질 수 있습니다.",
    coreAnswer: "먼저 세전 급여와 비과세 급여를 구분한 뒤 근로자 부담분과 사업주 부담분을 나누어 확인해야 합니다.",
    example: "세전 월급과 비과세 식대, 가입 기준을 입력하고 월급 실수령액과 4대보험 계산기 결과를 함께 비교하세요.",
    caution: "보험료율과 기준소득월액은 시점·가입 유형에 따라 달라질 수 있으므로 실제 급여명세서와 공식 안내를 최종 기준으로 확인하세요.",
    sections: [
      { heading: "급여명세서에서 먼저 확인할 항목", paragraphs: ["세전 급여, 비과세 수당, 보험료 산정 기준이 되는 보수 항목을 구분합니다. 급여 총액과 보험료 산정 기준이 항상 같은 것은 아닐 수 있습니다.", "4대보험 계산기는 입력한 가정으로 근로자와 사업주의 기본 부담액을 비교하는 참고 도구입니다."] },
      { heading: "근로자 부담과 사업주 부담 구분하기", paragraphs: ["급여에서 빠지는 금액은 근로자 부담분이며 사업주 부담분은 급여 공제액과 별도로 회사가 부담합니다. 두 금액을 합쳐 개인의 공제액으로 오해하지 않도록 구분하세요."] },
    ],
    faq: [
      { question: "4대보험 공제액이 매달 같은가요?", answer: "보수 변경, 정산, 휴직·복직, 가입 기준 변경에 따라 달라질 수 있습니다. 실제 급여명세서와 사업장 안내를 확인하세요." },
      { question: "계산기 결과가 급여명세서와 다른 이유는 무엇인가요?", answer: "비과세 항목, 기준소득월액, 정산분과 적용 시점이 계산기의 가정과 다를 수 있기 때문입니다." },
    ],
    relatedToolSlugs: ["four-insurance", "monthly-take-home", "annual-net"],
    relatedGuideSlugs: ["annual-net-pay-guide", "weekly-holiday-pay-guide"],
    monetizationCategory: "tax",
  },
  {
    slug: "weekly-holiday-pay-guide",
    title: "주휴수당 계산 방법: 주 15시간·시급·근무일수 확인하기",
    description: "주휴수당을 계산할 때 시급과 주당 근로시간, 개근 조건을 어떻게 정리하는지 안내합니다.",
    eyebrow: "SALARY GUIDE",
    intro: "주휴수당은 시급 하나만으로 결정되지 않습니다. 주당 소정근로시간과 근무일수, 개근 여부를 함께 확인해야 계산 결과를 해석할 수 있습니다.",
    coreAnswer: "주휴수당을 확인하려면 시급·주당 소정근로시간·1일 근로시간을 같은 주 기준으로 정리해야 합니다.",
    example: "시급과 주당 근로시간을 입력해 주급과 주휴수당을 계산한 뒤, 실제 근로계약서의 소정근로시간과 비교하세요.",
    caution: "근로계약과 실제 근무 형태, 결근·휴업·단시간 근로 여부에 따라 적용이 달라질 수 있어 계산 결과를 임금 확정액으로 사용하지 마세요.",
    sections: [
      { heading: "주휴수당 계산에 필요한 입력값", paragraphs: ["시급, 주당 소정근로시간, 주당 근무일수와 1일 근로시간을 확인합니다. 실제 근무시간과 계약상 소정근로시간이 다르면 어느 기준을 적용할지 먼저 정리해야 합니다.", "주휴수당 계산기는 입력한 조건을 기준으로 예상 주휴수당과 주급을 보여줍니다."] },
      { heading: "주급과 월급을 혼동하지 않기", paragraphs: ["주급은 한 주 기준 금액이고 월급은 월 환산 기준이므로 단순히 4배 하는 방식은 실제 급여 산정과 다를 수 있습니다. 월 환산이 필요하면 시급 계산기와 근무시간 계산기를 함께 사용하세요."] },
    ],
    faq: [
      { question: "주 15시간이면 항상 주휴수당이 발생하나요?", answer: "소정근로시간과 개근 여부 등 여러 요건을 함께 확인해야 합니다. 이 페이지는 일반적인 계산 구조를 설명하는 참고 자료입니다." },
      { question: "알바 주휴수당을 계산기에 나온 그대로 청구해도 되나요?", answer: "아닙니다. 근로계약서, 근무기록과 최신 공식 기준을 확인한 뒤 실제 지급액을 판단하세요." },
    ],
    relatedToolSlugs: ["weekly-holiday-pay", "hourly-wage", "work-hours"],
    relatedGuideSlugs: ["four-insurance-payroll-guide", "annual-net-pay-guide"],
    monetizationCategory: "finance",
  },
  {
    slug: "real-estate-brokerage-fee-guide",
    title: "부동산 중개수수료 계산 방법: 거래금액·상한요율 확인하기",
    description: "매매·전세·월세 중개보수를 비교할 때 거래금액과 적용 요율, 부가세 여부를 확인하는 방법을 안내합니다.",
    eyebrow: "REAL ESTATE GUIDE",
    intro: "부동산 중개수수료는 거래 유형과 금액, 적용 구간에 따라 달라집니다. 계산 전 거래금액을 어떤 방식으로 산정하는지부터 확인해야 합니다.",
    coreAnswer: "중개보수는 거래 유형과 거래금액을 확정한 뒤 해당 구간의 상한요율을 적용해 참고 금액을 계산합니다.",
    example: "매매가 또는 전세보증금, 월세 거래라면 보증금과 월세 환산 기준을 확인해 중개보수 계산기에 입력하세요.",
    caution: "지역·거래 유형·적용 시점·부가세와 실제 협의 조건에 따라 달라질 수 있으므로 계약 전 중개사와 공식 기준을 확인하세요.",
    sections: [
      { heading: "거래 유형별 거래금액 정리", paragraphs: ["매매는 매매대금, 전세는 보증금, 월세는 보증금과 월세를 기준으로 거래금액을 산정하는 방식이 달라질 수 있습니다. 계약서와 최신 요율표를 먼저 확인합니다.", "중개보수 계산기는 입력한 거래금액과 요율을 바탕으로 상한액을 참고 계산합니다."] },
      { heading: "상한액과 실제 지급액 구분하기", paragraphs: ["계산 결과가 곧 확정 지급액을 뜻하는 것은 아닙니다. 중개보수는 상한 범위, 협의 내용, 부가세 처리와 계약 조건을 함께 확인해야 합니다."] },
    ],
    faq: [
      { question: "계산기에 나온 금액을 반드시 지급해야 하나요?", answer: "계산기는 입력값과 상한요율을 기준으로 한 참고값입니다. 실제 지급 조건은 계약 당사자와 중개사, 최신 공식 기준을 확인하세요." },
      { question: "월세 거래금액은 월세만 입력하나요?", answer: "지역과 적용 기준에 따라 보증금과 월세를 환산하는 방식이 달라질 수 있습니다. 거래 유형에 맞는 기준을 확인하세요." },
    ],
    relatedToolSlugs: ["brokerage-fee", "monthly-rent", "jeonse-vs-monthly"],
    relatedGuideSlugs: ["jeonse-vs-monthly-cost-guide", "family-loan-io-document-guide"],
    monetizationCategory: "real-estate",
  },
  {
    slug: "loan-interest-comparison-guide",
    title: "대출 이자 계산과 원리금균등·원금균등 비교 방법",
    description: "대출 원금·금리·기간을 기준으로 월 상환액과 총이자를 비교하고 상환방식 차이를 이해하는 방법입니다.",
    eyebrow: "FINANCE GUIDE",
    intro: "대출 조건을 비교할 때 금리만 보는 것보다 상환방식과 기간에 따른 월 현금흐름, 총이자를 함께 확인하는 것이 중요합니다.",
    coreAnswer: "같은 원금과 금리라도 상환방식과 기간에 따라 월 납입액과 총이자가 달라지므로 두 값을 같이 비교해야 합니다.",
    example: "대출 원금·연이율·기간을 동일하게 넣고 원리금균등과 원금균등의 첫 달 납입액, 총이자를 비교하세요.",
    caution: "실제 금융상품에는 우대금리, 변동금리, 거치기간, 중도상환수수료와 원 단위 절사 등이 반영될 수 있습니다.",
    sections: [
      { heading: "월 납입액과 총이자를 따로 보기", paragraphs: ["월 납입액이 낮아도 기간이 길면 총이자가 늘어날 수 있습니다. 반대로 초기 납입액이 높은 방식은 총이자가 줄어들 수 있어 현금흐름과 비용을 함께 봐야 합니다.", "대출 이자 계산기와 원리금 상환 계산기를 이용해 월 납입액과 총 상환액을 비교하세요."] },
      { heading: "금리 비교 전에 동일 조건 만들기", paragraphs: ["대출금액, 기간, 거치기간, 금리 유형이 다르면 결과 비교가 어렵습니다. 먼저 동일한 조건을 입력한 뒤 한 요소씩 바꾸어 민감도를 확인합니다."] },
    ],
    faq: [
      { question: "원리금균등이 항상 더 유리한가요?", answer: "월 현금흐름을 일정하게 관리하기 쉬운 방식일 수 있지만, 총이자와 초기 상환 부담은 개인 조건에 따라 달라집니다." },
      { question: "계산기 결과가 금융기관 상환표와 다른 이유는 무엇인가요?", answer: "납입일, 금리 변동, 거치기간, 우대조건과 절사 규칙이 계산기의 가정과 다를 수 있기 때문입니다." },
    ],
    relatedToolSlugs: ["loan-interest", "loan-amortization", "monthly-rent"],
    relatedGuideSlugs: ["family-loan-io-document-guide", "jeonse-vs-monthly-cost-guide"],
    monetizationCategory: "finance",
  },
  {
    slug: "retirement-income-tax-guide",
    title: "퇴직소득세 계산 전 확인할 항목과 예상 수령액 보는 법",
    description: "퇴직급여·근속연수·퇴직소득세를 계산할 때 결과를 해석하고 공식 정산과 구분하는 방법을 안내합니다.",
    eyebrow: "RETIREMENT & TAX GUIDE",
    intro: "퇴직급여에서 실제 수령액을 추정하려면 퇴직급여 총액뿐 아니라 근속연수와 과세 방식, 귀속연도별 기준을 함께 확인해야 합니다.",
    coreAnswer: "퇴직소득세 계산기는 입력값에 따른 예상치이므로 퇴직급여·근속연수·세액·지방소득세를 단계별로 나누어 확인해야 합니다.",
    example: "퇴직급여와 근속연수를 입력해 예상 세액을 확인한 뒤 회사 정산 내역과 국세청 안내를 비교하세요.",
    caution: "중간정산, 과세이연, 특별한 퇴직 사유와 귀속연도별 세법에 따라 실제 세액이 달라질 수 있습니다.",
    sections: [
      { heading: "퇴직급여와 퇴직소득세 구분하기", paragraphs: ["퇴직급여는 세전 지급액이고 퇴직소득세는 과세 계산을 거친 공제 항목입니다. 지방소득세와 실제 원천징수 방식도 별도로 확인해야 합니다.", "퇴직소득세 계산기는 단순화된 입력값으로 예상 세액과 수령액을 보여주는 참고 도구입니다."] },
      { heading: "근속연수와 정산 자료 확인하기", paragraphs: ["입사일·퇴사일, 중간정산 여부, 퇴직급여 구성 항목을 확인해야 합니다. 급여명세서와 회사의 퇴직소득 원천징수 내역을 보관하세요."] },
    ],
    faq: [
      { question: "계산기 결과를 세금 신고 금액으로 사용해도 되나요?", answer: "아닙니다. 실제 신고와 원천징수는 공식 정산자료와 최신 세법을 기준으로 확인해야 합니다." },
      { question: "퇴직금이 많으면 세율이 단순히 같은 비율로 오르나요?", answer: "퇴직소득은 일반 근로소득과 계산 구조가 다를 수 있어 금액·근속연수·공제 구조를 함께 확인해야 합니다." },
    ],
    relatedToolSlugs: ["retirement-income-tax", "retirement-pay", "annual-net"],
    relatedGuideSlugs: ["pension-retirement-income-guide", "retirement-fund-how-much-guide"],
    monetizationCategory: "tax",
  },
  {
    slug: "commute-fuel-cost-guide",
    title: "출퇴근 자동차 기름값 계산: 거리·연비·월 주행일수 기준",
    description: "출퇴근 거리와 연비, 유가, 근무일수를 이용해 월 주유비를 비교하고 차량 유지비와 연결하는 방법입니다.",
    eyebrow: "AUTOMOBILE GUIDE",
    intro: "출퇴근 기름값은 하루 이동거리보다 왕복거리와 실제 운행일수, 차량 연비와 유가를 함께 넣어야 현실적인 월 비용에 가까워집니다.",
    coreAnswer: "왕복거리 × 월 운행일수를 먼저 계산한 뒤 연비와 리터당 유가를 적용하면 월 주유비를 비교할 수 있습니다.",
    example: "주유비 계산기에 왕복거리와 월 운행일수를 반영한 총거리, 연비와 유가를 입력하고 자동차 유지비 계산기에서 보험·세금·정비비를 더해 보세요.",
    caution: "교통체증, 계절, 운전습관, 주차비·통행료와 실제 유가 변동은 계산 결과에 포함되지 않을 수 있습니다.",
    sections: [
      { heading: "출퇴근 거리는 왕복 기준으로 입력하기", paragraphs: ["편도 거리만 알고 있다면 왕복으로 환산한 뒤 실제 출근일수와 재택근무일을 반영합니다. 휴일·휴가·출장을 평균적으로 조정하면 월 비교가 더 현실적입니다.", "주유비 계산기는 거리·연비·유가로 예상 연료량과 주유비를 계산합니다."] },
      { heading: "주유비와 보유비용을 나누어 보기", paragraphs: ["주유비는 변동비이고 자동차세·보험료·정비비는 월 또는 연간 환산이 필요한 비용입니다. 차량을 비교할 때는 자동차 유지비 계산기에서 같은 주행조건으로 확인하세요."] },
    ],
    faq: [
      { question: "연비는 공인연비를 입력하면 되나요?", answer: "공인연비는 비교 기준으로 사용할 수 있지만 실제 도심·고속도로 비율과 운전습관에 따라 실연비가 달라질 수 있습니다." },
      { question: "출퇴근 기름값만 보면 차량 선택이 가능한가요?", answer: "아닙니다. 보험료·세금·정비·주차·감가와 초기 구매비용을 함께 비교해야 합니다." },
    ],
    relatedToolSlugs: ["fuel-cost", "maintenance-cost", "parking-fee"],
    relatedGuideSlugs: ["car-monthly-maintenance-cost-guide", "small-business-fixed-cost-guide"],
    monetizationCategory: "automobile",
  },
  {
    slug: "freelancer-project-quote-guide",
    title: "프리랜서 프로젝트 견적 계산: 시급·예상시간·마진 정리",
    description: "프리랜서와 소규모 사업자가 프로젝트 견적에 작업시간·추가비용·마진을 반영하는 방법을 안내합니다.",
    eyebrow: "BUSINESS GUIDE",
    intro: "프로젝트 견적은 작업시간만 곱하는 것이 아니라 회의·수정·프로젝트 관리와 외주·운영비를 포함해 산정해야 실제 수익성을 판단하기 쉽습니다.",
    coreAnswer: "시간당 단가와 예상 작업시간에 추가 비용과 목표 마진을 일관된 기준으로 반영해야 견적과 실제 이익을 비교할 수 있습니다.",
    example: "프로젝트 견적 계산기에 시간당 단가·예상시간·추가비용·마진율을 넣고 마진율 계산기와 손익분기점 계산기로 결과를 교차 확인하세요.",
    caution: "부가세 포함 여부, 원천징수, 플랫폼 수수료, 수정 범위와 대금 지급 시점을 계약서에서 별도로 확인하세요.",
    sections: [
      { heading: "견적에 포함할 작업시간 범위", paragraphs: ["고객 미팅, 자료조사, 디자인·개발, 검수와 수정시간을 나누어 적습니다. 실제 작업 외 시간이 빠지면 시간당 실질 수익이 낮아질 수 있습니다.", "프로젝트 견적 계산기는 입력한 시간당 단가와 예상시간, 추가비용·마진을 기준으로 참고 견적을 계산합니다."] },
      { heading: "마진과 현금흐름을 함께 확인하기", paragraphs: ["견적상 이익과 실제 현금 유입은 다를 수 있습니다. 선금·잔금, 플랫폼 수수료, 세금과 미수금 위험을 별도로 관리하세요."] },
    ],
    faq: [
      { question: "시간당 단가는 어떻게 정하나요?", answer: "목표 월수입과 유급 작업시간, 운영비·세금·휴가 기간을 함께 고려해 기준을 정하고 프로젝트별 난이도와 책임 범위를 조정하세요." },
      { question: "마진율과 마크업률은 같은가요?", answer: "판매가 대비 이익 비율과 원가에 더하는 비율은 계산 기준이 다릅니다. 마진율 계산기에서 두 값을 구분해 확인하세요." },
    ],
    relatedToolSlugs: ["project-quote", "margin", "break-even"],
    relatedGuideSlugs: ["small-business-fixed-cost-guide", "roas-break-even-guide"],
    monetizationCategory: "business",
  },
  {
    slug: "small-business-roas-margin-guide",
    title: "광고 ROAS와 마진율을 함께 보는 소상공인 광고비 계산",
    description: "광고매출만 보는 대신 상품 마진·플랫폼 수수료·고정비를 함께 반영해 광고 효율을 판단하는 방법입니다.",
    eyebrow: "BUSINESS GUIDE",
    intro: "ROAS가 높아도 상품 마진이 낮거나 수수료와 배송비가 크면 광고 후 이익이 작을 수 있습니다. ROAS와 마진율을 같은 비용 기준으로 연결해 보세요.",
    coreAnswer: "광고 의사결정은 ROAS 하나가 아니라 광고 후 이익, 상품 마진, 고정비 회수 가능성을 함께 확인해야 합니다.",
    example: "ROAS 계산기에 광고비·매출·원가·수수료를 입력하고 마진율·손익분기점 계산기로 목표 판매량과 이익을 비교하세요.",
    caution: "매출 집계 시점, 쿠폰·반품·무료배송·부가세 처리 범위를 캠페인마다 동일하게 맞추지 않으면 ROAS 비교가 왜곡될 수 있습니다.",
    sections: [
      { heading: "ROAS와 마진율을 같은 주문 기준으로 계산하기", paragraphs: ["광고 매출에서 상품 원가와 플랫폼 수수료, 배송·반품·쿠폰 비용을 차감한 금액이 광고비를 감당하는지 확인합니다.", "ROAS 계산기는 광고 후 이익과 손익분기 ROAS를 함께 확인할 수 있고, 마진율 계산기는 판매가와 원가의 관계를 보여줍니다."] },
      { heading: "고정비 회수까지 연결하기", paragraphs: ["광고 후 이익이 양수여도 임대료·인건비·구독료 같은 고정비를 회수하지 못할 수 있습니다. 손익분기점 계산기로 월 목표 판매량까지 연결하세요."] },
    ],
    faq: [
      { question: "ROAS가 300%면 광고를 늘려도 되나요?", answer: "상품 마진과 수수료, 재고·현금흐름과 광고 확장에 따른 효율 변화를 함께 확인해야 합니다. ROAS만으로 증액을 결정하지 마세요." },
      { question: "광고비는 마진 계산에 어떻게 넣나요?", answer: "상품 단위 변동비와 광고비 배분 기준을 먼저 정한 뒤, 캠페인·기간·주문 기준을 일관되게 적용해야 합니다." },
    ],
    relatedToolSlugs: ["roas", "margin", "break-even"],
    relatedGuideSlugs: ["roas-break-even-guide", "small-business-fixed-cost-guide"],
    monetizationCategory: "business",
  },
];

export function getGuideContent(slug: string) { return guideContents.find((item) => item.slug === slug); }
export function getGuidePath(slug: string) { return `/guides/${slug}`; }
