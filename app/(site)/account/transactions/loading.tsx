import { SkeletonList, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="shell max-w-xl pb-16 pt-8 sm:pt-10">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      <SkeletonList className="mt-6" count={6} />
    </div>
  );
}
