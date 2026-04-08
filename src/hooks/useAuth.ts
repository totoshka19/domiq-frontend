import { useAppSelector, useAppDispatch } from '@/store';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectUserRole,
  selectIsInitialized,
  logout,
} from '@/store/authSlice';
import { authApi } from '@/api/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectUserRole);
  const isInitialized = useAppSelector(selectIsInitialized);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // игнорируем ошибку — всё равно разлогиниваем
      }
    }
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    role,
    isInitialized,
    isAgent: role === 'agent' || role === 'admin',
    isAdmin: role === 'admin',
    logout: handleLogout,
  };
};
