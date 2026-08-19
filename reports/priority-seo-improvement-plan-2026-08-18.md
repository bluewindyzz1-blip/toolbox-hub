# 핵심 도구 SEO 개선 설계

## 점검 결과

현재 카탈로그는 고유 title·description·canonical·breadcrumb을 생성하고, 계산기 페이지는 FAQ와 관련 도구를 표시한다. 다만 우선순위 생활·업무 계산기 5종은 개별 FAQ가 비어 있고 관련 도구 연결이 2개 수준이다. 텍스트 변환기 4종은 개별 title·description은 있으나, 화면에 검색 의도형 안내·FAQ·관련 도구 섹션이 없고 `FAQPage` 구조화 데이터도 생성되지 않는다.

## 이번 개선 대상

| 구분 | 대상 페이지 | 개선 초점 |
|---|---|---|
| 계산기 | 단가, 수수료, 주차비, 환율, 수익률 | 실제 입력 상황별 FAQ, 3개 관련 도구 연결, 제목·설명 정교화 |
| 텍스트 변환 | JSON 정리, CSV → Markdown 표, URL 인코딩, Base64 인코딩 | 변환 원리·사용 예시·주의사항·FAQ·관련 도구를 본문에 표시하고 `FAQPage`와 일치 |

## 구현 원칙

각 문구는 실제 도구의 입력값·계산식·변환 방식에만 근거한다. 검색 키워드를 반복하거나 의미 없는 페이지를 늘리지 않고, 사용자가 계산 또는 변환 직후 확인해야 할 조건·예시·다음 도구를 제공한다. 구조화 데이터에는 화면에서 실제로 보이는 FAQ만 넣는다.

이 방향은 사람이 직접 이용해도 유용한 원본 정보와 충분한 주제 설명을 우선하라는 Google의 사람 중심 콘텐츠 원칙, 본문에 표시된 내용만 구조화 데이터로 작성하라는 가이드, 문맥 있는 설명적 내부 링크 권장에 맞춘다.[1][2][3]

## 참고자료

[1] [Google Search Central — Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

[2] [Google Search Central — General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

[3] [Google Search Central — Link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)


## 로컬 브라우저 검증

정적 미리보기에서 JSON 정리 페이지의 고유 title, 변환 순서·예시·주의사항, 4개 FAQ, 3개 관련 도구 링크를 확인했다. 기본 JSON 예시를 실제로 변환했으며 들여쓰기 결과가 생성되고 결과 복사 버튼이 활성화되는 것을 확인했다.

단가 계산기 페이지에서는 개선된 title, 배송비·쿠폰·적립금 및 묶음상품 비교 FAQ 2개, 기본 안내 FAQ 2개, 할인율·적립금·수수료 계산기로 이어지는 관련 도구 링크 3개가 표시되는 것을 확인했다.


## Production 최종 확인

Vercel Production 최신 배포 `dpl_zfHb9RurQW2jvHDAxsgNiuV3d3ZF`가 GitHub 커밋 `76738d3`(`Improve priority tool SEO content`)를 포함하고 `READY` 상태임을 확인했다. `https://carculate.moneyko.co.kr/convert/text/json-pretty`에서 첫 로딩 후 JSON 정리 화면, 고유 title, 본문 안내, FAQ, 관련 도구가 표시되었고, 예시 변환을 실행해 들여쓰기 결과가 실제 생성되는 것을 확인했다.
Production `https://carculate.moneyko.co.kr/calculator/lifestyle/unit-price`에서 고유 title, 1,500원 기본 계산 결과, 계산 공식·방법·예시·주의사항, 개별 FAQ 2개와 기본 FAQ 2개, 관련 도구 3개가 정상 표시되는 것을 확인했다.
