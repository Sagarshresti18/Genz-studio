import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';

export interface RedditMeme {
  postLink: string;
  subreddit: string;
  title: string;
  url: string;
  nsfw: boolean;
  spoiler: boolean;
  author: string;
  ups: number;
  preview: string[];
}

export interface MemeApiResponse {
  count: number;
  memes: RedditMeme[];
}

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private http = inject(HttpClient);
  private baseUrl = 'https://meme-api.com/gimme';

  // Subreddits supported
  readonly subreddits = [
    { key: 'all', label: 'All Memes' },
    { key: 'gifs+reactiongifs+wholesomegifs', label: 'GIFs (Animated)' },
    { key: 'stickers', label: 'Stickers' },
    { key: 'memes+dankmemes+wholesomememes', label: 'General Memes' },
    { key: 'ProgrammerHumor', label: 'Programming' },
    { key: 'animememes', label: 'Anime' }
  ];

  fetchMemes(subreddit?: string, count: number = 20): Observable<RedditMeme[]> {
    let url = this.baseUrl;
    if (subreddit && subreddit !== 'all') {
      url = `${this.baseUrl}/${subreddit}/${count}`;
    } else {
      url = `${this.baseUrl}/${count}`;
    }

    return this.http.get<MemeApiResponse>(url).pipe(
      retry(2),
      map(response => {
        // filter out NSFW and spoiler memes
        const filtered = (response.memes || []).filter(m => !m.nsfw && !m.spoiler);
        return filtered;
      }),
      catchError(error => {
        console.error('Error fetching memes:', error);
        return throwError(() => new Error('Failed to load memes from Reddit. Please try again.'));
      })
    );
  }

  fetchGiphy(type: 'gifs' | 'stickers', query?: string, count: number = 20, offset: number = 0): Observable<RedditMeme[]> {
    const baseUrl = 'http://localhost:8080/api/memes/giphy';
    let url = query 
      ? `${baseUrl}/search?q=${encodeURIComponent(query)}&limit=${count}&offset=${offset}&type=${type}`
      : `${baseUrl}/trending?limit=${count}&offset=${offset}&type=${type}`;

    return this.http.get<{ success: boolean; memes: RedditMeme[] }>(url).pipe(
      retry(1),
      map(response => response.memes || []),
      catchError(error => {
        console.error('Error fetching Giphy:', error);
        return throwError(() => new Error('Failed to load GIFs from Giphy. Please try again.'));
      })
    );
  }

  getBookmarks(): RedditMeme[] {
    try {
      const data = localStorage.getItem('bookmarked_memes');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading bookmarks from localStorage', e);
      return [];
    }
  }

  saveBookmarks(bookmarks: RedditMeme[]): void {
    try {
      localStorage.setItem('bookmarked_memes', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Error saving bookmarks to localStorage', e);
    }
  }

  isBookmarked(meme: RedditMeme): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.url === meme.url);
  }

  toggleBookmark(meme: RedditMeme): RedditMeme[] {
    let bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(b => b.url === meme.url);
    if (index > -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(meme);
    }
    this.saveBookmarks(bookmarks);
    return bookmarks;
  }
}
