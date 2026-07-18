import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

const BASE = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers(): HttpHeaders {
    const headers: Record<string,string> = { Authorization: `Bearer ${this.auth.getToken() ?? ''}` };
    return new HttpHeaders(headers);
  }

  // ── AI Content ──────────────────────────────────────────────
  getContentMetadata(): Observable<any> {
    return this.http.get(`${BASE}/content/metadata`, { headers: this.headers() });
  }

  getContentHistory(type?: string, search?: string): Observable<any> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (search) params = params.set('search', search);
    return this.http.get(`${BASE}/content`, { headers: this.headers(), params });
  }

  deleteContent(id: string): Observable<any> {
    return this.http.delete(`${BASE}/content/${id}`, { headers: this.headers() });
  }

  // ── Meme Library ────────────────────────────────────────────
  getMemeTemplates(params: { category?: string; search?: string; page?: number } = {}): Observable<any> {
    let p = new HttpParams();
    if (params.category && params.category !== 'all') p = p.set('category', params.category);
    if (params.search) p = p.set('search', params.search);
    if (params.page) p = p.set('page', params.page.toString());
    return this.http.get(`${BASE}/memes/templates`, { headers: this.headers(), params: p });
  }

  getMyMemes(): Observable<any> {
    return this.http.get(`${BASE}/memes/mine`, { headers: this.headers() });
  }

  remixMeme(body: { templateId: string; topText: string; bottomText: string; boxes?: any[] }): Observable<any> {
    return this.http.post(`${BASE}/memes/remix`, body, { headers: this.headers() });
  }

  generateAiCaption(body: { templateName: string; context?: string; tone?: string }): Observable<any> {
    return this.http.post(`${BASE}/memes/ai-caption`, body, { headers: this.headers() });
  }

  generateAiBackground(body: { prompt: string; style?: string }): Observable<any> {
    return this.http.post(`${BASE}/memes/ai-background`, body, { headers: this.headers() });
  }

  deleteMeme(id: string): Observable<any> {
    return this.http.delete(`${BASE}/memes/${id}`, { headers: this.headers() });
  }
}
