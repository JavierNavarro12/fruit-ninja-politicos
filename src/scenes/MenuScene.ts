import Phaser from 'phaser';
import { JapaneseBackground } from '../game/effects/JapaneseBackground';
import { TopUI } from '../game/ui/TopUI';
import { TitleText } from '../game/ui/TitleText';
import { GameModeCircles } from '../game/ui/GameModeCircles';
import { SideMenu } from '../game/ui/SideMenu';
import { SettingsButton } from '../game/ui/SettingsButton';
import { progressManager } from '../game/managers/ProgressManager';
import { ArsenalPanel } from '../game/ui/ArsenalPanel';

export class MenuScene extends Phaser.Scene {
  // Módulos
  private background!: JapaneseBackground;
  private topUI!: TopUI;
  private titleText!: TitleText;
  private gameModeCircles!: GameModeCircles;
  private sideMenu!: SideMenu;
  private settingsButton!: SettingsButton;

  constructor() {
    super('menu');
  }

  create(): void {
    this.initializeModules();
    this.createUI();
  }

  private initializeModules(): void {
    this.background = new JapaneseBackground(this);
    this.topUI = new TopUI(this);
    this.titleText = new TitleText(this);
    this.gameModeCircles = new GameModeCircles(this);
    this.sideMenu = new SideMenu(this, () => this.openArsenal());
    this.settingsButton = new SettingsButton(this);
  }

  private createUI(): void {
    // Fondo japonés con efectos
    this.background.create();

    // UI superior
    this.topUI.create();

    // Título animado
    this.titleText.create();

    // Círculos de modos de juego
    this.gameModeCircles.create((mode) => this.onModeSelected(mode));

    // Menú lateral
    this.sideMenu.create();

    // Botón de configuración
    this.settingsButton.create();
  }

  private onModeSelected(mode: string): void {
    // Iniciar el juego
    this.scene.start('game');
  }

  private openArsenal(): void {
    const panel = new ArsenalPanel(this);
    panel.show();
  }
}
