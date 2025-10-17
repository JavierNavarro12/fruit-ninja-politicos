import Phaser from 'phaser';

export class LoadingBar {
  private scene: Phaser.Scene;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private progressValue: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.createProgressBar(width, height);
  }

  private createProgressBar(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2 + height * 0.08;
    const barWidth = Math.min(width * 0.3, 250);
    const barHeight = Math.min(height * 0.04, 35);

    // Fondo de la barra
    this.progressBox = this.scene.add.graphics();
    this.progressBox.fillStyle(0x212121, 1);
    this.progressBox.fillRoundedRect(centerX - barWidth/2, centerY - barHeight/2, barWidth, barHeight, barHeight/2);
    
    // Sombra interna
    this.progressBox.fillStyle(0x0c0c0c, 0.3);
    this.progressBox.fillRoundedRect(centerX - barWidth/2 + 2, centerY - barHeight/2 + 2, barWidth - 4, barHeight - 4, (barHeight-4)/2);

    // Barra de progreso
    this.progressBar = this.scene.add.graphics();
  }

  startAnimation(duration: number, onComplete: () => void): void {
    this.scene.tweens.add({
      targets: this,
      progressValue: 1,
      duration: duration,
      ease: 'Power2.easeOut',
      onUpdate: () => {
        this.updateProgressBar();
      },
      onComplete: onComplete
    });
  }

  private updateProgressBar(): void {
    const { width, height } = this.scene.scale;
    const centerX = width / 2;
    const centerY = height / 2 + height * 0.08;
    const barWidth = Math.min(width * 0.3, 250);
    const barHeight = Math.min(height * 0.03, 25);
    const progressWidth = (barWidth - 10) * this.progressValue;

    this.progressBar.clear();
    
    // Gradiente naranja a amarillo
    this.progressBar.fillStyle(0xde4a0f, 1);
    this.progressBar.fillRoundedRect(centerX - barWidth/2 + 5, centerY - barHeight/2, progressWidth, barHeight, barHeight/2);
    
    this.progressBar.fillStyle(0xf9c74f, 0.8);
    this.progressBar.fillRoundedRect(centerX - barWidth/2 + 5, centerY - barHeight/2, progressWidth, barHeight/2, barHeight/4);
  }

  hide(onComplete: () => void): void {
    this.scene.tweens.add({
      targets: [this.progressBox, this.progressBar],
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.progressBox.destroy();
        this.progressBar.destroy();
        onComplete();
      }
    });
  }
}

