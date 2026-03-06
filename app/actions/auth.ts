"use server";

import { createAdminClient } from "../../lib/supabaseAdmin";

export type EnsureUserPayload = {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
};

/** Upsert current user into public.users using service role so RLS cannot block it. */
export async function ensureUserRecord(payload: EnsureUserPayload): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("users").upsert(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        avatar_url: payload.avatar_url,
      },
      { onConflict: "id" }
    );
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message };
  }
}
