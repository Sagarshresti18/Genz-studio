import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gz-content-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-calendar.html',
  styleUrl: './content-calendar.scss'
})
export class ContentCalendarPage {
  readonly items = [1, 2, 3, 4, 5, 6];
}
