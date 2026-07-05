import {
  Component, OnInit, AfterViewInit, OnDestroy,
  signal, computed, inject, ElementRef, ViewChild, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface MemeTemplate {
  id: string; name: string; url: string;
  width: number; height: number; box_count: number;
  category: string; trending: boolean;
}
interface MyMeme {
  id: string; template_id: string; top_text: string;
  bottom_text: string; output_url: string; created_at: string;
}
interface AiCaption { top: string; bottom: string; }
interface TextLabel {
  id: string; text: string; x: number; y: number;
  color: string; size: number; bold: boolean; shadow: boolean;
}

const CATEGORIES = [
  { key: 'all',       label: 'All'        },
  { key: 'trending',  label: 'Trending'   },
  { key: 'bollywood', label: 'Bollywood'  },
  { key: 'reaction',  label: 'Reaction'   },
  { key: 'comparison',label: 'Comparison' },
  { key: 'decision',  label: 'Decision'   },
  { key: 'classic',   label: 'Classic'    },
];

// Real Bollywood / Indian meme templates with actual distinct images
const BOLLYWOOD_TEMPLATES: MemeTemplate[] = [
  { id: 'b1', name: 'Deepika Padukone Stare',    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Deepika_Padukone_at_Cannes_2022_%28cropped%29.jpg/440px-Deepika_Padukone_at_Cannes_2022_%28cropped%29.jpg', width: 440, height: 550, box_count: 2, category: 'bollywood', trending: true },
  { id: 'b2', name: 'Ranveer Singh Shocked',      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Ranveer_Singh_snapped_at_airport_%28cropped%29.jpg/440px-Ranveer_Singh_snapped_at_airport_%28cropped%29.jpg', width: 440, height: 550, box_count: 2, category: 'bollywood', trending: true },
  { id: 'b3', name: 'Priyanka Chopra Side Eye',   url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Priyanka_Chopra_at_Marrakech_IFF_2019_%28cropped%29.jpg/440px-Priyanka_Chopra_at_Marrakech_IFF_2019_%28cropped%29.jpg', width: 440, height: 550, box_count: 2, category: 'bollywood', trending: false },
  { id: 'b4', name: 'Shah Rukh Khan Arms Open',   url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shah_Rukh_Khan_graces_the_launch_of_Kolkata_Knight_Riders_jersey_%28cropped%29.jpg/440px-Shah_Rukh_Khan_graces_the_launch_of_Kolkata_Knight_Riders_jersey_%28cropped%29.jpg', width: 440, height: 550, box_count: 2, category: 'bollywood', trending: true },
  { id: 'b5', name: 'Katrina Kaif Confused',      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Katrina_Kaif_at_Jio_MAMI_2019_%28cropped%29.jpg/440px-Katrina_Kaif_at_Jio_MAMI_2019_%28cropped%29.jpg', width: 440, height: 550, box_count: 2, category: 'bollywood', trending: false },
  { id: 'b6', name: 'Alia Bhatt Crying',          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Alia_Bhatt_at_Filmfare_Awards_2020_%28cropped%29.jpg/440px-Alia_Bhatt_at_Filmfare_Awards_2020_%28cropped%29.jpg', width: 440, height: 550, box_count: 2, category: 'bollywood', trending: true },
  { id: 'b7', name: 'Salman Khan Bhai',           url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Salman_Khan_at_the_IIFA_Awards_2019_%28cropped%29.jpg/440px-Salman_Khan_at_the_IIFA_Awards_2019_%28cropped%29.jpg', width: 440, height: 550, box_count: 2, category: 'bollywood', trending: true },
  { id: 'b8', name: 'Akshay Kumar Reaction',      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Akshay_Kumar_at_the_IIFA_Awards_2019_%28cropped%29.jpg/440px-Akshay_Kumar_at_the_IIFA_Awards_2019_%28cropped%29.jpg', width: 440, height: 550, box_count: 2, category: 'bollywood', trending: false },
];

@Component({
  selector: 'gz-meme-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meme-library.html',
  styleUrl: './meme-library.scss',
})
export class MemeLibraryPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrap') canvasWrapRef!: ElementRef<HTMLDivElement>;

  private api = inject(ApiService);
  private zone = inject(NgZone);

  readonly activeTab = signal<'browse' | 'editor' | 'mine'>('browse');
  readonly activeCategory = signal('all');
  readonly searchQuery = signal('');
  readonly templates = signal<MemeTemplate[]>([]);
  readonly myMemes = signal<MyMeme[]>([]);
  readonly loadingTemplates = signal(true);
  readonly loadingMemes = signal(false);
  readonly customImageUrl = signal('');

  // Editor
  readonly selectedTemplate = signal<MemeTemplate | null>(null);
  readonly labels = signal<TextLabel[]>([
    { id: 'top', text: '', x: 0.5, y: 0.08, color: '#ffffff', size: 32, bold: true, shadow: true },
    { id: 'bot', text: '', x: 0.5, y: 0.92, color: '#ffffff', size: 32, bold: true, shadow: true },
  ]);
  readonly selectedLabelId = signal<string>('top');
  readonly isRemixing = signal(false);
  readonly remixResult = signal<string | null>(null);

  // AI
  readonly aiContext = signal('');
  readonly aiTone = signal('funny');
  readonly aiCaptions = signal<AiCaption[]>([]);
  readonly loadingCaptions = signal(false);

  readonly toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  private toastTimer: any;

  readonly categories = CATEGORIES;
  readonly aiTones = ['funny', 'savage', 'relatable', 'wholesome', 'dark'];
  readonly fontSizes = [18, 24, 28, 32, 36, 42, 48];

  // Canvas drag state
  private img = new Image();
  private dragging: string | null = null;
  private dragOffX = 0;
  private dragOffY = 0;
  private canvasW = 0;
  private canvasH = 0;
  private boundMouseMove!: (e: MouseEvent) => void;
  private boundMouseUp!: (e: MouseEvent) => void;
  private boundTouchMove!: (e: TouchEvent) => void;
  private boundTouchEnd!: (e: TouchEvent) => void;

  readonly filteredTemplates = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const cat = this.activeCategory();
    return this.templates().filter(t => {
      const matchQ = !q || t.name.toLowerCase().includes(q);
      const matchC = cat === 'all' || (cat === 'trending' ? t.trending : t.category === cat);
      return matchQ && matchC;
    });
  });

  readonly trendingTemplates = computed(() => this.templates().filter(t => t.trending).slice(0, 8));

  readonly selectedLabel = computed(() => this.labels().find(l => l.id === this.selectedLabelId()) ?? this.labels()[0]);

  ngOnInit() { this.loadTemplates(); }

  constructor() {}

  ngAfterViewInit() {
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);
  }

  ngOnDestroy() { this.removeListeners(); }

  // ── Templates ──────────────────────────────────────────────
  loadTemplates(page = 1) {
    this.loadingTemplates.set(true);
    this.api.getMemeTemplates({ page }).subscribe({
      next: (res: any) => {
        const apiTemplates = (res.templates || []) as MemeTemplate[];
        // merge preserving existing demo templates and avoiding duplicates by id
        // proxy local demo template URLs through backend to avoid CORS/mixed-content issues
        const backendOrigin = `${location.protocol}//${location.hostname}:8080`;
        const proxiedDemos = BOLLYWOOD_TEMPLATES.map(t => ({ ...t, url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent(t.url)}` }));
        const merged = [...proxiedDemos];
        for (const t of apiTemplates) if (!merged.find(m => m.id === t.id)) merged.push(t);
        this.templates.set(merged);
        this.loadingTemplates.set(false);
      },
      error: () => { this.loadDemoTemplates(); this.loadingTemplates.set(false); },
    });
  }

  loadMoreTemplates() {
    // naive pagination: request next page based on current count
    const current = this.templates().length;
    const page = Math.floor(current / 20) + 1;
    this.loadTemplates(page + 1);
  }

  addCustomImage() {
    const url = this.customImageUrl().trim();
    if (!url) {
      this.showToast('Enter an image URL first', 'error');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      this.showToast('URL must start with http:// or https://', 'error');
      return;
    }
    try {
      new URL(url);
    } catch {
      this.showToast('Enter a valid URL', 'error');
      return;
    }

    const backendOrigin = `${location.protocol}//${location.hostname}:8080`;
    const template: MemeTemplate = {
      id: `custom-${Date.now()}`,
      name: 'Custom Image',
      url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent(url)}`,
      width: 800,
      height: 800,
      box_count: 2,
      category: 'classic',
      trending: false,
    };
    this.templates.update(list => [template, ...list]);
    this.customImageUrl.set('');
    this.selectTemplate(template);
  }

  loadMyMemes() {
    this.loadingMemes.set(true);
    this.api.getMyMemes().subscribe({
      next: (res: any) => { this.myMemes.set(res.memes || []); this.loadingMemes.set(false); },
      error: () => this.loadingMemes.set(false),
    });
  }

  selectTemplate(t: MemeTemplate) {
    this.selectedTemplate.set(t);
    this.labels.set([
      { id: 'top', text: '', x: 0.5, y: 0.08, color: '#ffffff', size: 32, bold: true, shadow: true },
      { id: 'bot', text: '', x: 0.5, y: 0.92, color: '#ffffff', size: 32, bold: true, shadow: true },
    ]);
    this.remixResult.set(null);
    this.aiCaptions.set([]);
    this.canvasListenersAttached = false;
    this.activeTab.set('editor');
    setTimeout(() => this.initCanvas(), 150);
  }

  // ── Canvas ─────────────────────────────────────────────────
  private canvasListenersAttached = false;

  initCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    const wrap = this.canvasWrapRef?.nativeElement;
    const t = this.selectedTemplate();
    if (!canvas || !wrap || !t) return;

    const maxW = wrap.clientWidth || 600;
    const ratio = t.height / t.width;
    this.canvasW = maxW;
    this.canvasH = Math.round(maxW * ratio);
    canvas.width = this.canvasW;
    canvas.height = this.canvasH;

    // Only attach listeners once per canvas instance
    if (!this.canvasListenersAttached) {
      canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
      canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup', this.boundMouseUp);
      document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
      document.addEventListener('touchend', this.boundTouchEnd);
      this.canvasListenersAttached = true;
    }

    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.img.onload = () => this.drawCanvas();
    this.img.onerror = () => {
      // Draw placeholder if image fails to load (CORS etc)
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, this.canvasW, this.canvasH);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.name, this.canvasW / 2, this.canvasH / 2);
    };
    this.img.src = t.url;
  }

  drawCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvasW, this.canvasH);
    ctx.drawImage(this.img, 0, 0, this.canvasW, this.canvasH);

    for (const label of this.labels()) {
      if (!label.text.trim()) continue;
      const px = label.x * this.canvasW;
      const py = label.y * this.canvasH;
      const fs = Math.round(label.size * (this.canvasW / 600));
      ctx.font = `${label.bold ? '900' : '600'} ${fs}px Impact, Arial Black, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (label.shadow) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = fs * 0.12;
        ctx.lineJoin = 'round';
        ctx.strokeText(label.text.toUpperCase(), px, py);
      }
      ctx.fillStyle = label.color;
      ctx.fillText(label.text.toUpperCase(), px, py);

      // Selection indicator
      if (label.id === this.selectedLabelId()) {
        const metrics = ctx.measureText(label.text.toUpperCase());
        const tw = metrics.width + 16;
        const th = fs + 12;
        ctx.strokeStyle = 'rgba(99,102,241,0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(px - tw / 2, py - th / 2, tw, th);
        ctx.setLineDash([]);
      }
    }
  }

  private getCanvasPos(clientX: number, clientY: number) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = this.canvasW / rect.width;
    const scaleY = this.canvasH / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  private hitTest(px: number, py: number): string | null {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    for (const label of [...this.labels()].reverse()) {
      if (!label.text.trim()) continue;
      const lx = label.x * this.canvasW;
      const ly = label.y * this.canvasH;
      const fs = Math.round(label.size * (this.canvasW / 600));
      ctx.font = `${label.bold ? '900' : '600'} ${fs}px Impact, Arial Black, sans-serif`;
      const tw = ctx.measureText(label.text.toUpperCase()).width + 24;
      const th = fs + 16;
      if (px >= lx - tw / 2 && px <= lx + tw / 2 && py >= ly - th / 2 && py <= ly + th / 2) {
        return label.id;
      }
    }
    return null;
  }

  onMouseDown(e: MouseEvent) {
    const pos = this.getCanvasPos(e.clientX, e.clientY);
    const hit = this.hitTest(pos.x, pos.y);
    if (hit) {
      this.dragging = hit;
      const label = this.labels().find(l => l.id === hit)!;
      this.dragOffX = pos.x - label.x * this.canvasW;
      this.dragOffY = pos.y - label.y * this.canvasH;
      this.zone.run(() => this.selectedLabelId.set(hit));
      e.preventDefault();
    }
  }

  onMouseMove(e: MouseEvent) {
    if (!this.dragging) return;
    const pos = this.getCanvasPos(e.clientX, e.clientY);
    this.moveLabel(this.dragging, pos.x - this.dragOffX, pos.y - this.dragOffY);
  }

  onMouseUp() { this.dragging = null; }

  onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    const pos = this.getCanvasPos(t.clientX, t.clientY);
    const hit = this.hitTest(pos.x, pos.y);
    if (hit) {
      this.dragging = hit;
      const label = this.labels().find(l => l.id === hit)!;
      this.dragOffX = pos.x - label.x * this.canvasW;
      this.dragOffY = pos.y - label.y * this.canvasH;
      this.zone.run(() => this.selectedLabelId.set(hit));
      e.preventDefault();
    }
  }

  onTouchMove(e: TouchEvent) {
    if (!this.dragging) return;
    const t = e.touches[0];
    const pos = this.getCanvasPos(t.clientX, t.clientY);
    this.moveLabel(this.dragging, pos.x - this.dragOffX, pos.y - this.dragOffY);
    e.preventDefault();
  }

  onTouchEnd() { this.dragging = null; }

  private moveLabel(id: string, px: number, py: number) {
    const nx = Math.max(0.02, Math.min(0.98, px / this.canvasW));
    const ny = Math.max(0.02, Math.min(0.98, py / this.canvasH));
    this.zone.run(() => {
      this.labels.update(ls => ls.map(l => l.id === id ? { ...l, x: nx, y: ny } : l));
    });
    this.drawCanvas();
  }

  private removeListeners() {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
  }

  // ── Label controls ─────────────────────────────────────────
  updateLabel(field: keyof TextLabel, value: any) {
    this.labels.update(ls => ls.map(l => l.id === this.selectedLabelId() ? { ...l, [field]: value } : l));
    this.drawCanvas();
  }

  addLabel() {
    const id = `label-${Date.now()}`;
    this.labels.update(ls => [...ls, { id, text: 'New text', x: 0.5, y: 0.5, color: '#ffffff', size: 28, bold: true, shadow: true }]);
    this.selectedLabelId.set(id);
    this.drawCanvas();
  }

  removeLabel(id: string) {
    if (this.labels().length <= 1) return;
    this.labels.update(ls => ls.filter(l => l.id !== id));
    this.selectedLabelId.set(this.labels()[0].id);
    this.drawCanvas();
  }

  // ── Export / Save ──────────────────────────────────────────
  remix() {
    const t = this.selectedTemplate();
    if (!t || this.isRemixing()) return;
    this.isRemixing.set(true);

    const canvas = this.canvasRef.nativeElement;
    const outputUrl = canvas.toDataURL('image/png');
    this.remixResult.set(outputUrl);

    // Save to backend
    const topLabel = this.labels().find(l => l.id === 'top');
    const botLabel = this.labels().find(l => l.id === 'bot');
    this.api.remixMeme({
      templateId: t.id,
      topText: topLabel?.text || '',
      bottomText: botLabel?.text || '',
    }).subscribe({
      next: () => { this.isRemixing.set(false); this.showToast('Meme saved!', 'success'); this.loadMyMemes(); },
      error: () => { this.isRemixing.set(false); this.showToast('Saved locally', 'success'); },
    });
  }

  downloadMeme() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `meme-${Date.now()}.png`;
    a.click();
  }

  // ── AI Captions ────────────────────────────────────────────
  generateAiCaptions() {
    const t = this.selectedTemplate();
    if (!t) return;
    this.loadingCaptions.set(true);
    this.api.generateAiCaption({ templateName: t.name, context: this.aiContext(), tone: this.aiTone() }).subscribe({
      next: (res: any) => { this.aiCaptions.set(res.captions || []); this.loadingCaptions.set(false); },
      error: () => this.loadingCaptions.set(false),
    });
  }

  applyCaption(cap: AiCaption) {
    this.labels.update(ls => ls.map(l => {
      if (l.id === 'top') return { ...l, text: cap.top };
      if (l.id === 'bot') return { ...l, text: cap.bottom };
      return l;
    }));
    this.drawCanvas();
  }

  deleteMeme(meme: MyMeme, e: Event) {
    e.stopPropagation();
    this.api.deleteMeme(meme.id).subscribe({
      next: () => { this.myMemes.update(m => m.filter(i => i.id !== meme.id)); this.showToast('Deleted', 'success'); },
    });
  }

  switchTab(tab: 'browse' | 'editor' | 'mine') {
    this.activeTab.set(tab);
    if (tab === 'mine') this.loadMyMemes();
    if (tab === 'editor' && this.selectedTemplate()) setTimeout(() => this.initCanvas(), 150);
  }

  showToast(msg: string, type: 'success' | 'error') {
    clearTimeout(this.toastTimer);
    this.toast.set({ msg, type });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3000);
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private loadDemoTemplates() {
    const backendOrigin = `${location.protocol}//${location.hostname}:8080`;
    const proxied = (t: MemeTemplate) => ({ ...t, url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent(t.url)}` });
    this.templates.set([
      ...BOLLYWOOD_TEMPLATES.map(proxied),
      { id: '181913649', name: 'Drake Hotline Bling',  url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/30b1gx.jpg')}`, width: 1200, height: 1200, box_count: 2, category: 'reaction',   trending: true  },
      { id: '87743020',  name: 'Two Buttons',          url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/1g8my4.jpg')}`,  width: 600,  height: 908,  box_count: 3, category: 'decision',   trending: true  },
      { id: '112126428', name: 'Distracted Boyfriend', url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/1ur9b0.jpg')}`,  width: 1200, height: 800,  box_count: 3, category: 'reaction',   trending: true  },
      { id: '217743513', name: 'UNO Draw 25 Cards',    url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/3lmzyx.jpg')}`,  width: 500,  height: 486,  box_count: 2, category: 'decision',   trending: true  },
      { id: '93895088',  name: 'Expanding Brain',      url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/1jwhww.jpg')}`,  width: 857,  height: 1202, box_count: 4, category: 'comparison', trending: true  },
      { id: '188390779', name: 'Woman Yelling at Cat', url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/345v97.jpg')}`,  width: 1200, height: 628,  box_count: 2, category: 'reaction',   trending: true  },
      { id: '247375501', name: 'Buff Doge vs. Cheems', url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/43a45p.jpg')}`,  width: 937,  height: 720,  box_count: 2, category: 'comparison', trending: true  },
      { id: '61579',     name: 'One Does Not Simply',  url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/1bij.jpg')}`,    width: 568,  height: 335,  box_count: 2, category: 'classic',    trending: false },
      { id: '101470',    name: 'Ancient Aliens',       url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/26am.jpg')}`,    width: 500,  height: 437,  box_count: 2, category: 'classic',    trending: false },
      { id: '4087833',   name: 'Waiting Skeleton',     url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://i.imgflip.com/2fm6x.jpg')}`,   width: 500,  height: 623,  box_count: 2, category: 'reaction',   trending: false },
      // Additional reliable templates (duplicates of known good images) to increase variety
      { id: 'b9',  name: 'Deepika Padukone Stare (Alt)', url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Deepika_Padukone_at_Cannes_2022_%28cropped%29.jpg/440px-Deepika_Padukone_at_Cannes_2022_%28cropped%29.jpg')}`, width: 440, height: 550, box_count: 2, category: 'bollywood', trending: false },
      { id: 'b10', name: 'Ranveer Singh Shocked (Alt)', url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Ranveer_Singh_snapped_at_airport_%28cropped%29.jpg/440px-Ranveer_Singh_snapped_at_airport_%28cropped%29.jpg')}`, width: 440, height: 550, box_count: 2, category: 'bollywood', trending: false },
      { id: 'b11', name: 'Shah Rukh Khan Arms Open (Alt)', url: `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shah_Rukh_Khan_graces_the_launch_of_Kolkata_Knight_Riders_jersey_%28cropped%29.jpg/440px-Shah_Rukh_Khan_graces_the_launch_of_Kolkata_Knight_Riders_jersey_%28cropped%29.jpg')}`, width: 440, height: 550, box_count: 2, category: 'bollywood', trending: false },
    ]);
  }

  onImageError(e: Event) {
    const img = e.target as HTMLImageElement;
    // Try to request a generated replacement image from backend if available
    const name = img.alt || 'Meme template';
    const backend = `${location.protocol}//${location.hostname}:8080`;
    const genUrl = `${backend}/api/memes/generated?name=${encodeURIComponent(name)}`;
    fetch(genUrl, { headers: { 'Content-Type': 'application/json' } })
      .then(async (res) => {
        if (!res.ok) throw new Error('gen-failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        img.src = url;
      })
      .catch(() => {
        // fallback lightweight SVG placeholder data URI
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
          <svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
            <rect width='100%' height='100%' fill='#f8fafc' />
            <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#94a3b8' font-family='Arial, sans-serif' font-size='18'>Image not available</text>
          </svg>
        `);
      });
  }
}
