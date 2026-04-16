
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

export const createClient = (): SupabaseClient => {
  if (!client) {
    client = createBrowserClient(supabaseUrl!, supabaseKey!);
  }
  return client;
};

export const createIsolatedClient = (): SupabaseClient =>
  createBrowserClient(supabaseUrl!, supabaseKey!, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
      storageKey: 'ternium-create-user',
    },
  });
