import Phaser from 'phaser';

export class DifficultyManager {
  private scene: Phaser.Scene;
  private timer?: Phaser.Time.TimerEvent;
  private currentSpawnDelay: number = 1000;
  private minSpawnDelay: number = 300;
  private currentMinSpeed: number = -1000;
  private currentMaxSpeed: number = -1400;
  private onDifficultyIncrease?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  start(onIncrease?: () => void): void {
    this.onDifficultyIncrease = onIncrease;
    
    this.timer = this.scene.time.addEvent({
      delay: 10000,
      loop: true,
      callback: this.increase.bind(this),
      callbackScope: this
    });
  }

  private increase(): void {
    // Reducir delay entre spawns
    if (this.currentSpawnDelay > this.minSpawnDelay) {
      this.currentSpawnDelay -= 50;
      this.currentSpawnDelay = Math.max(this.currentSpawnDelay, this.minSpawnDelay);
    }

    // Aumentar velocidad vertical
    if (this.currentMinSpeed > -1600) {
      this.currentMinSpeed -= 50;
      this.currentMaxSpeed -= 50;
    }

    // Notificar cambio
    if (this.onDifficultyIncrease) {
      this.onDifficultyIncrease();
    }
  }

  pause(): void {
    if (this.timer) {
      this.timer.paused = true;
    }
  }

  resume(): void {
    if (this.timer) {
      this.timer.paused = false;
    }
  }

  reset(): void {
    this.currentSpawnDelay = 1000;
    this.currentMinSpeed = -1000;
    this.currentMaxSpeed = -1400;

    if (this.timer) {
      this.timer.destroy();
    }

    this.start(this.onDifficultyIncrease);
  }

  destroy(): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = undefined;
    }
  }

  getSpawnDelay(): number {
    return this.currentSpawnDelay;
  }

  getSpeedRange(): { min: number; max: number } {
    return {
      min: this.currentMinSpeed,
      max: this.currentMaxSpeed
    };
  }
}

