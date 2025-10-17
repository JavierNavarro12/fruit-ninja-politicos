import Phaser from 'phaser';

export class SettingsButton {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    const width = this.scene.scale.width;
    const x = width - 50;
    const y = 50;

    // Crear el botón en un container para mejor control de rotación
    const container = this.scene.add.container(x, y);

    const btn = this.scene.add.graphics();
    btn.fillStyle(0xFF6B35, 0.9);
    btn.fillRoundedRect(-35, -35, 70, 70, 10);
    btn.lineStyle(3, 0xFFFFFF);
    btn.strokeRoundedRect(-35, -35, 70, 70, 10);

    // Líneas del menú hamburguesa (centradas)
    btn.lineStyle(5, 0xFFFFFF, 1);
    btn.lineBetween(-20, -12, 20, -12);
    btn.lineBetween(-20, 0, 20, 0);
    btn.lineBetween(-20, 12, 20, 12);

    container.add(btn);

    // Hacer interactivo el container completo
    btn.setInteractive(new Phaser.Geom.Rectangle(-35, -35, 70, 70), Phaser.Geom.Rectangle.Contains);

    btn.on('pointerover', () => {
      this.scene.tweens.add({
        targets: container,
        angle: 180,
        duration: 300,
        ease: 'Back.easeOut'
      });
    });

    btn.on('pointerout', () => {
      this.scene.tweens.add({
        targets: container,
        angle: 0,
        duration: 300
      });
    });
  }
}

