import Phaser from 'phaser';

export class PauseMenu {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(onResume: () => void, onRestart: () => void, onMenu: () => void): void {
    const { width, height } = this.scene.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.container = this.scene.add.container(centerX, centerY);
    this.container.setDepth(100);

    // Overlay oscuro
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(-width/2, -height/2, width, height);
    this.container.add(overlay);

    // Título
    const title = this.scene.add.text(0, -height * 0.35, 'PAUSA', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '72px',
      color: '#FF8C42',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    title.setStroke('#8B4513', 6);
    title.setShadow(4, 4, '#000000', 10);
    this.container.add(title);

    // Subtítulo
    const subtitle = this.scene.add.text(0, -height * 0.27, 'MISIONES', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '28px',
      color: '#FFD93D',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    subtitle.setStroke('#8B4513', 4);
    this.container.add(subtitle);

    // Panel de misiones
    this.createMissionsPanel();

    // Botones
    this.createButtons(onResume, onRestart, onMenu);

    // Animación de entrada
    this.container.setAlpha(0);
    this.container.setScale(0.8);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  hide(): void {
    if (!this.container) return;

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.8,
      duration: 200,
      onComplete: () => {
        this.container?.destroy();
        this.container = undefined;
      }
    });
  }

  private createMissionsPanel(): void {
    if (!this.container) return;

    const panelWidth = 540;
    const panelHeight = 280;

    const panel = this.scene.add.graphics();
    panel.fillStyle(0xF5DEB3, 1);
    panel.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 15);
    panel.lineStyle(4, 0x8B4513, 1);
    panel.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 15);
    panel.fillStyle(0xD2B48C, 0.3);
    panel.fillRoundedRect(-panelWidth/2 + 5, -panelHeight/2 + 5, panelWidth - 10, 50, 10);
    this.container.add(panel);

    const missions = [
      { icon: '🍉', text: 'Obtén un total de 200\npuntos exactos en el\nmodo Clásico', reward: '150 ⭐' },
      { icon: '🗡️', text: 'Juega 5 partidas de\nArcade\n5 para ir!', reward: '3x 💣' },
      { icon: '🍉', text: 'Corta 60 sandías\n60 para ir!', reward: '125 ✨' }
    ];

    missions.forEach((mission, index) => {
      const yPos = -100 + (index * 90);
      this.createMissionRow(mission.icon, mission.text, mission.reward, yPos);
    });
  }

  private createMissionRow(icon: string, text: string, reward: string, y: number): void {
    if (!this.container) return;

    const rowBg = this.scene.add.graphics();
    rowBg.fillStyle(0xFFE4B5, 0.6);
    rowBg.fillRoundedRect(-250, y - 30, 500, 70, 8);
    this.container.add(rowBg);

    const iconBg = this.scene.add.graphics();
    iconBg.fillStyle(0xD2B48C, 1);
    iconBg.fillRoundedRect(-240, y - 25, 60, 60, 8);
    iconBg.lineStyle(2, 0x8B4513, 1);
    iconBg.strokeRoundedRect(-240, y - 25, 60, 60, 8);
    this.container.add(iconBg);

    const iconText = this.scene.add.text(-210, y + 5, icon, {
      fontSize: '36px'
    }).setOrigin(0.5);
    this.container.add(iconText);

    const missionText = this.scene.add.text(-160, y + 5, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#4A2C1A',
      align: 'left',
      lineSpacing: 2
    }).setOrigin(0, 0.5);
    this.container.add(missionText);

    const rewardText = this.scene.add.text(200, y + 5, reward, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#27AE60',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    rewardText.setStroke('#FFFFFF', 3);
    this.container.add(rewardText);
  }

  private createButtons(onResume: () => void, onRestart: () => void, onMenu: () => void): void {
    if (!this.container) return;

    const buttonY = 200;
    const buttonSize = 80;
    const spacing = 100;

    const closeBtn = this.createButton(-spacing, buttonY, buttonSize, 0xC0392B, '✕', onMenu);
    this.container.add(closeBtn);

    const restartBtn = this.createButton(0, buttonY, buttonSize, 0xE67E22, '↻', onRestart);
    this.container.add(restartBtn);

    const resumeBtn = this.createButton(spacing, buttonY, buttonSize, 0x27AE60, '▶', onResume);
    this.container.add(resumeBtn);

    this.createAudioButtons();
  }

  private createButton(x: number, y: number, size: number, color: number, icon: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-size/2, -size/2, size, size, 12);
    bg.lineStyle(4, 0xFFFFFF, 1);
    bg.strokeRoundedRect(-size/2, -size/2, size, size, 12);
    container.add(bg);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-size/2 + 3, -size/2 + 6, size, size, 12);
    container.add(shadow);
    container.sendToBack(shadow);

    const iconText = this.scene.add.text(0, 0, icon, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '36px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(iconText);

    bg.setInteractive(new Phaser.Geom.Rectangle(-size/2, -size/2, size, size), Phaser.Geom.Rectangle.Contains);

    bg.on('pointerover', () => {
      this.scene.tweens.add({ targets: container, scale: 1.1, duration: 150, ease: 'Back.easeOut' });
    });

    bg.on('pointerout', () => {
      this.scene.tweens.add({ targets: container, scale: 1, duration: 150 });
    });

    bg.on('pointerdown', () => {
      this.scene.tweens.add({ targets: container, scale: 0.95, duration: 100, yoyo: true, onComplete: onClick });
    });

    return container;
  }

  private createAudioButtons(): void {
    if (!this.container) return;

    const buttonSize = 60;
    const yPos = 280;

    const musicBtn = this.scene.add.graphics();
    musicBtn.fillStyle(0xFF8C42, 1);
    musicBtn.fillRoundedRect(180, yPos - buttonSize/2, buttonSize, buttonSize, 10);
    musicBtn.lineStyle(3, 0xFFFFFF, 1);
    musicBtn.strokeRoundedRect(180, yPos - buttonSize/2, buttonSize, buttonSize, 10);
    this.container.add(musicBtn);

    const musicIcon = this.scene.add.text(210, yPos, '🎵', { fontSize: '28px' }).setOrigin(0.5);
    this.container.add(musicIcon);

    const soundBtn = this.scene.add.graphics();
    soundBtn.fillStyle(0xA569BD, 1);
    soundBtn.fillRoundedRect(250, yPos - buttonSize/2, buttonSize, buttonSize, 10);
    soundBtn.lineStyle(3, 0xFFFFFF, 1);
    soundBtn.strokeRoundedRect(250, yPos - buttonSize/2, buttonSize, buttonSize, 10);
    this.container.add(soundBtn);

    const soundIcon = this.scene.add.text(280, yPos, '🔊', { fontSize: '28px' }).setOrigin(0.5);
    this.container.add(soundIcon);
  }
}

