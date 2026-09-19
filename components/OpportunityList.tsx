import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { deadlineLabel, isClosingSoon } from "@/data/opportunities";
import type { Opportunity } from "@/lib/types";

export function OpportunityRows({ items }: { items: Opportunity[] }) {
  return (
    <ul className="divide-y divide-hairline border-y border-hairline">
      {items.map((item) => {
        const soon = isClosingSoon(item.deadline);
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className="group flex flex-col gap-1 py-4 transition-colors hover:bg-surface/70 sm:flex-row
                sm:items-baseline sm:justify-between sm:gap-6 sm:px-2"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-meta text-muted">
                  <span className="font-medium text-brand-700">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{item.organization}</span>
                </p>
                <p className="mt-1 text-title font-medium text-ink group-hover:text-brand-700">
                  {item.title}
                </p>
                {item.eligibility || item.location ? (
                  <p className="mt-0.5 truncate text-label text-muted">
                    {[item.eligibility, item.location].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>

              <span
                className={`shrink-0 text-label ${soon ? "font-medium text-ink" : "text-muted"}`}
              >
                {deadlineLabel(item.deadline)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function OpportunityList({ items }: { items: Opportunity[] }) {
  return (
    <section aria-labelledby="opportunities-heading" className="shell pt-14 sm:pt-16">
      <SectionHeader
        title={<span id="opportunities-heading">Opportunities</span>}
        description="Scholarships, internships and things worth applying for."
        action={{ label: "See all opportunities", href: "/opportunities" }}
      />
      <OpportunityRows items={items} />
    </section>
  );
}
