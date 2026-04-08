# Domiq Frontend — План реализации (Фаза 2)

> Детализация **Фазы 2** из `D:\PetProjects\Domiq\README.md`  
> Стек: React 19 + TypeScript + Vite + Redux Toolkit + TanStack Query + shadcn/ui + Tailwind CSS v4  
> API-контракт: см. `FRONTEND_API_MAP.md`

---

## Общий прогресс

- [ ] **Этап 0** — Инициализация проекта
- [ ] **Этап 1** — Фундамент (типы, store, axios, router, layout)
- [ ] **Этап 2** — API-слой и хуки
- [ ] **Этап 3** — Общие компоненты (listing, search)
- [ ] **Этап 4** — Страницы
- [ ] **Этап 5** — Качество (адаптивность, производительность, обработка ошибок)

---

## Этап 0 — Инициализация проекта

### 0.1 Создать Vite-проект
- [ ] `npm create vite@latest . -- --template react-ts`
- [ ] Удалить boilerplate-файлы: `src/App.css`, `src/assets/react.svg`, содержимое `App.tsx`

### 0.2 Установить зависимости
```bash
npm install \
  react-router-dom@7 \
  @reduxjs/toolkit@2.11 react-redux \
  axios@1.14.0 \
  @tanstack/react-query@5 \
  clsx tailwind-merge
```
```bash
npm install -D \
  sass \
  @types/node
```

### 0.3 Tailwind CSS v4
- [ ] Установить: `npm install tailwindcss@4 @tailwindcss/vite`
- [ ] Подключить плагин в `vite.config.ts`
- [ ] Добавить `@import "tailwindcss"` в `src/index.css`

### 0.4 Инициализация shadcn/ui
- [ ] `npx shadcn@latest init` (выбрать: TypeScript, style: Default, base color: Slate, CSS variables: yes)
- [ ] Установить нужные компоненты:
```bash
npx shadcn@latest add button input select dialog tabs card badge avatar skeleton pagination dropdown-menu checkbox switch slider separator toast
```

### 0.5 Настройка алиасов `@/`
- [ ] `vite.config.ts` — добавить `resolve.alias: { '@': '/src' }`
- [ ] `tsconfig.json` — добавить `paths: { "@/*": ["./src/*"] }`

### 0.6 Переменные окружения
- [ ] Создать `.env.local`:
  ```env
  VITE_API_URL=http://localhost:8000/api
  VITE_WS_URL=ws://localhost:8000/api
  VITE_YANDEX_MAPS_KEY=
  ```
- [ ] Создать `.env.example` (без значений токенов)
- [ ] Создать `.env.production`:
  ```env
  VITE_API_URL=https://domiq-backend.onrender.com/api
  VITE_WS_URL=wss://domiq-backend.onrender.com/api
  ```

### 0.7 Структура папок
- [ ] Создать пустые директории согласно CLAUDE.md:
  `src/api/`, `src/components/ui/`, `src/components/layout/`, `src/components/listing/`,
  `src/pages/`, `src/store/`, `src/hooks/`, `src/types/`, `src/utils/`

---

## Этап 1 — Фундамент

### 1.1 Типы (`src/types/`)

#### `src/types/api.ts`
- [ ] `PaginatedResponse<T>` — `{ items, total, page, limit, pages }`
- [ ] `ApiError` — формат ошибок FastAPI (`detail: string | ValidationError[]`)
- [ ] `ValidationError` — `{ loc, msg, type }`

#### `src/types/user.ts`
- [ ] `UserRole` — `"user" | "agent" | "admin"`
- [ ] `User` — `{ id, email, full_name, phone?, avatar_url?, role, is_active, created_at }`
- [ ] `AuthTokens` — `{ access_token, refresh_token, token_type }`
- [ ] `RegisterPayload` — `{ email, password, full_name, role }`
- [ ] `LoginPayload` — `{ email, password }`

#### `src/types/listing.ts`
- [ ] `DealType` — `"sale" | "rent"`
- [ ] `PropertyType` — `"apartment" | "house" | "commercial" | "land"`
- [ ] `ListingStatus` — `"active" | "archived" | "sold"`
- [ ] `Photo` — `{ id, url, is_main, order }`
- [ ] `ListingOwner` — `{ id, full_name, avatar_url, role }`
- [ ] `Listing` — полная карточка (все поля из `GET /listings/{id}`)
- [ ] `ListingBrief` — краткая карточка (для списка и главной)
- [ ] `ListingMapPoint` — `{ id, latitude, longitude, price }`
- [ ] `ListingCreate` — тело для `POST /listings`
- [ ] `ListingsParams` — query-параметры для `GET /listings`

#### `src/types/chat.ts`
- [ ] `Conversation` — с вложенными `listing`, `other_user`, `last_message`
- [ ] `Message` — `{ id, sender_id, text, is_read, created_at }`

#### `src/types/admin.ts`
- [ ] `AdminStats` — все поля из `GET /admin/stats`
- [ ] `AdminUser` — пользователь с `listings_count`

### 1.2 Утилиты (`src/utils/`)
- [ ] `formatPrice.ts` — `formatPrice(7500000)` → `"7 500 000 ₽"`
- [ ] `formatDate.ts` — относительное время ("2 часа назад") и полная дата
- [ ] `cn.ts` — реэкспорт `cn` из `@/lib/utils` (shadcn/ui уже создаёт `src/lib/utils.ts`)

### 1.3 Axios instance (`src/api/axios.ts`)
- [ ] Создать instance с `baseURL: import.meta.env.VITE_API_URL`
- [ ] Request interceptor — добавить `Authorization: Bearer <token>` из localStorage
- [ ] Response interceptor — при 401: refresh токен → повторить запрос; при неудаче — `localStorage.clear()` + редирект на `/login`
- [ ] Экспортировать `export default api`

### 1.4 Redux Store (`src/store/`)

#### `src/store/authSlice.ts`
- [ ] State: `{ user: User | null, accessToken: string | null, refreshToken: string | null, isInitialized: boolean }`
- [ ] Actions: `setCredentials(tokens + user)`, `logout()`, `setUser(user)`
- [ ] Thunk: `initAuth()` — при старте приложения читает токен из localStorage и загружает `/auth/me`
- [ ] Selectors: `selectCurrentUser`, `selectIsAuthenticated`, `selectUserRole`, `selectIsInitialized`

#### `src/store/filtersSlice.ts`
- [ ] State: `{ city, deal_type, property_type, price_min, price_max, rooms, area_min, area_max, floor_min, floor_max, sort_by, sort_order, page }`
- [ ] Actions: `setFilter(key, value)`, `resetFilters()`, `setPage(n)`
- [ ] Selectors: `selectFilters`, `selectActiveFiltersCount`

#### `src/store/index.ts`
- [ ] `configureStore` с `auth` и `filters` reducers
- [ ] Экспорт типов `RootState`, `AppDispatch`
- [ ] Экспорт хуков `useAppDispatch`, `useAppSelector`

### 1.5 Router (`src/router.tsx`)
- [ ] Настроить `createBrowserRouter` с React Router v7
- [ ] Все страницы через `React.lazy` + `Suspense`
- [ ] Компонент `ProtectedRoute` — редирект на `/login` если не авторизован
- [ ] Компонент `RoleRoute` — редирект если нет нужной роли (для agent/admin)
- [ ] `PageSkeleton` — fallback для Suspense

Маршруты:
| Путь | Компонент | Защита |
|---|---|---|
| `/` | Home | — |
| `/login` | Login | — |
| `/register` | Register | — |
| `/listings` | Listings | — |
| `/listings/create` | CreateListing | agent/admin |
| `/listings/:id` | ListingDetail | — |
| `/listings/:id/edit` | EditListing | agent/admin |
| `/profile` | Profile | auth |
| `/profile/listings` | MyListings | auth |
| `/profile/favorites` | Favorites | auth |
| `/profile/chats` | Chats | auth |
| `/profile/chats/:id` | ChatRoom | auth |
| `/admin` | Admin | admin |
| `*` | NotFound | — |

### 1.6 Layout компоненты (`src/components/layout/`)

#### `Header`
- [ ] Логотип (ссылка на `/`)
- [ ] Навигация: Объявления, Карта
- [ ] Правая часть: кнопки Войти/Зарегистрироваться (если не авторизован) | Avatar + DropdownMenu (профиль, мои объявления, выйти)
- [ ] Кнопка "Разместить объявление" — только для role: agent/admin
- [ ] Адаптивность: мобильное бургер-меню

#### `Footer`
- [ ] Логотип + описание
- [ ] Ссылки: О проекте, Контакты
- [ ] Copyright

#### `PageLayout`
- [ ] Обёртка: Header + `<main>` + Footer
- [ ] `Container` — `max-w-[1280px] mx-auto px-4`

### 1.7 `src/App.tsx`
- [ ] `QueryClientProvider` (TanStack Query)
- [ ] `Provider` (Redux)
- [ ] `RouterProvider`
- [ ] Запуск `initAuth()` при старте

---

## Этап 2 — API-слой и хуки

### 2.1 `src/api/auth.ts`
- [ ] `register(payload: RegisterPayload): Promise<User>`
- [ ] `login(payload: LoginPayload): Promise<AuthTokens>`
- [ ] `refresh(refreshToken: string): Promise<{ access_token: string }>`
- [ ] `logout(refreshToken: string): Promise<void>`
- [ ] `getMe(): Promise<User>`
- [ ] `updateMe(payload: Partial<User>): Promise<User>`
- [ ] `uploadAvatar(file: File): Promise<User>`

### 2.2 `src/api/listings.ts`
- [ ] `getAll(params: ListingsParams): Promise<PaginatedResponse<ListingBrief>>`
- [ ] `getById(id: string): Promise<Listing>`
- [ ] `getMy(params): Promise<PaginatedResponse<ListingBrief>>`
- [ ] `getFavorites(params): Promise<PaginatedResponse<ListingBrief>>`
- [ ] `getSimilar(id: string, limit?: number): Promise<ListingBrief[]>`
- [ ] `getMap(params): Promise<{ points: ListingMapPoint[] }>`
- [ ] `create(payload: ListingCreate): Promise<Listing>`
- [ ] `update(id: string, payload: Partial<ListingCreate>): Promise<Listing>`
- [ ] `remove(id: string): Promise<{ status: string }>`
- [ ] `addFavorite(id: string): Promise<void>`
- [ ] `removeFavorite(id: string): Promise<void>`

### 2.3 `src/api/search.ts`
- [ ] `search(params): Promise<PaginatedResponse<ListingBrief>>`
- [ ] `autocomplete(q: string): Promise<{ suggestions: Suggestion[] }>`

### 2.4 `src/api/chat.ts`
- [ ] `getConversations(): Promise<{ items: Conversation[] }>`
- [ ] `getMessages(id: string, params): Promise<PaginatedResponse<Message>>`
- [ ] `createConversation(listingId: string): Promise<Conversation>`

### 2.5 `src/api/files.ts`
- [ ] `upload(listingId: string, files: File[]): Promise<Photo[]>`
- [ ] `reorder(listingId: string, photos: ReorderItem[]): Promise<void>`
- [ ] `deletePhoto(photoId: string): Promise<void>`

### 2.6 `src/api/admin.ts`
- [ ] `getStats(): Promise<AdminStats>`
- [ ] `getUsers(params): Promise<PaginatedResponse<AdminUser>>`
- [ ] `blockUser(id: string): Promise<User>`
- [ ] `unblockUser(id: string): Promise<User>`
- [ ] `getPendingListings(params): Promise<PaginatedResponse<Listing>>`
- [ ] `approveListing(id: string): Promise<{ status: string }>`
- [ ] `rejectListing(id: string, reason: string): Promise<Listing>`

### 2.7 Хуки (`src/hooks/`)
- [ ] `useAuth.ts` — `selectCurrentUser`, `selectIsAuthenticated`, `selectUserRole` из Redux
- [ ] `useListings.ts` — `useQuery` обёртка для `listingsApi.getAll`
- [ ] `useListing.ts` — `useQuery` для `listingsApi.getById`
- [ ] `useMyListings.ts` — `useQuery` для `listingsApi.getMy`
- [ ] `useFavorites.ts` — `useQuery` + `useMutation` для избранного
- [ ] `useSearch.ts` — `useQuery` для `searchApi.search`
- [ ] `useWebSocket.ts` — управление WS-соединением для чата (connect/disconnect/send)
- [ ] `useInfiniteListings.ts` — `useInfiniteQuery` для подгрузки при скролле (опционально)

---

## Этап 3 — Общие компоненты

### 3.1 Компоненты listing (`src/components/listing/`)

#### `ListingCard`
- [ ] Props: `listing: ListingBrief`, `onFavorite?`, `className?`
- [ ] Фото (lazy), Badge сделки, цена, площадь/комнаты, адрес
- [ ] Кнопка избранного (сердечко) — через `FavoriteButton`
- [ ] Hover: `shadow-md transition`
- [ ] Ссылка на `/listings/:id`

#### `ListingGallery`
- [ ] Props: `photos: Photo[]`
- [ ] Основное фото + миниатюры
- [ ] Переключение стрелками / клик по миниатюре
- [ ] Счётчик "1 / 8"

#### `FavoriteButton`
- [ ] Иконка сердца, toggle
- [ ] Если не авторизован — редирект на `/login`

#### `ListingCardSkeleton`
- [ ] shadcn/ui `Skeleton` для состояния загрузки

### 3.2 Компоненты поиска (`src/components/listing/`)

#### `FilterPanel`
- [ ] Поля: город (Input), тип сделки (Select), тип недвижимости (Select)
- [ ] Диапазон цены (два Input + Slider)
- [ ] Комнаты (кнопки-переключатели: студия, 1, 2, 3, 4+)
- [ ] Площадь min/max (Input)
- [ ] Этаж min/max (Input)
- [ ] Сортировка (Select: цена↑, цена↓, дата)
- [ ] Кнопки: "Применить", "Сбросить"
- [ ] Сохраняет состояние в Redux filtersSlice

#### `SearchAutocomplete`
- [ ] Debounced Input → `GET /search/autocomplete`
- [ ] Выпадающий список предложений с иконками (город / район / адрес)
- [ ] При выборе — навигация на `/listings?city=...`

#### `MapView` (ленивая загрузка!)
- [ ] Интеграция Яндекс.Карт API
- [ ] Отображение пинов из `GET /listings/map`
- [ ] Клик по пину — попап с ListingCard
- [ ] Загрузка только когда компонент виден (Intersection Observer)

---

## Этап 4 — Страницы

### 4.1 Home (`/`)
**Компоненты:**
- [ ] Hero-секция: большой заголовок + `SearchAutocomplete`
- [ ] Сетка "Свежие объявления": 6 карточек `ListingCard` (`GET /listings?limit=6`)
- [ ] Скелетоны на время загрузки
- [ ] CTA-баннер "Разместить объявление"

**API:** `GET /listings?limit=6&sort_by=created_at&sort_order=desc&status=active`

---

### 4.2 Login (`/login`)
**Компоненты:**
- [ ] Форма: email (Input), password (Input)
- [ ] Кнопка "Войти" (Button)
- [ ] Ссылка "Нет аккаунта? Зарегистрироваться"
- [ ] Показ ошибок (shadcn/ui Toast или inline)
- [ ] После успеха: `setCredentials` в Redux → редирект на `/`

**API:** `POST /auth/login` → `POST /auth/me` (для загрузки профиля)

---

### 4.3 Register (`/register`)
**Компоненты:**
- [ ] Форма: имя, email, password, роль (Select: Покупатель / Агент)
- [ ] Валидация: обязательные поля, email-формат, пароль минимум 8 символов
- [ ] После успеха: автологин → редирект на `/`

**API:** `POST /auth/register` → `POST /auth/login`

---

### 4.4 Listings (`/listings`)
**Компоненты:**
- [ ] Двухколоночный layout: `FilterPanel` слева + результаты справа
- [ ] Переключатель: Список / Карта
- [ ] Список: сетка `ListingCard` (grid 1→2→3 колонки)
- [ ] Карта: `MapView` на полный экран правой части
- [ ] `Pagination` (shadcn/ui)
- [ ] Счётчик результатов: "847 объявлений"
- [ ] Скелетоны при загрузке

**Фильтры:** синхронизируются с URL query params (`?city=Москва&deal_type=sale&page=2`)

**API:** `GET /listings` + `GET /listings/map` (для режима карты) + `GET /search` (при полнотекстовом поиске)

---

### 4.5 ListingDetail (`/listings/:id`)
**Компоненты:**
- [ ] `ListingGallery` — карусель фото
- [ ] Основные характеристики: цена (large), площадь, комнаты, этаж, тип сделки
- [ ] Описание (expandable если длинное)
- [ ] Карта с пином местоположения (`MapView` с одним пином)
- [ ] Блок "Продавец": `Avatar` + имя + роль + кнопка "Написать"
- [ ] Кнопка "Написать" → `POST /chat/conversations` → редирект на чат
- [ ] `FavoriteButton`
- [ ] Блок "Похожие объявления": горизонтальный скролл с `ListingCard`
- [ ] Breadcrumbs: Главная → Объявления → Название

**API:** `GET /listings/{id}` + `GET /listings/{id}/similar?limit=4`

---

### 4.6 Profile (`/profile`) — с табами
**Tabs (shadcn/ui Tabs):**

#### Таб "Профиль"
- [ ] Аватар (`Avatar`) + кнопка "Изменить фото" → `PATCH /users/me/avatar`
- [ ] Форма редактирования: имя, телефон
- [ ] Кнопка "Сохранить" → `PATCH /auth/me`
- [ ] Email — только отображение (нередактируемый)

#### Таб "Мои объявления" (`/profile/listings`)
- [ ] Фильтр статуса: Активные / Архивные / Проданные
- [ ] Список `ListingCard` с дополнительными кнопками: Редактировать, Архивировать
- [ ] Кнопка "Добавить объявление" (только agent/admin)
- [ ] `reject_reason` — отображать если объявление отклонено модератором

**API:** `GET /listings/my?status=active`

#### Таб "Избранное" (`/profile/favorites`)
- [ ] Сетка `ListingCard`
- [ ] Кнопка удаления из избранного

**API:** `GET /listings/favorites`

---

### 4.7 Chats (`/profile/chats` + `/profile/chats/:id`)

#### Список чатов (`/profile/chats`)
- [ ] Список `ConversationItem`: фото объявления, имя собеседника, последнее сообщение, время, счётчик непрочитанных (`Badge`)

**API:** `GET /chat/conversations`

#### Комната чата (`/profile/chats/:id`)
- [ ] Layout: информация об объявлении сверху
- [ ] История сообщений (пагинация вверх — загрузка предыдущих)
- [ ] `MessageBubble` — своё / чужое сообщение (разные стороны, цвета)
- [ ] Поле ввода + кнопка отправки
- [ ] WebSocket: подключение при mount, отключение при unmount
- [ ] Реалтайм: входящие сообщения добавляются в конец списка
- [ ] Автоскролл вниз при новых сообщениях

**API:** `GET /chat/conversations/{id}/messages` + `WS /chat/ws/{id}?token=...`

---

### 4.8 CreateListing (`/listings/create`)
**Многошаговая форма (Stepper):**

#### Шаг 1 — Основная информация
- [ ] Тип сделки (Select: Продажа/Аренда)
- [ ] Тип недвижимости (Select)
- [ ] Заголовок (Input)
- [ ] Описание (Textarea)
- [ ] Цена (Input + валюта)
- [ ] Площадь, комнаты, этаж, этажность (Input)

#### Шаг 2 — Местоположение
- [ ] Город, район, адрес (Input с автодополнением)
- [ ] Карта для уточнения координат (клик по карте → `latitude`, `longitude`)

#### Шаг 3 — Фотографии
- [ ] Drag-and-drop загрузка (или кнопка выбора файлов)
- [ ] Превью загруженных фото
- [ ] Drag-and-drop для изменения порядка
- [ ] Отметка главного фото
- [ ] Удаление фото
- [ ] Макс. 20 фото

#### Финал
- [ ] Предпросмотр объявления
- [ ] Кнопка "Опубликовать"

**API:**
- Шаг 1 → `POST /listings` (создаём черновик, получаем `id`)
- Шаг 3 → `POST /files/upload?listing_id={id}`
- Изменение порядка → `PATCH /files/reorder`
- Удаление фото → `DELETE /files/{photo_id}`

---

### 4.9 EditListing (`/listings/:id/edit`)
- [ ] Те же поля что и CreateListing, но заполнены данными из `GET /listings/{id}`
- [ ] Сохранение → `PATCH /listings/{id}`
- [ ] Управление фото: добавить новые, удалить, изменить порядок

---

### 4.10 Admin (`/admin`) — только role: admin
**Tabs:**

#### Таб "Дашборд"
- [ ] Карточки-счётчики: пользователи, объявления, сообщения (из `AdminStats`)
- [ ] Highlight: "15 объявлений ожидают модерации"

#### Таб "Пользователи"
- [ ] Поиск по имени/email (Input)
- [ ] Фильтр по роли (Select)
- [ ] Таблица: имя, email, роль, статус, кол-во объявлений, дата регистрации
- [ ] Кнопки: Заблокировать / Разблокировать

#### Таб "Модерация"
- [ ] Список объявлений ожидающих модерации (`is_moderated=false`)
- [ ] `ListingCard` с кнопками: Одобрить, Отклонить
- [ ] Диалог отклонения: поле `reason` (обязательное)

**API:** `GET /admin/stats` + `GET /admin/users` + `GET /admin/listings?is_moderated=false` + PATCH-эндпоинты

---

### 4.11 NotFound (`*`)
- [ ] Заглушка 404 с кнопкой "На главную"

---

## Этап 5 — Качество

### 5.1 Обработка ошибок
- [ ] Глобальный `ErrorBoundary` в `App.tsx`
- [ ] Словарь `ERROR_MESSAGES` (коды 400–500) — вынести в `src/utils/errorMessages.ts`
- [ ] Toast-уведомления для ошибок мутаций (через shadcn/ui Toast)
- [ ] Страница 404 для ненайденных объявлений (если `GET /listings/{id}` → 404)

### 5.2 Адаптивность (Mobile First)
- [ ] Брейкпоинты: 375px → 768px → 1280px → 1920px
- [ ] Header: бургер-меню на мобильном
- [ ] FilterPanel: скрыт за кнопкой "Фильтры" на мобильном
- [ ] ListingCard grid: 1 колонка (mobile) → 2 (tablet) → 3 (desktop)
- [ ] ListingDetail: галерея на весь экран на мобильном
- [ ] Chat: полноэкранный на мобильном

### 5.3 Производительность
- [ ] `loading="lazy"` у всех изображений
- [ ] Явные `width`/`height` у изображений
- [ ] Все страницы — `React.lazy` + `Suspense`
- [ ] `MapView` — загружать через `Intersection Observer` (только когда виден)
- [ ] `staleTime: 5 минут` в TanStack Query для стабильных данных

### 5.4 Доступность
- [ ] `alt` у всех изображений
- [ ] `aria-label` для иконочных кнопок (избранное, закрыть)
- [ ] Семантические теги: `main`, `nav`, `article`, `section`

---

## Порядок реализации (рекомендуемый)

```
0. Инициализация
1. Типы + Utils + Axios
2. Redux Store (auth + filters)
3. Router + Layout + App.tsx
4. API-модули (auth, listings)
5. Login + Register страницы
6. Home страница
7. ListingCard компонент
8. Listings страница (без карты)
9. ListingDetail страница
10. Profile страница (таб Профиль)
11. MyListings + Favorites (табы)
12. CreateListing + EditListing
13. Chats + ChatRoom
14. FilterPanel + интеграция с фильтрами
15. MapView (Яндекс.Карты)
16. Admin страница
17. NotFound
18. Адаптивность, ошибки, производительность
```

---

## Навигационные скиллы

В проекте настроены скиллы для быстрого скаффолдинга:

| Скилл | Команда | Что делает |
|---|---|---|
| `/new-page` | `/new-page Listings /listings` | Создаёт папку страницы + lazy import в router |
| `/new-component` | `/new-component ListingCard listing` | Создаёт компонент с TypeScript props |
| `/new-api` | `/new-api listings` | Создаёт API-модуль + хук |
| `/new-store-slice` | `/new-store-slice auth` | Создаёт Redux slice + хук |
| `/commit` | `/commit` | Conventional Commit на русском |

---

*Обновлено: апрель 2026 · Domiq Frontend*
