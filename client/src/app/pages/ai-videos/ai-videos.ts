import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-ai-videos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-videos.html',
  styleUrl: './ai-videos.scss'
})
export class AiVideosPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
