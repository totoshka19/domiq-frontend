import api from './axios';
import type { User, AuthTokens, RegisterPayload, LoginPayload, UpdateProfilePayload } from '@/types/user';

export const authApi = {
  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await api.post<User>('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const { data } = await api.post<AuthTokens>('/auth/login', payload);
    return data;
  },

  refresh: async (refreshToken: string): Promise<{ access_token: string }> => {
    const { data } = await api.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  updateMe: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await api.patch<User>('/auth/me', payload);
    return data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.patch<User>('/users/me/avatar', formData);
    return data;
  },
};
