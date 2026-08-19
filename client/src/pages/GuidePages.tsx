import { Link } from "wouter";
import { AdSlot, AffiliateSlot, SeoHead } from "@/components/CatalogSupport";
import { SiteFooter, SiteHeader } from "@/components/ToolLayout";
import { useCatalog } from "@/hooks/useCatalog";
import { defaultCatalog, getToolPath } from "@shared/catalog";
import { getGuideContent, getGuidePath, guideContents } from "@shared/content";

export function GuideCatalog() {
  return <div className="site-page"><SeoHead title="계산기 활용 가이드 | 도구상자" description="계산기 결과를 해석하고 관련 금융·부동산·세금·사업·자동차·은퇴 정보를 확인하는 실용 가이드입니다." path="/guides" kind="CollectionPage" /><SiteHeader /><main className="container guide-page"><p className="eyebrow">PRACTICAL GUIDES / 2026</p><h1>계산기 활용 가이드</h1><p className="guide-lead">계산 결과를 어떻게 읽고 어떤 항목을 더 확인해야 하는지, 실제 검색 질문을 기준으로 정리했습니다.</p><AdSlot slot="AD_TOP" /><div className="guide-card-grid">{guideContents.map((guide) => <Link key={guide.slug} href={getGuidePath(guide.slug)}><span>{guide.eyebrow}</span><strong>{guide.title}</strong><small>{guide.description}</small><b>가이드 읽기 →</b></Link>)}</div></main><SiteFooter /></div>;
}

export function GuidePage({ slug }: { slug: string }) {
  const guide = getGuideContent(slug);
  const { data } = useCatalog();
  const catalog = data || defaultCatalog;
  if (!guide) return <GuideCatalog />;
  const relatedTools = guide.relatedToolSlugs.map((toolSlug) => catalog.tools.find((tool) => tool.slug === toolSlug)).filter(Boolean);
  const relatedGuides = guide.relatedGuideSlugs.map((guideSlug) => getGuideContent(guideSlug)).filter(Boolean);
  const coreAnswer = guide.coreAnswer ?? guide.intro;
  const example = guide.example ?? "관련 계산기에 대표 조건을 입력해 기본 결과를 확인한 뒤, 금리·기간·비용 가정을 바꾸어 결과가 얼마나 달라지는지 비교하세요.";
  const caution = guide.caution ?? "이 콘텐츠와 계산기는 입력값에 따른 참고용 정보입니다. 실제 계약·신고·가입·구매 전에는 최신 공식 안내와 전문가의 확인을 받으세요.";
  return <div className="site-page"><SeoHead title={`${guide.title} | 도구상자`} description={guide.description} path={getGuidePath(guide.slug)} kind="WebPage" /><SiteHeader /><main className="container guide-page"><nav className="breadcrumb" aria-label="현재 위치"><span><Link href="/">홈</Link><b>/</b></span><span><Link href="/guides">계산기 활용 가이드</Link><b>/</b></span><span>{guide.title}</span></nav><p className="eyebrow">{guide.eyebrow}</p><h1>{guide.title}</h1><p className="guide-lead">{guide.intro}</p><section className="guide-answer-card"><p className="eyebrow">핵심 답변</p><p>{coreAnswer}</p></section><AdSlot slot="AD_TOP" /><article className="guide-article">{guide.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<section><h2>실제 계산 예시</h2><p>{example}</p></section><section><h2>주의사항</h2><p>{caution}</p></section></article><AdSlot slot="AD_CONTENT" /><section className="guide-linked-tools"><p className="eyebrow">CALCULATOR CONNECTION</p><h2>관련 계산기</h2><div className="related-tools">{relatedTools.map((tool) => tool ? <Link key={tool.id} href={getToolPath(tool, catalog.categories)}><span>{tool.kind.toUpperCase()}</span><strong>{tool.title}</strong><small>{tool.description}</small></Link> : null)}</div></section><section className="faq-section guide-faq"><p className="eyebrow">FAQ</p><h2>{guide.title} 자주 묻는 질문</h2>{guide.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section><section className="guide-linked-content"><p className="eyebrow">MORE GUIDES</p><h2>관련 콘텐츠</h2><div className="guide-card-grid compact">{relatedGuides.map((item) => item ? <Link key={item.slug} href={getGuidePath(item.slug)}><strong>{item.title}</strong><small>{item.description}</small></Link> : null)}</div></section><AffiliateSlot category={guide.monetizationCategory} title="관련 서비스·제휴 영역" /><p className="guide-disclaimer">{caution}</p></main><SiteFooter /></div>;
}
