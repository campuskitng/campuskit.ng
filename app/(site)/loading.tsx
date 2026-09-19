import { SkeletonCards, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="shell pb-16 pt-8 sm:pt-10">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <SkeletonCards className="mt-8" count={6} />
    </div>
  );
}
