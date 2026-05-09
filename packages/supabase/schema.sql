-- ==========================================
-- LEAD SELLER - SUPABASE DATABASE SCHEMA
-- Multi-Tenant SaaS Architecture
-- ==========================================

-- Extensão necessária para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE TENANTS (Clientes SaaS)
-- Representa as empresas que assinam o LeadSeller
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    admin_email TEXT UNIQUE NOT NULL,
    google_calendar_tokens JSONB DEFAULT NULL, -- Armazena refresh_token do OAuth
    settings JSONB DEFAULT '{}'::jsonb, -- Configurações de IAs, Prompt etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE LEADS
-- Os consumidores finais (Contatos de WhatsApp) de cada Tenant
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Vincula o Lead a um Login do Portal
    name TEXT,
    phone_number TEXT NOT NULL, -- Número do WhatsApp (ID único no WhatsApp)
    email TEXT,
    status TEXT DEFAULT 'FRIO', -- FRIO, QUALIFICADO, CLIENTE, PERDIDO
    tags TEXT[],
    requires_password_change BOOLEAN DEFAULT true, -- Para o fluxo de Onboarding
    is_2fa_verified BOOLEAN DEFAULT false, -- Autenticação via WhatsApp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, phone_number) -- Um telefone é único por empresa
);

-- 2.1 TABELA DE OTP (One-Time Password para Leads)
-- Armazena os códigos de 6 dígitos enviados para o WhatsApp no 2FA
CREATE TABLE public.lead_otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE CONVERSATIONS (Sessões de Atendimento)
-- Agrupa as mensagens de um atendimento específico (Ex: Atendimento de Suporte #123)
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED, ESCALATED_TO_HUMAN
    active_agent TEXT DEFAULT 'TRIAGE', -- Qual IA está atendendo (TRIAGE, SDR, CLOSER, HELPDESK)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE MESSAGES (Histórico RAG)
-- Cada balãozinho de mensagem do WhatsApp
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'ai', 'human')), -- Quem enviou
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE KNOWLEDGE BASE (Base de Conhecimento / RAG)
-- Os textos, manuais e PDFs que a IA vai ler para cada Tenant
CREATE TABLE public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- O texto extraído do PDF
    agent_target TEXT, -- Para qual agente é esta regra? (SDR, HELPDESK) ou NULL para todos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE INVOICES (Faturas para o BillingAgent)
-- Faturas que os clientes finais precisam pagar
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE
    payment_link TEXT, -- Link do PIX ou Boleto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- Isolamento Multi-Tenant: Garante que o Cliente A não leia os dados do Cliente B
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Exemplo de Política: Se integrarmos via Auth do Supabase no futuro, o backend filtraria por auth.uid()
-- Como vamos usar a API NestJS como "Service Role" (Admin), a API tem acesso total.
-- Mas se um frontend Vite consultar direto:
-- CREATE POLICY "Tenant Isolation" ON leads FOR ALL USING (tenant_id = auth.uid()); 

-- ==========================================
-- TRIGGERS DE UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_modtime BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_conversations_modtime BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
