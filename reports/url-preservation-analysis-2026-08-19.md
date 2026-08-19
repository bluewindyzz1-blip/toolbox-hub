# URL·SEO 기준선 분석 (2026-08-19)

## 운영 기준

현재 Production `https://carculate.moneyko.co.kr/sitemap.xml`에서 추출한 고유 URL은 169개이며, 코드의 현재 `pnpm run build:vercel` 산출물과 비교한 결과 누락 0개·추가 0개로 일치했다. 현재 기준 URL 전체 목록은 `reports/url-preservation-baseline-2026-08-19.txt`에 저장했다.

운영 `robots.txt`는 다음 규칙을 사용한다.

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /404
Sitemap: https://carculate.moneyko.co.kr/sitemap.xml
```

## 대표 페이지 확인

`/calculator/lifestyle/unit-price`는 서버에서 고유 title `단가 계산기 | 개당 가격·묶음상품 단가 비교 | 도구상자`를 반환하고, 계산기 UI, 계산 공식, 계산 방법, 예시, 주의사항, 개별 FAQ 4개, 관련 도구 3개와 canonical·내부 breadcrumb를 표시한다.

## 보존 원칙

향후 변경은 현재 기준 URL 집합을 그대로 보존하고, 신규 기능은 신규 경로만 추가한다. sitemap·robots·canonical·내부링크를 수정하기 전에는 이 기준 파일과 변경 후 산출물을 비교한다. URL 변경이 불가피하면 코드를 수정하기 전에 기존 URL, 새 URL, 301 redirect, sitemap 반영, canonical 변경, 내부링크 변경을 표로 만들어 승인을 요청한다.
