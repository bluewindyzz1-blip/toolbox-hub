# 도구상자(Toolbox Hub) 독립 복구·운영 안내서

**복구 패키지 기준일:** 2026-08-18  
**운영 도메인:** `https://carculate.moneyko.co.kr`  
**GitHub 저장소:** `https://github.com/bluewindyzz1-blip/toolbox-hub`  
**Vercel 프로젝트:** `toolbox-hub-h4sq`  
**기준 소스 커밋:** `0bc4cd6` (`Enhance calculator category SEO metadata`)  
**Production에 반영된 동등 GitHub 커밋:** `9ebeb31`

> 이 패키지만 있으면 Manus 없이도 GitHub와 Vercel을 사용해 사이트를 다시 올리고 운영할 수 있습니다. 다만 광고 ID·광고 슬롯 ID·각 서비스의 로그인 정보·도메인 계정 정보는 보안을 위해 들어 있지 않습니다.

## 1. 패키지에 포함된 것과 제외된 것

| 구분 | 포함 여부 | 설명 |
|---|---|---|
| React·TypeScript 전체 소스 | 포함 | 계산기, 변환기, 반응형 화면, SEO, 광고 컴포넌트, Vercel Analytics 코드 |
| `package.json`, `pnpm-lock.yaml`, `vercel.json` | 포함 | 동일한 빌드·배포를 재현하는 구성 |
| SEO·사이트맵·정적 HTML 생성 스크립트 | 포함 | 페이지별 title·description·canonical·Open Graph·JSON-LD 생성 |
| robots.txt·파비콘·공구상자 로고 | 포함 | 검색 크롤링·브랜딩 구성 |
| 환경변수 템플릿 `.env.example` | 포함 | 실제 비밀값 없이 변수 이름만 제공 |
| `node_modules`, `dist`, `.git` | 제외 | 다시 설치·빌드되므로 용량을 줄이기 위해 제외 |
| 실제 AdSense 게시자 ID·광고 슬롯 ID | 제외 | Vercel 환경변수에만 다시 입력해야 함 |
| Google·Naver·Bing·Daum 로그인 정보·API 토큰 | 제외 | 절대 소스에 넣지 말고 각 서비스 계정에서 관리 |
| Vercel 프로젝트 권한·도메인 등록 정보 | 제외 | Vercel과 도메인 관리 서비스에서 다시 연결 |

## 2. 가장 빠른 복구 방법: 기존 GitHub·Vercel이 남아 있을 때

1. 이 ZIP 파일의 압축을 컴퓨터의 빈 폴더에 풉니다.
2. [GitHub 저장소](https://github.com/bluewindyzz1-blip/toolbox-hub)를 열고 **Code → Upload files**로 패키지 안의 파일을 업로드하거나, Git으로 아래처럼 반영합니다.

```bash
git clone https://github.com/bluewindyzz1-blip/toolbox-hub.git
cd toolbox-hub
# 복구 패키지 안의 파일을 이 폴더에 덮어쓴 뒤 실행
git add .
git commit -m "Restore toolbox hub from recovery package"
git push origin main
```

3. Vercel의 `toolbox-hub-h4sq` 프로젝트가 GitHub 저장소의 `main` 브랜치와 연결돼 있다면, push 후 자동으로 Production 배포가 시작됩니다.
4. Vercel 배포가 `Ready`가 되면 아래 주소를 확인합니다.

| 확인 항목 | 주소 |
|---|---|
| 홈 | `https://carculate.moneyko.co.kr/` |
| 계산기 카탈로그 | `https://carculate.moneyko.co.kr/calculator` |
| 사이트맵 | `https://carculate.moneyko.co.kr/sitemap.xml` |
| robots | `https://carculate.moneyko.co.kr/robots.txt` |
| 예시 계산기 | `https://carculate.moneyko.co.kr/calculator/lifestyle/discount` |

## 3. GitHub 저장소까지 새로 만들어야 할 때

1. GitHub에 로그인한 뒤 **New repository**를 누릅니다.
2. 이름은 `toolbox-hub`로 입력하고, 공개 또는 비공개 여부를 선택한 뒤 저장소를 만듭니다. 외부 협업이 필요 없다면 비공개를 권장합니다.
3. 압축 해제 폴더에서 터미널을 열고 아래 명령을 실행합니다.

```bash
git init
git add .
git commit -m "Restore Toolbox Hub"
git branch -M main
git remote add origin https://github.com/본인계정/toolbox-hub.git
git push -u origin main
```

4. GitHub 웹 화면에서 `package.json`, `client`, `shared`, `scripts`, `vercel.json`이 보이는지 확인합니다.

## 4. Vercel 프로젝트를 새로 연결할 때

1. [Vercel](https://vercel.com)에 로그인한 뒤 **Add New → Project**를 누릅니다.
2. 방금 만든 또는 복구한 `toolbox-hub` GitHub 저장소를 선택합니다.
3. 아래 설정을 확인합니다. `vercel.json`이 포함돼 있으므로 대부분 자동으로 적용됩니다.

| 설정 | 값 |
|---|---|
| Framework Preset | Vite 또는 자동 감지 |
| Root Directory | 비워 둠(저장소 최상위) |
| Install Command | `pnpm install --frozen-lockfile` 또는 자동 감지 |
| Build Command | `vercel.json`의 `pnpm run build:vercel` 사용 |
| Output Directory | `dist/public` |
| Production Branch | `main` |

4. **Deploy**를 누릅니다. 배포가 완료되면 Vercel이 제공하는 `vercel.app` 주소에서 먼저 화면을 확인합니다.
5. 도메인을 연결하려면 Vercel 프로젝트의 **Settings → Domains**에서 `carculate.moneyko.co.kr`을 추가합니다. Vercel이 보여 주는 DNS 레코드를 도메인 관리 서비스(Cafe24 등)에 그대로 입력합니다. 기존 도메인 레코드는 임의로 삭제하지 말고, Vercel 화면의 안내값과 비교하세요.

## 5. 반드시 다시 넣어야 하는 Vercel 환경변수

Vercel 프로젝트의 **Settings → Environment Variables**에서 Production·Preview 환경에 필요한 값을 입력합니다. 값 자체는 이 문서나 GitHub에 기록하지 마세요.

| 변수명 | 용도 | 필수 여부 |
|---|---|---|
| `VITE_ADSENSE_PUBLISHER_ID` | AdSense 자동 광고·ads.txt 생성 | 광고 운영 시 필수 |
| `VITE_ADSENSE_SLOT_AD_TOP` | 상단 수동 광고 슬롯 | 수동 슬롯 사용 시 선택 |
| `VITE_ADSENSE_SLOT_AD_CONTENT` | 본문 수동 광고 슬롯 | 수동 슬롯 사용 시 선택 |
| `VITE_ADSENSE_SLOT_AD_RELATED` | 관련 도구 영역 수동 광고 슬롯 | 수동 슬롯 사용 시 선택 |
| `VITE_CANONICAL_ORIGIN` | 브라우저에서 생성되는 canonical·Open Graph 기준 주소 | 권장: `https://carculate.moneyko.co.kr` |
| `VITE_CONTACT_EMAIL` | 문의 페이지 노출 이메일 | 권장 |

`vercel.json`은 Production 빌드에서 `CANONICAL_ORIGIN`, `SITEMAP_ORIGIN`, `VITE_CANONICAL_ORIGIN`을 운영 도메인으로 지정합니다. 도메인을 바꿀 경우 이 파일의 주소도 함께 바꾼 뒤 배포해야 사이트맵·canonical·Open Graph가 새 주소를 가리킵니다.

## 6. 로컬에서 빌드와 기능을 확인하는 방법

컴퓨터에 Node.js 22 LTS와 pnpm이 설치된 상태에서 프로젝트 폴더에서 실행합니다.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run check
pnpm run test
pnpm run build:vercel
```

정상적으로 끝나면 `dist/public/` 안에 정적 결과물이 생성됩니다. 특히 아래 파일을 확인합니다.

```text
dist/public/index.html
dist/public/sitemap.xml
dist/public/robots.txt
dist/public/calculator.html
dist/public/calculator/lifestyle.html
```

브라우저로 로컬 화면을 보려면 아래 명령을 실행합니다.

```bash
pnpm exec vite --host 0.0.0.0
```

이후 `http://localhost:5173`을 열어 홈, 계산기, 파일 변환, 단위 변환을 확인합니다.

## 7. SEO·검색엔진 운영 체크리스트

- `https://carculate.moneyko.co.kr/sitemap.xml`이 공개되는지 확인합니다.
- `https://carculate.moneyko.co.kr/robots.txt`에 사이트맵과 Daum 확인 문자열이 남아 있는지 확인합니다.
- Google Search Console, Naver Search Advisor, Bing Webmaster Tools에 같은 운영 도메인의 사이트맵을 제출합니다.
- 새 페이지를 여러 번 개별 색인 요청하지 말고, 사이트맵이 최신인지와 실제 페이지 품질을 먼저 확인합니다.
- 검색 노출·클릭이 쌓인 뒤에만 클릭이 낮은 일부 페이지의 title·description을 조정합니다.

## 8. Vercel Analytics와 AdSense 확인

- Vercel 방문 지표: **Vercel → toolbox-hub-h4sq → Analytics**에서 방문자, 페이지뷰, 인기 페이지, 유입 국가·기기·브라우저를 확인합니다.
- AdSense: Vercel 환경변수에 게시자 ID와 슬롯 ID가 정확히 들어가 있어야 합니다. 환경변수를 바꾼 뒤에는 새 Production 배포를 실행합니다.
- 광고가 바로 보이지 않더라도 본인 브라우저의 광고 차단기, 쿠키, 지역·재고 조건에 따라 달라질 수 있습니다. 광고를 메뉴·계산 버튼·다운로드 버튼처럼 보이게 배치하지 마세요.

## 9. 문제가 생겼을 때의 안전한 순서

1. Vercel의 **Deployments**에서 가장 최근 `Ready` 배포의 Build Logs를 확인합니다.
2. GitHub의 마지막 변경 파일을 확인합니다.
3. 문제가 변경 직후 발생했다면 Vercel의 이전 정상 Production 배포로 롤백하거나 GitHub에서 문제 커밋을 되돌립니다.
4. 도메인 장애면 Vercel Domains 화면의 DNS 검증 상태와 도메인 관리 서비스의 레코드를 비교합니다.
5. 비밀값은 GitHub 파일이나 메시지에 붙여넣지 말고 Vercel 환경변수에서만 수정합니다.

## 10. 이 패키지를 보관하는 법

- 다운로드한 ZIP은 클라우드 드라이브와 개인 저장장치 두 곳 이상에 보관합니다.
- 사이트를 크게 수정하거나 기능을 추가한 뒤에는 새 복구 ZIP을 다시 만듭니다.
- GitHub의 `main` 브랜치와 Vercel의 마지막 `Ready` 배포를 월 1회 정도 확인합니다.
- 이 ZIP은 **소스 복구용**입니다. 외부 서비스 계정, 결제 정보, AdSense 설정, 도메인 소유권은 각 서비스 계정에서 별도로 유지해야 합니다.
