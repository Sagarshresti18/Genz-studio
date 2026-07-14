import { Component, OnInit, OnDestroy, signal, computed, inject, ElementRef, ViewChild, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { MarkdownToHtmlPipe } from '../../shared/markdown-to-html.pipe';

interface ContentType { key: string; label: string; icon: string; color: string; }
interface HistoryItem { id: string; prompt: string; type: string; tone: string; output_text: string; created_at: string; }
interface TrendingTopic { topic: string; niche: string; trend: string; }
interface Model { id: string; name: string; description: string; badge?: string; }

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

  // Claude-Style chat input state
  readonly attachedFiles = signal<{ id: string; name: string; size: number; type: string; preview: string | null; uploadStatus: 'pending' | 'uploading' | 'complete' }[]>([]);
  readonly pastedSnippets = signal<{ id: string; content: string; timestamp: Date }[]>([]);
  readonly selectedModel = signal<string>('sonnet-4.5');
  readonly isThinkingEnabled = signal<boolean>(false);
  readonly isModelDropdownOpen = signal<boolean>(false);

  readonly models: Model[] = [
    { id: 'opus-4.5', name: 'Opus 4.5', description: 'Most capable for complex work' },
    { id: 'sonnet-4.5', name: 'Sonnet 4.5', description: 'Best for everyday tasks' },
    { id: 'haiku-4.5', name: 'Haiku 4.5', description: 'Fastest for quick answers' }
  ];

  // Conversation View Captured States
  readonly activePrompt = signal<string>('');
  readonly activeFiles = signal<{ name: string; preview: string | null; type: string; size: number }[]>([]);
  readonly activeSnippets = signal<{ content: string }[]>([]);
  readonly activeType = signal<string>('');
  readonly activeTone = signal<string>('');
  readonly showAdvancedOptions = signal<boolean>(false);

  // User Greeting & Info
  readonly userName = computed(() => {
    const fullName = this.auth.user()?.fullName;
    return fullName ? fullName.split(' ')[0] : 'Creator';
  });

  readonly greeting = computed(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  });

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
    const pVal = this.prompt().trim();
    if (!pVal && this.attachedFiles().length === 0 && this.pastedSnippets().length === 0) return;
    if (this.isGenerating()) return;

    this.isGenerating.set(true);
    this.streamedOutput.set('');

    // Capture states for conversation view bubble
    this.activePrompt.set(pVal || 'Uploaded materials analysis');
    this.activeFiles.set(this.attachedFiles().map(f => ({ name: f.name, preview: f.preview, type: f.type, size: f.size })));
    this.activeSnippets.set(this.pastedSnippets().map(s => ({ content: s.content })));
    this.activeType.set(this.selectedType());
    this.activeTone.set(this.selectedTone());

    const token = this.auth.getToken();
    const modelValue = this.selectedModel();
    const thinkingValue = this.isThinkingEnabled();
    const filesValue = this.attachedFiles();
    const snippetsValue = this.pastedSnippets();

    // Clear input bar for conversation view
    this.prompt.set('');
    this.attachedFiles.set([]);
    this.pastedSnippets.set([]);

    // Use fetch for SSE POST
    fetch('http://localhost:8080/api/content/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        prompt: pVal || 'Analyze these materials', type: this.selectedType(), tone: this.selectedTone(),
        platform: this.platform(), keywords: this.keywords(),
        model: modelValue, thinking: thinkingValue,
        files: filesValue.map(f => ({ name: f.name, size: f.size, type: f.type })),
        snippets: snippetsValue.map(s => s.content)
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

  selectType(typeKey: string) {
    this.selectedType.set(typeKey);
    
    // Set a friendly prompt template depending on selected content type
    const templates: Record<string, string> = {
      script: 'Write a YouTube video script about ',
      hook: 'Create 5 scroll-stopping hooks for a video about ',
      caption: 'Write an engaging Instagram/TikTok caption with hashtags about ',
      thread: 'Write a value-packed Twitter/X thread about ',
      blog: 'Write an SEO-optimized blog post with headings about ',
      email: 'Write a high-converting newsletter email about ',
      idea: 'Generate 10 viral content ideas with outlines for ',
      description: 'Write a YouTube description with chapters and links for '
    };
    
    const starterPrompt = templates[typeKey] || 'Write content about ';
    this.prompt.set(starterPrompt);
  }

  toggleAdvancedOptions() {
    this.showAdvancedOptions.set(!this.showAdvancedOptions());
  }

  newChat() {
    this.streamedOutput.set('');
    this.activePrompt.set('');
    this.activeFiles.set([]);
    this.activeSnippets.set([]);
    this.selectedHistoryItem.set(null);
  }

  // Claude-Style chat input helpers
  toggleThinking() {
    this.isThinkingEnabled.set(!this.isThinkingEnabled());
  }

  toggleModelDropdown(e: Event) {
    e.stopPropagation();
    this.isModelDropdownOpen.set(!this.isModelDropdownOpen());
  }

  selectModel(modelId: string) {
    this.selectedModel.set(modelId);
    this.isModelDropdownOpen.set(false);
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.isModelDropdownOpen.set(false);
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  handleFiles(filesList: FileList | File[]) {
    const newFiles = Array.from(filesList).map(file => {
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
      const id = Math.random().toString(36).substring(2, 9);
      
      // Simulate file upload progress
      setTimeout(() => {
        this.attachedFiles.update(prev => 
          prev.map(item => item.id === id ? { ...item, uploadStatus: 'complete' } : item)
        );
      }, 1000 + Math.random() * 1200);

      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: isImage ? URL.createObjectURL(file) : null,
        uploadStatus: 'uploading' as const
      };
    });

    this.attachedFiles.update(prev => [...prev, ...newFiles]);

    // Populate prompt placeholder suggestion if empty
    if (!this.prompt().trim()) {
      if (newFiles.length === 1) {
        this.prompt.set(newFiles[0].type.startsWith('image/') ? 'Analyzed image...' : 'Analyzed document...');
      } else {
        this.prompt.set(`Analyzed ${newFiles.length} files...`);
      }
    }
  }

  removeAttachedFile(id: string, e: Event) {
    e.stopPropagation();
    this.attachedFiles.update(prev => prev.filter(f => f.id !== id));
  }

  removePastedSnippet(id: string, e: Event) {
    e.stopPropagation();
    this.pastedSnippets.update(prev => prev.filter(s => s.id !== id));
  }

  handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      this.handleFiles(files);
      return;
    }

    // Snippet pasting detection (> 300 characters)
    const text = e.clipboardData?.getData('text') || '';
    if (text.length > 300) {
      e.preventDefault();
      const id = Math.random().toString(36).substring(2, 9);
      this.pastedSnippets.update(prev => [
        ...prev,
        { id, content: text, timestamp: new Date() }
      ]);
      if (!this.prompt().trim()) {
        this.prompt.set('Analyzed pasted text...');
      }
    }
  }

  formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    this.activePrompt.set(item.prompt || 'Viewed from history');
    this.activeType.set(item.type);
    this.activeTone.set(item.tone || 'Casual');
    this.activeFiles.set([]);
    this.activeSnippets.set([]);
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
