import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    const graphics = this.add.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xff4757, 1);
    graphics.fillCircle(64, 64, 64);
    graphics.lineStyle(8, 0xffffff, 1);
    graphics.strokeCircle(64, 64, 64);
    graphics.generateTexture('politician', 128, 128);
    graphics.destroy();
  }

  create(): void {
    this.scene.start('loading');
  }
}

