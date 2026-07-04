import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
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
  items: NavItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class WorkspaceLayoutComponent {
  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileMenuOpen = signal(false);

  protected readonly userName = computed(() => this.auth.user()?.fullName ?? 'Creator');
  protected readonly userEmail = computed(() => this.auth.user()?.email ?? '');
  protected readonly userInitials = computed(() => this.auth.userInitials());

  protected readonly navGroups = signal<NavGroup[]>([
    {
      label: 'Overview',
      items: [
        { icon: 'home', label: 'Dashboard', route: '/workspace/dashboard' },
        { icon: 'calendar', label: 'Content Calendar', route: '/workspace/content-calendar' },
      ]
    },
    {
      label: 'Design Studio',
      items: [
        { icon: 'logo', label: 'Logo Generator', route: '/workspace/logo-generator' },
        { icon: 'banner', label: 'YouTube Banner', route: '/workspace/youtube-banner' },
        { icon: 'thumbnail', label: 'Thumbnail Maker', route: '/workspace/thumbnail-maker' },
        { icon: 'image', label: 'Image Editor', route: '/workspace/image-editor' },
      ]
    },
    {
      label: 'Video & Audio',
      items: [
        { icon: 'video', label: 'Video Editor', route: '/workspace/video-editor' },
        { icon: 'ai-video', label: 'AI Videos', route: '/workspace/ai-videos', badge: 'Beta', badgeColor: '#EC4899' },
        { icon: 'audio', label: 'AI Audio', route: '/workspace/ai-audio' },
        { icon: 'music', label: 'Music Library', route: '/workspace/music-library' },
      ]
    },
    {
      label: 'AI & Content',
      items: [
        { icon: 'content', label: 'AI Content', route: '/workspace/ai-content' },
        { icon: 'meme', label: 'Meme Library', route: '/workspace/meme-library' },
      ]
    }
  ]);

  constructor(protected auth: AuthService) {}

  protected toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }
  protected toggleMobileMenu(): void { this.mobileMenuOpen.update(v => !v); }
  protected closeMobileMenu(): void { this.mobileMenuOpen.set(false); }

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
