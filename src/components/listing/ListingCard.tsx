import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize2, BedDouble } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/formatPrice';
import { formatRelativeDate } from '@/utils/formatDate';
import { FavoriteButton } from './FavoriteButton';
import type { ListingBrief } from '@/types/listing';

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

interface ListingCardProps {
  listing: ListingBrief;
  isFavorite?: boolean;
  className?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite = false,
  className,
}) => {
  return (
    <Link
      to={`/listings/${listing.id}`}
      className={cn(
        'flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden',
        'hover:shadow-md transition-shadow duration-200',
        className,
      )}
    >
      {/* Фото */}
      <div className="relative h-48 bg-gray-100 flex-shrink-0">
        {listing.main_photo_url ? (
          <img
            src={listing.main_photo_url}
            alt={listing.title}
            width={400}
            height={192}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Maximize2 className="w-10 h-10" />
          </div>
        )}

        {/* Бейджи */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant="secondary" className="text-xs font-medium">
            {DEAL_TYPE_LABEL[listing.deal_type] ?? listing.deal_type}
          </Badge>
          <Badge variant="outline" className="text-xs bg-white/90">
            {PROPERTY_TYPE_LABEL[listing.property_type] ?? listing.property_type}
          </Badge>
        </div>

        {/* Кнопка избранного */}
        <FavoriteButton
          listingId={listing.id}
          isFavorite={isFavorite}
          className="absolute top-3 right-3"
        />
      </div>

      {/* Контент */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Цена */}
        <span className="text-xl font-bold text-gray-900">
          {formatPrice(listing.price)}
          {listing.deal_type === 'rent' && (
            <span className="text-sm font-normal text-muted-foreground">/мес</span>
          )}
        </span>

        {/* Характеристики */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {listing.rooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" />
              {listing.rooms} комн.
            </span>
          )}
          {listing.area > 0 && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              {listing.area} м²
            </span>
          )}
        </div>

        {/* Заголовок */}
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
          {listing.title}
        </p>

        {/* Адрес */}
        <div className="flex items-start gap-1 mt-auto pt-1">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-xs text-muted-foreground line-clamp-1">{listing.address}</span>
        </div>

        {/* Дата */}
        <span className="text-xs text-muted-foreground/70">
          {formatRelativeDate(listing.created_at)}
        </span>
      </div>
    </Link>
  );
};
