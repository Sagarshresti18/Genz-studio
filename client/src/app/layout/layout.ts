import { Component, signal, computed, HostListener, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  label: string;
  collapsed: boolean;
  items: NavItem[];
}

interface Workspace {
  id: string;
  name: string;
  role: string;
  logoColor: string;
  logoLetter: string;
}

interface AppNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'alert' | 'success' | 'info';
}

interface AccentTheme {
  id: string;
  name: string;
  class: string;
  primaryColor: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class WorkspaceLayoutComponent {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  protected readonly sidebarCollapsed = signal(localStorage.getItem('sidebarCollapsed') === 'true');
  protected readonly mobileMenuOpen = signal(false);
  protected readonly showUserMenu = signal(false);
  protected readonly showWorkspaceMenu = signal(false);
  protected readonly showNotifications = signal(false);

  protected readonly isDarkMode = signal<boolean>(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  protected readonly accentThemes = signal<AccentTheme[]>([
    { id: 'violet', name: 'Violet', class: 'theme-violet', primaryColor: '#7C3AED' },
    { id: 'blue', name: 'Blue', class: 'theme-blue', primaryColor: '#3B82F6' },
    { id: 'emerald', name: 'Emerald', class: 'theme-emerald', primaryColor: '#10B981' },
    { id: 'rose', name: 'Rose', class: 'theme-rose', primaryColor: '#F43F5E' },
    { id: 'amber', name: 'Amber', class: 'theme-amber', primaryColor: '#F59E0B' }
  ]);
  protected readonly activeThemeColor = signal<string>(localStorage.getItem('activeThemeColor') || 'violet');
  protected readonly showThemeMenu = signal(false);

  protected readonly userName = computed(() => this.auth.user()?.fullName ?? 'Creator');
  protected readonly userEmail = computed(() => this.auth.user()?.email ?? '');
  protected readonly userInitials = computed(() => this.auth.userInitials());

  // ── Workspaces ───────────────────────────────────────────
  protected readonly workspaces = signal<Workspace[]>([
    { id: 'genz-studio', name: 'GenZ Studio', role: 'Owner', logoColor: 'linear-gradient(135deg, #7C3AED, #06B6D4)', logoLetter: 'GZ' },
    { id: 'acme-agency', name: 'Acme Agency', role: 'Collaborator', logoColor: 'linear-gradient(135deg, #EF4444, #F59E0B)', logoLetter: 'AC' },
    { id: 'personal-space', name: 'Personal Space', role: 'Personal', logoColor: 'linear-gradient(135deg, #10B981, #3B82F6)', logoLetter: 'PS' }
  ]);
  protected readonly activeWorkspaceId = signal<string>(localStorage.getItem('activeWorkspaceId') || 'genz-studio');
  protected readonly activeWorkspace = computed(() => {
    return this.workspaces().find(w => w.id === this.activeWorkspaceId()) || this.workspaces()[0];
  });

  // ── Notifications ────────────────────────────────────────
  protected readonly notifications = signal<AppNotification[]>([
    { id: '1', title: 'Task Approved', desc: 'Sanjay approved the "Neon Channel Banner" design.', time: '5m ago', read: false, type: 'success' },
    { id: '2', title: 'Milestone Approaching', desc: 'YouTube Vlog publish deadline is tomorrow at 9:00 AM.', time: '2h ago', read: false, type: 'alert' },
    { id: '3', title: 'AI Credits Restored', desc: 'Your workspace AI credits have been reset to 2,400.', time: '1d ago', read: true, type: 'info' },
    { id: '4', title: 'New Comment', desc: 'Priya K. left a comment on "Summer Vlog Thumbnail".', time: '2d ago', read: true, type: 'info' }
  ]);
  protected readonly unreadNotificationsCount = computed(() => this.notifications().filter(n => !n.read).length);

  protected readonly navGroups = signal<NavGroup[]>([
    {
      label: 'Overview',
      collapsed: false,
      items: [
        { icon: 'home', label: 'Dashboard', route: '/workspace/dashboard' },
        { icon: 'calendar', label: 'Content Calendar', route: '/workspace/content-calendar' },
      ]
    },
    {
      label: 'Design Studio',
      collapsed: false,
      items: [
        { icon: 'logo', label: 'Logo Generator', route: '/workspace/logo-generator' },
        { icon: 'banner', label: 'YouTube Banner', route: '/workspace/youtube-banner' },
        { icon: 'thumbnail', label: 'Thumbnail Maker', route: '/workspace/thumbnail-maker' },
        { icon: 'image', label: 'Image Editor', route: '/workspace/image-editor' },
      ]
    },
    {
      label: 'Video & Audio',
      collapsed: false,
      items: [
        { icon: 'video', label: 'Video Editor', route: '/workspace/video-editor' },
        { icon: 'ai-video', label: 'AI Videos', route: '/workspace/ai-videos', badge: 'Beta', badgeColor: '#EC4899' },
        { icon: 'audio', label: 'AI Audio', route: '/workspace/ai-audio' },
        { icon: 'music', label: 'Music Library', route: '/workspace/music-library' },
      ]
    },
    {
      label: 'AI & Content',
      collapsed: false,
      items: [
        { icon: 'content', label: 'AI Content', route: '/workspace/ai-content' },
        { icon: 'meme', label: 'Meme Library', route: '/workspace/meme-library' },
      ]
    }
  ]);

  constructor(protected auth: AuthService) {
    this.applyTheme(this.isDarkMode());
    this.applyAccentTheme(this.activeThemeColor());
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    // ⌘K / Ctrl+K for search focus
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement?.focus();
    }
    // Escape to close menus
    if (event.key === 'Escape') {
      this.showUserMenu.set(false);
      this.showWorkspaceMenu.set(false);
      this.showNotifications.set(false);
      this.showThemeMenu.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    // Close dropdowns when clicking outside
    if (!target.closest('.user-section')) {
      this.showUserMenu.set(false);
    }
    if (!target.closest('.workspace-selector-container')) {
      this.showWorkspaceMenu.set(false);
    }
    if (!target.closest('.notifications-btn-container')) {
      this.showNotifications.set(false);
    }
    if (!target.closest('.theme-selector-container')) {
      this.showThemeMenu.set(false);
    }
  }

  protected toggleSidebar(): void {
    const newVal = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(newVal);
    localStorage.setItem('sidebarCollapsed', String(newVal));
  }

  protected toggleMobileMenu(): void { this.mobileMenuOpen.update(v => !v); }
  protected closeMobileMenu(): void { this.mobileMenuOpen.set(false); }

  protected toggleGroup(index: number): void {
    this.navGroups.update(groups => {
      const updated = [...groups];
      updated[index] = { ...updated[index], collapsed: !updated[index].collapsed };
      return updated;
    });
  }

  protected toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  protected toggleWorkspaceMenu(): void {
    this.showWorkspaceMenu.update(v => !v);
  }

  protected toggleThemeMenu(): void {
    this.showThemeMenu.update(v => !v);
  }

  protected selectWorkspace(workspaceId: string): void {
    this.activeWorkspaceId.set(workspaceId);
    localStorage.setItem('activeWorkspaceId', workspaceId);
    this.showWorkspaceMenu.set(false);
    window.dispatchEvent(new CustomEvent('workspaceChanged', { detail: workspaceId }));
  }

  protected selectAccentTheme(themeId: string): void {
    this.activeThemeColor.set(themeId);
    localStorage.setItem('activeThemeColor', themeId);
    this.applyAccentTheme(themeId);
    this.showThemeMenu.set(false);
  }

  private applyAccentTheme(themeId: string): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      this.accentThemes().forEach(t => {
        root.classList.remove(t.class);
      });
      const active = this.accentThemes().find(t => t.id === themeId);
      if (active) {
        root.classList.add(active.class);
      }
    }
  }

  protected toggleTheme(): void {
    const newVal = !this.isDarkMode();
    this.isDarkMode.set(newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
    this.applyTheme(newVal);
  }

  private applyTheme(dark: boolean): void {
    if (typeof document !== 'undefined') {
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  protected toggleNotifications(): void {
    this.showNotifications.update(v => !v);
  }

  protected markAllNotificationsAsRead(): void {
    this.notifications.update(notifs => notifs.map(n => ({ ...n, read: true })));
  }

  protected clearNotifications(): void {
    this.notifications.set([]);
  }

  protected logout(): void {
    this.showUserMenu.set(false);
    this.auth.logout();
  }

  protected getIcon(name: string): string {
    const map: Record<string, string> = {
      home:      'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      calendar:  'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
      logo:      'M12 2l3 6.5L22 10l-5 5 1.18 7L12 18.77 5.82 22 7 15l-5-5 7-1.5L12 2z',
      banner:    'M2 3h20v14H2zM8 21h8M12 17v4',
      thumbnail: 'M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.89L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      image:     'M21 15l-5-5L5 21M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
      video:     'M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.89L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'ai-video':'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM10 8l6 4-6 4V8z',
      audio:     'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8',
      music:     'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
      content:   'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
      meme:      'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
      settings:  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
    };
    return map[name] ?? map['home'];
  }
}
