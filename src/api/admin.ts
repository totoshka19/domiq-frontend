import api from './axios';
import type { User } from '@/types/user';
import type { Listing } from '@/types/listing';
import type { AdminStats, AdminUser, AdminUsersParams } from '@/types/admin';
import type { PaginatedResponse } from '@/types/api';

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<AdminStats>('/admin/stats');
    return data;
  },

  getUsers: async (params?: AdminUsersParams): Promise<PaginatedResponse<AdminUser>> => {
    const { data } = await api.get<PaginatedResponse<AdminUser>>('/admin/users', { params });
    return data;
  },

  blockUser: async (id: string): Promise<User> => {
    const { data } = await api.patch<User>(`/admin/users/${id}/block`);
    return data;
  },

  unblockUser: async (id: string): Promise<User> => {
    const { data } = await api.patch<User>(`/admin/users/${id}/unblock`);
    return data;
  },

  getPendingListings: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Listing>> => {
    const { data } = await api.get<PaginatedResponse<Listing>>('/admin/listings', {
      params: { ...params, is_moderated: false },
    });
    return data;
  },

  approveListing: async (id: string): Promise<{ status: string }> => {
    const { data } = await api.patch<{ status: string }>(`/admin/listings/${id}/approve`);
    return data;
  },

  rejectListing: async (id: string, reason: string): Promise<Listing> => {
    const { data } = await api.patch<Listing>(`/admin/listings/${id}/reject`, { reason });
    return data;
  },
};
