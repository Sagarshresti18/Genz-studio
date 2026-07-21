import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Post {
  id: string; title: string; platform: string; type: string;
  date: string; time: string; status: 'scheduled' | 'draft' | 'published';
  color: string;
}

const PLATFORMS = [
  { key: 'youtube',   label: 'YouTube',   color: '#EF4444' },
  { key: 'instagram', label: 'Instagram', color: '#EC4899' },
  { key: 'tiktok',    label: 'TikTok',    color: '#0f172a' },
  { key: 'twitter',   label: 'Twitter/X', color: '#090a0f' },
  { key: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2' },
];

const CONTENT_TYPES = ['Video', 'Short', 'Reel', 'Post', 'Story', 'Thread', 'Newsletter'];

@Component({
  selector: 'gz-content-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-calendar.html',
  styleUrl: './content-calendar.scss',
})
export class ContentCalendarPage {
  readonly today = new Date();
  readonly currentDate = signal<Date>(new Date());
  readonly showModal = signal(false);
  readonly editPost = signal<Post | null>(null);
  readonly filterPlatform = signal('all');
  readonly searchQuery = signal('');
  readonly viewMode = signal<'week' | 'month'>('month');

  readonly form = signal({ title: '', platform: 'youtube', type: 'Video', date: '', time: '10:00', status: 'scheduled' as Post['status'] });

  readonly posts = signal<Post[]>([
    { id: '1', title: 'How I grew 10k subs in 30 days', platform: 'youtube', type: 'Video', date: this.dateStr(0), time: '10:00', status: 'scheduled', color: '#EF4444' },
    { id: '2', title: 'Morning routine vlog', platform: 'instagram', type: 'Reel', date: this.dateStr(1), time: '08:00', status: 'draft', color: '#EC4899' },
    { id: '3', title: 'AI tools tier list 2025', platform: 'tiktok', type: 'Short', date: this.dateStr(2), time: '18:00', status: 'scheduled', color: '#0f172a' },
    { id: '4', title: 'Creator economy thread', platform: 'twitter', type: 'Thread', date: this.dateStr(3), time: '12:00', status: 'published', color: '#090a0f' },
    { id: '5', title: 'Behind the scenes', platform: 'instagram', type: 'Story', date: this.dateStr(4), time: '15:00', status: 'scheduled', color: '#EC4899' },
    { id: '6', title: 'Weekly newsletter', platform: 'linkedin', type: 'Newsletter', date: this.dateStr(5), time: '09:00', status: 'draft', color: '#0A66C2' },
  ]);

  readonly platforms = PLATFORMS;
  readonly contentTypes = CONTENT_TYPES;

  readonly weekDays = computed(() => {
    const start = this.getWeekStart(this.currentDate());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  });

  readonly currentMonthStart = computed(() => {
    const d = new Date(this.currentDate());
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  readonly monthDays = computed(() => {
    const startOfMonth = this.currentMonthStart();
    const startOfWeek = new Date(startOfMonth);
    const startDayOfWeek = startOfMonth.getDay();
    // Shift back to the Sunday of the week containing the 1st
    startOfWeek.setDate(startOfWeek.getDate() - startDayOfWeek);

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return {
        date: d,
        isCurrentMonth: d.getMonth() === startOfMonth.getMonth(),
        isToday: this.isToday(d),
      };
    });
  });

  readonly filteredPosts = computed(() => {
    const f = this.filterPlatform();
    const q = this.searchQuery().toLowerCase().trim();
    return this.posts().filter(p => {
      const matchesPlatform = f === 'all' || p.platform === f;
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
      return matchesPlatform && matchesSearch;
    });
  });

  readonly stats = computed(() => {
    const all = this.posts();
    return {
      scheduled: all.filter(p => p.status === 'scheduled').length,
      draft: all.filter(p => p.status === 'draft').length,
      published: all.filter(p => p.status === 'published').length,
      total: all.length,
    };
  });

  postsForDay(day: Date): Post[] {
    const ds = this.fmtDate(day);
    return this.filteredPosts().filter(p => p.date === ds);
  }

  isToday(d: Date) { return this.fmtDate(d) === this.fmtDate(this.today); }

  prevPeriod() {
    if (this.viewMode() === 'week') {
      const d = new Date(this.currentDate());
      d.setDate(d.getDate() - 7);
      this.currentDate.set(d);
    } else {
      const d = new Date(this.currentDate());
      d.setMonth(d.getMonth() - 1);
      this.currentDate.set(d);
    }
  }

  nextPeriod() {
    if (this.viewMode() === 'week') {
      const d = new Date(this.currentDate());
      d.setDate(d.getDate() + 7);
      this.currentDate.set(d);
    } else {
      const d = new Date(this.currentDate());
      d.setMonth(d.getMonth() + 1);
      this.currentDate.set(d);
    }
  }

  openAdd(date?: Date) {
    this.editPost.set(null);
    this.form.set({ title: '', platform: 'youtube', type: 'Video', date: date ? this.fmtDate(date) : this.fmtDate(this.today), time: '10:00', status: 'scheduled' });
    this.showModal.set(true);
  }

  openEdit(post: Post, e: Event) {
    e.stopPropagation();
    this.editPost.set(post);
    this.form.set({ title: post.title, platform: post.platform, type: post.type, date: post.date, time: post.time, status: post.status });
    this.showModal.set(true);
  }

  savePost() {
    const f = this.form();
    if (!f.title.trim()) return;
    const platform = PLATFORMS.find(p => p.key === f.platform)!;
    const existing = this.editPost();
    if (existing) {
      this.posts.update(ps => ps.map(p => p.id === existing.id ? { ...p, ...f, color: platform.color } : p));
    } else {
      this.posts.update(ps => [...ps, { id: Date.now().toString(), ...f, color: platform.color }]);
    }
    this.showModal.set(false);
  }

  deletePost(id: string, e: Event) {
    e.stopPropagation();
    this.posts.update(ps => ps.filter(p => p.id !== id));
  }

  onTitleInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.form.update(f => ({ ...f, title: v }));
  }

  onPlatformChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.form.update(f => ({ ...f, platform: v }));
  }

  onTypeChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.form.update(f => ({ ...f, type: v }));
  }

  onDateInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.form.update(f => ({ ...f, date: v }));
  }

  onTimeInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.form.update(f => ({ ...f, time: v }));
  }

  setStatus(s: any) {
    this.form.update(f => ({ ...f, status: s }));
  }

  getPlatform(key: string) { return PLATFORMS.find(p => p.key === key); }

  dayLabel(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'short' }); }
  dayNum(d: Date) { return d.getDate(); }
  monthLabel(d: Date) { return d.toLocaleDateString('en-US', { month: 'short' }); }
  
  periodLabel() {
    if (this.viewMode() === 'week') {
      const days = this.weekDays();
      const s = days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const e = days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${s} – ${e}`;
    } else {
      return this.currentDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

  private fmtDate(d: Date) { return d.toISOString().split('T')[0]; }
  private dateStr(offset: number) {
    const d = new Date(this.today);
    d.setDate(d.getDate() + offset);
    return this.fmtDate(d);
  }
  private getWeekStart(d: Date) {
    const day = new Date(d);
    const diff = day.getDay();
    day.setDate(day.getDate() - diff);
    return day;
  }
}
