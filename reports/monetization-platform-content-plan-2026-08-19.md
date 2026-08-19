# 수익형 기능 플랫폼 콘텐츠 계획

## 원칙

기존 sitemap URL 178개와 기존 도구 기능은 보존한다. 신규 검색 유입 페이지는 `/guide/{slug}` 경로에만 추가하며, 계산기·변환기 URL은 변경하지 않는다. 정확한 월간 검색량이나 경쟁도는 Search Console·키워드 도구 데이터 없이는 확정할 수 없으므로, 이번 후보는 검색 의도가 구체적이고 기존 계산기와 연결되며 공식 안내·제휴 서비스로 이어질 수 있는 롱테일 주제를 우선했다.

## 기존 기능과 중복을 피한 초기 콘텐츠 후보

| slug | 검색 의도 | 연결 계산기 | 수익 연결 가능성 |
|---|---|---|---|
| jeonse-vs-monthly-cost-guide | 전세와 월세 중 어떤 조건이 유리한지 비교 | 전세 vs 월세 비교 | 대출·부동산 서비스 |
| family-loan-io-document-guide | 가족간 차용증 작성과 이자 계산 시 확인할 내용 | 가족간 차용증 이자 | 세무·법률 상담 |
| retirement-fund-how-much-guide | 은퇴 후 필요한 자금 계산 방법 | 은퇴자금 | 연금·재무설계 |
| car-monthly-maintenance-cost-guide | 자동차 월 유지비를 어떤 항목으로 계산하는지 | 자동차 유지비 | 자동차 보험·정비 |
| roas-break-even-guide | 광고비·원가·수수료를 포함한 손익분기 ROAS | ROAS | 광고 분석·마케팅 서비스 |
| annual-net-pay-guide | 연봉과 월급 실수령액 차이 | 연봉·월급 실수령액 | 급여·노무 서비스 |
| vat-supply-price-guide | 부가세 포함 금액에서 공급가액 역산 | 부가세 | 세무 서비스 |
| small-business-fixed-cost-guide | 고정비와 판매량으로 사업 손익분기점 확인 | 손익분기점 | 사업자 서비스 |
| pension-retirement-income-guide | 국민연금·퇴직금·은퇴자금을 함께 보는 방법 | 국민연금·퇴직금·은퇴자금 | 연금·재무설계 |

## 외부 기준 참고

은퇴 계산기와 자동차세 계산기 사례에서 사용자는 생활비·연령·수익률, 차종·용도·배기량·차령·납부 시기 같은 구체적인 입력과 결과 설명을 요구한다. 종합소득세 계산기 사례에서는 필요경비·소득공제·세액공제·신고기한처럼 절차형 질문이 함께 검색된다. 따라서 콘텐츠는 단순 키워드 문장이 아니라 `언제 쓰는지 → 무엇을 입력하는지 → 결과를 어떻게 읽는지 → 어떤 항목을 제외하는지 → 관련 계산기로 이동`하는 구조로 만든다.

## 수익 슬롯 원칙

콘텐츠 본문 안에는 광고와 제휴를 섞지 않는다. 계산기 결과 아래에는 환경변수가 설정된 경우에만 표시되는 `AD_RESULT` 슬롯과, 실제 제휴 링크가 등록된 경우에만 표시되는 `추천 서비스` 슬롯을 분리한다. 제휴 링크가 없는 상태에서는 빈 영역을 렌더링하지 않으며, 제휴 링크는 `rel="sponsored nofollow"`로 표시할 수 있도록 모델을 설계한다.

## 조사 근거 URL

- 미래에셋 은퇴계산기: https://investpension.miraeasset.com/mobile/calc/calcSimpleMuch.html — 연령·은퇴연령·월 생활비·기대수명·물가·할인율 가정을 함께 입력하고 참고용 결과와 가정 설명을 제공한다.
- 카눈 자동차세 계산기: https://www.carnoon.co.kr/finance/cartax — 차종·용도·배기량·최초등록일·차령·납부기간 등을 세분화하고 연간세액·과세기간·차령 감면 정보를 함께 보여준다.
- 찾아줘세무사 종합소득세 계산기: https://www.findsemusa.com/service/taxcal/IncomeTaxCalc.do — 필요경비·소득공제·세액공제·신고기한을 입력·설명하고 세무 상담 연결 영역을 제공한다.
- 마이핀플 FIRE 계산기: https://www.myfinpl.com/tools/financial-independence-retire-early-calculator — 연 지출의 25배인 FIRE 목표자산, 4% 인출률, 자산 성장 표와 가정·면책을 함께 제공한다.
- Google Search Central helpful content guidance: https://developers.google.com/search/docs/fundamentals/creating-helpful-content — 검색엔진보다 사람에게 유용한 원본 설명과 실제 경험 중심 콘텐츠를 우선하는 기준으로 참고했다.
