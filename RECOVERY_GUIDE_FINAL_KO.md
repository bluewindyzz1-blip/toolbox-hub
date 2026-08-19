# Toolbox Hub 최종 복구 안내서

이 문서는 Manus를 사용하지 않고도 `Toolbox Hub`를 GitHub와 Vercel에서 복원·운영하기 위한 안내서입니다. 기준 프로젝트는 React 19, Vite, TypeScript, Tailwind CSS 4, Wouter 기반이며 Production 주소는 `https://carculate.moneyko.co.kr`입니다.

## 1. 복구 파일

이 ZIP에는 애플리케이션 소스, 계산기 로직, SEO·sitemap 생성 스크립트, 기존 검증 스크립트, 설정 파일과 문서가 포함됩니다. `node_modules`, 빌드 산출물, Manus 로그와 개인 인증정보는 제외했습니다. 의존성은 `pnpm-lock.yaml`로 재현합니다.

## 2. GitHub에서 복원하는 방법

```bash
git clone https://github.com/bluewindyzz1-blip/toolbox-hub.git
cd toolbox-hub
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build:vercel
```

GitHub 저장소가 private으로 바뀌었다면 GitHub 계정으로 인증한 뒤 clone합니다. 별도 ZIP만 가지고 있다면 ZIP을 원하는 폴더에 풀고 같은 명령을 실행하면 됩니다.

## 3. Vercel에 연결하는 방법

Vercel에서 `Add New Project`를 선택하고 GitHub의 `toolbox-hub` 저장소를 연결합니다. Framework는 Vite, Root Directory는 저장소 루트, Build Command는 `pnpm build:vercel`, Output Directory는 `dist/public`으로 설정합니다. 기존 `vercel.json`은 SPA fallback과 정적 파일 제공을 위해 포함되어 있으므로 임의로 삭제하지 않습니다.

Production 도메인을 연결할 때는 기존 도메인 설정을 유지합니다. Preview에서 먼저 확인한 후 Production으로 Promote하는 운영 방식을 권장합니다.

## 4. 환경변수

AdSense 코드는 프로젝트에 이미 연결되어 있습니다. 재설치하거나 컴포넌트를 중복 삽입하지 않습니다. Vercel의 기존 환경변수는 그대로 유지해야 합니다.

```text
VITE_ADSENSE_PUBLISHER_ID=ca-pub-...
VITE_ADSENSE_SLOT_AD_TOP=...
VITE_ADSENSE_SLOT_AD_MIDDLE=...
VITE_ADSENSE_SLOT_AD_RESULT=...
VITE_ADSENSE_SLOT_AD_CONTENT=...
VITE_ADSENSE_SLOT_AD_RELATED=...
VITE_CANONICAL_ORIGIN=https://carculate.moneyko.co.kr
```

제휴 상품을 실제로 연결할 때만 다음 환경변수를 추가합니다. 비어 있으면 제휴 영역은 표시되지 않으며 가짜 링크가 생성되지 않습니다.

```text
VITE_AFFILIATE_OFFERS_JSON=[{"title":"실제 서비스명","description":"실제 조건 설명","href":"https://실제-제휴-주소","category":"finance","label":"추천 서비스"}]
```

## 5. 변경 후 기본 검증

```bash
pnpm check
pnpm build:vercel
pnpm verify:url-preservation
pnpm verify:priority-seo
pnpm verify:all-routes
pnpm test
```

정상 기준은 TypeScript 오류 없음, Production build 성공, 기존 URL 기준 170개 보존, sitemap 생성, 전체 라우트 오류 없음, 테스트 통과입니다. `VITE_ADSENSE_PUBLISHER_ID`가 로컬에 없다는 Vite 경고와 대형 chunk 경고는 환경변수·성능 관련 비차단 경고입니다.

## 6. URL과 SEO 보존 원칙

기존 `/guide` 이용방법 URL과 기존 계산기·변환기 URL을 삭제하거나 변경하지 않습니다. 새 콘텐츠는 `/guides` 아래에 추가합니다. `shared/seo.ts`, `scripts/generate-sitemap.ts`, `scripts/prerender-seo.ts`를 수정할 때는 기존 canonical과 sitemap URL을 먼저 비교합니다.

`robots.txt`, sitemap, canonical, AdSense publisher 설정을 무관하게 초기화하지 않습니다. URL 변경이 필요한 경우에는 먼저 기존 URL에서 새 URL로의 301 계획을 작성하고 승인받아야 합니다.

## 7. 최근 UX 개선 내용

최근 변경에서는 기존 디자인 토큰을 유지하면서 메인 화면에 금융·부동산·세금·사업자·자동차·생활·변환/파일 바로가기를 추가했습니다. 계산기 화면은 입력 영역과 결과 영역의 시각적 대비를 강화하고 모바일에서 결과가 아래에 명확히 표시되도록 했습니다.

가이드 페이지는 상단에 관련 계산기 바로가기와 계산기 열기 CTA를 표시합니다. 메인·카테고리·헤더·푸터에서 가이드 허브로 이동할 수 있으며, 계산기 하단의 관련 가이드와 가이드의 관련 계산기가 양방향으로 연결됩니다.

## 8. 운영 시 주의사항

계산기 로직은 `shared/toolbox.ts`, 도구·카테고리 정의는 `shared/catalog.ts`, 가이드 콘텐츠는 `shared/content.ts`에서 관리합니다. 공통 디자인은 `client/src/index.css`, 라우팅은 `client/src/App.tsx`, 공통 SEO·광고·제휴 영역은 `client/src/components/CatalogSupport.tsx`에서 관리합니다.

광고 코드를 새 페이지마다 직접 복사하지 말고 기존 `AdSenseAutoAds`와 `AdSlot` 구조를 사용합니다. 실제 제휴 링크가 없는 상태에서는 제휴 상품명을 임의로 작성하지 않습니다.

## 9. 복구 순서 요약

```text
1. GitHub clone 또는 ZIP 압축 해제
2. corepack enable
3. pnpm install --frozen-lockfile
4. pnpm check
5. pnpm build:vercel
6. pnpm verify:url-preservation
7. pnpm verify:priority-seo
8. pnpm verify:all-routes
9. pnpm test
10. Vercel Preview 배포
11. Preview 확인 후 Production Promote
```

최종 소스와 이 안내서는 함께 보관해야 합니다. 특히 `pnpm-lock.yaml`, `vercel.json`, `client/index.html`, `shared/seo.ts`, `scripts/prerender-seo.ts`는 배포 재현에 필요한 파일이므로 누락하지 않습니다.


## 10. 검색 의도형 SEO 제목 개선 추가분

이번 업데이트는 새 페이지나 새 URL을 만들지 않고 `shared/content.ts`의 기존 guide `title`·`description`, `shared/catalog.ts`의 주요 계산기 `title`·`description`·`seoTitle`·`seoDescription`을 실제 검색 질문에 맞게 개선했습니다. slug, URL, 계산 로직, canonical, sitemap, robots.txt와 AdSense 구조는 유지합니다.

복구 후 다음 명령으로 최신 상태를 확인합니다.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build:vercel
pnpm verify:url-preservation
pnpm verify:priority-seo
pnpm verify:all-routes
pnpm test
```

정상 기준은 기존 기준 URL 170개 보존, 총 indexable URL 230개, 카테고리 45개, 도구 140개, 테스트 63개 통과입니다. 계산기·세금·금융 결과는 입력값 기반 참고값이므로 실제 신고·계약에는 최신 공식 안내를 최종 기준으로 사용합니다.

이번 변경 핵심 파일:

- `shared/content.ts`: 기존 guide의 검색 의도형 title과 meta description 개선
- `shared/catalog.ts`: 주요 계산기 H1·description·SEO title·SEO description 개선
- `RECOVERY_GUIDE_FINAL_KO.md`: 이번 변경과 복구 절차 기록

**중요:** guide와 계산기의 slug 및 URL은 변경하지 않습니다. 제목을 추가로 수정할 때도 slug·canonical·sitemap 경로를 그대로 유지해야 합니다.

업데이트 일시: 2026-08-19
