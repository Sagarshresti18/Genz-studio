import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

// ── Interfaces ──────────────────────────────────────────────────
interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  duration?: string;
  url: string;
  gradient: string;
  icon: string;
  rawDuration: number; // in seconds
}

interface TimelineClip {
  id: string;
  name: string;
  track: number; // 0: Video 1, 1: Video 2, 2: Audio, 3: Text
  startTime: number; // in seconds
  duration: number; // in seconds
  color: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  url?: string;
  scale?: number;
  rotation?: number;
  opacity?: number;
  speed?: number;
  volume?: number;
  filter?: string;
}

interface TextPreset {
  id: string;
  label: string;
  style: string;
  preview: string;
}

interface TransitionPreset {
  id: string;
  name: string;
  icon: string;
  gradient: string;
}

@Component({
  selector: 'gz-video-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-editor.html',
  styleUrl: './video-editor.scss'
})
export class VideoEditorPage implements OnInit, OnDestroy {

  // ── Panel State ────────────────────────────────────────────────
  readonly leftTab = signal<'media' | 'text' | 'audio' | 'transitions' | 'effects'>('media');
  readonly rightPanelOpen = signal(true);
  readonly selectedClipId = signal<string | null>('clip-1');

  // ── Playback State (Driven by Real Video Element) ──────────────
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly totalDuration = signal(30.0);
  readonly volume = signal(80);
  readonly isMuted = signal(false);
  readonly isLooping = signal(false);

  // ── Active Video URL Source ────────────────────────────────────
  readonly activeVideoUrl = signal('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');

  // ── Timeline State ─────────────────────────────────────────────
  readonly timelineZoom = signal(120); // pixels per 10 seconds (default 12px per second)
  readonly playheadPosition = signal(0); // percent of timeline duration

  // ── Project Metadata ───────────────────────────────────────────
  readonly projectName = signal('Summer Vlog Edit');
  readonly autoSaved = signal(true);
  readonly resolution = signal('1080p');
  readonly fps = signal(30);

  // ── Toolbar State ──────────────────────────────────────────────
  readonly activeTool = signal<'select' | 'trim' | 'split' | 'crop' | 'speed'>('select');
  readonly canUndo = signal(true);
  readonly canRedo = signal(false);
  readonly exportQuality = signal<'720p' | '1080p' | '4K'>('1080p');
  readonly showExportMenu = signal(false);

  // ── Export Rendering simulation state ──────────────────────────
  readonly isRendering = signal(false);
  readonly renderProgress = signal(0);

  // ── Selected Clip properties ───────────────────────────────────
  readonly selectedClip = computed(() => {
    const id = this.selectedClipId();
    return this.timelineClips().find(c => c.id === id) ?? null;
  });

  // Track specific overrides
  readonly clipOpacity = signal(100);
  readonly clipSpeed = signal(1.0);
  readonly clipVolume = signal(80);
  readonly clipRotation = signal(0);
  readonly clipScale = signal(100);
  readonly activeFilter = signal('none');

  // ── Formatted Time Displays ────────────────────────────────────
  readonly formattedCurrentTime = computed(() => this.formatTime(this.currentTime()));
  readonly formattedDuration = computed(() => this.formatTime(this.totalDuration()));

  // ── Mock Media Library ─────────────────────────────────────────
  readonly mediaItems = signal<MediaItem[]>([
    { id: 'm1', name: 'Escapes Action.mp4', type: 'video', duration: '0:15', rawDuration: 15, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', gradient: 'linear-gradient(135deg, #FF6B35, #F7C948)', icon: '🎬' },
    { id: 'm2', name: 'Blazes Fire.mp4', type: 'video', duration: '0:15', rawDuration: 15, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', gradient: 'linear-gradient(135deg, #667EEA, #764BA2)', icon: '🎬' },
    { id: 'm3', name: 'Big Buck Bunny.mp4', type: 'video', duration: '0:15', rawDuration: 15, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', gradient: 'linear-gradient(135deg, #11998E, #38EF7D)', icon: '🎬' },
  ]);

  // ── Mock Audio Library ─────────────────────────────────────────
  readonly audioItems = signal<MediaItem[]>([
    { id: 'a1', name: 'Chill Lofi Beat.mp3', type: 'audio', duration: '3:42', rawDuration: 222, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', gradient: 'linear-gradient(135deg, #7C3AED, #06B6D4)', icon: '🎵' },
    { id: 'a2', name: 'Upbeat Energy.mp3', type: 'audio', duration: '2:18', rawDuration: 138, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', icon: '🎵' },
  ]);

  // ── Text Presets ───────────────────────────────────────────────
  readonly textPresets = signal<TextPreset[]>([
    { id: 't1', label: 'Title Bold', style: 'font-size:1.4rem;font-weight:900;letter-spacing:-0.03em', preview: 'YOUR TITLE' },
    { id: 't2', label: 'Subtitle', style: 'font-size:0.95rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase', preview: 'Subtitle Text' },
    { id: 't3', label: 'Lower Third', style: 'font-size:0.85rem;font-weight:700;background:rgba(0,0,0,0.7);padding:6px 14px;border-radius:6px', preview: 'Speaker Name' },
  ]);

  // ── Transition Presets ─────────────────────────────────────────
  readonly transitionPresets = signal<TransitionPreset[]>([
    { id: 'tr1', name: 'Fade', icon: '◐', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
    { id: 'tr2', name: 'Slide Left', icon: '◀', gradient: 'linear-gradient(135deg, #0f3460, #533483)' },
    { id: 'tr3', name: 'Slide Right', icon: '▶', gradient: 'linear-gradient(135deg, #533483, #e94560)' },
  ]);

  // ── Effect Filters ─────────────────────────────────────────────
  readonly effectFilters = signal([
    { id: 'none', name: 'None', gradient: 'linear-gradient(135deg, #2d2d3a, #3d3d4a)' },
    { id: 'vintage', name: 'Vintage', gradient: 'linear-gradient(135deg, #C79081, #DFA579)' },
    { id: 'cool', name: 'Cool Tone', gradient: 'linear-gradient(135deg, #667EEA, #764BA2)' },
    { id: 'warm', name: 'Warm', gradient: 'linear-gradient(135deg, #F7971E, #FFD200)' },
    { id: 'bw', name: 'B&W', gradient: 'linear-gradient(135deg, #434343, #000000)' },
    { id: 'cinematic', name: 'Cinematic', gradient: 'linear-gradient(135deg, #0C0C1D, #1A237E)' },
  ]);

  // ── Timeline Tracks & Clips ────────────────────────────────────
  readonly trackLabels = signal(['Video 1', 'Video 2', 'Audio', 'Text']);
  readonly trackIcons = signal(['🎬', '🎬', '🎵', '✏️']);
  readonly trackMuted = signal([false, false, false, false]);
  readonly trackLocked = signal([false, false, false, false]);

  readonly timelineClips = signal<TimelineClip[]>([
    { 
      id: 'clip-1', 
      name: 'Escapes Action', 
      track: 0, 
      startTime: 0, 
      duration: 12, 
      color: '#FF6B35', 
      type: 'video', 
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      scale: 100, rotation: 0, opacity: 100, speed: 1.0, volume: 80, filter: 'none'
    },
    { 
      id: 'clip-2', 
      name: 'Blazes Fire', 
      track: 0, 
      startTime: 12, 
      duration: 8, 
      color: '#667EEA', 
      type: 'video', 
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      scale: 100, rotation: 0, opacity: 100, speed: 1.0, volume: 80, filter: 'none'
    },
    { 
      id: 'clip-3', 
      name: 'Big Buck Bunny', 
      track: 1, 
      startTime: 6, 
      duration: 14, 
      color: '#11998E', 
      type: 'video', 
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      scale: 100, rotation: 0, opacity: 100, speed: 1.0, volume: 80, filter: 'none'
    },
    { 
      id: 'clip-4', 
      name: 'Lofi Beat', 
      track: 2, 
      startTime: 0, 
      duration: 30, 
      color: '#7C3AED', 
      type: 'audio',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    { 
      id: 'clip-5', 
      name: 'Title Card', 
      track: 3, 
      startTime: 0, 
      duration: 5, 
      color: '#F59E0B', 
      type: 'text'
    },
  ]);

  readonly timeMarkers = signal(['0:00', '0:05', '0:10', '0:15', '0:20', '0:25', '0:30', '0:35', '0:40', '0:45', '0:50', '0:55', '1:00']);

  private playbackTimer: any = null;
  private dragStartSeconds = 0;
  private dragStartWidth = 0;
  private dragStartX = 0;
  private dragClip: TimelineClip | null = null;
  private dragType: 'move' | 'trim-left' | 'trim-right' = 'move';

  private get videoElement(): HTMLVideoElement | null {
    return document.querySelector('.real-video-source');
  }

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // Sync initial selected clip properties to inspector panel signals
    this.syncInspectorSignals();
    this.loadProjectsFromBackend();
  }

  loadProjectsFromBackend(): void {
    const token = this.auth.getToken();
    if (!token) return;

    window.fetch('http://localhost:8080/api/videos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(async res => {
      const data = await res.json();
      if (res.ok && data.success && data.videos && data.videos.length > 0) {
        const latestProject = data.videos[0];
        this.projectName.set(latestProject.name);
        if (latestProject.source_url) {
          this.activeVideoUrl.set(latestProject.source_url);
        }
      } else {
        this.createProjectOnBackend('Summer Vlog Edit', this.activeVideoUrl());
      }
    })
    .catch(err => {
      console.error('Failed to load video projects', err);
    });
  }

  createProjectOnBackend(name: string, sourceUrl: string): void {
    const token = this.auth.getToken();
    if (!token) return;

    window.fetch('http://localhost:8080/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, sourceUrl })
    })
    .then(async res => {
      const data = await res.json();
      if (res.ok && data.success) {
        this.projectName.set(data.video.name);
        this.autoSaved.set(true);
      }
    })
    .catch(err => {
      console.error('Failed to create video project', err);
    });
  }

  onProjectNameChange(name: string): void {
    this.projectName.set(name);
    this.createProjectOnBackend(name, this.activeVideoUrl());
  }

  ngOnDestroy(): void {
    this.stopPlaybackLoop();
  }

  // ── Sync Helper ────────────────────────────────────────────────
  private syncInspectorSignals(): void {
    const clip = this.selectedClip();
    if (clip) {
      this.clipScale.set(clip.scale ?? 100);
      this.clipRotation.set(clip.rotation ?? 0);
      this.clipOpacity.set(clip.opacity ?? 100);
      this.clipSpeed.set(clip.speed ?? 1.0);
      this.clipVolume.set(clip.volume ?? 80);
      this.activeFilter.set(clip.filter ?? 'none');
    }
  }

  // ── Panel Actions ──────────────────────────────────────────────
  setLeftTab(tab: 'media' | 'text' | 'audio' | 'transitions' | 'effects'): void {
    this.leftTab.set(tab);
  }

  toggleRightPanel(): void {
    this.rightPanelOpen.update(v => !v);
  }

  selectClip(id: string): void {
    this.selectedClipId.set(id);
    this.syncInspectorSignals();

    const clip = this.selectedClip();
    if (clip && clip.type === 'video' && clip.url) {
      this.activeVideoUrl.set(clip.url);
      setTimeout(() => {
        const el = this.videoElement;
        if (el) {
          el.load();
          el.currentTime = Math.max(0, this.currentTime() - clip.startTime);
          if (this.isPlaying()) el.play().catch(() => {});
        }
      });
    }
  }

  selectMediaItem(item: MediaItem): void {
    if (item.type === 'video') {
      this.activeVideoUrl.set(item.url);
      setTimeout(() => {
        const el = this.videoElement;
        if (el) {
          el.load();
          if (this.isPlaying()) el.play().catch(() => {});
        }
      });
    }
  }

  // ── Video Element Event Interceptors ───────────────────────────
  onTimeUpdate(event: Event): void {
    // Only update duration progress when playing natively
    if (this.isPlaying()) {
      const el = event.target as HTMLVideoElement;
      if (el) {
        // Compute relative time of currently playing clip to show playhead
        const active = this.findActiveVideoClip(this.currentTime());
        if (active) {
          // Playhead updates are driven by playback interval to sync tracks
        }
      }
    }
  }

  onLoadedMetadata(event: Event): void {
    // We handle custom tracking of time
  }

  onVideoEnded(): void {
    // Check if next clip exists
  }

  // ── Playback Controls & Coordination ──────────────────────────
  togglePlayback(): void {
    if (this.isPlaying()) {
      this.pausePlayback();
    } else {
      this.startPlayback();
    }
  }

  private startPlayback(): void {
    this.isPlaying.set(true);
    const frameRate = 1000 / 30; // 30fps

    this.playbackTimer = setInterval(() => {
      let t = this.currentTime() + (frameRate / 1000) * this.clipSpeed();
      
      if (t >= this.totalDuration()) {
        if (this.isLooping()) {
          t = 0;
        } else {
          this.pausePlayback();
          return;
        }
      }

      this.currentTime.set(t);
      this.playheadPosition.set((t / this.totalDuration()) * 100);

      // Coordinate active video clip
      this.coordinateVideoFrame(t);
    }, frameRate);
  }

  private pausePlayback(): void {
    this.isPlaying.set(false);
    this.stopPlaybackLoop();
    const el = this.videoElement;
    if (el) el.pause();
  }

  private stopPlaybackLoop(): void {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  // Real-time timeline frame coordination
  private coordinateVideoFrame(timelineTime: number): void {
    const activeClip = this.findActiveVideoClip(timelineTime);
    const el = this.videoElement;
    
    if (activeClip && el) {
      // Sync URL source if changed
      if (this.activeVideoUrl() !== activeClip.url) {
        this.activeVideoUrl.set(activeClip.url || '');
        setTimeout(() => {
          el.load();
          const targetOffset = timelineTime - activeClip.startTime;
          el.currentTime = targetOffset;
          el.playbackRate = activeClip.speed || 1.0;
          el.volume = (this.volume() / 100) * ((activeClip.volume ?? 100) / 100);
          el.muted = this.isMuted();
          if (this.isPlaying()) el.play().catch(() => {});
        });
        return;
      }

      // If active, sync play state & relative seek offsets
      const targetOffset = timelineTime - activeClip.startTime;
      if (Math.abs(el.currentTime - targetOffset) > 0.25) {
        el.currentTime = targetOffset;
      }
      
      if (el.paused && this.isPlaying()) {
        el.play().catch(() => {});
      }

      // Sync active transforms and color styles
      this.clipScale.set(activeClip.scale ?? 100);
      this.clipRotation.set(activeClip.rotation ?? 0);
      this.clipOpacity.set(activeClip.opacity ?? 100);
      this.clipSpeed.set(activeClip.speed ?? 1.0);
      this.activeFilter.set(activeClip.filter ?? 'none');
      
      el.playbackRate = activeClip.speed ?? 1.0;
      el.volume = (this.volume() / 100) * ((activeClip.volume ?? 100) / 100);
    } else {
      if (el && !el.paused) el.pause();
    }
  }

  private findActiveVideoClip(timelineTime: number): TimelineClip | null {
    // Check Video 1 (Track 0), then Video 2 (Track 1)
    const videoClips = this.timelineClips().filter(c => c.type === 'video');
    
    // Sort so higher tracks overlay lower tracks
    videoClips.sort((a, b) => b.track - a.track);

    for (const clip of videoClips) {
      if (timelineTime >= clip.startTime && timelineTime <= (clip.startTime + clip.duration)) {
        return clip;
      }
    }
    return null;
  }

  skipBackward(): void {
    const t = Math.max(0, this.currentTime() - 5);
    this.seekTimeline(t);
  }

  skipForward(): void {
    const t = Math.min(this.totalDuration(), this.currentTime() + 5);
    this.seekTimeline(t);
  }

  seekTimeline(t: number): void {
    this.currentTime.set(t);
    this.playheadPosition.set((t / this.totalDuration()) * 100);
    this.coordinateVideoFrame(t);
  }

  toggleLoop(): void {
    this.isLooping.update(v => !v);
  }

  toggleMute(): void {
    this.isMuted.update(v => !v);
    const el = this.videoElement;
    if (el) {
      el.muted = this.isMuted();
    }
  }

  updateVolume(val: number): void {
    this.volume.set(val);
    const el = this.videoElement;
    if (el) {
      el.volume = (val / 100) * (this.clipVolume() / 100);
    }
  }

  // ── Property Panel Actions (Real CSS Manipulations) ────────────
  updateClipSpeed(val: number): void {
    this.clipSpeed.set(val);
    const clip = this.selectedClip();
    if (clip) {
      clip.speed = val;
      const el = this.videoElement;
      if (el && this.activeVideoUrl() === clip.url) {
        el.playbackRate = val;
      }
    }
  }

  updateClipVolume(val: number): void {
    this.clipVolume.set(val);
    const clip = this.selectedClip();
    if (clip) {
      clip.volume = val;
      const el = this.videoElement;
      if (el && this.activeVideoUrl() === clip.url) {
        el.volume = (this.volume() / 100) * (val / 100);
      }
    }
  }

  updateClipTransform(type: 'scale' | 'rotation' | 'opacity', val: number): void {
    const clip = this.selectedClip();
    if (clip) {
      if (type === 'scale') { this.clipScale.set(val); clip.scale = val; }
      if (type === 'rotation') { this.clipRotation.set(val); clip.rotation = val; }
      if (type === 'opacity') { this.clipOpacity.set(val); clip.opacity = val; }
    }
  }

  updateClipFilter(filterId: string): void {
    this.activeFilter.set(filterId);
    const clip = this.selectedClip();
    if (clip) {
      clip.filter = filterId;
    }
  }

  getVideoFilterStyle(): string {
    const filter = this.activeFilter();
    switch (filter) {
      case 'vintage': return 'sepia(0.5) saturate(1.2) contrast(0.95)';
      case 'cool': return 'hue-rotate(180deg) saturate(1.1) brightness(0.95)';
      case 'warm': return 'sepia(0.25) saturate(1.3) hue-rotate(-12deg)';
      case 'bw': return 'grayscale(1)';
      case 'cinematic': return 'contrast(1.2) saturate(0.85) brightness(0.9)';
      default: return 'none';
    }
  }

  // ── Real File Uploader ─────────────────────────────────────────
  onFileUploaded(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const isVideo = file.type.startsWith('video/');
      const fileUrl = URL.createObjectURL(file);

      const newItem: MediaItem = {
        id: 'user-' + Date.now(),
        name: file.name,
        type: isVideo ? 'video' : 'image',
        duration: isVideo ? 'Local' : undefined,
        rawDuration: 15,
        url: fileUrl,
        gradient: isVideo ? 'linear-gradient(135deg, #38EF7D, #11998E)' : 'linear-gradient(135deg, #F093FB, #F5576C)',
        icon: isVideo ? '🎬' : '🖼️'
      };

      // Add to library list
      this.mediaItems.update(items => [newItem, ...items]);

      // Automatically add to timeline at current playhead position!
      const currentT = this.currentTime();
      const newClip: TimelineClip = {
        id: 'clip-user-' + Date.now(),
        name: file.name,
        track: isVideo ? 0 : 3,
        startTime: currentT,
        duration: 10,
        color: isVideo ? '#11998E' : '#EC4899',
        type: isVideo ? 'video' : 'text',
        url: fileUrl,
        scale: 100, rotation: 0, opacity: 100, speed: 1.0, volume: 80, filter: 'none'
      };

      this.timelineClips.update(clips => [...clips, newClip]);
      this.selectClip(newClip.id);
    }
  }

  // ── Interactive split & delete operations ──────────────────────
  splitClip(): void {
    const clip = this.selectedClip();
    const t = this.currentTime();
    if (clip && t > clip.startTime && t < (clip.startTime + clip.duration)) {
      const originalDuration = clip.duration;
      
      // Update original clip length
      clip.duration = t - clip.startTime;

      // Create split half B
      const splitHalf: TimelineClip = {
        id: 'clip-split-' + Date.now(),
        name: clip.name + ' (Part 2)',
        track: clip.track,
        startTime: t,
        duration: originalDuration - clip.duration,
        color: clip.color,
        type: clip.type,
        url: clip.url,
        scale: clip.scale,
        rotation: clip.rotation,
        opacity: clip.opacity,
        speed: clip.speed,
        volume: clip.volume,
        filter: clip.filter
      };

      this.timelineClips.update(clips => [...clips, splitHalf]);
      this.selectClip(splitHalf.id);
    }
  }

  deleteClip(): void {
    const id = this.selectedClipId();
    if (id) {
      this.timelineClips.update(clips => clips.filter(c => c.id !== id));
      this.selectedClipId.set(null);
    }
  }

  // Add presets
  addTextPreset(text: TextPreset): void {
    const newText: TimelineClip = {
      id: 'clip-text-' + Date.now(),
      name: text.label,
      track: 3, // text track
      startTime: this.currentTime(),
      duration: 5,
      color: '#F59E0B',
      type: 'text'
    };
    this.timelineClips.update(clips => [...clips, newText]);
    this.selectClip(newText.id);
  }

  addAudioPreset(audio: MediaItem): void {
    const newAudio: TimelineClip = {
      id: 'clip-audio-' + Date.now(),
      name: audio.name,
      track: 2, // audio track
      startTime: this.currentTime(),
      duration: 15,
      color: '#7C3AED',
      type: 'audio',
      url: audio.url
    };
    this.timelineClips.update(clips => [...clips, newAudio]);
    this.selectClip(newAudio.id);
  }

  // ── Simulated rendering pipeline ───────────────────────────────
  startRenderVideo(): void {
    this.isRendering.set(true);
    this.renderProgress.set(0);
    
    const interval = setInterval(() => {
      const next = this.renderProgress() + 4;
      if (next >= 100) {
        this.renderProgress.set(100);
        this.isRendering.set(false);
        clearInterval(interval);
        
        // Trigger file download simulation
        alert(`Render finished! Project "${this.projectName()}" exported successfully.`);
      } else {
        this.renderProgress.set(next);
      }
    }, 150);
  }

  // ── Drag Shifting and Trimming handlers ──────────────────────────
  startDragClip(event: MouseEvent, clip: TimelineClip, type: 'move' | 'trim-left' | 'trim-right'): void {
    event.stopPropagation();
    event.preventDefault();
    
    this.dragClip = clip;
    this.dragType = type;
    this.dragStartX = event.clientX;
    this.dragStartSeconds = clip.startTime;
    this.dragStartWidth = clip.duration;

    this.selectClip(clip.id);

    // Attach global window event listeners for smooth tracking
    window.addEventListener('mousemove', this.onDragMouseMove);
    window.addEventListener('mouseup', this.onDragMouseUp);
  }

  private onDragMouseMove = (event: MouseEvent): void => {
    if (!this.dragClip) return;

    const deltaX = event.clientX - this.dragStartX;
    // zoom scale maps: timelineZoom pixels = 10 seconds.
    // So 1 second = timelineZoom / 10 pixels.
    const pixelsPerSecond = this.timelineZoom() / 10;
    const deltaSeconds = deltaX / pixelsPerSecond;

    if (this.dragType === 'move') {
      const newStart = Math.max(0, this.dragStartSeconds + deltaSeconds);
      this.dragClip.startTime = Math.round(newStart * 10) / 10;
    } else if (this.dragType === 'trim-right') {
      const newDuration = Math.max(0.5, this.dragStartWidth + deltaSeconds);
      this.dragClip.duration = Math.round(newDuration * 10) / 10;
    } else if (this.dragType === 'trim-left') {
      const newStart = Math.max(0, this.dragStartSeconds + deltaSeconds);
      const startDifference = newStart - this.dragStartSeconds;
      const newDuration = Math.max(0.5, this.dragStartWidth - startDifference);

      this.dragClip.startTime = Math.round(newStart * 10) / 10;
      this.dragClip.duration = Math.round(newDuration * 10) / 10;
    }
  };

  private onDragMouseUp = (): void => {
    this.dragClip = null;
    window.removeEventListener('mousemove', this.onDragMouseMove);
    window.removeEventListener('mouseup', this.onDragMouseUp);
  };

  // ── Helpers ────────────────────────────────────────────────────
  zoomIn(): void {
    this.timelineZoom.update(v => Math.min(300, v + 20));
  }

  zoomOut(): void {
    this.timelineZoom.update(v => Math.max(40, v - 20));
  }

  setTool(tool: 'select' | 'trim' | 'split' | 'crop' | 'speed'): void {
    this.activeTool.set(tool);
  }

  toggleTrackMute(index: number): void {
    this.trackMuted.update(arr => {
      const copy = [...arr];
      copy[index] = !copy[index];
      return copy;
    });
  }

  toggleTrackLock(index: number): void {
    this.trackLocked.update(arr => {
      const copy = [...arr];
      copy[index] = !copy[index];
      return copy;
    });
  }

  toggleExportMenu(): void {
    this.showExportMenu.update(v => !v);
  }

  setExportQuality(q: '720p' | '1080p' | '4K'): void {
    this.exportQuality.set(q);
    this.showExportMenu.set(false);
  }

  setFilter(id: string): void {
    this.activeFilter.set(id);
    const clip = this.selectedClip();
    if (clip) {
      clip.filter = id;
    }
  }

  clipsForTrack(trackIndex: number): TimelineClip[] {
    return this.timelineClips().filter(c => c.track === trackIndex);
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
