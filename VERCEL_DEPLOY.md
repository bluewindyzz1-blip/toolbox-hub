# Toolbox Hub — Vercel 배포 안내

## 적용된 수정 사항

이 수정본은 Vite 정적 프런트엔드와 Express/tRPC API를 Vercel에 맞게 분리합니다. `vercel.json`은 프런트엔드 빌드 결과인 `dist/public`을 배포하고, `/api/*` 요청은 `api/[...path].ts` 서버리스 함수로 보냅니다. 그 밖의 URL은 `index.html`로 폴백되어 React Router의 새로고침 및 딥링크가 동작합니다.

> 기존 `npm run start`는 포트를 직접 열어 로컬 서버를 실행하는 명령입니다. Vercel 배포 설정의 **Start Command**에 사용하지 마세요.

## GitHub를 통해 배포하기

1. 이 폴더의 내용을 새 GitHub 저장소에 올립니다. `.env` 파일, `node_modules`, `dist` 폴더는 올리지 않습니다.
2. Vercel에서 **Add New → Project**를 선택하고 해당 GitHub 저장소를 가져옵니다.
3. **Root Directory**를 `package.json`과 `vercel.json`이 있는 이 폴더로 설정합니다.
4. `vercel.json`이 배포 설정을 지정하므로 Build Command는 `pnpm run build:vercel`, Output Directory는 `dist/public`으로 인식되어야 합니다. 화면에 다른 값이 남아 있으면 이 값으로 바꿉니다.
5. 아래 환경 변수를 설정한 후 Deploy를 실행합니다.
6. 생성된 `*.vercel.app` 주소를 확인한 뒤, 프로덕션 도메인을 연결했다면 `CANONICAL_ORIGIN`을 실제 HTTPS 도메인으로 변경하고 다시 배포합니다.

| 환경 변수                                                  | 필요 시점                                                     | 설명                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `CANONICAL_ORIGIN`                                         | 권장                                                          | 실제 공개 주소입니다. 예: `https://example.com`. 끝 슬래시는 넣지 않습니다.                                  |
| `DATABASE_URL`                                             | 관리자에서 카테고리·도구를 수정하거나 데이터를 영구 저장할 때 | 외부에서 연결 가능한 MySQL 접속 문자열입니다. 없으면 기본 카탈로그로 읽기 전용 동작을 합니다.                |
| `OWNER_OPEN_ID`                                            | 관리자 계정을 지정할 때                                       | OAuth 인증 후 관리자 권한을 부여할 사용자 식별자입니다.                                                      |
| `OAUTH_SERVER_URL`, `VITE_APP_ID`, `JWT_SECRET`            | 로그인 기능을 실제로 사용할 때                                | 기존 인증 제공자에서 발급한 값입니다. 로그인 기능이 필요 없으면 설정하지 않아도 기본 도구 화면은 동작합니다. |
| `VITE_ADSENSE_*`, `VITE_ANALYTICS_*`, `VITE_CONTACT_EMAIL` | 해당 기능을 사용할 때                                         | 공개 클라이언트 설정 또는 선택적 표시 정보입니다.                                                            |

## 배포 전 로컬 확인

```bash
pnpm install --frozen-lockfile
pnpm run build:vercel
pnpm run check
```

## 배포 후 확인 항목

| URL 또는 기능                | 기대 결과                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| `/`                          | 홈페이지가 표시됩니다.                                                  |
| 계산기 또는 도구 상세 URL    | 새로고침해도 404가 나지 않습니다.                                       |
| `/api/trpc/catalog.snapshot` | tRPC API가 응답합니다.                                                  |
| 관리자 화면                  | 데이터베이스와 인증 환경 변수를 설정한 경우에만 편집 기능을 사용합니다. |

## 알려진 범위

이 수정은 홈페이지, SPA 라우팅, tRPC API와 선택적 DB 연동을 Vercel에서 작동시키는 데 초점을 둡니다. 기존 로컬 프로덕션 서버의 요청별 SSR은 Vercel에서 정적 SPA 폴백으로 제공됩니다. 검색 엔진용 요청별 SSR까지 동일하게 유지해야 한다면, 이후 Nitro 또는 Vercel용 SSR 프레임워크로 별도 마이그레이션하는 것이 적절합니다.
