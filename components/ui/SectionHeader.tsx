import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({
  title,
  description,
  action,
  badge,
}: {
  title: ReactNode;
  description?: string;
  action?: { label: string; href: string };
  badge?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="max-w-[38ch]">
        <div className="flex items-center gap-2.5">
          <h2 className="text-section font-semibold text-ink">{title}</h2>
          {badge}
        </div>
        {description ? <p className="mt-1.5 text-body text-muted">{description}</p> : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-control text-label font-medium text-brand
            transition-colors hover:text-brand-700"
        >
          {action.label}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}

export function NewBadge({ children = "New" }: { children?: ReactNode }) {
  return (
    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-meta font-semibold uppercase tracking-wider text-brand-700">
      {children}
    </span>
  );
}
