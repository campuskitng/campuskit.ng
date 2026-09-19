import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AccountDocumentsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account/documents");

  const { data: purchases } = await supabase
    .from("document_purchases")
    .select("id, template_id, payment_id, created_at, document_templates(name, doc_group)")
    .order("created_at", { ascending: false });

  return (
    <div className="shell max-w-2xl pb-16 pt-8 sm:pt-10">
      <header>
        <p className="eyebrow">Documents</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Your documents</h1>
        <p className="mt-2 text-body text-muted">Every document you&apos;ve generated, free or paid, redownloadable anytime.</p>
      </header>

      <div className="mt-6 space-y-3">
        {purchases && purchases.length > 0 ? (
          purchases.map((purchase) => {
            const template = purchase.document_templates as unknown as { name: string; doc_group: string } | null;
            return (
              <div key={purchase.id} className="flex items-center justify-between gap-4 rounded-card border border-hairline bg-surface p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-700">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-body font-medium text-ink">{template?.name ?? purchase.template_id}</p>
                    <p className="text-meta text-muted">
                      {purchase.payment_id ? "Paid" : "Free"} · {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a href={`/api/documents/download?purchaseId=${purchase.id}`} className="shrink-0 inline-flex items-center gap-1.5 rounded-control border border-hairline bg-canvas px-3 py-1.5 text-label font-medium text-ink hover:border-brand/40">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </a>
              </div>
            );
          })
        ) : (
          <p className="rounded-card border border-dashed border-hairline p-8 text-center text-label text-muted">
            No documents yet.{" "}
            <Link href="/documents" className="font-medium text-brand hover:text-brand-700">
              Generate one
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
