import { describe, expect, it } from "vitest";
import { defaultCatalog, getToolPath } from "../shared/catalog";
import { resolveSeoRoute } from "../shared/seo";

const priorityCalculatorSlugs = ["unit-price", "fee", "parking-fee", "currency-exchange", "return-rate"];
const priorityConverterSlugs = ["json-pretty", "csv-to-markdown", "url-encode", "base64-encode"];

function toolBySlug(slug: string) {
  const tool = defaultCatalog.tools.find((item) => item.slug === slug);
  if (!tool) throw new Error(`도구를 찾을 수 없습니다: ${slug}`);
  return tool;
}

describe("핵심 도구 SEO", () => {
  it("생활·업무 계산기 5종은 구체적인 검색 스니펫, FAQ와 관련 도구를 제공한다", () => {
    for (const slug of priorityCalculatorSlugs) {
      const tool = toolBySlug(slug);
      const route = resolveSeoRoute(getToolPath(tool, defaultCatalog.categories));
      expect(tool.seoTitle).toContain("계산기");
      expect(tool.seoDescription?.length).toBeGreaterThan(45);
      expect(tool.faq).toHaveLength(2);
      expect(tool.relatedToolIds).toHaveLength(3);
      expect(route.faq.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("핵심 텍스트 변환기 4종은 화면과 일치하는 FAQ 구조화 데이터를 제공한다", () => {
    for (const slug of priorityConverterSlugs) {
      const tool = toolBySlug(slug);
      const route = resolveSeoRoute(getToolPath(tool, defaultCatalog.categories));
      expect(tool.seoDescription?.length).toBeGreaterThan(45);
      expect(tool.faq).toHaveLength(2);
      expect(tool.relatedToolIds).toHaveLength(3);
      expect(route.faq).toEqual(tool.faq);
    }
  });
});
