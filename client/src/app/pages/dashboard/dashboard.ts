import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardStat {
  value: string;
  label: string;
  trend: string;
  icon: string;
  colorClass: string;
}

interface RecentProject {
  id: string;
  name: string;
  timestamp: string;
  status: 'Active' | 'Draft' | 'Published';
  gradient: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  primary?: boolean;
}

interface SpotlightTool {
  name: string;
  desc: string;
  icon: string;
  route: string;
}

interface TeamActivity {
  avatar: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

@Component({
  selector: 'gz-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  protected readonly creatorName = signal('Sanjay');

  protected readonly stats = signal<DashboardStat[]>([
    { value: '12', label: 'Total Projects', trend: '+2 this week', icon: 'folder', colorClass: 'primary' },
    { value: '2,400', label: 'AI Credits', trend: '60% used', icon: 'sparkles', colorClass: 'secondary' },
    { value: '4.2 GB', label: 'Storage Used', trend: 'of 50 GB', icon: 'database', colorClass: 'accent' },
    { value: '8', label: 'Published Assets', trend: '+3 this month', icon: 'send', colorClass: 'success' }
  ]);

  protected readonly recentProjects = signal<RecentProject[]>([
    { id: '1', name: 'Summer YouTube Banner', timestamp: 'Edited 2h ago', status: 'Active', gradient: 'linear-gradient(135deg, #6C5CE7 0%, #00D2FF 100%)' },
    { id: '2', name: 'Logo Concept Final', timestamp: 'Edited 4h ago', status: 'Draft', gradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFB300 100%)' },
    { id: '3', name: 'Product Thumbnail V2', timestamp: 'Edited 1d ago', status: 'Published', gradient: 'linear-gradient(135deg, #00E676 0%, #00D2FF 100%)' },
    { id: '4', name: 'Instagram Story Template', timestamp: 'Edited 3d ago', status: 'Active', gradient: 'linear-gradient(135deg, #6C5CE7 0%, #FF6B9D 100%)' }
  ]);

  protected readonly quickActions = signal<QuickAction[]>([
    { label: 'New Project', icon: 'plus', route: '/app/projects', primary: true },
    { label: 'AI Generate', icon: 'sparkles', route: '/app/ai-tools' },
    { label: 'Upload Media', icon: 'upload', route: '/app/media-library' },
    { label: 'Schedule Post', icon: 'calendar', route: '/app/calendar' },
    { label: 'Browse Templates', icon: 'layout', route: '/app/templates' }
  ]);

  protected readonly spotlightTools = signal<SpotlightTool[]>([
    { name: 'Logo Generator', desc: 'Create unique logos with brand kits in seconds.', icon: '◇', route: '/app/ai-tools' },
    { name: 'Image Generator', desc: 'Generate stunning photorealistic creative designs.', icon: '▣', route: '/app/ai-tools' },
    { name: 'Content Writer', desc: 'Write engaging copy, blogs, scripts, and posts.', icon: '¶', route: '/app/ai-tools' },
    { name: 'SEO Assistant', desc: 'Optimize titles, descriptions, and hashtags.', icon: '⟁', route: '/app/ai-tools' }
  ]);

  protected readonly activities = signal<TeamActivity[]>([
    { avatar: 'JP', user: 'Jay Patel', action: 'edited', target: 'Summer YouTube Banner', time: '2h ago' },
    { avatar: 'SK', user: 'Sara Kim', action: 'commented on', target: 'Logo Concept Final', time: '4h ago' },
    { avatar: 'SC', user: 'You', action: 'published', target: 'Product Thumbnail V2', time: '6h ago' },
    { avatar: 'JP', user: 'Jay Patel', action: 'uploaded 3 images to', target: 'Media Library', time: '1d ago' },
    { avatar: 'SK', user: 'Sara Kim', action: 'joined the', target: 'Workspace', time: '2d ago' }
  ]);

  protected getStatIcon(icon: string): string {
    const icons: Record<string, string> = {
      'folder': 'M2 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z',
      'sparkles': 'M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z',
      'database': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
      'send': 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z'
    };
    return icons[icon] || icons['folder'];
  }

  protected getActionIcon(icon: string): string {
    const icons: Record<string, string> = {
      'plus': 'M12 5v14M5 12h14',
      'sparkles': 'M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z',
      'upload': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
      'calendar': 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zm12-4v4M8 3v4M4 11h16',
      'layout': 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm0 6h16'
    };
    return icons[icon] || icons['plus'];
  }
}
