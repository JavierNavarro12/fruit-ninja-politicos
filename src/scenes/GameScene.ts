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
      // Fruta normal - partir en dos mitades con fisica y desvanecimiento
      const dir = this.sliceManager.getLastDirection() || new Phaser.Math.Vector2(1, 0);

      // Ocultar el original
      target.setVisible(false);
      target.data.set('slicable', false);

      // Efecto de corte
      this.sliceManager.createSliceEffect(target.x, target.y);

      // Crear dos mitades como semicírculos estilizados
      const radius = 40;
      const color = (target.fillColor !== undefined ? target.fillColor : 0x00ff00) as number;
      const normal = new Phaser.Math.Vector2(-dir.y, dir.x); // perpendicular

      const halfA = this.add.graphics();
      const halfB = this.add.graphics();

      halfA.fillStyle(color, 1);
      halfB.fillStyle(color, 1);

      // Dibujar semicírculos opuestos a lo largo de la normal
      const segments = 32;
      const angleStartA = Math.atan2(normal.y, normal.x) - Math.PI / 2;
      const angleEndA = angleStartA + Math.PI;
      const angleStartB = angleEndA;
      const angleEndB = angleStartA + 2 * Math.PI;

      halfA.beginPath();
      halfA.moveTo(0, 0);
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const a = angleStartA + t * (angleEndA - angleStartA);
        halfA.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      }
      halfA.closePath();
      halfA.fillPath();

      halfB.beginPath();
      halfB.moveTo(0, 0);
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const a = angleStartB + t * (angleEndB - angleStartB);
        halfB.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      }
      halfB.closePath();
      halfB.fillPath();

      halfA.x = target.x;
      halfA.y = target.y;
      halfB.x = target.x;
      halfB.y = target.y;

      // Añadir cuerpos de física simples
      this.physics.add.existing(halfA as any);
      this.physics.add.existing(halfB as any);

      const bodyA = (halfA as any).body as Phaser.Physics.Arcade.Body;
      const bodyB = (halfB as any).body as Phaser.Physics.Arcade.Body;

      // Emular masa ligera y colision mínima
      bodyA.setAllowGravity(true);
      bodyB.setAllowGravity(true);
      bodyA.setCircle(radius / 2);
      bodyB.setCircle(radius / 2);
      bodyA.setOffset(-radius / 2, -radius / 2);
      bodyB.setOffset(-radius / 2, -radius / 2);

      const impulse = 400;
      const tangent = new Phaser.Math.Vector2(dir.x, dir.y).normalize();
      const split = new Phaser.Math.Vector2(-dir.y, dir.x).normalize();

      // Velocidad base heredada del objeto original si existe
      const originalBody = target.body as Phaser.Physics.Arcade.Body | undefined;
      const baseVX = originalBody ? originalBody.velocity.x : 0;
      const baseVY = originalBody ? originalBody.velocity.y : 0;

      bodyA.setVelocity(baseVX + tangent.x * impulse + split.x * 120, baseVY + tangent.y * impulse + split.y * 120);
      bodyB.setVelocity(baseVX + tangent.x * impulse - split.x * 120, baseVY + tangent.y * impulse - split.y * 120);

      // Rotaciones opuestas
      bodyA.setAngularVelocity(300);
      bodyB.setAngularVelocity(-300);

      // Sombra de jugo (pequeña línea) en el borde de corte
      const juice = this.add.graphics();
      juice.lineStyle(4, 0xFFFFFF, 0.2);
      const cutLen = radius * 1.4;
      const cx1 = target.x - normal.x * (cutLen / 2);
      const cy1 = target.y - normal.y * (cutLen / 2);
      const cx2 = target.x + normal.x * (cutLen / 2);
      const cy2 = target.y + normal.y * (cutLen / 2);
      juice.lineBetween(cx1, cy1, cx2, cy2);
      this.tweens.add({ targets: juice, alpha: 0, duration: 300, onComplete: () => juice.destroy() });

      // Desvanecer y limpiar mitades (más lento para que se vean más tiempo)
      this.tweens.add({ targets: [halfA, halfB], alpha: 0, duration: 2000, ease: 'Cubic.easeOut', onComplete: () => {
        halfA.destroy();
        halfB.destroy();
      }});

      // Puntaje y progreso
      this.score += 1;
      this.gameUI.updateScore(this.score);
      progressManager.addExperience(10);
      this.events.emit('update-xp-bar');
      this.events.emit('update-xp-hud');

      // Destruir objeto original con sus visuales
      this.bombManager.destroyWithVisuals(target);
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
