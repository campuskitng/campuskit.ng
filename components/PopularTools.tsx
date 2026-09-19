import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ToolIcon } from "@/components/ui/Icon";
import type { Tool } from "@/lib/types";

export function PopularTools({ tools }: { tools: Tool[] }) {
  return (
    <section aria-labelledby="popular-tools" className="shell pt-12 sm:pt-14">
      <SectionHeader
        title={<span id="popular-tools">Popular tools</span>}
        description="What students opened most this week."
        action={{ label: "View all tools", href: "/tools" }}
      />

      {/* A bordered group of rows: one structure, four entries — no card grid. */}
      <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface sm:grid sm:grid-cols-2 sm:divide-y-0">
        {tools.map((tool, position) => (
          <li
            key={tool.id}
            className={`sm:border-hairline ${position % 2 === 0 ? "sm:border-r" : ""} ${
              position < tools.length - 2 ? "sm:border-b" : ""
            }`}
          >
            <Link
              href={tool.href}
              className="group flex min-h-[72px] items-center gap-3.5 px-4 py-3.5 transition-colors
                hover:bg-canvas active:bg-brand-soft/50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-700">
                <ToolIcon name={tool.icon} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-title font-medium text-ink">{tool.name}</span>
                  {tool.isNew ? (
                    <span className="shrink-0 rounded-full bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold text-success">
                      New
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block truncate text-label text-muted">{tool.description}</span>
              </span>

              <span className="hidden shrink-0 text-meta text-muted sm:block">{tool.note}</span>
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
}
