# Domiq Frontend — инструкции для Claude Code

## О проекте
Фронтенд маркетплейса недвижимости Domiq.
React 19 + TypeScript + Vite. Деплой на Vercel.
Бэкенд API: FastAPI на Render (адрес в .env).

---

## Стек
- React 19 + TypeScript
- Vite 8.x
- Redux Toolkit 2.11.x — глобальное состояние
- React Router v7 — роутинг
- Axios 1.14.0 — HTTP-клиент
- TanStack Query v5 — кэш серверных данных
- **shadcn/ui** — готовые UI-компоненты (Button, Dialog, Select, Tabs и др.)
- **Tailwind CSS v4** — кастомные стили поверх shadcn/ui
- SCSS — только для сложных анимаций и псевдоэлементов
- Яндекс.Карты API или 2GIS — карты

### Важно: shadcn/ui + Tailwind — вместе, не вместо
shadcn/ui — не альтернатива Tailwind, а надстройка над ним:
- **shadcn/ui** — готовые компоненты: Button, Dialog, Select, Card, Toast, Tabs, Avatar, Badge, Input, Skeleton...
- **Tailwind** — кастомные элементы: карточки объявлений, карта, фильтры, адаптивные сетки
- **SCSS** — только если Tailwind не справляется: сложные анимации, :before/:after

---

## Команды

### Разработка
```bash
# Запустить dev-сервер
npm run dev

# Сборка для продакшна
npm run build

# Превью собранного билда
npm run preview

# Линтер
npm run lint

# Проверка типов
npx tsc --noEmit
```

### Установка зависимостей
```bash
npm install
```

### Установка shadcn/ui (один раз при инициализации проекта)
```bash
# Инициализация shadcn/ui
npx shadcn@latest init

# Добавить нужные компоненты (примеры)
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add pagination
npx shadcn@latest add dropdown-menu
```

---

## Переменные окружения

### .env.local (локально)
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/api
VITE_YANDEX_MAPS_KEY=your-key-here
```

### .env.production (Vercel)
```env
VITE_API_URL=https://domiq-backend.onrender.com/api
VITE_WS_URL=wss://domiq-backend.onrender.com/api
VITE_YANDEX_MAPS_KEY=your-key-here
```

> Все переменные фронтенда начинаются с `VITE_` — иначе Vite их не передаст в браузер.

---

## Структура проекта

```
domiq-frontend/
├── src/
│   ├── api/
│   │   ├── axios.ts          # настроенный instance с токеном и refresh
│   │   ├── auth.ts           # запросы к /auth/*
│   │   ├── listings.ts       # запросы к /listings/*
│   │   ├── search.ts         # запросы к /search/*
│   │   ├── chat.ts           # запросы к /chat/*
│   │   └── files.ts          # загрузка фото
│   ├── components/
│   │   ├── ui/               # базовые: Button, Input, Modal, Card...
│   │   ├── layout/           # Header, Footer, Sidebar
│   │   └── listing/          # ListingCard, ListingGallery, ListingMap...
│   ├── pages/
│   │   ├── Home/
│   │   ├── Listings/         # поисковая выдача
│   │   ├── ListingDetail/    # карточка объявления
│   │   ├── Profile/          # личный кабинет
│   │   ├── Chat/
│   │   ├── Admin/
│   │   ├── Login/
│   │   └── Register/
│   ├── store/
│   │   ├── index.ts          # configureStore
│   │   ├── authSlice.ts      # токены, текущий пользователь
│   │   └── filtersSlice.ts   # фильтры поиска
│   ├── hooks/
│   │   ├── useAuth.ts        # текущий пользователь из store
│   │   ├── useListings.ts    # TanStack Query для списка
│   │   └── useWebSocket.ts   # подключение к чату
│   ├── types/
│   │   ├── listing.ts        # интерфейсы Listing, Photo, ...
│   │   ├── user.ts           # User, Role, ...
│   │   └── api.ts            # PaginatedResponse, ApiError, ...
│   ├── utils/
│   │   ├── formatPrice.ts    # форматирование цены "7 500 000 ₽"
│   │   ├── formatDate.ts
│   │   └── cn.ts             # classnames helper
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx            # все маршруты
├── public/
├── .env.local
├── .env.example
├── .gitignore
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── CLAUDE.md                 # этот файл
└── package.json
```

---

## Архитектура и правила кода

### Структура компонента — Feature-Sliced подход
Каждая страница — отдельная папка с index:
```
pages/Listings/
├── index.tsx          # сама страница
├── Listings.module.scss
├── components/        # компоненты только этой страницы
│   ├── FilterPanel.tsx
│   └── ListingsMap.tsx
└── hooks/
    └── useListingsFilters.ts
```

### Правила TypeScript
```tsx
// ПРАВИЛЬНО — всегда типизировать props
interface ListingCardProps {
  listing: Listing;
  onFavorite?: (id: string) => void;
  className?: string;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onFavorite }) => {
  ...
}

// НЕПРАВИЛЬНО — any запрещён
const handleData = (data: any) => { ... }
```

### Правила компонентов
- Один файл = один компонент
- Компонент не знает об API — только получает данные через props или хуки
- Логика запросов — в хуках (`hooks/`) через TanStack Query
- Глобальное состояние (auth, фильтры) — в Redux
- Серверные данные (listings, user) — в TanStack Query, не в Redux

### API-слой — только через src/api/
```tsx
// ПРАВИЛЬНО — запрос через api-модуль
import { listingsApi } from '@/api/listings';
const { data } = useQuery({ queryKey: ['listings'], queryFn: listingsApi.getAll });

// НЕПРАВИЛЬНО — axios напрямую в компоненте
import axios from 'axios';
const res = await axios.get('/listings');
```

### Именование
- Компоненты: `PascalCase` (ListingCard.tsx)
- Хуки: `camelCase` с префиксом `use` (useListings.ts)
- Утилиты: `camelCase` (formatPrice.ts)
- Типы/интерфейсы: `PascalCase` (Listing, UserRole)
- CSS-модули: `ComponentName.module.scss`
- Константы: `UPPER_SNAKE_CASE`

### Импорты — алиасы вместо относительных путей
```tsx
// ПРАВИЛЬНО
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import type { Listing } from '@/types/listing';

// НЕПРАВИЛЬНО
import { Button } from '../../../components/ui/Button';
```

---

## API и авторизация

### Axios instance (src/api/axios.ts)
```tsx
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Добавлять токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Авторефреш при 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refresh_token: refresh }
        );
        localStorage.setItem('access_token', data.access_token);
        return api(error.config);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### TanStack Query — правила
```tsx
// Ключи запросов — массивы с параметрами
const { data } = useQuery({
  queryKey: ['listings', filters],      // при смене filters — перезапрос
  queryFn: () => listingsApi.getAll(filters),
  staleTime: 1000 * 60 * 5,            // 5 минут кэш
});

// Мутации для POST/PATCH/DELETE
const mutation = useMutation({
  mutationFn: listingsApi.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
});
```

### WebSocket — чат
```tsx
// hooks/useWebSocket.ts
const ws = new WebSocket(
  `${import.meta.env.VITE_WS_URL}/chat/ws/${conversationId}?token=${token}`
);
```

---

## Стили

### Правило выбора инструмента
```
shadcn/ui компонент существует? → использовать его
Нет shadcn/ui → писать на Tailwind
Tailwind не справляется? → SCSS-модуль
```

### shadcn/ui — для стандартных UI-элементов
```tsx
// ПРАВИЛЬНО — использовать shadcn/ui компонент
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Использование
<Button variant="default" size="lg">Связаться</Button>
<Button variant="outline" size="sm">В избранное</Button>
<Badge variant="secondary">Продажа</Badge>
<Skeleton className="h-48 w-full rounded-xl" />
```

### Tailwind — для кастомных элементов проекта
```tsx
// Карточка объявления — кастомный компонент на Tailwind
<div className="flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow">
  <div className="relative h-48">
    <img src={photo} className="w-full h-full object-cover" loading="lazy" />
    <Badge className="absolute top-3 left-3">{dealType}</Badge>
  </div>
  <div className="p-4 flex flex-col gap-2">
    <span className="text-xl font-semibold">{price} ₽</span>
    <span className="text-sm text-gray-500">{address}</span>
  </div>
</div>
```

### SCSS-модули — только для сложного
```tsx
// Только если нужны анимации, псевдоэлементы, сложные медиазапросы
import styles from './MapMarker.module.scss';
<div className={cn(styles.marker, isActive && styles.active)} />
```

### Расположение shadcn/ui компонентов
Все shadcn/ui компоненты живут в `src/components/ui/` — туда их копирует CLI.
Не редактировать их напрямую — только через className пропс и Tailwind.

### Адаптивность — Mobile First
```tsx
// Всегда писать mobile first, потом расширять
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
```

Брейкпоинты: `375px` (mobile) → `768px` (tablet) → `1280px` (desktop) → `1920px` (wide)

---

## Производительность

- Изображения — всегда `loading="lazy"` и задавать `width`/`height`
- Тяжёлые страницы — `React.lazy` + `Suspense`
- Карта — загружать только когда видна (Intersection Observer)
- Списки объявлений — виртуализация при >100 элементов

```tsx
// Lazy loading страниц
const ListingDetail = React.lazy(() => import('@/pages/ListingDetail'));

// В router.tsx
<Suspense fallback={<PageSkeleton />}>
  <ListingDetail />
</Suspense>
```

---

## Обработка ошибок

```tsx
// Коды ошибок API → понятный текст
const ERROR_MESSAGES: Record<number, string> = {
  401: 'Войдите в аккаунт',
  403: 'Нет доступа',
  404: 'Не найдено',
  422: 'Проверьте введённые данные',
  500: 'Ошибка сервера, попробуйте позже',
};
```

---

## Что не делать

- Не использовать `any` — всегда типизировать
- Не делать запросы к API прямо в компонентах — только через `src/api/`
- Не хранить серверные данные в Redux — только в TanStack Query
- Не писать инлайн-стили (`style={{}}`) — только Tailwind или CSS-модули
- Не использовать относительные импорты дальше 1 уровня — алиас `@/`
- Не забывать `alt` у изображений
- Не деплоить бэкенд на Vercel — только фронтенд
- Не писать свой Button/Input/Select если есть shadcn/ui аналог — использовать shadcn
- Не редактировать файлы в `src/components/ui/` напрямую — настраивать через className
- Не устанавливать MUI или Ant Design — только shadcn/ui + Tailwind

---

## Правила коммитов
Те же что в бэкенде — Conventional Commits на русском.
Области (scope): `auth` · `listings` · `search` · `chat` · `profile` · `admin` · `ui` · `api` · `store` · `deps`

Примеры:
```
feat(listings): добавить карточку объявления с галереей
fix(auth): исправить редирект после логина
feat(search): добавить фильтр по цене
style(ui): обновить цвета кнопок
chore(deps): обновить TanStack Query до v5
```

---

## Полезные ссылки
- React 19: https://react.dev
- shadcn/ui: https://ui.shadcn.com/docs
- shadcn/ui компоненты: https://ui.shadcn.com/docs/components
- TanStack Query: https://tanstack.com/query/latest
- Redux Toolkit: https://redux-toolkit.js.org
- Tailwind CSS v4: https://tailwindcss.com/docs
- React Router v7: https://reactrouter.com
- Axios: https://axios-http.com
- Vite: https://vitejs.dev
