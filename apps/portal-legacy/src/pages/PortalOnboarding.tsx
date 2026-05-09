import { useState } from 'react';
import { supabase } from '@leadseller/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PortalOnboarding() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, refreshLeadData } = useAuth();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    // 1. Atualizar a senha no Auth do Supabase
    const { error: authError } = await supabase.auth.updateUser({ password });
    
    if (authError) {
      toast.error('Erro ao atualizar senha', { description: authError.message });
      setLoading(false);
      return;
    }

    // 2. Atualizar a flag requires_password_change na tabela leads
    if (user) {
      const { error: dbError } = await supabase
        .from('leads')
        .update({ requires_password_change: false })
        .eq('auth_user_id', user.id);

      if (dbError) {
        toast.error('Erro de sincronização', { description: dbError.message });
      } else {
        await refreshLeadData();
        toast.success('Senha atualizada com sucesso!');
        navigate('/onboarding/2fa');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo(a) ao seu Portal!</h1>
          <p className="text-sm text-slate-500 mt-3">
            Para garantir a máxima segurança dos seus dados financeiros, por favor, defina a sua nova senha pessoal.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirme a Nova Senha</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Digite novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 mt-6" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Nova Senha e Continuar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
