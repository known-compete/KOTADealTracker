import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing Supabase server env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only)."
  );
}

/** Server-only Supabase client with service role. Bypasses RLS. Use only in server actions/API routes. */
export function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey);
}
