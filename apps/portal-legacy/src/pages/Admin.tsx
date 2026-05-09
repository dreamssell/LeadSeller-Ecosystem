import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSettings } from "@/components/admin/AdminSettings";

type Lead = {
  id: string;
  request_id: string;
  full_name: string;
  corporate_email: string;
  company: string;
  phone: string | null;
  scheduling_date: string;
  scheduling_time: string;
  scheduling_timezone_label: string | null;
  upstream_ok: boolean;
  upstream_status: number | null;
  upstream_error: string | null;
  created_at: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "queued" | "ok">("queued");

  useEffect(() => {
    document.title = "Admin · Lead Seller";

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setSession(data.session);
      const { data: roleOk } = await supabase.rpc("has_role", {
        _user_id: data.session.user.id,
        _role: "admin",
      });
      setIsAdmin(Boolean(roleOk));
      setAuthChecked(true);
    });

    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const loadLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, request_id, full_name, corporate_email, company, phone, scheduling_date, scheduling_time, scheduling_timezone_label, upstream_ok, upstream_status, upstream_error, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(500);
    setLoading(false);
    if (error) {
      toast({ title: "Falha ao carregar leads", description: error.message, variant: "destructive" });
      return;
    }
    setLeads((data ?? []) as Lead[]);
  };

  useEffect(() => {
    if (isAdmin) loadLeads();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter === "queued" && l.upstream_ok) return false;
      if (filter === "ok" && !l.upstream_ok) return false;
      if (!q) return true;
      return (
        l.full_name.toLowerCase().includes(q) ||
        l.corporate_email.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        (l.phone ?? "").toLowerCase().includes(q) ||
        l.request_id.toLowerCase().includes(q)
      );
    });
  }, [leads, search, filter]);

  const handleResend = async (id: string) => {
    setResending(id);
    const { data, error } = await supabase.functions.invoke("lead-resend", {
      body: { lead_id: id },
    });
    setResending(null);
    if (error) {
      toast({ title: "Falha no reenvio", description: error.message, variant: "destructive" });
      return;
    }
    if (data?.ok) {
      toast({ title: "Lead entregue", description: `API respondeu ${data.status}` });
    } else {
      toast({
        title: "API ainda indisponível",
        description: data?.error ?? `Status ${data?.status}`,
        variant: "destructive",
      });
    }
    loadLeads();
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast({ title: "Nada para exportar", description: "Nenhum lead no filtro atual." });
      return;
    }
    const headers = [
      "created_at",
      "request_id",
      "full_name",
      "corporate_email",
      "company",
      "phone",
      "scheduling_date",
      "scheduling_time",
      "scheduling_timezone_label",
      "upstream_ok",
      "upstream_status",
      "upstream_error",
    ];
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filtered.map((l) =>
      headers.map((h) => escape((l as unknown as Record<string, unknown>)[h])).join(",")
    );
    const csv = "\ufeff" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `leads-${filter}-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exportação concluída", description: `${filtered.length} lead(s) exportado(s).` });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando…
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">Acesso negado</h1>
        <p className="text-muted-foreground max-w-md">
          Sua conta está autenticada, mas não possui o papel de <code>admin</code>.
          Solicite a outro administrador que conceda esse papel na tabela <code>user_roles</code>.
        </p>
        <p className="text-xs text-muted-foreground">
          Conectado como {session?.user.email}
        </p>
        <Button variant="outline" onClick={handleSignOut}>Sair</Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Backup de Leads</h1>
            <p className="text-sm text-muted-foreground">
              Inspecione e reenvie leads que não chegaram à API principal.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{session?.user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sair</Button>
          </div>
        </header>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Buscar nome, e-mail, empresa, telefone, request id…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex gap-1">
                {(["queued", "ok", "all"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                  >
                    {f === "queued" ? "Pendentes" : f === "ok" ? "Entregues" : "Todos"}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={loadLeads} disabled={loading}>
                {loading ? "Atualizando…" : "Atualizar"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={filtered.length === 0}>
                Exportar CSV
              </Button>
              <span className="ml-auto text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
              </span>
            </div>

            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Agendamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        Nenhum lead encontrado para o filtro atual.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{l.full_name}</div>
                        <div className="text-xs text-muted-foreground">{l.corporate_email}</div>
                      </TableCell>
                      <TableCell>{l.company}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {l.phone ? (
                          <a
                            href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {l.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {l.scheduling_date} {l.scheduling_time}
                        {l.scheduling_timezone_label ? ` ${l.scheduling_timezone_label}` : ""}
                      </TableCell>
                      <TableCell>
                        {l.upstream_ok ? (
                          <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Entregue</Badge>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Badge variant="destructive">
                              {l.upstream_status ? `Falhou ${l.upstream_status}` : "Pendente"}
                            </Badge>
                            {l.upstream_error && (
                              <span className="text-xs text-muted-foreground max-w-xs truncate">
                                {l.upstream_error}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={l.upstream_ok ? "outline" : "default"}
                          disabled={resending === l.id}
                          onClick={() => handleResend(l.id)}
                        >
                          {resending === l.id ? "Enviando…" : l.upstream_ok ? "Reenviar" : "Tentar novamente"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            {session && <AdminSettings userId={session.user.id} userEmail={session.user.email ?? ""} />}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Admin;
