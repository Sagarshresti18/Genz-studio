import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-ai-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-content.html',
  styleUrl: './ai-content.scss'
})
export class AiContentPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
