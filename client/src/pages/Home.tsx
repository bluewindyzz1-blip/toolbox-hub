import { ArrowUpRight, Calculator, ChevronDown, FileText, FolderOpen, Image, Landmark, ReceiptText, Ruler, Search, ShieldCheck, Zap, Wrench } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/ToolLayout";
import { GuideDiscovery, SeoHead } from "@/components/CatalogSupport";
import { useCatalog } from "@/hooks/useCatalog";
import { getCategoryPath, getToolPath } from "@shared/catalog";

const kindIcons = { calculator: Calculator, converter: FileText, unit: Ruler };
const recommendationKeys = new Set(["pdf-merge", "image-compress", "csv-to-excel", "unit-data", "d-day", "monthly-take-home"]);
const focusTopics = [{ slug: "finance", label: "금융" }, { slug: "real-estate", label: "부동산" }, { slug: "tax", label: "세금" }, { slug: "business", label: "사업자" }, { slug: "automobile", label: "자동차" }, { slug: "lifestyle", label: "생활" }, { slug: "convert", label: "변환/파일" }];

function ToolCards({ tools, categories }: { tools: NonNullable<ReturnType<typeof useCatalog>["data"]>["tools"]; categories: NonNullable<ReturnType<typeof useCatalog>["data"]>["categories"] }) {
  return <div className="tool-grid">{tools.map((tool, index) => { const Icon = kindIcons[tool.kind] ?? Wrench; return <Link key={tool.id} href={getToolPath(tool, categories)} className="tool-card"><div className="card-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{tool.kind.toUpperCase()}</span></div><Icon className="card-icon" strokeWidth={1.5} size={36} /><div className="card-bottom"><h3>{tool.title}</h3><p>{tool.description}</p></div><ArrowUpRight className="card-arrow" size={20} /></Link>; })}</div>;
}

export default function Home() {
  const { data } = useCatalog();
  const categories = data?.categories ?? []; const allTools = data?.tools ?? [];
  const popular = allTools.filter((tool) => tool.isPopular).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id).slice(0, 9);
  const recent = [...allTools].sort((a, b) => b.id - a.id).slice(0, 6);
  const recommended = allTools.filter((tool) => recommendationKeys.has(tool.logicKey ?? tool.slug)).slice(0, 6);
  const roots = categories.filter((item) => item.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);
  const [hoveredRootId, setHoveredRootId] = useState<number | null>(null);
  const [pinnedRootId, setPinnedRootId] = useState<number | null>(null);
  const activeRootId = pinnedRootId ?? hoveredRootId;
  const activeRoot = roots.find((category) => category.id === activeRootId);
  const activeBranches = activeRoot ? categories.filter((category) => category.parentId === activeRoot.id).sort((a, b) => a.sortOrder - b.sortOrder) : [];
  const toggleCategory = (categoryId: number) => {
    const isClosing = pinnedRootId === categoryId;
    setPinnedRootId(isClosing ? null : categoryId);
    setHoveredRootId(null);
    if (isClosing) requestAnimationFrame(() => requestAnimationFrame(() => {
      const row = document.getElementById(`home-category-entry-${categoryId}`);
      if (!row) return;
      const headerOffset = 72;
      window.scrollTo({ top: Math.max(0, row.getBoundingClientRect().top + window.scrollY - headerOffset), behavior: "smooth" });
    }));
  };
  return <div className="site-page"><SeoHead title="도구상자 | 파일 변환 & 생활 계산기" description="생활 계산기와 브라우저 기반 파일 변환 도구를 한곳에서 이용하는 도구상자" path="/" kind="CollectionPage" /><SiteHeader /><main>
    <section className="hero container"><div className="hero-info"><p className="eyebrow">UTILITY SYSTEM / 2026</p><h1>일을 더<br /><em>간단하게.</em></h1><p className="hero-copy">파일 변환부터 생활 계산까지. 자주 필요한 도구를 빠르고 명확하게, 한 곳에 모았습니다.</p><div className="hero-actions"><Link href="/search" className="hero-cta"><Search size={20} />도구 검색 <ArrowUpRight size={19} /></Link><Link href="/convert" className="hero-secondary">PDF·파일 도구</Link></div></div><div className="hero-art" aria-hidden="true"><span className="art-number">06</span><div className="red-block" /><div className="art-label">ONE PLACE<br />UTILITY TOOLS</div></div></section>
    <section className="home-category-explorer container" aria-label="주요 카테고리 바로가기" onMouseLeave={() => setHoveredRootId(null)} onKeyDown={(event) => { if (event.key === "Escape") { setHoveredRootId(null); setPinnedRootId(null); } }}>
      <div className="home-quick-links">{roots.map((category, index) => {
        const active = activeRootId === category.id;
        const branches = categories.filter((branch) => branch.parentId === category.id).sort((a, b) => a.sortOrder - b.sortOrder);
        return <div id={`home-category-entry-${category.id}`} key={category.id} className={`home-category-entry${active ? " active" : ""}`} onMouseEnter={() => setHoveredRootId(category.id)}>
          <Link href={getCategoryPath(category, categories)} className="home-category-link" onFocus={() => setHoveredRootId(category.id)}><FolderOpen size={20} /><span><small>{String(index + 1).padStart(2, "0")}</small>{category.name}</span><ArrowUpRight size={17} /></Link>
          <button type="button" className="home-category-toggle" onClick={() => toggleCategory(category.id)} aria-expanded={active} aria-controls={`home-category-panel-${category.id}`} aria-label={`${category.name} 하위 분류 ${active ? "닫기" : "열기"}`}><ChevronDown size={18} /></button>
          {active && <div id={`home-category-panel-${category.id}`} className="home-category-panel mobile-category-panel" role="region" aria-label={`${category.name} 하위 분류`}>
            <div className="home-category-panel-head"><div><p className="eyebrow">CATEGORY MAP</p><h2>{category.name} <em>분류</em></h2><p>{category.description}</p></div><Link href={getCategoryPath(category, categories)}>전체 {category.name}<ArrowUpRight size={18} /></Link></div>
            <div className="home-category-branches">{branches.map((branch, branchIndex) => <Link key={branch.id} href={getCategoryPath(branch, categories)}><span>{String(branchIndex + 1).padStart(2, "0")}</span><div><strong>{branch.name}</strong><p>{branch.description}</p></div><ArrowUpRight size={18} /></Link>)}</div>
          </div>}
        </div>;
      })}</div>
      {activeRoot && <div className="home-category-panel desktop-category-panel" role="region" aria-label={`${activeRoot.name} 하위 분류`}>
        <div className="home-category-panel-head"><div><p className="eyebrow">CATEGORY MAP</p><h2>{activeRoot.name} <em>분류</em></h2><p>{activeRoot.description}</p></div><Link href={getCategoryPath(activeRoot, categories)}>전체 {activeRoot.name}<ArrowUpRight size={18} /></Link></div>
        <div className="home-category-branches">{activeBranches.map((branch, branchIndex) => <Link key={branch.id} href={getCategoryPath(branch, categories)}><span>{String(branchIndex + 1).padStart(2, "0")}</span><div><strong>{branch.name}</strong><p>{branch.description}</p></div><ArrowUpRight size={18} /></Link>)}</div>
      </div>}
    </section>
    <section className="home-topic-directory container" aria-label="주요 분야별 계산기 바로가기"><div className="directory-head"><div><p className="eyebrow">FIND BY TOPIC</p><h2>분야별로 바로 찾기.</h2></div><p>금융·부동산·세금부터<br />파일 변환까지 한 번에 이동하세요.</p></div><div className="home-topic-grid">{focusTopics.map((topic, index) => { const category = topic.slug === "convert" ? categories.find((item) => item.slug === "convert" && item.parentId === null) : categories.find((item) => item.slug === topic.slug && item.parentId === 1); return category ? <Link key={topic.slug} href={getCategoryPath(category, categories)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{topic.label}</strong><small>{category.description}</small><ArrowUpRight size={18} /></Link> : null; })}</div></section>
    <GuideDiscovery />
    <section className="tool-directory container"><div className="directory-head"><div><p className="eyebrow">POPULAR TOOLS</p><h2>자주 찾는 도구.</h2></div><p>관리자가 인기 표시와 정렬 순서를 관리하며,<br />주요 기능만 먼저 보여 드립니다.</p></div><ToolCards tools={popular} categories={categories} /></section>
    <section className="tool-directory container compact-directory"><div className="directory-head"><div><p className="eyebrow">NEWLY ADDED</p><h2>최근 추가된 도구.</h2></div><p>PDF·이미지·문서 변환과 단위 환산까지<br />새로 확장된 기능을 확인하세요.</p></div><ToolCards tools={recent} categories={categories} /></section>
    <section className="tool-directory container compact-directory"><div className="directory-head"><div><p className="eyebrow">RECOMMENDED</p><h2>바로 써볼 도구.</h2></div><p>파일 작업, 생활 계산, 데이터 변환처럼<br />자주 필요한 흐름을 우선 추천합니다.</p></div><ToolCards tools={recommended} categories={categories} /></section>
    <section className="principles container"><div className="principles-title"><p className="eyebrow">PRINCIPLES</p><h2>필요한 순간,<br />명확한 결과.</h2></div><div className="principle-list"><article><span>01</span><Zap size={22} /><h3>즉시 사용</h3><p>가입 없이 검색·카테고리에서 필요한 도구를 바로 열 수 있습니다.</p></article><article><span>02</span><ShieldCheck size={22} /><h3>내 기기에서 처리</h3><p>현재 제공되는 파일 변환은 서버가 아닌 브라우저에서 처리합니다.</p></article><article><span>03</span><Calculator size={22} /><h3>계산 근거 제시</h3><p>결과만 보여주지 않고 입력 값과 산식 기준을 함께 정리합니다.</p></article></div></section>
  </main><SiteFooter /></div>;
}
