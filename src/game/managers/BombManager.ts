import Phaser from 'phaser';

export class BombManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  updateVisuals(bodies: Phaser.Physics.Arcade.Body[]): void {
    for (const body of bodies) {
      const go = body.gameObject as any;
      if (!go || !go.active || !go.data) continue;

      const warningCircle = go.data.get('warningCircle');
      const bombEmoji = go.data.get('bombEmoji');

      if (warningCircle && warningCircle.active) {
        warningCircle.setPosition(go.x, go.y);
      }

      if (bombEmoji && bombEmoji.active) {
        bombEmoji.setPosition(go.x, go.y);
        bombEmoji.setRotation(go.rotation);
      }
    }
  }

  createExplosion(x: number, y: number): void {
    // Explosion visual grande
    const explosion = this.scene.add.circle(x, y, 10, 0xFF4500, 1);
    
    // Animacion de explosion
    this.scene.tweens.add({
      targets: explosion,
      radius: 200,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => explosion.destroy()
    });

    // Particulas de fuego
    for (let i = 0; i < 20; i++) {
      const particle = this.scene.add.circle(x, y, 8, Phaser.Math.Between(0xFF0000, 0xFFFF00), 1);
      const angle = (Math.PI * 2 * i) / 20;
      const speed = Phaser.Math.Between(200, 400);
      
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }

    // Shake de camara
    this.scene.cameras.main.shake(500, 0.02);

    // Texto de explosion
    const explosionText = this.scene.add.text(x, y, '💥 BOOM! 💥', {
      fontSize: '48px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: explosionText,
      y: y - 100,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => explosionText.destroy()
    });
  }

  destroyWithVisuals(gameObject: any): void {
    // Destruir elementos visuales si existen
    const warningCircle = gameObject.data.get('warningCircle');
    const bombEmoji = gameObject.data.get('bombEmoji');
    if (warningCircle) warningCircle.destroy();
    if (bombEmoji) bombEmoji.destroy();
    
    gameObject.destroy();
  }
}

