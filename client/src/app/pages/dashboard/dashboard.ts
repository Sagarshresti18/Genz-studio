import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CreatorStat {
  value: string;
  label: string;
  sub: string;
  icon: string;
  color: string;
  bg: string;
}

interface RecentWork {
  id: string;
  name: string;
  type: string;
  time: string;
  status: 'Live' | 'Draft' | 'Scheduled';
  gradient: string;
}

interface QuickTool {
  label: string;
  icon: string;
  route: string;
  color: string;
  bg: string;
}

interface TrendingTemplate {
  name: string;
  uses: string;
  gradient: string;
}

interface Activity {
  avatar: string;
  text: string;
  time: string;
  type: 'publish' | 'edit' | 'generate' | 'schedule';
}

@Component({
  selector: 'gz-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardPage {
  protected readonly creatorName = signal('Sanjay');
  protected readonly greeting = signal(this.getGreeting());

  protected readonly stats = signal<CreatorStat[]>([
    { value: '24', label: 'Assets Created', sub: '+6 this week', icon: 'M12 2l3 6.5L22 10l-5 5 1.18 7L12 18.77 5.82 22 7 15l-5-5 7-1.5L12 2z', color: '#7C3AED', bg: '#f5f3ff' },
    { value: '2,400', label: 'AI Credits', sub: '1,600 remaining', icon: 'M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z', color: '#06B6D4', bg: '#ecfeff' },
    { value: '18', label: 'Published', sub: '+3 this month', icon: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z', color: '#10B981', bg: '#f0fdf4' },
    { value: '5', label: 'Scheduled', sub: 'Next: Tomorrow 9am', icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', color: '#F59E0B', bg: '#fffbeb' },
  ]);

  protected readonly recentWork = signal<RecentWork[]>([
    { id: '1', name: 'Summer Vlog Thumbnail', type: 'Thumbnail', time: '1h ago', status: 'Live', gradient: 'linear-gradient(135deg,#7C3AED,#06B6D4)' },
    { id: '2', name: 'Channel Rebrand Banner', type: 'YouTube Banner', time: '3h ago', status: 'Draft', gradient: 'linear-gradient(135deg,#EF4444,#F59E0B)' },
    { id: '3', name: 'Podcast Intro Script', type: 'AI Content', time: '5h ago', status: 'Live', gradient: 'linear-gradient(135deg,#10B981,#06B6D4)' },
    { id: '4', name: 'Brand Logo v3', type: 'Logo', time: '1d ago', status: 'Scheduled', gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)' },
    { id: '5', name: 'Reel Background Music', type: 'Music', time: '2d ago', status: 'Live', gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
  ]);

  protected readonly quickTools = signal<QuickTool[]>([
    { label: 'Thumbnail', icon: '▣', route: '/workspace/thumbnail-maker', color: '#F97316', bg: '#fff7ed' },
    { label: 'YT Banner', icon: '▶', route: '/workspace/youtube-banner', color: '#EF4444', bg: '#fef2f2' },
    { label: 'Logo', icon: '◈', route: '/workspace/logo-generator', color: '#7C3AED', bg: '#f5f3ff' },
    { label: 'AI Script', icon: '✧', route: '/workspace/ai-content', color: '#10B981', bg: '#f0fdf4' },
    { label: 'Edit Video', icon: '⬡', route: '/workspace/video-editor', color: '#F59E0B', bg: '#fffbeb' },
    { label: 'AI Audio', icon: '♪', route: '/workspace/ai-audio', color: '#8B5CF6', bg: '#f5f3ff' },
    { label: 'Meme', icon: '😂', route: '/workspace/meme-library', color: '#FBBF24', bg: '#fffbeb' },
    { label: 'Calendar', icon: '◫', route: '/workspace/content-calendar', color: '#6366F1', bg: '#eef2ff' },
  ]);

  protected readonly trending = signal<TrendingTemplate[]>([
    { name: 'Reaction Face Thumbnail', uses: '12.4k uses', gradient: 'linear-gradient(135deg,#7C3AED,#EC4899)' },
    { name: 'Neon Channel Banner', uses: '9.1k uses', gradient: 'linear-gradient(135deg,#06B6D4,#10B981)' },
    { name: 'Bold Text Thumbnail', uses: '8.7k uses', gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
    { name: 'Minimal Logo Pack', uses: '6.3k uses', gradient: 'linear-gradient(135deg,#8B5CF6,#06B6D4)' },
  ]);

  protected readonly activities = signal<Activity[]>([
    { avatar: 'Y', text: 'Thumbnail "Summer Vlog" went live on YouTube', time: '1h ago', type: 'publish' },
    { avatar: 'A', text: 'AI generated 3 script variations for your podcast', time: '3h ago', type: 'generate' },
    { avatar: 'C', text: 'Content Calendar updated — 5 posts scheduled', time: '5h ago', type: 'schedule' },
    { avatar: 'L', text: 'Logo "Brand v3" exported in 4 formats', time: '1d ago', type: 'edit' },
  ]);

  protected readonly activityColors: Record<string, string> = {
    publish: '#10B981', generate: '#7C3AED', schedule: '#6366F1', edit: '#F59E0B'
  };

  private getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
