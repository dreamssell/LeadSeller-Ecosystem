// LGPD-compliant consent store. Categories: essential (always on), analytics, marketing.
// Persisted in localStorage; broadcasts changes via window event for listeners.

export type ConsentCategory = "essential" | "analytics" | "marketing";

export interface ConsentState {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string | null;
  version: number;
}

const STORAGE_KEY = "leadseller_lgpd_consent_v2";
const LEGACY_KEY = "leadseller_lgpd_consent";
const VERSION = 2;
export const CONSENT_EVENT = "leadseller:consent-changed";

const DEFAULT: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  decidedAt: null,
  version: VERSION,
};

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ConsentState;
      return { ...DEFAULT, ...parsed, essential: true, version: VERSION };
    }
    // Migrate legacy banner choice
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === "accepted") {
      const migrated: ConsentState = { ...DEFAULT, analytics: true, marketing: true, decidedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    if (legacy === "essential") {
      const migrated: ConsentState = { ...DEFAULT, decidedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch { /* ignore */ }
  return DEFAULT;
}

export function hasDecided(): boolean {
  return getConsent().decidedAt !== null;
}

export function setConsent(partial: Partial<Pick<ConsentState, "analytics" | "marketing">>) {
  const next: ConsentState = {
    ...getConsent(),
    ...partial,
    essential: true,
    decidedAt: new Date().toISOString(),
    version: VERSION,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
  return next;
}

export function acceptAll() {
  return setConsent({ analytics: true, marketing: true });
}

export function rejectNonEssential() {
  return setConsent({ analytics: false, marketing: false });
}

export function onConsentChange(cb: (state: ConsentState) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<ConsentState>).detail);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

// Open the preferences modal from anywhere
export const OPEN_PREFERENCES_EVENT = "leadseller:open-preferences";
export function openPreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}
