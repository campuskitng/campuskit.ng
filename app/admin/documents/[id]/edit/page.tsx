import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DocumentBuilderForm } from "../../DocumentBuilderForm";

export const revalidate = 0;

export default async function EditDocumentTemplatePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: template } = await supabase.from("document_templates").select("*").eq("id", params.id).maybeSingle();
  if (!template) notFound();

  return (
    <div className="max-w-5xl">
      <Link href="/admin/documents" className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Documents
      </Link>
      <h1 className="mt-4 text-section font-semibold text-ink">Edit template</h1>
      <p className="mt-1 text-label text-muted">
        {template.layout ? "Built with the document builder." : "This template still uses the original letter format — editing it here now adds the newer block-based structure once you save."}
      </p>
      <DocumentBuilderForm existing={template} />
    </div>
  );
}
