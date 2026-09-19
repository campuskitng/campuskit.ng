import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EditOpportunityForm } from "./EditOpportunityForm";

export const revalidate = 0;

export default async function EditOpportunityPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: opportunity } = await supabase.from("opportunities").select("*").eq("id", params.id).maybeSingle();
  if (!opportunity) notFound();

  return (
    <div className="max-w-lg">
      <Link href="/admin/opportunities" className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Opportunities
      </Link>
      <h1 className="mt-4 text-section font-semibold text-ink">Edit opportunity</h1>
      <EditOpportunityForm opportunity={opportunity} />
    </div>
  );
}
