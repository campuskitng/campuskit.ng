import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Expires normal (non-reported) anonymous messages past their 24h window.
 * Reported messages are untouched — protect_reported_messages() already
 * flipped them to 'reported' on report insert, and expire_anonymous_
 * messages() (SQL) only touches rows still in 'active'.
 *
 * Not on the public internet by default: protect it with a shared secret.
 * Configure CRON_SECRET in your env and call this with either:
 *   Authorization: Bearer <CRON_SECRET>   (Vercel Cron sets this automatically
 *   from the same env var when you add a Cron Job pointing here)
 * or a `?secret=<CRON_SECRET>` query param for cron providers that can't set headers.
 *
 * Schedule: once an hour is plenty for a 24h expiry window. Alternatively,
 * skip this route entirely and schedule `select public.expire_anonymous_
 * messages();` directly via Supabase pg_cron if it's enabled on your plan.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(request.url);
    const header = request.headers.get("authorization");
    const provided = header?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc("expire_anonymous_messages");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}
