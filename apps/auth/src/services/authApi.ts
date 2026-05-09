const API_BASE = 'https://gcjaeoxjhcfeispehmga.supabase.co/functions/v1';
const API_KEY = 'ls_test_LeadSeller2026ProdAuthKey01abc';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

export interface VerifyEmailResponse {
  exists: boolean;
  name?: string;
  user?: {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    role_label: string;
  };
  error?: string;
}

export interface AuthenticateResponse {
  success?: boolean;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  token?: string;
  redirectUrl?: string;
  error?: string;
}

export type LogEventType = 'verify_attempt' | 'verify_success' | 'verify_fail' | 'login_attempt' | 'login_success' | 'login_fail';

export interface AccessLog {
  event: LogEventType;
  email: string;
  timestamp: string;
  ip?: string;
  userAgent: string;
  result: 'success' | 'error';
  errorMessage?: string;
}

async function getClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

let cachedIp: string | null = null;

export async function getIp(): Promise<string> {
  if (!cachedIp) {
    cachedIp = await getClientIp();
  }
  return cachedIp;
}

export async function sendAccessLog(log: Omit<AccessLog, 'timestamp' | 'userAgent' | 'ip'>): Promise<void> {
  const ip = await getIp();
  const payload: AccessLog = {
    ...log,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ip,
  };

  // Fire-and-forget: don't block the UI
  fetch(`${API_BASE}/access-logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silently fail — logging should never break the auth flow
  });
}

export async function verifyEmail(email: string): Promise<VerifyEmailResponse> {
  await sendAccessLog({ event: 'verify_attempt', email, result: 'success' });

  const res = await fetch(`${API_BASE}/verify-email`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, api_key: API_KEY }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errorMsg = data.error || 'Erro ao verificar identidade.';
    await sendAccessLog({ event: 'verify_fail', email, result: 'error', errorMessage: errorMsg });
    throw new Error(errorMsg);
  }

  const data = await res.json();

  if (!data.exists) {
    await sendAccessLog({ event: 'verify_fail', email, result: 'error', errorMessage: 'Usuário não encontrado.' });
  } else {
    await sendAccessLog({ event: 'verify_success', email, result: 'success' });
  }

  return data;
}

export async function authenticate(email: string, password: string): Promise<AuthenticateResponse> {
  await sendAccessLog({ event: 'login_attempt', email, result: 'success' });

  const res = await fetch(`${API_BASE}/authenticate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password, api_key: API_KEY }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errorMsg = data.error || 'Falha na autenticação.';
    await sendAccessLog({ event: 'login_fail', email, result: 'error', errorMessage: errorMsg });
    throw new Error(errorMsg);
  }

  const data = await res.json();
  await sendAccessLog({ event: 'login_success', email, result: 'success' });
  return data;
}
