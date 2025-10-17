import Phaser from 'phaser';

export interface SpawnedFruit {
  sprite: Phaser.GameObjects.Arc;
  body: Phaser.Physics.Arcade.Body;
}

export class FruitSpawner {
  private scene: Phaser.Scene;
  private timer?: Phaser.Time.TimerEvent;
  private isPaused: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  start(delay: number, onSpawn?: (fruit: SpawnedFruit) => void): void {
    this.timer = this.scene.time.addEvent({
      delay: delay,
      loop: true,
      callback: () => {
        if (!this.isPaused) {
          const fruit = this.spawn();
          if (onSpawn) {
            onSpawn(fruit);
          }
        }
      },
      callbackScope: this
    });
  }

  updateDelay(newDelay: number): void {
    if (this.timer) {
      this.timer.destroy();
    }
    this.start(newDelay);
  }

  spawn(minSpeed: number = -1000, maxSpeed: number = -1400): SpawnedFruit {
    const x = Phaser.Math.Between(100, this.scene.scale.width - 100);
    const y = this.scene.scale.height + 50;

    const sprite = this.scene.add.circle(x, y, 40, Phaser.Math.Between(0x00FF00, 0xFF00FF)) as any;
    this.scene.physics.add.existing(sprite);
    
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setCircle(40);

    // Velocidad horizontal inteligente
    let vx: number;
    if (x < this.scene.scale.width * 0.3) {
      vx = Phaser.Math.Between(0, 150);
    } else if (x > this.scene.scale.width * 0.7) {
      vx = Phaser.Math.Between(-150, 0);
    } else {
      vx = Phaser.Math.Between(-120, 120);
    }

    const vy = Phaser.Math.Between(minSpeed, maxSpeed);
    body.setVelocity(vx, vy);
    body.setAngularVelocity(Phaser.Math.Between(-300, 300));

    sprite.setData('slicable', true);
    sprite.setData('missed', false);

    return { sprite, body };
  }

  pause(): void {
    this.isPaused = true;
    if (this.timer) {
      this.timer.paused = true;
    }
  }

  resume(): void {
    this.isPaused = false;
    if (this.timer) {
      this.timer.paused = false;
    }
  }

  destroy(): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = undefined;
    }
  }
}

