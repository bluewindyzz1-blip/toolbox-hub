# 검색엔진 제출·색인 요청 자동화 지원 범위 조사

**조사일:** 2026-08-18

## Google

Google Search Console API는 소유권이 확인된 사이트에 사이트맵 URL을 `PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}`로 제출할 수 있으며, `https://www.googleapis.com/auth/webmasters` OAuth 범위가 필요하다.[1]

일반 웹페이지의 개별 색인 요청은 URL Inspection 도구에서 소유자 또는 전체 사용자 권한으로 수행한다. Google은 다수 URL은 사이트맵 제출을 사용하도록 안내하며, 재크롤 요청이 검색결과 포함이나 즉시 반영을 보장하지 않는다고 명시한다.[2]

Google Indexing API는 `JobPosting` 또는 `VideoObject` 안의 `BroadcastEvent`가 포함된 페이지에만 사용할 수 있다. 일반 계산기·파일 도구 URL에 사용하면 안 된다.[3]

## Bing

Bing Webmaster API는 사이트맵과 URL을 프로그램으로 제출할 수 있다. API 접근은 OAuth 2.0 또는 검증된 Bing Webmaster 사이트에 연결된 API 키 방식으로 제공된다.[4]

Bing은 URL 제출에 IndexNow를 강력 권장하며, IndexNow는 Bing 및 참여 검색엔진에 새·수정·삭제 URL을 통지한다. URL Submission API도 지원하지만 Bing 전용이며 OAuth 2.0 및 배치당 최대 500 URL을 지원한다.[5]

Bing Webmaster는 XML Sitemap뿐 아니라 RSS 2.0, Atom, URL 텍스트 파일도 사이트맵/피드로 받아들이며 robots.txt의 Sitemap 선언도 발견 경로로 사용한다.[6]

## Naver

Naver Search Advisor는 RSS와 사이트맵을 콘텐츠 피드로 취급해 주기적으로 재방문한다. RSS의 모든 URL은 소유 확인된 사이트 도메인과 같아야 하고, 최소 한 개 item·10MB 미만·각 item의 전체 본문 공개가 요구된다. 사이트맵은 전체 URL 포함을 권장한다.[7]

일반 웹마스터 사이트의 신규 페이지 수집 요청은 UI에서 제한된 범위로 할 수 있고, 실시간 수집·검색 노출을 보장하지 않는다. 같은 URL 반복 요청은 권장하지 않는다.[8]

Naver 수집요청 API는 제휴 제안 및 승인 후에만 쓸 수 있다. 공식 제휴 기준에는 웹문서 3만건 이상, 일일 5천 수준의 정상 자체·사용자 콘텐츠 생성/수정, 6개월 이상 정상 운영 등이 제시되어 있어 현재 소규모 도구 사이트의 기본 자동화 수단으로는 적합하지 않다.[9]

## Daum

이번 조사에서 Daum 웹마스터용 공개 사이트맵·RSS 제출 또는 일반 URL 색인 요청 API의 현행 공식 문서를 확인하지 못했다. robots.txt의 Sitemap 선언과 사이트의 정상적인 크롤링 가능 상태를 유지하고, 별도 자동 제출 API가 있다고 가정하지 않는다.

## 설계 결론

1. 사이트 자체에서는 `/sitemap.xml`에 더해 Naver 요구사항을 충족하는 `/rss.xml`을 빌드 시 생성하고 robots.txt에 두 피드를 선언한다.
2. 외부 API 자동화는 Google Search Console 사이트맵 제출과 Bing의 IndexNow 제출만 인증정보가 있을 때 선택 실행하도록 만든다.
3. Naver의 RSS·사이트맵 UI 제출과 일반 신규 URL 수집 요청은 대시보드 수동 절차로 문서화한다. 제휴 access token이 있을 때에만 Naver API를 선택적으로 지원한다.
4. Daum은 robots.txt·사이트맵 공개 상태를 검증하는 운영 체크로 지원한다.

## References

[1]: https://developers.google.com/webmaster-tools/v1/sitemaps/submit "Google Search Console API: Sitemaps submit"
[2]: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl "Google Search Central: Ask Google to recrawl your URLs"
[3]: https://developers.google.com/search/apis/indexing-api/v3/using-api "Google Indexing API: Using the API"
[4]: https://learn.microsoft.com/en-us/bingwebmaster/getting-access "Microsoft Learn: Getting Access to the Bing Webmaster Tools API"
[5]: https://www.bing.com/webmasters/help/URL-Submission-62f2860b "Bing Webmaster Tools: URL submission"
[6]: https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed "Bing Webmaster Tools: Sitemaps"
[7]: https://searchadvisor.naver.com/guide/request-feed "Naver Search Advisor: RSS 및 사이트맵 제출"
[8]: https://searchadvisor.naver.com/guide/request-crawl "Naver Search Advisor: 수집요청 및 검색제외"
[9]: https://searchadvisor.naver.com/guide/crawl-request-api "Naver Search Advisor: 수집요청 API 명세 및 연동"

## 추가 확인: Naver IndexNow 및 Daum Seed URL

Naver Search Advisor는 IndexNow 프로토콜을 지원한다. 새·수정·삭제된 페이지는 key 파일 검증 후 GET 또는 JSON POST로 알릴 수 있고, 여러 URL은 한 요청에 최대 10,000개까지 보낼 수 있다. IndexNow는 색인을 보장하지 않으며 RSS·사이트맵 제출을 대체하지 않는다.[10] [11] [12]

Daum 웹마스터도구의 Seed URL은 RSS·Atom·리스트 페이지·사이트맵 URL을 지원한다. Daum은 Seed URL 등록이 검색 노출을 보장하지 않으며 수집에는 수개월이 걸릴 수 있다고 명시한다.[13]

따라서 구현은 단일 IndexNow key를 웹사이트 루트에 공개하고, Bing과 Naver의 공식 IndexNow 엔드포인트에 새·수정 URL 목록을 POST하도록 설계한다. Daum은 동일 RSS·사이트맵을 Seed URL로 한 번 등록한 뒤 robots.txt의 선언과 피드 공개 상태로 수집을 돕는다.

[10]: https://searchadvisor.naver.com/guide/indexnow-about "Naver Search Advisor: IndexNow 소개"
[11]: https://searchadvisor.naver.com/guide/indexnow-api-key "Naver Search Advisor: API Key 생성하기"
[12]: https://searchadvisor.naver.com/guide/indexnow-request "Naver Search Advisor: 페이지 갱신 요청하기"
[13]: https://cs.daum.net/faq/service/15/category/4118/detail/38543 "Daum 고객센터: 수집 Seed URL"
