import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Логотип и описание */}
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <Home className="w-4 h-4" />
              Domiq
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Маркетплейс недвижимости — находите, продавайте и сдавайте квартиры, дома и коммерческую недвижимость.
            </p>
          </div>

          {/* Ссылки */}
          <nav className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-muted-foreground">
            <Link to="/listings" className="hover:text-primary transition-colors">
              Объявления
            </Link>
            <Link to="/register" className="hover:text-primary transition-colors">
              Стать агентом
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
          © {new Date().getFullYear()} Domiq. Все права защищены.
        </div>
      </div>
    </footer>
  );
};
