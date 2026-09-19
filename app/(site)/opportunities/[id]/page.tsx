import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deadlineLabel } from "@/data/opportunities";
import { getOpportunityById } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isItemSaved } from "@/lib/saved-actions";
import { SaveButton } from "@/components/SaveButton";

export const revalidate = 0;

export default async function OpportunityPage({ params }: { params: { id: string } }) {
  const item = await getOpportunityById(params.id);
  if (!item) {
    notFound();
    return null;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const saved = await isItemSaved("opportunity", params.id);

  const details = [
    { label: "Organisation", value: item.organization },
    { label: "Category", value: item.category },
    { label: "Deadline", value: deadlineLabel(item.deadline) },
    { label: "Eligibility", value: item.eligibility ?? "Not stated" },
    { label: "Location", value: item.location ?? "Not stated" },
  ];

  return (
    <div className="shell max-w-2xl pb-16 pt-8 sm:pt-10">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All opportunities
      </Link>

      <h1 className="mt-5 text-display font-semibold tracking-tight text-ink">{item.title}</h1>
      <div className="mt-3">
        <SaveButton itemType="opportunity" itemId={params.id} initialSaved={saved} isAuthenticated={!!user} />
      </div>

      <dl className="mt-7 divide-y divide-hairline border-y border-hairline text-label">
        {details.map((detail) => (
          <div key={detail.label} className="flex gap-4 py-3">
            <dt className="w-1/3 shrink-0 text-muted">{detail.label}</dt>
            <dd className="min-w-0 flex-1 text-ink">{detail.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-label text-muted">
        Full application details and the apply link arrive with the opportunities database.
      </p>
      <Button className="mt-4" disabled>
        Apply
      </Button>
    </div>
  );
}
