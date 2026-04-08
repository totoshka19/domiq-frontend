import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectFilters, selectActiveFiltersCount, setFilter, resetFilters } from '@/store/filtersSlice';
import type { DealType, PropertyType } from '@/types/listing';

const ROOMS_OPTIONS = [
  { label: 'Студия', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4+', value: 4 },
];

interface FilterPanelProps {
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const activeCount = useAppSelector(selectActiveFiltersCount);

  return (
    <aside className={cn('flex flex-col gap-5 bg-white border rounded-2xl p-5', className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="w-4 h-4" />
          Фильтры
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={() => dispatch(resetFilters())}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Сбросить
          </button>
        )}
      </div>

      <Separator />

      {/* Тип сделки */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Тип сделки</Label>
        <div className="flex gap-2">
          {(['sale', 'rent'] as const).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={filters.deal_type === type ? 'default' : 'outline'}
              className="flex-1"
              onClick={() =>
                dispatch(setFilter({ key: 'deal_type', value: filters.deal_type === type ? '' : type as DealType }))
              }
            >
              {type === 'sale' ? 'Продажа' : 'Аренда'}
            </Button>
          ))}
        </div>
      </div>

      {/* Тип недвижимости */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Тип недвижимости</Label>
        <Select
          value={filters.property_type || 'all'}
          onValueChange={(v) =>
            dispatch(setFilter({ key: 'property_type', value: v === 'all' ? '' : v as PropertyType }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Все типы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="apartment">Квартира</SelectItem>
            <SelectItem value="house">Дом</SelectItem>
            <SelectItem value="commercial">Коммерческая</SelectItem>
            <SelectItem value="land">Участок</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Цена */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Цена, ₽</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="От"
            value={filters.price_min}
            onChange={(e) =>
              dispatch(setFilter({ key: 'price_min', value: e.target.value ? Number(e.target.value) : '' }))
            }
            className="text-sm"
          />
          <span className="text-muted-foreground text-sm flex-shrink-0">—</span>
          <Input
            type="number"
            placeholder="До"
            value={filters.price_max}
            onChange={(e) =>
              dispatch(setFilter({ key: 'price_max', value: e.target.value ? Number(e.target.value) : '' }))
            }
            className="text-sm"
          />
        </div>
      </div>

      {/* Комнаты */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Комнат</Label>
        <div className="flex gap-1.5 flex-wrap">
          {ROOMS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={filters.rooms === opt.value ? 'default' : 'outline'}
              className="flex-1 min-w-[44px] text-xs"
              onClick={() =>
                dispatch(setFilter({ key: 'rooms', value: filters.rooms === opt.value ? '' : opt.value }))
              }
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Площадь */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Площадь, м²</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="От"
            value={filters.area_min}
            onChange={(e) =>
              dispatch(setFilter({ key: 'area_min', value: e.target.value ? Number(e.target.value) : '' }))
            }
            className="text-sm"
          />
          <span className="text-muted-foreground text-sm flex-shrink-0">—</span>
          <Input
            type="number"
            placeholder="До"
            value={filters.area_max}
            onChange={(e) =>
              dispatch(setFilter({ key: 'area_max', value: e.target.value ? Number(e.target.value) : '' }))
            }
            className="text-sm"
          />
        </div>
      </div>

      {/* Этаж */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Этаж</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="От"
            value={filters.floor_min}
            onChange={(e) =>
              dispatch(setFilter({ key: 'floor_min', value: e.target.value ? Number(e.target.value) : '' }))
            }
            className="text-sm"
          />
          <span className="text-muted-foreground text-sm flex-shrink-0">—</span>
          <Input
            type="number"
            placeholder="До"
            value={filters.floor_max}
            onChange={(e) =>
              dispatch(setFilter({ key: 'floor_max', value: e.target.value ? Number(e.target.value) : '' }))
            }
            className="text-sm"
          />
        </div>
      </div>

      <Separator />

      {/* Сортировка */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Сортировка</Label>
        <Select
          value={`${filters.sort_by}_${filters.sort_order}`}
          onValueChange={(v) => {
            const [sort_by, sort_order] = v.split('_') as [typeof filters.sort_by, typeof filters.sort_order];
            dispatch(setFilter({ key: 'sort_by', value: sort_by }));
            dispatch(setFilter({ key: 'sort_order', value: sort_order }));
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at_desc">Сначала новые</SelectItem>
            <SelectItem value="created_at_asc">Сначала старые</SelectItem>
            <SelectItem value="price_asc">Цена: по возрастанию</SelectItem>
            <SelectItem value="price_desc">Цена: по убыванию</SelectItem>
            <SelectItem value="area_asc">Площадь: по возрастанию</SelectItem>
            <SelectItem value="area_desc">Площадь: по убыванию</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
};
