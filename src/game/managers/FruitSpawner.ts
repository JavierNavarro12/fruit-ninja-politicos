import Phaser from 'phaser';

export interface SpawnedFruit {
  sprite: Phaser.GameObjects.Arc;
  body: Phaser.Physics.Arcade.Body;
  isBomb?: boolean;
}

export class FruitSpawner {
  private scene: Phaser.Scene;
  private timer?: Phaser.Time.TimerEvent;
  private isPaused: boolean = false;
  private minSpeed: number = -1000;
  private maxSpeed: number = -1400;
  private onSpawnCallback?: (fruit: SpawnedFruit) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  start(delay: number, onSpawn?: (fruit: SpawnedFruit) => void): void {
    this.onSpawnCallback = onSpawn;
    this.timer = this.scene.time.addEvent({
      delay: delay,
      loop: true,
      callback: () => {
        if (!this.isPaused) {
          this.spawnWave();
        }
      },
      callbackScope: this
    });
  }

  updateDelay(newDelay: number, minSpeed?: number, maxSpeed?: number): void {
    if (minSpeed) this.minSpeed = minSpeed;
    if (maxSpeed) this.maxSpeed = maxSpeed;
    
    if (this.timer) {
      this.timer.destroy();
    }
    this.start(newDelay, this.onSpawnCallback);
  }

  private spawnWave(): void {
    // 70% spawn simple, 30% spawn multiple o con bombas
    const random = Math.random();
    
    if (random < 0.7) {
      // Spawn simple
      const fruit = this.spawnSingle(false);
      if (this.onSpawnCallback) {
        this.onSpawnCallback(fruit);
      }
    } else {
      // Spawn multiple o con bombas
      this.spawnMultiple();
    }
  }

  private spawnMultiple(): void {
    const patterns = [
      { count: 2, bombChance: 0.3 },   // 2 objetos, 30% chance de tener bomba
      { count: 3, bombChance: 0.25 },  // 3 objetos, 25% chance de tener bomba
      { count: 4, bombChance: 0.2 },   // 4 objetos, 20% chance de tener bomba
    ];
    
    const pattern = Phaser.Utils.Array.GetRandom(patterns);
    const spacing = this.scene.scale.width / (pattern.count + 1);
    
    for (let i = 0; i < pattern.count; i++) {
      // Determinar si este objeto es una bomba
      const isBomb = Math.random() < pattern.bombChance;
      
      // Spawn con pequeño delay entre objetos para efecto visual
      this.scene.time.delayedCall(i * 80, () => {
        const x = spacing * (i + 1) + Phaser.Math.Between(-50, 50);
        const fruit = this.spawnSingle(isBomb, x);
        if (this.onSpawnCallback) {
          this.onSpawnCallback(fruit);
        }
      });
    }
  }

  private spawnSingle(isBomb: boolean, xPos?: number): SpawnedFruit {
    const x = xPos !== undefined ? xPos : Phaser.Math.Between(100, this.scene.scale.width - 100);
    const y = this.scene.scale.height + 50;

    // Color segun tipo
    let color: number;
    if (isBomb) {
      color = 0x000000; // Negro para bombas
    } else {
      color = Phaser.Math.Between(0x00FF00, 0xFF00FF);
    }

    const sprite = this.scene.add.circle(x, y, 40, color) as any;
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

    const vy = Phaser.Math.Between(this.minSpeed, this.maxSpeed);
    body.setVelocity(vx, vy);
    body.setAngularVelocity(Phaser.Math.Between(-300, 300));

    sprite.setData('slicable', true);
    sprite.setData('missed', false);
    sprite.setData('isBomb', isBomb);

    // Efecto visual para bombas
    if (isBomb) {
      // Borde rojo pulsante para indicar peligro
      const warningCircle = this.scene.add.circle(0, 0, 45, 0xFF0000, 0);
      warningCircle.setStrokeStyle(3, 0xFF0000, 1);
      sprite.setData('warningCircle', warningCircle);
      
      // Animacion de pulsacion
      this.scene.tweens.add({
        targets: warningCircle,
        alpha: 0.8,
        scale: 1.2,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Emoji de bomba
      const bombEmoji = this.scene.add.text(0, 0, '💣', {
        fontSize: '32px'
      }).setOrigin(0.5);
      sprite.setData('bombEmoji', bombEmoji);
    }

    return { sprite, body, isBomb };
  }

  spawn(minSpeed: number = -1000, maxSpeed: number = -1400): SpawnedFruit {
    return this.spawnSingle(false);
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
    this.isPaused = false;
  }
}

