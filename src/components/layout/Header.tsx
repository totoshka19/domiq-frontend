import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Search, PlusCircle, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAgent, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm">
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Логотип */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Home className="w-5 h-5" />
          Domiq
        </Link>

        {/* Навигация — desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/listings"
            className={({ isActive }) =>
              cn('text-sm font-medium transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-muted-foreground')
            }
          >
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              Объявления
            </span>
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn('text-sm font-medium transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-muted-foreground')
              }
            >
              Админ
            </NavLink>
          )}
        </nav>

        {/* Правая часть — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {isAgent && (
            <Button size="sm" asChild>
              <Link to="/listings/create">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Разместить
              </Link>
            </Button>
          )}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
                    <AvatarFallback className="text-xs">{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Профиль
                  </Link>
                </DropdownMenuItem>
                {isAgent && (
                  <DropdownMenuItem asChild>
                    <Link to="/profile/listings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Мои объявления
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Регистрация</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Бургер — mobile */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Открыть меню"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 flex flex-col gap-3">
          <NavLink
            to="/listings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn('flex items-center gap-2 text-sm font-medium py-2', isActive ? 'text-primary' : 'text-foreground')
            }
          >
            <Search className="w-4 h-4" />
            Объявления
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn('text-sm font-medium py-2', isActive ? 'text-primary' : 'text-foreground')
              }
            >
              Админ
            </NavLink>
          )}

          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn('flex items-center gap-2 text-sm font-medium py-2', isActive ? 'text-primary' : 'text-foreground')
                }
              >
                <User className="w-4 h-4" />
                Профиль
              </NavLink>
              {isAgent && (
                <Button size="sm" asChild onClick={() => setMobileOpen(false)}>
                  <Link to="/listings/create">
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Разместить
                  </Link>
                </Button>
              )}
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="flex items-center gap-2 text-sm font-medium text-destructive py-2"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/login">Войти</Link>
              </Button>
              <Button asChild onClick={() => setMobileOpen(false)}>
                <Link to="/register">Регистрация</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
