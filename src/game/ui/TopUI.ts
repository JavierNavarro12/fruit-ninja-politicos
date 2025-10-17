import Phaser from 'phaser';

export class TopUI {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    const width = this.scene.scale.width;
    const uiY = 30;
    const uiPadding = 20;

    this.createLevelBox(uiPadding + 60, uiY);
    this.createCoinUI(width * 0.25, uiY);
    this.createGemUI(width * 0.4, uiY);
    this.createStarUI(width * 0.55, uiY);
  }

  private createLevelBox(x: number, y: number): void {
    const box = this.scene.add.graphics();
    box.fillStyle(0x4169E1, 0.9);
    box.fillRoundedRect(x - 60, y - 25, 120, 50, 10);
    box.lineStyle(3, 0xFFFFFF, 1);
    box.strokeRoundedRect(x - 60, y - 25, 120, 50, 10);

    this.scene.add.text(x, y, '1 NIVEL', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createCoinUI(x: number, y: number): void {
    const coin = this.scene.add.circle(x - 30, y, 20, 0xFFD700);
    coin.setStrokeStyle(3, 0xFFA500);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2C2C2C, 0.8);
    bg.fillRoundedRect(x - 5, y - 20, 80, 40, 10);

    this.scene.add.text(x + 35, y, '0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createGemUI(x: number, y: number): void {
    const gem = this.scene.add.graphics();
    gem.fillStyle(0xFF1493, 1);
    gem.beginPath();
    gem.moveTo(x - 30, y);
    gem.lineTo(x - 40, y - 10);
    gem.lineTo(x - 30, y - 20);
    gem.lineTo(x - 20, y - 10);
    gem.closePath();
    gem.fillPath();
    gem.lineStyle(2, 0xFFFFFF);
    gem.strokePath();

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2C2C2C, 0.8);
    bg.fillRoundedRect(x - 5, y - 20, 80, 40, 10);

    this.scene.add.text(x + 35, y, '0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#FF1493',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createStarUI(x: number, y: number): void {
    const star = this.scene.add.graphics();
    star.fillStyle(0xFFFF00, 1);
    this.drawStar(star, x - 30, y, 5, 15, 7);
    star.lineStyle(2, 0xFFA500);
    this.drawStar(star, x - 30, y, 5, 15, 7);
    star.strokePath();

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2C2C2C, 0.8);
    bg.fillRoundedRect(x - 5, y - 20, 80, 40, 10);

    this.scene.add.text(x + 35, y, '0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#FFFF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private drawStar(graphics: Phaser.GameObjects.Graphics, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }
    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
  }
}

