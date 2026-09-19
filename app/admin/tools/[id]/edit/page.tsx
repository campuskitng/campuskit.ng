import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toolCategories } from "@/data/tools";
import { EditToolForm } from "./EditToolForm";

export const revalidate = 0;

export default async function EditToolPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: tool } = await supabase.from("tools").select("*").eq("id", params.id).maybeSingle();
  if (!tool) notFound();

  return (
    <div className="max-w-lg">
      <Link href="/admin/tools" className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Tools
      </Link>
      <h1 className="mt-4 text-section font-semibold text-ink">Edit tool</h1>
      <EditToolForm tool={tool} categories={toolCategories.map((c) => c.id)} />
    </div>
  );
}
