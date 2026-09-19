"use client";

import { useState } from "react";
import { OpportunityRows } from "@/components/OpportunityList";
import type { Opportunity, OpportunityCategory } from "@/lib/types";

const categories: (OpportunityCategory | "All")[] = [
  "All",
  "Scholarship",
  "Internship",
  "Fellowship",
  "Competition",
  "Event",
];

export function OpportunitiesClient({ opportunities }: { opportunities: Opportunity[] }) {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const items =
    active === "All" ? opportunities : opportunities.filter((item) => item.category === active);

  return (
    <div className="shell pb-16 pt-8 sm:pt-10">
      <header className="max-w-[46ch]">
        <h1 className="text-display font-semibold tracking-tight text-ink">Opportunities</h1>
        <p className="mt-2 text-body text-muted">
          Open scholarships, internships and campus events with deadlines you can still meet.
        </p>
      </header>

      <div
        role="group"
        aria-label="Filter by category"
        className="no-scrollbar -mx-5 mt-7 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {categories.map((category) => {
          const isActive = category === active;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              aria-pressed={isActive}
              className={`h-9 shrink-0 rounded-full border px-3.5 text-label font-medium transition-colors ${
                isActive
                  ? "border-brand bg-brand-soft text-brand-700"
                  : "border-hairline bg-surface text-muted hover:border-brand/40 hover:text-ink"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {items.length > 0 ? (
          <OpportunityRows items={items} />
        ) : (
          <p className="border-y border-hairline py-12 text-center text-label text-muted">
            Nothing open under {active} right now. Check another category, or come back next week.
          </p>
        )}
      </div>
    </div>
  );
}
