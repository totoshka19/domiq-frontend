---
name: domiq-fe-conventions
description: Domiq frontend coding conventions. Auto-load when writing React, TypeScript, Tailwind or API code in this project.
---

## Domiq frontend — coding conventions

### Стек: что для чего
- **shadcn/ui** — стандартные UI-элементы (Button, Input, Dialog, Select, Tabs, Badge, Avatar, Toast, Skeleton...)
- **Tailwind CSS** — кастомные компоненты проекта (ListingCard, FilterPanel, MapView...)
- **SCSS** — только анимации и псевдоэлементы (:before, :after, @keyframes)

### Правило выбора стилей
```
shadcn/ui компонент существует? → использовать его
Нет → Tailwind
Tailwind не справляется? → SCSS-модуль
```

### Импорты shadcn/ui
```tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';  // всегда использовать cn() для className
```

### Структура компонента
- Один файл = один компонент, `PascalCase`
- Props типизировать через `interface ComponentNameProps`
- Экспорт именованный: `export const ListingCard = ...`
- Логика запросов — в хуках `src/hooks/`, не в компонентах
- `cn()` из `@/lib/utils` для объединения className

### TypeScript — обязательные правила
```tsx
// ВСЕГДА типизировать props
interface ListingCardProps {
  listing: Listing;
  onFavorite?: (id: string) => void;
}
// НИКОГДА не использовать any
// ВСЕГДА использовать React.FC<Props>
```

### Импорты — только алиасы
```tsx
import { Button } from '@/components/ui/button';  // ПРАВИЛЬНО
import { Button } from '../../../components/...'; // НЕПРАВИЛЬНО
```

### API — только через src/api/
```tsx
import { listingsApi } from '@/api/listings';  // ПРАВИЛЬНО
import axios from 'axios';                      // НЕПРАВИЛЬНО в компонентах
```

### Состояние
- Серверные данные (listings, user) → TanStack Query
- Глобальное UI-состояние (auth, фильтры) → Redux Toolkit
- Локальное состояние компонента → useState

### Адаптивность
Всегда mobile-first: сначала mobile, потом `md:`, `xl:`, `2xl:`

### Запрещено
- `any`
- Запросы к API в компонентах
- `style={{}}` инлайн-стили
- Относительные импорты дальше 1 уровня
- Серверные данные в Redux
- Создавать свой Button/Input/Select если есть shadcn/ui аналог
- Редактировать файлы в `src/components/ui/` напрямую
