import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Issues a short-lived signed URL for a private anonymous-message image.
 * Ownership check happens via the normal RLS-scoped server client (only the
 * recipient or an admin can SELECT the message row); the admin client is
 * only used afterwards to mint the signed URL from the private bucket.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const messageId = url.searchParams.get("messageId");
  if (!messageId) return NextResponse.json({ error: "messageId is required." }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data: message } = await supabase
    .from("anonymous_messages")
    .select("image_path")
    .eq("id", messageId)
    .single();
  if (!message?.image_path) return NextResponse.json({ error: "No image." }, { status: 404 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("anonymous-images").createSignedUrl(message.image_path, 60 * 5);
  if (error || !data) return NextResponse.json({ error: "Could not load image." }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
