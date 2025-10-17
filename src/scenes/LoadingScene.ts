import Phaser from 'phaser';
import { WelcomePanel } from '../game/ui/WelcomePanel';
import { LoadingBar } from '../game/ui/LoadingBar';
import { PlayButton } from '../game/ui/PlayButton';

export class LoadingScene extends Phaser.Scene {
  // Módulos
  private welcomePanel!: WelcomePanel;
  private loadingBar!: LoadingBar;
  private playButton!: PlayButton;

  constructor() {
    super('loading');
  }

  preload(): void {
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Inicializar módulos
    this.initializeModules();

    // Crear UI de carga
    this.createLoadingUI();

    // Cargar assets (si los hay)
    this.loadAssets();
  }

  private initializeModules(): void {
    this.welcomePanel = new WelcomePanel(this);
    this.loadingBar = new LoadingBar(this);
    this.playButton = new PlayButton(this);
  }

  private createLoadingUI(): void {
    // Panel de bienvenida
    this.welcomePanel.create();

    // Barra de progreso
    this.loadingBar.create();

    // Iniciar animación de progreso
    this.loadingBar.startAnimation(4000, () => {
      this.onLoadingComplete();
    });
  }

  private loadAssets(): void {
    // Loading events
    this.load.on('progress', (value: number) => {
      // La animación automática se encarga del progreso
    });

    this.load.on('complete', () => {
      // La animación automática se encarga de completar
    });

    // Simular assets mínimos
    this.load.image('menu-bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBQe4QdXUAAAAASUVORK5CYII=');
  }

  private onLoadingComplete(): void {
    // Ocultar panel y barra
    this.welcomePanel.hide(() => {
      this.loadingBar.hide(() => {
        this.showPlayButton();
      });
    });
  }

  private showPlayButton(): void {
    this.playButton.create(() => {
      this.scene.start('menu');
    });
  }
}
