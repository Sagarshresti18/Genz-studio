import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Tool {
  name: string;
  desc: string;
  icon: string;
  credits: number;
}

interface ToolCategory {
  title: string;
  tools: Tool[];
}

@Component({
  selector: 'gz-ai-tools',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ai-tools.html',
  styleUrl: './ai-tools.scss'
})
export class AIToolsComponent {
  protected readonly searchQuery = signal('');

  protected readonly categories = signal<ToolCategory[]>([
    {
      title: 'Generation Tools',
      tools: [
        { name: 'Logo Generator', desc: 'Create unique logos with brand kits in seconds.', icon: '◇', credits: 5 },
        { name: 'Thumbnail Generator', desc: 'Generate high-CTR YouTube thumbnails.', icon: '▣', credits: 3 },
        { name: 'Banner Generator', desc: 'Design professional profile banners.', icon: '▭', credits: 3 },
        { name: 'Poster Generator', desc: 'Create custom flyers, posters, and prints.', icon: '⧇', credits: 3 }
      ]
    },
    {
      title: 'Writing Tools',
      tools: [
        { name: 'Content Generator', desc: 'Generate short & long-form creative copy.', icon: '¶', credits: 2 },
        { name: 'Script Writer', desc: 'Write engaging video scripts with formatting.', icon: '📝', credits: 3 },
        { name: 'Caption Generator', desc: 'Get catchy captions for social posts.', icon: '💬', credits: 1 },
        { name: 'Hashtag Generator', desc: 'Find trending tags for any topic.', icon: '#️⃣', credits: 1 }
      ]
    },
    {
      title: 'Media Tools',
      tools: [
        { name: 'Image Generator', desc: 'Create photorealistic digital designs.', icon: '🎨', credits: 5 },
        { name: 'Video Generator', desc: 'Generate video clips from text/images.', icon: '🎬', credits: 10 },
        { name: 'Audio Generator', desc: 'Create custom beats and backing tracks.', icon: '🎵', credits: 5 },
        { name: 'Voiceover Generator', desc: 'Realistic text-to-speech with natural voices.', icon: '🎙️', credits: 3 }
      ]
    },
    {
      title: 'Optimization Tools',
      tools: [
        { name: 'AI Translator', desc: 'Translate media assets preserving brand voice.', icon: '🌐', credits: 2 },
        { name: 'Subtitle Generator', desc: 'Generate highly accurate subtitle files.', icon: '📑', credits: 3 },
        { name: 'Blog Writer', desc: 'Write full SEO-optimized articles.', icon: '📰', credits: 5 },
        { name: 'SEO Assistant', desc: 'Analyze and optimize titles & tags.', icon: '⟁', credits: 2 }
      ]
    }
  ]);
}
