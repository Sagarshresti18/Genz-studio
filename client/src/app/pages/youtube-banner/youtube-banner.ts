import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-youtube-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './youtube-banner.html',
  styleUrl: './youtube-banner.scss'
})
export class YoutubeBannerPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
