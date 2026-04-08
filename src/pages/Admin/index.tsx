import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, LayoutList, BarChart3, ShieldBan, ShieldCheck, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageLayout } from '@/components/layout/PageLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { formatPrice } from '@/utils/formatPrice';
import { formatRelativeDate } from '@/utils/formatDate';

const ROLE_LABEL: Record<string, string> = { user: 'Покупатель', agent: 'Агент', admin: 'Админ' };
const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = { user: 'secondary', agent: 'default', admin: 'outline' };

// ─── Статистика ───────────────────────────────────────────────────
const StatsTab: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.getStats });

  const cards = data ? [
    { label: 'Пользователей всего', value: data.users_total, sub: `+${data.users_new_today} сегодня` },
    { label: 'Активных пользователей', value: data.users_active },
    { label: 'Объявлений всего', value: data.listings_total },
    { label: 'Активных объявлений', value: data.listings_active },
    { label: 'На модерации', value: data.listings_pending_moderation },
    { label: 'Диалогов', value: data.conversations_total },
    { label: 'Сообщений', value: data.messages_total },
  ] : [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading
        ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        : cards.map((card) => (
          <div key={card.label} className="bg-white border rounded-2xl p-5 flex flex-col gap-1">
            <span className="text-2xl font-bold">{card.value.toLocaleString('ru-RU')}</span>
            <span className="text-sm text-muted-foreground">{card.label}</span>
            {card.sub && <span className="text-xs text-green-600">{card.sub}</span>}
          </div>
        ))}
    </div>
  );
};

// ─── Пользователи ─────────────────────────────────────────────────
const UsersTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, page],
    queryFn: () => adminApi.getUsers({ search: search || undefined, page, limit: 20 }),
    staleTime: 1000 * 30,
  });

  const blockMutation = useMutation({
    mutationFn: adminApi.blockUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('Пользователь заблокирован'); },
    onError: () => toast.error('Ошибка'),
  });
  const unblockMutation = useMutation({
    mutationFn: adminApi.unblockUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('Пользователь разблокирован'); },
    onError: () => toast.error('Ошибка'),
  });

  const users = data?.items ?? [];
  const pages = data?.pages ?? 1;

  return (
    <div className="flex flex-col gap-4">
      <Input placeholder="Поиск по имени или email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />

      {isLoading ? (
        <div className="flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Пользователи не найдены</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div key={u.id} className="bg-white border rounded-2xl px-4 py-3 flex items-center gap-3">
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback>{u.full_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{u.full_name}</span>
                  <Badge variant={ROLE_VARIANT[u.role] ?? 'secondary'} className="text-xs">{ROLE_LABEL[u.role] ?? u.role}</Badge>
                  {!u.is_active && <Badge variant="destructive" className="text-xs">Заблокирован</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{u.email} · {u.listings_count} объявл. · {formatRelativeDate(u.created_at)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => u.is_active ? blockMutation.mutate(u.id) : unblockMutation.mutate(u.id)}
                disabled={blockMutation.isPending || unblockMutation.isPending}
                className={u.is_active ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-700'}
              >
                {u.is_active ? <><ShieldBan className="w-4 h-4 mr-1.5" />Заблокировать</> : <><ShieldCheck className="w-4 h-4 mr-1.5" />Разблокировать</>}
              </Button>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center gap-2 justify-center pt-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Назад</Button>
          <span className="text-sm text-muted-foreground">{page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Вперёд</Button>
        </div>
      )}
    </div>
  );
};

// ─── Модерация ────────────────────────────────────────────────────
const ModerationTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pending'],
    queryFn: () => adminApi.getPendingListings({ limit: 50 }),
    staleTime: 1000 * 30,
  });

  const approveMutation = useMutation({
    mutationFn: adminApi.approveListing,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'pending'] }); queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }); toast.success('Объявление одобрено'); },
    onError: () => toast.error('Ошибка'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectListing(id, reason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'pending'] }); queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }); toast.success('Объявление отклонено'); setRejectTarget(null); setRejectReason(''); },
    onError: () => toast.error('Ошибка'),
  });

  const listings = data?.items ?? [];

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">Нет объявлений на модерации</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white border rounded-2xl p-4 flex gap-4 items-start">
              <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {listing.photos[0] ? (
                  <img src={listing.photos[0].url} alt={listing.title} width={64} height={64} className="w-full h-full object-cover" loading="lazy" />
                ) : <div className="w-full h-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/listings/${listing.id}`} target="_blank" className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">
                  {listing.title}
                </Link>
                <p className="text-sm font-semibold text-primary mt-0.5">{formatPrice(listing.price, listing.currency)}</p>
                <p className="text-xs text-muted-foreground">{listing.city}, {listing.address} · {listing.owner.full_name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => approveMutation.mutate(listing.id)} disabled={approveMutation.isPending}>
                  <Check className="w-4 h-4 mr-1" />Одобрить
                </Button>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => setRejectTarget(listing.id)}>
                  <X className="w-4 h-4 mr-1" />Отклонить
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Диалог отклонения */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) { setRejectTarget(null); setRejectReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Причина отклонения</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="reason">Укажите причину для автора</Label>
            <textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Например: фотографии не соответствуют объявлению..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(''); }}>Отмена</Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => rejectTarget && rejectMutation.mutate({ id: rejectTarget, reason: rejectReason })}
            >
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── Главная страница ──────────────────────────────────────────────
const Admin: React.FC = () => {
  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Администрирование</h1>

        <Tabs defaultValue="stats">
          <TabsList className="mb-4">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />Статистика
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />Пользователи
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <LayoutList className="w-4 h-4" />Модерация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats"><StatsTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="moderation"><ModerationTab /></TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Admin;
