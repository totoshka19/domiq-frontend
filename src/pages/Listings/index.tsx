import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/PageLayout';
import { FilterPanel } from '@/components/listing/FilterPanel';
import { ListingCard } from '@/components/listing/ListingCard';
import { ListingGridSkeleton } from '@/components/listing/ListingCardSkeleton';
import { ListingsMap } from '@/components/listing/ListingsMap';
import { useListings, useListingsMap, useFavoriteIds } from '@/hooks/useListings';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectFilters, setFilter, setPage, resetFilters } from '@/store/filtersSlice';
import type { DealType, PropertyType, ListingsParams } from '@/types/listing';

const LIMIT = 12;

type ViewMode = 'list' | 'map';

function getPageNumbers(page: number, pages: number): (number | '...')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
  if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, '...', page - 1, page, page + 1, '...', pages];
}

const Listings: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Синхронизация URL-параметров → Redux при первом входе на страницу
  useEffect(() => {
    dispatch(resetFilters());
    const dealType = searchParams.get('deal_type') as DealType | null;
    const propertyType = searchParams.get('property_type') as PropertyType | null;
    const city = searchParams.get('city');
    if (dealType) dispatch(setFilter({ key: 'deal_type', value: dealType }));
    if (propertyType) dispatch(setFilter({ key: 'property_type', value: propertyType }));
    if (city) dispatch(setFilter({ key: 'city', value: city }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Скролл наверх при смене страницы
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters.page]);

  const params: ListingsParams = {
    page: filters.page,
    limit: LIMIT,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
    ...(filters.city && { city: filters.city }),
    ...(filters.deal_type && { deal_type: filters.deal_type }),
    ...(filters.property_type && { property_type: filters.property_type }),
    ...(filters.price_min !== '' && { price_min: filters.price_min as number }),
    ...(filters.price_max !== '' && { price_max: filters.price_max as number }),
    ...(filters.rooms !== '' && { rooms: filters.rooms as number }),
    ...(filters.area_min !== '' && { area_min: filters.area_min as number }),
    ...(filters.area_max !== '' && { area_max: filters.area_max as number }),
    ...(filters.floor_min !== '' && { floor_min: filters.floor_min as number }),
    ...(filters.floor_max !== '' && { floor_max: filters.floor_max as number }),
  };

  // Параметры для карты — те же фильтры, но без пагинации
  const mapParams: ListingsParams = {
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
    ...(filters.city && { city: filters.city }),
    ...(filters.deal_type && { deal_type: filters.deal_type }),
    ...(filters.property_type && { property_type: filters.property_type }),
    ...(filters.price_min !== '' && { price_min: filters.price_min as number }),
    ...(filters.price_max !== '' && { price_max: filters.price_max as number }),
    ...(filters.rooms !== '' && { rooms: filters.rooms as number }),
    ...(filters.area_min !== '' && { area_min: filters.area_min as number }),
    ...(filters.area_max !== '' && { area_max: filters.area_max as number }),
    ...(filters.floor_min !== '' && { floor_min: filters.floor_min as number }),
    ...(filters.floor_max !== '' && { floor_max: filters.floor_max as number }),
  };

  const { data, isLoading, isError } = useListings(params);
  const { data: mapData, isLoading: isMapLoading } = useListingsMap(mapParams, viewMode === 'map');
  const favoriteIds = useFavoriteIds();

  const listings = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const page = filters.page;
  const mapPoints = mapData?.points ?? [];

  return (
    <PageLayout>
      <div className="flex gap-6 items-start">
        {/* Боковая панель — только desktop */}
        <FilterPanel className="hidden md:flex w-64 xl:w-72 flex-shrink-0 sticky top-20" />

        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          {/* Тулбар */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Загружаем...'
                : `${total.toLocaleString('ru-RU')} объявлений`}
            </p>

            <div className="flex items-center gap-2">
              {/* Переключатель список / карта */}
              <div className="hidden md:flex items-center rounded-lg border border-border p-0.5 gap-0.5">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2.5 gap-1.5"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Список
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2.5 gap-1.5"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="w-3.5 h-3.5" />
                  Карта
                </Button>
              </div>

              {/* Кнопка фильтров — только mobile */}
              <Button
                variant="outline"
                size="sm"
                className="md:hidden flex items-center gap-2"
                onClick={() => setShowMobileFilters((v) => !v)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Фильтры
              </Button>
            </div>
          </div>

          {/* Мобильная панель фильтров */}
          {showMobileFilters && (
            <FilterPanel className="md:hidden mb-4" />
          )}

          {/* Вид: карта */}
          {viewMode === 'map' && (
            <div className="h-[calc(100vh-9rem)] sticky top-20">
              {isMapLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ListingsMap points={mapPoints} className="h-full" />
              )}
            </div>
          )}

          {/* Вид: список */}
          {viewMode === 'list' && (
            <>
              {isLoading ? (
                <ListingGridSkeleton count={LIMIT} />
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <p className="text-muted-foreground">Не удалось загрузить объявления.</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Попробовать снова
                  </Button>
                </div>
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <p className="text-muted-foreground">Объявления не найдены.</p>
                  <p className="text-sm text-muted-foreground">Попробуйте изменить или сбросить фильтры.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} isFavorite={favoriteIds.has(listing.id)} />
                  ))}
                </div>
              )}

              {/* Пагинация */}
              {pages > 1 && !isLoading && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => dispatch(setPage(page - 1))}
                        aria-disabled={page === 1}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {getPageNumbers(page, pages).map((p, i) => (
                      <PaginationItem key={i}>
                        {p === '...' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            isActive={p === page}
                            onClick={() => dispatch(setPage(p as number))}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => dispatch(setPage(page + 1))}
                        aria-disabled={page === pages}
                        className={page === pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Listings;
