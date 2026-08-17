# AdSense Vercel 설정 메모

- 프로젝트: `toolbox-hub-h4sq`
- 정식 도메인: https://carculate.moneyko.co.kr
- Publisher ID: `<VITE_ADSENSE_PUBLISHER_ID>` (실제 값은 Vercel 환경변수에서만 관리)
- 슬롯 키: `VITE_ADSENSE_SLOT_AD_TOP`, `VITE_ADSENSE_SLOT_AD_CONTENT`, `VITE_ADSENSE_SLOT_AD_RELATED` (실제 값은 Vercel 환경변수에서만 관리)
- Preview와 Production 환경변수는 Vercel Dashboard에서 각각 설정하며, 저장소에는 실제 식별자를 기록하지 않는다.
- `scripts/generate-sitemap.ts`는 빌드 시 유효한 Publisher ID가 있는 경우에만 `client/public/ads.txt`를 생성한다. 따라서 `ads.txt`의 실제 내용은 배포 산출물에만 포함되고 Git 저장소에는 포함되지 않는다.
- AdSense 승인 상태와 ads.txt 감지는 Google AdSense 대시보드에서 확인한다.

작성일: 2026-08-17
