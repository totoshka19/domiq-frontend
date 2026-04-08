import type { UserRole } from './user';

export interface AdminStats {
  users_total: number;
  users_active: number;
  users_new_today: number;
  listings_total: number;
  listings_active: number;
  listings_pending_moderation: number;
  conversations_total: number;
  messages_total: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  listings_count: number;
  created_at: string;
}

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export interface RejectListingPayload {
  reason: string;
}
