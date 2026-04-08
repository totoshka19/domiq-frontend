import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProfileLayout } from '@/components/layout/ProfileLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/authSlice';
import { authApi } from '@/api/auth';
import { formatFullDate } from '@/utils/formatDate';

const ROLE_LABEL: Record<string, string> = {
  user: 'Покупатель',
  agent: 'Агент',
  admin: 'Администратор',
};

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAgent } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setIsSaving(true);
    try {
      const updated = await authApi.updateMe({ full_name: fullName.trim(), phone: phone.trim() || undefined });
      dispatch(setUser(updated));
      toast.success('Профиль обновлён');
    } catch {
      toast.error('Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const updated = await authApi.uploadAvatar(file);
      dispatch(setUser(updated));
      toast.success('Фото обновлено');
    } catch {
      toast.error('Не удалось загрузить фото');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <ProfileLayout>
      <div className="flex flex-col gap-4">
        {/* Аватар + инфо */}
        <div className="bg-white border rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
              <AvatarFallback className="text-2xl">
                {user.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
              aria-label="Загрузить фото"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xl font-semibold text-gray-900">{user.full_name}</span>
              <Badge variant="secondary" className="text-xs">{ROLE_LABEL[user.role] ?? user.role}</Badge>
            </div>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            {user.phone && <span className="text-sm text-muted-foreground">{user.phone}</span>}
            <span className="text-xs text-muted-foreground/70 mt-1">На Domiq с {formatFullDate(user.created_at)}</span>
          </div>
        </div>

        {/* Форма редактирования */}
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4">Редактировать профиль</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Имя и фамилия</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Введите имя и фамилию" autoComplete="name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email изменить нельзя</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 000-00-00" type="tel" autoComplete="tel" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={isSaving || !fullName.trim()}>{isSaving ? 'Сохраняем...' : 'Сохранить'}</Button>
              <Button type="button" variant="ghost" onClick={() => { setFullName(user.full_name); setPhone(user.phone ?? ''); }}>Отмена</Button>
            </div>
          </form>
        </div>

        {/* Агентам — ссылка на создание */}
        {isAgent && (
          <div className="bg-white border rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Разместить объявление</p>
              <p className="text-sm text-muted-foreground mt-0.5">Добавьте новый объект для продажи или аренды</p>
            </div>
            <Button asChild><Link to="/listings/create">Добавить</Link></Button>
          </div>
        )}
      </div>
    </ProfileLayout>
  );
};

export default Profile;
