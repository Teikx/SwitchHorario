import { createClient, SupabaseClient } from '@supabase/supabase-js';

let runtimeUrl: string | null = null;
let runtimeKey: string | null = null;

function cleanString(str?: string | null): string {
  if (!str) return '';
  return str.trim().replace(/^["']|["']$/g, '');
}

export function getSupabaseUrl(): string {
  if (runtimeUrl) return runtimeUrl;
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  let cleaned = cleanString(raw);
  if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export function getSupabaseAnonKey(): string {
  if (runtimeKey) return runtimeKey;
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return cleanString(raw);
}

export function setRuntimeConfig(url: string, key: string) {
  const cUrl = cleanString(url);
  const cKey = cleanString(key);
  if (cUrl && cKey) {
    runtimeUrl = cUrl.startsWith('http') ? cUrl : `https://${cUrl}`;
    runtimeKey = cKey;
    supabaseInstance = null; // Reiniciar instancia con las nuevas credenciales
  }
}

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    url.startsWith('https://')
  );
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
};
