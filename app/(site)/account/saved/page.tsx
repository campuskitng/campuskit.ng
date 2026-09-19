import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UnsaveButton } from "./UnsaveButton";

export const revalidate = 0;

const TYPE_LABEL: Record<string, string> = {
  tool: "Tool",
  opportunity: "Opportunity",
  marketplace_item: "Marketplace",
  document_template: "Document",
  past_question: "Past question",
};

const TYPE_HREF: Record<string, (id: string) => string> = {
  tool: (id) => `/tools/${id}`,
  opportunity: (id) => `/opportunities/${id}`,
  marketplace_item: (id) => `/marketplace/${id}`,
  document_template: (id) => `/documents?type=${id}`,
  past_question: (id) => `/past-questions/${id}`,
};

export default async function SavedItemsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account/saved");

  const { data: items } = await supabase
    .from("saved_items")
    .select("id, item_type, item_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="shell max-w-2xl pb-16 pt-8 sm:pt-10">
      <header>
        <p className="eyebrow">Saved</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Saved items</h1>
        <p className="mt-2 text-body text-muted">Tools, opportunities, and listings you&apos;ve bookmarked.</p>
      </header>

      <div className="mt-6 space-y-2">
        {items && items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-card border border-hairline bg-surface p-4">
              <div>
                <p className="text-meta font-medium uppercase tracking-wide text-brand">{TYPE_LABEL[item.item_type] ?? item.item_type}</p>
                <Link href={TYPE_HREF[item.item_type]?.(item.item_id) ?? "#"} className="text-body font-medium text-ink hover:text-brand">
                  {item.item_id}
                </Link>
              </div>
              <UnsaveButton itemId={item.id} />
            </div>
          ))
        ) : (
          <p className="rounded-card border border-dashed border-hairline p-8 text-center text-label text-muted">
            Nothing saved yet. Look for the save icon around CampusKit.
          </p>
        )}
      </div>
    </div>
  );
}
