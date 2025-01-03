import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const supabaseConfig: SupabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

export const supabaseFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${SUPABASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro na requisição');
  }

  return response.json();
};