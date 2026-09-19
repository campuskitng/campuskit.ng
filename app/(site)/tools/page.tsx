import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { ToolIcon } from "@/components/ui/Icon";
import { toolCategories } from "@/data/tools";
import { getTools } from "@/lib/supabase/queries";
import type { Tool, ToolCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tools",
  description: "Every CampusKit tool, grouped by what it helps you do.",
};

export const revalidate = 0;

function groupByCategory(tools: Tool[], category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <div className="shell pb-16 pt-8 sm:pt-10">
      <header className="max-w-[46ch]">
        <h1 className="text-display font-semibold tracking-tight text-ink">Tools</h1>
        <p className="mt-2 text-body text-muted">
          Everything on CampusKit, grouped by what you are trying to get done.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {toolCategories.map((category) => {
          const items = groupByCategory(tools, category.id);
          if (items.length === 0) return null;

          return (
            <section key={category.id} aria-labelledby={`category-${category.id}`}>
              <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3">
                <h2 id={`category-${category.id}`} className="text-title font-semibold text-ink">
                  {category.label}
                </h2>
                <p className="text-label text-muted">{category.blurb}</p>
              </div>

              <ul className="mt-1 divide-y divide-hairline">
                {items.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      href={tool.href}
                      className="group flex min-h-[68px] items-center gap-3.5 py-3.5 transition-colors
                        hover:bg-surface/80 sm:px-2"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-700">
                        <ToolIcon name={tool.icon} className="h-[18px] w-[18px]" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-body font-medium text-ink group-hover:text-brand-700">
                            {tool.name}
                          </span>
                          {tool.isNew ? (
                            <span className="shrink-0 rounded-full bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold text-success">
                              New
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-label text-muted">{tool.description}</span>
                      </span>

                      {tool.note ? (
                        <span className="hidden shrink-0 text-meta text-muted sm:block">
                          {tool.note}
                        </span>
                      ) : null}
                      <ChevronRight
                        className="h-[18px] w-[18px] shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                        aria-hidden="true"
                      />
                    </Link>
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
