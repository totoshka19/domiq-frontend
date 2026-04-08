import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchParams } from '@/api/search';

export const useSearch = (params: SearchParams) => {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchApi.search(params),
    enabled: !!params.q,
    staleTime: 1000 * 60 * 2,
  });
};

export const useAutocomplete = (q: string) => {
  return useQuery({
    queryKey: ['autocomplete', q],
    queryFn: () => searchApi.autocomplete(q),
    enabled: q.length >= 2,
    staleTime: 1000 * 30,
  });
};
