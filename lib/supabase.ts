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
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';
  return cleanString(raw);
}

export function setRuntimeConfig(url: string, key: string) {
  const cUrl = cleanString(url);
  const cKey = cleanString(key);
  if (cUrl && cKey) {
    const formattedUrl = cUrl.startsWith('http') ? cUrl : `https://${cUrl}`;
    if (runtimeUrl !== formattedUrl || runtimeKey !== cKey) {
      runtimeUrl = formattedUrl;
      runtimeKey = cKey;
      supabaseInstance = null; // Reiniciar instancia con las nuevas credenciales
    }
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
    // Interceptor global para compatibilidad con las nuevas API keys de Supabase (sb_publishable_ / sb_secret_)
    // Supabase JS añade por defecto el encabezado 'Authorization: Bearer <key>'.
    // PostgREST requiere que 'Authorization' sea un JWT válido. Como las nuevas claves sb_ son opacas (no JWT),
    // PostgREST rechaza la petición con HTTP 401 Unauthorized si se envía en el encabezado Authorization.
    // Al remover el encabezado Authorization cuando la clave es sb_, PostgREST lee el encabezado 'apikey: sb_...'
    // y autentica la consulta correctamente.
    const customFetch: typeof fetch = (fetchUrl, options = {}) => {
      const headers = new Headers(options.headers);
      const auth = headers.get('Authorization') || headers.get('authorization');
      if (auth && (auth.includes('Bearer sb_') || auth.includes('bearer sb_'))) {
        headers.delete('Authorization');
        headers.delete('authorization');
      }
      return fetch(fetchUrl, { ...options, headers });
    };

    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: customFetch,
      },
    });
  }

  return supabaseInstance;
};
