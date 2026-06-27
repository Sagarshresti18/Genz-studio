import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard-module').then((m) => m.DashboardModule),
  },
  {
    path: 'ai-tools',
    canActivate: [authGuard],
    loadChildren: () => import('./features/ai-tools/ai-tools-module').then((m) => m.AiToolsModule),
  },
  {
    path: 'image-editor',
    canActivate: [authGuard],
    loadChildren: () => import('./features/image-editor/image-editor-module').then((m) => m.ImageEditorModule),
  },
  {
    path: 'video-studio',
    canActivate: [authGuard],
    loadChildren: () => import('./features/video-studio/video-studio-module').then((m) => m.VideoStudioModule),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadChildren: () => import('./features/projects/projects-module').then((m) => m.ProjectsModule),
  },
  {
    path: 'subscription',
    canActivate: [authGuard],
    loadChildren: () => import('./features/subscription/subscription-module').then((m) => m.SubscriptionModule),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadChildren: () => import('./features/admin/admin-module').then((m) => m.AdminModule),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
