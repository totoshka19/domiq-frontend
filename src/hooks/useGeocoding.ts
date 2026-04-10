import { useState, useEffect, useRef } from 'react';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
}

/**
 * Хук для геокодинга адреса через MapTiler Geocoding API.
 * Дебаунсит запрос на `delay` мс, чтобы не стрелять при каждом нажатии.
 * Возвращает координаты (lat/lon) и статус загрузки.
 */
export function useGeocoding(query: string, delay = 600) {
  const [result, setResult] = useState<GeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 5) {
      setResult(null);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const key = import.meta.env.VITE_MAPTILER_KEY as string;
        const encoded = encodeURIComponent(trimmed);
        const res = await fetch(
          `https://api.maptiler.com/geocoding/${encoded}.json?key=${key}&language=ru&limit=1`,
        );
        if (!res.ok) return;
        const data = await res.json() as {
          features?: { geometry: { coordinates: [number, number] } }[];
        };
        if (data.features && data.features.length > 0) {
          const [lon, lat] = data.features[0].geometry.coordinates;
          setResult({ latitude: lat, longitude: lon });
        } else {
          setResult(null);
        }
      } catch {
        // Тихий провал — координаты просто не обновятся
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, delay]);

  return { result, isLoading };
}
