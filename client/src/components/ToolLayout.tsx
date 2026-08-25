import { Link, useLocation } from "wouter";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { PropsWithChildren, useState } from "react";
import { useCatalog } from "@/hooks/useCatalog";
import { getCategoryPath } from "@shared/catalog";
import { SITE } from "@shared/site";

const mobileUnitGroups = [{ title: "단위 변환", items: [{ label: "길이", href: "/units/length" }, { label: "면적", href: "/units/area" }, { label: "무게", href: "/units/weight" }, { label: "부피", href: "/units/volume" }, { label: "온도", href: "/units/temperature" }, { label: "속도", href: "/units/speed" }, { label: "데이터", href: "/units/data" }] }];

const mobileConvertGroups = [
  { title: "PDF로 변환", items: [{ label: "JPG·PNG → PDF 변환", href: "/convert/pdf/images-to-pdf" }] },
  { title: "PDF에서 변환", items: [{ label: "PDF → JPG·PNG 변환", href: "/convert/pdf/pdf-to-images" }, { label: "PDF → 워드 변환", href: "/convert/pdf/pdf-convert" }, { label: "PDF → 엑셀 변환", href: "/convert/pdf/pdf-to-excel" }, { label: "PDF → 한글 변환", href: "/convert/pdf/pdf-to-hwp" }] },
  { title: "PDF 구성", items: [{ label: "PDF 합치기", href: "/convert/pdf-edit/pdf-merge" }, { label: "PDF 분할", href: "/convert/pdf-edit/pdf-split" }, { label: "페이지 제거", href: "/convert/pdf-edit/pdf-delete-pages" }, { label: "페이지 추출", href: "/convert/pdf-edit/pdf-extract-pages" }, { label: "PDF 구성", href: "/convert/pdf-edit/pdf-page-edit" }] },
  { title: "PDF 편집", items: [{ label: "PDF 회전", href: "/convert/pdf-edit/pdf-rotate-pages" }, { label: "페이지 수 추가", href: "/convert/pdf-edit/pdf-page-numbers" }, { label: "워터마크 추가", href: "/convert/pdf-edit/pdf-watermark" }, { label: "PDF 메타데이터", href: "/convert/pdf-edit/pdf-metadata" }] },
];
export function SiteHeader() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileConvertOpen, setMobileConvertOpen] = useState(false);
  const [mobileUnitOpen, setMobileUnitOpen] = useState(false);
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
          {navItems.map((item, index) => item.href === "/convert" ? (
            <div className={`mobile-nav-group ${mobileConvertOpen ? "expanded" : ""}`} key={item.href}>
              <button className="mobile-nav-item mobile-nav-disclosure" type="button" aria-expanded={mobileConvertOpen} onClick={() => setMobileConvertOpen((open) => !open)}>
                <span>0{index + 1}</span><span className="mobile-nav-label">{item.label}</span><span className="mobile-nav-chevron" aria-hidden="true">{mobileConvertOpen ? "−" : "+"}</span>
              </button>
              {mobileConvertOpen && <div className="mobile-nav-submenu">{mobileConvertGroups.map((group) => <section className="mobile-nav-subcategory" key={group.title}><h3>{group.title}</h3>{group.items.map((subItem) => <Link key={subItem.href + subItem.label} href={subItem.href} onClick={() => setMobileOpen(false)}>{subItem.label}<ArrowUpRight size={15} /></Link>)}</section>)}</div>}
            </div>
          ) : item.href === "/units" ? (
            <div className={`mobile-nav-group ${mobileUnitOpen ? "expanded" : ""}`} key={item.href}>
              <button className="mobile-nav-item mobile-nav-disclosure" type="button" aria-expanded={mobileUnitOpen} onClick={() => setMobileUnitOpen((open) => !open)}>
                <span>0{index + 1}</span><span className="mobile-nav-label">{item.label}</span><span className="mobile-nav-chevron" aria-hidden="true">{mobileUnitOpen ? "−" : "+"}</span>
              </button>
              {mobileUnitOpen && <div className="mobile-nav-submenu">{mobileUnitGroups.map((group) => <section className="mobile-nav-subcategory" key={group.title}><h3>{group.title}</h3>{group.items.map((subItem) => <Link key={subItem.href} href={subItem.href} onClick={() => setMobileOpen(false)}>{subItem.label}<ArrowUpRight size={15} /></Link>)}</section>)}</div>}
            </div>
          ) : (
            <Link key={item.href} href={item.href} className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
              <span>0{index + 1}</span><span className="mobile-nav-label">{item.label}</span><ArrowUpRight size={17} />
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
        {(tag === "DOCUMENT ENGINE" || tag === "IMAGE ENGINE") && <aside className="file-privacy-note"><strong>파일 처리 안내</strong><br />지원 형식: {tag === "DOCUMENT ENGINE" ? "PDF, JPG, PNG, WebP" : "JPG, PNG, WebP"}. 파일 크기 제한: 서버 제한 없음(현재 기기 메모리와 브라우저 성능 범위 내에서 처리). 파일은 현재 브라우저의 메모리에서만 처리되며 서버에 업로드·저장되지 않습니다. 작업 완료 또는 탭 종료 시 결과와 임시 데이터는 브라우저에서 자동으로 사라집니다. 개인정보가 포함된 파일은 필요한 경우에만 선택하세요.</aside>}
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
