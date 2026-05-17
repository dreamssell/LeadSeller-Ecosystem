-- Backup table for lead submissions (filled by lead-proxy edge function)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  corporate_email TEXT NOT NULL,
  company TEXT NOT NULL,
  scheduling_date DATE NOT NULL,
  scheduling_time TEXT NOT NULL,
  scheduling_timezone TEXT NOT NULL,
  scheduling_timezone_label TEXT,
  locale TEXT,
  source TEXT,
  ip TEXT,
  user_agent TEXT,
  upstream_status INTEGER,
  upstream_ok BOOLEAN NOT NULL DEFAULT false,
  upstream_error TEXT,
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_email ON public.leads (corporate_email);
CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX idx_leads_upstream_ok ON public.leads (upstream_ok) WHERE upstream_ok = false;

-- Enable RLS — only service role (used by edge function) bypasses; public has no access
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Explicit deny policies for anon/authenticated (no SELECT/INSERT/UPDATE/DELETE granted).
-- Service role automatically bypasses RLS, so the edge function can still write.
CREATE POLICY "No public read" ON public.leads FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "No public insert" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No public update" ON public.leads FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "No public delete" ON public.leads FOR DELETE TO anon, authenticated USING (false);