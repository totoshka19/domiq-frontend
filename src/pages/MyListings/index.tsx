import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ArchiveRestore, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ProfileLayout } from '@/components/layout/ProfileLayout';
import { useMyListings, useRemoveListing } from '@/hooks/useListings';
import { useQueryClient } from '@tanstack/react-query';
import { listingsApi } from '@/api/listings';
import { formatPrice } from '@/utils/formatPrice';
import { formatRelativeDate } from '@/utils/formatDate';
import type { ListingStatus } from '@/types/listing';

const LIMIT = 10;

const STATUS_LABEL: Record<ListingStatus, string> = {
  active: 'Активно',
  archived: 'Архив',
  sold: 'Продано',
};

const STATUS_VARIANT: Record<ListingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  archived: 'secondary',
  sold: 'outline',
};

const MyListings: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyListings({ page, limit: LIMIT });
  const removeMutation = useRemoveListing();

  const toggleStatus = async (id: string, current: ListingStatus) => {
    const next: ListingStatus = current === 'active' ? 'archived' : 'active';
    try {
      await listingsApi.update(id, { status: next });
      queryClient.invalidateQueries({ queryKey: ['listings', 'my'] });
      toast.success(next === 'active' ? 'Объявление активировано' : 'Объявление архивировано');
    } catch {
      toast.error('Не удалось изменить статус');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить объявление? Это действие нельзя отменить.')) return;
    try {
      await removeMutation.mutateAsync(id);
      toast.success('Объявление удалено');
    } catch {
      toast.error('Не удалось удалить объявление');
    }
  };

  const listings = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  return (
    <ProfileLayout>
      <div className="flex flex-col gap-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Мои объявления</h1>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-0.5">{total} объявлений</p>
            )}
          </div>
          <Button asChild size="sm">
            <Link to="/listings/create">
              <Plus className="w-4 h-4 mr-1.5" />
              Добавить
            </Link>
          </Button>
        </div>

        {/* Список */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground">У вас пока нет объявлений</p>
            <Button asChild>
              <Link to="/listings/create">
                <Plus className="w-4 h-4 mr-2" />
                Разместить первое объявление
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white border rounded-2xl p-4 flex gap-4 items-start hover:shadow-sm transition-shadow"
              >
                {/* Фото */}
                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  {listing.main_photo_url ? (
                    <img
                      src={listing.main_photo_url}
                      alt={listing.title}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>

                {/* Инфо */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={STATUS_VARIANT[listing.status]} className="text-xs">
                      {STATUS_LABEL[listing.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatRelativeDate(listing.created_at)}</span>
                  </div>
                  <Link
                    to={`/listings/${listing.id}`}
                    className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-1"
                  >
                    {listing.title}
                  </Link>
                  <span className="text-sm font-semibold text-primary">
                    {formatPrice(listing.price, listing.currency)}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{listing.address}</span>
                </div>

                {/* Действия */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" asChild title="Редактировать">
                    <Link to={`/listings/${listing.id}/edit`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={listing.status === 'active' ? 'Архивировать' : 'Активировать'}
                    onClick={() => toggleStatus(listing.id, listing.status)}
                  >
                    {listing.status === 'active'
                      ? <Archive className="w-4 h-4" />
                      : <ArchiveRestore className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Удалить"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(listing.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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

export default MyListings;
