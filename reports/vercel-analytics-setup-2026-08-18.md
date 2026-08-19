# Vercel Web Analytics 활성화 기록

확인일: 2026-08-18

Vercel 프로젝트 `toolbox-hub-h4sq`의 Analytics 화면에서 Web Analytics를 활성화했다.

| 항목 | 확인 내용 |
|---|---|
| 플랜 | Hobby |
| 선택한 옵션 | Web Analytics on Hobby |
| 비용 | 현재 플랜에 포함된 무료 옵션 |
| 제공 한도 | 월 50,000 이벤트, 조회 가능 이력 30일 |
| 현재 화면 | 활성화 완료, Visitors/Page Views/Bounce Rate가 0으로 표시됨 |
| 구현 요구사항 | React 앱에 `@vercel/analytics`를 설치하고 `<Analytics />` 컴포넌트를 최상위 레이아웃에 추가한 뒤 배포·방문해야 수집 시작 |

Vercel 화면 URL: https://vercel.com/bluewindyzz1-8971s-projects/toolbox-hub-h4sq/analytics

React 안내에서 확인한 적용 코드:

```tsx
import { Analytics } from "@vercel/analytics/react";
```

이 컴포넌트를 앱의 최상위에 한 번 렌더링한 뒤 Production에 배포하고 실제 페이지를 방문하면 페이지뷰 수집이 시작된다.

Production 배포 `dpl_GB8kPgVGbwSq6BostL7qGnbRTCtC`가 READY로 전환된 뒤 `https://carculate.moneyko.co.kr/`에 방문해 추적 수집을 시작했다. 브라우저 Performance API의 resource 목록에서는 Vercel Analytics URL이 바로 노출되지 않았으며, 라이브 대시보드 집계는 수집·처리 후 확인이 필요하다.

## 배포 결과

| 항목 | 결과 |
|---|---|
| GitHub 커밋 | `2fb3172` — `Enable Vercel Web Analytics tracking` |
| Vercel Production | `dpl_GB8kPgVGbwSq6BostL7qGnbRTCtC` / `READY` |
| 코드 적용 | `@vercel/analytics` 패키지와 최상위 `<Analytics />` 컴포넌트 추가 완료 |
| Production 방문 | `https://carculate.moneyko.co.kr/` 방문 완료 |
| 대시보드 초기 표시 | Visitors 0 / Page Views 0 / Bounce Rate 0% — 새 활성화 직후 집계 전 상태 |

추가 확인을 위한 Vercel Analytics API 재조회는 연결 서비스의 일시적 시간 초과로 완료하지 못했다. 대시보드에서 수집 기능은 활성화됐고, 추적 코드가 포함된 Production 배포는 완료된 상태다.
