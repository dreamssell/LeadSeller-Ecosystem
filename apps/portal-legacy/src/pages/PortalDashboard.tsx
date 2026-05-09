import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Receipt, FileText, Settings, LogOut, ArrowRight, Activity } from 'lucide-react';

export default function PortalDashboard() {
  const { user, leadData, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Minimalista */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">Portal do Cliente</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 hidden md:block">
            Olá, {leadData?.name?.split(' ')[0] || user?.email}
          </span>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-slate-500 hover:text-slate-900">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Visão Geral</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <Receipt className="w-6 h-6 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Faturas e Pagamentos</CardTitle>
              <CardDescription>Consulte boletos e histórico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-medium text-blue-600 mt-4">
                Acessar financeiro <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <FileText className="w-6 h-6 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Meus Chamados</CardTitle>
              <CardDescription>Acompanhe tickets de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-medium text-blue-600 mt-4">
                Ver chamados <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <Settings className="w-6 h-6 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Configurações</CardTitle>
              <CardDescription>Gerencie sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-medium text-blue-600 mt-4">
                Editar perfil <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
