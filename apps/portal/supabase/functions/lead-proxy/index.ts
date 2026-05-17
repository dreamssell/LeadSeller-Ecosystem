// BFF: Proxies lead submissions to api.leadseller.com.br
// - Honeypot field check (anti-bot)
// - In-memory per-IP rate limiting (best-effort; resets on cold start)
// - Persists every lead to Supabase `leads` table (backup if upstream fails)
// - Structured logging
// - Zod validation

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { z } from "https://esm.sh/zod@3.23.8";

const UPSTREAM_URL = "https://api.leadseller.com.br/v1/public/leads";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Validation ───────────────────────────────────────────────────────────
const PayloadSchema = z.object({
  hp_field: z.string().max(0, "bot_detected").optional().default(""),
  rendered_at: z.number().int().nonnegative().optional(),
  lead: z.object({
    full_name: z.string().trim().min(2).max(100),
    corporate_email: z.string().trim().email().max(255),
    company: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(8).max(32).optional(),
  }),
  scheduling: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    timezone: z.string().max(64),
    timezone_label: z.string().max(8),
  }),
  locale: z.string().max(16).optional(),
  source: z.string().max(64).optional(),
});

// ── Rate limiter (in-memory, per instance) ───────────────────────────────
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const buckets = new Map<string, number[]>();

function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const arr = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - arr[0])) / 1000);
    return { ok: false, retryAfter };
  }
  arr.push(now);
  buckets.set(ip, arr);
  return { ok: true, retryAfter: 0 };
}

function log(level: "info" | "warn" | "error", event: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, service: "lead-proxy", event, ...data }));
}

async function persistLead(row: Record<string, unknown>, requestId: string) {
  try {
    const { error } = await admin.from("leads").insert(row);
    if (error) log("error", "persist_failed", { requestId, error: error.message });
    else log("info", "persisted", { requestId });
  } catch (e) {
    log("error", "persist_exception", { requestId, error: e instanceof Error ? e.message : String(e) });
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? req.headers.get("cf-connecting-ip") ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  const requestId = crypto.randomUUID();

  const rl = rateLimit(ip);
  if (!rl.ok) {
    log("warn", "rate_limited", { requestId, ip, retryAfter: rl.retryAfter });
    return new Response(JSON.stringify({ error: "rate_limited", retry_after: rl.retryAfter }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) },
    });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    log("warn", "invalid_json", { requestId, ip });
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    log("warn", "validation_failed", { requestId, ip, issues: parsed.error.flatten() });
    return new Response(JSON.stringify({ error: "validation_failed", details: parsed.error.flatten().fieldErrors }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (parsed.data.hp_field && parsed.data.hp_field.length > 0) {
    log("warn", "honeypot_triggered", { requestId, ip, ua });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (typeof parsed.data.rendered_at === "number") {
    const elapsed = Date.now() - parsed.data.rendered_at;
    if (elapsed < 1500) {
      log("warn", "timing_guard_triggered", { requestId, ip, elapsed });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const { hp_field: _hp, rendered_at: _rt, ...forward } = parsed.data;
  const upstreamPayload = {
    ...forward,
    metadata: {
      request_id: requestId,
      ip,
      user_agent: ua,
      received_at: new Date().toISOString(),
      proxy: "lovable-bff/1.0",
    },
  };

  log("info", "forwarding", { requestId, ip, email: forward.lead.corporate_email });

  // Build base row for persistence
  const baseRow = {
    request_id: requestId,
    full_name: forward.lead.full_name,
    corporate_email: forward.lead.corporate_email,
    company: forward.lead.company,
    phone: forward.lead.phone ?? null,
    scheduling_date: forward.scheduling.date,
    scheduling_time: forward.scheduling.time,
    scheduling_timezone: forward.scheduling.timezone,
    scheduling_timezone_label: forward.scheduling.timezone_label,
    locale: forward.locale ?? null,
    source: forward.source ?? null,
    ip,
    user_agent: ua,
    raw_payload: upstreamPayload,
  } as Record<string, unknown>;

  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Source": "leadseller.com.br",
        "X-Client-Version": "portal-1.0",
        "X-Request-ID": requestId,
        "X-Forwarded-For": ip,
      },
      body: JSON.stringify(upstreamPayload),
    });
    const text = await upstream.text();

    // Persist regardless of upstream success
    await persistLead(
      { ...baseRow, upstream_status: upstream.status, upstream_ok: upstream.ok, upstream_error: upstream.ok ? null : text.slice(0, 500) },
      requestId,
    );

    if (!upstream.ok) {
      log("error", "upstream_error", { requestId, status: upstream.status, body: text.slice(0, 500) });
      // We still acknowledge success to the user since the lead is safely stored
      return new Response(JSON.stringify({ ok: true, request_id: requestId, queued: true }), {
        status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    log("info", "forwarded_ok", { requestId, status: upstream.status });
    return new Response(JSON.stringify({ ok: true, request_id: requestId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("error", "upstream_unreachable", { requestId, error: msg });

    // Save as backup so the lead is never lost
    await persistLead(
      { ...baseRow, upstream_status: null, upstream_ok: false, upstream_error: msg.slice(0, 500) },
      requestId,
    );

    // Return success to user — we have their lead safe
    return new Response(JSON.stringify({ ok: true, request_id: requestId, queued: true }), {
      status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
