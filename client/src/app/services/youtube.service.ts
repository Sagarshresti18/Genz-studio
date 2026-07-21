import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface YouTubeTrack {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

export interface YouTubeSearchResponse {
  nextPageToken: string;
  items: YouTubeTrack[];
}

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  private http = inject(HttpClient);
<<<<<<< HEAD
  // Using the absolute URL since we need to hit the Express backend API
  private baseUrl = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : 'https://genz-studio-api.onrender.com/api';
=======
  // Using Render backend for production, localhost for development
  private baseUrl = isDevMode() ? 'http://localhost:5000/api' : 'https://genz-studio-api.onrender.com/api';
>>>>>>> dfa8be4d25efaf6128e472c19a9114efede8c8a6

  searchTracks(query: string, pageToken: string = ''): Observable<YouTubeSearchResponse> {
    let url = `${this.baseUrl}/music/youtube/search?q=${encodeURIComponent(query)}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }
    // We pass withCredentials if authenticate middleware requires a cookie/token, 
    // or just let the interceptor handle it
    return this.http.get<YouTubeSearchResponse>(url);
  }
}
