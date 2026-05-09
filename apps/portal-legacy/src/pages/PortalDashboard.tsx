import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Receipt, FileText, Settings, LogOut, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '@leadseller/supabase';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  amount: number;
  status: string;
  due_date: string;
}

export default function PortalDashboard() {
  const { user, leadData, signOut } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!leadData) return;
    
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('lead_id', leadData.id)
        .order('due_date', { ascending: false });
        
      if (error) {
        toast.error('Erro ao carregar faturas', { description: error.message });
      } else {
        setInvoices(data || []);
      }
      setLoadingInvoices(false);
    };

    fetchInvoices();
  }, [leadData]);

  const handlePayment = async (invoiceId: string) => {
    setPayingId(invoiceId);
    try {
      const res = await fetch('http://localhost:3000/portal/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao gerar checkout');
      
      // Redireciona o usuário para o Checkout do Stripe
      window.location.href = data.url;
    } catch (err: any) {
      toast.error('Falha no pagamento', { description: err.message });
      setPayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Receipt className="w-4 h-4 text-white" />
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

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Visão Geral</h1>
          <p className="text-sm text-slate-500">Acompanhe seus serviços e faturas em tempo real.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Minhas Faturas
            </h2>
            
            {loadingInvoices ? (
              <div className="p-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : invoices.length === 0 ? (
              <Card className="border-dashed shadow-none bg-slate-50">
                <CardContent className="p-8 text-center text-slate-500 text-sm">
                  Nenhuma fatura encontrada.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {invoices.map(inv => (
                  <Card key={inv.id} className="overflow-hidden">
                    <div className={`h-1 w-full ${inv.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">
                            Fatura #{inv.id.split('-')[0].toUpperCase()}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Vencimento: {new Date(inv.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="text-xl font-bold text-slate-900 shrink-0">
                          R$ {inv.amount.toFixed(2).replace('.', ',')}
                        </div>
                        {inv.status !== 'PAID' && (
                          <Button 
                            className="bg-slate-900 hover:bg-slate-800 w-full md:w-auto" 
                            onClick={() => handlePayment(inv.id)}
                            disabled={payingId === inv.id}
                          >
                            {payingId === inv.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" /> Pagar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Acesso Rápido
            </h2>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Abrir Chamado</CardTitle>
                <CardDescription>Falar com o suporte técnico</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <Settings className="w-5 h-5 text-slate-600 mb-2" />
                <CardTitle className="text-base">Meu Perfil</CardTitle>
                <CardDescription>Atualizar dados cadastrais</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
