import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="shell max-w-xl pb-16 pt-8 sm:pt-10">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3.5 w-28" />
        </div>
      </div>
      <div className="mt-6 grid gap-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] w-full" />
        ))}
      </div>
    </div>
  );
}
