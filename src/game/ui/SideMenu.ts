import Phaser from 'phaser';

interface ButtonConfig {
  label: string;
  icon: string;
  color: number;
  badge?: string;
  glow?: boolean;
}

export class SideMenu {
  private scene: Phaser.Scene;
  private onArsenal?: () => void;

  constructor(scene: Phaser.Scene, onArsenal?: () => void) {
    this.scene = scene;
    this.onArsenal = onArsenal;
  }

  create(): void {
    const height = this.scene.scale.height;
    const menuX = 100;
    const startY = height * 0.25;
    const spacing = 75;

    const buttons: ButtonConfig[] = [
      { label: 'MISIONES', icon: '🎯', color: 0xE74C3C },
      { label: 'RECOMPENSAS', icon: '🎁', color: 0xF39C12, badge: '9' },
      { label: 'TIENDA', icon: '🏪', color: 0x3498DB },
      { label: '¡GRATIS!', icon: '✨', color: 0x2ECC71, glow: true },
      { label: 'ARSENAL', icon: '⚔️', color: 0x9B59B6 }
    ];

    buttons.forEach((btn, index) => {
      const onClick = btn.label === 'ARSENAL' ? this.onArsenal : undefined;
      this.createSideButton(menuX, startY + (index * spacing), btn, onClick);
    });

    this.createSideButton(menuX, height - 100, {
      label: 'OTROS JUEGOS',
      icon: '🎮',
      color: 0x34495E
    });
  }

  private createSideButton(x: number, y: number, config: ButtonConfig, onClick?: () => void): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Fondo
    const bg = this.scene.add.graphics();
    bg.fillStyle(config.color, 0.95);
    bg.fillRoundedRect(-90, -30, 180, 60, 12);
    bg.lineStyle(3, 0xFFFFFF, 0.8);
    bg.strokeRoundedRect(-90, -30, 180, 60, 12);
    container.add(bg);

    // Sombra
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-88, -26, 180, 60, 12);
    container.add(shadow);
    container.sendToBack(shadow);

    // Icono
    const iconText = this.scene.add.text(-65, 0, config.icon, {
      fontSize: '28px'
    }).setOrigin(0.5);
    container.add(iconText);

    // Texto - mejor centrado
    const text = this.scene.add.text(0, 0, config.label, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    container.add(text);

    // Badge
    if (config.badge) {
      this.createBadge(container, config.badge);
    }

    // Efecto de brillo
    if (config.glow) {
      this.scene.tweens.add({
        targets: bg,
        alpha: 0.7,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Interactividad
    this.setupInteractions(bg, container, x, y, onClick);

    // Animación de entrada
    this.animateEntry(container, x);
    return container;
  }

  private createBadge(container: Phaser.GameObjects.Container, badge: string): void {
    const badgeBg = this.scene.add.circle(70, -20, 15, 0xFF0000);
    const badgeText = this.scene.add.text(70, -20, badge, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(badgeBg);
    container.add(badgeText);
  }

  private setupInteractions(
    bg: Phaser.GameObjects.Graphics,
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    onClick?: () => void
  ): void {
    const hitArea = new Phaser.Geom.Rectangle(-90, -30, 180, 60);
    bg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    bg.on('pointerover', () => {
      this.scene.input.setDefaultCursor('pointer');
      this.scene.tweens.add({
        targets: container,
        x: x + 10,
        scale: 1.05,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });

    bg.on('pointerout', () => {
      this.scene.input.setDefaultCursor('default');
      this.scene.tweens.add({
        targets: container,
        x: x,
        scale: 1,
        duration: 200
      });
    });

    bg.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          if (onClick) onClick();
        }
      });
    });
  }

  private animateEntry(container: Phaser.GameObjects.Container, x: number): void {
    container.setAlpha(0);
    container.setX(x - 50);
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      x: x,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }
}

