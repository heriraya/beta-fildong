import { Skeleton } from "@/components/ui/skeleton";

export function MovieCardSkeleton() {
  return (
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
