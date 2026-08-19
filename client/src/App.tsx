import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "./components/ErrorBoundary";
import AnalyticsScript from "./components/AnalyticsScript";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminCategories from "./pages/AdminCategories";
import { ContactPage, InfoPage, SearchPage } from "./pages/InfoPages";
import { GuideCatalog, GuidePage } from "./pages/GuidePages";
import { AdSenseAutoAds } from "./components/CatalogSupport";

const PdfTool = lazy(() => import("./pages/PdfTool"));
const DocumentTool = lazy(() => import("./pages/DocumentTool"));
const ImageTool = lazy(() => import("./pages/ImageTool"));
const RentCalculator = lazy(() => import("./pages/RentCalculator"));
const LoanCalculator = lazy(() => import("./pages/LoanCalculator"));
const UnitConverter = lazy(() => import("./pages/UnitConverter"));
const VatCalculator = lazy(() => import("./pages/VatCalculator"));
const CalculatorCatalog = lazy(() => import("./pages/CatalogPages").then((module) => ({ default: module.CalculatorCatalog })));
const CalculatorSubcategory = lazy(() => import("./pages/CatalogPages").then((module) => ({ default: module.CalculatorSubcategory })));
const CalculatorToolRoute = lazy(() => import("./pages/CatalogPages").then((module) => ({ default: module.CalculatorToolRoute })));
const ConverterCatalog = lazy(() => import("./pages/CatalogPages").then((module) => ({ default: module.ConverterCatalog })));
const ConverterSubcategory = lazy(() => import("./pages/CatalogPages").then((module) => ({ default: module.ConverterSubcategory })));
const ConverterToolRoute = lazy(() => import("./pages/CatalogPages").then((module) => ({ default: module.ConverterToolRoute })));
const UnitCatalog = lazy(() => import("./pages/CatalogPages").then((module) => ({ default: module.UnitCatalog })));
const UnitSubcategory = lazy(() => import("./pages/CatalogPages").then((module) => ({ default: module.UnitSubcategory })));

function LoadingRoute({ label, children }: { label: string; children: React.ReactNode }) { return <Suspense fallback={<div className="client-tool-loading">{label} 준비하는 중입니다.</div>}>{children}</Suspense>; }
const PdfToolRoute = () => <LoadingRoute label="PDF 변환 도구를"><PdfTool /></LoadingRoute>;
const DocumentToolRoute = () => <LoadingRoute label="문서 변환 도구를"><DocumentTool /></LoadingRoute>;
const ImageToolRoute = () => <LoadingRoute label="이미지 도구를"><ImageTool /></LoadingRoute>;
const RentCalculatorRoute = () => <LoadingRoute label="월세 계산기를"><RentCalculator /></LoadingRoute>;
const LoanCalculatorRoute = () => <LoadingRoute label="대출 계산기를"><LoanCalculator /></LoadingRoute>;
const UnitConverterRoute = () => <LoadingRoute label="단위 변환기를"><UnitConverter /></LoadingRoute>;
const VatCalculatorRoute = () => <LoadingRoute label="부가세 계산기를"><VatCalculator /></LoadingRoute>;
const CalculatorCatalogRoute = () => <LoadingRoute label="계산기 카탈로그를"><CalculatorCatalog /></LoadingRoute>;
const ConverterCatalogRoute = () => <LoadingRoute label="파일 변환 카탈로그를"><ConverterCatalog /></LoadingRoute>;
const UnitCatalogRoute = () => <LoadingRoute label="단위 변환 카탈로그를"><UnitCatalog /></LoadingRoute>;

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/pdf" component={PdfToolRoute} />
    <Route path="/image" component={ImageToolRoute} />
    <Route path="/document" component={DocumentToolRoute} />
    <Route path="/rent" component={RentCalculatorRoute} />
    <Route path="/loan" component={LoanCalculatorRoute} />
    <Route path="/unit" component={UnitConverterRoute} />
    <Route path="/vat" component={VatCalculatorRoute} />
    <Route path="/calculator" component={CalculatorCatalogRoute} />
    <Route path="/calculator/:subcategory">{(params) => <LoadingRoute label="계산기 카테고리를"><CalculatorSubcategory slug={params.subcategory} /></LoadingRoute>}</Route>
    <Route path="/calculator/:subcategory/:tool">{(params) => <LoadingRoute label="계산기를"><CalculatorToolRoute slug={params.tool} /></LoadingRoute>}</Route>
    <Route path="/convert" component={ConverterCatalogRoute} />
    <Route path="/convert/:subcategory">{(params) => <LoadingRoute label="파일 변환 카테고리를"><ConverterSubcategory slug={params.subcategory} /></LoadingRoute>}</Route>
    <Route path="/convert/:subcategory/:tool">{(params) => <LoadingRoute label="파일 변환 도구를"><ConverterToolRoute slug={params.tool} /></LoadingRoute>}</Route>
    <Route path="/units" component={UnitCatalogRoute} />
    <Route path="/units/:subcategory/:tool">{(params) => <LoadingRoute label="단위 변환기를"><ConverterToolRoute slug={params.tool} /></LoadingRoute>}</Route>
    <Route path="/units/:subcategory">{(params) => <LoadingRoute label="단위 카테고리를"><UnitSubcategory slug={params.subcategory} /></LoadingRoute>}</Route>
    <Route path="/admin/categories" component={AdminCategories} />
    <Route path="/search" component={SearchPage} />
    <Route path="/about">{() => <InfoPage type="about" />}</Route>
    <Route path="/guide">{() => <InfoPage type="guide" />}</Route>
    <Route path="/guides" component={GuideCatalog} />
    <Route path="/guides/:slug">{(params) => <GuidePage slug={params.slug} />}</Route>
    <Route path="/faq">{() => <InfoPage type="faq" />}</Route>
    <Route path="/privacy">{() => <InfoPage type="privacy" />}</Route>
    <Route path="/terms">{() => <InfoPage type="terms" />}</Route>
    <Route path="/disclaimer">{() => <InfoPage type="disclaimer" />}</Route>
    <Route path="/cookie-policy">{() => <InfoPage type="cookie" />}</Route>
    <Route path="/contact" component={ContactPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><AnalyticsScript /><AdSenseAutoAds /><Router /><Analytics /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
