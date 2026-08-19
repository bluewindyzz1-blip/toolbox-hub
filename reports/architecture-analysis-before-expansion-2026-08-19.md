# Toolbox Hub 기존 프로젝트 분석 및 확장 계획

작성일: 2026-08-19

> **이번 단계에서는 코드를 수정하지 않았습니다.** 기존 URL·sitemap·robots.txt·canonical·내부링크를 보존하는 것을 전제로 현황만 분석하고, 신규 기능을 추가하기 위한 정보구조와 개발 순서를 제안합니다.

## 1. 분석 기준과 현재 기준선

운영 주소는 `https://carculate.moneyko.co.kr`이고, GitHub 저장소는 `bluewindyzz1-blip/toolbox-hub`, 기준 브랜치는 `main`, 현재 기준 커밋은 `76738d3`입니다. 운영 sitemap을 추출한 결과 고유 URL은 170개였으며, 현재 코드에서 `pnpm run build:vercel`로 생성한 sitemap과 비교한 결과 운영 기준 URL의 누락은 0개, 코드에만 존재하는 추가 URL도 0개였습니다.

기준 URL 전체 목록은 `reports/url-preservation-baseline-2026-08-19.txt`에 보관했습니다. 이 파일은 향후 sitemap·카탈로그·라우팅을 수정하기 전후를 비교하는 기준선으로 사용해야 합니다.

| 기준 항목 | 현재 상태 | 이번 분석에서의 조치 |
|---|---|---|
| sitemap.xml | 운영 169개 고유 URL | 전체 URL 목록을 baseline 파일로 저장 |
| robots.txt | `/admin/`, `/api/`, `/404` 차단, sitemap 선언 유지 | 변경하지 않음 |
| canonical | 커스텀 도메인 기준으로 생성 | 변경하지 않음 |
| 내부링크 | 홈·카탈로그·breadcrumb·관련 도구 연결 | 변경하지 않음 |
| URL 변경 | 변경 계획 없음 | 301 계획 없이 변경하지 않음 |
| Production | 기존 운영 상태 유지 | 배포하지 않음 |

## 2. 현재 기술 스택

현재 프로젝트는 React 19, TypeScript, Vite 7, Tailwind CSS 4, Wouter 라우터와 shadcn/ui 계열 컴포넌트를 사용하는 정적 중심 웹 애플리케이션입니다. `client/src/App.tsx`가 전역 라우팅과 lazy loading을 담당하고, `shared/catalog.ts`가 카테고리·도구·경로·SEO 메타데이터의 중심 카탈로그 역할을 합니다.

빌드는 `scripts/generate-sitemap.ts`에서 카탈로그와 정적 경로를 조합해 sitemap을 생성한 뒤 Vite 빌드와 `scripts/prerender-seo.ts`를 실행합니다. Vercel은 `vercel.json`의 `buildCommand`, `outputDirectory: dist/public`, SPA fallback rewrite를 사용합니다. 즉, 신규 도구는 단순히 화면 컴포넌트만 추가하는 방식이 아니라 카탈로그, 라우팅, SEO 정적 출력, sitemap, 내부링크와 함께 연결해야 합니다.

## 3. 현재 사이트 구조와 기능

### 3.1 URL 구조

| 영역 | 현재 경로 예시 | 보존 방침 |
|---|---|---|
| 홈·정보 | `/`, `/about`, `/guide`, `/faq`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/cookie-policy` | 그대로 보존 |
| 계산기 대분류 | `/calculator`, `/calculator/date`, `/calculator/finance`, `/calculator/lifestyle`, `/calculator/real-estate`, `/calculator/salary`, `/calculator/tax` | 그대로 보존 |
| 계산기 개별 도구 | `/calculator/{category}/{tool}` | 기존 slug 그대로 보존 |
| 파일 변환 | `/convert`, `/convert/compression`, `/convert/document` 및 하위 경로 | 기존 slug 그대로 보존 |
| 이미지·PDF·문서 레거시 | `/image`, `/pdf`, `/document` | sitemap 포함 여부와 관계없이 직접 접근 URL 보존 |
| 단위 변환 | `/units`, `/units/{subcategory}`, `/units/{subcategory}/{tool}` | 그대로 보존 |
| 레거시 계산기 | `/rent`, `/loan`, `/unit`, `/vat` | 기존 직접 접근 URL 보존 |
| 검색·관리 | `/search`, `/admin/categories` | `/search`는 noindex, `/admin/`은 robots 차단 유지 |

### 3.2 현재 기능

현재 카탈로그에는 날짜·시간, 금융, 생활·업무, 부동산, 급여·고용, 세금·사회 분야 계산기와 PDF, 이미지, 문서·데이터, 텍스트·웹, 단위 변환 도구가 연결되어 있습니다. 개별 계산기 페이지에는 입력·결과·계산 공식·계산 방법·예시·주의사항·FAQ·관련 도구 구조가 적용되어 있고, 대표 운영 페이지에서 이 구조가 실제 HTML로 반환되는 것을 확인했습니다.

변환 도구에는 PDF 변환·합치기·분할·페이지 편집, 이미지 포맷 변환·압축·크기 조정·회전·반전·흑백·여백, CSV·Excel·JSON·TXT 관련 문서 변환, JSON·CSV·URL·Base64·색상·시간·HTML·줄 정리 변환, 단위 변환이 포함되어 있습니다.

## 4. 유지해야 할 기능과 위험한 수정 지점

기존 계산기·변환기·PDF·이미지 도구, 레거시 URL, 현재 디자인, 광고·분석 스크립트, 정적 SEO 생성, sitemap과 robots 규칙을 유지해야 합니다. 특히 `shared/catalog.ts`에서 slug를 변경하면 sitemap, canonical, breadcrumb, 관련 도구 링크, prerender 경로가 동시에 영향을 받으므로 가장 위험한 수정 지점입니다.

`client/src/pages/CatalogPages.tsx`의 route mapping도 카탈로그의 도구 slug와 실제 화면 컴포넌트를 연결합니다. 카탈로그에 도구만 등록하고 route mapping을 빠뜨리면 검색엔진에는 페이지가 생성되지만 사용자 화면에는 준비 중 안내가 표시될 수 있으므로, 신규 도구는 반드시 실제 동작 컴포넌트·테스트·정적 SEO를 함께 추가해야 합니다.

또한 세금·급여·부동산·금융 계산기는 제도와 기준이 바뀔 수 있습니다. 신규 계산기에는 적용 기준일, 계산 가정, 참고용 안내, 공식 기관 확인 문구를 표시하고, 특정 법률·세무·금융 판단을 확정적으로 제시하지 않아야 합니다.

## 5. SEO·성능 현황과 개선 필요성

현재 title, meta description, canonical, Open Graph, breadcrumb, FAQ 및 목록형 구조화 데이터와 정적 prerender가 이미 구축되어 있습니다. 대표 페이지는 계산 UI보다 먼저 H1과 설명이 출력되고, 계산 방법·예시·주의사항·FAQ·관련 도구가 함께 노출되어 사람 중심의 안내 구조를 갖추고 있습니다.

개선할 부분은 기존 URL을 바꾸는 것이 아니라 다음과 같은 **신규 페이지의 품질 일관성**입니다. 각 신규 페이지에 고유 title·description·H1·계산 방법·가정·FAQ·관련 도구를 제공하고, 실제 화면에 표시되는 FAQ만 구조화 데이터에 포함해야 합니다. 또한 신규 기능이 늘어날수록 초기 JavaScript 번들 경고와 PDF 관련 큰 chunk를 관찰하되, 기존 기능을 깨뜨릴 수 있는 대규모 번들 구조 변경은 별도 승인 없이는 하지 않습니다.

## 6. 제안하는 신규 정보구조

기존 대분류 URL을 변경하지 않고 다음처럼 기존 구조에 신규 하위 분류를 추가하는 방식을 제안합니다.

| 사업 방향 | 기존 구조와의 관계 | 신규 URL 원칙 |
|---|---|---|
| 돈·금융 | 기존 `/calculator/finance` 유지 | 새 금융 도구만 `/calculator/finance/{new-slug}` 추가 |
| 부동산 | 기존 `/calculator/real-estate` 유지 | 기존 전월세·중개보수·대출 slug와 중복 확인 후 추가 |
| 세금 | 기존 `/calculator/tax` 유지 | 기존 증여·상속·부가세·소득세 slug와 중복 확인 후 추가 |
| 사업자 | 기존 생활·업무 계산기와 마진·손익분기점 기능을 우선 연결 | 신규 분류가 필요할 때 `/calculator/business` 추가 검토 |
| 자동차 | 현재 생활·주유비 기능과 중복 여부 확인 | 승인 후 `/calculator/automobile` 신규 분류 검토 |
| 생활 | 기존 `/calculator/lifestyle` 유지 | 생활비·전기·날짜 등 신규 기능만 하위 slug 추가 |
| 파일·변환 | 기존 `/convert`와 하위 분류 유지 | 신규 변환 유형만 기존 하위 분류 또는 새 하위 분류에 추가 |

현재 요청에 포함된 1차 기능 중 전월세 환산, 전세대출 이자, 전세·월세 비교, 중개보수, 마진율, 손익분기점, 부가세 등은 기존 카탈로그와 상당 부분 겹칠 가능성이 있으므로 먼저 중복 여부를 확인해야 합니다. 같은 검색 의도를 가진 기능을 새 URL로 중복 생성하지 않고, 기존 페이지의 기능 보강 또는 별도의 검색 의도가 명확한 신규 URL로만 추가하는 것이 안전합니다.

## 7. sitemap·robots·canonical·내부링크 변경 전후 비교 절차

이번 분석 시점에는 변경 전과 변경 후의 차이가 없습니다. 실제 개발을 승인받은 뒤에는 다음 순서를 지킵니다.

1. `reports/url-preservation-baseline-2026-08-19.txt`와 현재 운영 sitemap을 읽어 기준 URL 집합을 고정합니다.
2. 신규 기능의 기존 URL 충돌, slug 충돌, canonical 경로, 관련 도구 링크를 먼저 검사합니다.
3. 코드 수정 후 `pnpm run build:vercel`로 sitemap과 정적 HTML을 생성합니다.
4. 기존 URL 집합이 모두 유지되는지, 신규 URL만 추가되었는지, 중복 URL이 없는지 자동 비교합니다.
5. robots.txt·canonical·내부링크의 현재 상태와 변경 후 상태를 표로 보고합니다.
6. URL 변경이 필요하면 작업을 중단하고 `기존 URL → 새 URL`, 301 대상, sitemap 제거·추가, canonical 변경, 내부링크 변경을 먼저 승인받습니다.
7. 승인 전에는 기존 URL 삭제·rename·redirect·Production 배포를 하지 않습니다.

권장 비교 결과는 다음 형식으로 남깁니다.

| 비교 항목 | 현재 기준 | 변경 후 | 허용 조건 |
|---|---|---|---|
| 기존 sitemap URL | 170개 고유 URL | 기존 170개 전부 유지 | 누락 0개 |
| 신규 sitemap URL | 0개 | 승인된 신규 URL만 추가 | 의도하지 않은 URL 0개 |
| 삭제 URL | 없음 | 없음 | 승인 없이는 금지 |
| robots.txt | 현재 규칙 유지 | 신규 경로가 차단되지 않도록 검토 | 기존 규칙 보존 |
| canonical | 각 URL의 자기 자신 기준 | 신규 URL만 자기 자신 기준 | 기존 canonical 불변 |
| 내부링크 | 기존 링크 유지 | 신규 도구 링크만 추가 | 기존 링크 제거 금지 |

## 8. 단계별 개발계획

### 1단계: 기준선 보호 자동화

기존 URL baseline 비교 스크립트, sitemap 중복 검사, canonical 집합 검사, 내부 링크의 존재 여부 검사를 먼저 추가합니다. 이 단계에서는 사용자 기능과 기존 URL을 변경하지 않습니다.

### 2단계: 공통 계산기 확장 구조

기존 `CatalogTool` 메타데이터, `CatalogPages` route mapping, 공통 입력·결과·안내·FAQ·관련 도구 구조를 재사용합니다. 금융·부동산·세금 계산기는 기준일과 계산 가정을 표시할 수 있는 공통 필드를 먼저 설계합니다.

### 3단계: 승인된 1차 기능을 소수 단위로 추가

한 번에 100개를 생성하지 않고 우선순위가 높은 기능 3~5개씩 추가합니다. 각 기능마다 신규 slug, 계산 로직, UI, 테스트, title·description, canonical, FAQ, 관련 도구, sitemap 포함 여부를 함께 검증합니다.

### 4단계: Preview 검증

GitHub feature branch에 반영하고 Vercel Preview에서 직접 URL, 새로고침, 모바일, 입력·결과, 정적 HTML, robots, sitemap을 확인합니다. Preview 검증 결과와 URL 비교표를 먼저 보고한 뒤 Production 반영 여부를 결정합니다.

### 5단계: Production 반영 후 검색 모니터링

승인받은 변경만 main에 병합하고 Production에 반영합니다. 배포 후 기존 주요 URL의 HTTP 상태·canonical·title·내부링크를 재검사하고, 신규 URL만 Search Console에서 선택적으로 색인 요청합니다.

## 9. 이번 분석의 결론과 승인 요청

현재 프로젝트는 대규모 재작성보다 카탈로그 기반의 단계적 확장이 적합합니다. 기존 운영 sitemap과 현재 코드 생성 결과는 169개 고유 URL 기준으로 일치하고, 기존 URL을 보존한 채 신규 도구를 추가할 수 있는 구조입니다. 다만 기존 기능명과 겹치는 1차 후보가 있으므로, 다음 작업은 먼저 기준선 보호 자동화와 후보별 중복 검토부터 시작해야 합니다.

이번 단계에서 변경한 것은 분석 기록과 URL baseline 파일뿐이며, 기존 애플리케이션 코드·sitemap 생성 로직·robots.txt·canonical·내부링크·GitHub main·Vercel Production은 변경하지 않았습니다.

**승인 후 첫 개발 단계로 진행할 수 있는 범위:**

- 기존 URL 보존 검증 스크립트 추가
- 1차 후보 15개를 기존 카탈로그와 대조해 중복·신규 여부 보고
- 승인받은 신규 URL만 기능 설계 및 Preview 구현

## 참고 자료

- 운영 sitemap: https://carculate.moneyko.co.kr/sitemap.xml
- 운영 robots.txt: https://carculate.moneyko.co.kr/robots.txt
- 대표 운영 페이지: https://carculate.moneyko.co.kr/calculator/lifestyle/unit-price
- 프로젝트 sitemap 생성 로직: `scripts/generate-sitemap.ts`
- 프로젝트 라우팅: `client/src/App.tsx`, `client/src/pages/CatalogPages.tsx`
- SEO 경로 해석: `shared/seo.ts`
- 카탈로그 기준: `shared/catalog.ts`
