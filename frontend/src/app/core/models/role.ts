export type UserRole = 'Admin' | 'Pro User' | 'Free User';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}
