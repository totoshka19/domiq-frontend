import api from './axios';
import type { Conversation, Message } from '@/types/chat';

export const chatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<Conversation[]>('/chat/conversations');
    return data;
  },

  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number },
  ): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(
      `/chat/conversations/${conversationId}/messages`,
      { params },
    );
    return data;
  },

  createConversation: async (listingId: string): Promise<Conversation> => {
    const { data } = await api.post<Conversation>('/chat/conversations', {
      listing_id: listingId,
    });
    return data;
  },
};
