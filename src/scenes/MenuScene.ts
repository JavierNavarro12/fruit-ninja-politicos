import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create(): void {
    const { width, height } = this.scale;

    // Fondo simple azul cielo con "montañas" dibujadas
    const bg = this.add.graphics();
    bg.fillStyle(0x87CEFA, 1);
    bg.fillRect(0, 0, width, height);
    bg.fillStyle(0x6aa2d8, 1);
    bg.fillTriangle(0, height, width * 0.25, height * 0.55, width * 0.5, height);
    bg.fillTriangle(width * 0.5, height, width * 0.75, height * 0.5, width, height);

    this.add.text(width / 2, height * 0.18, 'FRUIT NINJA POLÍTICOS', {
      fontFamily: 'sans-serif',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#1f3d7a',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Botones de modos (placeholders)
    this.createModeButton(width * 0.25, height * 0.55, 'Clásico', () => this.scene.start('game'));
    this.createModeButton(width * 0.5, height * 0.55, 'Zen', () => this.scene.start('game'));
    this.createModeButton(width * 0.75, height * 0.55, 'Arcade', () => this.scene.start('game'));

    // Botón Arsenal/tienda placeholder
    this.createSmallButton(width * 0.1, height * 0.3, 'Tienda', () => {});
    this.createSmallButton(width * 0.1, height * 0.42, '¡Gratis!', () => {});
    this.createSmallButton(width * 0.1, height * 0.54, 'Arsenal', () => {});
  }

  private createModeButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add.circle(x, y, 80, 0xffd166).setStrokeStyle(8, 0xffffff);
    const text = this.add.text(x, y + 100, label, {
      fontFamily: 'sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true }).on('pointerup', onClick);
  }

  private createSmallButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.rectangle(x, y, 140, 44, 0xe74c3c).setOrigin(0.5).setStrokeStyle(4, 0xffffff);
    const txt = this.add.text(x, y, label, {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    btn.setInteractive({ useHandCursor: true }).on('pointerup', onClick);
  }
}


