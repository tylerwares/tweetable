import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

let cachedClient: SupabaseClient | null = null;

const createSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('Supabase environment variables are not configured yet.');
    return null;
  }

  return createClient(url, anonKey);
};

export const getSupabaseBrowserClient = (): SupabaseClient | null => {
  if (!cachedClient) {
    cachedClient = createSupabaseClient();
  }

  return cachedClient;
};

export const useSupabase = (): SupabaseClient | null => useMemo(getSupabaseBrowserClient, []);
