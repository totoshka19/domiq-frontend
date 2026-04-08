---
name: new-api
description: Create a typed API module in src/api/ for a backend endpoint group. Use when adding new API calls to listings, auth, chat, search, or any other backend module.
disable-model-invocation: true
argument-hint: <module-name>
---

Создай API-модуль `src/api/$ARGUMENTS.ts` для Domiq frontend.

## Шаги

1. Прочитай `FRONTEND_API_MAP.md` чтобы увидеть все эндпоинты для модуля `$ARGUMENTS`.

2. Создай типы в `src/types/$ARGUMENTS.ts` (если ещё не существует):
```tsx
export interface <Entity> {
  id: string;
  // поля из API-документации
  created_at: string;
}

export interface <Entity>Create {
  // поля для создания
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
```

3. Создай модуль `src/api/$ARGUMENTS.ts`:
```tsx
import api from './axios';
import type { <Entity>, <Entity>Create, PaginatedResponse } from '@/types/$ARGUMENTS';

export interface Get<Entity>sParams {
  page?: number;
  limit?: number;
  // параметры фильтрации
}

export const ${ARGUMENTS}Api = {
  // GET — список
  getAll: async (params?: Get<Entity>sParams): Promise<PaginatedResponse<<Entity>>> => {
    const { data } = await api.get('/$ARGUMENTS', { params });
    return data;
  },

  // GET — один элемент
  getById: async (id: string): Promise<<Entity>> => {
    const { data } = await api.get(`/$ARGUMENTS/${id}`);
    return data;
  },

  // POST — создать
  create: async (payload: <Entity>Create): Promise<<Entity>> => {
    const { data } = await api.post('/$ARGUMENTS', payload);
    return data;
  },

  // PATCH — обновить
  update: async (id: string, payload: Partial<<Entity>Create>): Promise<<Entity>> => {
    const { data } = await api.patch(`/$ARGUMENTS/${id}`, payload);
    return data;
  },

  // DELETE
  remove: async (id: string): Promise<void> => {
    await api.delete(`/$ARGUMENTS/${id}`);
  },
};
```

4. Создай TanStack Query хук в `src/hooks/use<Entity>s.ts`:
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ${ARGUMENTS}Api } from '@/api/$ARGUMENTS';
import type { Get<Entity>sParams } from '@/api/$ARGUMENTS';

export const use<Entity>s = (params?: Get<Entity>sParams) => {
  return useQuery({
    queryKey: ['$ARGUMENTS', params],
    queryFn: () => ${ARGUMENTS}Api.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const use<Entity> = (id: string) => {
  return useQuery({
    queryKey: ['$ARGUMENTS', id],
    queryFn: () => ${ARGUMENTS}Api.getById(id),
    enabled: !!id,
  });
};

export const useCreate<Entity> = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ${ARGUMENTS}Api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['$ARGUMENTS'] });
    },
  });
};
```

5. Покажи все созданные файлы.

## Существующие API-модули Domiq
- `auth` — регистрация, логин, профиль
- `listings` — объявления, избранное
- `search` — поиск, автодополнение
- `chat` — чаты, сообщения
- `files` — загрузка фото
- `admin` — управление пользователями и объявлениями
