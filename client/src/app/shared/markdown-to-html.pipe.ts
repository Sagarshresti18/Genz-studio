import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'markdownToHtml', standalone: true, pure: false })
export class MarkdownToHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    let html = value
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:12px 0 4px;color:#0f172a">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:700;margin:14px 0 6px;color:#0f172a">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-size:17px;font-weight:800;margin:16px 0 8px;color:#0f172a">$1</h1>')
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0"/>')
      .replace(/\n/g, '<br/>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
