import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { renderToString } from "react-dom/server";
import superjson from "superjson";
import { Router } from "wouter";
import { defaultCatalog, getCategoryLineage, getCategoryPath, getToolPath, legacyToolPaths } from "@shared/catalog";
import { getGuideContent, getGuidePath, guideContents } from "@shared/content";
import App from "./App";
import { trpc } from "./lib/trpc";

export type StaticPageMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  type: "WebApplication" | "CollectionPage" | "WebPage";
  breadcrumb: Array<{ name: string; path: string }>;
};

const homeMeta: StaticPageMeta = {
  title: "도구상자 | 파일 변환 & 생활 계산기",
  description: "브라우저에서 바로 쓰는 파일 변환과 생활 계산 도구",
  canonicalPath: "/",
  type: "CollectionPage",
  breadcrumb: [{ name: "홈", path: "/" }],
};

function categoryBreadcrumb(categoryId: number, toolTitle?: string, toolPath?: string) {
  const category = defaultCatalog.categories.find((item) => item.id === categoryId);
  if (!category) return homeMeta.breadcrumb;
  const items = [{ name: "홈", path: "/" }, ...getCategoryLineage(category, defaultCatalog.categories).map((item) => ({ name: item.name, path: getCategoryPath(item, defaultCatalog.categories) }))];
  return toolTitle && toolPath ? [...items, { name: toolTitle, path: toolPath }] : items;
}

/** Resolves build-time metadata from the same static catalog used by the browser UI. */
export function getStaticPageMeta(url: string): StaticPageMeta {
  const pathname = url.split("?")[0].replace(/\/$/, "") || "/";
  if (pathname === "/") return homeMeta;

  if (pathname === "/search") return {
    title: "도구 검색 | 도구상자",
    description: "계산기와 파일 변환 도구를 검색합니다.",
    canonicalPath: "/search",
    type: "CollectionPage",
    breadcrumb: [{ name: "홈", path: "/" }, { name: "도구 검색", path: "/search" }],
  };

  const infoMeta: Record<string, StaticPageMeta> = {
    "/about": { title: "도구상자 소개 | 생활 계산기·파일 변환", description: "생활 계산과 브라우저 기반 파일 변환을 제공하는 도구상자의 운영 원칙과 제공 기능을 안내합니다.", canonicalPath: "/about", type: "WebPage", breadcrumb: [{ name: "홈", path: "/" }, { name: "도구상자 소개", path: "/about" }] },
    "/guide": { title: "계산 결과 활용 가이드 | 도구상자", description: "대출, 부동산, 급여, 세금과 PDF 도구의 계산 결과를 확인하고 다음 행동으로 연결하는 실용 가이드입니다.", canonicalPath: "/guides", type: "CollectionPage", breadcrumb: [{ name: "홈", path: "/" }, { name: "계산 결과 활용 가이드", path: "/guides" }] },
    "/faq": { title: "자주 묻는 질문 | 도구상자", description: "계산 결과의 참고 범위, 브라우저 파일 처리, 개인정보와 광고 안내에 관한 자주 묻는 질문입니다.", canonicalPath: "/faq", type: "WebPage", breadcrumb: [{ name: "홈", path: "/" }, { name: "자주 묻는 질문", path: "/faq" }] },
    "/privacy": { title: "개인정보처리방침 | 도구상자", description: "도구상자의 파일·계산기 입력 처리 방식과 개인정보 보호 방침을 안내합니다.", canonicalPath: "/privacy", type: "WebPage", breadcrumb: [{ name: "홈", path: "/" }, { name: "개인정보처리방침", path: "/privacy" }] },
    "/terms": { title: "이용약관 | 도구상자", description: "도구상자 온라인 계산 및 브라우저 기반 파일 처리 서비스의 이용약관입니다.", canonicalPath: "/terms", type: "WebPage", breadcrumb: [{ name: "홈", path: "/" }, { name: "이용약관", path: "/terms" }] },
    "/disclaimer": { title: "면책조항 | 도구상자", description: "도구상자 계산 결과와 파일 처리 기능의 참고 범위 및 이용 시 유의사항을 안내합니다.", canonicalPath: "/disclaimer", type: "WebPage", breadcrumb: [{ name: "홈", path: "/" }, { name: "면책조항", path: "/disclaimer" }] },
    "/cookie-policy": { title: "쿠키 및 광고 안내 | 도구상자", description: "도구상자의 쿠키, 방문 통계와 Google AdSense 광고 처리 안내입니다.", canonicalPath: "/cookie-policy", type: "WebPage", breadcrumb: [{ name: "홈", path: "/" }, { name: "쿠키 및 광고 안내", path: "/cookie-policy" }] },
    "/contact": { title: "문의하기 | 도구상자", description: "계산 오류, 파일 변환 오류, 개인정보 문의와 서비스 개선 의견을 도구상자 운영 이메일로 보낼 수 있습니다.", canonicalPath: "/contact", type: "WebPage", breadcrumb: [{ name: "홈", path: "/" }, { name: "문의하기", path: "/contact" }] },
  };
  if (infoMeta[pathname]) return infoMeta[pathname];

  const root = defaultCatalog.categories.find((item) => item.parentId === null && getCategoryPath(item, defaultCatalog.categories) === pathname);
  if (root) return {
    title: `${root.seoTitle ?? root.name} | 도구상자`,
    description: root.seoDescription ?? root.description ?? homeMeta.description,
    canonicalPath: getCategoryPath(root, defaultCatalog.categories),
    type: "CollectionPage",
    breadcrumb: categoryBreadcrumb(root.id),
  };

  const category = defaultCatalog.categories.find((item) => item.parentId !== null && getCategoryPath(item, defaultCatalog.categories) === pathname);
  if (category) return {
    title: `${category.seoTitle ?? category.name} | 도구상자`,
    description: category.seoDescription ?? category.description ?? homeMeta.description,
    canonicalPath: getCategoryPath(category, defaultCatalog.categories),
    type: "CollectionPage",
    breadcrumb: categoryBreadcrumb(category.id),
  };

  if (pathname === "/guides") return {
  title: "계산기 활용 가이드 | 도구상자",
  description: "계산 결과를 해석하고 관련 금융·부동산·세금·사업·은퇴 정보를 확인하는 실용 가이드입니다.",
  canonicalPath: "/guides",
  type: "CollectionPage",
  breadcrumb: [{ name: "홈", path: "/" }, { name: "계산기 활용 가이드", path: "/guides" }],
};

const guide = pathname.startsWith("/guides/") ? getGuideContent(pathname.slice("/guides/".length)) : undefined;
if (guide) return {
  title: `${guide.title} | 도구상자`,
  description: guide.description,
  canonicalPath: getGuidePath(guide.slug),
  type: "WebPage",
  breadcrumb: [{ name: "홈", path: "/" }, { name: "계산기 활용 가이드", path: "/guides" }, { name: guide.title, path: getGuidePath(guide.slug) }],
};

const tool = defaultCatalog.tools.find((item) => {
    const toolPath = getToolPath(item, defaultCatalog.categories);
    return pathname === toolPath || pathname === legacyToolPaths[item.slug];
  });
  if (tool) {
    const toolPath = getToolPath(tool, defaultCatalog.categories);
    return {
      title: tool.seoTitle ?? `${tool.title} | 도구상자`,
      description: tool.seoDescription ?? tool.description,
      canonicalPath: toolPath,
      type: "WebApplication",
      breadcrumb: categoryBreadcrumb(tool.categoryId, tool.title, toolPath),
    };
  }

  return { ...homeMeta, title: "페이지를 찾을 수 없습니다 | 도구상자", description: "요청한 페이지를 찾을 수 없습니다." };
}

export function getStaticPrerenderPaths() {
  const categoryPaths = defaultCatalog.categories.map((item) => getCategoryPath(item, defaultCatalog.categories));
  const toolPaths = defaultCatalog.tools.filter((item) => item.status === "active").flatMap((item) => [getToolPath(item, defaultCatalog.categories), legacyToolPaths[item.slug]].filter(Boolean));
  const guidePaths = ["/guides", ...guideContents.map((guide) => getGuidePath(guide.slug))];
  return Array.from(new Set(["/", "/search", ...categoryPaths, ...toolPaths, ...guidePaths]));
}

export function render(url: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const client = trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] });
  const path = url.split("?")[0] || "/";
  return renderToString(<trpc.Provider client={client} queryClient={queryClient}><QueryClientProvider client={queryClient}><Router ssrPath={path}><App /></Router></QueryClientProvider></trpc.Provider>);
}
