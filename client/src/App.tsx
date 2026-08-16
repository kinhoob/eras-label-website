import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import StorefrontLockedPage from "./components/StorefrontLockedPage";
import { trpc } from "@/lib/trpc";
import { isStorefrontLocked } from "../../shared/storefront-logic";
import Home from "./pages/Home";
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const ArchivePage = lazy(() => import("./pages/Archive"));
const ManifestoPage = lazy(() => import("./pages/Manifesto"));
const EventsPage = lazy(() => import("./pages/Events"));
const ContactPage = lazy(() => import("./pages/Contact"));
const CatalogViewPage = lazy(() => import("./pages/CatalogView"));
const AccountPage = lazy(() => import("@/pages/Account"));
const CheckoutPage = lazy(() => import("@/pages/Checkout"));
const TrackingPage = lazy(() => import("./pages/Tracking"));
const FaqPage = lazy(() => import("./pages/Faq"));

function RouteLoading() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#23221e] flex items-center justify-center px-6">
      <div className="text-center" role="status" aria-live="polite">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#dfd7cc] border-t-[#c95139]" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-[0.24em]">A carregar a sua era</p>
      </div>
    </main>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminOrAuthRoute = location.startsWith("/admin") || location.startsWith("/auth");
  const { data: storefrontConfig, isLoading: storefrontConfigLoading } = trpc.catalog.getStorefrontConfig.useQuery();

  if (!isAdminOrAuthRoute && storefrontConfigLoading) return <RouteLoading />;
  if (!isAdminOrAuthRoute && storefrontConfig && isStorefrontLocked(storefrontConfig)) {
    return <StorefrontLockedPage config={storefrontConfig} />;
  }

  return (
    <Suspense fallback={<RouteLoading />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/archive" component={ArchivePage} />
        <Route path="/manifesto" component={ManifestoPage} />
        <Route path="/events" component={EventsPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/category/:slug" component={CatalogViewPage} />
        <Route path="/collection/:slug" component={CatalogViewPage} />
        <Route path="/auth" component={Auth} />
        <Route path="/admin" component={Admin} />
        <Route path="/account" component={AccountPage} />
        <Route path="/orders" component={AccountPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/tracking" component={TrackingPage} />
        <Route path="/faq" component={FaqPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
