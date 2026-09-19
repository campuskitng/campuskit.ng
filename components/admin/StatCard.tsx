import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-card border border-hairline bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-label text-muted">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-control bg-brand-soft text-brand-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-display font-semibold tracking-tight text-ink">{value}</p>
      {note ? <p className="mt-1 text-meta text-muted">{note}</p> : null}
    </div>
  );
}
