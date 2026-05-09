import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2, UserPlus, Upload } from "lucide-react";
import { useCompanyBranding } from "@/hooks/use-company-branding";

type AdminUser = {
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export const AdminSettings = ({ userId, userEmail }: { userId: string; userEmail: string }) => {
  // Profile
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);

  // Company
  const { name: brandName, logoUrl: brandLogo } = useCompanyBranding();
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [savingCompany, setSavingCompany] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  // Security
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  // Admins
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [grantingAdmin, setGrantingAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (prof) {
        setDisplayName(prof.display_name ?? "");
        setAvatarUrl(prof.avatar_url ?? null);
      }
    })();
  }, [userId]);

  useEffect(() => {
    setCompanyName(brandName);
    setCompanyLogo(brandLogo.startsWith("http") ? brandLogo : null);
  }, [brandName, brandLogo]);

  const loadAdmins = async () => {
    setAdminsLoading(true);
    const { data, error } = await supabase.rpc("list_admins");
    setAdminsLoading(false);
    if (error) {
      toast({ title: "Falha ao listar admins", description: error.message, variant: "destructive" });
      return;
    }
    setAdmins((data ?? []) as AdminUser[]);
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 5MB.", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      setUploadingAvatar(false);
      toast({ title: "Falha no upload", description: upErr.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(pub.publicUrl);
    setUploadingAvatar(false);
    toast({ title: "Foto carregada", description: "Clique em Salvar para confirmar." });
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, display_name: displayName.trim() || null, avatar_url: avatarUrl });
    setSavingProfile(false);
    if (error) {
      toast({ title: "Falha ao salvar perfil", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Perfil atualizado" });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 5MB.", variant: "destructive" });
      return;
    }
    setUploadingLogo(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("company-assets").upload(path, file, { upsert: true });
    if (upErr) {
      setUploadingLogo(false);
      toast({ title: "Falha no upload", description: upErr.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("company-assets").getPublicUrl(path);
    setCompanyLogo(pub.publicUrl);
    setUploadingLogo(false);
    toast({ title: "Logo carregada", description: "Clique em Salvar para aplicar no site." });
  };

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    const { error } = await supabase
      .from("company_settings")
      .upsert({ id: 1, name: companyName.trim() || null, logo_url: companyLogo });
    setSavingCompany(false);
    if (error) {
      toast({ title: "Falha ao salvar empresa", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Identidade da empresa atualizada" });
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Senha curta", description: "Use pelo menos 8 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Senhas não coincidem", variant: "destructive" });
      return;
    }
    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPwd(false);
    if (error) {
      toast({ title: "Falha ao alterar senha", description: error.message, variant: "destructive" });
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Senha alterada com sucesso" });
  };

  const handleGrantAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;
    setGrantingAdmin(true);
    const { error } = await supabase.rpc("set_admin_role_by_email", { _email: email, _grant: true });
    setGrantingAdmin(false);
    if (error) {
      toast({ title: "Falha ao conceder admin", description: error.message, variant: "destructive" });
      return;
    }
    setNewAdminEmail("");
    toast({ title: "Admin concedido", description: email });
    loadAdmins();
  };

  const handleRevokeAdmin = async (email: string) => {
    if (!confirm(`Remover papel admin de ${email}?`)) return;
    const { error } = await supabase.rpc("set_admin_role_by_email", { _email: email, _grant: false });
    if (error) {
      toast({ title: "Falha ao revogar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Admin removido", description: email });
    loadAdmins();
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="company">Empresa</TabsTrigger>
        <TabsTrigger value="security">Segurança</TabsTrigger>
        <TabsTrigger value="admins">Administradores</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Perfil do administrador</CardTitle>
            <CardDescription>Como você aparece no painel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
                ) : (
                  <span className="text-xl font-semibold text-muted-foreground">
                    {(displayName || userEmail).slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <Button variant="outline" size="sm" onClick={() => avatarInput.current?.click()} disabled={uploadingAvatar}>
                  {uploadingAvatar ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Upload className="size-4 mr-2" />}
                  Trocar foto
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG ou JPG até 5MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome de exibição</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={userEmail} disabled />
            </div>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile && <Loader2 className="size-4 mr-2 animate-spin" />}
              Salvar perfil
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="company">
        <Card>
          <CardHeader>
            <CardTitle>Identidade da empresa</CardTitle>
            <CardDescription>Logo e nome exibidos no site público.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center p-2">
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">sem logo</span>
                )}
              </div>
              <div>
                <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <Button variant="outline" size="sm" onClick={() => logoInput.current?.click()} disabled={uploadingLogo}>
                  {uploadingLogo ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Upload className="size-4 mr-2" />}
                  Trocar logo
                </Button>
                {companyLogo && (
                  <Button variant="ghost" size="sm" onClick={() => setCompanyLogo(null)}>Remover</Button>
                )}
                <p className="text-xs text-muted-foreground mt-1">PNG transparente recomendado, até 5MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome da empresa</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={100} />
            </div>
            <Button onClick={handleSaveCompany} disabled={savingCompany}>
              {savingCompany && <Loader2 className="size-4 mr-2 animate-spin" />}
              Salvar e aplicar no site
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Trocar senha</CardTitle>
            <CardDescription>Mínimo 8 caracteres.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button onClick={handleChangePassword} disabled={changingPwd}>
              {changingPwd && <Loader2 className="size-4 mr-2 animate-spin" />}
              Atualizar senha
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="admins">
        <Card>
          <CardHeader>
            <CardTitle>Administradores</CardTitle>
            <CardDescription>
              Conceda papel admin a usuários já cadastrados (eles precisam ter feito login ao menos uma vez).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="email@empresa.com.br"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="max-w-xs"
                type="email"
              />
              <Button onClick={handleGrantAdmin} disabled={grantingAdmin || !newAdminEmail.trim()}>
                {grantingAdmin ? <Loader2 className="size-4 mr-2 animate-spin" /> : <UserPlus className="size-4 mr-2" />}
                Conceder admin
              </Button>
            </div>

            <div className="rounded-lg border border-border divide-y">
              {adminsLoading && (
                <div className="p-4 text-sm text-muted-foreground">Carregando…</div>
              )}
              {!adminsLoading && admins.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">Nenhum admin cadastrado.</div>
              )}
              {admins.map((a) => (
                <div key={a.user_id} className="flex items-center justify-between p-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {a.avatar_url ? (
                        <img src={a.avatar_url} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold">{a.email.slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.display_name || a.email}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeAdmin(a.email)}
                    disabled={a.user_id === userId}
                    title={a.user_id === userId ? "Você não pode remover a si mesmo" : "Revogar admin"}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
