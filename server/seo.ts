import { CatalogCategory, CatalogTool, getCategoryLineage, getCategoryPath, getToolPath, legacyToolPaths } from "../shared/catalog";
import { getPublicCatalog } from "./catalog";

export type SeoPage = { title: string; description: string; canonicalPath: string; breadcrumb: Array<{ name: string; path: string }>; type: "WebApplication" | "CollectionPage"; notFound?: boolean; noindex?: boolean };

const home: SeoPage = { title: "도구상자 | 파일 변환 & 생활 계산기", description: "브라우저에서 바로 쓰는 파일 변환과 생활 계산 도구", canonicalPath: "/", breadcrumb: [{ name: "홈", path: "/" }], type: "CollectionPage" };
const staticPages: Record<string, SeoPage> = {
  "/about": { title: "도구상자 소개 | 도구상자", description: "생활 계산과 브라우저 기반 파일 변환 도구를 한곳에서 제공합니다.", canonicalPath: "/about", breadcrumb: [{ name: "홈", path: "/" }, { name: "도구상자 소개", path: "/about" }], type: "CollectionPage" },
  "/guide": { title: "이용방법 | 도구상자", description: "계산기와 로컬 파일 변환 도구의 이용 방법을 안내합니다.", canonicalPath: "/guide", breadcrumb: [{ name: "홈", path: "/" }, { name: "이용방법", path: "/guide" }], type: "CollectionPage" },
  "/faq": { title: "자주 묻는 질문 | 도구상자", description: "계산기와 브라우저 기반 파일 처리에 관한 자주 묻는 질문입니다.", canonicalPath: "/faq", breadcrumb: [{ name: "홈", path: "/" }, { name: "자주 묻는 질문", path: "/faq" }], type: "CollectionPage" },
  "/privacy": { title: "개인정보처리방침 | 도구상자", description: "도구상자의 브라우저 로컬 파일 처리와 개인정보 보호 방침입니다.", canonicalPath: "/privacy", breadcrumb: [{ name: "홈", path: "/" }, { name: "개인정보처리방침", path: "/privacy" }], type: "CollectionPage" },
  "/terms": { title: "이용약관 | 도구상자", description: "도구상자 서비스 이용약관입니다.", canonicalPath: "/terms", breadcrumb: [{ name: "홈", path: "/" }, { name: "이용약관", path: "/terms" }], type: "CollectionPage" },
  "/disclaimer": { title: "면책조항 | 도구상자", description: "계산 결과와 파일 처리 기능의 참고용 안내입니다.", canonicalPath: "/disclaimer", breadcrumb: [{ name: "홈", path: "/" }, { name: "면책조항", path: "/disclaimer" }], type: "CollectionPage" },
  "/cookie-policy": { title: "쿠키 및 광고 안내 | 도구상자", description: "도구상자의 쿠키 및 선택형 광고 처리 안내입니다.", canonicalPath: "/cookie-policy", breadcrumb: [{ name: "홈", path: "/" }, { name: "쿠키 및 광고 안내", path: "/cookie-policy" }], type: "CollectionPage" },
  "/contact": { title: "문의하기 | 도구상자", description: "도구상자 오류, 개인정보 처리와 서비스 개선 의견을 확인합니다.", canonicalPath: "/contact", breadcrumb: [{ name: "홈", path: "/" }, { name: "문의하기", path: "/contact" }], type: "CollectionPage" },
  "/document": { title: "문서·데이터 변환 | 도구상자", description: "CSV, Excel, JSON, TXT를 브라우저에서 실제 파일 형식으로 변환합니다.", canonicalPath: "/document", breadcrumb: [{ name: "홈", path: "/" }, { name: "문서·데이터 변환", path: "/document" }], type: "WebApplication" },
  "/search": { title: "도구 검색 | 도구상자", description: "계산기, PDF, 이미지, 문서 변환과 단위 변환 도구를 검색합니다.", canonicalPath: "/search", breadcrumb: [{ name: "홈", path: "/" }, { name: "도구 검색", path: "/search" }], type: "CollectionPage", noindex: true },
  "/admin/categories": { title: "관리자 페이지 | 도구상자", description: "내부 카탈로그 관리 페이지", canonicalPath: "/admin/categories", breadcrumb: [{ name: "홈", path: "/" }, { name: "관리자", path: "/admin/categories" }], type: "CollectionPage", noindex: true },
};

function categoryBreadcrumb(category: CatalogCategory, categories: CatalogCategory[], tool?: CatalogTool) {
  const items = [{ name: "홈", path: "/" }, ...getCategoryLineage(category, categories).map((item) => ({ name: item.name, path: getCategoryPath(item, categories) }))];
  if (tool) items.push({ name: tool.title, path: getToolPath(tool, categories) });
  return items;
}

export async function getSeoPage(pathname: string): Promise<SeoPage> {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (normalized === "/") return home;
  if (staticPages[normalized]) return staticPages[normalized];
  const catalog = await getPublicCatalog();
  for (const root of catalog.categories.filter((item) => item.parentId === null)) {
    const rootPath = getCategoryPath(root, catalog.categories);
    if (normalized === rootPath) return { title: `${root.seoTitle ?? root.name} | 도구상자`, description: root.seoDescription ?? root.description ?? home.description, canonicalPath: rootPath, breadcrumb: categoryBreadcrumb(root, catalog.categories), type: "CollectionPage" };
  }
  for (const category of catalog.categories.filter((item) => item.parentId !== null && catalog.categories.some((root) => root.id === item.parentId && root.parentId === null))) {
    const categoryPath = getCategoryPath(category, catalog.categories);
    if (normalized === categoryPath) return { title: `${category.seoTitle ?? category.name} | 도구상자`, description: category.seoDescription ?? category.description ?? home.description, canonicalPath: categoryPath, breadcrumb: categoryBreadcrumb(category, catalog.categories), type: "CollectionPage" };
  }
  for (const tool of catalog.tools) {
    const category = catalog.categories.find((item) => item.id === tool.categoryId);
    if (!category) continue;
    const toolPath = getToolPath(tool, catalog.categories);
    if (normalized === toolPath || normalized === legacyToolPaths[tool.slug]) return { title: tool.seoTitle ?? `${tool.title} | 도구상자`, description: tool.seoDescription ?? tool.description, canonicalPath: toolPath, breadcrumb: categoryBreadcrumb(category, catalog.categories, tool), type: "WebApplication" };
  }
  return { ...home, notFound: true, noindex: true, title: "페이지를 찾을 수 없습니다 | 도구상자", description: "요청한 페이지를 찾을 수 없습니다.", canonicalPath: normalized };
}
