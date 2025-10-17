import Phaser from 'phaser';

export class JapaneseBackground {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    const { width, height } = this.scene.scale;

    this.createSky(width, height);
    this.createMountains(width, height);
    this.createArchitecture(width, height);
    this.createCherryTrees(width, height);
    this.createCherryBlossomPetals(width, height);
  }

  private createSky(width: number, height: number): void {
    const bg = this.scene.add.graphics();
    
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x6BA5D8, 0x6BA5D8, 1);
    bg.fillRect(0, 0, width, height * 0.6);
    
    bg.fillGradientStyle(0x6BA5D8, 0x6BA5D8, 0x5A94C7, 0x5A94C7, 1);
    bg.fillRect(0, height * 0.6, width, height * 0.4);
  }

  private createMountains(width: number, height: number): void {
    const mountains = this.scene.add.graphics();
    
    mountains.fillStyle(0x4A7BA7, 0.6);
    mountains.beginPath();
    mountains.moveTo(0, height * 0.7);
    mountains.lineTo(width * 0.3, height * 0.4);
    mountains.lineTo(width * 0.6, height * 0.7);
    mountains.closePath();
    mountains.fillPath();

    mountains.fillStyle(0x3A6B97, 0.8);
    mountains.beginPath();
    mountains.moveTo(width * 0.4, height * 0.7);
    mountains.lineTo(width * 0.75, height * 0.35);
    mountains.lineTo(width, height * 0.7);
    mountains.closePath();
    mountains.fillPath();
  }

  private createArchitecture(width: number, height: number): void {
    const arch = this.scene.add.graphics();
    
    // Templo izquierdo
    arch.fillStyle(0x8B4513, 1);
    arch.fillRect(width * 0.05, height * 0.6, width * 0.08, height * 0.25);
    
    arch.fillStyle(0x654321, 1);
    arch.beginPath();
    arch.moveTo(width * 0.03, height * 0.6);
    arch.lineTo(width * 0.09, height * 0.54);
    arch.lineTo(width * 0.15, height * 0.6);
    arch.closePath();
    arch.fillPath();

    // Templo derecho
    arch.fillStyle(0x8B4513, 1);
    arch.fillRect(width * 0.87, height * 0.65, width * 0.08, height * 0.2);
    
    arch.fillStyle(0x654321, 1);
    arch.beginPath();
    arch.moveTo(width * 0.85, height * 0.65);
    arch.lineTo(width * 0.91, height * 0.59);
    arch.lineTo(width * 0.97, height * 0.65);
    arch.closePath();
    arch.fillPath();
  }

  private createCherryTrees(width: number, height: number): void {
    this.createTree(width * 0.1, height * 0.55, 0xFF69B4, 0.8);
    this.createTree(width * 0.92, height * 0.6, 0xFFB6D9, 0.7);
  }

  private createTree(x: number, y: number, color: number, scale: number): void {
    const tree = this.scene.add.graphics();
    
    tree.fillStyle(0x654321, 1);
    tree.fillRect(x - 10 * scale, y, 20 * scale, 100 * scale);

    tree.fillStyle(color, 0.7);
    tree.fillCircle(x, y - 20 * scale, 60 * scale);
    tree.fillCircle(x - 40 * scale, y, 50 * scale);
    tree.fillCircle(x + 40 * scale, y, 50 * scale);
    tree.fillCircle(x, y + 20 * scale, 55 * scale);
  }

  private createCherryBlossomPetals(width: number, height: number): void {
    this.scene.add.particles(0, 0, undefined as any, {
      x: { min: 0, max: width },
      y: { min: -50, max: -10 },
      lifespan: 8000,
      speedY: { min: 20, max: 50 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.3, end: 0.1 },
      rotate: { start: 0, end: 360 },
      tint: [0xFFB6D9, 0xFF69B4, 0xFFC0CB, 0xFFFFFF],
      frequency: 200,
      alpha: { start: 0.8, end: 0.3 }
    });
  }
}

