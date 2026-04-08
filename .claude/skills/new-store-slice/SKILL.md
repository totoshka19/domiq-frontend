---
name: new-store-slice
description: Create a Redux Toolkit slice with actions and selectors. Use when adding new global state like auth, filters, UI state, or notifications.
disable-model-invocation: true
argument-hint: <sliceName>
---

Создай Redux Toolkit slice `$ARGUMENTS` для Domiq frontend.

## Шаги

1. Создай файл `src/store/${ARGUMENTS}Slice.ts`:

```tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

// Тип состояния
interface ${ARGUMENTS}State {
  // TODO: описать поля
  loading: boolean;
  error: string | null;
}

const initialState: ${ARGUMENTS}State = {
  loading: false,
  error: null,
};

// Async thunk (если нужен — например для загрузки данных)
export const fetch${ARGUMENTS} = createAsyncThunk(
  '$ARGUMENTS/fetch',
  async (_, { rejectWithValue }) => {
    try {
      // вызов API
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? 'Ошибка');
    }
  }
);

// Slice
export const ${ARGUMENTS}Slice = createSlice({
  name: '$ARGUMENTS',
  initialState,
  reducers: {
    // синхронные действия
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetch${ARGUMENTS}.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetch${ARGUMENTS}.fulfilled, (state, action) => {
        state.loading = false;
        // state.data = action.payload;
      })
      .addCase(fetch${ARGUMENTS}.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { reset } = ${ARGUMENTS}Slice.actions;

// Selectors
export const select${ARGUMENTS}Loading = (state: RootState) => state.$ARGUMENTS.loading;
export const select${ARGUMENTS}Error = (state: RootState) => state.$ARGUMENTS.error;

export default ${ARGUMENTS}Slice.reducer;
```

2. Зарегистрируй reducer в `src/store/index.ts`:
```tsx
import ${ARGUMENTS}Reducer from './${ARGUMENTS}Slice';

export const store = configureStore({
  reducer: {
    // существующие...
    $ARGUMENTS: ${ARGUMENTS}Reducer,
  },
});
```

3. Создай хук `src/hooks/use${ARGUMENTS}.ts` для удобного использования:
```tsx
import { useSelector, useDispatch } from 'react-redux';
import { select${ARGUMENTS}Loading, select${ARGUMENTS}Error } from '@/store/${ARGUMENTS}Slice';

export const use${ARGUMENTS} = () => {
  const loading = useSelector(select${ARGUMENTS}Loading);
  const error = useSelector(select${ARGUMENTS}Error);
  return { loading, error };
};
```

4. Покажи все файлы и обнови `src/store/index.ts`.

## Существующие слайсы Domiq
- `auth` — токены, текущий пользователь, роль
- `filters` — фильтры поиска (город, тип, цена, комнаты...)

## Правило: что хранить в Redux vs TanStack Query
| В Redux | В TanStack Query |
|---|---|
| access_token, refresh_token | listings, favorites |
| currentUser (роль, id) | searchResults |
| searchFilters | userProfile |
| UI state (sidebar open) | chatMessages |
