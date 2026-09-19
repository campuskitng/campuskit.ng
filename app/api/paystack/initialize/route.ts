import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction } from "@/lib/paystack";
import { validateFieldValues } from "@/lib/documents/validate";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const templateId = body?.templateId as string | undefined;
  const values = (body?.values ?? {}) as Record<string, string>;
  if (!templateId) return NextResponse.json({ error: "templateId is required." }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Sign in to pay for this document." }, { status: 401 });

  const { data: template } = await supabase
    .from("document_templates")
    .select("id, price, is_free, fields, status")
    .eq("id", templateId)
    .maybeSingle();

  if (!template || template.status !== "published") {
    return NextResponse.json({ error: "Document template not found." }, { status: 404 });
  }
  if (template.is_free || template.price <= 0) {
    return NextResponse.json({ error: "This document is free — no payment needed." }, { status: 400 });
  }

  const missing = validateFieldValues(template.fields, values);
  if (missing.length > 0) {
    return NextResponse.json({ error: `Fill in all required fields first: ${missing.join(", ")}` }, { status: 400 });
  }

  const reference = `doc_${templateId}_${randomUUID()}`;
  const amountKobo = template.price * 100;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const admin = createSupabaseAdminClient();
  const { error: insertError } = await admin.from("payments").insert({
    user_id: user.id,
    reference,
    purpose: "document_template",
    product_id: templateId,
    amount_kobo: amountKobo,
    status: "pending",
    metadata: { values },
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const init = await initializeTransaction({
    email: user.email,
    amountKobo,
    reference,
    callbackUrl: `${siteUrl}/documents/payment/callback`,
    metadata: { templateId, userId: user.id },
  });

  if (!init.status || !init.data) {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return NextResponse.json({ error: init.message || "Could not start payment." }, { status: 502 });
  }

  return NextResponse.json({ authorizationUrl: init.data.authorization_url, reference });
}
