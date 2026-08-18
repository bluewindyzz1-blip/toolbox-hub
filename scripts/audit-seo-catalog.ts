import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultCatalog, getCategoryLineage, getToolPath } from "../shared/catalog";
import { getVisibleToolFaq } from "../shared/seo";

const staticPages = [
  "/",
  "/about",
  "/guide",
  "/faq",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/cookie-policy",
  "/contact",
  "/document",
];

const activeTools = defaultCatalog.tools.filter((tool) => tool.status === "active");
const titleGroups = new Map<string, string[]>();
const issues: Array<{ severity: "high" | "medium" | "low"; type: string; path: string; detail: string }> = [];

for (const tool of activeTools) {
  const path = getToolPath(tool, defaultCatalog.categories);
  const title = tool.seoTitle?.trim() ?? "";
  const description = tool.seoDescription?.trim() ?? "";
  const lineage = getCategoryLineage(defaultCatalog.categories.find((category) => category.id === tool.categoryId)!, defaultCatalog.categories)
    .map((category) => category.name)
    .join(" > ");

  if (!title) issues.push({ severity: "high", type: "missing-title", path, detail: `${tool.title}의 SEO 제목이 비어 있습니다.` });
  if (!description) issues.push({ severity: "high", type: "missing-description", path, detail: `${tool.title}의 SEO 설명이 비어 있습니다.` });
  if (title.length > 58) issues.push({ severity: "low", type: "long-title", path, detail: `${title.length}자: ${title}` });
  if (description.length > 95) issues.push({ severity: "low", type: "long-description", path, detail: `${description.length}자: ${description}` });
  if (!tool.relatedToolIds?.length) issues.push({ severity: "medium", type: "missing-related-tools", path, detail: `${tool.title}에 연관 도구 설정이 없습니다.` });
  if (tool.kind === "calculator" && !getVisibleToolFaq(tool).length) issues.push({ severity: "low", type: "missing-custom-faq", path, detail: `${tool.title}에 맞춤 FAQ가 없습니다.` });

  if (title) titleGroups.set(title, [...(titleGroups.get(title) ?? []), path]);

  const unknownRelated = (tool.relatedToolIds ?? []).filter((id) => !activeTools.some((candidate) => candidate.id === id));
  if (unknownRelated.length) issues.push({ severity: "high", type: "invalid-related-tool", path, detail: `존재하지 않거나 비활성화된 연관 도구 ID: ${unknownRelated.join(", ")}` });

  void lineage;
}

for (const [title, paths] of titleGroups) {
  if (paths.length > 1) issues.push({ severity: "medium", type: "duplicate-title", path: paths.join(", "), detail: `중복 SEO 제목: ${title}` });
}

const toolRows = activeTools.map((tool) => {
  const category = defaultCatalog.categories.find((item) => item.id === tool.categoryId)!;
  return {
    path: getToolPath(tool, defaultCatalog.categories),
    title: tool.title,
    seoTitle: tool.seoTitle,
    seoDescription: tool.seoDescription,
    category: getCategoryLineage(category, defaultCatalog.categories).map((item) => item.name).join(" > "),
    isPopular: Boolean(tool.isPopular),
    relatedCount: tool.relatedToolIds?.length ?? 0,
    faqCount: tool.kind === "calculator" ? getVisibleToolFaq(tool).length : null,
    keywordCount: tool.searchKeywords?.length ?? 0,
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    staticPages: staticPages.length,
    categories: defaultCatalog.categories.length,
    activeTools: activeTools.length,
    publicUrls: new Set([
      ...staticPages,
      ...defaultCatalog.categories
        .filter((category) => category.parentId === null || defaultCatalog.categories.some((root) => root.id === category.parentId && root.parentId === null))
        .filter((category) => activeTools.some((tool) => getCategoryLineage(defaultCatalog.categories.find((item) => item.id === tool.categoryId)!, defaultCatalog.categories).some((lineage) => lineage.id === category.id)))
        .map((category) => {
          const lineage = getCategoryLineage(category, defaultCatalog.categories);
          const root = lineage[0];
          const branch = lineage[1];
          const rootPath = root.slug === "calculator" ? "/calculator" : root.slug === "convert" ? "/convert" : root.slug === "units" ? "/units" : `/catalog/${root.slug}`;
          return branch ? `${rootPath}/${branch.slug}` : rootPath;
        }),
      ...toolRows.map((row) => row.path),
    ]).size,
  },
  issueCounts: Object.fromEntries(["high", "medium", "low"].map((severity) => [severity, issues.filter((issue) => issue.severity === severity).length])),
  issues,
  toolRows,
};

const outputDir = resolve(import.meta.dirname, "..", "reports");
await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, "seo-catalog-audit.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify({ totals: report.totals, issueCounts: report.issueCounts, sampleIssues: issues.slice(0, 25) }, null, 2));
