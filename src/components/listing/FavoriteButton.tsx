import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToggleFavorite } from '@/hooks/useListings';

interface FavoriteButtonProps {
  listingId: string;
  isFavorite: boolean;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  listingId,
  isFavorite,
  className,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { add, remove } = useToggleFavorite(listingId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isFavorite) {
      remove.mutate();
    } else {
      add.mutate();
    }
  };

  const isPending = add.isPending || remove.isPending;

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full transition-all',
        'bg-white/90 hover:bg-white shadow-sm hover:shadow',
        isPending && 'opacity-60 cursor-not-allowed',
        className,
      )}
    >
      <Heart
        className={cn(
          'w-4 h-4 transition-colors',
          isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400',
        )}
      />
    </button>
  );
};
