import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';
import type { RootState } from './index';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isInitialized: false,
};

export const initAuth = createAsyncThunk(
  'auth/init',
  async (_, { dispatch }) => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      // Динамический импорт чтобы избежать циклической зависимости
      const { authApi } = await import('@/api/auth');
      const user = await authApi.getMe();
      return user;
    } catch {
      dispatch(logout());
      return null;
    }
  },
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('access_token', action.payload.accessToken);
      localStorage.setItem('refresh_token', action.payload.refreshToken);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(initAuth.rejected, (state) => {
        state.isInitialized = true;
      });
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user;
export const selectUserRole = (state: RootState) => state.auth.user?.role ?? null;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;

export default authSlice.reducer;
