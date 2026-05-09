import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@leadseller/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  leadData: any | null; // Dados complementares da tabela leads
  signOut: () => Promise<void>;
  refreshLeadData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadData, setLeadData] = useState<any | null>(null);

  const fetchLeadData = async (userId: string) => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar perfil do lead:', error);
    } else {
      setLeadData(data);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchLeadData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchLeadData(session.user.id).finally(() => setLoading(false));
      } else {
        setLeadData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Desconectado com sucesso');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, leadData, signOut, refreshLeadData: () => user ? fetchLeadData(user.id) : Promise.resolve() }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
