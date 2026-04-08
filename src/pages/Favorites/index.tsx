import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileLayout } from '@/components/layout/ProfileLayout';
import { ListingCard } from '@/components/listing/ListingCard';
import { useFavorites } from '@/hooks/useListings';

const LIMIT = 12;

const Favorites: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFavorites({ page, limit: LIMIT });

  const listings = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  return (
    <ProfileLayout>
      <div className="flex flex-col gap-4">
        {/* Заголовок */}
        <div>
          <h1 className="text-xl font-semibold">Избранное</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">{total} объявлений</p>
          )}
        </div>

        {/* Сетка */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
            <Heart className="w-10 h-10 text-gray-200" />
            <p className="text-muted-foreground">Вы ещё не добавили объявления в избранное</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} isFavorite />
            ))}
          </div>
        )}

        {/* Пагинация */}
        {pages > 1 && !isLoading && (
          <Pagination className="mt-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => p - 1)}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => p + 1)}
                  aria-disabled={page === pages}
                  className={page === pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </ProfileLayout>
  );
};

export default Favorites;
