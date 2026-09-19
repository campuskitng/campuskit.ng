import { StatusPill } from "@/components/admin/StatusPill";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toggleDocumentStatusAction } from "@/lib/admin-actions";
import { formatNaira } from "@/data/marketplace";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 0;

export default async function AdminDocumentsPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: templates }, { data: payments }] = await Promise.all([
    supabase.from("document_templates").select("*").order("name"),
    supabase
      .from("payments")
      .select("id, product_id, amount_kobo, status, created_at, profiles(display_name)")
      .eq("purpose", "document_template")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-section font-semibold text-ink">Documents</h1>
          <p className="mt-1 text-label text-muted">{templates?.length ?? 0} templates in the catalogue.</p>
        </div>
        <ButtonLink href="/admin/documents/new" size="sm">
          <Plus className="h-4 w-4" aria-hidden="true" /> New template
        </ButtonLink>
      </div>

      <section aria-labelledby="templates-heading" className="mt-6">
        <h2 id="templates-heading" className="text-title font-semibold text-ink">Templates</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-hairline bg-surface">
          <table className="w-full min-w-[560px] text-left text-label">
            <thead>
              <tr className="border-b border-hairline text-meta text-muted">
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Group</th>
                <th scope="col" className="px-4 py-3 font-medium">Price</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {(templates ?? []).map((template) => (
                <tr key={template.id} className="transition-colors hover:bg-canvas">
                  <td className="px-4 py-3">
                    <p className="text-ink">{template.name}</p>
                    <p className="text-meta text-muted">{template.use_case}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{template.doc_group}</td>
                  <td className="px-4 py-3 text-ink">{template.is_free ? "Free" : formatNaira(template.price)}</td>
                  <td className="px-4 py-3"><StatusToggle id={template.id} status={template.status} onToggle={toggleDocumentStatusAction} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/documents/${template.id}/edit`} aria-label={`Edit ${template.name}`} className="inline-flex rounded-control p-1.5 text-muted hover:bg-canvas hover:text-ink">
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="orders-heading" className="mt-8">
        <h2 id="orders-heading" className="text-title font-semibold text-ink">Recent payments</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-hairline bg-surface">
          <table className="w-full min-w-[560px] text-left text-label">
            <thead>
              <tr className="border-b border-hairline text-meta text-muted">
                <th scope="col" className="px-4 py-3 font-medium">Document</th>
                <th scope="col" className="px-4 py-3 font-medium">Buyer</th>
                <th scope="col" className="px-4 py-3 font-medium">Amount</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {(payments ?? []).map((order) => {
                const buyer = order.profiles as unknown as { display_name: string } | null;
                return (
                  <tr key={order.id} className="transition-colors hover:bg-canvas">
                    <td className="px-4 py-3 text-ink">{order.product_id}</td>
                    <td className="px-4 py-3 text-muted">{buyer?.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-ink">{formatNaira(order.amount_kobo / 100)}</td>
                    <td className="px-4 py-3"><StatusPill status={order.status} /></td>
                    <td className="px-4 py-3 text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {(!payments || payments.length === 0) ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">No payments yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
