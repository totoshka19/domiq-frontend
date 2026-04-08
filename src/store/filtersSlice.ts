import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DealType, PropertyType, ListingStatus } from '@/types/listing';
import type { RootState } from './index';

interface FiltersState {
  city: string;
  deal_type: DealType | '';
  property_type: PropertyType | '';
  price_min: number | '';
  price_max: number | '';
  rooms: number | '';
  area_min: number | '';
  area_max: number | '';
  floor_min: number | '';
  floor_max: number | '';
  sort_by: 'price' | 'area' | 'created_at';
  sort_order: 'asc' | 'desc';
  status: ListingStatus | '';
  page: number;
}

const initialState: FiltersState = {
  city: '',
  deal_type: '',
  property_type: '',
  price_min: '',
  price_max: '',
  rooms: '',
  area_min: '',
  area_max: '',
  floor_min: '',
  floor_max: '',
  sort_by: 'created_at',
  sort_order: 'desc',
  status: '',
  page: 1,
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter: <K extends keyof FiltersState>(
      state: FiltersState,
      action: PayloadAction<{ key: K; value: FiltersState[K] }>,
    ) => {
      (state[action.payload.key] as FiltersState[K]) = action.payload.value;
      if (action.payload.key !== 'page') {
        state.page = 1;
      }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const { setFilter, setPage, resetFilters } = filtersSlice.actions;

export const selectFilters = (state: RootState) => state.filters;

export const selectActiveFiltersCount = (state: RootState) => {
  const f = state.filters;
  return [
    f.city,
    f.deal_type,
    f.property_type,
    f.price_min,
    f.price_max,
    f.rooms,
    f.area_min,
    f.area_max,
    f.floor_min,
    f.floor_max,
  ].filter((v) => v !== '').length;
};

export default filtersSlice.reducer;
