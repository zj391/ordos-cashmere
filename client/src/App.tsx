import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';
import ChatWidget from './components/ChatWidget';
import WhatsAppButton from './components/WhatsAppButton';
import { initializeGA4 } from './lib/analytics';
import { seoConfig } from './lib/seoConfig';
import React from "react";
import Home from "@/pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Production from "./pages/Production";
import BrandStory from "@/pages/BrandStory";
import FAQ from "@/pages/FAQ";
import Blog from "@/pages/Blog";
import BlogPost from "./pages/BlogPost";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TestPage from "@/pages/TestPage";
import Admin from "@/pages/Admin";

// @ts-ignore
(window as any).__APP_ROUTES__ = "/privacy-policy|/test|/brand-story";

function Router() {
  console.log(">>> Router component loaded");
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products/:id">
        {({ id }) => <ProductDetail productId={id} />}
      </Route>
      <Route path="/products" component={Products} />
      <Route path="/brand-story" component={BrandStory} />
      <Route path="/about" component={About} />
      <Route path="/production" component={Production} />
      <Route path="/faq" component={FAQ} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/test" component={TestPage} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initializeGA4();
  }, []);

  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <Helmet>
          <title>{seoConfig.pages.home.title}</title>
          <meta name="description" content={seoConfig.pages.home.description} />
          <link rel="canonical" href={seoConfig.siteUrl} />
        </Helmet>
      <ErrorBoundary>
        <ThemeProvider
          defaultTheme="light"
        >
          <TooltipProvider>
            <Toaster />
            <ChatWidget />
            <WhatsAppButton
              phoneNumber="8615661853999"
              message="Hello! I am interested in your premium cashmere products. Could you please provide more information and a quote?"
              position="bottom-right"
            />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </ErrorBoundary>
      </I18nextProvider>
    </HelmetProvider>
  );
}

export default App;
