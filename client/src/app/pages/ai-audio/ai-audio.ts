import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'gz-ai-audio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-audio.html',
  styleUrl: './ai-audio.scss'
})
export class AiAudioPage {
  scriptText = '';
  selectedLanguage = 'English (US)';
  
  languages = [
    'English (US)', 'English (UK)', 'English (India)',
    'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi',
    'Spanish', 'French', 'German', 'Japanese', 'Mandarin', 'Korean', 'Italian', 'Portuguese'
  ];
  
  voices = [
    { id: 'f1', name: 'Sophia', gender: 'Female', type: 'preset' },
    { id: 'f2', name: 'Emma', gender: 'Female', type: 'preset' },
    { id: 'f3', name: 'Isabella', gender: 'Female', type: 'preset' },
    { id: 'm1', name: 'James', gender: 'Male', type: 'preset' },
    { id: 'm2', name: 'William', gender: 'Male', type: 'preset' },
    { id: 'm3', name: 'Alexander', gender: 'Male', type: 'preset' },
    { id: 'custom', name: 'Custom Voice Clone', gender: 'Custom', type: 'custom' }
  ];
  selectedVoiceId = 'f1';

  emotions = ['Neutral', 'Happy', 'Sad', 'Emotional', 'Angry', 'Excited', 'Calm'];
  selectedEmotion = 'Neutral';

  isSingingMode = false;

  // Customization so it sounds similar to their voice
  voiceSettings = {
    similarity: 85,
    stability: 70,
    pitch: 0,
    speed: 1.0
  };

  isGenerating = false;
  generatedAudioReady = false;
  
  playingVoiceId: string | null = null;

  toggleVoicePreview(event: Event, voiceId: string) {
    event.stopPropagation();
    if (this.playingVoiceId === voiceId) {
      this.playingVoiceId = null;
    } else {
      this.playingVoiceId = voiceId;
      // Mock playing duration of 3 seconds
      setTimeout(() => {
        if (this.playingVoiceId === voiceId) {
          this.playingVoiceId = null;
        }
      }, 3000);
    }
  }

  generateAudio() {
    if (!this.scriptText.trim()) return;
    this.isGenerating = true;
    this.generatedAudioReady = false;
    
    // Simulate API call processing
    setTimeout(() => {
      this.isGenerating = false;
      this.generatedAudioReady = true;
    }, 2500);
  }
}
