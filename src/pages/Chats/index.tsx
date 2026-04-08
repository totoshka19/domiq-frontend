import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileLayout } from '@/components/layout/ProfileLayout';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/api/chat';
import { formatRelativeDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

const Chats: React.FC = () => {
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
    staleTime: 1000 * 30,
  });

  return (
    <ProfileLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Сообщения</h1>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
            <MessageCircle className="w-10 h-10 text-gray-200" />
            <p className="text-muted-foreground">У вас пока нет сообщений</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/profile/chats/${conv.id}`}
                className="bg-white border rounded-2xl p-4 flex gap-3 items-center hover:shadow-sm transition-shadow"
              >
                {/* Аватар */}
                <Avatar className="w-11 h-11 flex-shrink-0">
                  <AvatarImage src={conv.other_user.avatar_url ?? undefined} alt={conv.other_user.full_name} />
                  <AvatarFallback>{conv.other_user.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 truncate">{conv.other_user.full_name}</span>
                    {conv.last_message && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatRelativeDate(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.listing.title}
                  </p>
                  {conv.last_message && (
                    <p className={cn('text-sm truncate mt-1', !conv.last_message.is_read && conv.unread_count > 0 ? 'font-medium text-gray-900' : 'text-muted-foreground')}>
                      {conv.last_message.text}
                    </p>
                  )}
                </div>

                {/* Непрочитанные */}
                {conv.unread_count > 0 && (
                  <Badge className="flex-shrink-0 rounded-full px-2 min-w-[22px] justify-center">
                    {conv.unread_count}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
};

export default Chats;
