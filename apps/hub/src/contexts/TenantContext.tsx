import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Tenant {
  id: string;
  company_name: string;
  admin_email: string;
}

interface TenantContextType {
  tenants: Tenant[];
  activeTenant: Tenant | null;
  loading: boolean;
  setActiveTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      const { data, error } = await supabase.from('tenants').select('*');
      if (error) {
        toast({ title: 'Erro ao carregar Workspaces', description: error.message, variant: 'destructive' });
      } else {
        setTenants(data || []);
        
        // Tenta pegar o último salvo no LocalStorage
        const savedId = localStorage.getItem('ls_active_tenant_id');
        const found = data?.find(t => t.id === savedId);
        
        if (found) {
          setActiveTenant(found);
        } else if (data && data.length > 0) {
          // Fallback pro primeiro (geralmente HQ)
          setActiveTenant(data[0]);
          localStorage.setItem('ls_active_tenant_id', data[0].id);
        }
      }
      setLoading(false);
    };

    fetchTenants();
  }, []);

  const setActiveTenantId = (id: string) => {
    const found = tenants.find(t => t.id === id);
    if (found) {
      setActiveTenant(found);
      localStorage.setItem('ls_active_tenant_id', id);
      // Opcional: Recarregar a página para limpar estados residuais de páginas cacheadas
      window.location.reload();
    }
  };

  return (
    <TenantContext.Provider value={{ tenants, activeTenant, loading, setActiveTenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant deve ser usado dentro de TenantProvider');
  return ctx;
}
