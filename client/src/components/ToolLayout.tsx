import { Link, useLocation } from "wouter";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { PropsWithChildren, useState } from "react";
import { AdSlot, SeoHead } from "@/components/CatalogSupport";
import { useCatalog } from "@/hooks/useCatalog";
import { getCategoryPath } from "@shared/catalog";
import { SITE } from "@shared/site";

export function SiteHeader() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data } = useCatalog();
  const navItems = [{ href: "/", label: "홈" }, ...(data?.categories.filter((item) => item.parentId === null).map((item) => ({ href: getCategoryPath(item, data.categories), label: item.name })) ?? []), { href: "/search", label: "검색" }, { href: "/about", label: "정보" }];

  return (
    <header className="site-header">
      <div className="container header-shell">
        <Link href="/" className="brand" aria-label="도구상자 홈">
          <span className="brand-mark" aria-hidden="true" />
          <span>{SITE.name}</span>
          <sup>01</sup>
        </Link>
        <nav className="desktop-nav" aria-label="주요 도구">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={location === item.href || (item.href !== "/" && location.startsWith(`${item.href}/`)) ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="menu-button" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-label="메뉴 열기">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <nav className="mobile-nav container" aria-label="모바일 주요 도구">
          {navItems.map((item, index) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <span>0{index + 1}</span>{item.label}<ArrowUpRight size={17} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <p><span className="red-square" /> {SITE.name}</p>
        <p>파일은 서버로 전송되지 않습니다.<br />모든 변환은 현재 브라우저에서 처리됩니다.</p>
        <p>UTILITY SYSTEM<br />2026 / KOREA</p>
      </div>
      <div className="container footer-links"><Link href="/privacy">개인정보처리방침</Link><Link href="/terms">이용약관</Link><Link href="/disclaimer">면책조항</Link><Link href="/cookie-policy">쿠키 및 광고 안내</Link><Link href="/contact">문의하기</Link><Link href="/search">도구 검색</Link></div>
    </footer>
  );
}

type ToolFrameProps = PropsWithChildren<{
  index: string;
  title: string;
  description: string;
  tag: string;
}>;

export function ToolFrame({ index, title, description, tag, children }: ToolFrameProps) {
  return (
    <div className="site-page">
      <SeoHead title={`${title} | ${SITE.name}`} description={description} />
      <SiteHeader />
      <main className="container tool-page">
        <section className="tool-intro">
          <div className="tool-index">{index}</div>
          <div className="tool-intro-copy">
            <p className="eyebrow">{tag} / BROWSER-ONLY</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="intro-rule" />
        </section>
        <AdSlot slot="AD_TOP" />
        {(tag === "DOCUMENT ENGINE" || tag === "IMAGE ENGINE" || tag === "DATA ENGINE") && <aside className="file-privacy-note"><strong>파일 처리 안내</strong><br />지원 형식: {tag === "DOCUMENT ENGINE" ? "PDF, JPG, PNG, WebP" : tag === "IMAGE ENGINE" ? "JPG, PNG, WebP" : "CSV, XLSX, XLS, JSON, TXT"}. 파일은 현재 브라우저 메모리 안에서만 처리되며 서버에 업로드·저장되지 않습니다. PDF는 파일당 최대 40MB, 이미지는 20MB, 문서·데이터 파일은 10MB까지 지원합니다. 작업 중 생성한 미리보기와 결과 데이터는 초기화·새로고침·탭 종료 시 사라집니다. 개인정보가 포함된 파일은 필요한 경우에만 선택하세요.</aside>}
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
