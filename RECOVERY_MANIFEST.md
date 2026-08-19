# Toolbox Hub Recovery Manifest

| 항목 | 값 |
|---|---|
| 패키지 기준일 | 2026-08-18 |
| 로컬 기준 커밋 | `0bc4cd6c92e57e7cf04bef172d09669cb53369a3` |
| Production 동등 GitHub 커밋 | `9ebeb31ec0d94827255cc096d718bbe022bab419` |
| 운영 도메인 | `https://carculate.moneyko.co.kr` |
| Vercel 프로젝트 | `toolbox-hub-h4sq` |
| 빌드 명령 | `pnpm run build:vercel` |
| 정적 출력 | `dist/public` |

## 포함 내용

전체 추적 소스, 현재 계산기·변환기, SEO·정적 사전 렌더링·사이트맵 생성 스크립트, Vercel 설정, 로고·파비콘, 테스트 및 운영 보고서를 포함합니다.

## 의도적으로 제외한 내용

`node_modules`, `dist`, `.git`, `.vercel`, 실제 `.env` 파일, 실제 AdSense 게시자·슬롯 ID, 검색엔진 API 토큰, 외부 서비스 로그인 정보, 생성된 `client/public/ads.txt`를 제외합니다. 실제 배포 시 필요한 값은 `RECOVERY_GUIDE_KO.md`의 Vercel 환경변수 표를 보고 각 계정에서 다시 설정하세요.
