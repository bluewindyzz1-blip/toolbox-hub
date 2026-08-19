# 1차 계산기 확장 검증 기록 (2026-08-19)

## 구현 범위

기존 카탈로그에서 이미 제공 중인 전월세 환산, 전세대출 이자, 중개보수, 실수령액, 퇴직금, 증여세, 부가세, 마진율, 손익분기점, 국민연금 기능은 중복 생성하지 않았다. 새로 필요한 도구만 신규 URL로 추가했다.

| 신규 URL | 도구 |
|---|---|
| `/calculator/real-estate/jeonse-vs-monthly` | 전세 vs 월세 비교 |
| `/calculator/finance/family-loan-interest` | 가족간 차용증 이자 |
| `/calculator/business/roas` | ROAS |
| `/calculator/automobile/maintenance-cost` | 자동차 유지비 |
| `/calculator/retirement/retirement-fund` | 은퇴자금 |

사업자·자동차·은퇴 카테고리 3개도 신규 카테고리 URL로 추가되어 sitemap에는 8개 URL이 신규 추가된다.

## Preview 브라우저 확인

`/calculator/real-estate/jeonse-vs-monthly`는 고유 title, H1, 6개 입력, 월간·연간 비교 결과, 계산 공식·방법·예시·주의사항, FAQ, 관련 도구를 표시했다. 기본값에서 전세 월간 비용 583,333원, 월세 월간 비용 925,000원, 연간 비용 차이 4,100,000원이 표시됐다.

`/calculator/business/roas`는 고유 title, H1, 5개 입력, ROAS·광고비 비율·광고 후 이익·손익분기 ROAS 결과, FAQ와 관련 도구를 표시했다. 기본값에서 ROAS 400%, 광고 후 이익 1,200,000원, 손익분기 ROAS 266.67%가 표시됐다.
`/calculator/finance/family-loan-interest`에서 상환방식 select가 만기일시·원리금균등·원금균등 3개 옵션으로 표시됐다. 기본 원리금균등 결과는 월 1,476,199원·총 이자 3,143,173원이었고, 만기일시상환으로 변경하자 월 이자 166,667원·총 이자 6,000,000원·총 상환액 56,000,000원으로 결과가 즉시 변경됐다. FAQ와 금융 관련 내부링크도 표시됐다.
`/calculator/automobile/maintenance-cost`는 8개 입력과 월 유지비 393,750원·연간 유지비 4,725,000원·5년 예상 비용 53,625,000원·km당 비용 315원을 표시했고, 자동차 유지비에 맞는 FAQ와 관련 도구를 렌더링했다.

`/calculator/retirement/retirement-fund`는 8개 입력과 은퇴 필요자금 545,264,382원·예상 부족자금 326,152,068원·추가 월 저축액 896,412원·자금 소진 예상 7년 후를 표시했다. 은퇴 계산의 가정과 참고용 한계를 안내하고 퇴직금·국민연금·퇴직소득세 관련 내부링크를 표시했다.
GitHub feature branch `feature/finance-tools-expansion`의 Vercel Preview가 `toolbox-hub-h4sq-3tdklyz9z-bluewindyzz1-8971s-projects.vercel.app`으로 생성됐다. Preview `/calculator/business/roas`에서 title, H1, 5개 입력, 기본 ROAS 400%, 광고 후 이익 1,200,000원, FAQ와 관련 도구가 정상 표시됐다. Preview 화면의 광고 영역은 기존 운영 구조에 따라 표시되며, 이번 변경에서 광고 설정은 수정하지 않았다.
Preview `sitemap.xml`은 커스텀 도메인 canonical URL을 기준으로 기존 URL과 신규 카테고리·도구 URL을 함께 제공했다. 로컬 자동검증 결과 170개 기존 URL 누락 0개, 신규 8개, 중복 0개였다. Preview `robots.txt`는 기존과 동일하게 `Allow: /`, `/admin/`, `/api/`, `/404` 차단, `https://carculate.moneyko.co.kr/sitemap.xml` 선언과 DaumWebMasterTool 토큰을 유지했다.
