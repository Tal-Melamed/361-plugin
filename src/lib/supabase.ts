import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Env is injected by Lovable / Vite as VITE_*. When Supabase isn't connected
// yet, both are undefined and the app shows a setup screen instead of crashing.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
