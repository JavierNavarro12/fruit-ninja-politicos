import Phaser from 'phaser';
import { GameUI } from '../game/ui/GameUI';
import { PauseMenu } from '../game/ui/PauseMenu';
import { DifficultyManager } from '../game/managers/DifficultyManager';
import { FruitSpawner } from '../game/managers/FruitSpawner';
import { SliceManager } from '../game/managers/SliceManager';
import { BombManager } from '../game/managers/BombManager';
import { BackgroundEffect } from '../game/effects/BackgroundEffect';
import { progressManager } from '../game/managers/ProgressManager';

export class GameScene extends Phaser.Scene {
  // Game state
  private score: number = 0;
  private lives: number = 3;
  private isPaused: boolean = false;

  // Módulos
  private gameUI!: GameUI;
  private pauseMenu!: PauseMenu;
  private difficultyManager!: DifficultyManager;
  private fruitSpawner!: FruitSpawner;
  private sliceManager!: SliceManager;
  private bombManager!: BombManager;

  constructor() {
    super('game');
  }

  create(): void {
    // Crear fondo
    BackgroundEffect.createWoodenBackground(this);

    // Inicializar módulos
    this.initializeModules();

    // Iniciar juego
    this.startGame();
  }

  private initializeModules(): void {
    // UI
    this.gameUI = new GameUI(this);
    this.gameUI.create(() => this.togglePause());

    // Menú de pausa
    this.pauseMenu = new PauseMenu(this);

    // Sistema de dificultad
    this.difficultyManager = new DifficultyManager(this);

    // Spawner de frutas
    this.fruitSpawner = new FruitSpawner(this);

    // Manager de cortes
    this.sliceManager = new SliceManager(this);
    this.sliceManager.setup();

    // Manager de bombas
    this.bombManager = new BombManager(this);
  }

  private startGame(): void {
    // Iniciar spawner
    this.fruitSpawner.start(this.difficultyManager.getSpawnDelay());

    // Iniciar sistema de dificultad
    this.difficultyManager.start(() => {
      // Callback cuando aumenta la dificultad
      this.fruitSpawner.updateDelay(
        this.difficultyManager.getSpawnDelay(),
        this.difficultyManager.getMinSpeed(),
        this.difficultyManager.getMaxSpeed()
      );
      this.gameUI.pulsePauseButton();
    });
  }

  update(): void {
    if (this.isPaused) return;

    // Actualizar slice manager
    this.sliceManager.update();

    // Detectar colisiones
    const bodies = this.physics.world.bodies.entries as Phaser.Physics.Arcade.Body[];
    this.sliceManager.checkCollisions(bodies, (target) => this.onFruitSliced(target));

    // Actualizar posicion de elementos visuales de bombas
    this.bombManager.updateVisuals(bodies);

    // Detectar frutas perdidas
    this.checkMissedFruits(bodies);
  }

  private onFruitSliced(target: any): void {
    target.data.set('slicable', false);
    const isBomb = target.data.get('isBomb');

    if (isBomb) {
      // BOMBA CORTADA - Explosion y Game Over
      this.bombManager.createExplosion(target.x, target.y);
      this.bombManager.destroyWithVisuals(target);
      
      // Game Over inmediato
      this.lives = 0;
      this.gameOver();
    } else {
      // Fruta normal - comportamiento habitual
      target.setVisible(false);

      // Efectos visuales
      this.sliceManager.createSliceEffect(target.x, target.y);

      // Incrementar score
      this.score += 1;
      this.gameUI.updateScore(this.score);

      // Otorgar experiencia por corte y actualizar barras
      progressManager.addExperience(10);
      this.events.emit('update-xp-bar');
      this.events.emit('update-xp-hud');

      // Destruir
      target.destroy();
    }
  }

  private checkMissedFruits(bodies: Phaser.Physics.Arcade.Body[]): void {
    for (const body of bodies) {
      const go = body.gameObject as any;
      if (!go || !go.active || !go.data?.get('slicable')) continue;

      const isBomb = go.data.get('isBomb');

      // Salió por los laterales - sin penalización
      if ((go.x < -100 || go.x > this.scale.width + 100) && !go.data.get('missed')) {
        go.data.set('missed', true);
        this.bombManager.destroyWithVisuals(go);
        continue;
      }

      // Cayó por debajo - perder vida si estaba visible (pero no si es bomba)
      if (go.y > this.scale.height + 50 && !go.data.get('missed')) {
        if (go.x >= -50 && go.x <= this.scale.width + 50) {
          go.data.set('missed', true);
          // Solo perder vida si NO es una bomba (las bombas que caen no hacen daño)
          if (!isBomb) {
            this.loseLife();
          }
        }
        this.bombManager.destroyWithVisuals(go);
      }
    }
  }

  private loseLife(): void {
    if (this.lives <= 0) return;

    this.lives -= 1;
    this.gameUI.loseLife(this.lives);

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.fruitSpawner.pause();
      this.difficultyManager.pause();
      
      this.pauseMenu.show(
        () => this.togglePause(),
        () => this.restartGame(),
        () => this.scene.start('menu')
      );
    } else {
      this.physics.resume();
      this.fruitSpawner.resume();
      this.difficultyManager.resume();
      this.pauseMenu.hide();
    }
  }

  private restartGame(): void {
    // Reiniciar estado
    this.score = 0;
    this.lives = 3;
    this.isPaused = false;

    // Limpiar frutas activas y sus elementos visuales
    this.physics.world.bodies.entries.forEach((body: any) => {
      const go = body.gameObject;
      if (go && go.active) {
        this.bombManager.destroyWithVisuals(go);
      }
    });

    // Reiniciar UI
    this.gameUI.updateScore(0);
    this.gameUI.resetLives();

    // Detener managers
    this.fruitSpawner.destroy();
    this.difficultyManager.destroy();
    
    // Resetear valores iniciales
    this.difficultyManager.reset();
    
    // Limpiar listeners/canales de slice anteriores
    this.sliceManager.teardown();
    this.sliceManager.setup();

    // Reiniciar juego (igual que startGame)
    this.fruitSpawner.start(this.difficultyManager.getSpawnDelay());
    
    this.difficultyManager.start(() => {
      this.fruitSpawner.updateDelay(
        this.difficultyManager.getSpawnDelay(),
        this.difficultyManager.getMinSpeed(),
        this.difficultyManager.getMaxSpeed()
      );
      this.gameUI.pulsePauseButton();
    });

    // Reanudar fisica
    this.physics.resume();
    this.pauseMenu.hide();
  }

  private gameOver(): void {
    this.isPaused = true;
    this.physics.pause();
    this.fruitSpawner.pause();
    this.difficultyManager.pause();

    const { width, height } = this.scale;

    // Contenedor para TODO el UI de Game Over (para poder limpiarlo fácil)
    const ui = this.add.container(0, 0);
    ui.setDepth(200);

    // Overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    ui.add(overlay);

    // Texto Game Over
    const gameOverText = this.add.text(width / 2, height / 2 - 80, 'GAME OVER', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '72px',
      color: '#FF0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    gameOverText.setStroke('#8B0000', 6);
    gameOverText.setShadow(5, 5, '#000000', 10);
    ui.add(gameOverText);

    // Puntuación final
    const finalScore = this.add.text(width / 2, height / 2, `Puntuación: ${this.score}`, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '36px',
      color: '#FFD93D',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    finalScore.setStroke('#8B4513', 4);
    ui.add(finalScore);

    // Botón de reiniciar
    const restartBtn = this.add.text(width / 2, height / 2 + 80, '↻ REINTENTAR', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '32px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#27AE60',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ui.add(restartBtn);

    restartBtn.on('pointerdown', () => {
      ui.destroy();
      this.restartGame();
    });

    // Botón de menú
    const menuBtn = this.add.text(width / 2, height / 2 + 150, '↩ MENÚ', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '28px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#E74C3C',
      padding: { x: 30, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ui.add(menuBtn);

    menuBtn.on('pointerdown', () => {
      this.scene.start('menu');
    });

    // Mostrar desbloqueos si subiste de nivel durante la partida
    const unlocks = progressManager.consumePendingUnlocks();
    if (unlocks.length > 0) {
      const panel = this.add.graphics();
      const panelWidth = Math.min(500, width * 0.8);
      const panelHeight = 160 + unlocks.length * 40;
      panel.fillStyle(0x2c2c2c, 0.95);
      panel.fillRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight - 220, panelWidth, panelHeight, 12);
      panel.lineStyle(3, 0x4a4a4a, 1);
      panel.strokeRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight - 220, panelWidth, panelHeight, 12);
      ui.add(panel);

      const title = this.add.text(width / 2, height / 2 - panelHeight - 200, '¡NUEVOS DESBLOQUEOS!', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '28px',
        color: '#FFD93D',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      ui.add(title);

      unlocks.forEach((u, i) => {
        const text = this.add.text(width / 2, height / 2 - panelHeight - 160 + i * 40, `• ${u.label}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          color: '#ffffff'
        }).setOrigin(0.5);
        ui.add(text);
      });

      const arsenalBtn = this.add.text(width / 2, height / 2 - panelHeight - 80, 'VER ARSENAL', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '20px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        backgroundColor: '#27AE60',
        padding: { x: 20, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      ui.add(arsenalBtn);

      arsenalBtn.on('pointerdown', () => {
        this.scene.start('menu');
      });
    }
  }
}
