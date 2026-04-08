---
name: new-page
description: Create a new page component with folder structure, route registration, and lazy loading. Use when adding a new page or route to the app.
disable-model-invocation: true
argument-hint: <PageName> [/route-path]
---

Создай новую страницу `$ARGUMENTS` для Domiq frontend.

## Шаги

1. Определи имя страницы и путь из `$ARGUMENTS`:
   - Первое слово — имя компонента (PascalCase)
   - Второе слово — путь маршрута (если указан)

2. Создай папку `src/pages/<PageName>/` с файлами:

**`src/pages/<PageName>/index.tsx`**
```tsx
import React from 'react';
import styles from './<PageName>.module.scss';

const <PageName>: React.FC = () => {
  return (
    <div className={styles.page}>
      <h1><PageName></h1>
    </div>
  );
};

export default <PageName>;
```

**`src/pages/<PageName>/<PageName>.module.scss`**
```scss
.page {
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
}
```

3. Добавь lazy import в `src/router.tsx`:
```tsx
const <PageName> = React.lazy(() => import('@/pages/<PageName>'));

// В routes добавить:
{
  path: '/route-path',
  element: (
    <Suspense fallback={<PageSkeleton />}>
      <<PageName> />
    </Suspense>
  ),
}
```

4. Если страница требует авторизации — обернуть в `<ProtectedRoute>`:
```tsx
{
  path: '/profile',
  element: (
    <ProtectedRoute>
      <Suspense fallback={<PageSkeleton />}>
        <Profile />
      </Suspense>
    </ProtectedRoute>
  ),
}
```

5. Покажи все созданные файлы и изменения в `router.tsx`.

## Страницы Domiq и их маршруты
| Страница | Путь | Защищена |
|---|---|---|
| Home | / | нет |
| Listings | /listings | нет |
| ListingDetail | /listings/:id | нет |
| Login | /login | нет |
| Register | /register | нет |
| Profile | /profile | да |
| MyListings | /profile/listings | да |
| Favorites | /profile/favorites | да |
| Chat | /profile/chat | да |
| ChatRoom | /profile/chat/:id | да |
| CreateListing | /listings/create | да (agent) |
| EditListing | /listings/:id/edit | да (agent) |
| Admin | /admin | да (admin) |
