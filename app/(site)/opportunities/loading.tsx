import { SkeletonCards, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="shell pb-16 pt-8 sm:pt-10">
      <Skeleton className="h-8 w-40" />
      <SkeletonCards className="mt-6" count={9} />
    </div>
  );
}
