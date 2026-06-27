export type Role = 'Admin' | 'Pro User' | 'Free User';

export interface JwtPayload {
  uid: string;
  email: string;
  role: Role;
}
