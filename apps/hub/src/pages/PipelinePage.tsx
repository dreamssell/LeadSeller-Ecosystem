import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { GripVertical, Plus, MoreVertical, Loader2, Key } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Lead {
  id: string;
  name: string;
  phone_number: string;
  status: string;
}

const statusConfig = [
  { status: 'FRIO', title: 'Novo Lead', color: 'bg-muted-foreground' },
  { status: 'QUALIFICADO', title: 'Qualificação', color: 'bg-primary' },
  { status: 'NEGOCIANDO', title: 'Proposta', color: 'bg-warning' },
  { status: 'CLIENTE', title: 'Fechamento', color: 'bg-success' },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeTenant } = useTenant();

  useEffect(() => {
    if (!activeTenant) return;

    const fetchLeads = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', activeTenant.id);
        
      if (error) {
        toast({ title: 'Erro ao carregar leads', description: error.message, variant: 'destructive' });
      } else {
        setLeads(data || []);
      }
      setLoading(false);
    };

    fetchLeads();

    const subscription = supabase.channel(`leads-changes-${activeTenant.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leads',
        filter: `tenant_id=eq.${activeTenant.id}`
      }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeTenant]);

  return (
    <AppLayout title="Pipeline & Kanban" subtitle="Gerencie seu funil de vendas integrado com o Supabase">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusConfig.map((col, ci) => {
            const columnLeads = leads.filter(l => (l.status || 'FRIO').toUpperCase() === col.status);
            
            return (
              <motion.div
                key={col.status}
                className="min-w-[280px] flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ci * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{columnLeads.length}</span>
                </div>

                <div className="space-y-2">
                  {columnLeads.map((card) => (
                    <div key={card.id} className="glass-card p-4 cursor-grab active:cursor-grabbing">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">{card.name || 'Sem Nome'}</p>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-secondary">
                              <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => {
                              toast({ 
                                title: 'Acesso Solicitado', 
                                description: 'Nossa API criará a senha e enviará via WhatsApp em breve.',
                              });
                              // TODO: Implementar chamada à Edge Function de criação de usuário do Portal
                            }}>
                              <Key className="w-4 h-4 mr-2" />
                              Gerar Acesso ao Portal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </div>
                      <p className="text-xs text-muted-foreground">{card.phone_number}</p>
                    </div>
                  ))}

                  <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
