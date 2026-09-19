import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS entirely — this is how CampusKit
 * enforces "no writes from the frontend" for payments, anonymous message
 * inserts, and admin mutations: those code paths run on the server and use
 * this client instead of relying on a client-side insert policy.
 *
 * `server-only` makes any accidental import from a Client Component fail
 * the build instead of leaking the service key into a browser bundle.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL). Set it in .env.local — never expose it to the client.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
