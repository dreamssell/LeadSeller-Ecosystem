// Admin-only: re-send a queued lead to the upstream API gateway.
// Validates caller is authenticated AND has admin role before doing anything.

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { z } from "https://esm.sh/zod@3.23.8";

const UPSTREAM_URL = "https://api.leadseller.com.br/v1/public/leads";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BodySchema = z.object({ lead_id: z.string().uuid() });

function log(level: "info" | "warn" | "error", event: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, service: "lead-resend", event, ...data }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── AuthN: validate JWT ────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── AuthZ: must be admin ───────────────────────────────────────────────
  const { data: roleOk, error: roleErr } = await admin.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleErr || !roleOk) {
    log("warn", "forbidden", { user_id: userData.user.id });
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Input validation ──────────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "validation_failed", details: parsed.error.flatten().fieldErrors }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Fetch lead ─────────────────────────────────────────────────────────
  const { data: lead, error: fetchErr } = await admin
    .from("leads")
    .select("*")
    .eq("id", parsed.data.lead_id)
    .maybeSingle();

  if (fetchErr || !lead) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  log("info", "resending", { lead_id: lead.id, request_id: lead.request_id });

  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Source": "leadseller.com.br",
        "X-Client-Version": "portal-1.0-resend",
        "X-Request-ID": lead.request_id,
      },
      body: JSON.stringify(lead.raw_payload),
    });
    const text = await upstream.text();

    await admin.from("leads").update({
      upstream_status: upstream.status,
      upstream_ok: upstream.ok,
      upstream_error: upstream.ok ? null : text.slice(0, 500),
    }).eq("id", lead.id);

    log(upstream.ok ? "info" : "error", "resend_done", { lead_id: lead.id, status: upstream.status });
    return new Response(JSON.stringify({ ok: upstream.ok, status: upstream.status }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await admin.from("leads").update({
      upstream_status: null,
      upstream_ok: false,
      upstream_error: msg.slice(0, 500),
    }).eq("id", lead.id);
    log("error", "resend_failed", { lead_id: lead.id, error: msg });
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
