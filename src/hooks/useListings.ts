import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsApi } from '@/api/listings';
import type { ListingsParams } from '@/types/listing';

export const useListings = (params?: ListingsParams) => {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => listingsApi.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMyListings = (params?: ListingsParams) => {
  return useQuery({
    queryKey: ['listings', 'my', params],
    queryFn: () => listingsApi.getMy(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useFavorites = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['listings', 'favorites', params],
    queryFn: () => listingsApi.getFavorites(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useSimilarListings = (id: string, limit = 4) => {
  return useQuery({
    queryKey: ['listing', id, 'similar'],
    queryFn: () => listingsApi.getSimilar(id, limit),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useListingsMap = (params?: ListingsParams) => {
  return useQuery({
    queryKey: ['listings', 'map', params],
    queryFn: () => listingsApi.getMap(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useToggleFavorite = (listingId: string) => {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: () => listingsApi.addFavorite(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings', 'favorites'] });
    },
  });

  const remove = useMutation({
    mutationFn: () => listingsApi.removeFavorite(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings', 'favorites'] });
    },
  });

  return { add, remove };
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

export const useUpdateListing = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof listingsApi.update>[1]) =>
      listingsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

export const useRemoveListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listingsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};
