import api from './axios';
import type { Conversation, Message } from '@/types/chat';
import type { PaginatedResponse } from '@/types/api';

export const chatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<Conversation[]>('/chat/conversations');
    return data;
  },

  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<Message>> => {
    const { data } = await api.get<PaginatedResponse<Message>>(
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
