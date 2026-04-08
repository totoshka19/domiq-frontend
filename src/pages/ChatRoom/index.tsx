import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageLayout } from '@/components/layout/PageLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/api/chat';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import type { Message, WsIncomingMessage } from '@/types/chat';

const ChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // История сообщений
  const { data, isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => chatApi.getMessages(id!, { limit: 100 }),
    enabled: !!id,
    staleTime: 0,
  });

  // Загружаем историю в локальный state + отмечаем прочитанными
  useEffect(() => {
    if (data) {
      setLocalMessages(data);
      if (id) {
        chatApi.markAsRead(id).then(() => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }).catch(() => {});
      }
    }
  }, [data, id, queryClient]);

  // WebSocket
  const { sendMessage } = useWebSocket({
    conversationId: id ?? '',
    onMessage: (msg: WsIncomingMessage) => {
      const newMessage: Message = {
        id: msg.id,
        sender_id: msg.sender_id,
        text: msg.text,
        is_read: false,
        created_at: msg.created_at,
      };
      setLocalMessages((prev) => [...prev, newMessage]);
    },
    onOpen: () => setWsConnected(true),
    onClose: () => setWsConnected(false),
  });

  // Скролл к последнему сообщению
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Диалог для заголовка
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
    staleTime: 1000 * 60,
  });
  const conversation = conversations.find((c) => c.id === id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !wsConnected) return;
    sendMessage(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <PageLayout>
      <div className="flex flex-col h-[calc(100vh-130px)] min-h-[400px]">
        {/* Шапка чата */}
        <div className="flex items-center gap-3 pb-4 border-b flex-shrink-0">
          <button
            onClick={() => navigate('/profile/chats')}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Назад"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {conversation ? (
            <>
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage src={conversation.other_user.avatar_url ?? undefined} alt={conversation.other_user.full_name} />
                <AvatarFallback>{conversation.other_user.full_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight truncate">{conversation.other_user.full_name}</p>
                <Link
                  to={`/listings/${conversation.listing.id}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
                >
                  {conversation.listing.title}
                </Link>
              </div>
              {conversation.listing.main_photo_url ? (
                <img
                  src={conversation.listing.main_photo_url}
                  alt={conversation.listing.title}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <ImageOff className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">Чат</span>
          )}

          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', wsConnected ? 'bg-green-500' : 'bg-gray-300')} title={wsConnected ? 'Подключено' : 'Отключено'} />
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-col gap-3 px-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                  <Skeleton className="h-10 w-48 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : localMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Напишите первое сообщение
            </div>
          ) : (
            localMessages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm',
                    )}
                  >
                    <p className="break-words">{msg.text}</p>
                    <p className={cn('text-[10px] mt-1 text-right', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {formatDateTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Поле ввода */}
        <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t flex-shrink-0">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={wsConnected ? 'Напишите сообщение...' : 'Подключение...'}
            disabled={!wsConnected}
            autoComplete="off"
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!text.trim() || !wsConnected}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </PageLayout>
  );
};

export default ChatRoom;
