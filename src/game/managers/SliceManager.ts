import Phaser from 'phaser';
import { progressManager } from './ProgressManager';

type SwipePoint = { x: number; y: number; t: number };

export class SliceManager {
  private scene: Phaser.Scene;
  private trail: Phaser.GameObjects.Graphics;
  private swipePoints: SwipePoint[] = [];
  private slashMarks: Phaser.GameObjects.Graphics[] = [];
  private isSlicing: boolean = false;
  private boundPointerDown?: (p: Phaser.Input.Pointer) => void;
  private boundPointerUp?: (p: Phaser.Input.Pointer) => void;
  private boundPointerOut?: (p: Phaser.Input.Pointer) => void;
  private boundPointerMove?: (p: Phaser.Input.Pointer) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Configurar color/estilo del rastro según efecto seleccionado
    const style = this.getTrailStyle();
    this.trail = scene.add.graphics({ lineStyle: style });
    this.trail.setDepth(15);
    this.trail.setBlendMode(Phaser.BlendModes.ADD);
  }

  setup(): void {
    this.boundPointerDown = () => { this.isSlicing = true; };
    this.boundPointerUp = () => { this.isSlicing = false; this.clearSwipe(); };
    this.boundPointerOut = () => { this.isSlicing = false; this.clearSwipe(); };
    this.boundPointerMove = (p: Phaser.Input.Pointer) => {
      if (!this.isSlicing) return;
      this.swipePoints.push({ x: p.x, y: p.y, t: performance.now() });
    };

    this.scene.input.on('pointerdown', this.boundPointerDown);
    this.scene.input.on('pointerup', this.boundPointerUp);
    this.scene.input.on('pointerout', this.boundPointerOut);
    this.scene.input.on('pointermove', this.boundPointerMove);

    // Asegurar limpieza al cerrar la escena
    this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this.teardown());
  }

  teardown(): void {
    if (this.boundPointerDown) this.scene.input.off('pointerdown', this.boundPointerDown);
    if (this.boundPointerUp) this.scene.input.off('pointerup', this.boundPointerUp);
    if (this.boundPointerOut) this.scene.input.off('pointerout', this.boundPointerOut);
    if (this.boundPointerMove) this.scene.input.off('pointermove', this.boundPointerMove);
    this.trail.destroy();
    this.slashMarks.forEach(g => g.destroy());
    this.clearSwipe();
    this.isSlicing = false;
  }

  update(): void {
    const now = performance.now();
    this.swipePoints = this.swipePoints.filter(p => now - p.t < 120);

    this.trail.clear();
    // Reaplicar estilo por si el jugador cambió de efecto entre escenas
    const style = this.getTrailStyle();
    this.trail.lineStyle(style.width, style.color, style.alpha);
    if (this.swipePoints.length > 1) {
      this.trail.beginPath();
      this.trail.moveTo(this.swipePoints[0].x, this.swipePoints[0].y);
      for (let i = 1; i < this.swipePoints.length; i++) {
        this.trail.lineTo(this.swipePoints[i].x, this.swipePoints[i].y);
      }
      this.trail.strokePath();
    }

    this.slashMarks = this.slashMarks.filter(mark => {
      if (mark.alpha <= 0) {
        mark.destroy();
        return false;
      }
      return true;
    });
  }

  checkCollisions(bodies: Phaser.Physics.Arcade.Body[], onSlice: (target: any) => void): void {
    if (this.swipePoints.length < 2) return;

    for (const body of bodies) {
      const go = body.gameObject as any;
      if (!go || !go.active || !go.data?.get('slicable')) continue;

      const radius = 40;
      for (let i = 0; i < this.swipePoints.length - 1; i++) {
        const a = this.swipePoints[i];
        const b = this.swipePoints[i + 1];
        if (this.segmentIntersectsCircle(a.x, a.y, b.x, b.y, go.x, go.y, radius)) {
          onSlice(go);
          break;
        }
      }
    }
  }

  createSliceEffect(x: number, y: number): void {
    // Marca de corte en el fondo
    const slash = this.scene.add.graphics();
    slash.lineStyle(3, 0x3E2616, 0.8);
    
    const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
    const length = Phaser.Math.Between(100, 200);
    const x1 = x - Math.cos(angle) * length / 2;
    const y1 = y - Math.sin(angle) * length / 2;
    const x2 = x + Math.cos(angle) * length / 2;
    const y2 = y + Math.sin(angle) * length / 2;
    
    slash.lineBetween(x1, y1, x2, y2);
    slash.setDepth(1);

    this.slashMarks.push(slash);

    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      duration: 3000,
      ease: 'Linear'
    });

    // Partículas según efecto seleccionado
    const { tint, blend } = this.getParticleStyle();
    const particles = this.scene.add.particles(x, y, undefined as any, {
      lifespan: 600,
      speed: { min: 200, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      tint,
      quantity: 20,
      blendMode: blend
    });
    particles.setDepth(14);
    this.scene.time.delayedCall(650, () => particles.destroy());
  }

  private getTrailStyle(): { width: number; color: number; alpha: number } {
    switch (progressManager.selectedSliceEffect) {
      case 'water':
        return { width: 8, color: 0x4FC3F7, alpha: 0.95 };
      case 'fire':
        return { width: 8, color: 0xFF7043, alpha: 0.95 };
      case 'lightning':
        return { width: 8, color: 0xFFFF66, alpha: 0.95 };
      default:
        return { width: 8, color: 0xFFFFFF, alpha: 0.9 };
    }
  }

  private getParticleStyle(): { tint: number[]; blend: Phaser.BlendModes | string } {
    switch (progressManager.selectedSliceEffect) {
      case 'water':
        return { tint: [0x81D4FA, 0x29B6F6, 0xE1F5FE], blend: 'ADD' };
      case 'fire':
        return { tint: [0xFF6B6B, 0xFFA726, 0xFFD54F], blend: 'ADD' };
      case 'lightning':
        return { tint: [0xE6EE9C, 0xFFFF00, 0xB2FF59], blend: 'ADD' };
      default:
        return { tint: [0xFF6B6B, 0xFF8E53, 0xFFD93D], blend: 'ADD' };
    }
  }

  private segmentIntersectsCircle(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;

    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - r * r;

    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false;

    discriminant = Math.sqrt(discriminant);
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);

    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  }

  clearSwipe(): void {
    this.swipePoints = [];
  }
}

