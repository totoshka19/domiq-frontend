import { useEffect, useRef, useCallback } from 'react';
import type { WsIncomingMessage, WsOutgoingMessage } from '@/types/chat';

interface UseWebSocketOptions {
  conversationId: string;
  onMessage: (message: WsIncomingMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
}

export const useWebSocket = ({
  conversationId,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !conversationId) return;

    const url = `${import.meta.env.VITE_WS_URL}/chat/ws/${conversationId}?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => onOpen?.();
    ws.onclose = () => onClose?.();
    ws.onerror = () => onError?.();

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as WsIncomingMessage;
        onMessage(message);
      } catch {
        // игнорируем некорректные сообщения
      }
    };

    return () => {
      ws.close();
    };
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload: WsOutgoingMessage = { text };
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const isConnected = useCallback(
    () => wsRef.current?.readyState === WebSocket.OPEN,
    [],
  );

  return { sendMessage, isConnected };
};
