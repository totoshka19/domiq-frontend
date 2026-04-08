import api from './axios';
import type {
  Listing,
  ListingBrief,
  ListingCreate,
  ListingMapPoint,
  ListingsParams,
  PhotoReorderItem,
} from '@/types/listing';
import type { PaginatedResponse } from '@/types/api';

export const listingsApi = {
  getAll: async (params?: ListingsParams): Promise<PaginatedResponse<ListingBrief>> => {
    const { data } = await api.get<PaginatedResponse<ListingBrief>>('/listings', { params });
    return data;
  },

  getById: async (id: string): Promise<Listing> => {
    const { data } = await api.get<Listing>(`/listings/${id}`);
    return data;
  },

  getMy: async (params?: ListingsParams): Promise<PaginatedResponse<ListingBrief>> => {
    const { data } = await api.get<PaginatedResponse<ListingBrief>>('/listings/my', { params });
    return data;
  },

  getFavorites: async (params?: Pick<ListingsParams, 'page' | 'limit'>): Promise<PaginatedResponse<ListingBrief>> => {
    const { data } = await api.get<PaginatedResponse<ListingBrief>>('/listings/favorites', { params });
    return data;
  },

  getSimilar: async (id: string, limit = 4): Promise<ListingBrief[]> => {
    const { data } = await api.get<ListingBrief[]>(`/listings/${id}/similar`, { params: { limit } });
    return data;
  },

  getMap: async (params?: ListingsParams): Promise<{ points: ListingMapPoint[] }> => {
    const { data } = await api.get<{ points: ListingMapPoint[] }>('/listings/map', { params });
    return data;
  },

  create: async (payload: ListingCreate): Promise<Listing> => {
    const { data } = await api.post<Listing>('/listings', payload);
    return data;
  },

  update: async (id: string, payload: Partial<ListingCreate> & { status?: import('@/types/listing').ListingStatus }): Promise<Listing> => {
    const { data } = await api.patch<Listing>(`/listings/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<{ status: string }> => {
    const { data } = await api.delete<{ status: string }>(`/listings/${id}`);
    return data;
  },

  addFavorite: async (id: string): Promise<void> => {
    await api.post(`/listings/${id}/favorite`);
  },

  removeFavorite: async (id: string): Promise<void> => {
    await api.delete(`/listings/${id}/favorite`);
  },

  reorderPhotos: async (listingId: string, photos: PhotoReorderItem[]): Promise<void> => {
    await api.patch('/files/reorder', { listing_id: listingId, photos });
  },
};
