import Phaser from 'phaser';

export class BackgroundEffect {
  static createWoodenBackground(scene: Phaser.Scene): void {
    const { width, height } = scene.scale;
    const bg = scene.add.graphics();
    
    // Color base de madera
    bg.fillGradientStyle(0x5C3A21, 0x4A2C1A, 0x5C3A21, 0x4A2C1A, 1);
    bg.fillRect(0, 0, width, height);

    // Vetas de madera
    bg.lineStyle(2, 0x3E2616, 0.3);
    for (let i = 0; i < 20; i++) {
      const y = (height / 20) * i;
      bg.lineBetween(0, y, width, y);
    }

    // Tablones verticales
    bg.lineStyle(3, 0x2E1810, 0.4);
    const plankWidth = width / 5;
    for (let i = 1; i < 5; i++) {
      const x = plankWidth * i;
      bg.lineBetween(x, 0, x, height);
    }
  }
}

