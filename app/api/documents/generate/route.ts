import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderDocumentPdf } from "@/lib/documents/render";
import { validateFieldValues } from "@/lib/documents/validate";

/**
 * Generates and returns a document as a downloadable PDF.
 *
 * - Free templates: anyone can generate; logged-in users get a history row.
 * - Paid templates: requires a verified purchase (a `document_purchases`
 *   row for this user + template). Never trusts a client-supplied "I paid"
 *   flag — the only way that row exists is a server-verified Paystack
 *   transaction (see /api/paystack/verify and /api/paystack/webhook).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const templateId = body?.templateId as string | undefined;
  const values = (body?.values ?? {}) as Record<string, string>;
  if (!templateId) return NextResponse.json({ error: "templateId is required." }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: template, error: templateError } = await supabase
    .from("document_templates")
    .select("id, name, use_case, doc_group, price, is_free, fields, preview, layout, status")
    .eq("id", templateId)
    .maybeSingle();

  if (templateError || !template || template.status !== "published") {
    return NextResponse.json({ error: "Document template not found." }, { status: 404 });
  }

  if (!template.fields) {
    return NextResponse.json({ error: "This document's form is not open yet." }, { status: 400 });
  }

  const missing = validateFieldValues(template.fields, values);
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  if (!template.is_free && template.price > 0) {
    if (!user) return NextResponse.json({ error: "Sign in to download this document." }, { status: 401 });

    const { data: purchase } = await admin
      .from("document_purchases")
      .select("id, payment_id")
      .eq("user_id", user.id)
      .eq("template_id", templateId)
      .not("payment_id", "is", null)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (!purchase) {
      return NextResponse.json({ error: "Payment required before this document can be generated.", requiresPayment: true }, { status: 402 });
    }

    // Refresh stored field values so re-downloads reflect the latest edit.
    await admin.from("document_purchases").update({ field_values: values }).eq("id", purchase.id);
  } else if (user) {
    // Free + logged in: keep a lightweight history row (no payment_id).
    await admin
      .from("document_purchases")
      .insert({ user_id: user.id, template_id: templateId, field_values: values, payment_id: null });
  }

  const pdfBytes = await renderDocumentPdf(template as any, values);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${template.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
