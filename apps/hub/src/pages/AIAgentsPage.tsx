import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Bot, Settings, ToggleLeft, ToggleRight, Loader2, Save, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface AIAgent {
  id: string;
  name: string;
  description: string | null;
  role_key: string;
  provider: string;
  model: string;
  system_prompt: string;
  temperature: number;
  is_active: boolean;
  knowledge_base: string | null;
}

const MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)' },
];

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AIAgent | null>(null);
  const [saving, setSaving] = useState(false);
  const { activeTenant } = useTenant();

  const fetchAgents = async () => {
    if (!activeTenant) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('tenant_id', activeTenant.id)
      .order('role_key');
      
    if (error) toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    setAgents((data ?? []) as AIAgent[]);
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, [activeTenant]);

  const openEdit = (a: AIAgent) => setEditing({ ...a });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    
    const { error } = await supabase.from('ai_agents').update({
      name: editing.name,
      description: editing.description,
      provider: editing.model.includes('claude') ? 'anthropic' : 'openai',
      model: editing.model,
      system_prompt: editing.system_prompt,
      temperature: editing.temperature,
      is_active: editing.is_active,
      knowledge_base: editing.knowledge_base,
    }).eq('id', editing.id);

    setSaving(false);
    
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Configurações atualizadas com sucesso!' });
    setEditing(null);
    fetchAgents();
  };

  const toggleActive = async (a: AIAgent) => {
    const { error } = await supabase.from('ai_agents').update({ is_active: !a.is_active }).eq('id', a.id);
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    setAgents((prev) => prev.map((x) => x.id === a.id ? { ...x, is_active: !x.is_active } : x));
  };

  return (
    <AppLayout title="O Cérebro da Operação" subtitle="Configure o Esquadrão LeadSeller (Prompts, Modelos e Base de Conhecimento RAG)">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Você possui {agents.length} agentes pré-configurados no seu ecossistema.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {agents.map((agent, i) => (
            <motion.div key={agent.id} className="glass-card p-6 border border-border/50 relative overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              {!agent.is_active && <div className="absolute inset-0 bg-background/50 z-0 pointer-events-none" />}
              
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground truncate">{agent.name}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase">{agent.role_key}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{agent.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-[10px] bg-secondary/80">{agent.model}</Badge>
                      <Badge variant="outline" className="text-[10px]">Criatividade: {agent.temperature}</Badge>
                      {agent.knowledge_base && agent.knowledge_base.length > 5 && (
                        <Badge variant="default" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          <BookOpen className="w-3 h-3 mr-1" /> PDF Anexado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => toggleActive(agent)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                  {agent.is_active ? <ToggleRight className="w-8 h-8 text-success" /> : <ToggleLeft className="w-8 h-8 opacity-50" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/50 relative z-10">
                <Button size="sm" variant="default" className="w-full" onClick={() => openEdit(agent)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Treinar Agente
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Treinar {editing?.name}</DialogTitle>
          </DialogHeader>
          
          {editing && (
            <div className="space-y-5 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome de Exibição</Label>
                  <Input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <Label>Modelo (Motor LLM)</Label>
                  <Select value={editing.model} onValueChange={(v) => setEditing({ ...editing, model: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição da Missão</Label>
                <Input value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>System Prompt (Regras de Ouro)</Label>
                  <span className="text-[10px] text-muted-foreground">Como este agente deve se comportar?</span>
                </div>
                <Textarea 
                  rows={6} 
                  value={editing.system_prompt ?? ''} 
                  onChange={(e) => setEditing({ ...editing, system_prompt: e.target.value })} 
                  className="font-mono text-xs bg-secondary/30"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <Label>Base de Conhecimento (RAG)</Label>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Cole aqui o conteúdo de PDFs, manuais de produto, scripts de venda ou tabelas de preço. O agente usará isso como memória longa.
                </p>
                <Textarea 
                  rows={5} 
                  value={editing.knowledge_base ?? ''} 
                  onChange={(e) => setEditing({ ...editing, knowledge_base: e.target.value })} 
                  placeholder="Ex: Nossos planos custam R$ 97/mês. Não cobramos taxa de setup..."
                  className="text-sm bg-secondary/30"
                />
              </div>

              <div>
                <Label>Nível de Criatividade (Temperature): {editing.temperature}</Label>
                <Slider 
                  min={0} max={1.5} step={0.1} 
                  value={[editing.temperature]} 
                  onValueChange={(v) => setEditing({ ...editing, temperature: v[0] })} 
                  className="mt-3" 
                />
                <p className="text-[10px] text-muted-foreground mt-2">0.0 (Super rígido e focado nos manuais) até 1.5 (Criativo e espontâneo).</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border">
                <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                <div>
                  <p className="text-sm font-medium">Agente Ativo</p>
                  <p className="text-xs text-muted-foreground">Permite que este agente seja invocado pelas automações e webhooks.</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
