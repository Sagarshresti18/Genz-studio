import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'gz-image-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-editor.html',
  styleUrl: './image-editor.scss'
})
export class ImageEditorPage {
  @ViewChild('imageCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private imageElement = new Image();

  activeTool = 'select';
  zoomLevel = 100;
  imageLoaded = false;
  fileName = 'Untitled.png';

  // We only keep the active image layer for this basic functional version
  layers = [
    { id: 1, name: 'Background Image', visible: true, active: true, type: 'image' },
  ];

  adjustments = {
    brightness: 100, // percentage for CSS filter (100 is default)
    contrast: 100,
    saturation: 100,
  };

  tools = [
    { id: 'select', icon: 'M13.5 21l-3.5-9.5L1.5 8l21-6.5L13.5 21z', name: 'Select Tool' },
    { id: 'crop', icon: 'M6 6h12v12H6V6z M6 6l-3-3 M18 18l3 3 M6 18l-3 3 M18 6l3-3', name: 'Crop Tool' },
    { id: 'brush', icon: 'M21.17 3.25a2.83 2.83 0 0 0-4 0l-9.67 9.67a2.83 2.83 0 0 0-4 4v3.83h3.83a2.83 2.83 0 0 0 4-4l9.67-9.67a2.83 2.83 0 0 0 0-4z', name: 'Brush Tool' },
    { id: 'eraser', icon: 'M12 2l9 9-4.5 4.5L7.5 6.5 12 2z M2 22h20 M2 15.5l5.5-5.5 9 9-5.5 5.5H2v-9z', name: 'Eraser Tool' },
    { id: 'text', icon: 'M5 5v3 M19 5v3 M5 5h14 M12 5v14 M9 19h6', name: 'Text Tool' },
    { id: 'magic-wand', icon: 'M7 7l4-4 4 4 M11 3v10 M11 17h.01 M11 21h.01 M6 12h-4 M22 12h-4 M17 18l3 3 M4 6l3 3 M20 6l-3 3 M7 18l-3 3', name: 'Magic Wand' }
  ];

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageElement.src = e.target.result;
        this.imageElement.onload = () => {
          this.imageLoaded = true;
          this.initCanvas();
        };
      };
      reader.readAsDataURL(file);
    }
  }

  initCanvas() {
    if (!this.ctx || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    
    // Set canvas dimensions to match image
    canvas.width = this.imageElement.width;
    canvas.height = this.imageElement.height;
    
    this.applyFilters();
  }

  applyFilters() {
    if (!this.ctx || !this.imageLoaded) return;
    const canvas = this.canvasRef.nativeElement;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply filters
    this.ctx.filter = `brightness(${this.adjustments.brightness}%) contrast(${this.adjustments.contrast}%) saturate(${this.adjustments.saturation}%)`;
    
    // Draw image with filters
    this.ctx.drawImage(this.imageElement, 0, 0, canvas.width, canvas.height);
    
    // Reset filter
    this.ctx.filter = 'none';
  }

  exportImage() {
    if (!this.imageLoaded) return;
    const canvas = this.canvasRef.nativeElement;
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `edited_${this.fileName}`;
    link.href = dataUrl;
    link.click();
  }

  setTool(toolId: string) {
    this.activeTool = toolId;
  }

  toggleLayerVisibility(layer: any) {
    layer.visible = !layer.visible;
  }

  setActiveLayer(layer: any) {
    this.layers.forEach(l => l.active = false);
    layer.active = true;
  }

  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 10, 300);
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 10, 10);
  }
}

