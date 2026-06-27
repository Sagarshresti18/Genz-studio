import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Genz Studio');
  protected readonly navOpen = signal(false);
  protected readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  protected toggleNav(): void {
    this.navOpen.update((value) => !value);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }

  protected loginAsDemo(): void {
    this.authService.login('demo@genz.studio', 'Pro User');
    void this.router.navigate(['/dashboard']);
  }
}
