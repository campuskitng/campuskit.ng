import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { renderDocumentPdf } from "@/lib/documents/render";

/**
 * Re-downloads a previously generated document from account history.
 * RLS on document_purchases already restricts SELECT to the owner, so the
 * ownership check here is a query, not a manual auth.uid() comparison.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const purchaseId = url.searchParams.get("purchaseId");
  if (!purchaseId) return NextResponse.json({ error: "purchaseId is required." }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data: purchase, error } = await supabase
    .from("document_purchases")
    .select("id, template_id, field_values, document_templates(name, preview)")
    .eq("id", purchaseId)
    .single();

  if (error || !purchase) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const template = purchase.document_templates as unknown as { name: string; preview: any };
  const pdfBytes = await renderDocumentPdf(template, purchase.field_values as Record<string, string>);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${purchase.template_id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
