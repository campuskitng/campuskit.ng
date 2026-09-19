import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EditMarketplaceItemForm } from "./EditMarketplaceItemForm";

export const revalidate = 0;

export default async function EditMarketplaceItemPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: item } = await supabase.from("marketplace_items").select("*").eq("id", params.id).maybeSingle();
  if (!item) notFound();

  return (
    <div className="max-w-lg">
      <Link href="/admin/marketplace" className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Marketplace
      </Link>
      <h1 className="mt-4 text-section font-semibold text-ink">Edit listing</h1>
      <EditMarketplaceItemForm item={item} />
    </div>
  );
}
