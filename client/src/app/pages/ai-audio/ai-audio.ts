import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-ai-audio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-audio.html',
  styleUrl: './ai-audio.scss'
})
export class AiAudioPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
