import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Past questions are CampusKit-controlled content in a private bucket
 * (metadata is public, files are not) — this issues a short-lived signed
 * URL and tracks a download count. No auth required to download, matching
 * the product brief ("users can browse, search, filter, download").
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const admin = createSupabaseAdminClient();

  const { data: question } = await admin
    .from("past_questions")
    .select("id, file_path, status, download_count")
    .eq("id", params.id)
    .maybeSingle();

  if (!question || question.status !== "published") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: signed, error } = await admin.storage.from("past-questions").createSignedUrl(question.file_path, 60 * 5);
  if (error || !signed) {
    return NextResponse.json({ error: "That file hasn't been uploaded yet." }, { status: 404 });
  }

  await admin.from("past_questions").update({ download_count: (question.download_count ?? 0) + 1 }).eq("id", params.id);

  return NextResponse.json({ url: signed.signedUrl });
}
