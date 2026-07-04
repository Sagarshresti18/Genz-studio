import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly userName = signal('Sanjay');
  protected readonly userInitials = computed(() => this.userName().charAt(0).toUpperCase());

  protected readonly mainNavItems = signal<NavItem[]>([
    { icon: 'grid', label: 'Dashboard', route: '/app/dashboard' },
    { icon: 'folder', label: 'Projects', route: '/app/projects' },
    { icon: 'sparkles', label: 'AI Tools', route: '/app/ai-tools' },
    { icon: 'layout', label: 'Templates', route: '/app/templates' },
    { icon: 'pen-tool', label: 'Design Tools', route: '/app/design-tools' },
    { icon: 'palette', label: 'Brand Kit', route: '/app/brand-kit' },
    { icon: 'image', label: 'Media Library', route: '/app/media-library' },
  ]);

  protected readonly secondaryNavItems = signal<NavItem[]>([
    { icon: 'calendar', label: 'Calendar', route: '/app/calendar' },
    { icon: 'bar-chart', label: 'Analytics', route: '/app/analytics' },
    { icon: 'rocket', label: 'Creator Hub', route: '/app/creator-hub' },
    { icon: 'store', label: 'Marketplace', route: '/app/marketplace' },
    { icon: 'users', label: 'Community', route: '/app/community' },
  ]);

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected getNavIcon(icon: string): string {
    const icons: Record<string, string> = {
      'grid': 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
      'folder': 'M2 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z',
      'sparkles': 'M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z',
      'layout': 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm0 6h16M9 9v12',
      'pen-tool': 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586',
      'palette': 'M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2 2 0 0 0 2-2v-.09a1.99 1.99 0 0 1 2-2h.09A10 10 0 0 0 12 2z',
      'image': 'M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm14 14l-4-5-3 4-2-3-5 4',
      'calendar': 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zm12-4v4M8 3v4M4 11h16',
      'bar-chart': 'M18 20V10M12 20V4M6 20v-6',
      'rocket': 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
      'store': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    };
    return icons[icon] || icons['grid'];
  }
}
