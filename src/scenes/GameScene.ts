import Phaser from 'phaser';

type SwipePoint = { x: number; y: number; t: number };

export class GameScene extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private trail!: Phaser.GameObjects.Graphics;
  private swipePoints: SwipePoint[] = [];

  constructor() {
    super('game');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#10131a');

    this.scoreText = this.add.text(24, 24, 'Puntos: 0', {
      fontFamily: 'sans-serif',
      fontSize: '36px',
      color: '#ffffff'
    }).setDepth(10);

    this.trail = this.add.graphics({ lineStyle: { width: 6, color: 0x66e0ff, alpha: 0.9 } }).setDepth(9);

    this.time.addEvent({ delay: 700, loop: true, callback: this.spawnTarget, callbackScope: this });

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.recordSwipe(p));
  }

  private spawnTarget(): void {
    const x = Phaser.Math.Between(100, this.scale.width - 100);
    const y = this.scale.height + 50;

    const sprite = this.physics.add.image(x, y, 'politician').setScale(1).setCircle(60);

    const vx = Phaser.Math.Between(-200, 200);
    const vy = Phaser.Math.Between(-1200, -1500);
    sprite.setVelocity(vx, vy);
    sprite.setAngularVelocity(Phaser.Math.Between(-200, 200));

    sprite.setDataEnabled();
    sprite.setData('slicable', true);
  }

  update(time: number, delta: number): void {
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

    const bodies = this.physics.world.bodies.entries as Phaser.Physics.Arcade.Body[];
    if (this.swipePoints.length > 1) {
      for (const body of bodies) {
        const go = body.gameObject as Phaser.GameObjects.Image;
        if (!go || !go.active || !(go as any).data?.get('slicable')) continue;

        const radius = 60;
        for (let i = 0; i < this.swipePoints.length - 1; i++) {
          const a = this.swipePoints[i];
          const b = this.swipePoints[i + 1];
          if (this.segmentIntersectsCircle(a.x, a.y, b.x, b.y, go.x, go.y, radius)) {
            this.slice(go);
            break;
          }
        }
      }
    }
  }

  private recordSwipe(p: Phaser.Input.Pointer): void {
    if (!p.isDown) return;
    this.swipePoints.push({ x: p.x, y: p.y, t: performance.now() });
  }

  private slice(target: Phaser.GameObjects.Image): void {
    (target as any).data.set('slicable', false);
    target.disableInteractive();
    target.setVisible(false);

    const particles = this.add.particles(target.x, target.y, undefined as any, {
      lifespan: 400,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      tint: 0xff4757,
      quantity: 16
    });
    this.time.delayedCall(450, () => particles.destroy());

    this.score += 1;
    this.scoreText.setText(`Puntos: ${this.score}`);
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
}

