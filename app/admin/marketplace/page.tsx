import { StatusPill } from "@/components/admin/StatusPill";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteMarketplaceItemAction } from "@/lib/admin-actions";
import { formatNaira } from "@/data/marketplace";
import { NewMarketplaceItemForm } from "./NewMarketplaceItemForm";
import Link from "next/link";
import { Pencil } from "lucide-react";

export const revalidate = 0;

export default async function AdminMarketplacePage() {
  const supabase = createSupabaseServerClient();
  const { data: items } = await supabase.from("marketplace_items").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <h1 className="text-section font-semibold text-ink">Marketplace</h1>
      <p className="mt-1 text-label text-muted">{items?.length ?? 0} listings. CampusKit controls all marketplace content.</p>

      <NewMarketplaceItemForm />

      <div className="mt-8 overflow-x-auto rounded-card border border-hairline bg-surface">
        <table className="w-full min-w-[560px] text-left text-label">
          <thead>
            <tr className="border-b border-hairline text-meta text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Item</th>
              <th scope="col" className="px-4 py-3 font-medium">Price</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {(items ?? []).map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-canvas">
                <td className="px-4 py-3 text-ink">{item.title}</td>
                <td className="px-4 py-3 text-ink">{formatNaira(item.price)}</td>
                <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/marketplace/${item.id}/edit`} aria-label={`Edit ${item.title}`} className="rounded-control p-1.5 text-muted hover:bg-canvas hover:text-ink">
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <DeleteButton id={item.id} onDelete={deleteMarketplaceItemAction} label="listing" />
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
