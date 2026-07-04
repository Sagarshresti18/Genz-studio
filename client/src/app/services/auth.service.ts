import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(this.loadUser());
  private readonly _token = signal<string | null>(localStorage.getItem('accessToken'));

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly userInitials = computed(() => {
    const name = this._user()?.fullName ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  });

  constructor(private router: Router) {}

  login(user: AuthUser, token: string): void {
    this._user.set(user);
    this._token.set(token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authUser');
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
