import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-feature-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-shell">
      <div class="feature-shell__hero" [style.--accent]="accentColor">
        <div class="feature-shell__icon">{{ icon }}</div>
        <div class="feature-shell__badge" *ngIf="comingSoon">Coming Soon</div>
        <h1 class="feature-shell__title">{{ title }}</h1>
        <p class="feature-shell__subtitle">{{ subtitle }}</p>
        <button class="feature-shell__cta" [style.background]="accentColor">
          {{ comingSoon ? 'Join Waitlist' : 'Launch ' + title }}
        </button>
      </div>
      <div class="feature-shell__placeholder">
        <div class="placeholder-grid">
          <div class="placeholder-card" *ngFor="let i of [1,2,3,4,5,6]">
            <div class="placeholder-thumb" [style.background]="'linear-gradient(135deg,' + accentColor + '22,' + accentColor + '44)'"></div>
            <div class="placeholder-lines">
              <div class="ph-line ph-line--lg"></div>
              <div class="ph-line ph-line--sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feature-shell { display: flex; flex-direction: column; gap: 32px; }
    .feature-shell__hero {
      text-align: center;
      padding: 56px 24px 48px;
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 24px;
      position: relative;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%);
        pointer-events: none;
      }
    }
    .feature-shell__icon { font-size: 3rem; margin-bottom: 16px; }
    .feature-shell__badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 999px;
      background: #fef3c7;
      color: #d97706;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .feature-shell__title { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: #0f172a; margin-bottom: 10px; }
    .feature-shell__subtitle { font-size: 1rem; color: #64748b; max-width: 52ch; margin: 0 auto 28px; line-height: 1.65; }
    .feature-shell__cta {
      display: inline-flex; align-items: center; height: 44px; padding: 0 28px;
      border-radius: 12px; color: white; font-weight: 700; font-size: 0.9rem;
      border: none; cursor: pointer; transition: opacity 0.15s, transform 0.15s;
      &:hover { opacity: 0.88; transform: translateY(-2px); }
    }
    .placeholder-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .placeholder-card { background: white; border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; }
    .placeholder-thumb { height: 120px; }
    .placeholder-lines { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
    .ph-line { height: 10px; border-radius: 5px; background: #f1f5f9; }
    .ph-line--lg { width: 75%; }
    .ph-line--sm { width: 45%; }
    @media (max-width: 768px) { .placeholder-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .placeholder-grid { grid-template-columns: 1fr; } }
  `]
})
export class FeatureShellComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '✦';
  @Input() accentColor = '#7C3AED';
  @Input() comingSoon = false;
}
