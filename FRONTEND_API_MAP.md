# Domiq — API для фронтенда

> Какая страница какие эндпоинты использует, что отправляет и что получает в ответ.
> Base URL: `http://localhost:8000/api` (dev) / `https://api.domiq.ru/api` (prod)

---

## Содержание

1. [Авторизация](#1-авторизация)
2. [Главная страница](#2-главная-страница)
3. [Поисковая выдача](#3-поисковая-выдача)
4. [Карточка объявления](#4-карточка-объявления)
5. [Личный кабинет](#5-личный-кабинет)
6. [Создание / редактирование объявления](#6-создание--редактирование-объявления)
7. [Чат](#7-чат)
8. [Админ-панель](#8-админ-панель)
9. [Общие правила работы с API](#9-общие-правила-работы-с-api)

---

## 1. Авторизация

### Страницы: `/register`, `/login`

#### Регистрация
```
POST /auth/register

Тело запроса:
{
  "email": "anna@mail.ru",
  "password": "SecurePass123",
  "full_name": "Анна Капитанова",
  "role": "user"          // "user" | "agent"
}

Ответ 201:
{
  "id": "uuid",
  "email": "anna@mail.ru",
  "full_name": "Анна Капитанова",
  "role": "user"
}
```

#### Логин
```
POST /auth/login

Тело запроса:
{
  "email": "anna@mail.ru",
  "password": "SecurePass123"
}

Ответ 200:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

#### Обновить access_token
```
POST /auth/refresh

Тело запроса:
{
  "refresh_token": "eyJ..."
}

Ответ 200:
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

#### Выход
```
POST /auth/logout

Тело запроса:
{
  "refresh_token": "eyJ..."
}

Ответ 204: (пустой)
```
> После logout refresh_token заносится в blacklist — повторный `/auth/refresh` с ним вернёт 401.
> Фронтенд должен удалить оба токена из localStorage после успешного запроса.

---

## 2. Главная страница

### Страница: `/`

На главной нужны только два запроса — featured объявления и строка поиска.

#### Получить рекомендованные объявления (featured)
```
GET /listings?limit=6&sort_by=created_at&sort_order=desc&status=active

Ответ 200:
{
  "items": [
    {
      "id": "uuid",
      "title": "2-комн. квартира у метро",
      "price": 7500000,
      "currency": "RUB",
      "deal_type": "sale",
      "property_type": "apartment",
      "area": 54.5,
      "rooms": 2,
      "city": "Москва",
      "district": "Таганский",
      "address": "ул. Таганская, 15",
      "latitude": 55.7414,
      "longitude": 37.6550,
      "main_photo_url": "https://storage.yandex.../photo.jpg",
      "created_at": "2026-04-01T10:00:00Z"
    },
    ...
  ],
  "total": 1240,
  "page": 1,
  "limit": 6
}
```

#### Автодополнение в строке поиска
```
GET /search/autocomplete?q=Москва

Ответ 200:
{
  "suggestions": [
    { "type": "city",     "value": "Москва" },
    { "type": "district", "value": "Москва, Пресненский район" },
    { "type": "address",  "value": "Москва, ул. Арбат" }
  ]
}
```

---

## 3. Поисковая выдача

### Страница: `/listings` (список + фильтры + карта)

#### Получить список объявлений с фильтрами
```
GET /listings?page=1&limit=20&city=Москва&deal_type=sale&property_type=apartment
             &price_min=3000000&price_max=10000000&rooms=2&area_min=40
             &sort_by=price&sort_order=asc

Параметры:
  page            число, default 1
  limit           число, default 20, max 50
  city            строка
  deal_type       "sale" | "rent"
  property_type   "apartment" | "house" | "commercial" | "land"
  price_min       число
  price_max       число
  rooms           число (0 = студия)
  area_min        число
  area_max        число
  floor_min       число
  floor_max       число
  sort_by         "price" | "area" | "created_at"
  sort_order      "asc" | "desc"

Ответ 200:
{
  "items": [ ...массив объявлений... ],
  "total": 847,
  "page": 1,
  "limit": 20,
  "pages": 43
}
```

#### Полнотекстовый поиск
```
GET /search?q=квартира+рядом+с+парком&city=Москва&deal_type=rent&page=1

Ответ 200:
{
  "items": [ ...массив объявлений с полем relevance_score... ],
  "total": 23,
  "page": 1
}
```

#### Объявления на карте (только координаты, без деталей)
```
GET /listings/map?city=Москва&deal_type=sale&price_max=10000000

Ответ 200:
{
  "points": [
    { "id": "uuid", "latitude": 55.74, "longitude": 37.65, "price": 7500000 },
    ...
  ]
}
```
> Используется для отображения пинов на карте — лёгкий запрос без фото и длинных текстов.

---

## 4. Карточка объявления

### Страница: `/listings/:id`

#### Получить объявление по ID
```
GET /listings/{id}

Ответ 200:
{
  "id": "uuid",
  "title": "2-комн. квартира у метро",
  "description": "Просторная квартира...",
  "price": 7500000,
  "currency": "RUB",
  "deal_type": "sale",
  "property_type": "apartment",
  "area": 54.5,
  "rooms": 2,
  "floor": 5,
  "floors_total": 9,
  "city": "Москва",
  "district": "Таганский",
  "address": "ул. Таганская, 15",
  "latitude": 55.7414,
  "longitude": 37.6550,
  "status": "active",
  "photos": [
    { "id": "uuid", "url": "https://...", "is_main": true,  "order": 0 },
    { "id": "uuid", "url": "https://...", "is_main": false, "order": 1 }
  ],
  "owner": {
    "id": "uuid",
    "full_name": "Иван Петров",
    "avatar_url": "https://...",   // null если аватар не загружен
    "role": "agent"
  },
  "is_favorite": false,    // поле зарезервировано, всегда false — см. примечание ниже
  "created_at": "2026-04-01T10:00:00Z",
  "updated_at": "2026-04-02T12:00:00Z"
}
```

#### Добавить в избранное
```
POST /listings/{id}/favorite
Authorization: Bearer <access_token>

Ответ 204: (пустой)
```

#### Убрать из избранного
```
DELETE /listings/{id}/favorite
Authorization: Bearer <access_token>

Ответ 204: (пустой)
```

#### Начать чат с продавцом
```
POST /chat/conversations
Authorization: Bearer <access_token>

Тело:
{
  "listing_id": "uuid"
}

Ответ 201:
{
  "id": "uuid",           // conversation_id для WebSocket
  "listing_id": "uuid",
  "buyer_id": "uuid",
  "seller_id": "uuid",
  "created_at": "..."
}
```

#### Похожие объявления (для блока "Смотрите также")
```
GET /listings/{id}/similar?limit=4

Ответ 200: [ ...массив похожих объявлений... ]
```
> Возвращает массив напрямую (не обёртку `{"items": []}`). Тот же формат объекта что и GET /listings/{id}.
> Фильтрует по городу, deal_type и property_type. Сортирует по близости цены.

---

## 5. Личный кабинет

### Страница: `/profile`

#### Получить профиль текущего пользователя
```
GET /auth/me
Authorization: Bearer <access_token>

Ответ 200:
{
  "id": "uuid",
  "email": "anna@mail.ru",
  "full_name": "Анна Капитанова",
  "phone": "+79001234567",
  "avatar_url": "https://...",
  "role": "user",
  "is_active": true,
  "created_at": "2026-01-15T09:00:00Z"
}
```

#### Обновить профиль
```
PATCH /auth/me
Authorization: Bearer <access_token>

Тело (все поля опциональны):
{
  "full_name": "Анна Новая",
  "phone": "+79009999999"
}

Ответ 200: { ...обновлённый профиль... }
```

#### Загрузить аватар
```
PATCH /users/me/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Поля формы:
  file: <бинарные данные фото>   // jpeg, png или webp, макс. 10 МБ

Ответ 200: { ...обновлённый профиль пользователя с новым avatar_url... }
```
> Повторная загрузка перезаписывает предыдущий аватар (хранится по ключу `avatars/{user_id}.{ext}`).

#### Мои объявления
```
GET /listings/my?page=1&limit=10&status=active
Authorization: Bearer <access_token>

Параметр status: "active" | "archived" | "sold" | все (без параметра)

Ответ 200:
{
  "items": [ ...мои объявления... ],
  "total": 5
}
```

#### Мои избранные
```
GET /listings/favorites?page=1&limit=20
Authorization: Bearer <access_token>

Ответ 200:
{
  "items": [ ...избранные объявления... ],
  "total": 12
}
```

---

## 6. Создание / редактирование объявления

### Страница: `/listings/create`, `/listings/:id/edit`

#### Шаг 1 — Создать объявление (черновик)
```
POST /listings
Authorization: Bearer <access_token>   // только role: agent или admin

Тело:
{
  "title": "2-комн. квартира у метро",
  "description": "Просторная светлая квартира...",
  "deal_type": "sale",
  "property_type": "apartment",
  "price": 7500000,
  "currency": "RUB",
  "area": 54.5,
  "rooms": 2,
  "floor": 5,
  "floors_total": 9,
  "address": "ул. Таганская, 15",
  "city": "Москва",
  "district": "Таганский",
  "latitude": 55.7414,
  "longitude": 37.6550
}

Ответ 201:
{
  "id": "uuid",    // <-- сохранить! нужен для загрузки фото
  ...все поля...
}
```

#### Шаг 2 — Загрузить фото
```
POST /files/upload?listing_id={uuid}
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Поля:
  files: <бинарные данные фото>   // можно несколько файлов за раз

Ответ 201: [
  {
    "id": "uuid",
    "listing_id": "uuid",
    "url": "https://storage.../photo.jpg",
    "order": 0,
    "is_main": true
  },
  ...
]
```
> `listing_id` передаётся как query-параметр, файлы — в поле `files` (multipart).
> Первое фото автоматически становится главным (`is_main: true`). Макс. 20 фото на объявление.

#### Обновить объявление
```
PATCH /listings/{id}
Authorization: Bearer <access_token>

Тело (все поля опциональны):
{
  "price": 7200000,
  "description": "Снижена цена!..."
}

Ответ 200: { ...обновлённое объявление... }
```

#### Изменить порядок фото
```
PATCH /files/reorder
Authorization: Bearer <access_token>

Тело:
{
  "listing_id": "uuid",
  "photos": [
    { "photo_id": "uuid-1", "order": 0, "is_main": true  },
    { "photo_id": "uuid-2", "order": 1, "is_main": false },
    { "photo_id": "uuid-3", "order": 2, "is_main": false }
  ]
}

Ответ 200: { "message": "updated" }
```

#### Удалить фото
```
DELETE /files/{photo_id}
Authorization: Bearer <access_token>

Ответ 204: (пустой)
```

#### Архивировать объявление
```
DELETE /listings/{id}
Authorization: Bearer <access_token>

Ответ 200: { "status": "archived" }
```

---

## 7. Чат

### Страница: `/profile/chats`, `/profile/chats/:id`

#### Список всех чатов пользователя
```
GET /chat/conversations
Authorization: Bearer <access_token>

Ответ 200:
{
  "items": [
    {
      "id": "uuid",
      "listing": {
        "id": "uuid",
        "title": "2-комн. квартира",
        "main_photo_url": "https://..."
      },
      "other_user": {
        "id": "uuid",
        "full_name": "Иван Петров",
        "avatar_url": "https://..."
      },
      "last_message": {
        "text": "Можно посмотреть завтра?",
        "created_at": "2026-04-05T18:00:00Z",
        "is_read": false
      },
      "unread_count": 2
    },
    ...
  ]
}
```

#### История сообщений
```
GET /chat/conversations/{id}/messages?page=1&limit=50
Authorization: Bearer <access_token>

Ответ 200:
{
  "items": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "text": "Здравствуйте! Квартира ещё продаётся?",
      "is_read": true,
      "created_at": "2026-04-05T17:45:00Z"
    },
    ...
  ],
  "total": 24
}
```

#### WebSocket — отправка и получение сообщений
```
WS /chat/ws/{conversation_id}?token=<access_token>

// Отправить сообщение (клиент → сервер):
{
  "text": "Можно посмотреть завтра в 15:00?"
}

// Получить сообщение (сервер → клиент):
{
  "id": "uuid",
  "sender_id": "uuid",
  "text": "Можно посмотреть завтра в 15:00?",
  "created_at": "2026-04-05T18:05:00Z"
}
```

#### Пример подключения WebSocket на фронтенде
```typescript
const conversationId = "uuid";
const token = localStorage.getItem("access_token");

const ws = new WebSocket(
  `ws://localhost:8000/api/chat/ws/${conversationId}?token=${token}`
);

ws.onopen = () => console.log("Чат подключён");

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // добавить сообщение в список
};

// Отправить сообщение
const sendMessage = (text: string) => {
  ws.send(JSON.stringify({ text }));
};
```

---

## 8. Админ-панель

### Страница: `/admin` (доступна только role: admin)

#### Статистика (дашборд)
```
GET /admin/stats
Authorization: Bearer <access_token>

Ответ 200:
{
  "users_total": 1240,
  "users_active": 1180,
  "users_new_today": 5,
  "listings_total": 847,
  "listings_active": 612,
  "listings_pending_moderation": 15,
  "conversations_total": 3420,
  "messages_total": 18900
}
```

#### Список пользователей
```
GET /admin/users?page=1&limit=20&role=agent&search=Иван
Authorization: Bearer <access_token>

Ответ 200:
{
  "items": [
    {
      "id": "uuid",
      "email": "ivan@mail.ru",
      "full_name": "Иван Петров",
      "role": "agent",
      "is_active": true,
      "listings_count": 12,
      "created_at": "..."
    }
  ],
  "total": 45
}
```

#### Заблокировать пользователя
```
PATCH /admin/users/{id}/block
Authorization: Bearer <access_token>

Ответ 200: { ...обновлённый профиль пользователя с is_active: false... }
```

#### Разблокировать пользователя
```
PATCH /admin/users/{id}/unblock
Authorization: Bearer <access_token>

Ответ 200: { ...обновлённый профиль пользователя с is_active: true... }
```

#### Объявления на модерацию
```
GET /admin/listings?is_moderated=false&page=1
Authorization: Bearer <access_token>

Ответ 200:
{
  "items": [ ...объявления ожидающие модерации... ],
  "total": 15
}
```

#### Одобрить объявление
```
PATCH /admin/listings/{id}/approve
Authorization: Bearer <access_token>

Ответ 200: { "status": "active" }
```

#### Отклонить объявление
```
PATCH /admin/listings/{id}/reject
Authorization: Bearer <access_token>

Тело:
{
  "reason": "Фото не соответствуют описанию"   // обязательное поле
}

Ответ 200:
{
  "id": "uuid",
  "status": "archived",
  "is_moderated": false,
  "reject_reason": "Фото не соответствуют описанию",
  ...
}
```
> `reject_reason` также присутствует в ответе `GET /listings/{id}` и `GET /listings/my` —
> агент видит причину отказа в личном кабинете. При повторном approve поле сбрасывается в null.

---

## 9. Общие правила работы с API

### 9.1 Заголовки авторизации
```typescript
// axios instance (src/api/axios.ts)
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:8000/api
});

// Автоматически добавлять токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Автоматически обновлять токен при 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      const { data } = await axios.post("/auth/refresh", { refresh_token: refreshToken });
      localStorage.setItem("access_token", data.access_token);
      return api(error.config); // повторить запрос
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 9.2 Коды ошибок
| Код | Значение | Что показать пользователю |
|---|---|---|
| 400 | Неверные данные | Показать ошибку из `detail` |
| 401 | Не авторизован | Редирект на `/login` |
| 403 | Нет доступа | "У вас нет прав для этого действия" |
| 404 | Не найдено | Страница 404 |
| 422 | Ошибка валидации | Показать ошибки полей формы |
| 429 | Слишком много запросов | "Подождите немного" |
| 500 | Ошибка сервера | "Что-то пошло не так, попробуйте позже" |

### 9.3 Формат ошибок от FastAPI
```json
// 422 Validation Error
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}

// 400 / 403 / 404
{
  "detail": "Listing not found"
}
```

### 9.4 Переменные окружения фронтенда (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/api
VITE_YANDEX_MAPS_KEY=your-key-here
```

### 9.5 Сводная таблица всех эндпоинтов
| Страница | Метод | URL | Авторизация |
|---|---|---|---|
| Главная | GET | /listings | Нет |
| Главная | GET | /search/autocomplete | Нет |
| Выдача | GET | /listings | Нет |
| Выдача | GET | /search | Нет |
| Выдача | GET | /listings/map | Нет |
| Карточка | GET | /listings/{id} | Нет |
| Карточка | GET | /listings/{id}/similar | Нет |
| Карточка | POST | /listings/{id}/favorite | Да |
| Карточка | DELETE | /listings/{id}/favorite | Да |
| Карточка | POST | /chat/conversations | Да |
| Регистрация | POST | /auth/register | Нет |
| Логин | POST | /auth/login | Нет |
| Профиль | GET | /auth/me | Да |
| Профиль | PATCH | /auth/me | Да |
| Профиль | PATCH | /users/me/avatar | Да |
| Мои объявл. | GET | /listings/my | Да |
| Избранное | GET | /listings/favorites | Да |
| Создать объявл. | POST | /listings | Да (agent) |
| Создать объявл. | POST | /files/upload (фото) | Да (agent) |
| Редакт. объявл. | PATCH | /listings/{id} | Да (владелец) |
| Редакт. объявл. | PATCH | /files/reorder | Да (владелец) |
| Редакт. объявл. | DELETE | /files/{photo_id} | Да (владелец) |
| Удалить объявл. | DELETE | /listings/{id} | Да (владелец) |
| Чаты | GET | /chat/conversations | Да |
| Чат | GET | /chat/conversations/{id}/messages | Да |
| Чат | WS | /chat/ws/{id} | Да (токен в URL) |
| Админ | GET | /admin/stats | Да (admin) |
| Админ | GET | /admin/users | Да (admin) |
| Админ | PATCH | /admin/users/{id}/block | Да (admin) |
| Админ | PATCH | /admin/users/{id}/unblock | Да (admin) |
| Админ | GET | /admin/listings | Да (admin) |
| Админ | PATCH | /admin/listings/{id}/approve | Да (admin) |
| Админ | PATCH | /admin/listings/{id}/reject | Да (admin) |

---

*Создано для проекта Domiq · Апрель 2026*
