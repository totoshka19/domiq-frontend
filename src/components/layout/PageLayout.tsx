import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, className, fullWidth = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={cn('flex-1', !fullWidth && 'max-w-[1280px] mx-auto w-full px-4 py-6', className)}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
