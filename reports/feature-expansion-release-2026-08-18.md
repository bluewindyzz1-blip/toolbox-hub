# 도구상자 기능 확장 릴리스 기록

**배포일:** 2026-08-18  
**운영 도메인:** https://carculate.moneyko.co.kr  
**운영 프로젝트:** `toolbox-hub-h4sq`

이번 업데이트는 기존 계산기·PDF·파일 도구를 유지하면서, 일상·업무에서 반복적으로 사용하는 계산기 10개와 브라우저 로컬 처리 이미지 변환·편집 도구 10개를 새로 추가한 릴리스입니다.

## 추가된 계산기 10개

| 도구 | 주소 | 핵심 결과 |
|---|---|---|
| 할인율 계산기 | `/calculator/lifestyle/discount` | 할인 금액, 최종 결제 예상액 |
| 마진율 계산기 | `/calculator/lifestyle/margin` | 이익, 마진율, 마크업률 |
| 손익분기점 계산기 | `/calculator/lifestyle/break-even` | 손익분기 판매수량, 매출 |
| 주유비 계산기 | `/calculator/lifestyle/fuel-cost` | 예상 연료량, 주유비 |
| 더치페이 계산기 | `/calculator/lifestyle/split-bill` | 1인당 분담금, 팁 포함 총액 |
| 평균 계산기 | `/calculator/lifestyle/average` | 합계, 평균, 최솟값, 최댓값 |
| BMI 계산기 | `/calculator/lifestyle/bmi` | BMI 참고 지표, 범위 안내 |
| 기초대사량 계산기 | `/calculator/lifestyle/bmr` | 하루 BMR 참고 추정치 |
| 칼로리 소모 계산기 | `/calculator/lifestyle/calories-burned` | 활동별 예상 소모 열량 |
| 학점 평균 계산기 | `/calculator/lifestyle/gpa` | 학점 가중 평균 |

> 건강 관련 세 도구는 건강 상태를 진단하거나 치료를 결정하는 용도가 아니라, 입력값에 따른 일반적인 **참고 지표**로만 제공하며 페이지에 이를 명확히 안내합니다.

## 추가된 이미지 변환·편집 도구 10개

| 도구 | 주소 | 처리 방식 |
|---|---|---|
| JPG → PNG 변환 | `/convert/image/jpg-to-png` | PNG 출력 기본 선택 |
| PNG → JPG 변환 | `/convert/image/png-to-jpg` | JPG 출력 기본 선택 |
| JPG → WebP 변환 | `/convert/image/jpg-to-webp` | WebP 출력 기본 선택 |
| PNG → WebP 변환 | `/convert/image/png-to-webp` | WebP 출력 기본 선택 |
| WebP → JPG 변환 | `/convert/image/webp-to-jpg` | JPG 출력 기본 선택 |
| WebP → PNG 변환 | `/convert/image/webp-to-png` | PNG 출력 기본 선택 |
| 이미지 회전 | `/convert/image/image-rotate` | 90°·180°·270° 회전 |
| 이미지 좌우 반전 | `/convert/image/image-flip` | 좌우 또는 상하 반전 |
| 이미지 흑백 변환 | `/convert/image/image-grayscale` | 컬러를 흑백 톤으로 변환 |
| 이미지 여백 추가 | `/convert/image/image-padding` | 균일한 흰색 여백 추가 |

모든 이미지 도구는 JPG·PNG·WebP 파일을 **사용자 브라우저 안에서만** 처리하며, 파일을 서버에 업로드하거나 저장하지 않습니다.

## SEO·배포 반영 사항

각 새 도구에는 개별 제목, 메타 설명, canonical URL, FAQ 구조화 데이터, 연관 도구 연결과 정적 HTML이 생성됩니다. 사이트맵의 기본 도메인도 `https://carculate.moneyko.co.kr`로 고정해 로컬 빌드와 Vercel 빌드 모두 운영 주소를 사용하도록 정리했습니다.

| 검증 항목 | 결과 |
|---|---|
| TypeScript 검사 | 통과 |
| 자동 테스트 | 6개 테스트 파일, 46개 테스트 통과 |
| 새 계산기 수식 테스트 | 9개 대표·경계 조건 통과 |
| Vercel Production 빌드 | 통과 |
| 정적 SEO 검증 | 색인 가능 URL 129개, 오류 0개 |
| Production 계산기 페이지 | 할인율 계산기 렌더링·입력·결과 확인 |
| Production 변환기 페이지 | JPG → PNG 전용 URL 렌더링 및 PNG 기본 선택 확인 |
| 실제 로컬 이미지 처리 | 40×20 PNG를 90° 회전하여 20×40 WebP 결과 생성 확인 |
| Production 배포 | `dpl_7zRxY86jhAfpyQvUiFY1QDjQAo1b` / `READY` |

## 저장소 반영 정보

GitHub `main` 브랜치에는 **Add daily calculators and image converters** 변경이 반영되었고, 이어서 Vercel Production 배포가 완료되었습니다. 새 사이트맵에는 총 129개의 공개 URL이 포함되며, 커스텀 도메인 주소로 제공됩니다.
