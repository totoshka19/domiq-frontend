import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Photo } from '@/types/listing';

interface ListingGalleryProps {
  photos: Photo[];
  title: string;
  className?: string;
}

export const ListingGallery: React.FC<ListingGalleryProps> = ({ photos, title, className }) => {
  const [current, setCurrent] = useState(0);

  if (photos.length === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 rounded-2xl h-80', className)}>
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <ImageOff className="w-12 h-12" />
          <span className="text-sm">Нет фотографий</span>
        </div>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Основное фото */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-80 md:h-[480px]">
        <img
          src={photos[current].url}
          alt={`${title} — фото ${current + 1}`}
          className="w-full h-full object-cover"
          loading={current === 0 ? 'eager' : 'lazy'}
        />

        {/* Счётчик */}
        <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {photos.length}
        </span>

        {/* Стрелки */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Миниатюры */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setCurrent(i)}
              aria-label={`Фото ${i + 1}`}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                i === current ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <img
                src={photo.url}
                alt={`${title} — миниатюра ${i + 1}`}
                width={64}
                height={64}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
