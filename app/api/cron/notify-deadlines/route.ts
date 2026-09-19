import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Notifies students who saved an opportunity that its deadline is within
 * the next 3 days. Real-event-only (brief section 7/10): only opportunities
 * that exist, only students who actually saved them, and each user is
 * notified at most once per opportunity (checked against `notifications.link`
 * before inserting) so this is safe to run repeatedly.
 *
 * Same auth pattern as /api/cron/expire-anonymous — protect with CRON_SECRET
 * in production. Suggested schedule: once a day.
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
  const now = new Date();
  const threeDaysOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const { data: closingSoon, error: opportunitiesError } = await admin
    .from("opportunities")
    .select("id, title, deadline")
    .eq("status", "published")
    .gte("deadline", now.toISOString().slice(0, 10))
    .lte("deadline", threeDaysOut.toISOString().slice(0, 10));
  if (opportunitiesError) return NextResponse.json({ error: opportunitiesError.message }, { status: 500 });
  if (!closingSoon || closingSoon.length === 0) return NextResponse.json({ ok: true, notified: 0 });

  let notified = 0;
  for (const opportunity of closingSoon) {
    const link = `/opportunities/${opportunity.id}`;

    const { data: savers } = await admin
      .from("saved_items")
      .select("user_id")
      .eq("item_type", "opportunity")
      .eq("item_id", opportunity.id);
    if (!savers || savers.length === 0) continue;

    // Dedupe: skip anyone already notified about this exact opportunity in
    // the last 7 days (covers repeated daily cron runs within the window).
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: alreadyNotified } = await admin
      .from("notifications")
      .select("user_id")
      .eq("link", link)
      .gte("created_at", sevenDaysAgo);
    const alreadyNotifiedIds = new Set((alreadyNotified ?? []).map((n) => n.user_id));

    const toNotify = savers.map((s) => s.user_id).filter((id) => !alreadyNotifiedIds.has(id));
    if (toNotify.length === 0) continue;

    const rows = toNotify.map((userId) => ({
      user_id: userId,
      type: "opportunity_deadline" as const,
      title: "Opportunity closing soon",
      body: `${opportunity.title} closes on ${new Date(opportunity.deadline).toLocaleDateString()}.`,
      link,
    }));
    const { error: insertError } = await admin.from("notifications").insert(rows);
    if (!insertError) notified += rows.length;
  }

  return NextResponse.json({ ok: true, notified, ranAt: new Date().toISOString() });
}
