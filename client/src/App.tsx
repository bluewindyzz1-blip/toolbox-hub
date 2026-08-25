import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ImageTool from "./pages/ImageTool";
import RentCalculator from "./pages/RentCalculator";
import LoanCalculator from "./pages/LoanCalculator";
import UnitConverter from "./pages/UnitConverter";
import VatCalculator from "./pages/VatCalculator";
import { CalculatorCatalog, CalculatorSubcategory, CalculatorToolRoute, ConverterCatalog, ConverterSubcategory, ConverterToolRoute, UnitCatalog, UnitSubcategory } from "./pages/CatalogPages";
import AdminCategories from "./pages/AdminCategories";
import { ContactPage, InfoPage, SearchPage } from "./pages/InfoPages";

const PdfTool = lazy(() => import("./pages/PdfTool"));
const PdfToolRoute = () => <Suspense fallback={<div className="client-tool-loading">PDF 변환 도구를 준비하는 중입니다.</div>}><PdfTool /></Suspense>;

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/pdf"} component={PdfToolRoute} />
      <Route path={"/image"} component={ImageTool} />
      <Route path={"/rent"} component={RentCalculator} />
      <Route path={"/loan"} component={LoanCalculator} />
      <Route path={"/unit"} component={() => <UnitConverter />} />
      <Route path={"/vat"} component={VatCalculator} />
      <Route path={"/calculator"} component={CalculatorCatalog} />
      <Route path={"/calculator/:subcategory"}>{(params) => <CalculatorSubcategory slug={params.subcategory} />}</Route>
      <Route path={"/calculator/:subcategory/:tool"}>{(params) => <CalculatorToolRoute slug={params.tool} />}</Route>
      <Route path={"/convert"} component={ConverterCatalog} />
      <Route path={"/convert/:subcategory"}>{(params) => <ConverterSubcategory slug={params.subcategory} />}</Route>
      <Route path={"/convert/:subcategory/:tool"}>{(params) => <ConverterToolRoute slug={params.tool} />}</Route>
      <Route path={"/units"} component={UnitCatalog} />
      <Route path={"/units/:subcategory"}>{(params) => <UnitSubcategory slug={params.subcategory} />}</Route>
      <Route path={"/admin/categories"} component={AdminCategories} />
      <Route path={"/search"} component={SearchPage} />
      <Route path={"/about"}>{() => <InfoPage type="about" />}</Route>
      <Route path={"/guide"}>{() => <InfoPage type="guide" />}</Route>
      <Route path={"/faq"}>{() => <InfoPage type="faq" />}</Route>
      <Route path={"/privacy"}>{() => <InfoPage type="privacy" />}</Route>
      <Route path={"/terms"}>{() => <InfoPage type="terms" />}</Route>
      <Route path={"/disclaimer"}>{() => <InfoPage type="disclaimer" />}</Route>
      <Route path={"/cookie-policy"}>{() => <InfoPage type="cookie" />}</Route>
      <Route path={"/contact"} component={ContactPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
