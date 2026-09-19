import type { Metadata } from "next";
import { DocumentGenerator } from "./DocumentGenerator";
import { getDocumentTemplates } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Document generator",
  description: "Generate formatted student letters and requests from structured questions.",
};

export const revalidate = 0;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams?: { type?: string; paid?: string };
}) {
  const templates = await getDocumentTemplates();

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let savedTemplateIds: string[] = [];
  if (user) {
    const { data } = await supabase.from("saved_items").select("item_id").eq("user_id", user.id).eq("item_type", "document_template");
    savedTemplateIds = (data ?? []).map((row) => row.item_id);
  }

  return (
    <DocumentGenerator
      templates={templates}
      initialTypeId={searchParams?.type}
      paid={searchParams?.paid === "1"}
      isAuthenticated={!!user}
      savedTemplateIds={savedTemplateIds}
    />
  );
}
