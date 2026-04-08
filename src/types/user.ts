export type UserRole = 'user' | 'agent' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: 'user' | 'agent';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
}
