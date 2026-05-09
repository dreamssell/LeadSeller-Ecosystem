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

// Importações do Portal do Cliente
import { AuthProvider } from "./contexts/AuthContext";
import PortalLogin from "./pages/PortalLogin";
import PortalOnboarding from "./pages/PortalOnboarding";
import Portal2FA from "./pages/Portal2FA";
import PortalDashboard from "./pages/PortalDashboard";
import PortalProtectedRoute from "./components/PortalProtectedRoute";

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
        
        {/* Rotas Públicas do Portal do Cliente */}
        <Route path="/login" element={<PortalLogin />} />

        {/* Rotas Protegidas do Portal do Cliente */}
        <Route element={<PortalProtectedRoute />}>
          <Route path="/onboarding/welcome" element={<PortalOnboarding />} />
          <Route path="/onboarding/2fa" element={<Portal2FA />} />
          <Route path="/dashboard" element={<PortalDashboard />} />
        </Route>

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
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppShell />
        </AuthProvider>
      </CompanyBrandingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
