import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme-service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  @Input({ required: true }) title = 'Genz Studio';
  @Input() isAuthenticated = false;
  @Output() menuToggled = new EventEmitter<void>();
  @Output() demoLoginClicked = new EventEmitter<void>();

  protected readonly themeService = inject(ThemeService);
}
