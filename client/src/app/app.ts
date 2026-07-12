import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly appName = 'GenZ Studio';

  ngOnInit() {
    this.applySavedThemes();
  }

  @HostListener('document:mousemove', ['$event'])
  handleMousemove(event: MouseEvent) {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--mouse-x', `${event.clientX}px`);
      root.style.setProperty('--mouse-y', `${event.clientY}px`);
    }
  }

  private applySavedThemes() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Accent Theme Color Color Presets
      const themeId = localStorage.getItem('activeThemeColor') || 'violet';
      const root = document.documentElement;
      const accentClasses = ['theme-violet', 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-amber'];
      accentClasses.forEach(c => root.classList.remove(c));
      root.classList.add(`theme-${themeId}`);

      // Dark Mode Config class
      const savedDark = localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (savedDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }
}
