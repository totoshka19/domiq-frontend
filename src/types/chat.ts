export interface ConversationListing {
  id: string;
  title: string;
  main_photo_url: string | null;
}

export interface ConversationUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface LastMessage {
  text: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  listing: ConversationListing;
  other_user: ConversationUser;
  last_message: LastMessage | null;
  unread_count: number;
}

export interface Message {
  id: string;
  sender_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface WsIncomingMessage {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export interface WsOutgoingMessage {
  text: string;
}
