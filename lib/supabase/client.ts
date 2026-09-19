"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client for Client Components. Talks to Supabase with the anon key
 * and the signed-in user's session cookie — every read/write it makes is
 * still subject to RLS.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}

// Kept for the existing public-content read call sites (data/queries.ts) —
// same client, just a shared singleton so we don't create one per call.
export const supabase = createSupabaseBrowserClient();
