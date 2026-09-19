import { SkeletonList, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl">
      <Skeleton className="h-6 w-32" />
      <SkeletonList className="mt-4" count={8} />
    </div>
  );
}
