import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MemeService, RedditMeme } from '../../services/meme.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'gz-meme-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meme-library.html',
  styleUrl: './meme-library.scss',
})
export class MemeLibraryPage implements OnInit {
  private memeService = inject(MemeService);
  private http = inject(HttpClient);

  readonly activeTab = signal<'explorer' | 'favorites'>('explorer');
  
  // Reddit Meme Library Signals
  readonly redditMemes = signal<RedditMeme[]>([]);
  readonly redditSubreddit = signal<string>('all');
  readonly loadingReddit = signal<boolean>(false);
  readonly errorReddit = signal<string | null>(null);
  readonly searchQueryReddit = signal<string>('');
  readonly favorites = signal<RedditMeme[]>([]);
  readonly activePreviewMeme = signal<RedditMeme | null>(null);

  // Constants
  readonly redditSubreddits = this.memeService.subreddits;

  readonly indianCelebrityTags = [
    'Salman Khan',
    'Akshay Kumar',
    'Shah Rukh Khan',
    'Narendra Modi',
    'Deepika Padukone',
    'Alia Bhatt',
    'Virat Kohli',
    'Bollywood',
    'Hera Pheri',
    'Baburao'
  ];

  // Computed Filters for Reddit Memes and Bookmarks
  readonly filteredRedditMemes = computed(() => {
    const sub = this.redditSubreddit();
    const memes = this.redditMemes();
    const q = this.searchQueryReddit().toLowerCase().trim();

    // For Giphy tabs or combined search, search/merge is already done server-side
    if (sub === 'gifs+reactiongifs+wholesomegifs' || sub === 'stickers' || (sub === 'all' && q)) {
      return memes;
    }

    if (!q) return memes;
    return memes.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.subreddit.toLowerCase().includes(q) || 
      m.author.toLowerCase().includes(q)
    );
  });

  readonly filteredFavorites = computed(() => {
    const q = this.searchQueryReddit().toLowerCase().trim();
    const memes = this.favorites();
    if (!q) return memes;
    return memes.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.subreddit.toLowerCase().includes(q) || 
      m.author.toLowerCase().includes(q)
    );
  });

  constructor() {}

  ngOnInit() {
    this.loadRedditMemes();
    this.loadBookmarks();
  }

  // ── Reddit Meme Explorer Methods ──────────────────────────
  loadRedditMemes(isLoadMore = false) {
    if (this.loadingReddit()) return;
    this.loadingReddit.set(true);
    this.errorReddit.set(null);

    const sub = this.redditSubreddit();
    const count = 20;
    const offset = isLoadMore ? this.redditMemes().length : 0;
    const query = this.searchQueryReddit().trim();

    let obs$;
    if (sub === 'gifs+reactiongifs+wholesomegifs') {
      obs$ = this.memeService.fetchGiphy('gifs', query || 'Indian', count, offset);
    } else if (sub === 'stickers') {
      obs$ = this.memeService.fetchGiphy('stickers', query || 'Indian', count, offset);
    } else if (sub === 'all' && query) {
      const gifs$ = this.memeService.fetchGiphy('gifs', query, 15, offset).pipe(catchError(() => of([])));
      const stickers$ = this.memeService.fetchGiphy('stickers', query, 15, offset).pipe(catchError(() => of([])));
      const reddit$ = this.memeService.fetchMemes('all', 15).pipe(catchError(() => of([])));
      
      obs$ = forkJoin([reddit$, gifs$, stickers$]).pipe(
        map(([redditMemes, gifs, stickers]) => {
          const q = query.toLowerCase();
          const filteredReddit = redditMemes.filter(m => 
            m.title.toLowerCase().includes(q) || 
            m.subreddit.toLowerCase().includes(q) || 
            m.author.toLowerCase().includes(q)
          );
          
          const merged: RedditMeme[] = [];
          const maxLen = Math.max(filteredReddit.length, gifs.length, stickers.length);
          for (let i = 0; i < maxLen; i++) {
            if (i < filteredReddit.length) merged.push(filteredReddit[i]);
            if (i < gifs.length) merged.push(gifs[i]);
            if (i < stickers.length) merged.push(stickers[i]);
          }
          return merged;
        })
      );
    } else {
      obs$ = this.memeService.fetchMemes(sub, count);
    }

    obs$.subscribe({
      next: (newMemes) => {
        if (isLoadMore) {
          this.redditMemes.update(current => {
            const urls = new Set(current.map(m => m.url));
            const uniqueNew = newMemes.filter(m => !urls.has(m.url));
            return [...current, ...uniqueNew];
          });
        } else {
          this.redditMemes.set(newMemes);
        }
        this.loadingReddit.set(false);
      },
      error: (err) => {
        this.errorReddit.set(err.message || 'Failed to load content.');
        this.loadingReddit.set(false);
      }
    });
  }

  loadMoreMemes() {
    this.loadRedditMemes(true);
  }

  onSubredditChange(sub: string) {
    this.redditSubreddit.set(sub);
    this.loadRedditMemes(false);
  }

  selectCelebrityTag(tag: string) {
    const currentSub = this.redditSubreddit();
    if (currentSub !== 'all' && currentSub !== 'gifs+reactiongifs+wholesomegifs' && currentSub !== 'stickers') {
      this.redditSubreddit.set('gifs+reactiongifs+wholesomegifs');
    }
    this.searchQueryReddit.set(tag);
    this.loadRedditMemes(false);
  }

  loadBookmarks() {
    this.favorites.set(this.memeService.getBookmarks());
  }

  isBookmarked(meme: RedditMeme): boolean {
    return this.favorites().some(b => b.url === meme.url);
  }

  toggleBookmark(meme: RedditMeme, event?: Event) {
    if (event) event.stopPropagation();
    const updated = this.memeService.toggleBookmark(meme);
    this.favorites.set(updated);
  }

  copyImageUrl(url: string, event?: Event) {
    if (event) event.stopPropagation();
    navigator.clipboard.writeText(url).then(
      () => {},
      (err) => console.error('Failed to copy image URL', err)
    );
  }

  shareMeme(meme: RedditMeme, event?: Event) {
    if (event) event.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: meme.title,
        text: `Check out this meme from r/${meme.subreddit} by u/${meme.author}!`,
        url: meme.url
      }).catch(() => {
        this.copyImageUrl(meme.url);
      });
    } else {
      this.copyImageUrl(meme.url);
    }
  }

  downloadMemeFile(meme: RedditMeme, event?: Event) {
    if (event) event.stopPropagation();

    // Use backend proxy to request the image to bypass client CORS restrictions
    const backendOrigin = `${location.protocol}//${location.hostname}:8080`;
    const proxiedUrl = `${backendOrigin}/api/memes/proxy?u=${encodeURIComponent(meme.url)}`;

    this.http.get(proxiedUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = meme.url.split('.').pop()?.split('?')[0] || 'jpg';
        a.download = `meme-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        // Direct download fallback
        const a = document.createElement('a');
        a.href = meme.url;
        a.target = '_blank';
        const ext = meme.url.split('.').pop()?.split('?')[0] || 'jpg';
        a.download = `meme-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  }

  openPreview(meme: RedditMeme, event?: Event) {
    if (event) event.stopPropagation();
    this.activePreviewMeme.set(meme);
  }

  closePreview() {
    this.activePreviewMeme.set(null);
  }

  switchTab(tab: 'explorer' | 'favorites') {
    this.activeTab.set(tab);
    if (tab === 'favorites') this.loadBookmarks();
  }

  onScroll(event: Event) {
    const el = event.target as HTMLElement;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 150) {
      this.loadMoreMemes();
    }
  }
}
