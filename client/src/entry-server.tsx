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
  return Array.from(new Set(["/", ...categoryPaths, ...toolPaths, ...guidePaths]));
}

export function render(url: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const client = trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] });
  const path = url.split("?")[0] || "/";
  return renderToString(<trpc.Provider client={client} queryClient={queryClient}><QueryClientProvider client={queryClient}><Router ssrPath={path}><App /></Router></QueryClientProvider></trpc.Provider>);
}
