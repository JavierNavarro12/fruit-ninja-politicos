import Phaser from 'phaser';

export class TitleText {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    const { width, height } = this.scene.scale;

    const title = this.scene.add.text(width / 2, height * 0.16, 'FRUIT NINJA', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    title.setStroke('#FF6B35', 8);
    title.setShadow(4, 4, '#000000', 10, true, true);

    const subtitle = this.scene.add.text(width / 2, height * 0.22, 'POLÍTICOS', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    subtitle.setStroke('#FF1493', 4);

    // Animación flotante
    this.scene.tweens.add({
      targets: [title, subtitle],
      y: '+=10',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}

