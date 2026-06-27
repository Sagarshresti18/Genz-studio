import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly modeSignal = signal<ThemeMode>('light');
  readonly mode = this.modeSignal.asReadonly();
  readonly isDark = computed(() => this.modeSignal() === 'dark');

  constructor() {
    effect(() => {
      document.documentElement.dataset['theme'] = this.modeSignal();
    });
  }

  toggleTheme(): void {
    this.modeSignal.update((mode) => (mode === 'light' ? 'dark' : 'light'));
  }
}
