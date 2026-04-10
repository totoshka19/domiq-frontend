import React, { useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ListingMapPoint } from '@/types/listing';
import { formatPrice } from '@/utils/formatPrice';
import styles from './ListingsMap.module.scss';

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_KEY as string;

// Сокращённый формат цены для маркера: "7.5 млн" или "150 тыс"
function formatMarkerPrice(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1)} млн`;
  }
  if (price >= 1_000) {
    return `${Math.round(price / 1_000)} тыс`;
  }
  return formatPrice(price);
}

interface ListingsMapProps {
  points: ListingMapPoint[];
  className?: string;
}

export const ListingsMap: React.FC<ListingsMapProps> = ({ points, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const markersRef = useRef<maptilersdk.Marker[]>([]);
  const navigate = useNavigate();
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Инициализация карты
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maptilersdk.Map({
      container: containerRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [37.6173, 55.7558], // Москва по умолчанию
      zoom: 10,
      attributionControl: { compact: true },
    });

    mapRef.current = map;
    map.once('load', () => setIsMapLoaded(true));

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setIsMapLoaded(false);
    };
  }, []);

  // Обновление маркеров при смене точек
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Удаляем старые маркеры
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (points.length === 0) return;

    const bounds = new maptilersdk.LngLatBounds();

    points.forEach((point) => {
      bounds.extend([point.longitude, point.latitude]);

      const el = document.createElement('button');
      el.className = styles.marker;
      el.textContent = formatMarkerPrice(point.price);
      el.setAttribute('aria-label', `Объявление: ${formatPrice(point.price)}`);

      el.addEventListener('mouseenter', () => el.classList.add(styles.markerActive));
      el.addEventListener('mouseleave', () => el.classList.remove(styles.markerActive));
      el.addEventListener('click', () => navigate(`/listings/${point.id}`));

      const marker = new maptilersdk.Marker({ element: el })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Центрируем карту по всем точкам
    const fitBounds = () => {
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 500 });
    };

    if (map.loaded()) {
      fitBounds();
    } else {
      map.once('load', fitBounds);
    }
  }, [points, navigate]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
};
