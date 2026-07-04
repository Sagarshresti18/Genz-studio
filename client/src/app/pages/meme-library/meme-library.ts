import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-meme-library',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meme-library.html',
  styleUrl: './meme-library.scss'
})
export class MemeLibraryPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
