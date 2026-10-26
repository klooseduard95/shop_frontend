export type Role = 'ADMIN' | 'CUSTOMER';

export interface UserProfile {
  id: string;
  username: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
}
