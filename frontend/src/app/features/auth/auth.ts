import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  protected readonly mode = signal<'login' | 'signup' | 'forgot'>('login');

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  protected switchMode(mode: 'login' | 'signup' | 'forgot'): void {
    this.mode.set(mode);
  }

  protected continueWithGoogle(): void {
    this.authService.login('google-user@genz.studio', 'Pro User');
    void this.router.navigate(['/dashboard']);
  }

  protected continueWithEmail(): void {
    this.authService.login('email-user@genz.studio', 'Free User');
    void this.router.navigate(['/dashboard']);
  }
}
