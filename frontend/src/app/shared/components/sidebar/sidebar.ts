import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() open = false;
  @Output() navigate = new EventEmitter<void>();

  protected readonly links = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'AI Tools', icon: 'auto_awesome', route: '/ai-tools' },
    { label: 'Image Editor', icon: 'image', route: '/image-editor' },
    { label: 'Video Studio', icon: 'movie', route: '/video-studio' },
    { label: 'Projects', icon: 'folder', route: '/projects' },
    { label: 'Subscription', icon: 'payments', route: '/subscription' },
    { label: 'Admin', icon: 'admin_panel_settings', route: '/admin' },
  ];
}
