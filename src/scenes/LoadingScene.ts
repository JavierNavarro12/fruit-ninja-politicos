import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private playButton?: Phaser.GameObjects.Text;
  private loadingText!: Phaser.GameObjects.Text;
  private welcomeText!: Phaser.GameObjects.Text;
  private dots: Phaser.GameObjects.Text[] = [];
  private progressValue: number = 0;
  private panel!: Phaser.GameObjects.Graphics;

  constructor() {
    super('loading');
  }

  preload(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0a0a0a');

    this.createWelcomePanel(width, height);
    this.createLoadingText(width, height);
    this.createProgressBar(width, height);
    this.startDotAnimation();
    this.startProgressAnimation();

    // Loading events (mantenemos para assets reales si los hay)
    this.load.on('progress', (value: number) => {
      // La animación automática se encarga del progreso
    });

    this.load.on('complete', () => {
      // La animación automática se encarga de completar
    });

    // Simular assets mínimos (se pueden reemplazar por imágenes reales)
    this.load.image('menu-bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBQe4QdXUAAAAASUVORK5CYII=');
  }

  private createWelcomePanel(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const panelWidth = Math.min(width * 0.6, 500); // Responsivo: 60% del ancho, máximo 500px
    const panelHeight = Math.min(height * 0.3, 250); // Responsivo: 30% del alto, máximo 250px

    // Panel de fondo
    this.panel = this.add.graphics();
    this.panel.fillStyle(0x2c2c2c, 0.95);
    this.panel.fillRoundedRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight, 15);
    
    // Borde del panel
    this.panel.lineStyle(3, 0x4a4a4a, 1);
    this.panel.strokeRoundedRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight, 15);

    // Texto de bienvenida responsivo
    const fontSize = Math.min(width * 0.03, 28); // Responsivo: 3% del ancho, máximo 28px
    this.welcomeText = this.add.text(centerX, centerY - panelHeight * 0.2, 'Bienvenido a Ninja Fruit Politics', {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  private createLoadingText(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2 + height * 0.02; // Responsivo: 2% del alto (más arriba)

    const fontSize = Math.min(width * 0.02, 20); // Responsivo: 2% del ancho, máximo 20px
    this.loadingText = this.add.text(centerX - width * 0.03, centerY, 'Loading', {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#ffffff'
    }).setOrigin(0.5);

    // Crear los tres puntos responsivos, centrados después del texto
    const textWidth = this.loadingText.width;
    const dotSpacing = fontSize * 0.8; // Espaciado basado en el tamaño de fuente
    const startX = centerX - width * 0.03 + textWidth / 2 + fontSize * 0.5; // Después del texto con espacio
    
    for (let i = 0; i < 3; i++) {
      const dot = this.add.text(startX + (i * dotSpacing), centerY, '.', {
        fontFamily: 'Arial, sans-serif',
        fontSize: `${fontSize}px`,
        color: '#ffffff'
      }).setOrigin(0.5);
      this.dots.push(dot);
    }
  }

  private createProgressBar(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2 + height * 0.08; // Responsivo: 8% del alto
    const barWidth = Math.min(width * 0.3, 250); // Responsivo: 30% del ancho, máximo 250px
    const barHeight = Math.min(height * 0.04, 35); // Responsivo: 4% del alto, máximo 35px

    // Fondo de la barra (gris oscuro con sombra interna)
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x212121, 1);
    this.progressBox.fillRoundedRect(centerX - barWidth/2, centerY - barHeight/2, barWidth, barHeight, barHeight/2);
    
    // Sombra interna
    this.progressBox.fillStyle(0x0c0c0c, 0.3);
    this.progressBox.fillRoundedRect(centerX - barWidth/2 + 2, centerY - barHeight/2 + 2, barWidth - 4, barHeight - 4, (barHeight-4)/2);

    // Barra de progreso (gradiente naranja-amarillo)
    this.progressBar = this.add.graphics();
  }

  private startProgressAnimation(): void {
    // Animación automática de la barra de progreso (4 segundos como en el original)
    this.tweens.add({
      targets: this,
      progressValue: 1,
      duration: 4000,
      ease: 'Power2.easeOut',
      onUpdate: () => {
        this.updateProgressBar(this.scale.width, this.scale.height);
      },
      onComplete: () => {
        this.hidePanelAndShowButton();
      }
    });
  }

  private updateProgressBar(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2 + height * 0.08; // Responsivo: 8% del alto
    const barWidth = Math.min(width * 0.3, 250); // Responsivo: 30% del ancho, máximo 250px
    const barHeight = Math.min(height * 0.03, 25); // Responsivo: 3% del alto, máximo 25px
    const progressWidth = (barWidth - 10) * this.progressValue;

    this.progressBar.clear();
    
    // Gradiente naranja a amarillo
    this.progressBar.fillStyle(0xde4a0f, 1); // Naranja
    this.progressBar.fillRoundedRect(centerX - barWidth/2 + 5, centerY - barHeight/2, progressWidth, barHeight, barHeight/2);
    
    // Añadir gradiente amarillo en la parte superior
    this.progressBar.fillStyle(0xf9c74f, 0.8); // Amarillo
    this.progressBar.fillRoundedRect(centerX - barWidth/2 + 5, centerY - barHeight/2, progressWidth, barHeight/2, barHeight/4);
  }

  private startDotAnimation(): void {
    this.dots.forEach((dot, index) => {
      this.tweens.add({
        targets: dot,
        alpha: 0,
        duration: 500,
        yoyo: true,
        repeat: -1,
        delay: index * 300
      });
    });
  }

  private hidePanelAndShowButton(): void {
    // Ocultar el panel y todos sus elementos
    this.tweens.add({
      targets: [this.panel, this.welcomeText, this.loadingText, this.progressBox, this.progressBar, ...this.dots],
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        // Destruir todos los elementos del loading para que no reaparezcan
        this.panel.destroy();
        this.welcomeText.destroy();
        this.loadingText.destroy();
        this.progressBox.destroy();
        this.progressBar.destroy();
        this.dots.forEach(dot => dot.destroy());
        this.showPlayButton();
      }
    });
  }

  private showPlayButton(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Crear el botón con efecto glow
    this.createGlowButton(centerX, centerY);
  }

  private createGlowButton(x: number, y: number): void {
    const { width, height } = this.scale;
    const buttonWidth = Math.min(width * 0.15, 180); // Responsivo: 15% del ancho, máximo 180px
    const buttonHeight = Math.min(height * 0.08, 60); // Responsivo: 8% del alto, máximo 60px
    const borderRadius = 3;

    // Crear sombras múltiples para simular el efecto CSS
    const shadowLayers: Phaser.GameObjects.Graphics[] = [];
    
    // Sombra exterior (0 10px 20px rgba(0, 0, 0, 0.1))
    const outerShadow = this.add.graphics();
    outerShadow.fillStyle(0x000000, 0.1);
    outerShadow.fillRoundedRect(x - buttonWidth/2 + 10, y - buttonHeight/2 + 20, buttonWidth, buttonHeight, borderRadius);
    shadowLayers.push(outerShadow);

    // Sombra media (0 5px 10px rgba(0, 0, 0, 0.1))
    const midShadow = this.add.graphics();
    midShadow.fillStyle(0x000000, 0.1);
    midShadow.fillRoundedRect(x - buttonWidth/2 + 5, y - buttonHeight/2 + 10, buttonWidth, buttonHeight, borderRadius);
    shadowLayers.push(midShadow);

    // Sombra cercana (0 3px 2px rgba(0, 0, 0, 0.2))
    const closeShadow = this.add.graphics();
    closeShadow.fillStyle(0x000000, 0.2);
    closeShadow.fillRoundedRect(x - buttonWidth/2 + 3, y - buttonHeight/2 + 2, buttonWidth, buttonHeight, borderRadius);
    shadowLayers.push(closeShadow);

    // Sombra del borde (0 3px 0 #0f988e)
    const borderShadow = this.add.graphics();
    borderShadow.fillStyle(0x0f988e, 1);
    borderShadow.fillRoundedRect(x - buttonWidth/2 + 3, y - buttonHeight/2 + 3, buttonWidth, buttonHeight, borderRadius);
    shadowLayers.push(borderShadow);

    // Fondo del botón (turquesa)
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x15ccbe, 1); // #15ccbe
    buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
    
    // Borde del botón
    buttonBg.lineStyle(1, 0x0f988e, 1); // #0f988e
    buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);

    // Efecto de highlight interno
    const highlight = this.add.graphics();
    highlight.fillStyle(0xffffff, 0.1);
    highlight.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight/2, borderRadius);
    shadowLayers.push(highlight);

    // Icono de play (triángulo) - posición inicial a la izquierda, responsivo
    const iconSize = Math.min(buttonHeight * 0.4, 20); // Responsivo: 40% del alto del botón, máximo 20px
    const playIcon = this.add.graphics();
    playIcon.fillStyle(0xffffff, 1);
    playIcon.beginPath();
    playIcon.moveTo(0, -iconSize/2);
    playIcon.lineTo(0, iconSize/2);
    playIcon.lineTo(iconSize, 0);
    playIcon.closePath();
    playIcon.fillPath();
    playIcon.setPosition(x - buttonWidth * 0.25, y); // Responsivo: 25% del ancho del botón

    // Texto del botón - posición inicial a la derecha del icono, responsivo
    const fontSize = Math.min(buttonHeight * 0.4, 18); // Responsivo: 40% del alto del botón, máximo 18px
    this.playButton = this.add.text(x + buttonWidth * 0.1, y, 'Play', {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    // Hacer interactivo el fondo del botón
    buttonBg.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

    // Efectos hover responsivos
    buttonBg.on('pointerover', () => {
      // Animación de hover - texto se va por la derecha y desaparece
      this.tweens.add({
        targets: this.playButton,
        x: x + buttonWidth * 0.8, // Responsivo: 80% del ancho del botón
        alpha: 0,
        duration: 500,
        ease: 'Power2'
      });
      
      // Icono se mueve al centro del botón
      this.tweens.add({
        targets: playIcon,
        x: x, // Centro exacto del botón
        duration: 500,
        ease: 'Power2'
      });
    });

    buttonBg.on('pointerout', () => {
      // Volver a posición original
      this.tweens.add({
        targets: this.playButton,
        x: x + buttonWidth * 0.1, // Posición original responsiva
        alpha: 1,
        duration: 500,
        ease: 'Power2'
      });
      
      this.tweens.add({
        targets: playIcon,
        x: x - buttonWidth * 0.25, // Posición original responsiva
        duration: 500,
        ease: 'Power2'
      });
    });

    buttonBg.on('pointerdown', () => {
      // Efecto de click - mover hacia abajo y cambiar sombras
      buttonBg.setY(buttonBg.y + 3);
      shadowLayers.forEach(shadow => shadow.setY(shadow.y + 3));
      playIcon.setY(playIcon.y + 3);
      this.playButton?.setY(this.playButton.y + 3);
      
      // Cambiar sombras para efecto pressed
      shadowLayers.forEach(shadow => shadow.setAlpha(0));
    });

    buttonBg.on('pointerup', () => {
      // Restaurar posición y navegar
      buttonBg.setY(buttonBg.y - 3);
      shadowLayers.forEach(shadow => shadow.setY(shadow.y - 3));
      playIcon.setY(playIcon.y - 3);
      this.playButton?.setY(this.playButton.y - 3);
      
      // Restaurar sombras
      shadowLayers.forEach(shadow => shadow.setAlpha(1));
      this.scene.start('menu');
    });

    // Animación de entrada
    const buttonElements = [buttonBg, ...shadowLayers, playIcon, this.playButton];
    buttonElements.forEach(element => element.setAlpha(0));
    
    this.tweens.add({
      targets: buttonElements,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
  }
}


