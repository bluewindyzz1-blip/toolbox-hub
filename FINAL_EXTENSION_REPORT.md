# 도구상자 최종 확장 구현 보고서

## 완료 개요

기존 도구상자 프로젝트의 카테고리·URL·계산기·관리 흐름을 유지한 채, 파일 변환 기능을 **실제 브라우저 로컬 처리 방식**으로 확장하고 검색·SEO·보안 안내·광고 준비·성능·모바일 품질을 보강했습니다. 기존 계산기와 라우트는 제거하거나 덮어쓰지 않았습니다.

| 영역 | 완료 내용 | 처리 방식 |
|---|---|---|
| PDF | PDF→PNG/JPG, JPG/PNG/WebP→PDF, 병합, 분할, 추출, 삭제, 순서 변경, 회전, 용량 줄이기 | 브라우저 메모리에서 실제 PDF 렌더링·편집 |
| 이미지 | JPG/PNG/WebP 변환, 품질 기반 용량 줄이기, 유지 비율 리사이즈 | Canvas 기반 실제 재인코딩 |
| 문서·데이터 | CSV↔Excel, CSV↔JSON, TXT→PDF | 브라우저에서 실제 XLSX·CSV·JSON·PDF 생성 |
| 단위 | 길이·면적·무게·부피·온도·속도·데이터·시간·압력·에너지 | 공통 환산 규칙 확장 |
| 허브·검색 | 인기, 최근 추가, 추천 도구, 카테고리 바로가기, 검색 별칭 | 기존 카탈로그 기반 |
| SEO·운영 | canonical, OG, JSON-LD, sitemap, robots, noindex, 환경변수 예제 | SSR 및 정적 자산 보강 |

## 파일 도구 구현 원칙

모든 현재 파일 기능은 선택한 파일을 브라우저 메모리에서만 처리합니다. 파일을 서버·데이터베이스·스토리지에 업로드하지 않고, 공개 URL이나 영구 작업 이력도 만들지 않습니다. 파일 선택, 처리 진행, 결과 목록, 명시적 다운로드, 초기화, 오류 안내, 파일 보안 안내, 지원 형식, 사용 방법, FAQ를 공통 UI로 제공했습니다.

| 기능 | 상세 구현 | 제한 및 안내 |
|---|---|---|
| PDF → PNG/JPG | 페이지별 Canvas 렌더링과 개별 결과 다운로드 | 최대 100페이지 |
| 이미지 → PDF | JPG·PNG·WebP를 순서대로 PDF 페이지 구성 | 이미지당 20MB |
| PDF 편집 | `pdf-lib`으로 병합·분할·추출·삭제·순서 변경·회전 | PDF당 40MB |
| PDF 용량 줄이기 | JPEG 품질을 조절해 페이지를 재구성한 새 PDF 생성 | 최대 50페이지, 텍스트 레이어·벡터 정보 손실 가능성을 고지 |
| 문서·데이터 변환 | `xlsx`로 XLSX·CSV 처리, JSON·TXT 실제 파일 생성 | 문서·데이터 파일당 10MB |

> **PDF → Word는 비공개 상태로 유지했습니다.** 표, 이미지, 글꼴, 레이아웃을 보존하는 변환은 서버 기반 전문 변환 엔진이 필요하므로, 단순 확장자 변경이나 불완전한 결과를 실제 변환처럼 제공하지 않습니다. 향후 서버 API를 연결할 수 있도록 카탈로그와 UI 확장 구조는 마련했습니다.

## 카탈로그·UX·검색 개선

파일 변환 카테고리에 실제 동작하는 PDF, 이미지, 문서 도구를 등록했고, 세부 URL은 해당 작업 모드를 직접 엽니다. 예를 들어 `/convert/pdf-edit/pdf-merge`는 PDF 합치기 탭을, `/convert/document/csv-to-excel`은 CSV→Excel 탭을 기본 선택합니다. 각 도구는 제목·설명·검색 키워드·FAQ·관련 도구·SEO 메타데이터를 카탈로그에 등록했습니다.

홈페이지는 기존 인기 도구 관리 방식을 보존하며, 카테고리 바로가기, 최근 추가 도구, 추천 도구 영역을 추가했습니다. 검색은 제목, 설명, 카테고리, 상위 카테고리, 검색 별칭을 함께 탐색하므로 `PDF 합치기`, `사진 PDF`, `엑셀`, `JSON`, `압력 단위` 등의 검색어를 지원합니다.

## SEO·보안·광고 준비

서버 렌더링 헤드에 제목, 설명, canonical URL, Open Graph, Twitter Card, JSON-LD, BreadcrumbList와 robots 메타를 제공합니다. 공개 안내·문의·문서 변환 페이지를 sitemap에 포함했고, 관리자·API·오류 경로는 `robots.txt`와 `noindex`로 보호했습니다. 기존 및 신규 도구 URL은 모두 카탈로그 기반 sitemap 생성 대상입니다.

광고는 실제 Google AdSense Publisher ID와 슬롯 ID가 환경변수에 모두 설정된 경우에만 로드됩니다. 코드에는 가짜 광고 ID나 임시 광고 코드가 없으며, 광고 미설정 시 빈 광고 박스도 렌더링하지 않습니다. 분석 스크립트도 실제 HTTPS endpoint와 사이트 ID가 모두 설정된 경우에만 로드됩니다.

| 환경변수 | 용도 | 기본 상태 |
|---|---|---|
| `CANONICAL_ORIGIN` | 배포 도메인 기반 canonical·sitemap origin | 미설정 |
| `VITE_ADSENSE_PUBLISHER_ID` | AdSense Publisher ID | 미설정, 광고 미로드 |
| `VITE_ADSENSE_SLOT_AD_TOP` 등 | 위치별 광고 슬롯 ID | 미설정, 광고 미로드 |
| `VITE_ANALYTICS_ENDPOINT` / `VITE_ANALYTICS_WEBSITE_ID` | 선택형 분석 | 미설정, 분석 미로드 |
| `VITE_CONTACT_EMAIL` | 문의 페이지 공개 운영 이메일 | 미설정 |

환경변수 예시는 `.env.example`에 정리했습니다. 개인정보처리방침, 이용약관, 면책조항, 쿠키·광고 안내, 문의하기도 실제 구현 범위에 맞춰 수정했습니다.

## 성능 및 품질 검증

대형 PDF·스프레드시트 의존성은 별도 지연 청크로 분리했습니다. 메인 홈페이지가 무거운 PDF 렌더러나 스프레드시트 라이브러리를 즉시 내려받지 않도록 파일 도구·카탈로그·개별 계산기 라우트를 지연 로딩으로 구성했습니다.

| 검증 항목 | 결과 | 세부 내용 |
|---|---:|---|
| 자동 테스트 | 통과 | 5개 테스트 파일, 37개 테스트 통과 |
| 타입 검사 | 통과 | `pnpm check` 완료 |
| 프로덕션 빌드 | 통과 | 클라이언트·SSR·서버 번들 생성 완료 |
| PDF 실제 처리 | 통과 | 2개 테스트 PDF를 병합해 `merged.pdf` 결과 생성 |
| CSV→Excel 실제 처리 | 통과 | 3행 CSV를 XLSX 결과로 생성 |
| 상세 URL SEO | 통과 | PDF 합치기·CSV Excel 변환 경로에서 올바른 제목 확인 |
| sitemap | 통과 | 신규 PDF·문서 도구 URL 포함 확인 |
| 모바일 390px | 통과 | 홈·PDF 합치기·CSV→Excel·에너지 단위 변환에서 가로 넘침 없음 |

빌드 과정에서 생성되는 PDF 렌더러와 스프레드시트 라이브러리는 기능상 큰 라이브러리이지만, 모두 파일 도구 진입 후에만 불러오는 지연 청크로 분리했습니다. 빌드 자체는 성공합니다.

## 배포 전 확인 사항

1. 실제 운영 도메인을 `CANONICAL_ORIGIN`에 설정한 뒤 공개 배포 URL에서 canonical·sitemap을 다시 확인하세요.
2. Google AdSense 승인 후에만 Publisher ID와 슬롯 ID를 환경변수로 넣으세요. 설정 전에는 광고가 표시되지 않는 것이 정상입니다.
3. 운영 문의를 받을 경우 `VITE_CONTACT_EMAIL`을 설정하거나, 별도의 서버 기반 문의 접수 기능을 설계한 뒤 개인정보처리방침을 그 처리 방식에 맞게 다시 갱신하세요.
4. PDF → Word·Excel·한글 등 원본 구조 보존 변환은 실제 서버 변환 엔진과 보안·보관 정책이 결정된 뒤 활성화하세요.

## 주요 변경 파일

| 파일 | 역할 |
|---|---|
| `client/src/pages/PdfTool.tsx` | 실제 PDF 변환·편집·압축 도구 |
| `client/src/pages/ImageTool.tsx` | 이미지 변환·압축·리사이즈 도구 |
| `client/src/pages/DocumentTool.tsx` | CSV·Excel·JSON·TXT 변환 도구 |
| `client/src/components/FileToolSupport.tsx` | 공통 드롭존·파일 목록·보안·안내 UI |
| `shared/catalog.ts` | 신규 도구·카테고리·검색 키워드·SEO 메타데이터 |
| `shared/toolbox.ts` | 확장된 단위 변환 정의 |
| `client/src/App.tsx` / `vite.config.ts` | 지연 로딩·코드 분할 |
| `server/seo.ts` / `server/sitemap.ts` / `server/catalog.ts` | SEO·sitemap 공개 경로 처리 |
| `client/public/robots.txt` | 크롤링 지침 |
| `.env.example` | 광고·분석·도메인·문의 설정 예시 |
