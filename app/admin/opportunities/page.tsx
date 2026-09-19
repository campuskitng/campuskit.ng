import { StatusPill } from "@/components/admin/StatusPill";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteOpportunityAction } from "@/lib/admin-actions";
import { NewOpportunityForm } from "./NewOpportunityForm";
import Link from "next/link";
import { Pencil } from "lucide-react";

export const revalidate = 0;

export default async function AdminOpportunitiesPage() {
  const supabase = createSupabaseServerClient();
  const { data: opportunities } = await supabase.from("opportunities").select("*").order("deadline");

  return (
    <div className="max-w-4xl">
      <h1 className="text-section font-semibold text-ink">Opportunities</h1>
      <p className="mt-1 text-label text-muted">{opportunities?.length ?? 0} live listings.</p>

      <NewOpportunityForm />

      <div className="mt-8 overflow-x-auto rounded-card border border-hairline bg-surface">
        <table className="w-full min-w-[640px] text-left text-label">
          <thead>
            <tr className="border-b border-hairline text-meta text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Title</th>
              <th scope="col" className="px-4 py-3 font-medium">Category</th>
              <th scope="col" className="px-4 py-3 font-medium">Deadline</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {(opportunities ?? []).map((op) => (
              <tr key={op.id} className="transition-colors hover:bg-canvas">
                <td className="px-4 py-3">
                  <p className="text-ink">{op.title}</p>
                  <p className="text-meta text-muted">{op.organization}</p>
                </td>
                <td className="px-4 py-3 text-muted">{op.category}</td>
                <td className="px-4 py-3 text-muted">{op.deadline}</td>
                <td className="px-4 py-3"><StatusPill status={op.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/opportunities/${op.id}/edit`} aria-label={`Edit ${op.title}`} className="rounded-control p-1.5 text-muted hover:bg-canvas hover:text-ink">
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <DeleteButton id={op.id} onDelete={deleteOpportunityAction} label="opportunity" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
