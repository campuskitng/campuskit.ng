const tones: Record<string, string> = {
  active: "bg-success/10 text-success",
  approved: "bg-success/10 text-success",
  paid: "bg-success/10 text-success",
  pending: "bg-amber-100 text-amber-700",
  flagged: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-600",
  removed: "bg-red-100 text-red-600",
  refunded: "bg-red-100 text-red-600",
};

export function StatusPill({ status }: { status: string }) {
  const tone = tones[status] ?? "bg-hairline text-muted";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-meta font-medium capitalize ${tone}`}>
      {status}
    </span>
  );
}
