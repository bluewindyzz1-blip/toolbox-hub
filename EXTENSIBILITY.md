# 도구상자 확장 운영 가이드

## 현재 기술 스택

이 프로젝트는 **React 19**, **Vite**, **TypeScript**, **Tailwind CSS 4**, **Express 4**, **tRPC 11**, **Drizzle ORM**, **MySQL/TiDB** 기반으로 구성되어 있습니다. 공개 도구는 React 페이지로 제공하고, 카테고리 및 도구 메타데이터는 서버 API와 데이터베이스에서 관리합니다. 기존 PDF·이미지 변환은 브라우저에서 처리하며, 계산기 로직은 `shared/toolbox.ts`에 분리되어 있습니다.

## 카테고리와 도구 데이터 구조

`categories` 테이블은 자기 참조 방식의 `parentId`를 사용합니다. 따라서 다음과 같이 **대분류 → 중분류 → 기능** 구조를 만들 수 있습니다.

| 구분 | 관리 데이터 | 역할 |
| --- | --- | --- |
| 대분류 | `parentId = null` | 계산기, 파일 변환, 단위 변환 등 최상위 탐색 영역 |
| 중분류 | `parentId = 대분류 ID` | 금융 계산기, 부동산 계산기, PDF 변환 등 |
| 기능 | `tools.categoryId = 중분류 ID` | 대출 이자 계산기, 월세 계산기, PDF 변환기 등 |

카테고리에는 이름, URL 슬러그, 설명, 아이콘 키, 노출 순서, 공개 상태, SEO 제목과 설명을 보관합니다. 도구에는 제목, 설명, 유형, 안전한 계산 로직 키, 입력 정의, 공식, FAQ, 관련 도구 ID, 공개 상태, 정렬 순서와 SEO 정보를 보관합니다. 따라서 카테고리 이름이나 경로를 여러 화면의 코드에서 직접 바꿀 필요가 없습니다.

## 카테고리 추가·변경 방법

관리자 역할이 지정된 계정으로 `/admin/categories`에 접속합니다. 이 화면에서 대분류를 만들고, 해당 대분류에 하위 카테고리를 추가할 수 있습니다. 각 카테고리는 수정, 공개·비공개 전환, 순서 이동, SEO 정보 입력이 가능합니다. 하위 카테고리 또는 연결된 도구가 남아 있으면 삭제가 차단됩니다.

새 도구를 실제 공개하기 전에는 두 단계를 분리합니다. 먼저 `tools` 데이터에 메타데이터를 추가해 카테고리에서 관리합니다. 다음으로 `shared/toolbox.ts`에 검증 가능한 계산 또는 변환 함수를 만들고 `client/src/pages/`에 도구 화면을 추가합니다. 마지막으로 `client/src/pages/CatalogPages.tsx`의 안전한 `logicKey` 라우터에 연결합니다. 등록만 하고 로직이 연결되지 않은 도구는 공개 화면에서 준비 중 안내를 표시합니다.

> 카테고리 관리 화면은 관리자 역할(`admin`)이 있는 계정만 열 수 있습니다. 첫 로그인 후 프로젝트 데이터베이스의 `users.role`을 `admin`으로 변경하면 됩니다.

## 새 계산기 추가 예시

예금 이자 계산기를 추가한다면 `shared/toolbox.ts`에 `calculateDepositInterest()`처럼 순수 계산 함수를 작성합니다. 그다음 해당 함수를 검증하는 Vitest 테스트를 `server/toolbox.test.ts`에 추가하고, `client/src/pages/DepositInterestCalculator.tsx`에서 공통 `ToolFrame`, `CatalogBreadcrumb`, `CalculatorActions`, `ToolKnowledge` 컴포넌트를 조합합니다. 마지막으로 도구 메타데이터의 `logicKey` 및 `CatalogPages.tsx`의 도구 라우터에 연결합니다.

## 파일 변환기 추가 예시

새 파일 변환기는 **브라우저 내 처리 가능 여부**를 먼저 확인합니다. 클라이언트에서 처리할 수 있다면 `client/src/pages/`에 전용 변환기 화면을 만들고, 파일 크기·형식·다운로드 로직은 `client/src/lib/file-utils.ts`에 재사용 가능한 함수로 분리합니다. 서버 전송이 필요해지는 변환기는 개인정보, 처리시간, 저장 정책을 먼저 검토한 뒤 별도의 서버 API와 스토리지 구조를 설계해야 합니다.

## 현재 URL 구조

| 영역 | 예시 URL | 용도 |
| --- | --- | --- |
| 계산기 대분류 | `/calculator` | 계산기 전체 목록 |
| 계산기 중분류 | `/calculator/real-estate` | 부동산 계산기 목록 |
| 계산기 기능 | `/calculator/salary/annual-net` | 연봉 실수령액 계산기 |
| 파일 변환 대분류 | `/convert` | 파일 변환 전체 목록 |
| 파일 변환 중분류 | `/convert/pdf` | PDF 변환 목록 |
| 단위 변환 대분류 | `/units` | 단위 변환 목록 |
| 기존 짧은 URL | `/rent`, `/loan`, `/pdf`, `/image`, `/unit`, `/vat` | 기존 기능 호환 경로 |

## SEO 구조

각 카테고리와 도구 화면은 SEO 제목·설명을 기반으로 `title`, `description`, canonical, Open Graph, WebApplication 또는 CollectionPage JSON-LD를 설정합니다. 서버 렌더링은 카테고리 데이터에 맞춰 페이지별 본문·메타·BreadcrumbList 구조화 데이터를 HTML에 포함하므로 JavaScript를 실행하지 않는 크롤러도 주요 정보를 받을 수 있습니다. `robots.txt`와 카테고리 데이터 기반의 동적 `/sitemap.xml`도 공개 경로를 제공합니다.

실제 도메인을 연결한 뒤에는 `CANONICAL_ORIGIN` 환경 변수에 `https://도메인`을 지정해야 canonical, Open Graph URL, sitemap이 실제 주소로 일관되게 생성됩니다.

## 광고 예약 영역

`AD_TOP`, `AD_MIDDLE`, `AD_RESULT`, `AD_CONTENT`, `AD_RELATED` 위치를 공통 `AdSlot` 컴포넌트로 예약했습니다. 현재는 코드가 없는 안내 영역만 보이며, Google AdSense 코드를 연결할 때 버튼·결과와 충분히 떨어진 위치에만 삽입하도록 설계되어 있습니다.

## 확장 규모와 운영 원칙

계산 로직, 도구 화면, 도구 메타데이터, 카테고리 데이터를 분리했으므로 100~300개 도구까지 동일한 방식으로 확장할 수 있습니다. 규모가 커지면 카테고리별 페이지네이션, 도구 검색, 전문별 검토 상태, 운영자용 도구 등록 폼을 추가하는 것을 권장합니다. 하나의 도구가 다른 도구의 코드에 직접 의존하지 않도록 유지하는 것이 핵심입니다.

## 내 도메인 연결 방법

1. 프로젝트 관리 화면에서 **Publish**를 실행합니다.
2. 관리 화면의 **Settings → Domains**에서 Manus 제공 도메인 접두사를 변경하거나 보유 도메인을 연결합니다.
3. 보유 도메인을 연결하는 경우 표시되는 DNS 레코드를 도메인 등록기관에 추가하고 인증이 완료될 때까지 기다립니다.
4. 연결 후 `CANONICAL_ORIGIN`을 실제 `https://도메인`으로 설정하면 sitemap과 canonical URL에 실제 주소를 사용할 수 있습니다.

도메인 연결 후에는 Search Console 등 검색 도구에 실제 sitemap URL을 등록하고, 주요 계산기 페이지의 메타와 구조화 데이터를 점검하세요.
