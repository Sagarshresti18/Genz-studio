import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AttachedFile {
  id: string;
  file: File;
  type: string;
  preview: string | null;
  uploadStatus: string;
  content?: string;
}

export interface PastedContent {
  id: string;
  content: string;
  timestamp: Date;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

@Component({
  selector: 'app-claude-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './claude-chat-input.html',
  styleUrls: []
})
export class ClaudeChatInput {
  @Output() sendMessage = new EventEmitter<{
    message: string;
    files: AttachedFile[];
    pastedContent: PastedContent[];
    model: string;
    isThinkingEnabled: boolean;
  }>();

  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;

  message = '';
  files: AttachedFile[] = [];
  pastedContent: PastedContent[] = [];
  isDragging = false;
  selectedModel = 'sonnet-4.5';
  isThinkingEnabled = false;
  isModelDropdownOpen = false;

  models: Model[] = [
    { id: 'opus-4.5', name: 'Opus 4.5', description: 'Most capable for complex work' },
    { id: 'sonnet-4.5', name: 'Sonnet 4.5', description: 'Best for everyday tasks' },
    { id: 'haiku-4.5', name: 'Haiku 4.5', description: 'Fastest for quick answers' }
  ];

  get currentModel() {
    return this.models.find(m => m.id === this.selectedModel) || this.models[0];
  }

  get hasContent() {
    return this.message.trim().length > 0 || this.files.length > 0 || this.pastedContent.length > 0;
  }

  onMessageChange() {
    this.adjustTextareaHeight();
  }

  adjustTextareaHeight() {
    const textarea = this.textareaRef?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 384) + 'px';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  handleFiles(newFilesList: FileList | File[]) {
    const newFiles = Array.from(newFilesList).map(file => {
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: isImage ? 'image/unknown' : (file.type || 'application/octet-stream'),
        preview: isImage ? URL.createObjectURL(file) : null,
        uploadStatus: 'pending'
      };
    });

    this.files = [...this.files, ...newFiles];

    if (!this.message) {
      if (newFiles.length === 1) {
        const f = newFiles[0];
        this.message = f.type.startsWith('image/') ? "Analyzed image..." : "Analyzed document...";
      } else {
        this.message = `Analyzed ${newFiles.length} files...`;
      }
    }

    newFiles.forEach(f => {
      setTimeout(() => {
        this.files = this.files.map(p => p.id === f.id ? { ...p, uploadStatus: 'complete' } : p);
      }, 800 + Math.random() * 1000);
    });
    this.adjustTextareaHeight();
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    if (e.dataTransfer?.files) {
      this.handleFiles(e.dataTransfer.files);
    }
  }

  handlePaste(e: ClipboardEvent) {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) pastedFiles.push(file);
      }
    }

    if (pastedFiles.length > 0) {
      e.preventDefault();
      this.handleFiles(pastedFiles);
      return;
    }

    const text = e.clipboardData.getData('text');
    if (text.length > 300) {
      e.preventDefault();
      const snippet = {
        id: Math.random().toString(36).substr(2, 9),
        content: text,
        timestamp: new Date()
      };
      this.pastedContent = [...this.pastedContent, snippet];

      if (!this.message) {
        this.message = "Analyzed pasted text...";
      }
      this.adjustTextareaHeight();
    }
  }

  handleSend() {
    if (!this.hasContent) return;
    this.sendMessage.emit({
      message: this.message,
      files: this.files,
      pastedContent: this.pastedContent,
      model: this.selectedModel,
      isThinkingEnabled: this.isThinkingEnabled
    });
    this.message = '';
    this.files = [];
    this.pastedContent = [];
    if (this.textareaRef) {
      this.textareaRef.nativeElement.style.height = 'auto';
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSend();
    }
  }

  triggerFileInput() {
    this.fileInputRef?.nativeElement.click();
  }

  onFileSelected(e: any) {
    if (e.target.files) {
      this.handleFiles(e.target.files);
    }
    e.target.value = '';
  }

  removeFile(id: string) {
    this.files = this.files.filter(f => f.id !== id);
  }

  removePastedContent(id: string) {
    this.pastedContent = this.pastedContent.filter(c => c.id !== id);
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isModelDropdownOpen = !this.isModelDropdownOpen;
  }

  selectModel(id: string) {
    this.selectedModel = id;
    this.isModelDropdownOpen = false;
  }
}
