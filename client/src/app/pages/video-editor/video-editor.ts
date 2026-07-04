import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-video-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-editor.html',
  styleUrl: './video-editor.scss'
})
export class VideoEditorPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
