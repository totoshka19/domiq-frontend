import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Heart, MessageCircle, LayoutList, LogOut, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  agentOnly?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/profile', label: 'Профиль', icon: <User className="w-4 h-4" /> },
  { to: '/profile/listings', label: 'Мои объявления', icon: <LayoutList className="w-4 h-4" />, agentOnly: true },
  { to: '/profile/favorites', label: 'Избранное', icon: <Heart className="w-4 h-4" /> },
  { to: '/profile/chats', label: 'Сообщения', icon: <MessageCircle className="w-4 h-4" /> },
  { to: '/admin', label: 'Администрирование', icon: <ShieldCheck className="w-4 h-4" />, adminOnly: true },
];

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const { isAgent, isAdmin, logout } = useAuth();

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.agentOnly) return isAgent;
    return true;
  });

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Навигация */}
        <aside className="w-full md:w-52 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {visibleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/profile'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-gray-100',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            <Separator className="hidden md:block my-2" />

            <button
              onClick={logout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </nav>
        </aside>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </PageLayout>
  );
};
