import api from './axios';
import type { Photo, PhotoReorderItem } from '@/types/listing';

export const filesApi = {
  upload: async (listingId: string, files: File[]): Promise<Photo[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await api.post<Photo[]>(`/files/upload?listing_id=${listingId}`, formData);
    return data;
  },

  reorder: async (listingId: string, photos: PhotoReorderItem[]): Promise<void> => {
    await api.patch('/files/reorder', { listing_id: listingId, photos });
  },

  deletePhoto: async (photoId: string): Promise<void> => {
    await api.delete(`/files/${photoId}`);
  },
};
