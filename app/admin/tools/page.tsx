import Link from "next/link";
import { Pencil } from "lucide-react";
import { getTools } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ToolIcon } from "@/components/ui/Icon";
import { toolCategories } from "@/data/tools";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { deleteToolAction, toggleToolStatusAction, createToolAction } from "@/lib/admin-actions";
import { NewToolForm } from "./NewToolForm";

export const revalidate = 0;

export default async function AdminToolsPage() {
  const supabase = createSupabaseServerClient();
  const { data: tools } = await supabase.from("tools").select("*").order("category").order("name");

  return (
    <div className="max-w-4xl">
      <h1 className="text-section font-semibold text-ink">Tools</h1>
      <p className="mt-1 text-label text-muted">{tools?.length ?? 0} tools. Toggling status writes to Supabase immediately.</p>

      <NewToolForm categories={toolCategories.map((c) => c.id)} />

      <div className="mt-8 space-y-8">
        {toolCategories.map((category) => {
          const items = (tools ?? []).filter((t) => t.category === category.id);
          if (items.length === 0) return null;
          return (
            <section key={category.id}>
              <h2 className="border-b border-hairline pb-2 text-title font-semibold text-ink">{category.label}</h2>
              <ul className="mt-1 divide-y divide-hairline">
                {items.map((tool) => (
                  <li key={tool.id} className="flex items-center gap-3.5 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-700">
                      <ToolIcon name={tool.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-label font-medium text-ink">{tool.name}</p>
                      <p className="text-meta text-muted">{tool.description}</p>
                    </div>
                    <StatusToggle id={tool.id} status={tool.status} onToggle={toggleToolStatusAction} />
                    <Link
                      href={`/admin/tools/${tool.id}/edit`}
                      aria-label={`Edit ${tool.name}`}
                      className="shrink-0 rounded-control p-1.5 text-muted hover:bg-canvas hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <DeleteButton id={tool.id} onDelete={deleteToolAction} label="tool" />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
