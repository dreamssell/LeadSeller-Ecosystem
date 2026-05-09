import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function PortalProtectedRoute() {
  const { user, loading, leadData } = useAuth();
  const location = useLocation();

  if (loading || (user && !leadData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Lógica de Redirecionamento de Segurança (Onboarding)
  const isWelcomePage = location.pathname === '/onboarding/welcome';
  const is2FAPage = location.pathname === '/onboarding/2fa';

  if (leadData?.requires_password_change) {
    if (!isWelcomePage) return <Navigate to="/onboarding/welcome" replace />;
  } else if (!leadData?.is_2fa_verified) {
    if (!is2FAPage) return <Navigate to="/onboarding/2fa" replace />;
  } else {
    // Está tudo OK com a segurança do usuário!
    if (isWelcomePage || is2FAPage) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
