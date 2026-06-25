import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { StoreProvider, useStore } from "@/lib/StoreContext";
import { Layout } from "@/components/layout/Layout";

import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Gallery from "@/pages/Gallery";
import ArticleDetail from "@/pages/ArticleDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <span className="text-4xl font-bold text-red-600" style={{ fontFamily: "'Sigmar One', cursive", WebkitTextStroke: '2px white', paintOrder: 'stroke fill' }}>KINDO</span>
      <div className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  const { loading } = useStore();

  if (loading) return <LoadingScreen />;

  return (
    <Switch>
      <Route path="/admin" component={Admin} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/catalog/:category/:type/:subtype" component={Catalog} />
            <Route path="/catalog/:category/:type" component={Catalog} />
            <Route path="/catalog/:category" component={Catalog} />
            <Route path="/catalog" component={Catalog} />
            <Route path="/product/:id" component={ProductDetail} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/article/:id" component={ArticleDetail} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <StoreProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </StoreProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
