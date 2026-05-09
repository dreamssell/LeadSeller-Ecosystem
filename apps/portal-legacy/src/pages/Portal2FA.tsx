import { useState } from 'react';
import { supabase } from '@leadseller/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Smartphone, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Portal2FA() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const navigate = useNavigate();
  const { user, leadData, refreshLeadData } = useAuth();

  const handleSendCode = async () => {
    if (!leadData?.phone_number) {
      toast.error('Número de WhatsApp não encontrado.');
      return;
    }
    setSendingCode(true);
    
    // In a real app, this calls an Edge Function that inserts the OTP in lead_otp_codes 
    // and calls the WhatsApp API via UAZ/Meta to send the message.
    // For now, we mock the sending logic and directly insert the code to validate the UI flow.
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { error } = await supabase.from('lead_otp_codes').insert({
      lead_id: leadData.id,
      code: mockCode,
      expires_at: new Date(Date.now() + 10 * 60000).toISOString() // 10 min
    });

    setSendingCode(false);

    if (error) {
      toast.error('Erro ao enviar código', { description: error.message });
    } else {
      toast.success('Código enviado!', { description: `Foi enviado um WhatsApp para ${leadData.phone_number}` });
      // MOCK ONLY: Mostrando o código na tela pro dev
      console.log(`[MOCK OTP]: O código enviado foi: ${mockCode}`);
      toast('Ambiente DEV', { description: `Seu código é: ${mockCode}`, duration: 10000 });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);

    // Validate code
    const { data, error } = await supabase
      .from('lead_otp_codes')
      .select('*')
      .eq('lead_id', leadData?.id)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      toast.error('Código inválido ou expirado.');
      setLoading(false);
      return;
    }

    // Mark used and update lead
    await supabase.from('lead_otp_codes').update({ used: true }).eq('id', data[0].id);
    const { error: leadErr } = await supabase.from('leads').update({ is_2fa_verified: true }).eq('id', leadData.id);

    if (leadErr) {
      toast.error('Erro ao atualizar cadastro', { description: leadErr.message });
    } else {
      await refreshLeadData();
      toast.success('Dispositivo verificado!');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-6">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verificação de Segurança</h1>
        <p className="text-sm text-slate-500 mb-8">
          Enviaremos um código de 6 dígitos para o seu WhatsApp final <span className="font-semibold text-slate-700">{leadData?.phone_number?.slice(-4) || 'XXXX'}</span>
        </p>

        <Button 
          variant="outline" 
          className="w-full h-11 mb-8" 
          onClick={handleSendCode} 
          disabled={sendingCode}
        >
          {sendingCode ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Enviar Código por WhatsApp
        </Button>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            type="text"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="h-14 text-center text-2xl tracking-widest font-mono"
            required
          />

          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading || code.length < 6}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verificar Código'}
          </Button>
        </form>
      </div>
    </div>
  );
}
