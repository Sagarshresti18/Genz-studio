import { Injectable, inject } from '@angular/core';
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
  // Using the absolute URL since we need to hit the Express backend API
  private baseUrl = 'https://genz-studio-api.onrender.com/api';

  searchTracks(query: string, pageToken: string = ''): Observable<YouTubeSearchResponse> {
    let url = `${this.baseUrl}?q=${encodeURIComponent(query)}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }
    // We pass withCredentials if authenticate middleware requires a cookie/token, 
    // or just let the interceptor handle it
    return this.http.get<YouTubeSearchResponse>(url);
  }
}
