import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { authApi } from '@/api/auth';

type Role = 'user' | 'agent';

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  role?: string;
}

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (key: keyof FormErrors) =>
    setErrors((v) => ({ ...v, [key]: undefined }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!fullName.trim()) e.full_name = 'Введите имя';
    if (!email) e.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Некорректный email';
    if (!password) e.password = 'Введите пароль';
    else if (password.length < 8) e.password = 'Минимум 8 символов';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authApi.register({ full_name: fullName, email, password, role });
      const tokens = await authApi.login({ email, password });
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      const user = await authApi.getMe();
      dispatch(setCredentials({
        user,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      }));
      toast.success('Аккаунт создан!');
      navigate('/');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400 || status === 422) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        if (typeof detail === 'string' && detail.includes('already')) {
          setErrors({ email: 'Пользователь с таким email уже существует' });
        } else {
          toast.error('Проверьте введённые данные');
        }
      } else {
        toast.error('Ошибка регистрации. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Логотип */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            Domiq
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Создать аккаунт</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Имя и фамилия</Label>
            <Input
              id="full_name"
              placeholder="Введите ваше имя и фамилию"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); clearError('full_name'); }}
              autoComplete="name"
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Введите вашу почту"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
              autoComplete="email"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Минимум 8 символов"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
              autoComplete="new-password"
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Я регистрируюсь как</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Покупатель / Арендатор</SelectItem>
                <SelectItem value="agent">Агент / Застройщик</SelectItem>
              </SelectContent>
            </Select>
            {role === 'agent' && (
              <p className="text-xs text-muted-foreground">
                Агенты могут размещать объявления о продаже и аренде
              </p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
