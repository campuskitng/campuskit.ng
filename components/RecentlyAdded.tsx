import Link from "next/link";
import { BookOpen, Briefcase, ShoppingBag } from "lucide-react";
import { timeAgo } from "@/lib/format-time";

type Item = {
  id: string;
  title: string;
  href: string;
  createdAt: string;
  kind: "marketplace" | "opportunity" | "past_question";
};

const ICONS = {
  marketplace: ShoppingBag,
  opportunity: Briefcase,
  past_question: BookOpen,
} as const;

const LABELS = {
  marketplace: "Marketplace",
  opportunity: "Opportunity",
  past_question: "Past question",
} as const;

/**
 * "The student should be able to tell CampusKit is actively maintained" —
 * without inventing activity. Every item here has a real created_at from
 * Supabase; there's no fallback to fabricated recency. Renders nothing if
 * there's genuinely no recent real data, rather than padding with filler.
 */
export function RecentlyAdded({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <section className="shell py-8 sm:py-10" aria-labelledby="recently-added-heading">
      <h2 id="recently-added-heading" className="text-section font-semibold text-ink">
        New this week
      </h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {sorted.map((item) => {
          const Icon = ICONS[item.kind];
          return (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className="flex min-w-[220px] shrink-0 items-center gap-3 rounded-card border border-hairline bg-surface p-3.5 transition-colors hover:border-brand/40"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-700">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-label font-medium text-ink">{item.title}</p>
                <p className="text-meta text-muted">{LABELS[item.kind]} · {timeAgo(item.createdAt)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
