import { ArrowUpRight, FileQuestion } from "lucide-react";
import { Link } from "wouter";
import { lazy, Suspense } from "react";
import { CatalogBreadcrumb, SeoHead, categoryToolGroups } from "@/components/CatalogSupport";
import { SiteFooter, SiteHeader, ToolFrame } from "@/components/ToolLayout";
import { useCatalog } from "@/hooks/useCatalog";
import { getCategoryPath, getToolPath } from "@shared/catalog";
import AnnualNetCalculator from "./AnnualNetCalculator";
import PyeongCalculator from "./PyeongCalculator";
import RetirementPayCalculator from "./RetirementPayCalculator";
import RentCalculator from "./RentCalculator";
import LoanCalculator from "./LoanCalculator";
import VatCalculator from "./VatCalculator";
import ImageTool from "./ImageTool";
import UnitConverter from "./UnitConverter";
import AdvancedCalculators from "./AdvancedCalculators";
import FinanceRealEstateCalculators from "./FinanceRealEstateCalculators";
import SalaryEmploymentCalculators from "./SalaryEmploymentCalculators";
import TaxSocialCalculators from "./TaxSocialCalculators";
import DateTimeCalculators from "./DateTimeCalculators";
import DailyWorkCalculators from "./DailyWorkCalculators";

const PdfTool = lazy(() => import("./PdfTool"));
const DocumentTool = lazy(() => import("./DocumentTool"));

type RootKey = "calculator" | "convert" | "units";

const rootTitles: Record<RootKey, { title: string; description: string; index: string }> = {
  calculator: { title: "생활 계산기 모음", description: "월급·퇴직금·대출·부동산·세금처럼 자주 필요한 계산기를 카테고리별로 찾아 바로 계산하세요.", index: "07" },
  convert: { title: "파일 변환 도구", description: "PDF 합치기, 이미지 압축, CSV·Excel 변환 등 파일 작업을 브라우저 안에서 바로 처리하세요.", index: "08" },
  units: { title: "단위 변환기", description: "길이·무게·온도·면적부터 데이터 용량까지 자주 쓰는 단위를 빠르게 환산하세요.", index: "09" },
};

function RootPage({ rootSlug }: { rootSlug: RootKey }) {
  const { data } = useCatalog();
  const root = data?.categories.find((item) => item.slug === rootSlug && item.parentId === null);
  const info = rootTitles[rootSlug];
  if (!data || !root) return <CatalogLoading />;
  const groups = categoryToolGroups(data.categories, data.tools, root).filter(({ tools }) => tools.length > 0);
  return <div className="site-page"><SeoHead title={`${root.seoTitle ?? info.title} | 도구상자`} description={root.seoDescription ?? info.description} kind="CollectionPage" /><SiteHeader /><main className="container catalog-page"><CatalogBreadcrumb rootSlug={rootSlug} /><section className="catalog-intro"><span>{info.index}</span><div><p className="eyebrow">CATALOG / {rootSlug.toUpperCase()}</p><h1>{info.title}</h1><p>{root.description ?? info.description}</p></div></section><div className="category-directory">{groups.map(({ subcategory, tools }) => <section key={subcategory.id} className="category-group"><div><p className="eyebrow">CATEGORY</p><h2>{subcategory.name}</h2><p>{subcategory.description}</p><Link href={getCategoryPath(subcategory, data.categories)}>카테고리 보기 <ArrowUpRight size={17} /></Link></div><div className="category-tool-list">{tools.map((tool) => <Link key={tool.id} href={getToolPath(tool, data.categories)}><span>{String(tool.sortOrder).padStart(2, "0")}</span><div><h3>{tool.title}</h3><p>{tool.description}</p></div><ArrowUpRight size={20} /></Link>)}</div></section>)}</div></main><SiteFooter /></div>;
}

function SubcategoryPage({ rootSlug, categorySlug }: { rootSlug: RootKey; categorySlug: string }) {
  const { data } = useCatalog();
  const root = data?.categories.find((item) => item.slug === rootSlug && item.parentId === null);
  const category = data?.categories.find((item) => item.slug === categorySlug && item.parentId === root?.id);
  if (!data || !root || !category) return <Unavailable title="카테고리를 찾을 수 없습니다." />;
  const directTools = data.tools.filter((tool) => tool.categoryId === category.id);
  const groups = data.categories.filter((item) => item.parentId === category.id).map((group) => ({ group, tools: data.tools.filter((tool) => tool.categoryId === group.id) }));
  const cards = (tools: typeof data.tools) => <div className="subcategory-tool-grid">{tools.map((tool) => <Link key={tool.id} href={getToolPath(tool, data.categories)}><span>{tool.kind.toUpperCase()}</span><h2>{tool.title}</h2><p>{tool.description}</p><ArrowUpRight size={22} /></Link>)}</div>;
  return <div className="site-page"><SeoHead title={`${category.seoTitle ?? category.name} | 도구상자`} description={category.seoDescription ?? category.description ?? "도구 목록"} kind="CollectionPage" /><SiteHeader /><main className="container catalog-page"><CatalogBreadcrumb rootSlug={rootSlug} categorySlug={categorySlug} /><section className="catalog-intro"><span>CAT</span><div><p className="eyebrow">{root.name.toUpperCase()} / SUBCATEGORY</p><h1>{category.name}</h1><p>{category.description}</p></div></section>{directTools.length > 0 && <section className="catalog-tool-section"><p className="eyebrow">ALL TOOLS</p><h2>주요 도구</h2>{cards(directTools)}</section>}{groups.map(({ group, tools }) => <section key={group.id} className="catalog-tool-section"><p className="eyebrow">{category.name.toUpperCase()} / GROUP</p><h2>{group.name}</h2><p>{group.description}</p>{cards(tools)}</section>)}</main><SiteFooter /></div>;
}

function CatalogLoading() { return <div className="site-page"><SiteHeader /><main className="container catalog-page"><p className="loading-copy">카탈로그를 불러오는 중입니다.</p></main><SiteFooter /></div>; }

export function CalculatorToolRoute({ slug }: { slug: string }) {
  if (slug === "monthly-rent") return <RentCalculator />;
  if (slug === "loan-interest") return <LoanCalculator />;
  if (slug === "annual-net") return <AnnualNetCalculator />;
  if (slug === "pyeong") return <PyeongCalculator />;
  if (slug === "retirement-pay") return <RetirementPayCalculator />;
  if (["rent-conversion","jeonse-to-monthly","monthly-to-jeonse","loan-amortization","deposit-interest","savings"].includes(slug)) return <AdvancedCalculators kind={slug as any} />;
  if (["jeonse-loan-interest", "mortgage", "early-repayment-fee", "brokerage-fee", "acquisition-tax", "property-tax", "compound-interest", "equal-principal", "bullet-loan", "percentage"].includes(slug)) return <FinanceRealEstateCalculators kind={slug as any} />;
  if (["annual-take-home", "monthly-take-home", "retirement-income-tax", "weekly-holiday-pay", "annual-leave-pay", "hourly-wage", "work-hours", "four-insurance", "unemployment-benefit"].includes(slug)) return <SalaryEmploymentCalculators kind={slug as any} />;
  if (["comprehensive-income-tax", "capital-gains-tax", "gift-tax", "inheritance-tax", "year-end-tax-refund", "national-pension", "health-insurance", "minimum-wage"].includes(slug)) return <TaxSocialCalculators kind={slug as any} />;
  if (["date-calculator", "d-day", "age", "man-age", "date-difference", "time-calculator"].includes(slug)) return <DateTimeCalculators kind={slug as any} />;
  if (["discount", "margin", "break-even", "fuel-cost", "split-bill", "average", "bmi", "bmr", "calories-burned", "gpa"].includes(slug)) return <DailyWorkCalculators kind={slug as any} />;
  if (slug === "vat-calculator") return <VatCalculator />;
  return <Unavailable title="계산기를 준비하고 있습니다." />;
}

export function ConverterToolRoute({ slug }: { slug: string }) {
  const pdfModeBySlug: Record<string, { mode: "to-images" | "images-to-pdf" | "merge" | "split" | "extract" | "delete" | "reorder" | "rotate" | "compress"; format?: "png" | "jpg" }> = { "pdf-convert": { mode: "to-images" }, "pdf-to-jpg": { mode: "to-images", format: "jpg" }, "pdf-to-png": { mode: "to-images", format: "png" }, "jpg-to-pdf": { mode: "images-to-pdf" }, "png-to-pdf": { mode: "images-to-pdf" }, "pdf-merge": { mode: "merge" }, "pdf-split": { mode: "split" }, "pdf-extract-pages": { mode: "extract" }, "pdf-delete-pages": { mode: "delete" }, "pdf-reorder-pages": { mode: "reorder" }, "pdf-rotate-pages": { mode: "rotate" }, "pdf-compress": { mode: "compress" } };
  if (pdfModeBySlug[slug]) { const config = pdfModeBySlug[slug]; return <Suspense fallback={<ToolFrame index="01" tag="DOCUMENT ENGINE" title="PDF·파일 도구" description="브라우저 내 변환기를 준비하고 있습니다."><p className="client-tool-loading">PDF 처리 모듈을 불러오는 중입니다.</p></ToolFrame>}><PdfTool initialMode={config.mode} initialFormat={config.format} /></Suspense>; }
  type ImageToolConfig = { mode: "convert" | "compress" | "resize" | "rotate" | "flip" | "grayscale" | "padding"; format?: "image/png" | "image/jpeg" | "image/webp" };
  const imageModeBySlug: Record<string, ImageToolConfig> = {
    "image-convert": { mode: "convert" }, "image-compress": { mode: "compress" }, "image-resize": { mode: "resize" },
    "jpg-to-png": { mode: "convert", format: "image/png" }, "png-to-jpg": { mode: "convert", format: "image/jpeg" }, "jpg-to-webp": { mode: "convert", format: "image/webp" }, "png-to-webp": { mode: "convert", format: "image/webp" }, "webp-to-jpg": { mode: "convert", format: "image/jpeg" }, "webp-to-png": { mode: "convert", format: "image/png" },
    "image-rotate": { mode: "rotate" }, "image-flip": { mode: "flip" }, "image-grayscale": { mode: "grayscale" }, "image-padding": { mode: "padding" },
  };
  if (imageModeBySlug[slug]) { const config = imageModeBySlug[slug]; return <ImageTool initialMode={config.mode} initialFormat={config.format} />; }
  const documentModeBySlug: Record<string, "csv-excel" | "excel-csv" | "csv-json" | "json-csv" | "txt-pdf"> = { "csv-to-excel": "csv-excel", "excel-to-csv": "excel-csv", "csv-to-json": "csv-json", "json-to-csv": "json-csv", "txt-to-pdf": "txt-pdf" };
  if (documentModeBySlug[slug]) return <Suspense fallback={<ToolFrame index="03" tag="DATA ENGINE" title="문서·데이터 변환" description="브라우저 내 변환기를 준비하고 있습니다."><p className="client-tool-loading">문서 처리 모듈을 불러오는 중입니다.</p></ToolFrame>}><DocumentTool initialMode={documentModeBySlug[slug]} /></Suspense>;
  if (slug === "unit-convert") return <UnitConverter />;
  const unitCategoryBySlug: Record<string, string> = { "unit-area": "area", "unit-weight": "weight", "unit-volume": "volume", "unit-temperature": "temperature", "unit-speed": "speed", "unit-data": "data", "unit-time": "time", "unit-pressure": "pressure", "unit-energy": "energy" };
  if (unitCategoryBySlug[slug]) return <UnitConverter initialCategory={unitCategoryBySlug[slug]} />;
  return <Unavailable title="이 도구는 준비 중입니다." />;
}

export function Unavailable({ title }: { title: string }) { return <ToolFrame index="—" tag="CATALOG STATUS" title={title} description="관리자에서 도구 메타데이터를 추가했지만, 실제 동작을 연결하기 전에는 이 안내 화면이 표시됩니다."><section className="unavailable-panel"><FileQuestion size={42} /><h2>도구 연결 대기</h2><p>새로운 도구는 카테고리 관리 화면에서 등록한 뒤, 안전한 계산 또는 변환 로직을 연결해 공개할 수 있습니다.</p><Link href="/calculator">계산기 카탈로그로 돌아가기 <ArrowUpRight size={18} /></Link></section></ToolFrame>; }

export function CalculatorCatalog() { return <RootPage rootSlug="calculator" />; }
export function ConverterCatalog() { return <RootPage rootSlug="convert" />; }
export function UnitCatalog() { return <RootPage rootSlug="units" />; }
export function CalculatorSubcategory({ slug }: { slug: string }) { return <SubcategoryPage rootSlug="calculator" categorySlug={slug} />; }
export function ConverterSubcategory({ slug }: { slug: string }) { return <SubcategoryPage rootSlug="convert" categorySlug={slug} />; }
export function UnitSubcategory({ slug }: { slug: string }) { return <SubcategoryPage rootSlug="units" categorySlug={slug} />; }
