export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-control bg-hairline/60 ${className}`} />;
}

/** A row of card-shaped skeletons — the common case across catalogue pages. */
export function SkeletonCards({ count = 6, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-card border border-hairline bg-surface p-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** A stacked-list skeleton — inbox/notification/transaction-style pages. */
export function SkeletonList({ count = 5, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
