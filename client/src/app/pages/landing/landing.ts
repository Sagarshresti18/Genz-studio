import { Component, signal, HostListener, OnInit, OnDestroy, AfterViewInit, computed, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'gz-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('heroCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  private animFrame: any;

  // ── Navbar
  scrolled   = signal(false);
  mobileOpen = signal(false);

  // ── Computed values for dynamic text loops (prevents complex DOM wrapping bugs)
  activeWordA = computed(() => this.heroA[this.heroIdx()]);
  activeWordB = computed(() => this.heroB[this.heroIdx()]);
  activeTool = computed(() => this.morphTools[this.toolIdx()]);
  activeToolColor = computed(() => {
    const colors = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#10b981'];
    return colors[this.toolIdx() % colors.length];
  });
  activeMaterialText = computed(() => this.tools[this.toolIdx() % this.tools.length].label);

  // ── Hero carousel (altm.bio: "We engineer [waste] into [purpose]")
  heroIdx = signal(0);
  private heroTimer: any;
  readonly heroA = ['your ideas', 'raw footage', 'rough scripts', 'brand visions'];
  readonly heroB = ['viral content', 'cinematic videos', 'scroll-stopping posts', 'studio-quality work'];

  // ── Tools carousel (biomorph section)
  toolIdx = signal(0);
  private toolTimer: any;
  readonly morphTools = [
    'Logo Generator', 'Thumbnail Maker', 'Video Editor',
    'AI Audio', 'Content Calendar', 'AI Scripts',
    'Music Library', 'Meme Creator', 'Image Editor'
  ];

  // ── Tool cards (3D materials section)
  readonly tools = [
    { icon: '◈', label: 'Logo Generator',    color: '#7C3AED', desc: 'AI-crafted logos in seconds'              },
    { icon: '▶', label: 'YouTube Banner',     color: '#EF4444', desc: 'Channel art that converts'               },
    { icon: '▣', label: 'Thumbnail Maker',    color: '#F97316', desc: 'Stop-the-scroll thumbnails'              },
    { icon: '✦', label: 'Image Editor',       color: '#06B6D4', desc: 'Pro edits, zero learning curve'          },
    { icon: '⬡', label: 'Video Editor',       color: '#F59E0B', desc: 'Timeline editing for creators'           },
    { icon: '◉', label: 'AI Videos',          color: '#EC4899', desc: 'Text-to-video generation'                },
    { icon: '♪', label: 'AI Audio',           color: '#8B5CF6', desc: 'Voiceovers & sound effects'              },
    { icon: '♫', label: 'Music Library',      color: '#14B8A6', desc: '100k+ royalty-free tracks'               },
    { icon: '✧', label: 'AI Scripts',         color: '#10B981', desc: 'Hooks, scripts & captions'               },
    { icon: '◫', label: 'Content Calendar',   color: '#6366F1', desc: 'Plan & auto-publish'                     },
    { icon: '😂', label: 'Meme Library',      color: '#FBBF24', desc: 'Trending meme templates'                 },
  ];

  // ── Testimonials
  readonly testimonials = [
    { name: 'Priya S.',  handle: '@priyacreates', text: 'My thumbnail CTR went from 3% to 11% in two weeks. GenZ Studio changed everything.',     av: 'P', c: '#7C3AED' },
    { name: 'Marcus T.', handle: '@marcustech',   text: 'I replaced 4 separate tools with one. The AI script writer alone is worth it.',          av: 'M', c: '#EF4444' },
    { name: 'Aisha K.',  handle: '@aishavibes',   text: 'Music library + AI audio combo is a complete game changer for my Reels & Shorts.',       av: 'A', c: '#10B981' },
  ];

  // ── Our Projects Showcase
  readonly ourProjects = [
    {
      title: 'Fintech App Brand Kit',
      type: 'Logo & Identity',
      desc: 'High-quality vector SVGs, typographic hierarchy guidelines, and color palettes created instantly.',
      metrics: 'Generated in 12s • Vector SVG',
      color: '#6366F1',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #0ea5e9 100%)'
    },
    {
      title: 'SaaS Promo Timeline',
      type: 'AI Video Editor',
      desc: 'Timeline layers showing automated subtitles, clip trims, sound effects, and smooth transitions.',
      metrics: '+340% View Duration • 4K Export',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)'
    },
    {
      title: 'Dev Series Thumbnails',
      type: 'Thumbnail Maker',
      desc: 'Optimized high-contrast, clean developer thumbnails with calculated placement guides.',
      metrics: 'CTR: 3.4% → 11.2% • Boosted CTR',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)'
    },
    {
      title: '30-Day Automated Schedule',
      type: 'Content Calendar',
      desc: 'Scheduled content queue displaying publish dates, social media channels, and post descriptions.',
      metrics: 'Auto-Published • 4 Channels',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
    }
  ];

  // ── Particles (for info section bg)
  readonly particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: Math.random() * 3 + 1,
    d: Math.random() * 5,
    dur: Math.random() * 8 + 6,
  }));

  // ── Stats
  readonly stats = [
    { value: '500K+', label: 'active creators' },
    { value: '11',    label: 'AI-powered tools' },
    { value: '100K+', label: 'music tracks'     },
    { value: '4.9★',  label: 'average rating'   },
  ];

  // ── Modal
  modalOpen  = signal(false);
  authTab    = signal<'signin'|'signup'>('signup');
  email      = signal('');
  password   = signal('');
  fullName   = signal('');
  agreeTerms = signal(false);
  emailErr   = signal('');
  passErr    = signal('');
  nameErr    = signal('');
  termsErr   = signal('');
  srvErr     = signal('');
  submitting = signal(false);

  readonly strength = computed(() => {
    const p = this.password();
    if (!p) return { score: 0, label: '', cls: '' };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { score: 25,  label: 'Weak',   cls: 'weak'   };
    if (s <= 3) return { score: 60,  label: 'Medium', cls: 'medium' };
    return              { score: 100, label: 'Strong', cls: 'strong' };
  });

  constructor(
    private router: Router,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.heroTimer = setInterval(() => this.heroIdx.update(i => (i + 1) % this.heroA.length), 4200);
    this.toolTimer = setInterval(() => this.toolIdx.update(i => (i + 1) % this.morphTools.length), 4200);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startCanvas();
    }
  }

  private startCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Dots config
    const dots: { x: number; y: number; vx: number; vy: number; r: number; }[] = [];
    const NUM = 80;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < NUM; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    const COLORS = ['rgba(124,58,237,', 'rgba(6,182,212,', 'rgba(167,139,250,'];

    const draw = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      dots.forEach((d, idx) => {
        const col = COLORS[idx % COLORS.length];
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = col + '0.7)';
        ctx.fill();

        // Move
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      });

      this.animFrame = requestAnimationFrame(draw);
    };

    draw();
  }

  ngOnDestroy() {
    clearInterval(this.heroTimer);
    clearInterval(this.toolTimer);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 30); }

  @HostListener('document:keydown.escape')
  onEsc() { this.closeModal(); }

  // ── Modal controls
  openModal(tab: 'signin'|'signup' = 'signup') {
    this.authTab.set(tab);
    this.modalOpen.set(true);
    this.clearErrs();
    document.body.style.overflow = 'hidden';
  }
  closeModal() {
    this.modalOpen.set(false);
    document.body.style.overflow = '';
  }
  onOverlayClick(e: Event) {
    if ((e.target as Element).classList.contains('modal-overlay')) this.closeModal();
  }
  setTab(tab: 'signin'|'signup') { this.authTab.set(tab); this.clearErrs(); }
  private clearErrs() { this.emailErr.set(''); this.passErr.set(''); this.nameErr.set(''); this.termsErr.set(''); this.srvErr.set(''); }

  // ── Input handlers
  onEmail(e: Event)    { const v = (e.target as HTMLInputElement).value; this.email.set(v);    this.vEmail(v); }
  onPass(e: Event)     { const v = (e.target as HTMLInputElement).value; this.password.set(v); this.vPass(v);  }
  onName(e: Event)     { const v = (e.target as HTMLInputElement).value; this.fullName.set(v); this.vName(v);  }
  onTerms(e: Event)    { this.agreeTerms.set((e.target as HTMLInputElement).checked); }

  private vEmail(v: string) {
    if (!v) return this.emailErr.set('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return this.emailErr.set('Enter a valid email');
    this.emailErr.set('');
  }
  private vPass(v: string) {
    if (!v) return this.passErr.set('Password is required');
    if (v.length < 8) return this.passErr.set('Minimum 8 characters');
    this.passErr.set('');
  }
  private vName(v: string) {
    if (this.authTab() === 'signup' && !v.trim()) return this.nameErr.set('Name is required');
    this.nameErr.set('');
  }

  submit(e: Event) {
    e.preventDefault();
    this.vEmail(this.email()); this.vPass(this.password()); this.vName(this.fullName());
    if (this.authTab() === 'signup' && !this.agreeTerms()) { this.termsErr.set('You must agree to continue'); return; }
    if (this.emailErr() || this.passErr() || this.nameErr()) return;

    this.submitting.set(true);
    setTimeout(() => {
      this.auth.login({ id: '1', fullName: this.authTab() === 'signup' ? this.fullName() : 'Creator', email: this.email() }, 'mock-token');
      this.submitting.set(false);
      this.closeModal();
      this.router.navigate(['/workspace/dashboard']);
    }, 1100);
  }
}
