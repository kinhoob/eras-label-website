import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ArchivePage from "./pages/Archive";
import ManifestoPage from "./pages/Manifesto";
import EventsPage from "./pages/Events";
import ContactPage from "./pages/Contact";
import CatalogViewPage from "./pages/CatalogView";
import AccountPage from "@/pages/Account";
import CheckoutPage from "@/pages/Checkout";

function Router() {
  return (
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
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
