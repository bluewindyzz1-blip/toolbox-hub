import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { Mail, Search, Send } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/ToolLayout";
import { SeoHead } from "@/components/CatalogSupport";
import { useCatalog } from "@/hooks/useCatalog";
import { getCategoryPath, getToolPath } from "@shared/catalog";

const DEFAULT_SUPPORT_EMAIL = "infokokk1@naver.com";

const pages = {
  about: {
    title: "도구상자 소개",
    paragraphs: [
      "도구상자는 생활 계산, 세금·급여 참고 계산, PDF·이미지·문서 변환, 단위 환산을 한곳에서 제공하는 온라인 유틸리티 모음입니다.",
      "계산 도구는 결과와 산식·주의사항을 함께 제공하며, 파일 도구는 현재 브라우저에서만 처리되는 기능을 우선 제공합니다. 실제로 제공하지 않는 복잡한 문서 구조 변환을 완료된 기능처럼 표시하지 않습니다.",
      "세금·급여·보험·부동산처럼 제도와 기준이 바뀔 수 있는 도구는 참고용 간이 계산으로 제공하며, 실제 신고·계약·지급 전에는 각 도구에 안내된 공식 기관 또는 전문가 기준을 확인해야 합니다.",
    ],
  },
  guide: {
    title: "이용방법",
    paragraphs: [
      "상단 메뉴, 홈페이지 카테고리 또는 도구 검색으로 원하는 기능을 찾은 뒤 필요한 값을 입력하거나 파일을 선택하세요. 계산기에서는 계산하기를 누르고, 파일 도구에서는 처리 시작 후 결과 다운로드 버튼을 누르면 됩니다.",
      "파일 도구는 지원 형식과 파일 크기 제한을 먼저 확인하세요. PDF → Word·Excel·한글처럼 원본 구조 보존이 필요한 복잡한 변환은 현재 제공하지 않으며, 단순 확장자 변경 방식의 결과를 만들지 않습니다.",
      "세금·급여·보험·부동산 계산기의 결과는 입력값을 바탕으로 한 참고용 간이 추정입니다. 기준일, 반영 범위와 제외 항목을 확인하고 중요한 의사결정 전에는 공식 기관의 최신 안내를 확인하세요.",
    ],
  },
  faq: {
    title: "자주 묻는 질문",
    paragraphs: [
      "계산 결과는 입력값을 바탕으로 한 참고용 정보입니다. 세금, 금융, 부동산, 급여, 건강과 관련된 실제 판단·신고·계약 전에는 공식 기관 또는 전문가의 최신 기준을 확인하세요.",
      "현재 제공되는 파일 도구는 브라우저 로컬 처리 방식입니다. 선택 파일과 처리 결과는 서버에 업로드·저장되지 않으며, 탭을 닫거나 초기화하면 작업 데이터가 사라집니다.",
    ],
  },
  privacy: {
    title: "개인정보처리방침",
    paragraphs: [
      "도구상자는 현재 파일 변환·이미지 처리·문서 변환을 브라우저의 메모리 안에서 수행합니다. 사용자가 선택한 파일은 서버로 업로드하거나 데이터베이스·스토리지에 저장하지 않으며, 공개 URL·다운로드 링크·검색엔진 색인 대상 파일을 만들지 않습니다. 파일은 형식과 크기를 확인한 뒤 현재 탭에서만 읽고, 초기화·새로고침·탭 종료 시 미리보기와 처리 데이터가 사라집니다.",
      "계산기 입력값도 현재 브라우저에서만 사용됩니다. 문의 페이지는 사이트 서버에 내용을 전송·저장하지 않으며, 사용자가 메일 작성 버튼을 누르면 기기에 설정된 이메일 앱 또는 웹메일 서비스가 열립니다. 이메일 발송 뒤의 수집·보관은 사용자가 선택한 이메일 서비스의 정책에 따릅니다.",
      "광고가 활성화되면 Google AdSense 등 제3자 광고 서비스가 자체 정책에 따라 쿠키 또는 유사 기술을 사용할 수 있습니다. 현재 Publisher ID와 광고 슬롯 ID가 설정되지 않은 환경에서는 광고 스크립트를 불러오지 않습니다. 광고·분석 또는 문의 처리 방식이 바뀌면 이 페이지를 실제 동작에 맞춰 갱신합니다.",
    ],
  },
  terms: {
    title: "이용약관",
    paragraphs: [
      "도구상자는 온라인 계산 및 브라우저 기반 파일 처리 기능을 제공합니다. 이용자는 관련 법령과 타인의 권리를 침해하지 않는 범위에서 서비스를 이용해야 하며, 악성 파일·불법 콘텐츠·타인의 개인정보를 무단으로 처리해서는 안 됩니다.",
      "서비스는 기능 변경, 보안 점검, 브라우저 호환성 또는 외부 정책 변화에 따라 일부 기능이 변경·중단될 수 있습니다. 이용자는 중요한 원본 파일을 별도로 보관하고, 변환 결과의 완전성과 적합성을 필요한 경우 직접 확인해야 합니다.",
    ],
  },
  disclaimer: {
    title: "면책조항",
    paragraphs: [
      "계산 결과와 정보 콘텐츠는 참고용이며 개인의 실제 금융, 세무, 법률, 급여, 부동산 계약, 건강 상태 또는 제도 적용 결과를 확정하지 않습니다. 대출, 전월세, 세금, 연봉, 퇴직금, 보험, 건강 지표 등 중요한 의사결정 전에는 금융기관, 정부기관, 의료기관, 세무 전문가 또는 관련 기관의 최신 기준을 확인하세요.",
      "파일 도구는 사용자의 기기와 브라우저 안에서 처리됩니다. 복잡한 PDF·문서의 글꼴, 레이아웃, 암호화, 손상 상태 또는 브라우저 메모리 제한에 따라 일부 처리가 실패하거나 결과 품질이 달라질 수 있습니다. 원본 파일은 항상 별도로 보관하세요.",
    ],
  },
  cookie: {
    title: "쿠키 및 광고 안내",
    paragraphs: [
      "도구상자는 서비스 품질과 방문 통계를 위해 브라우저 기반 분석 도구를 사용할 수 있습니다. 광고 영역은 Google AdSense Publisher ID와 슬롯 ID가 실제 배포 환경변수로 설정된 경우에만 활성화됩니다. 임의의 광고 ID나 테스트 ID는 소스에 넣지 않습니다.",
      "광고가 활성화된 경우 광고 제공업체는 맞춤 광고, 빈도 제한, 측정 등을 위해 쿠키 또는 유사 기술을 사용할 수 있습니다. 광고는 콘텐츠와 구분된 위치에만 표시하며, 광고 클릭을 유도하는 문구나 UI는 제공하지 않습니다. 필요한 지역별 동의 관리 방식과 광고·쿠키 처리 방식이 변경되면 이 페이지를 갱신합니다.",
    ],
  },
};

export function InfoPage({ type }: { type: keyof typeof pages }) {
  const page = pages[type];
  const path = `/${type === "about" ? "about" : type === "guide" ? "guide" : type === "faq" ? "faq" : type === "cookie" ? "cookie-policy" : type}`;
  return <div className="site-page"><SeoHead title={`${page.title} | 도구상자`} description={page.paragraphs[0]} path={path} kind="CollectionPage" /><SiteHeader /><main className="container info-page"><p className="eyebrow">INFORMATION / 2026</p><h1>{page.title}</h1><div className="info-copy">{page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><Link href="/">도구상자 홈으로 돌아가기</Link></main><SiteFooter /></div>;
}

export function SearchPage() {
  const { data } = useCatalog();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const key = query.trim().toLowerCase();
    if (!key || !data) return [];
    return data.tools.filter((tool) => {
      const category = data.categories.find((item) => item.id === tool.categoryId);
      const parent = category?.parentId ? data.categories.find((item) => item.id === category.parentId) : undefined;
      const haystack = [tool.title, tool.description, ...(tool.searchKeywords ?? []), category?.name ?? "", category?.description ?? "", parent?.name ?? "", parent?.description ?? ""].join(" ").toLowerCase();
      return haystack.includes(key);
    }).slice(0, 30);
  }, [data, query]);
  return <div className="site-page"><SeoHead title="도구 검색 | 도구상자" description="계산기, PDF, 이미지, 문서 변환과 단위 변환 도구를 검색합니다." path="/search" kind="CollectionPage" noindex /><SiteHeader /><main className="container search-page"><p className="eyebrow">TOOL FINDER</p><h1>도구 검색</h1><label className="search-input"><Search size={22} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="PDF 합치기, 사진 PDF, 엑셀, 전세대출" /></label>{query && <div className="search-results">{results.length ? results.map((tool) => { const category = data.categories.find((item) => item.id === tool.categoryId); const parent = category?.parentId ? data.categories.find((item) => item.id === category.parentId) : undefined; return <Link key={tool.id} href={getToolPath(tool, data.categories)}><span>{parent ? `${parent.name} · ${category?.name}` : category?.name}</span><strong>{tool.title}</strong><p>{tool.description}</p><small>바로가기 →</small></Link>; }) : <p>일치하는 공개 도구가 없습니다.</p>}</div>}</main><SiteFooter /></div>;
}

export function ContactPage() {
  const [openedMailer, setOpenedMailer] = useState(false);
  const supportEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = String(form.get("type") ?? "기타 문의");
    const replyEmail = String(form.get("replyEmail") ?? "");
    const message = String(form.get("message") ?? "");
    const subject = `[도구상자 문의] ${type}`;
    const body = `문의 유형: ${type}\n답변 받을 이메일: ${replyEmail}\n\n문의 내용:\n${message}`;
    setOpenedMailer(true);
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return <div className="site-page"><SeoHead title="문의하기 | 도구상자" description="도구상자 오류, 개인정보 처리와 서비스 개선 의견을 운영 이메일로 보낼 수 있습니다." path="/contact" kind="CollectionPage" /><SiteHeader /><main className="container info-page contact-page"><p className="eyebrow">CONTACT / EMAIL</p><h1>문의하기</h1><div className="info-copy"><p>계산 오류, 기능 오류, 파일 변환 오류, 개인정보 문의와 개선 의견은 운영 이메일로 보낼 수 있습니다. 이 사이트는 문의 내용을 서버에 저장하지 않으며, 아래 양식은 사용자의 이메일 앱 또는 웹메일 작성을 도와줍니다.</p><p>운영 문의: <a href={`mailto:${supportEmail}`}>{supportEmail}</a></p></div><form onSubmit={submit}><label>문의 유형<select name="type" required><option>계산 오류</option><option>기능 오류</option><option>파일 변환 오류</option><option>개인정보 문의</option><option>기타 문의</option></select></label><label>이메일<input name="replyEmail" type="email" required placeholder="답변 받을 이메일" /></label><label>문의 내용<textarea name="message" required minLength={10} placeholder="재현 방법과 사용한 입력값을 함께 적어주세요." /></label><button className="primary-action" type="submit"><Send size={17} />이메일 작성하기</button></form>{openedMailer && <p className="form-notice"><Mail size={17} />이메일 앱이 열리지 않으면 위 운영 이메일 주소를 복사해 직접 보내주세요.</p>}</main><SiteFooter /></div>;
}
