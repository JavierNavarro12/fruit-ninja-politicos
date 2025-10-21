import Phaser from 'phaser';
import { progressManager, SliceEffectKey } from '../managers/ProgressManager';

type SwordCard = { key: SliceEffectKey; label: string; rarity: 'comun' | 'raro' | 'epico' };

export class ArsenalPanel {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(): void {
    const { width, height } = this.scene.scale;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(500);

    // Fondo madera claro
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xF5DEB3, 1);
    bg.fillRect(0, 0, width, height);
    this.container.add(bg);

    // Cabecera
    this.drawHeader(width);

    // Sección izquierda "Equipado"
    this.drawEquippedSection(width, height);

    // Grilla de espadas a la derecha
    this.drawGrid(width, height);

    // Botón cerrar (abajo centro)
    const close = this.scene.add.text(width / 2, height - 28, '✖', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '26px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#C0392B',
      padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setDepth(501).setInteractive({ useHandCursor: true });
    this.container.add(close);
    close.on('pointerdown', () => this.hide());
  }

  private drawHeader(width: number): void {
    const bar = this.scene.add.graphics();
    bar.fillStyle(0xE9C38B, 1);
    bar.fillRect(0, 0, width, 64);
    bar.lineStyle(4, 0xB8860B, 1);
    bar.strokeRect(0, 0, width, 64);
    this.container!.add(bar);

    // Flecha atrás y título ARSENAL
    const back = this.scene.add.text(40, 32, '⬅', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '28px',
      color: '#8B0000'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.hide());
    this.container!.add(back);

    const title = this.scene.add.text(120, 32, 'ARSENAL', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '36px',
      color: '#F39C12',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    title.setStroke('#8B4513', 6);
    this.container!.add(title);

    // Contadores y ordenar
    const acquired = progressManager.unlockedSliceEffects.size;
    const total = 58; // placeholder
    const acquiredText = this.scene.add.text(24, 90, `ESPADAS ADQUIRIDAS: ${acquired}/${total}`, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '22px',
      color: '#8B4513',
      fontStyle: 'bold'
    });
    this.container!.add(acquiredText);

    const ordenar = this.scene.add.text(width / 2 - 80, 90, 'ORDENAR:', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '22px',
      color: '#8B4513',
      fontStyle: 'bold'
    });
    this.container!.add(ordenar);

    const sortBtn = this.scene.add.text(width / 2 + 30, 90, 'Nivel ⌄', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#3E2723',
      backgroundColor: '#E0C49A',
      padding: { x: 16, y: 6 }
    }).setInteractive({ useHandCursor: true }).setOrigin(0, 0.5);
    this.container!.add(sortBtn);
  }

  private drawEquippedSection(width: number, height: number): void {
    const left = 140;
    const top = 140;

    const label = this.scene.add.text(left - 80, top - 30, 'Equipado:', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#5D4037'
    }).setOrigin(0, 0.5);
    this.container!.add(label);

    const card = this.scene.add.graphics();
    card.fillStyle(0xAFC7D8, 1);
    card.fillRoundedRect(left - 110, top, 220, 220, 18);
    card.lineStyle(4, 0x35607A, 1);
    card.strokeRoundedRect(left - 110, top, 220, 220, 18);
    this.container!.add(card);

    const check = this.scene.add.text(left + 70, top + 20, '✔', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '36px',
      color: '#27AE60'
    }).setOrigin(0.5);
    this.container!.add(check);

    // Etiqueta nivel máximo (placeholder)
    const max = this.scene.add.text(left - 110, top + 240, 'NIVEL MÁXIMO', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '18px',
      color: '#5D4037',
      backgroundColor: '#E0A96D',
      padding: { x: 16, y: 6 }
    }).setOrigin(0, 0.5);
    this.container!.add(max);
  }

  private drawGrid(width: number, height: number): void {
    const swords: SwordCard[] = [
      { key: 'classic', label: 'Clásico', rarity: 'comun' },
      { key: 'water', label: 'Agua', rarity: 'comun' },
      { key: 'fire', label: 'Fuego', rarity: 'raro' },
      { key: 'lightning', label: 'Rayo', rarity: 'epico' }
    ];

    const startX = width / 2 - 40;
    const startY = 140;
    const cellW = 160;
    const cellH = 160;
    const cols = 4;

    const columnTitles = this.scene.add.text(startX + 320, startY - 36, 'Por obtener:', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '22px',
      color: '#8B4513',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.container!.add(columnTitles);

    swords.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      const owned = progressManager.unlockedSliceEffects.has(s.key);
      const isSelected = progressManager.selectedSliceEffect === s.key;

      const tile = this.scene.add.graphics();
      tile.fillStyle(0xE5D2B0, 1);
      tile.fillRoundedRect(x, y, 130, 130, 16);
      tile.lineStyle(4, 0x8B6B3A, 1);
      tile.strokeRoundedRect(x, y, 130, 130, 16);
      this.container!.add(tile);

      // Estado
      if (!owned) {
        const lock = this.scene.add.text(x + 110, y + 20, '🔒', { fontSize: '24px' }).setOrigin(0.5);
        this.container!.add(lock);
        const note = this.scene.add.text(x + 65, y + 120, '¡Se encuentra en\\nlas cajas!', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#5D4037',
          align: 'center'
        }).setOrigin(0.5);
        this.container!.add(note);
      }

      const label = this.scene.add.text(x + 65, y + 100, s.label, {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '16px',
        color: '#3E2723'
      }).setOrigin(0.5);
      this.container!.add(label);

      // Interactivo si lo posee
      tile.setInteractive(new Phaser.Geom.Rectangle(x, y, 130, 130), Phaser.Geom.Rectangle.Contains);
      tile.on('pointerdown', () => this.openDetail(s.key));

      if (isSelected) {
        const sel = this.scene.add.graphics();
        sel.lineStyle(4, 0x27AE60, 1);
        sel.strokeRoundedRect(x - 4, y - 4, 138, 138, 18);
        this.container!.add(sel);
      }
    });
  }

  private openDetail(key: SliceEffectKey): void {
    const { width, height } = this.scene.scale;

    const owned = progressManager.unlockedSliceEffects.has(key);

    // pergamino modal
    const modal = this.scene.add.container(0, 0);
    modal.setDepth(600);

    const sheet = this.scene.add.graphics();
    sheet.fillStyle(0xF6E0B5, 1);
    const w = Math.min(900, width - 80);
    const h = Math.min(520, height - 120);
    const x = width / 2 - w / 2;
    const y = height / 2 - h / 2;
    sheet.fillRoundedRect(x, y, w, h, 14);
    sheet.lineStyle(4, 0xB8860B, 1);
    sheet.strokeRoundedRect(x, y, w, h, 14);
    modal.add(sheet);

    const title = this.scene.add.text(width / 2, y + 28, key === 'water' ? 'ESPADA DE AGUA' : key === 'fire' ? 'ESPADA DE FUEGO' : key === 'lightning' ? 'ESPADA DE RAYO' : 'ESPADA CLÁSICA', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '32px',
      color: '#8B0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    modal.add(title);

    const desc = this.scene.add.text(x + 260, y + 120, owned ? 'Revienta la fruta con esta poderosa espada.' : 'Consigue esta espada subiendo de nivel o en cajas.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#5D4037',
      wordWrap: { width: w - 320 }
    });
    modal.add(desc);

    if (owned) {
      const equip = this.scene.add.text(width / 2, y + h - 60, 'EQUIPAR', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '24px',
        color: '#8B0000',
        backgroundColor: '#FFD166',
        padding: { x: 26, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      modal.add(equip);
      equip.on('pointerdown', () => {
        progressManager.selectSliceEffect(key);
        this.hide();
        modal.destroy();
        // Reiniciar para aplicar
        this.scene.scene.restart();
      });
    }

    const close = this.scene.add.text(width / 2, y + h + 14, '✖', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#C0392B',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    modal.add(close);
    close.on('pointerdown', () => modal.destroy());
  }

  hide(): void {
    if (!this.container) return;
    this.container.destroy();
    this.container = undefined;
  }
}


