// Plausible loader — gated by analytics consent. Idempotent.
// Configure domain via VITE_PLAUSIBLE_DOMAIN (defaults to leadseller.com.br).

import { getConsent, onConsentChange } from "./consent";

const SCRIPT_ID = "plausible-analytics";
const DOMAIN = (import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined) ?? "leadseller.com.br";

declare global {
  interface Window {
    plausible?: ((event: string, opts?: { props?: Record<string, unknown> }) => void) & { q?: unknown[] };
  }
}

function loadPlausible() {
  if (document.getElementById(SCRIPT_ID)) return;
  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.defer = true;
  s.dataset.domain = DOMAIN;
  s.src = "https://plausible.io/js/script.js";
  document.head.appendChild(s);
  // Stub queue so events fired before script loads aren't lost
  window.plausible = window.plausible || function (...args: unknown[]) {
    (window.plausible!.q = window.plausible!.q || []).push(args);
  } as typeof window.plausible;
}

function unloadPlausible() {
  document.getElementById(SCRIPT_ID)?.remove();
  delete window.plausible;
}

export function initAnalytics() {
  const apply = () => (getConsent().analytics ? loadPlausible() : unloadPlausible());
  apply();
  onConsentChange(apply);
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!getConsent().analytics) return;
  window.plausible?.(event, props ? { props } : undefined);
}
