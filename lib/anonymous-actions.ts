"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ANONYMOUS_CARD_THEMES, ANONYMOUS_REPORT_REASONS, type AnonymousCardTheme } from "@/lib/types";

// RLS ("Recipients update/delete own messages") is the real gate here — the
// server client is scoped to the caller's session, so these can't touch
// another user's inbox even if someone tampers with the messageId.

export async function deleteMessageAction(messageId: string) {
  const supabase = createSupabaseServerClient();
  await supabase.from("anonymous_messages").delete().eq("id", messageId);
  revalidatePath("/account/anonymous");
}

export async function replyAction(_prev: unknown, formData: FormData) {
  const messageId = String(formData.get("messageId") ?? "");
  const reply = String(formData.get("reply") ?? "").trim().slice(0, 500);
  if (!messageId || !reply) return { error: "Write a reply first." };
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("anonymous_messages")
    .update({ reply_body: reply, replied_at: new Date().toISOString() })
    .eq("id", messageId);
  if (error) return { error: error.message };
  revalidatePath("/account/anonymous");
  revalidatePath(`/account/anonymous/${messageId}`);
  return { success: true, reply };
}

const VALID_REASONS = new Set(ANONYMOUS_REPORT_REASONS.map((r) => r.value));

/**
 * `reason` must be one of the structured categories (brief section 1) —
 * `reasonDetail` is only meaningful (and only shown in the UI) when reason
 * is "other", but is accepted regardless and simply ignored by the DB
 * column being null otherwise.
 */
export async function reportMessageAction(messageId: string, reason: string, reasonDetail?: string) {
  if (!VALID_REASONS.has(reason as (typeof ANONYMOUS_REPORT_REASONS)[number]["value"])) {
    return { error: "Choose a valid reason." };
  }

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const { getSenderFingerprint, REPORT_LIMIT_PER_HOUR } = await import("@/lib/anonymous");
  const admin = createSupabaseAdminClient();

  const fingerprint = getSenderFingerprint();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("anonymous_reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_fingerprint", fingerprint)
    .gte("created_at", oneHourAgo);
  if ((count ?? 0) >= REPORT_LIMIT_PER_HOUR) return { error: "Too many reports submitted. Try again later." };

  const { error } = await admin.from("anonymous_reports").insert({
    message_id: messageId,
    reason,
    reason_detail: reason === "other" ? (reasonDetail?.trim().slice(0, 300) || null) : null,
    reporter_fingerprint: fingerprint,
  });
  if (error) return { error: error.message };
  revalidatePath("/account/anonymous");
  return { ok: true };
}

export async function setCardThemeAction(messageId: string, theme: AnonymousCardTheme) {
  if (!ANONYMOUS_CARD_THEMES.includes(theme)) return { error: "Invalid theme." };
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("anonymous_messages").update({ card_theme: theme }).eq("id", messageId);
  if (error) return { error: error.message };
  revalidatePath("/account/anonymous");
  return { ok: true };
}
