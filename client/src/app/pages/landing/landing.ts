import { Component, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingPage {
  protected scrolled = signal(false);
  protected mobileOpen = signal(false);

  protected readonly tools = [
    { icon: '◈', label: 'Logo Generator', color: '#8B5CF6', desc: 'AI-crafted logos in seconds' },
    { icon: '▶', label: 'YouTube Banner', color: '#EF4444', desc: 'Channel art that converts' },
    { icon: '▣', label: 'Thumbnail Maker', color: '#F97316', desc: 'Stop-the-scroll thumbnails' },
    { icon: '✦', label: 'Image Editor', color: '#06B6D4', desc: 'Pro edits, zero learning curve' },
    { icon: '⬡', label: 'Video Editor', color: '#F59E0B', desc: 'Timeline editing for creators' },
    { icon: '◉', label: 'AI Videos', color: '#EC4899', desc: 'Text-to-video generation' },
    { icon: '♪', label: 'AI Audio', color: '#8B5CF6', desc: 'Voiceovers & sound effects' },
    { icon: '♫', label: 'Music Library', color: '#14B8A6', desc: '100k+ royalty-free tracks' },
    { icon: '✧', label: 'AI Content', color: '#10B981', desc: 'Scripts, hooks & captions' },
    { icon: '◫', label: 'Content Calendar', color: '#6366F1', desc: 'Plan & auto-publish' },
    { icon: '😂', label: 'Meme Library', color: '#FBBF24', desc: 'Trending meme templates' },
  ];

  protected readonly testimonials = [
    { name: 'Priya S.', handle: '@priyacreates', text: 'My thumbnail CTR went from 3% to 11% in two weeks. GenZ Studio is insane.', avatar: 'P', color: '#7C3AED' },
    { name: 'Marcus T.', handle: '@marcustech', text: 'I replaced 4 different tools with this one. The AI content writer alone is worth it.', avatar: 'M', color: '#EF4444' },
    { name: 'Aisha K.', handle: '@aishavibes', text: 'The music library + AI audio combo is a game changer for my reels.', avatar: 'A', color: '#10B981' },
  ];

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 40); }
}
