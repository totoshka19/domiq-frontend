import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ListingCardSkeletonProps {
  className?: string;
}

export const ListingCardSkeleton: React.FC<ListingCardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden', className)}>
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-48 mt-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
};

interface ListingGridSkeletonProps {
  count?: number;
}

export const ListingGridSkeleton: React.FC<ListingGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
};
