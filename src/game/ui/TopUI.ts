import Phaser from 'phaser';
import { progressManager } from '../managers/ProgressManager';

export class TopUI {
  private scene: Phaser.Scene;
  private xpFill!: Phaser.GameObjects.Graphics;
  private levelBox!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    const width = this.scene.scale.width;
    const uiY = 56; // margen superior para que el panel no toque el borde
    const uiPadding = 20;

    this.createLevelBox(uiPadding + 110, uiY);
    this.createCoinUI(width * 0.25, uiY);
    this.createGemUI(width * 0.4, uiY);
    this.createStarUI(width * 0.55, uiY);
  }

  private createLevelBox(x: number, y: number): void {
    const level = progressManager.level;

    const boxWidth = 220;
    const boxHeight = 64;
    const barWidth = boxWidth - 24;
    const barHeight = 10;

    this.levelBox = this.scene.add.graphics();
    this.levelBox.fillStyle(0x4169E1, 0.95);
    this.levelBox.fillRoundedRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 10);
    this.levelBox.lineStyle(3, 0xFFFFFF, 1);
    this.levelBox.strokeRoundedRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 10);

    const textY = y - 16; // Colocar el texto en la mitad superior del panel
    this.scene.add.text(x - 20, textY, 'NIVEL', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.add.text(x + 40, textY, String(level), {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#FFD93D',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Barra de XP dentro del panel
    const barX = x - barWidth / 2;
    const barY = y + 10; // Barra en la mitad inferior del panel
    const barBg = this.scene.add.graphics();
    barBg.fillStyle(0x2C2C2C, 0.9);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 5);

    this.xpFill = this.scene.add.graphics();
    const p = progressManager.progressFraction();
    this.xpFill.fillStyle(0x27AE60, 1);
    this.xpFill.fillRoundedRect(barX + 2, barY + 2, (barWidth - 4) * p, barHeight - 4, 4);

    // Actualización cuando cambie la XP
    this.scene.events.on('update-xp-bar', () => {
      const pf = progressManager.progressFraction();
      this.xpFill.clear();
      this.xpFill.fillStyle(0x27AE60, 1);
      this.xpFill.fillRoundedRect(barX + 2, barY + 2, (barWidth - 4) * pf, barHeight - 4, 4);
    });
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

