import {
  Component,
  signal,
  computed,
  HostListener,
  AfterViewInit,
  ElementRef,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface AiTool {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  output: string;
  gradient: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  stars: number;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

@Component({
  selector: 'gz-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements AfterViewInit {
  private el = inject(ElementRef);

  // ── Signals ────────────────────────────────────
  isAnnual = signal(true);
  activeToolTab = signal('logo-generator');
  activeTestimonialIndex = signal(0);
  faqOpenState = signal<boolean[]>([false, false, false, false, false, false, false, false]);
  mobileNavOpen = signal(false);
  scrolled = signal(false);

  // ── Data ───────────────────────────────────────
  navLinks = ['Features', 'AI Tools', 'Pricing', 'Blog'];

  stats = [
    { value: '50K+', label: 'Creators' },
    { value: '1M+', label: 'Designs' },
    { value: '22', label: 'AI Tools' },
    { value: '99.9%', label: 'Uptime' },
  ];

  trustedBrands = ['TechCrunch', 'Forbes', 'ProductHunt', 'Dribbble', 'Behance', 'Figma'];

  features = [
    {
      icon: '✦',
      title: 'AI-Powered Creation',
      description:
        'Generate stunning visuals, copy, and videos in seconds using state-of-the-art AI models fine-tuned for creators.',
    },
    {
      icon: '✎',
      title: 'Professional Design Suite',
      description:
        'Full-featured design editor with templates, layers, effects, and export options rivaling desktop tools.',
    },
    {
      icon: '▶',
      title: 'Video Studio',
      description:
        'Edit, render, and publish professional videos with AI-assisted cuts, captions, and effects.',
    },
    {
      icon: '◉',
      title: 'Smart Scheduling',
      description:
        'Plan and auto-publish content across all social platforms with intelligent time-slot optimization.',
    },
    {
      icon: '⚑',
      title: 'Team Collaboration',
      description:
        'Real-time co-editing, comments, version history, and role-based access for seamless teamwork.',
    },
    {
      icon: '⊞',
      title: 'Analytics & Insights',
      description:
        'Track performance across every channel with AI-powered recommendations to boost engagement.',
    },
  ];

  aiTools: AiTool[] = [
    {
      id: 'logo-generator',
      name: 'Logo Generator',
      icon: '◇',
      prompt: 'Create a minimal tech startup logo with a phoenix rising, purple and cyan tones',
      output: 'Generated 4 logo variations with brand guidelines and SVG exports ready.',
      gradient: 'linear-gradient(135deg, #6C5CE7 0%, #00D2FF 100%)',
    },
    {
      id: 'image-generator',
      name: 'Image Generator',
      icon: '▣',
      prompt: 'A futuristic cityscape at sunset, cyberpunk aesthetic, 4K resolution',
      output: 'Rendered 2048×2048 image in 8 seconds. Style: Cyberpunk Realism.',
      gradient: 'linear-gradient(135deg, #00D2FF 0%, #00E676 100%)',
    },
    {
      id: 'content-writer',
      name: 'Content Writer',
      icon: '¶',
      prompt: 'Write a compelling product launch tweet thread for a design tool',
      output: '5-tweet thread generated with hashtags, hooks, and CTA optimized for engagement.',
      gradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFB300 100%)',
    },
    {
      id: 'video-generator',
      name: 'Video Generator',
      icon: '▷',
      prompt: 'Create a 30-second product demo video from these 5 screenshots',
      output: '30s video with transitions, background music, and voiceover narration ready.',
      gradient: 'linear-gradient(135deg, #6C5CE7 0%, #FF6B9D 100%)',
    },
    {
      id: 'voice-cloning',
      name: 'Voice Cloning',
      icon: '♫',
      prompt: 'Clone my voice from this 30-second sample for podcast narration',
      output: 'Voice model trained. 98.5% similarity score. Ready for text-to-speech.',
      gradient: 'linear-gradient(135deg, #FFB300 0%, #FF5252 100%)',
    },
    {
      id: 'seo-assistant',
      name: 'SEO Assistant',
      icon: '⟁',
      prompt: 'Analyze my blog post and optimize for "AI design tools" keyword',
      output: 'SEO score: 92/100. 12 optimization suggestions applied automatically.',
      gradient: 'linear-gradient(135deg, #00E676 0%, #00D2FF 100%)',
    },
  ];

  howItWorks = [
    {
      step: 1,
      title: 'Create',
      description:
        'Start from scratch or choose from 5,000+ premium templates. Drag, drop, and customize with our intuitive editor.',
      icon: '⊕',
    },
    {
      step: 2,
      title: 'Enhance with AI',
      description:
        'Let AI upscale, retouch, write copy, generate variations, and optimize everything for maximum impact.',
      icon: '⚡',
    },
    {
      step: 3,
      title: 'Publish Everywhere',
      description:
        'Export in any format or auto-publish to Instagram, YouTube, TikTok, LinkedIn, and 15+ platforms.',
      icon: '⟶',
    },
  ];

  pricingPlans: PricingPlan[] = [
    {
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for getting started',
      features: [
        '5 AI generations/day',
        '1 GB storage',
        'Basic templates',
        'Standard export (1080p)',
        'Community support',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro',
      monthlyPrice: 19,
      annualPrice: 15,
      description: 'For serious creators',
      features: [
        'Unlimited AI generations',
        '100 GB storage',
        'All premium templates',
        '4K export + custom formats',
        'Priority support',
        'Brand kit & custom fonts',
        'Schedule & auto-publish',
        'Remove watermarks',
      ],
      cta: 'Start Pro Trial',
      popular: true,
    },
    {
      name: 'Business',
      monthlyPrice: 49,
      annualPrice: 39,
      description: 'For teams & agencies',
      features: [
        'Everything in Pro',
        'Unlimited storage',
        'Team collaboration (up to 25)',
        'Custom AI model training',
        'API access',
        'Dedicated account manager',
        'SSO & advanced security',
        'White-label exports',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  testimonials: Testimonial[] = [
    {
      quote:
        'GenZ Studio replaced 5 tools for me. The AI features are absolutely incredible and save me hours every single day.',
      name: 'Alex Rivera',
      role: 'YouTuber • 500K Subscribers',
      initials: 'AR',
      color: '#6C5CE7',
      stars: 5,
    },
    {
      quote:
        'The best design platform I have ever used. Period. Nothing else comes close to this level of quality and speed.',
      name: 'Sarah Chen',
      role: 'UI Designer • Freelance',
      initials: 'SC',
      color: '#00D2FF',
      stars: 5,
    },
    {
      quote:
        'Our team productivity increased 3x since switching. The collaboration features and AI tools are game-changing.',
      name: 'Marcus Johnson',
      role: 'Agency Owner • 12 Team Members',
      initials: 'MJ',
      color: '#FF6B9D',
      stars: 5,
    },
  ];

  faqItems: FaqItem[] = [
    {
      question: 'What is GenZ Studio?',
      answer:
        'GenZ Studio is an all-in-one AI-powered creative platform that combines design, video editing, content writing, and social media management into a single seamless experience built for modern creators.',
    },
    {
      question: 'How does the AI actually work?',
      answer:
        'We use a combination of proprietary models and fine-tuned state-of-the-art AI models (including diffusion models for images and large language models for text) that are specifically optimized for creative workflows and brand consistency.',
    },
    {
      question: 'Can I use AI-generated content commercially?',
      answer:
        'Yes! All content generated on Pro and Business plans comes with full commercial usage rights. You own everything you create on GenZ Studio — no licensing headaches.',
    },
    {
      question: 'What can I do on the Free plan?',
      answer:
        'The Free plan includes 5 AI generations per day, 1 GB of storage, access to basic templates, standard quality exports, and community support. It\'s the perfect way to experience GenZ Studio before upgrading.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer:
        'Absolutely. You can cancel your subscription at any time from your account settings. There are no long-term contracts or hidden fees. Your access continues until the end of your current billing period.',
    },
    {
      question: 'Do you offer team plans?',
      answer:
        'Yes! Our Business plan supports up to 25 team members with real-time collaboration, role-based permissions, shared brand kits, and a dedicated account manager. Need more seats? Contact us for enterprise pricing.',
    },
    {
      question: 'What file formats do you support?',
      answer:
        'We support PNG, JPG, SVG, PDF, WebP, GIF, MP4, MOV, WebM, and more. Pro and Business users can also export in custom dimensions and formats optimized for specific platforms.',
    },
    {
      question: 'Is there a mobile app?',
      answer:
        'Our mobile app for iOS and Android is currently in beta and available to Pro and Business subscribers. It includes core editing features, AI generation, and publishing — all optimized for on-the-go creativity.',
    },
  ];

  footerColumns = [
    {
      title: 'Product',
      links: ['Features', 'AI Tools', 'Templates', 'Pricing', 'Changelog', 'Integrations'],
    },
    {
      title: 'Resources',
      links: ['Documentation', 'Tutorials', 'Blog', 'Community', 'API Reference', 'Status'],
    },
    {
      title: 'Company',
      links: ['About', 'Careers', 'Press Kit', 'Contact', 'Partners'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Licenses'],
    },
  ];

  socialLinks = [
    { name: 'GitHub', letter: 'G' },
    { name: 'X', letter: 'X' },
    { name: 'YouTube', letter: 'Y' },
    { name: 'Discord', letter: 'D' },
    { name: 'LinkedIn', letter: 'L' },
  ];

  // ── Computed ───────────────────────────────────
  activeTool = computed(() => {
    return this.aiTools.find((t) => t.id === this.activeToolTab()) ?? this.aiTools[0];
  });

  // ── Lifecycle ──────────────────────────────────
  ngAfterViewInit(): void {
    this.setupScrollAnimations();
  }

  // ── Listeners ──────────────────────────────────
  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  // ── Methods ────────────────────────────────────
  setActiveToolTab(id: string): void {
    this.activeToolTab.set(id);
  }

  toggleFaq(index: number): void {
    this.faqOpenState.update((state) => {
      const newState = [...state];
      newState[index] = !newState[index];
      return newState;
    });
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.update((v) => !v);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  togglePricing(): void {
    this.isAnnual.update((v) => !v);
  }

  getPrice(plan: PricingPlan): number {
    return this.isAnnual() ? plan.annualPrice : plan.monthlyPrice;
  }

  getBillingPeriod(): string {
    return this.isAnnual() ? '/mo, billed annually' : '/month';
  }

  scrollToSection(sectionId: string): void {
    this.closeMobileNav();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  starsArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  private setupScrollAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = this.el.nativeElement.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el: Element) => observer.observe(el));
  }
}
