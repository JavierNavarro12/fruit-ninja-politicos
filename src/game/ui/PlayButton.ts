import Phaser from 'phaser';

export class PlayButton {
  private scene: Phaser.Scene;
  private buttonBg?: Phaser.GameObjects.Graphics;
  private shadowLayers: Phaser.GameObjects.Graphics[] = [];
  private playIcon?: Phaser.GameObjects.Graphics;
  private playText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(onClick: () => void): void {
    const { width, height } = this.scene.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.createButton(centerX, centerY, onClick);
  }

  private createButton(x: number, y: number, onClick: () => void): void {
    const { width, height } = this.scene.scale;
    const buttonWidth = Math.min(width * 0.15, 180);
    const buttonHeight = Math.min(height * 0.08, 60);
    const borderRadius = 3;

    // Crear sombras
    this.createShadows(x, y, buttonWidth, buttonHeight, borderRadius);

    // Fondo del botón
    this.buttonBg = this.scene.add.graphics();
    this.buttonBg.fillStyle(0x15ccbe, 1);
    this.buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
    this.buttonBg.lineStyle(1, 0x0f988e, 1);
    this.buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);

    // Highlight
    const highlight = this.scene.add.graphics();
    highlight.fillStyle(0xffffff, 0.1);
    highlight.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight/2, borderRadius);
    this.shadowLayers.push(highlight);

    // Icono de play
    this.createPlayIcon(x, y, buttonWidth, buttonHeight);

    // Texto
    this.createPlayText(x, y, buttonWidth, buttonHeight);

    // Interactividad
    this.setupInteractions(x, y, buttonWidth, buttonHeight, onClick);

    // Animación de entrada
    this.animateEntry();
  }

  private createShadows(x: number, y: number, buttonWidth: number, buttonHeight: number, borderRadius: number): void {
    const outerShadow = this.scene.add.graphics();
    outerShadow.fillStyle(0x000000, 0.1);
    outerShadow.fillRoundedRect(x - buttonWidth/2 + 10, y - buttonHeight/2 + 20, buttonWidth, buttonHeight, borderRadius);
    this.shadowLayers.push(outerShadow);

    const midShadow = this.scene.add.graphics();
    midShadow.fillStyle(0x000000, 0.1);
    midShadow.fillRoundedRect(x - buttonWidth/2 + 5, y - buttonHeight/2 + 10, buttonWidth, buttonHeight, borderRadius);
    this.shadowLayers.push(midShadow);

    const closeShadow = this.scene.add.graphics();
    closeShadow.fillStyle(0x000000, 0.2);
    closeShadow.fillRoundedRect(x - buttonWidth/2 + 3, y - buttonHeight/2 + 2, buttonWidth, buttonHeight, borderRadius);
    this.shadowLayers.push(closeShadow);

    const borderShadow = this.scene.add.graphics();
    borderShadow.fillStyle(0x0f988e, 1);
    borderShadow.fillRoundedRect(x - buttonWidth/2 + 3, y - buttonHeight/2 + 3, buttonWidth, buttonHeight, borderRadius);
    this.shadowLayers.push(borderShadow);
  }

  private createPlayIcon(x: number, y: number, buttonWidth: number, buttonHeight: number): void {
    const iconSize = Math.min(buttonHeight * 0.4, 20);
    this.playIcon = this.scene.add.graphics();
    this.playIcon.fillStyle(0xffffff, 1);
    this.playIcon.beginPath();
    this.playIcon.moveTo(0, -iconSize/2);
    this.playIcon.lineTo(0, iconSize/2);
    this.playIcon.lineTo(iconSize, 0);
    this.playIcon.closePath();
    this.playIcon.fillPath();
    this.playIcon.setPosition(x - buttonWidth * 0.25, y);
  }

  private createPlayText(x: number, y: number, buttonWidth: number, buttonHeight: number): void {
    const fontSize = Math.min(buttonHeight * 0.4, 18);
    this.playText = this.scene.add.text(x + buttonWidth * 0.1, y, 'Play', {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);
  }

  private setupInteractions(x: number, y: number, buttonWidth: number, buttonHeight: number, onClick: () => void): void {
    if (!this.buttonBg) return;

    this.buttonBg.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

    this.buttonBg.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.playText,
        x: x + buttonWidth * 0.8,
        alpha: 0,
        duration: 500,
        ease: 'Power2'
      });
      
      this.scene.tweens.add({
        targets: this.playIcon,
        x: x,
        duration: 500,
        ease: 'Power2'
      });
    });

    this.buttonBg.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this.playText,
        x: x + buttonWidth * 0.1,
        alpha: 1,
        duration: 500,
        ease: 'Power2'
      });
      
      this.scene.tweens.add({
        targets: this.playIcon,
        x: x - buttonWidth * 0.25,
        duration: 500,
        ease: 'Power2'
      });
    });

    this.buttonBg.on('pointerdown', () => {
      if (!this.buttonBg) return;
      this.buttonBg.setY(this.buttonBg.y + 3);
      this.shadowLayers.forEach(shadow => shadow.setY(shadow.y + 3));
      this.playIcon?.setY((this.playIcon.y || 0) + 3);
      this.playText?.setY((this.playText.y || 0) + 3);
      this.shadowLayers.forEach(shadow => shadow.setAlpha(0));
    });

    this.buttonBg.on('pointerup', () => {
      if (!this.buttonBg) return;
      this.buttonBg.setY(this.buttonBg.y - 3);
      this.shadowLayers.forEach(shadow => shadow.setY(shadow.y - 3));
      this.playIcon?.setY((this.playIcon.y || 0) - 3);
      this.playText?.setY((this.playText.y || 0) - 3);
      this.shadowLayers.forEach(shadow => shadow.setAlpha(1));
      onClick();
    });
  }

  private animateEntry(): void {
    const buttonElements = [this.buttonBg, ...this.shadowLayers, this.playIcon, this.playText].filter(Boolean);
    buttonElements.forEach(element => element?.setAlpha(0));
    
    this.scene.tweens.add({
      targets: buttonElements,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
  }
}

