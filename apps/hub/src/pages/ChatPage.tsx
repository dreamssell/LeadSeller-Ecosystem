import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Send, Search, Circle, MessageCircle, Bot, UserCog, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

interface Lead {
  id: string;
  name: string;
  phone_number: string;
}

interface Conversation {
  id: string;
  lead_id: string;
  status: string;
  active_agent: string;
  updated_at: string;
  lead?: Lead;
}

interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'ai' | 'human';
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const { activeTenant } = useTenant();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeTenant) return;

    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, status, active_agent, updated_at, lead_id,
          lead:leads(id, name, phone_number)
        `)
        .eq('tenant_id', activeTenant.id)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map((c: any) => ({
          ...c,
          lead: c.lead?.[0] || c.lead || { name: 'Desconhecido', phone_number: '' }
        }));
        setConversations(mapped);
      }
      setLoading(false);
    };

    fetchConversations();

    const convSub = supabase.channel(`conversations-realtime-${activeTenant.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'conversations',
        filter: `tenant_id=eq.${activeTenant.id}`
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(convSub); };
  }, [activeTenant]);

  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      return;
    }
    
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConvId)
        .order('created_at', { ascending: true });
        
      if (!error && data) setMessages(data as Message[]);
    };

    fetchMessages();

    const msgSub = supabase.channel(`messages-${selectedConvId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConvId}` }, payload => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [selectedConvId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleBot = async (convId: string, currentAgent: string) => {
    const newAgent = currentAgent === 'HUMAN' ? 'SDR' : 'HUMAN';
    const { error } = await supabase.from('conversations').update({ active_agent: newAgent }).eq('id', convId);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedConvId) return;
    
    const msg = inputText;
    setInputText('');

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConvId,
      role: 'human',
      content: msg
    });

    if (error) toast({ title: 'Erro ao enviar', description: error.message, variant: 'destructive' });
  };

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  return (
    <AppLayout title="Chat Omnichannel" subtitle="Acompanhe as Inteligências Artificiais trabalhando em tempo real">
      <div className="flex h-[calc(100vh-10rem)] glass-card overflow-hidden">
        
        {/* Lado Esquerdo: Lista de Conversas */}
        <div className="w-80 border-r border-border flex flex-col bg-background/50">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input placeholder="Buscar chats..." className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground mt-10">Nenhuma conversa encontrada.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/50 ${
                    selectedConvId === c.id ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">{c.lead?.name || c.lead?.phone_number || 'Lead'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">Canal: WhatsApp</p>
                    <div className="flex items-center gap-1 mt-1">
                      {c.active_agent === 'HUMAN' ? (
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 gap-0.5 border-warning/50 text-warning">
                          <UserCog className="w-2.5 h-2.5" /> Humano
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4 gap-0.5">
                          <Bot className="w-2.5 h-2.5" /> {c.active_agent}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Lado Direito: Histórico de Mensagens */}
        <div className="flex-1 flex flex-col bg-background/30">
          {selectedConv ? (
            <>
              {/* Header do Chat */}
              <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-background/50">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-semibold">{selectedConv.lead?.name || selectedConv.lead?.phone_number}</p>
                    <p className="text-[10px] text-muted-foreground">Conversa ID: {selectedConv.id.split('-')[0]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">IA ({selectedConv.active_agent})</span>
                    <Switch 
                      checked={selectedConv.active_agent !== 'HUMAN'} 
                      onCheckedChange={() => toggleBot(selectedConv.id, selectedConv.active_agent)} 
                    />
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isUser = m.role === 'user';
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isUser ? 'bg-secondary text-foreground rounded-bl-sm' : 'bg-primary text-primary-foreground rounded-br-sm'
                        }`}>
                          {!isUser && m.role === 'ai' && <p className="text-[9px] font-bold opacity-70 mb-1 uppercase">🤖 Agente IA</p>}
                          {!isUser && m.role === 'human' && <p className="text-[9px] font-bold opacity-70 mb-1 uppercase">👤 Você</p>}
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <p className={`text-[9px] mt-1 text-right ${isUser ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                            {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 bg-background/50">
                <div className="flex items-center gap-2">
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={selectedConv.active_agent !== 'HUMAN'}
                    placeholder={selectedConv.active_agent === 'HUMAN' ? "Digite sua mensagem..." : "A IA está no controle. Desative o Bot para falar."}
                    className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm outline-none disabled:opacity-50 transition-all"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!inputText.trim() || selectedConv.active_agent !== 'HUMAN'}
                    className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Selecione uma conversa ao lado para visualizar.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
