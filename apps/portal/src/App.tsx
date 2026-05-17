import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Privacy from "./pages/Privacy.tsx";
import Admin from "./pages/Admin.tsx";
import AdminAuth from "./pages/AdminAuth.tsx";
import NotFound from "./pages/NotFound.tsx";
import { CookiePreferencesModal } from "@/components/ls/CookiePreferencesModal";
import { initAnalytics, track } from "@/lib/analytics";
import { CompanyBrandingProvider } from "@/hooks/use-company-branding";

const queryClient = new QueryClient();

const RouteAnalytics = () => {
  const location = useLocation();
  useEffect(() => {
    track("pageview", { path: location.pathname });
  }, [location.pathname]);
  return null;
};

const AppShell = () => {
  useEffect(() => { initAnalytics(); }, []);
  return (
    <BrowserRouter>
      <RouteAnalytics />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin" element={<Admin />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookiePreferencesModal />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CompanyBrandingProvider>
        <Toaster />
        <Sonner />
        <AppShell />
      </CompanyBrandingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
