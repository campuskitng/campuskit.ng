import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSenderFingerprint, REPORT_LIMIT_PER_HOUR } from "@/lib/anonymous";
import { ANONYMOUS_REPORT_REASONS } from "@/lib/types";

const VALID_REASONS = new Set(ANONYMOUS_REPORT_REASONS.map((r) => r.value));

/**
 * Anyone who can see a message's link/id can report it (e.g. the recipient,
 * or an admin reviewing shared content) — reporting doesn't require being
 * the recipient. Reported messages are flagged (not deleted) so admins can
 * review; a single report never auto-bans anyone.
 *
 * Not currently called from the UI (the account inbox uses the
 * reportMessageAction server action instead) — kept available/consistent
 * for any future public-facing report entry point.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const messageId = body?.messageId as string | undefined;
  const reason = String(body?.reason ?? "").trim();
  const reasonDetail = String(body?.reasonDetail ?? "").trim().slice(0, 300);
  if (!messageId || !VALID_REASONS.has(reason as (typeof ANONYMOUS_REPORT_REASONS)[number]["value"])) {
    return NextResponse.json({ error: "messageId and a valid reason are required." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: message } = await admin.from("anonymous_messages").select("id").eq("id", messageId).maybeSingle();
  if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });

  const fingerprint = getSenderFingerprint();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("anonymous_reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_fingerprint", fingerprint)
    .gte("created_at", oneHourAgo);
  if ((count ?? 0) >= REPORT_LIMIT_PER_HOUR) {
    return NextResponse.json({ error: "Too many reports submitted. Try again later." }, { status: 429 });
  }

  const { error } = await admin.from("anonymous_reports").insert({
    message_id: messageId,
    reason,
    reason_detail: reason === "other" ? (reasonDetail || null) : null,
    reporter_fingerprint: fingerprint,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
