import { Component, OnInit, inject, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { YouTubeService } from '../../services/youtube.service';
import { JamendoService } from '../../services/jamendo.service';

declare var YT: any;

export interface UnifiedTrack {
  id: string; // videoId or jamendo id
  title: string;
  artist: string;
  thumbnail: string;
  type: 'youtube' | 'jamendo';
  audioUrl?: string; // only for jamendo
  downloadUrl?: string; // only for jamendo
}

@Component({
  selector: 'gz-music-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music-library.html',
  styleUrl: './music-library.scss'
})
export class MusicLibraryPage implements OnInit, OnDestroy, AfterViewInit {
  private ytService = inject(YouTubeService);
  private jamendoService = inject(JamendoService);
  private ngZone = inject(NgZone);
  
  tracks: UnifiedTrack[] = [];
  loading = true;
  loadingMore = false;
  errorMsg = '';
  
  searchQuery = 'songs';
  nextPageToken = ''; // for youtube pagination
  
  viewMode: 'grid' | 'list' = 'grid';
  
  currentlyPlayingId: string | null = null;
  currentTrack: UnifiedTrack | null = null;
  
  showToast = false;
  toastMessage = '';
  
  // Dual Playback Engines
  private ytPlayer: any = null;
  isYtPlayerReady = false;
  private jamendoAudio: HTMLAudioElement | null = null;

  // Global Player state
  currentTime = 0;
  duration = 0;
  volume = 100;
  private progressInterval: any;

  ngOnInit() {
    this.fetchTracks();
  }
  
  ngAfterViewInit() {
    if (!(window as any)['YT']) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      (window as any)['onYouTubeIframeAPIReady'] = () => {
        this.initYtPlayer();
      };
    } else {
      this.initYtPlayer();
    }
  }

  ngOnDestroy() {
    this.stopProgressBar();
    if (this.ytPlayer) this.ytPlayer.destroy();
    if (this.jamendoAudio) this.stopJamendoAudio();
  }
  
  initYtPlayer() {
    this.ytPlayer = new YT.Player('youtube-player', {
      height: '135',
      width: '240',
      playerVars: {
        'playsinline': 1,
        'controls': 0,
        'disablekb': 1,
        'fs': 0,
        'rel': 0
      },
      events: {
        'onReady': (event: any) => {
          this.ngZone.run(() => {
            this.isYtPlayerReady = true;
            this.ytPlayer.setVolume(this.volume);
          });
        },
        'onStateChange': (event: any) => {
          this.ngZone.run(() => this.onYtPlayerStateChange(event));
        }
      }
    });
  }
  
  onYtPlayerStateChange(event: any) {
    if (event.data === YT.PlayerState.PLAYING) {
      this.currentlyPlayingId = this.currentTrack?.id || null;
      this.duration = this.ytPlayer.getDuration();
      this.startProgressBar();
    } else if (event.data === YT.PlayerState.PAUSED) {
      this.currentlyPlayingId = null;
      this.stopProgressBar();
    } else if (event.data === YT.PlayerState.ENDED) {
      this.currentlyPlayingId = null;
      this.stopProgressBar();
      this.nextTrack();
    }
  }

  startProgressBar() {
    this.stopProgressBar();
    this.ngZone.runOutsideAngular(() => {
      this.progressInterval = setInterval(() => {
        if (this.currentTrack?.type === 'youtube' && this.ytPlayer && this.ytPlayer.getCurrentTime) {
          this.ngZone.run(() => {
            this.currentTime = this.ytPlayer.getCurrentTime();
          });
        } else if (this.currentTrack?.type === 'jamendo' && this.jamendoAudio) {
          // Handled by timeupdate listener on Audio
        }
      }, 1000);
    });
  }
  
  stopProgressBar() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  fetchTracks(isLoadMore = false) {
    if (!isLoadMore) {
      this.tracks = [];
      this.nextPageToken = '';
      this.loading = true;
    } else {
      this.loadingMore = true;
    }
    
    this.errorMsg = '';
    
    let actualQuery = this.searchQuery.trim();
    const lowerQuery = actualQuery.toLowerCase();
    if (actualQuery && !lowerQuery.includes('song') && !lowerQuery.includes('music')) {
      actualQuery += ' songs';
    }
    
    // First fetch YouTube, then fetch Jamendo
    this.ytService.searchTracks(actualQuery, this.nextPageToken).subscribe({
      next: (res) => {
        const ytTracks: UnifiedTrack[] = res.items.map(item => ({
          id: item.videoId,
          title: item.title,
          artist: item.channelTitle,
          thumbnail: item.thumbnail,
          type: 'youtube'
        }));
        
        if (isLoadMore) {
          this.tracks = [...this.tracks, ...ytTracks];
        } else {
          this.tracks = ytTracks;
        }
        
        this.nextPageToken = res.nextPageToken;
        
        // If it's a fresh search, also fetch Jamendo tracks
        if (!isLoadMore) {
          this.jamendoService.getTracks(30, actualQuery).subscribe({
            next: (jTracks) => {
              const jamendoUnified: UnifiedTrack[] = jTracks.map(t => ({
                id: t.id,
                title: t.name,
                artist: t.artist_name,
                thumbnail: t.album_image,
                type: 'jamendo',
                audioUrl: t.audio,
                downloadUrl: t.audiodownload
              }));
              // Append Jamendo tracks
              this.tracks = [...this.tracks, ...jamendoUnified];
              this.loading = false;
            },
            error: (err) => {
              console.error('Jamendo error:', err);
              this.loading = false;
            }
          });
        } else {
          this.loadingMore = false;
        }
      },
      error: (err) => {
        console.error('Error fetching YouTube tracks:', err);
        this.errorMsg = err.error?.error || 'Failed to load tracks from YouTube';
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  searchTracks() {
    if (this.searchQuery.trim()) {
      this.fetchTracks(false);
    }
  }
  
  loadMore() {
    if (this.nextPageToken) {
      this.fetchTracks(true);
    }
  }

  togglePlay(track: UnifiedTrack) {
    if (this.currentTrack?.id === track.id) {
      this.toggleGlobalPlay();
    } else {
      this.playAudio(track);
    }
  }
  
  toggleGlobalPlay() {
    if (!this.currentTrack) return;
    
    if (this.currentTrack.type === 'youtube') {
      if (!this.isYtPlayerReady) return;
      const state = this.ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        this.ytPlayer.pauseVideo();
      } else {
        this.ytPlayer.playVideo();
      }
    } else if (this.currentTrack.type === 'jamendo' && this.jamendoAudio) {
      if (this.jamendoAudio.paused) {
        this.jamendoAudio.play();
        this.currentlyPlayingId = this.currentTrack.id;
      } else {
        this.jamendoAudio.pause();
        this.currentlyPlayingId = null;
      }
    }
  }

  playAudio(track: UnifiedTrack) {
    // Pause both engines first
    if (this.isYtPlayerReady && this.ytPlayer) {
      this.ytPlayer.pauseVideo();
    }
    this.stopJamendoAudio();
    
    this.currentTrack = track;
    
    if (track.type === 'youtube') {
      if (!this.isYtPlayerReady) return;
      this.ytPlayer.loadVideoById(track.id);
    } else if (track.type === 'jamendo' && track.audioUrl) {
      this.currentlyPlayingId = track.id;
      this.jamendoAudio = new Audio(track.audioUrl);
      this.jamendoAudio.volume = this.volume / 100;
      
      this.jamendoAudio.addEventListener('timeupdate', () => {
        this.currentTime = this.jamendoAudio?.currentTime || 0;
      });
      
      this.jamendoAudio.addEventListener('loadedmetadata', () => {
        this.duration = this.jamendoAudio?.duration || 0;
      });
      
      this.jamendoAudio.addEventListener('ended', () => {
        this.nextTrack();
      });

      this.jamendoAudio.play();
    }
  }
  
  stopJamendoAudio() {
    if (this.jamendoAudio) {
      this.jamendoAudio.pause();
      this.jamendoAudio.src = '';
      this.jamendoAudio = null;
    }
  }
  
  nextTrack() {
    if (!this.currentTrack || this.tracks.length === 0) return;
    const currentIndex = this.tracks.findIndex(t => t.id === this.currentTrack!.id);
    const nextIndex = (currentIndex + 1) % this.tracks.length;
    this.playAudio(this.tracks[nextIndex]);
  }
  
  prevTrack() {
    if (!this.currentTrack || this.tracks.length === 0) return;
    
    if (this.currentTime > 3) {
      if (this.currentTrack.type === 'youtube' && this.isYtPlayerReady) {
        this.ytPlayer.seekTo(0, true);
      } else if (this.currentTrack.type === 'jamendo' && this.jamendoAudio) {
        this.jamendoAudio.currentTime = 0;
      }
      return;
    }
    
    const currentIndex = this.tracks.findIndex(t => t.id === this.currentTrack!.id);
    const prevIndex = currentIndex === 0 ? this.tracks.length - 1 : currentIndex - 1;
    this.playAudio(this.tracks[prevIndex]);
  }
  
  onSeek(event: any) {
    const value = event.target.value;
    if (this.currentTrack?.type === 'youtube' && this.isYtPlayerReady) {
      this.ytPlayer.seekTo(value, true);
      this.currentTime = value;
    } else if (this.currentTrack?.type === 'jamendo' && this.jamendoAudio) {
      this.jamendoAudio.currentTime = value;
      this.currentTime = value;
    }
  }
  
  onVolumeChange(event: any) {
    const value = event.target.value;
    this.volume = value;
    if (this.isYtPlayerReady && this.ytPlayer) {
      this.ytPlayer.setVolume(value);
    }
    if (this.jamendoAudio) {
      this.jamendoAudio.volume = value / 100;
    }
  }
  
  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  downloadTrack(track: UnifiedTrack, event: Event) {
    event.stopPropagation(); // prevent play toggle
    if (track.type === 'jamendo' && track.downloadUrl) {
      const a = document.createElement('a');
      a.href = track.downloadUrl;
      a.target = '_blank'; 
      a.download = `${track.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  openInYouTube(track: UnifiedTrack, event: Event) {
    event.stopPropagation();
    if (track.type === 'youtube') {
      const url = `https://www.youtube.com/watch?v=${track.id}`;
      const newWin = window.open(url, '_blank', 'noopener,noreferrer');
      if (newWin) newWin.opener = null;
    }
  }

  copyYouTubeLink(track: UnifiedTrack, event: Event) {
    event.stopPropagation();
    if (track.type === 'youtube') {
      const url = `https://www.youtube.com/watch?v=${track.id}`;
      navigator.clipboard.writeText(url).then(() => {
        this.showToastMessage('YouTube link copied!');
      }).catch(err => console.error('Failed to copy', err));
    }
  }

  showToastMessage(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
