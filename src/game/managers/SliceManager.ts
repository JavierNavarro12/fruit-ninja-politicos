import Phaser from 'phaser';

type SwipePoint = { x: number; y: number; t: number };

export class SliceManager {
  private scene: Phaser.Scene;
  private trail: Phaser.GameObjects.Graphics;
  private swipePoints: SwipePoint[] = [];
  private slashMarks: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.trail = scene.add.graphics({ lineStyle: { width: 8, color: 0xFFFFFF, alpha: 0.9 } });
    this.trail.setDepth(15);
  }

  setup(): void {
    this.scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      this.swipePoints.push({ x: p.x, y: p.y, t: performance.now() });
    });
  }

  update(): void {
    const now = performance.now();
    this.swipePoints = this.swipePoints.filter(p => now - p.t < 120);

    this.trail.clear();
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

    // Partículas
    const particles = this.scene.add.particles(x, y, undefined as any, {
      lifespan: 600,
      speed: { min: 200, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      tint: [0xFF6B6B, 0xFF8E53, 0xFFD93D],
      quantity: 20,
      blendMode: 'ADD'
    });
    particles.setDepth(14);
    this.scene.time.delayedCall(650, () => particles.destroy());
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

