# 도구상자 신규 도구 40종 추가 완료

**운영 도메인:** <https://carculate.moneyko.co.kr/>  
**GitHub 커밋:** `2acd4bd` — `Add 20 calculators and 20 text converters`  
**Vercel Production:** `dpl_Hg5ZLfTT7vhGPcPbWTiAXmmc4gSH` — `READY`

기존 계산기·변환기와 URL, 디자인은 유지했습니다. 신규 도구는 모두 개별 URL, 고유 title·description·canonical·구조화 데이터와 사이트맵에 포함되며, 텍스트 변환은 입력 내용을 서버에 전송하지 않고 현재 브라우저에서 처리합니다.

## 추가 계산기 20종

| 번호 | 도구 | 주요 결과 | URL |
|---:|---|---|---|
| 1 | 단가 계산기 | 개당 단가 | `/calculator/lifestyle/unit-price` |
| 2 | 수수료 계산기 | 수수료·수령액 | `/calculator/lifestyle/fee` |
| 3 | 주차비 계산기 | 예상 주차 요금 | `/calculator/lifestyle/parking-fee` |
| 4 | 여행 경비 계산기 | 총액·1인당 경비 | `/calculator/lifestyle/travel-budget` |
| 5 | 레시피 인분 계산기 | 조정 재료량 | `/calculator/lifestyle/recipe-servings` |
| 6 | 수면 시간 계산기 | 취침·기상 기준 수면 시간 | `/calculator/lifestyle/sleep-duration` |
| 7 | 전기 사용량 계산기 | 사용 전력량·예상 요금 | `/calculator/lifestyle/electricity-usage` |
| 8 | 페인트 소요량 계산기 | 면적 기준 필요 페인트량 | `/calculator/lifestyle/paint-amount` |
| 9 | 목표 저축 기간 계산기 | 목표까지 필요한 개월 수 | `/calculator/lifestyle/savings-goal` |
| 10 | 단리 이자 계산기 | 이자·만기 금액 | `/calculator/lifestyle/simple-interest` |
| 11 | 카드 할부 수수료 계산기 | 수수료·월 납부액 | `/calculator/lifestyle/installment` |
| 12 | 환율 계산기 | 환전 예상 금액 | `/calculator/lifestyle/currency-exchange` |
| 13 | 학점 환산 계산기 | 기준 만점 환산 학점 | `/calculator/lifestyle/gpa-conversion` |
| 14 | 목표 점수 계산기 | 남은 평가 필요 점수 | `/calculator/lifestyle/target-score` |
| 15 | 등수 백분위 계산기 | 상위 비율·백분위 | `/calculator/lifestyle/rank-percent` |
| 16 | 인건비 계산기 | 1인·총 인건비 | `/calculator/lifestyle/labor-cost` |
| 17 | 프로젝트 견적 계산기 | 마진 포함 참고 견적 | `/calculator/lifestyle/project-quote` |
| 18 | 월 예산 계산기 | 잔여 예산·사용률 | `/calculator/lifestyle/monthly-budget` |
| 19 | 적립금 계산기 | 실결제액·적립 예정액 | `/calculator/lifestyle/reward-points` |
| 20 | 수익률 계산기 | 순손익·수익률 | `/calculator/lifestyle/return-rate` |

## 추가 변환기 20종

| 번호 | 도구 | 주요 기능 | URL |
|---:|---|---|---|
| 1 | JSON 정리 | 들여쓰기·줄바꿈 정렬 | `/convert/text/json-pretty` |
| 2 | JSON 압축 | 공백 제거 한 줄 JSON | `/convert/text/json-minify` |
| 3 | CSV → TSV | 쉼표 표를 탭 표로 변환 | `/convert/text/csv-to-tsv` |
| 4 | TSV → CSV | 탭 표를 CSV로 변환 | `/convert/text/tsv-to-csv` |
| 5 | CSV → Markdown 표 | CSV를 Markdown 표로 변환 | `/convert/text/csv-to-markdown` |
| 6 | JSON → Markdown 표 | 객체 배열 JSON을 표로 변환 | `/convert/text/json-to-markdown` |
| 7 | Markdown → HTML | 기본 Markdown 문법 HTML 변환 | `/convert/text/markdown-to-html` |
| 8 | HTML → 텍스트 | HTML 태그 제거·텍스트 추출 | `/convert/text/html-to-text` |
| 9 | URL 인코딩 | URL 파라미터용 퍼센트 인코딩 | `/convert/text/url-encode` |
| 10 | URL 디코딩 | 퍼센트 인코딩 문자열 복원 | `/convert/text/url-decode` |
| 11 | Base64 인코딩 | UTF-8 텍스트 Base64 변환 | `/convert/text/base64-encode` |
| 12 | Base64 디코딩 | Base64 텍스트 복원 | `/convert/text/base64-decode` |
| 13 | Unix 시간 → 날짜 | 초·밀리초 타임스탬프 날짜 변환 | `/convert/text/timestamp-to-date` |
| 14 | 날짜 → Unix 시간 | 날짜를 초·밀리초 값으로 변환 | `/convert/text/date-to-timestamp` |
| 15 | HEX → RGB 색상 변환 | HEX 색상 코드를 RGB로 변환 | `/convert/text/hex-to-rgb` |
| 16 | RGB → HEX 색상 변환 | RGB 값을 HEX 색상 코드로 변환 | `/convert/text/rgb-to-hex` |
| 17 | HTML 문자 인코딩 | 특수문자를 HTML 엔티티로 변환 | `/convert/text/html-encode` |
| 18 | HTML 문자 디코딩 | HTML 엔티티를 일반 문자로 복원 | `/convert/text/html-decode` |
| 19 | 줄바꿈 정리 | CRLF·CR·LF를 표준 LF로 통일 | `/convert/text/normalize-lines` |
| 20 | 중복 줄 제거 | 순서를 유지한 텍스트 중복 제거 | `/convert/text/unique-lines` |

## 확인 완료 항목

| 점검 항목 | 결과 |
|---|---|
| TypeScript 검사 | 통과 |
| 자동 테스트 | 8개 파일, 56개 테스트 통과 |
| Vercel Production 빌드 | 통과 |
| 정적 SEO 검증 | 색인 URL 170개·사이트맵 170개, 오류 0개 |
| 신규 도구 수·슬러그 중복 | 계산기 20개·변환기 20개 확인, 중복 0개 |
| Production 단가 계산기 | 입력·기본 결과·고유 SEO 정상 확인 |
| Production JSON 정리 | 20개 탭·실제 변환 결과·복사/다운로드 UI 정상 확인 |

> 신규 계산기 결과는 참고용이며, 세금·금융·계약·공식 요금은 해당 기관의 최신 기준을 확인해야 합니다.

> 텍스트·웹 변환기의 입력 내용은 현재 브라우저에서 처리되며 서버에 업로드하지 않습니다.
