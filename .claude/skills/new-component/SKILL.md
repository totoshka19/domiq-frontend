---
name: new-component
description: Create a reusable React component with TypeScript props interface, CSS module, and named export. Use when creating buttons, cards, modals, inputs, or any shared UI element.
disable-model-invocation: true
argument-hint: <ComponentName> [ui|layout|listing]
---

Создай новый компонент `$ARGUMENTS` для Domiq frontend.

## Шаг 0 — сначала проверь shadcn/ui

Перед созданием компонента проверь: есть ли готовый аналог в shadcn/ui?

| Нужен | shadcn/ui компонент | Команда |
|---|---|---|
| Кнопка | Button | `npx shadcn@latest add button` |
| Поле ввода | Input | `npx shadcn@latest add input` |
| Выпадающий список | Select | `npx shadcn@latest add select` |
| Модальное окно | Dialog | `npx shadcn@latest add dialog` |
| Вкладки | Tabs | `npx shadcn@latest add tabs` |
| Карточка-обёртка | Card | `npx shadcn@latest add card` |
| Бейдж/метка | Badge | `npx shadcn@latest add badge` |
| Аватар | Avatar | `npx shadcn@latest add avatar` |
| Уведомление | Toast / Sonner | `npx shadcn@latest add toast` |
| Скелетон загрузки | Skeleton | `npx shadcn@latest add skeleton` |
| Дропдаун-меню | DropdownMenu | `npx shadcn@latest add dropdown-menu` |
| Чекбокс | Checkbox | `npx shadcn@latest add checkbox` |
| Переключатель | Switch | `npx shadcn@latest add switch` |
| Слайдер | Slider | `npx shadcn@latest add slider` |
| Попап/тултип | Popover / Tooltip | `npx shadcn@latest add popover` |
| Пагинация | Pagination | `npx shadcn@latest add pagination` |
| Аккордеон | Accordion | `npx shadcn@latest add accordion` |
| Разделитель | Separator | `npx shadcn@latest add separator` |

**Если shadcn/ui аналог есть:**
1. Установить: `npx shadcn@latest add <component>`
2. Показать пример использования в контексте Domiq
3. НЕ создавать кастомный компонент — использовать shadcn/ui

**Если shadcn/ui аналога нет** (ListingCard, MapPin, PriceTag, FilterPanel, GallerySlider и т.п.) — создать кастомный компонент ниже.

---

## Шаг 1 — определи категорию

Из `$ARGUMENTS`:
- `ui` → `src/components/ui/` — общие переиспользуемые UI-элементы
- `layout` → `src/components/layout/` — шапка, подвал, обёртки
- `listing` → `src/components/listing/` — всё что связано с объявлениями
- без категории → `src/components/ui/`

## Шаг 2 — создай файлы

**`src/components/<category>/<ComponentName>.tsx`**
```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface <ComponentName>Props {
  className?: string;
  children?: React.ReactNode;
  // TODO: добавить специфичные props
}

export const <ComponentName>: React.FC<<ComponentName>Props> = ({
  className,
  children,
}) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};
```

> Использовать `cn()` из `@/lib/utils` — он уже есть после инициализации shadcn/ui.
> SCSS-модуль создавать только если нужны анимации или псевдоэлементы — иначе только Tailwind.

## Шаг 3 — если компонент использует shadcn/ui

```tsx
// Пример: ListingCard использует shadcn/ui Badge и Button
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  onFavorite?: (id: string) => void;
  className?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onFavorite,
  className,
}) => {
  return (
    <div className={cn('flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow', className)}>
      <div className="relative h-48">
        <img src={listing.main_photo_url} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
        <Badge className="absolute top-3 left-3" variant="secondary">
          {listing.deal_type === 'sale' ? 'Продажа' : 'Аренда'}
        </Badge>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <span className="text-xl font-semibold text-gray-900">{listing.price.toLocaleString('ru-RU')} ₽</span>
        <span className="text-sm text-gray-400">{listing.address}</span>
        <Button variant="outline" size="sm" onClick={() => onFavorite?.(listing.id)}>
          В избранное
        </Button>
      </div>
    </div>
  );
};
```

## Шаг 4 — реэкспорт

Если компонент в `src/components/ui/` — добавь в `src/components/ui/index.ts`:
```tsx
export { <ComponentName> } from './<ComponentName>';
```

## Шаг 5 — покажи результат

Покажи созданные файлы и пример использования компонента на странице.

---

## Компоненты Domiq — что использовать

### Берём из shadcn/ui (не создаём сами)
`Button` · `Input` · `Select` · `Dialog` · `Tabs` · `Card` · `Badge` · `Avatar` · `Toast` · `Skeleton` · `Pagination` · `DropdownMenu` · `Checkbox` · `Switch` · `Slider` · `Popover` · `Tooltip` · `Accordion` · `Separator`

### Создаём сами (нет в shadcn/ui)
**Listing:** `ListingCard` · `ListingGallery` · `PriceTag` · `FavoriteButton` · `ListingBadge` · `RoomsBadge`
**Search:** `FilterPanel` · `FilterTag` · `SortSelect` · `SearchInput` · `MapView` · `ListingMapPin`
**Layout:** `Header` · `Footer` · `PageLayout` · `Container` · `Sidebar`
**Chat:** `MessageBubble` · `ConversationItem` · `ChatInput`
**Profile:** `ListingMiniCard` · `ProfileStats`
