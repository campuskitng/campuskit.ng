import { notFound } from "next/navigation";
import { Placeholder } from "@/components/Placeholder";
import { getTools } from "@/lib/supabase/queries";

export const revalidate = 0;

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tools = await getTools();
  const tool = tools.find((item) => item.href === `/tools/${params.slug}`);
  if (!tool) {
    notFound();
    return null;
  }

  return (
    <Placeholder
      eyebrow={tool.isNew ? "New" : "Tool"}
      title={tool.name}
      body={`${tool.description} The interface for this tool is next up — it needs the database behind it before it can do real work.`}
      backHref="/tools"
      backLabel="Back to tools"
    />
  );
}
