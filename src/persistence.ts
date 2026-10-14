import * as vscode from 'vscode';
import { ProgressionState } from './types';

const STORAGE_KEY_XP = 'bugboo.totalXp';
const STORAGE_KEY_LEVEL = 'bugboo.level';

export class PersistenceManager {
  private globalState: vscode.Memento;

  constructor(globalState: vscode.Memento) {
    this.globalState = globalState;
  }

  /**
   * Calculates progression metrics from total XP.
   * Formula:
   * Level 1: 0..99 (needs 100 XP)
   * Level 2: 100..299 (needs 200 XP)
   * Level N: needs 100 * N XP for level N -> N+1
   */
  public static calculateProgression(totalXp: number): ProgressionState {
    const safeXp = Math.max(0, Math.floor(totalXp || 0));
    let level = 1;
    let accumulatedXp = 0;

    while (true) {
      const xpNeeded = 100 * level;
      if (safeXp < accumulatedXp + xpNeeded) {
        return {
          totalXp: safeXp,
          level,
          xpInCurrentLevel: safeXp - accumulatedXp,
          xpNeededForNextLevel: xpNeeded
        };
      }
      accumulatedXp += xpNeeded;
      level++;
    }
  }

  public getProgression(): ProgressionState {
    const rawXp = this.globalState.get<number>(STORAGE_KEY_XP, 0);
    return PersistenceManager.calculateProgression(rawXp);
  }

  public async saveTotalXp(totalXp: number): Promise<ProgressionState> {
    const safeXp = Math.max(0, Math.floor(totalXp));
    const progression = PersistenceManager.calculateProgression(safeXp);
    await this.globalState.update(STORAGE_KEY_XP, progression.totalXp);
    await this.globalState.update(STORAGE_KEY_LEVEL, progression.level);
    return progression;
  }

  public async addXp(amount: number): Promise<{ progression: ProgressionState; leveledUp: boolean }> {
    const current = this.getProgression();
    const newTotal = current.totalXp + Math.max(0, amount);
    const updated = PersistenceManager.calculateProgression(newTotal);

    await this.saveTotalXp(newTotal);

    return {
      progression: updated,
      leveledUp: updated.level > current.level
    };
  }

  public async resetProgression(): Promise<ProgressionState> {
    await this.globalState.update(STORAGE_KEY_XP, 0);
    await this.globalState.update(STORAGE_KEY_LEVEL, 1);
    return PersistenceManager.calculateProgression(0);
  }
}
