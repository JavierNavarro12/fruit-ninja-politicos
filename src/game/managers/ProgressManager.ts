export type SliceEffectKey = 'classic' | 'water' | 'fire' | 'lightning';

type Unlock = { type: 'sliceEffect'; key: SliceEffectKey; label: string };

class ProgressManager {
  private static _instance: ProgressManager;

  level: number = 1;
  experience: number = 0;

  selectedSliceEffect: SliceEffectKey = 'classic';
  unlockedSliceEffects: Set<SliceEffectKey> = new Set(['classic']);

  private pendingUnlocks: Unlock[] = [];

  static get instance(): ProgressManager {
    if (!this._instance) this._instance = new ProgressManager();
    return this._instance;
  }

  addExperience(amount: number): void {
    if (amount <= 0) return;
    this.experience += amount;

    // Manejar múltiples subidas si se acumula mucha XP
    while (this.experience >= this.xpToNextLevel()) {
      this.experience -= this.xpToNextLevel();
      this.level += 1;
      this.handleLevelUnlocks(this.level);
    }
  }

  xpToNextLevel(): number {
    // Curva simple creciente
    return 100 + (this.level - 1) * 25;
  }

  progressFraction(): number {
    return Math.max(0, Math.min(1, this.experience / this.xpToNextLevel()));
  }

  handleLevelUnlocks(level: number): void {
    // Desbloqueos por nivel
    const unlockMap: Record<number, Unlock[]> = {
      2: [{ type: 'sliceEffect', key: 'water', label: 'Corte de Agua' }],
      3: [{ type: 'sliceEffect', key: 'fire', label: 'Corte de Fuego' }],
      4: [{ type: 'sliceEffect', key: 'lightning', label: 'Corte de Rayo' }]
    };

    const unlocks = unlockMap[level] || [];
    for (const u of unlocks) {
      if (u.type === 'sliceEffect') {
        if (!this.unlockedSliceEffects.has(u.key)) {
          this.unlockedSliceEffects.add(u.key);
          this.pendingUnlocks.push(u);
        }
      }
    }
  }

  consumePendingUnlocks(): Unlock[] {
    const items = [...this.pendingUnlocks];
    this.pendingUnlocks = [];
    return items;
  }

  selectSliceEffect(effect: SliceEffectKey): void {
    if (this.unlockedSliceEffects.has(effect)) {
      this.selectedSliceEffect = effect;
    }
  }
}

export const progressManager = ProgressManager.instance;


