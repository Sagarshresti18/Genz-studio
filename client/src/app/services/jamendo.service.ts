import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  audio: string;
  audiodownload: string;
}

@Injectable({
  providedIn: 'root'
})
export class JamendoService {
  private http = inject(HttpClient);
  private clientId = '3ee722bc'; // Jamendo API key
  private baseUrl = 'https://api.jamendo.com/v3.0/tracks/';

  getTracks(limit: number = 100, searchQuery: string = ''): Observable<JamendoTrack[]> {
    let url = `${this.baseUrl}?client_id=${this.clientId}&format=jsonpretty&limit=${limit}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    return this.http.get<any>(url).pipe(
      map(response => response.results || [])
    );
  }
}
