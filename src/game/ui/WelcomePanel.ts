import Phaser from 'phaser';

export class WelcomePanel {
  private scene: Phaser.Scene;
  private panel!: Phaser.GameObjects.Graphics;
  private welcomeText!: Phaser.GameObjects.Text;
  private loadingText!: Phaser.GameObjects.Text;
  private dots: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    const { width, height } = this.scene.scale;
    
    this.createPanel(width, height);
    this.createWelcomeText(width, height);
    this.createLoadingText(width, height);
    this.startDotAnimation();
  }

  private createPanel(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const panelWidth = Math.min(width * 0.6, 500);
    const panelHeight = Math.min(height * 0.3, 250);

    this.panel = this.scene.add.graphics();
    this.panel.fillStyle(0x2c2c2c, 0.95);
    this.panel.fillRoundedRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight, 15);
    
    this.panel.lineStyle(3, 0x4a4a4a, 1);
    this.panel.strokeRoundedRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight, 15);
  }

  private createWelcomeText(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const panelHeight = Math.min(height * 0.3, 250);
    const fontSize = Math.min(width * 0.03, 28);

    this.welcomeText = this.scene.add.text(centerX, centerY - panelHeight * 0.2, 'Bienvenido a Ninja Fruit Politics', {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  private createLoadingText(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2 + height * 0.02;
    const fontSize = Math.min(width * 0.02, 20);

    this.loadingText = this.scene.add.text(centerX - width * 0.03, centerY, 'Loading', {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#ffffff'
    }).setOrigin(0.5);

    // Crear puntos
    const textWidth = this.loadingText.width;
    const dotSpacing = fontSize * 0.8;
    const startX = centerX - width * 0.03 + textWidth / 2 + fontSize * 0.5;
    
    for (let i = 0; i < 3; i++) {
      const dot = this.scene.add.text(startX + (i * dotSpacing), centerY, '.', {
        fontFamily: 'Arial, sans-serif',
        fontSize: `${fontSize}px`,
        color: '#ffffff'
      }).setOrigin(0.5);
      this.dots.push(dot);
    }
  }

  private startDotAnimation(): void {
    this.dots.forEach((dot, index) => {
      this.scene.tweens.add({
        targets: dot,
        alpha: 0,
        duration: 500,
        yoyo: true,
        repeat: -1,
        delay: index * 300
      });
    });
  }

  hide(onComplete: () => void): void {
    this.scene.tweens.add({
      targets: [this.panel, this.welcomeText, this.loadingText, ...this.dots],
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.panel.destroy();
        this.welcomeText.destroy();
        this.loadingText.destroy();
        this.dots.forEach(dot => dot.destroy());
        onComplete();
      }
    });
  }
}

