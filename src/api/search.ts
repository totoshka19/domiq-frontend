import api from './axios';
import type { ListingBrief } from '@/types/listing';
import type { PaginatedResponse } from '@/types/api';

export interface SearchParams {
  q: string;
  city?: string;
  deal_type?: string;
  page?: number;
  limit?: number;
}

export interface AutocompleteSuggestion {
  type: 'city' | 'district' | 'address';
  value: string;
}

export const searchApi = {
  search: async (params: SearchParams): Promise<PaginatedResponse<ListingBrief>> => {
    const { data } = await api.get<PaginatedResponse<ListingBrief>>('/search', { params });
    return data;
  },

  autocomplete: async (q: string): Promise<AutocompleteSuggestion[]> => {
    const { data } = await api.get<{ suggestions: AutocompleteSuggestion[] }>(
      '/search/autocomplete',
      { params: { q } },
    );
    return data.suggestions;
  },
};
