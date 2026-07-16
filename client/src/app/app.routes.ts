import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then(m => m.LandingPage)
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginPage)
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterPage)
  },
  {
    path: 'workspace',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then(m => m.WorkspaceLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardPage)
      },
      // ── Design Tools ──────────────────────────────────────
      {
        path: 'logo-generator',
        loadComponent: () => import('./pages/logo-generator/logo-generator').then(m => m.LogoGeneratorPage)
      },
      {
        path: 'youtube-banner',
        loadComponent: () => import('./pages/youtube-banner/youtube-banner').then(m => m.YoutubeBannerPage)
      },
      {
        path: 'thumbnail-maker',
        loadComponent: () => import('./pages/thumbnail-maker/thumbnail-maker').then(m => m.ThumbnailMakerPage)
      },
      {
        path: 'image-editor',
        loadComponent: () => import('./pages/image-editor/image-editor').then(m => m.ImageEditorPage)
      },
      // ── Video & Audio ─────────────────────────────────────
      {
        path: 'video-editor',
        loadComponent: () => import('./pages/video-editor/video-editor').then(m => m.VideoEditorPage)
      },
      {
        path: 'ai-videos',
        loadComponent: () => import('./pages/ai-videos/ai-videos').then(m => m.AiVideosPage)
      },
      {
        path: 'ai-audio',
        loadComponent: () => import('./pages/ai-audio/ai-audio').then(m => m.AiAudioPage)
      },
      {
        path: 'music-library',
        loadComponent: () => import('./pages/music-library/music-library').then(m => m.MusicLibraryPage)
      },
      // ── AI & Content ──────────────────────────────────────
      {
        path: 'ai-content',
        loadComponent: () => import('./pages/ai-content/ai-content').then(m => m.AiContentPage)
      },
      {
        path: 'content-calendar',
        loadComponent: () => import('./pages/content-calendar/content-calendar').then(m => m.ContentCalendarPage)
      },
      {
        path: 'meme-library',
        loadComponent: () => import('./pages/meme-library/meme-library').then(m => m.MemeLibraryPage)
      },
    ]
  },
  {
    path: 'chatbox-demo',
    loadComponent: () => import('./pages/chatbox-demo/chatbox-demo').then(m => m.ChatboxDemo)
  },
  {
    path: 'hero-demo',
    loadComponent: () => import('./shared/components/ui/scroll-morph-hero/scroll-morph-hero').then(m => m.ScrollMorphHero)
  },
  { path: '**', redirectTo: '' }
];
