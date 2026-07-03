import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Project {
  id: string;
  name: string;
  timestamp: string;
  status: 'Active' | 'Draft' | 'Published';
  gradient: string;
}

@Component({
  selector: 'gz-projects',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class ProjectsComponent {
  protected readonly projects = signal<Project[]>([
    { id: '1', name: 'Summer YouTube Banner', timestamp: 'Edited 2h ago', status: 'Active', gradient: 'linear-gradient(135deg, #6C5CE7 0%, #00D2FF 100%)' },
    { id: '2', name: 'Logo Concept Final', timestamp: 'Edited 4h ago', status: 'Draft', gradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFB300 100%)' },
    { id: '3', name: 'Product Thumbnail V2', timestamp: 'Edited 1d ago', status: 'Published', gradient: 'linear-gradient(135deg, #00E676 0%, #00D2FF 100%)' },
    { id: '4', name: 'Instagram Story Template', timestamp: 'Edited 3d ago', status: 'Active', gradient: 'linear-gradient(135deg, #6C5CE7 0%, #FF6B9D 100%)' },
    { id: '5', name: 'LinkedIn Banner v1', timestamp: 'Edited 5d ago', status: 'Draft', gradient: 'linear-gradient(135deg, #FFB300 0%, #FF5252 100%)' },
    { id: '6', name: 'Podcast Cover Art', timestamp: 'Edited 1w ago', status: 'Published', gradient: 'linear-gradient(135deg, #00E676 0%, #6C5CE7 100%)' }
  ]);
}
