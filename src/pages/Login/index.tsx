import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { authApi } from '@/api/auth';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Некорректный email';
    if (!password) e.password = 'Введите пароль';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const tokens = await authApi.login({ email, password });
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      const user = await authApi.getMe();
      dispatch(setCredentials({
        user,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      }));
      toast.success('Добро пожаловать!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setErrors({ password: 'Неверный email или пароль' });
      } else {
        toast.error('Ошибка входа. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Логотип */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            Domiq
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Вход в аккаунт</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="anna@mail.ru"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((v) => ({ ...v, email: undefined })); }}
              autoComplete="email"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((v) => ({ ...v, password: undefined })); }}
                autoComplete="current-password"
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? 'Входим...' : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
