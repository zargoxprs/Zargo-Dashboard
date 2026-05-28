import { Skeleton } from "@/components/ui/skeleton";

export const TableSkeleton = ({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) => (
  <div className="bg-card rounded-xl border p-5 space-y-3">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-3">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-5 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const StatCardsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-24 rounded-xl" />
    ))}
  </div>
);