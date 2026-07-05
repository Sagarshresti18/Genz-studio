import {
  Component, signal, computed, ElementRef, ViewChild, NgZone, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Types ─────────────────────────────────────────────────────
export type EditorTab  = 'templates' | 'upload' | 'ai';
export type ToolTab    = 'images' | 'text' | 'stickers' | 'effects';
export type Platform   = 'youtube' | 'instagram-post' | 'instagram-story' | 'twitter' | 'tiktok';
export type BgType     = 'color' | 'gradient' | 'image';
export type Effect     = 'none' | 'vivid' | 'dramatic' | 'cinematic' | 'neon' | 'vintage';
export type LayerType  = 'image' | 'text' | 'sticker';

export interface Layer {
  id: string;
  type: LayerType;
  x: number;   // % of canvas width
  y: number;   // % of canvas height
  w: number;   // % of canvas width
  h: number;   // % of canvas height
  // image
  src?: string;
  bgRemoved?: boolean;
  // text
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  shadow?: boolean;
  stroke?: boolean;
  // sticker
  emoji?: string;
}

export interface Template { id: string; name: string; gradient: string; }

// ── Constants ─────────────────────────────────────────────────
const PLATFORMS = [
  { id: 'youtube'         as Platform, label: 'YouTube',        w: 1280, h: 720,  icon: '▶' },
  { id: 'instagram-post'  as Platform, label: 'Instagram Post', w: 1080, h: 1080, icon: '◻' },
  { id: 'instagram-story' as Platform, label: 'IG Story',       w: 1080, h: 1920, icon: '▯' },
  { id: 'twitter'         as Platform, label: 'Twitter/X',      w: 1200, h: 675,  icon: '✕' },
  { id: 'tiktok'          as Platform, label: 'TikTok',         w: 1080, h: 1920, icon: '♪' },
];

const TEMPLATES: Template[] = [
  { id: 't1', name: 'Reaction Face',  gradient: 'linear-gradient(135deg,#7C3AED,#EC4899)' },
  { id: 't2', name: 'Bold Title',     gradient: 'linear-gradient(135deg,#EF4444,#F97316)' },
  { id: 't3', name: 'Neon Dark',      gradient: 'linear-gradient(135deg,#0f0f1a,#7C3AED)' },
  { id: 't4', name: 'Clean Minimal',  gradient: 'linear-gradient(135deg,#f8fafc,#e2e8f0)' },
  { id: 't5', name: 'Cinematic',      gradient: 'linear-gradient(135deg,#1e293b,#0f172a)' },
  { id: 't6', name: 'Sunset Vibe',    gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
  { id: 't7', name: 'Ocean Calm',     gradient: 'linear-gradient(135deg,#06B6D4,#10B981)' },
  { id: 't8', name: 'Purple Haze',    gradient: 'linear-gradient(135deg,#8B5CF6,#06B6D4)' },
];

const GRADIENTS = [
  'linear-gradient(135deg,#7C3AED,#06B6D4)',
  'linear-gradient(135deg,#EF4444,#F97316)',
  'linear-gradient(135deg,#10B981,#06B6D4)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#0f0f1a,#7C3AED)',
  'linear-gradient(135deg,#1e293b,#0f172a)',
  'linear-gradient(135deg,#FBBF24,#F97316)',
];

const STICKERS = ['🔥','⚡','💥','✨','🎯','👀','💯','🚀','😱','🤯','💪','🎬','🏆','💎','🌟','❤️','👑','🎵','📱','💡'];

const EFFECTS = [
  { id: 'none'      as Effect, label: 'Original',  filter: 'none' },
  { id: 'vivid'     as Effect, label: 'Vivid',     filter: 'saturate(1.8) contrast(1.1)' },
  { id: 'dramatic'  as Effect, label: 'Dramatic',  filter: 'contrast(1.4) brightness(0.9)' },
  { id: 'cinematic' as Effect, label: 'Cinematic', filter: 'sepia(0.3) contrast(1.2) brightness(0.95)' },
  { id: 'neon'      as Effect, label: 'Neon',      filter: 'saturate(2) hue-rotate(20deg) brightness(1.1)' },
  { id: 'vintage'   as Effect, label: 'Vintage',   filter: 'sepia(0.6) contrast(0.9) brightness(1.05)' },
];

const TEXT_COLORS = ['#ffffff','#000000','#F97316','#EF4444','#FBBF24','#10B981','#7C3AED','#06B6D4'];

@Component({
  selector: 'gz-thumbnail-maker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thumbnail-maker.html',
  styleUrl: './thumbnail-maker.scss'
})
export class ThumbnailMakerPage implements OnDestroy {
  @ViewChild('canvasEl')   canvasEl!:   ElementRef<HTMLDivElement>;
  @ViewChild('multiInput') multiInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bgInput')    bgInput!:    ElementRef<HTMLInputElement>;

  // ── Exposed constants ─────────────────────────────────────
  readonly platforms  = PLATFORMS;
  readonly templates  = TEMPLATES;
  readonly gradients  = GRADIENTS;
  readonly stickers   = STICKERS;
  readonly effects    = EFFECTS;
  readonly textColors = TEXT_COLORS;

  // ── Platform ──────────────────────────────────────────────
  selectedPlatform = signal<Platform>('youtube');
  currentPlatform  = computed(() => PLATFORMS.find(p => p.id === this.selectedPlatform())!);
  aspectPadding    = computed(() => {
    const p = this.currentPlatform();
    return `${(p.h / p.w) * 100}%`;
  });

  // ── Tabs ──────────────────────────────────────────────────
  editorTab = signal<EditorTab>('templates');
  toolTab   = signal<ToolTab>('images');

  // ── Background ────────────────────────────────────────────
  bgType     = signal<BgType>('gradient');
  bgColor    = signal('#7C3AED');
  bgGradient = signal(GRADIENTS[0]);
  bgImageUrl = signal<string | null>(null);

  // ── Layers (images + text + stickers unified) ─────────────
  layers     = signal<Layer[]>([]);
  selectedId = signal<string | null>(null);

  selectedLayer = computed(() => {
    const id = this.selectedId();
    return id ? this.layers().find(l => l.id === id) ?? null : null;
  });

  // ── Effect ────────────────────────────────────────────────
  activeEffect = signal<Effect>('none');
  activeFilter = computed(() => EFFECTS.find(e => e.id === this.activeEffect())?.filter ?? 'none');

  // ── New text form ─────────────────────────────────────────
  newText       = signal('Your Title Here');
  newFontSize   = signal(48);
  newFontWeight = signal('900');
  newTextColor  = signal('#ffffff');
  newShadow     = signal(true);
  newStroke     = signal(false);

  // ── AI ────────────────────────────────────────────────────
  aiPrompt     = signal('');
  aiTitle      = signal('');
  aiGenerating = signal(false);
  aiResult     = signal<string | null>(null);

  // ── Export ────────────────────────────────────────────────
  exporting    = signal(false);
  exportFormat = signal<'png' | 'jpg' | 'webp'>('png');

  // ── Drag / Resize state ───────────────────────────────────
  private dragState: {
    id: string;
    mode: 'move' | 'resize';
    startX: number; startY: number;
    origX: number; origY: number;
    origW: number; origH: number;
  } | null = null;

  private boundMove  = this.onPointerMove.bind(this);
  private boundUp    = this.onPointerUp.bind(this);

  constructor(private zone: NgZone) {
    window.addEventListener('pointermove', this.boundMove, { passive: false });
    window.addEventListener('pointerup',   this.boundUp);
  }

  ngOnDestroy() {
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup',   this.boundUp);
  }

  // ── Platform ──────────────────────────────────────────────
  selectPlatform(id: Platform) { this.selectedPlatform.set(id); }

  // ── Template ──────────────────────────────────────────────
  applyTemplate(t: Template) {
    this.bgType.set('gradient');
    this.bgGradient.set(t.gradient);
    this.editorTab.set('upload');
  }

  // ── Multi-image upload (max 4) ────────────────────────────
  triggerMultiUpload() { this.multiInput.nativeElement.click(); }
  triggerBgUpload()    { this.bgInput.nativeElement.click(); }

  onMultiUpload(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    const current = this.layers().filter(l => l.type === 'image').length;
    const allowed = Math.min(files.length, 4 - current);
    files.slice(0, allowed).forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = ev => {
        this.zone.run(() => {
          const id = crypto.randomUUID();
          // Stagger positions so images don't stack exactly
          this.layers.update(ls => [...ls, {
            id, type: 'image',
            src: ev.target!.result as string,
            bgRemoved: false,
            x: 5 + i * 5, y: 5 + i * 5,
            w: 40, h: 60,
          }]);
        });
      };
      reader.readAsDataURL(file);
    });
    (e.target as HTMLInputElement).value = '';
  }

  onBgUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      this.bgImageUrl.set(ev.target!.result as string);
      this.bgType.set('image');
    };
    reader.readAsDataURL(file);
    (e.target as HTMLInputElement).value = '';
  }

  removeLayer(id: string) {
    this.layers.update(ls => ls.filter(l => l.id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  removeBg(id: string) {
    this.layers.update(ls => ls.map(l => l.id === id ? { ...l, bgRemoved: true } : l));
  }

  imageCount() { return this.layers().filter(l => l.type === 'image').length; }

  // ── Text ──────────────────────────────────────────────────
  addText() {
    if (!this.newText().trim()) return;
    const id = crypto.randomUUID();
    this.layers.update(ls => [...ls, {
      id, type: 'text',
      text: this.newText(), fontSize: this.newFontSize(),
      fontWeight: this.newFontWeight(), color: this.newTextColor(),
      shadow: this.newShadow(), stroke: this.newStroke(),
      x: 5, y: 10, w: 60, h: 12,
    }]);
    this.selectedId.set(id);
    this.newText.set('');
  }

  // ── Sticker ───────────────────────────────────────────────
  addSticker(emoji: string) {
    const id = crypto.randomUUID();
    this.layers.update(ls => [...ls, {
      id, type: 'sticker', emoji,
      x: 10, y: 10, w: 12, h: 12,
    }]);
    this.selectedId.set(id);
  }

  // ── Selected layer property updates ──────────────────────
  updateSelected(patch: Partial<Layer>) {
    const id = this.selectedId();
    if (!id) return;
    this.layers.update(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));
  }

  selectLayer(id: string, e: Event) {
    e.stopPropagation();
    this.selectedId.set(id);
  }

  deselectAll() { this.selectedId.set(null); }

  bringForward(id: string) {
    this.layers.update(ls => {
      const i = ls.findIndex(l => l.id === id);
      if (i < ls.length - 1) {
        const arr = [...ls];
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        return arr;
      }
      return ls;
    });
  }

  sendBackward(id: string) {
    this.layers.update(ls => {
      const i = ls.findIndex(l => l.id === id);
      if (i > 0) {
        const arr = [...ls];
        [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
        return arr;
      }
      return ls;
    });
  }

  // ── Drag / Resize ─────────────────────────────────────────
  onPointerDown(e: PointerEvent, id: string, mode: 'move' | 'resize') {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const layer = this.layers().find(l => l.id === id);
    if (!layer) return;
    this.selectedId.set(id);
    this.dragState = {
      id, mode,
      startX: e.clientX, startY: e.clientY,
      origX: layer.x, origY: layer.y,
      origW: layer.w, origH: layer.h,
    };
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.dragState) return;
    e.preventDefault();
    const canvas = this.canvasEl?.nativeElement;
    if (!canvas) return;
    const rect   = canvas.getBoundingClientRect();
    const dx = ((e.clientX - this.dragState.startX) / rect.width)  * 100;
    const dy = ((e.clientY - this.dragState.startY) / rect.height) * 100;

    this.zone.run(() => {
      const { id, mode, origX, origY, origW, origH } = this.dragState!;
      if (mode === 'move') {
        const x = Math.max(0, Math.min(100 - origW, origX + dx));
        const y = Math.max(0, Math.min(100 - origH, origY + dy));
        this.layers.update(ls => ls.map(l => l.id === id ? { ...l, x, y } : l));
      } else {
        const w = Math.max(8, Math.min(100 - origX, origW + dx));
        const h = Math.max(6, Math.min(100 - origY, origH + dy));
        this.layers.update(ls => ls.map(l => l.id === id ? { ...l, w, h } : l));
      }
    });
  }

  private onPointerUp(_e: PointerEvent) {
    this.dragState = null;
  }

  // ── AI ────────────────────────────────────────────────────
  generateAiThumbnail() {
    if (!this.aiPrompt().trim()) return;
    this.aiGenerating.set(true);
    this.aiResult.set(null);
    setTimeout(() => {
      const grad = 'linear-gradient(135deg,#7C3AED 0%,#EC4899 50%,#F97316 100%)';
      this.bgGradient.set(grad);
      this.bgType.set('gradient');
      if (this.aiTitle().trim()) {
        const id = crypto.randomUUID();
        this.layers.update(ls => [...ls, {
          id, type: 'text',
          text: this.aiTitle(), fontSize: 52, fontWeight: '900',
          color: '#ffffff', shadow: true, stroke: false,
          x: 5, y: 8, w: 70, h: 14,
        }]);
        this.selectedId.set(id);
      }
      this.aiGenerating.set(false);
      this.aiResult.set('done');
      this.editorTab.set('upload');
    }, 2200);
  }

  // ── Export ────────────────────────────────────────────────
  exportThumbnail() {
    this.exporting.set(true);
    const p      = this.currentPlatform();
    const canvas = document.createElement('canvas');
    canvas.width  = p.w;
    canvas.height = p.h;
    const ctx = canvas.getContext('2d')!;

    // Background
    if (this.bgType() === 'color') {
      ctx.fillStyle = this.bgColor();
      ctx.fillRect(0, 0, p.w, p.h);
    } else {
      const grad = ctx.createLinearGradient(0, 0, p.w, p.h);
      grad.addColorStop(0, '#7C3AED');
      grad.addColorStop(1, '#06B6D4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, p.w, p.h);
    }

    // Layers
    const drawNext = (i: number) => {
      if (i >= this.layers().length) {
        const mime = this.exportFormat() === 'jpg' ? 'image/jpeg'
                   : this.exportFormat() === 'webp' ? 'image/webp' : 'image/png';
        const url = canvas.toDataURL(mime, 0.95);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `thumbnail-${this.selectedPlatform()}.${this.exportFormat()}`;
        a.click();
        this.exporting.set(false);
        return;
      }
      const layer = this.layers()[i];
      const lx = (layer.x / 100) * p.w;
      const ly = (layer.y / 100) * p.h;
      const lw = (layer.w / 100) * p.w;
      const lh = (layer.h / 100) * p.h;

      if (layer.type === 'image' && layer.src) {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          ctx.drawImage(img, lx, ly, lw, lh);
          ctx.restore();
          drawNext(i + 1);
        };
        img.src = layer.src;
      } else if (layer.type === 'text' && layer.text) {
        ctx.save();
        ctx.font = `${layer.fontWeight} ${(layer.fontSize ?? 48) * (p.w / 640)}px Inter,sans-serif`;
        ctx.fillStyle = layer.color ?? '#fff';
        if (layer.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur  = 12 * (p.w / 640);
        }
        if (layer.stroke) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth   = 3 * (p.w / 640);
          ctx.strokeText(layer.text, lx, ly + lh * 0.8);
        }
        ctx.fillText(layer.text, lx, ly + lh * 0.8);
        ctx.restore();
        drawNext(i + 1);
      } else if (layer.type === 'sticker' && layer.emoji) {
        ctx.save();
        ctx.font = `${lh}px serif`;
        ctx.fillText(layer.emoji, lx, ly + lh);
        ctx.restore();
        drawNext(i + 1);
      } else {
        drawNext(i + 1);
      }
    };
    drawNext(0);
  }

  // ── Helpers ───────────────────────────────────────────────
  getCanvasBg(): string {
    if (this.bgType() === 'color')    return this.bgColor();
    if (this.bgType() === 'gradient') return this.bgGradient();
    if (this.bgType() === 'image' && this.bgImageUrl()) return `url(${this.bgImageUrl()})`;
    return this.bgGradient();
  }

  layerStyle(l: Layer): Record<string, string> {
    const selected = this.selectedId() === l.id;
    return {
      position:  'absolute',
      left:      `${l.x}%`,
      top:       `${l.y}%`,
      width:     `${l.w}%`,
      height:    `${l.h}%`,
      outline:   selected ? '2px solid #F97316' : '2px solid transparent',
      outlineOffset: '2px',
      borderRadius: '4px',
      cursor:    'move',
      userSelect: 'none',
      touchAction: 'none',
      zIndex:    selected ? '10' : '1',
    };
  }

  textInnerStyle(l: Layer): Record<string, string> {
    return {
      fontSize:        `${(l.fontSize ?? 48) / 640 * 100}cqw`,
      fontWeight:      l.fontWeight ?? '900',
      color:           l.color ?? '#fff',
      textShadow:      l.shadow ? '2px 2px 8px rgba(0,0,0,0.7)' : 'none',
      WebkitTextStroke: l.stroke ? '1px #000' : 'none',
      lineHeight:      '1.1',
      whiteSpace:      'nowrap',
      overflow:        'hidden',
      width:           '100%',
      height:          '100%',
      display:         'flex',
      alignItems:      'center',
    };
  }

  stickerInnerStyle(l: Layer): Record<string, string> {
    return {
      fontSize:   '80%',
      lineHeight: '1',
      width:      '100%',
      height:     '100%',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  }
}
