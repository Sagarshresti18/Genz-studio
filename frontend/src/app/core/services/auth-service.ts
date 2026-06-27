import { Injectable, computed, signal } from '@angular/core';
import { AuthUser, UserRole } from '../models/role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<AuthUser | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  login(email: string, role: UserRole = 'Free User'): void {
    this.userSignal.set({
      uid: crypto.randomUUID(),
      email,
      role,
      displayName: email.split('@')[0],
    });
  }

  logout(): void {
    this.userSignal.set(null);
  }
}
