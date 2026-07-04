import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-thumbnail-maker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thumbnail-maker.html',
  styleUrl: './thumbnail-maker.scss'
})
export class ThumbnailMakerPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
