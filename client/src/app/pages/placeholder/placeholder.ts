import { Component, signal, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'gz-placeholder',
  standalone: true,
  template: `
    <div class="placeholder page-enter">
      <div class="placeholder__content glass-card-elevated">
        <span class="placeholder__icon">✨</span>
        <h1 class="placeholder__title">{{ pageTitle() }}</h1>
        <p class="placeholder__subtitle">We are currently building this module. Sign up for updates or check back soon!</p>
        <div class="placeholder__status">
          <span class="status-dot"></span>
          <span>Module Status: In Development</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 120px);
      padding: var(--space-6);
    }
    .placeholder__content {
      max-width: 500px;
      padding: var(--space-10);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }
    .placeholder__icon {
      font-size: 3rem;
      animation: pulse 2s infinite ease-in-out;
    }
    .placeholder__title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
    }
    .placeholder__subtitle {
      color: var(--text-secondary);
      font-size: var(--font-size-base);
      line-height: var(--line-height-normal);
    }
    .placeholder__status {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
      margin-top: var(--space-4);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--brand-primary);
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-glow-primary);
      animation: pulse 1.5s infinite;
    }
  `]
})
export class PlaceholderComponent implements OnInit {
  protected readonly pageTitle = signal('Module');
  private router = inject(Router);

  ngOnInit(): void {
    const url = this.router.url;
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      // Format: creator-hub -> Creator Hub
      const title = lastPart
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      this.pageTitle.set(title);
    }
  }
}
