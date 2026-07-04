import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-logo-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-generator.html',
  styleUrl: './logo-generator.scss'
})
export class LogoGeneratorPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
