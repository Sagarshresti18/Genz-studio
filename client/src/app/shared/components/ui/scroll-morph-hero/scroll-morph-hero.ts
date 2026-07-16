import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AnimationPhase = 'scatter' | 'line' | 'circle' | 'bottom-strip';

interface TransformTarget {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}

const TOTAL_IMAGES = 20;
const MAX_SCROLL = 3000;

const IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=300&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80",
  "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=300&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80",
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=300&q=80",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&q=80",
  "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&q=80",
  "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=300&q=80",
];

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

@Component({
  selector: 'app-scroll-morph-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-morph-hero.html',
  styleUrls: []
})
export class ScrollMorphHero implements OnInit, OnDestroy {
  @ViewChild('containerRef') containerRef!: ElementRef<HTMLDivElement>;

  images = IMAGES;
  introPhase: AnimationPhase = 'scatter';
  
  containerSize = { width: window.innerWidth, height: window.innerHeight };
  
  // State
  virtualScroll = 0;
  targetScroll = 0;
  
  mouseX = 0;
  targetMouseX = 0;

  morphProgress = 0;
  scrollRotate = 0;
  
  scatterPositions: TransformTarget[] = [];
  currentTransforms: TransformTarget[] = [];

  private animationFrameId = 0;

  ngOnInit() {
    this.scatterPositions = IMAGES.map(() => ({
      x: (Math.random() - 0.5) * 1500,
      y: (Math.random() - 0.5) * 1000,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.6,
      opacity: 0,
    }));

    // Initialize transforms
    this.currentTransforms = IMAGES.map((_, i) => ({ ...this.scatterPositions[i] }));

    setTimeout(() => this.introPhase = 'line', 500);
    setTimeout(() => {
      this.introPhase = 'circle';
      this.updateContainerSize();
    }, 2500);

    this.animationLoop();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateContainerSize();
  }

  updateContainerSize() {
    if (this.containerRef) {
      this.containerSize = {
        width: this.containerRef.nativeElement.offsetWidth,
        height: this.containerRef.nativeElement.offsetHeight
      };
    }
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    this.targetScroll = Math.min(Math.max(this.targetScroll + e.deltaY, 0), MAX_SCROLL);
  }

  private touchStartY = 0;
  onTouchStart(e: TouchEvent) {
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchMove(e: TouchEvent) {
    e.preventDefault();
    const touchY = e.touches[0].clientY;
    const deltaY = this.touchStartY - touchY;
    this.touchStartY = touchY;
    this.targetScroll = Math.min(Math.max(this.targetScroll + deltaY, 0), MAX_SCROLL);
  }

  onMouseMove(e: MouseEvent) {
    if (!this.containerRef) return;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const normalizedX = (relativeX / rect.width) * 2 - 1;
    this.targetMouseX = normalizedX * 100;
  }

  animationLoop = () => {
    // Spring physics emulation
    this.virtualScroll = lerp(this.virtualScroll, this.targetScroll, 0.1);
    this.mouseX = lerp(this.mouseX, this.targetMouseX, 0.1);

    // Calculate Morph (0 to 1 based on scroll 0 to 600)
    let targetMorph = Math.min(Math.max(this.virtualScroll / 600, 0), 1);
    this.morphProgress = lerp(this.morphProgress, targetMorph, 0.15);

    // Calculate Rotate (0 to 360 based on scroll 600 to 3000)
    let targetRotate = 0;
    if (this.virtualScroll > 600) {
      targetRotate = ((this.virtualScroll - 600) / 2400) * 360;
    }
    this.scrollRotate = lerp(this.scrollRotate, targetRotate, 0.15);

    this.updateTransforms();

    this.animationFrameId = requestAnimationFrame(this.animationLoop);
  };

  updateTransforms() {
    for (let i = 0; i < TOTAL_IMAGES; i++) {
      let target: TransformTarget = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

      if (this.introPhase === 'scatter') {
        target = this.scatterPositions[i];
      } else if (this.introPhase === 'line') {
        const lineSpacing = 70;
        const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
        const lineX = i * lineSpacing - lineTotalWidth / 2;
        target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
      } else {
        const isMobile = this.containerSize.width < 768;
        const minDimension = Math.min(this.containerSize.width, this.containerSize.height);

        // Circle
        const circleRadius = Math.min(minDimension * 0.35, 350);
        const circleAngle = (i / TOTAL_IMAGES) * 360;
        const circleRad = (circleAngle * Math.PI) / 180;
        const circlePos = {
          x: Math.cos(circleRad) * circleRadius,
          y: Math.sin(circleRad) * circleRadius,
          rotation: circleAngle + 90,
        };

        // Arc
        const baseRadius = Math.min(this.containerSize.width, this.containerSize.height * 1.5);
        const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
        const arcApexY = this.containerSize.height * (isMobile ? 0.35 : 0.25);
        const arcCenterY = arcApexY + arcRadius;

        const spreadAngle = isMobile ? 100 : 130;
        const startAngle = -90 - (spreadAngle / 2);
        const step = spreadAngle / (TOTAL_IMAGES - 1);

        const scrollProgress = Math.min(Math.max(this.scrollRotate / 360, 0), 1);
        const maxRotation = spreadAngle * 0.8;
        const boundedRotation = -scrollProgress * maxRotation;

        const currentArcAngle = startAngle + (i * step) + boundedRotation;
        const arcRad = (currentArcAngle * Math.PI) / 180;

        const arcPos = {
          x: Math.cos(arcRad) * arcRadius + this.mouseX,
          y: Math.sin(arcRad) * arcRadius + arcCenterY,
          rotation: currentArcAngle + 90,
          scale: isMobile ? 1.4 : 1.8,
        };

        target = {
          x: lerp(circlePos.x, arcPos.x, this.morphProgress),
          y: lerp(circlePos.y, arcPos.y, this.morphProgress),
          rotation: lerp(circlePos.rotation, arcPos.rotation, this.morphProgress),
          scale: lerp(1, arcPos.scale, this.morphProgress),
          opacity: 1,
        };
      }

      // Smoothly interpolate current to target for spring effect
      this.currentTransforms[i].x = lerp(this.currentTransforms[i].x, target.x, 0.1);
      this.currentTransforms[i].y = lerp(this.currentTransforms[i].y, target.y, 0.1);
      this.currentTransforms[i].rotation = lerp(this.currentTransforms[i].rotation, target.rotation, 0.1);
      this.currentTransforms[i].scale = lerp(this.currentTransforms[i].scale, target.scale, 0.1);
      this.currentTransforms[i].opacity = lerp(this.currentTransforms[i].opacity, target.opacity, 0.1);
    }
  }

  get introOpacity() {
    return this.introPhase === 'circle' && this.morphProgress < 0.5 ? Math.max(0, 1 - this.morphProgress * 2) : 0;
  }

  get introFilter() {
    return this.introOpacity === 0 ? 'blur(10px)' : 'blur(0px)';
  }
  
  get introSubtitleOpacity() {
    return this.introPhase === 'circle' && this.morphProgress < 0.5 ? Math.max(0, 0.5 - this.morphProgress) : 0;
  }

  get contentOpacity() {
    return this.morphProgress < 0.8 ? 0 : (this.morphProgress - 0.8) / 0.2;
  }

  get contentY() {
    return this.morphProgress < 0.8 ? 20 : 20 * (1 - ((this.morphProgress - 0.8) / 0.2));
  }
}
