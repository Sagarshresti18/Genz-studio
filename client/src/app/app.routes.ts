import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./layout/layout').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/projects/projects').then(m => m.ProjectsComponent)
      },
      {
        path: 'ai-tools',
        loadComponent: () => import('./pages/ai-tools/ai-tools').then(m => m.AIToolsComponent)
      },
      {
        path: 'templates',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      },
      {
        path: 'design-tools',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      },
      {
        path: 'brand-kit',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      },
      {
        path: 'media-library',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      },
      {
        path: 'creator-hub',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      },
      {
        path: 'marketplace',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      },
      {
        path: 'community',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'landing'
  }
];
