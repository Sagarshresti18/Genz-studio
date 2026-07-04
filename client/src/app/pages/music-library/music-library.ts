import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-music-library',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-library.html',
  styleUrl: './music-library.scss'
})
export class MusicLibraryPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
