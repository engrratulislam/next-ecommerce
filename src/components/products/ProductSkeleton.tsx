import { Skeleton } from '@/components/ui/skeleton';

export default function ProductSkeleton() {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
