import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'gz-logo-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logo-generator.html',
  styleUrl: './logo-generator.scss'
})
export class LogoGeneratorPage implements OnInit {
  // --- Parameters bound via [(ngModel)] ---
  brandTypography = 'AURA';
  visualCoreConcept = 'A sleek geometric cybernetic vortex';
  designArchetype = 'swiss'; // 'swiss' | 'mascot' | 'lettermark'
  canvasIsolator = 'black'; // 'black' | 'white'
  colorMatrixSpec = 'Neon Cyan (#06B6D4) & Digital Violet (#8B5CF6)';

  // --- Generation States ---
  isGenerating = false;
  generatedLogoReady = false;
  isEnhancing = false;
  
  showCopyToast = false;
  showDownloadToast = false;
  compiledPromptSignature = '';

  // --- Dynamic SVG elements generated from prompt analysis ---
  svgCircles: { cx: number; cy: number; r: number; fill: string; stroke: string; strokeWidth: number; opacity: number; dashArray?: string; }[] = [];
  svgPaths: { d: string; fill: string; stroke: string; strokeWidth: number; opacity: number; }[] = [];
  svgPolygons: { points: string; fill: string; stroke: string; strokeWidth: number; }[] = [];
  svgText: { x: number; y: number; text: string; fill: string; fontSize: number; letterSpacing?: string; }[] = [];

  ngOnInit() {
    // Compile initial logo so it is visible immediately on load
    this.buildLogoGeometries();
    this.generatedLogoReady = true;
  }

  // --- Custom Color Spec Parser ---
  getParsedColors() {
    const spec = this.colorMatrixSpec;
    const hexRegex = /#([0-9A-F]{6}|[0-9A-F]{3})/gi;
    const matches = spec.match(hexRegex);

    if (matches && matches.length >= 2) {
      return { c1: matches[0], c2: matches[1] };
    } else if (matches && matches.length === 1) {
      return { c1: matches[0], c2: '#8B5CF6' };
    }

    // Keyword matching fallback
    const lowercase = spec.toLowerCase();
    let c1 = '#06B6D4'; // neon cyan
    let c2 = '#8B5CF6'; // digital violet

    if (lowercase.includes('rose') || lowercase.includes('pink') || lowercase.includes('red')) {
      c1 = '#F43F5E';
      c2 = '#E11D48';
    }
    if (lowercase.includes('amber') || lowercase.includes('orange') || lowercase.includes('yellow')) {
      c1 = '#F59E0B';
      c2 = '#D97706';
    }
    if (lowercase.includes('emerald') || lowercase.includes('green') || lowercase.includes('lime')) {
      c1 = '#10B981';
      c2 = '#059669';
    }
    if (lowercase.includes('gold')) {
      c1 = '#D97706';
      c2 = '#FBBF24';
    }
    if (lowercase.includes('sunset') || lowercase.includes('warm')) {
      c1 = '#FF4562';
      c2 = '#FF9F43';
    }

    return { c1, c2 };
  }

  // Extract first letter of typography for the lettermark design
  getFirstLetterSymbol() {
    const text = this.brandTypography.trim();
    return text ? text.charAt(0).toUpperCase() : 'G';
  }

  // Programmatically enrich the user's description with premium keywords
  enhancePrompt(): void {
    if (this.isEnhancing) return;
    this.isEnhancing = true;

    setTimeout(() => {
      const currentPrompt = this.visualCoreConcept;
      const premiumAdditions = [
        'golden ratio grid alignment',
        'flat vector mathematical blueprint',
        'clean geometric micro-paths',
        'dual-tone alpha mask gradient',
        'cybernetic construct emblem'
      ];
      
      const newKeywords = premiumAdditions.filter(kw => !currentPrompt.toLowerCase().includes(kw));
      if (newKeywords.length > 0) {
        const separator = currentPrompt.endsWith('.') || currentPrompt.endsWith(',') ? ' ' : ', ';
        this.visualCoreConcept = currentPrompt + separator + newKeywords.join(', ');
      }
      this.isEnhancing = false;
      this.buildLogoGeometries(); // Update geometries based on enhanced prompt
    }, 600);
  }

  // Pure geometry builder that updates the SVG vector paths dynamically
  buildLogoGeometries(): void {
    this.svgCircles = [];
    this.svgPaths = [];
    this.svgPolygons = [];
    this.svgText = [];

    const concept = this.visualCoreConcept.toLowerCase();
    const archetype = this.designArchetype.toLowerCase();

    if (archetype === 'lettermark') {
      // Base circle frame
      this.svgCircles.push({
        cx: 100, cy: 92, r: 52,
        fill: 'none',
        stroke: 'url(#studio-logo-grad)',
        strokeWidth: concept.includes('bold') || concept.includes('thick') ? 3 : 1.5,
        opacity: 0.9,
        dashArray: concept.includes('dashed') || concept.includes('cyber') || concept.includes('tech') ? '16 6' : ''
      });

      if (concept.includes('double') || concept.includes('ring')) {
        this.svgCircles.push({
          cx: 100, cy: 92, r: 44,
          fill: 'none',
          stroke: 'rgba(109, 40, 217, 0.15)',
          strokeWidth: 1,
          opacity: 0.5
        });
      }

      // Add letter glyph text
      this.svgText.push({
        x: 100,
        y: 112,
        text: this.getFirstLetterSymbol(),
        fill: 'url(#studio-logo-grad)',
        fontSize: concept.includes('small') ? 42 : 58
      });

      // Optional tech elements
      if (concept.includes('tech') || concept.includes('cyber') || concept.includes('futuristic') || concept.includes('grid')) {
        this.svgPaths.push({
          d: 'M 70,92 H 130',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 0.5,
          opacity: 0.3
        });
        this.svgCircles.push({
          cx: concept.includes('left') ? 85 : 115, cy: 92, r: 3,
          fill: 'url(#studio-logo-grad)',
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.8
        });
      }
    } else if (archetype === 'swiss') {
      // Base ring
      this.svgCircles.push({
        cx: 100, cy: 95, r: 50,
        fill: 'none',
        stroke: 'url(#studio-logo-grad)',
        strokeWidth: 1.25,
        opacity: 0.8
      });

      if (concept.includes('vortex') || concept.includes('spiral') || concept.includes('helix') || concept.includes('spinning') || concept.includes('cyber')) {
        // Vortex/concentric dashboard
        this.svgCircles.push({
          cx: 100, cy: 95, r: 58,
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 0.5,
          opacity: 0.6,
          dashArray: '1 3'
        });
        this.svgCircles.push({
          cx: 100, cy: 95, r: 32,
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 0.75,
          opacity: 0.6,
          dashArray: '8 4'
        });
        // Spiral curves
        this.svgPaths.push({
          d: 'M 100,95 Q 115,75 100,60 T 100,30',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 2,
          opacity: 0.8
        });
        this.svgPaths.push({
          d: 'M 100,95 Q 85,115 100,130 T 100,160',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 2,
          opacity: 0.8
        });
      } else if (concept.includes('triangle') || concept.includes('pyramid') || concept.includes('delta')) {
        // Interlocking triangles
        this.svgPolygons.push({
          points: '100,45 143,120 57,120',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 2
        });
        this.svgPolygons.push({
          points: '100,60 130,112 70,112',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 0.75
        });
        this.svgCircles.push({
          cx: 100, cy: 95, r: 12,
          fill: 'url(#studio-logo-grad)',
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.9
        });
      } else if (concept.includes('cross') || concept.includes('plus') || concept.includes('swiss')) {
        // Geometric cross
        this.svgPaths.push({
          d: 'M 90,75 H 110 V 85 H 120 V 105 H 110 V 115 H 90 V 105 H 80 V 85 H 90 Z',
          fill: 'url(#studio-logo-grad)',
          stroke: 'rgba(255,255,255,0.2)',
          strokeWidth: 1,
          opacity: 1
        });
      } else if (concept.includes('globe') || concept.includes('sphere') || concept.includes('world') || concept.includes('concentric')) {
        // Wireframe globe
        this.svgCircles.push({
          cx: 100, cy: 95, r: 40,
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 1,
          opacity: 0.8
        });
        this.svgPaths.push({
          d: 'M 60,95 H 140',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 1,
          opacity: 0.8
        });
        this.svgPaths.push({
          d: 'M 65,80 Q 100,90 135,80',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 0.75,
          opacity: 0.6
        });
        this.svgPaths.push({
          d: 'M 65,110 Q 100,100 135,110',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 0.75,
          opacity: 0.6
        });
      } else {
        // Default Swiss layout: square and center core
        this.svgPaths.push({
          d: 'M 75,70 H 125 V 120 H 75 Z',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 1.5,
          opacity: 0.75
        });
        this.svgCircles.push({
          cx: 100, cy: 95, r: 25,
          fill: 'url(#studio-logo-grad)',
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.5
        });
      }
    } else {
      // Mascot/Outlined
      if (concept.includes('crown') || concept.includes('king') || concept.includes('royal')) {
        this.svgPolygons.push({
          points: '100,30 154,50 154,112 100,156 46,112 46,50',
          fill: '#141622',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 2.2
        });
        this.svgPaths.push({
          d: 'M 70,100 L 80,75 L 100,90 L 120,75 L 130,100 Z',
          fill: 'url(#studio-logo-grad)',
          stroke: 'none',
          strokeWidth: 0,
          opacity: 1
        });
      } else if (concept.includes('wolf') || concept.includes('lion') || concept.includes('beast') || concept.includes('tiger') || concept.includes('animal') || concept.includes('sharp') || concept.includes('shield')) {
        this.svgPolygons.push({
          points: '100,28 154,48 154,112 100,156 46,112 46,48',
          fill: '#141622',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 2.2
        });
        this.svgPaths.push({
          d: 'M 100,60 L 125,85 L 120,105 L 100,118 L 80,105 L 75,85 Z',
          fill: 'none',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 1.5,
          opacity: 0.95
        });
        this.svgPaths.push({
          d: 'M 100,82 L 110,95 H 90 Z',
          fill: 'url(#studio-logo-grad)',
          stroke: 'none',
          strokeWidth: 0,
          opacity: 1
        });
      } else {
        // Standard shield with chevrons
        this.svgPolygons.push({
          points: '100,28 154,48 154,112 100,156 46,112 46,48',
          fill: '#141622',
          stroke: 'url(#studio-logo-grad)',
          strokeWidth: 2.2
        });
        this.svgPaths.push({
          d: 'M 100,50 L 132,80 H 122 L 100,60 L 78,80 H 68 Z',
          fill: 'url(#studio-logo-grad)',
          stroke: 'none',
          strokeWidth: 0,
          opacity: 1
        });
        this.svgPaths.push({
          d: 'M 100,82 L 124,106 H 112 L 100,92 L 88,106 H 76 Z',
          fill: 'url(#studio-logo-grad)',
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.8
        });
      }
    }
  }

  // Compile prompt and run simulation state
  generateLogo(): void {
    if (!this.brandTypography.trim() || !this.visualCoreConcept.trim()) return;
    
    this.isGenerating = true;
    this.generatedLogoReady = false;

    // Compile dynamic signature
    this.compiledPromptSignature = `PROMPT // ARCHETYPE:${this.designArchetype.toUpperCase()} // TYPOGRAPHY:"${this.brandTypography}" // CONCEPT:"${this.visualCoreConcept}" // MATRIX:"${this.colorMatrixSpec}" // MASK:ALPHA // SOLID_BG:${this.canvasIsolator.toUpperCase()}`;

    // Simulated GPU pipeline delay
    setTimeout(() => {
      this.buildLogoGeometries(); // Compute the dynamic logo shape on finish
      this.isGenerating = false;
      this.generatedLogoReady = true;
    }, 2000);
  }

  // Copy Prompt to Clipboard
  copyPromptSignature(): void {
    if (!this.compiledPromptSignature) return;

    navigator.clipboard.writeText(this.compiledPromptSignature).then(() => {
      this.showCopyToast = true;
      setTimeout(() => this.showCopyToast = false, 2000);
    });
  }

  // Simulate download of the vector asset
  downloadAsset(): void {
    this.showDownloadToast = true;
    setTimeout(() => this.showDownloadToast = false, 2000);

    const svgElement = document.querySelector('.logo-viewport-svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = blobURL;
    downloadLink.download = `${this.brandTypography.toLowerCase()}_logo_asset.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
