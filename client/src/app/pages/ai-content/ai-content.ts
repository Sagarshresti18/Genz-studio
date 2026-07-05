import { Component, OnInit, OnDestroy, signal, computed, inject, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { MarkdownToHtmlPipe } from '../../shared/markdown-to-html.pipe';

interface ContentType { key: string; label: string; icon: string; color: string; }
interface HistoryItem { id: string; prompt: string; type: string; tone: string; output_text: string; created_at: string; }
interface TrendingTopic { topic: string; niche: string; trend: string; }

@Component({
  selector: 'gz-ai-content',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownToHtmlPipe],
  templateUrl: './ai-content.html',
  styleUrl: './ai-content.scss',
})
export class AiContentPage implements OnInit, OnDestroy {
  @ViewChild('outputEl') outputEl!: ElementRef<HTMLDivElement>;

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private zone = inject(NgZone);

  // State
  readonly activeTab = signal<'studio' | 'history'>('studio');
  readonly selectedType = signal('script');
  readonly selectedTone = signal('Casual & Fun');
  readonly prompt = signal('');
  readonly platform = signal('');
  readonly keywords = signal('');
  readonly isGenerating = signal(false);
  readonly streamedOutput = signal('');
  readonly copied = signal(false);
  readonly toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Data
  readonly contentTypes = signal<ContentType[]>([]);
  readonly tones = signal<string[]>([]);
  readonly trendingTopics = signal<TrendingTopic[]>([]);
  readonly history = signal<HistoryItem[]>([]);
  readonly historyFilter = signal('all');
  readonly historySearch = signal('');
  readonly loadingHistory = signal(false);
  readonly selectedHistoryItem = signal<HistoryItem | null>(null);

  private eventSource: EventSource | null = null;
  private toastTimer: any;

  readonly typeIcons: Record<string, string> = {
    script: '🎬', hook: '🎯', caption: '📱', thread: '🧵',
    blog: '📝', email: '📧', idea: '💡', description: '🔍',
  };
  readonly typeColors: Record<string, string> = {
    script: '#7C3AED', hook: '#EC4899', caption: '#06B6D4', thread: '#1DA1F2',
    blog: '#10B981', email: '#F59E0B', idea: '#8B5CF6', description: '#EF4444',
  };

  readonly filteredHistory = computed(() => {
    const items = this.history();
    const f = this.historyFilter();
    const s = this.historySearch().toLowerCase();
    return items
      .filter(i => f === 'all' || i.type === f)
      .filter(i => !s || i.prompt.toLowerCase().includes(s) || i.output_text?.toLowerCase().includes(s));
  });

  readonly wordCount = computed(() => {
    const text = this.streamedOutput();
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  });

  ngOnInit() {
    this.api.getContentMetadata().subscribe({
      next: (res: any) => {
        this.contentTypes.set(res.contentTypes.map((t: any) => ({
          ...t, icon: this.typeIcons[t.key] || '✨', color: this.typeColors[t.key] || '#7C3AED',
        })));
        this.tones.set(res.tones);
        this.trendingTopics.set(res.trendingTopics);
      },
      error: () => this.loadDemoMetadata(),
    });
    this.loadHistory();
  }

  ngOnDestroy() { this.eventSource?.close(); }

  generate() {
    if (!this.prompt().trim() || this.isGenerating()) return;
    this.isGenerating.set(true);
    this.streamedOutput.set('');

    const token = this.auth.getToken();

    // Use fetch for SSE POST
    fetch('http://localhost:8080/api/content/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        prompt: this.prompt(), type: this.selectedType(), tone: this.selectedTone(),
        platform: this.platform(), keywords: this.keywords(),
      }),
    }).then(async res => {
      if (!res.ok) {
        this.zone.run(() => { this.isGenerating.set(false); this.showToast('Generation failed', 'error'); });
        return;
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            this.zone.run(() => {
              if (data.token) { this.streamedOutput.update(v => v + data.token); this.scrollOutput(); }
              if (data.done) { this.isGenerating.set(false); this.loadHistory(); }
              if (data.error) { this.isGenerating.set(false); this.showToast(data.error, 'error'); }
            });
          } catch { /* skip */ }
        }
      }
      this.zone.run(() => this.isGenerating.set(false));
    }).catch(() => { this.zone.run(() => { this.isGenerating.set(false); this.showToast('Connection error', 'error'); }); });
  }

  useTrendingTopic(topic: TrendingTopic) {
    this.prompt.set(topic.topic);
  }

  loadHistory() {
    this.loadingHistory.set(true);
    this.api.getContentHistory().subscribe({
      next: (res: any) => { this.history.set(res.content || []); this.loadingHistory.set(false); },
      error: () => this.loadingHistory.set(false),
    });
  }

  deleteHistoryItem(item: HistoryItem, e: Event) {
    e.stopPropagation();
    this.api.deleteContent(item.id).subscribe({
      next: () => { this.history.update(h => h.filter(i => i.id !== item.id)); this.showToast('Deleted', 'success'); },
    });
  }

  selectHistoryItem(item: HistoryItem) {
    this.selectedHistoryItem.set(item);
    this.streamedOutput.set(item.output_text || '');
    this.activeTab.set('studio');
  }

  copyOutput() {
    navigator.clipboard.writeText(this.streamedOutput()).then(() => {
      this.copied.set(true);
      this.showToast('Copied to clipboard!', 'success');
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  clearOutput() { this.streamedOutput.set(''); this.selectedHistoryItem.set(null); }

  private scrollOutput() {
    setTimeout(() => {
      if (this.outputEl?.nativeElement) {
        this.outputEl.nativeElement.scrollTop = this.outputEl.nativeElement.scrollHeight;
      }
    }, 0);
  }

  showToast(msg: string, type: 'success' | 'error') {
    clearTimeout(this.toastTimer);
    this.toast.set({ msg, type });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3000);
  }

  private loadDemoMetadata() {
    this.contentTypes.set([
      { key: 'script', label: 'YouTube Script', icon: '🎬', color: '#7C3AED' },
      { key: 'hook', label: 'Video Hook', icon: '🎯', color: '#EC4899' },
      { key: 'caption', label: 'Social Caption', icon: '📱', color: '#06B6D4' },
      { key: 'thread', label: 'Twitter Thread', icon: '🧵', color: '#1DA1F2' },
      { key: 'blog', label: 'Blog Post', icon: '📝', color: '#10B981' },
      { key: 'email', label: 'Newsletter', icon: '📧', color: '#F59E0B' },
      { key: 'idea', label: 'Content Ideas', icon: '💡', color: '#8B5CF6' },
      { key: 'description', label: 'YT Description', icon: '🔍', color: '#EF4444' },
    ]);
    this.tones.set(['Casual & Fun', 'Professional', 'Hype & Energetic', 'Educational', 'Controversial', 'Storytelling', 'Minimalist']);
    this.trendingTopics.set([
      { topic: 'AI tools replacing jobs', niche: 'Tech', trend: '🔥 Viral' },
      { topic: 'How I made $10k with one video', niche: 'Finance', trend: '📈 Trending' },
      { topic: 'Day in my life as a creator', niche: 'Lifestyle', trend: '💫 Popular' },
      { topic: 'Honest review: [Product]', niche: 'Reviews', trend: '⚡ Hot' },
      { topic: 'Things I wish I knew before starting YouTube', niche: 'Creator', trend: '🎯 Evergreen' },
      { topic: 'I tried [viral trend] for 30 days', niche: 'Challenge', trend: '🚀 Viral' },
    ]);
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getTypeLabel(key: string) {
    return this.contentTypes().find(t => t.key === key)?.label || key;
  }
}
