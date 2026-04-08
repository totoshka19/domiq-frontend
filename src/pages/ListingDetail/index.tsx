import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, BedDouble, Maximize2, Building2, Layers, Calendar, MessageCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { PageLayout } from '@/components/layout/PageLayout';
import { ListingGallery } from '@/components/listing/ListingGallery';
import { ListingCard } from '@/components/listing/ListingCard';
import { FavoriteButton } from '@/components/listing/FavoriteButton';
import { useListing, useSimilarListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { chatApi } from '@/api/chat';
import { formatPrice, formatPricePerMeter } from '@/utils/formatPrice';
import { formatFullDate } from '@/utils/formatDate';

const DEAL_TYPE_LABEL: Record<string, string> = {
  sale: 'Продажа',
  rent: 'Аренда',
};

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  apartment: 'Квартира',
  house: 'Дом',
  commercial: 'Коммерческая',
  land: 'Участок',
};

const ROLE_LABEL: Record<string, string> = {
  agent: 'Агент',
  admin: 'Администратор',
  user: 'Частное лицо',
};

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [chatLoading, setChatLoading] = useState(false);

  const { data: listing, isLoading, isError } = useListing(id ?? '');
  const { data: similar = [] } = useSimilarListings(id ?? '', 4);

  const isOwner = user?.id === listing?.owner?.id;

  const handleContact = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/listings/${id}` } });
      return;
    }
    setChatLoading(true);
    try {
      const conversation = await chatApi.createConversation(id!);
      navigate(`/profile/chats/${conversation.id}`);
    } catch {
      navigate('/profile/chats');
    } finally {
      setChatLoading(false);
    }
  };

  // --- Скелетон ---
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <Skeleton className="h-[480px] w-full rounded-2xl" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="md:w-80 flex flex-col gap-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // --- Ошибка / не найдено ---
  if (isError || !listing) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-xl font-semibold text-gray-800">Объявление не найдено</p>
          <p className="text-sm text-muted-foreground">Возможно, оно было удалено или перемещено.</p>
          <Button variant="outline" onClick={() => navigate('/listings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            К списку объявлений
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Кнопка назад */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ─── Левая колонка ─── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Галерея */}
          <ListingGallery photos={listing.photos} title={listing.title} />

          {/* Заголовок + бейджи */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{DEAL_TYPE_LABEL[listing.deal_type] ?? listing.deal_type}</Badge>
              <Badge variant="outline">{PROPERTY_TYPE_LABEL[listing.property_type] ?? listing.property_type}</Badge>
              {listing.status !== 'active' && (
                <Badge variant="destructive">
                  {listing.status === 'sold' ? 'Продано' : 'Архив'}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
              {listing.title}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{listing.city}, {listing.address}</span>
            </div>
          </div>

          {/* Характеристики */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="text-base font-semibold mb-4">Характеристики</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {listing.rooms > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5" /> Комнат
                  </span>
                  <span className="font-medium">{listing.rooms === 0 ? 'Студия' : listing.rooms}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" /> Площадь
                </span>
                <span className="font-medium">{listing.area} м²</span>
              </div>
              {listing.floor > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Этаж
                  </span>
                  <span className="font-medium">{listing.floor} из {listing.floors_total}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Тип
                </span>
                <span className="font-medium">{PROPERTY_TYPE_LABEL[listing.property_type] ?? listing.property_type}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Опубликовано
                </span>
                <span className="font-medium">{formatFullDate(listing.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Описание */}
          {listing.description && (
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-semibold">Описание</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Похожие объявления */}
          {similar.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">Похожие объявления</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similar.map((s) => (
                  <ListingCard key={s.id} listing={s} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Правая колонка (sticky) ─── */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-20">
          {/* Карточка цены */}
          <div className="bg-white border rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(listing.price, listing.currency)}
                  {listing.deal_type === 'rent' && (
                    <span className="text-base font-normal text-muted-foreground">/мес</span>
                  )}
                </span>
                {listing.area > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {formatPricePerMeter(listing.price, listing.area, listing.currency)}
                  </span>
                )}
              </div>
              <FavoriteButton
                listingId={listing.id}
                isFavorite={listing.is_favorite}
              />
            </div>

            {isOwner ? (
              <Button asChild className="w-full">
                <Link to={`/listings/${listing.id}/edit`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Редактировать
                </Link>
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleContact}
                disabled={chatLoading}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {chatLoading ? 'Открываем чат...' : 'Написать агенту'}
              </Button>
            )}
          </div>

          {/* Карточка продавца */}
          <div className="bg-white border rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Продавец</h3>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={listing.owner.avatar_url ?? undefined} alt={listing.owner.full_name} />
                <AvatarFallback className="text-base">
                  {listing.owner.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium text-gray-900 truncate">{listing.owner.full_name}</span>
                <span className="text-sm text-muted-foreground">
                  {ROLE_LABEL[listing.owner.role] ?? listing.owner.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ListingDetail;
