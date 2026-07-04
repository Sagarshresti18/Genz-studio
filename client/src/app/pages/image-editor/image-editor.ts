import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-image-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-editor.html',
  styleUrl: './image-editor.scss'
})
export class ImageEditorPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
