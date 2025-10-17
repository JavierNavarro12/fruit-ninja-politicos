import Phaser from 'phaser';

interface ModeConfig {
  x: number;
  y: number;
  color: number;
  label: string;
  fruit: string;
  special?: boolean;
}

export class GameModeCircles {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(onModeSelected: (mode: string) => void): void {
    const { width, height } = this.scene.scale;
    const centerY = height * 0.5;
    
    // Posiciones más separadas para evitar solapamiento
    const positions: ModeConfig[] = [
      { x: width * 0.32, y: centerY - 60, color: 0x4CAF50, label: 'CLÁSICO', fruit: '🍉' },
      { x: width * 0.5, y: centerY - 100, color: 0xFFA500, label: 'PRÓXIMO EVENTO', fruit: '🔥', special: true },
      { x: width * 0.68, y: centerY - 60, color: 0xFFEB3B, label: 'MULTIJUGADOR', fruit: '🍋' },
      { x: width * 0.37, y: centerY + 160, color: 0xF44336, label: 'ZEN', fruit: '🍎' },
      { x: width * 0.63, y: centerY + 160, color: 0xFFD700, label: 'ARCADE', fruit: '🍌' }
    ];

    positions.forEach((pos, index) => {
      this.scene.time.delayedCall(index * 150, () => {
        this.createModeCircle(pos, onModeSelected);
      });
    });
  }

  private createModeCircle(config: ModeConfig, onModeSelected: (mode: string) => void): void {
    const container = this.scene.add.container(config.x, config.y);
    container.setScale(0);

    const ringRadius = config.special ? 100 : 85;
    
    // Anillo exterior
    const ring = this.scene.add.graphics();
    ring.lineStyle(config.special ? 12 : 8, config.color, 1);
    ring.strokeCircle(0, 0, ringRadius);
    container.add(ring);

    // Anillo interior giratorio
    const innerRing = this.scene.add.graphics();
    innerRing.lineStyle(4, 0xFFFFFF, 0.6);
    innerRing.strokeCircle(0, 0, ringRadius - 15);
    container.add(innerRing);

    // Círculo principal
    const mainCircle = this.scene.add.circle(0, 0, 65, config.color);
    mainCircle.setStrokeStyle(5, 0xFFFFFF, 1);
    container.add(mainCircle);

    // Highlight
    const highlight = this.scene.add.circle(0, -10, 65, 0xFFFFFF, 0.2);
    container.add(highlight);

    // Emoji
    const fruitText = this.scene.add.text(0, 0, config.fruit, {
      fontSize: config.special ? '50px' : '42px'
    }).setOrigin(0.5);
    container.add(fruitText);

    // Label
    const labelText = this.scene.add.text(0, ringRadius + 25, config.label, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: config.special ? '20px' : '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    labelText.setStroke('#000000', 4);
    container.add(labelText);

    // Interactividad
    this.setupInteractions(mainCircle, container, ring, config.special, () => onModeSelected(config.label));

    // Animaciones
    this.setupAnimations(container, innerRing, mainCircle, config.special);
  }

  private setupInteractions(
    mainCircle: Phaser.GameObjects.Arc,
    container: Phaser.GameObjects.Container,
    ring: Phaser.GameObjects.Graphics,
    special: boolean | undefined,
    onClick: () => void
  ): void {
    const hitArea = new Phaser.Geom.Circle(0, 0, 70);
    mainCircle.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

    mainCircle.on('pointerover', () => {
      this.scene.tweens.add({
        targets: container,
        scale: 1.15,
        duration: 200,
        ease: 'Back.easeOut'
      });

      this.scene.tweens.add({
        targets: ring,
        alpha: 0.5,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
    });

    mainCircle.on('pointerout', () => {
      this.scene.tweens.killTweensOf(container);
      this.scene.tweens.killTweensOf(ring);
      this.scene.tweens.add({
        targets: container,
        scale: 1,
        duration: 200,
        ease: 'Back.easeIn'
      });
      ring.setAlpha(1);
    });

    mainCircle.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: container,
        scale: 0.9,
        duration: 100,
        yoyo: true,
        onComplete: onClick
      });
    });
  }

  private setupAnimations(
    container: Phaser.GameObjects.Container,
    innerRing: Phaser.GameObjects.Graphics,
    mainCircle: Phaser.GameObjects.Arc,
    special: boolean | undefined
  ): void {
    // Entrada
    this.scene.tweens.add({
      targets: container,
      scale: 1,
      duration: 500,
      ease: 'Elastic.easeOut'
    });

    // Rotación
    this.scene.tweens.add({
      targets: innerRing,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    });

    // Respiración para especiales
    if (special) {
      this.scene.tweens.add({
        targets: mainCircle,
        scale: 1.1,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
}

