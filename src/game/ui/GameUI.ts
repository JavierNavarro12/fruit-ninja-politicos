import Phaser from 'phaser';

export class GameUI {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private scoreIcon!: Phaser.GameObjects.Graphics;
  private livesIcons: Phaser.GameObjects.Container[] = [];
  private pauseButton!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(onPauseClick: () => void): void {
    const { width } = this.scene.scale;
    
    this.createScoreUI();
    this.createLivesUI(width);
    this.createPauseButton(onPauseClick);
  }

  private createScoreUI(): void {
    const x = 40;
    const y = 40;

    // Icono de sandía
    this.scoreIcon = this.scene.add.graphics();
    this.scoreIcon.setPosition(x, y);
    
    this.scoreIcon.fillStyle(0x2ECC71, 1);
    this.scoreIcon.fillCircle(0, 0, 28);
    
    this.scoreIcon.fillStyle(0x27AE60, 1);
    this.scoreIcon.fillCircle(-8, 0, 25);
    this.scoreIcon.fillCircle(8, 0, 25);
    
    this.scoreIcon.fillStyle(0xFF6B6B, 1);
    this.scoreIcon.fillCircle(0, 0, 18);
    
    this.scoreIcon.lineStyle(3, 0xFFFFFF, 1);
    this.scoreIcon.strokeCircle(0, 0, 28);
    this.scoreIcon.setDepth(20);

    // Texto del contador
    this.scoreText = this.scene.add.text(x + 45, y, '0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '56px',
      color: '#FFD93D',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(20);
    
    this.scoreText.setStroke('#8B4513', 4);
    this.scoreText.setShadow(3, 3, '#000000', 5);
  }

  private createLivesUI(width: number): void {
    const startX = width - 60;
    const y = 40;
    const spacing = 50;

    for (let i = 0; i < 3; i++) {
      const lifeIcon = this.createLifeIcon(startX - (i * spacing), y);
      this.livesIcons.push(lifeIcon);
    }
  }

  private createLifeIcon(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    container.setDepth(20);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x3498DB, 1);
    bg.fillCircle(0, 0, 25);
    bg.lineStyle(3, 0x2980B9, 1);
    bg.strokeCircle(0, 0, 25);
    container.add(bg);

    const xMark = this.scene.add.graphics();
    xMark.lineStyle(6, 0xFFFFFF, 1);
    xMark.lineBetween(-12, -12, 12, 12);
    xMark.lineBetween(-12, 12, 12, -12);
    container.add(xMark);

    return container;
  }

  private createPauseButton(onPauseClick: () => void): void {
    const x = 80;
    const y = this.scene.scale.height - 60;

    this.pauseButton = this.scene.add.container(x, y);
    this.pauseButton.setDepth(20);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x8B4513, 0.95);
    bg.fillRoundedRect(-35, -35, 70, 70, 10);
    bg.lineStyle(3, 0xFFFFFF, 0.8);
    bg.strokeRoundedRect(-35, -35, 70, 70, 10);
    this.pauseButton.add(bg);

    const pauseIcon = this.scene.add.graphics();
    pauseIcon.fillStyle(0xFFFFFF, 1);
    pauseIcon.fillRect(-12, -18, 8, 36);
    pauseIcon.fillRect(4, -18, 8, 36);
    this.pauseButton.add(pauseIcon);

    bg.setInteractive(new Phaser.Geom.Rectangle(-35, -35, 70, 70), Phaser.Geom.Rectangle.Contains);

    bg.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.pauseButton,
        scale: 1.1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    bg.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this.pauseButton,
        scale: 1,
        duration: 150
      });
    });

    bg.on('pointerdown', onPauseClick);
  }

  updateScore(score: number): void {
    this.scoreText.setText(score.toString());
    
    this.scene.tweens.add({
      targets: this.scoreText,
      scale: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }

  loseLife(lifeIndex: number): void {
    const lostLifeIcon = this.livesIcons[lifeIndex];
    if (!lostLifeIcon) return;

    this.scene.tweens.add({
      targets: lostLifeIcon,
      alpha: 0.2,
      scale: 0.8,
      duration: 300,
      ease: 'Back.easeIn'
    });

    const redX = this.scene.add.graphics();
    redX.lineStyle(8, 0xFF0000, 1);
    redX.lineBetween(lostLifeIcon.x - 20, lostLifeIcon.y - 20, lostLifeIcon.x + 20, lostLifeIcon.y + 20);
    redX.lineBetween(lostLifeIcon.x - 20, lostLifeIcon.y + 20, lostLifeIcon.x + 20, lostLifeIcon.y - 20);
    redX.setDepth(21);

    this.scene.tweens.add({
      targets: redX,
      alpha: 0,
      duration: 1000,
      onComplete: () => redX.destroy()
    });
  }

  resetLives(): void {
    this.livesIcons.forEach(icon => {
      icon.setAlpha(1);
      icon.setScale(1);
    });
  }

  pulsePauseButton(): void {
    this.scene.tweens.add({
      targets: this.pauseButton,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }
}

