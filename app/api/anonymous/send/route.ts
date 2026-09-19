import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/settings-actions";
import {
  getSenderFingerprint,
  MESSAGE_MAX_CHARS,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  SEND_LIMIT_PER_RECIPIENT_PER_HOUR,
  SEND_LIMIT_TOTAL_PER_HOUR,
} from "@/lib/anonymous";

/**
 * Sends an anonymous message. Runs entirely server-side with the
 * service-role client — `anonymous_messages` has no client insert policy on
 * purpose, so validation and rate limiting here are the only gate.
 */
export async function POST(request: Request) {
  const settings = await getSiteSettings();
  if (!settings.anonymous_messaging_enabled) {
    return NextResponse.json({ error: "Anonymous messaging is temporarily disabled." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  const recipientUsername = String(form.get("username") ?? "").trim().toLowerCase();
  const body = String(form.get("body") ?? "").trim();
  const image = form.get("image");

  if (!recipientUsername) return NextResponse.json({ error: "Missing recipient." }, { status: 400 });
  if (!body && !(image instanceof File)) {
    return NextResponse.json({ error: "Write something or attach an image." }, { status: 400 });
  }
  if (body.length > MESSAGE_MAX_CHARS) {
    return NextResponse.json({ error: `Message must be ${MESSAGE_MAX_CHARS} characters or fewer.` }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: recipient } = await admin
    .from("profiles")
    .select("id, anonymous_enabled")
    .eq("username", recipientUsername)
    .maybeSingle();
  if (!recipient || !recipient.anonymous_enabled) {
    return NextResponse.json({ error: "This link isn't accepting messages." }, { status: 404 });
  }

  const fingerprint = getSenderFingerprint();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [{ count: toRecipientCount }, { count: totalCount }] = await Promise.all([
    admin
      .from("anonymous_messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_fingerprint", fingerprint)
      .eq("recipient_id", recipient.id)
      .gte("created_at", oneHourAgo),
    admin
      .from("anonymous_messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_fingerprint", fingerprint)
      .gte("created_at", oneHourAgo),
  ]);

  if ((toRecipientCount ?? 0) >= SEND_LIMIT_PER_RECIPIENT_PER_HOUR || (totalCount ?? 0) >= SEND_LIMIT_TOTAL_PER_HOUR) {
    return NextResponse.json({ error: "You're sending messages too quickly. Try again later." }, { status: 429 });
  }

  let imagePath: string | null = null;
  if (image instanceof File && image.size > 0) {
    if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json({ error: "That file type is not supported. Use JPG, PNG or WebP." }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "That image is over 5MB." }, { status: 400 });
    }
    const ext = image.type.split("/")[1] ?? "jpg";
    const path = `${recipient.id}/${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await image.arrayBuffer());
    const { error: uploadError } = await admin.storage.from("anonymous-images").upload(path, bytes, {
      contentType: image.type,
      upsert: false,
    });
    if (uploadError) return NextResponse.json({ error: "Could not upload image." }, { status: 500 });
    imagePath = path;
  }

  const { error: insertError } = await admin.from("anonymous_messages").insert({
    recipient_id: recipient.id,
    body,
    image_path: imagePath,
    sender_fingerprint: fingerprint,
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
