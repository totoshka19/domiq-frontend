import type { UserRole } from './user';

export type DealType = 'sale' | 'rent';
export type PropertyType = 'apartment' | 'house' | 'commercial' | 'land';
export type ListingStatus = 'active' | 'archived' | 'sold';

export interface Photo {
  id: string;
  url: string;
  is_main: boolean;
  order: number;
}

export interface ListingOwner {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
}

// Краткая карточка — для списков, главной, похожих
export interface ListingBrief {
  id: string;
  title: string;
  price: number | string;
  currency: string;
  deal_type: DealType;
  property_type: PropertyType;
  area: number;
  rooms: number;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  main_photo_url: string | null;
  status: ListingStatus;
  created_at: string;
}

// Полная карточка — для страницы объявления
export interface Listing extends ListingBrief {
  description: string;
  floor: number;
  floors_total: number;
  photos: Photo[];
  owner: ListingOwner;
  is_favorite: boolean;
  reject_reason: string | null;
  updated_at: string;
}

// Точка на карте
export interface ListingMapPoint {
  id: string;
  latitude: number;
  longitude: number;
  price: number;
}

// Тело для создания объявления
export interface ListingCreate {
  title: string;
  description: string;
  deal_type: DealType;
  property_type: PropertyType;
  price: number;
  currency: string;
  area: number;
  rooms: number;
  floor: number;
  floors_total: number;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

// Query-параметры для GET /listings
export interface ListingsParams {
  page?: number;
  limit?: number;
  city?: string;
  deal_type?: DealType;
  property_type?: PropertyType;
  price_min?: number;
  price_max?: number;
  rooms?: number;
  area_min?: number;
  area_max?: number;
  floor_min?: number;
  floor_max?: number;
  sort_by?: 'price' | 'area' | 'created_at';
  sort_order?: 'asc' | 'desc';
  status?: ListingStatus;
}

// Для изменения порядка фото
export interface PhotoReorderItem {
  photo_id: string;
  order: number;
  is_main: boolean;
}
