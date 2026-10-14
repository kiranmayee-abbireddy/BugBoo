import { GhostMood, EventType, NormalizedEvent } from './types';

export interface PersonalityOutcome {
  mood: GhostMood;
  dialogue: string;
  chaosDelta: number;
  xpDelta: number;
  reason: string;
}

export class PersonalityEngine {
  private lastDialogue: string = '';

  private readonly dialogues: Record<string, string[]> = {
    idle: [
      'brb, entering sleep mode...',
      'zzz... don\'t cause syntax errors while I nap.',
      '*quiet pixel ghost breathing*',
      'I haunt this codebase peacefully.',
      'floating into the void...',
      'manifesting clean builds in my sleep...'
    ],
    editor_opened: [
      'what are we cooking?',
      'new file, fresh bugs to be born.',
      'let\'s inspect this masterpiece.',
      'another tab added to the graveyard.',
      'ooh, what do we have here?',
      'let\'s get down to business.'
    ],
    typing: [
      'LOCK INNN.',
      'speed demons only!',
      'tap tap tap... smells like progress.',
      'typing furiously I see.',
      'words become code. hopefully valid code.',
      'keep cooking!'
    ],
    save: [
      'saved. probably.',
      'written to disk! no takebacks.',
      'saved. may git have mercy on our souls.',
      'commit early, save often.',
      'persisted to the realm of bytes.',
      'one small save for man, giant leap for this repo.'
    ],
    diagnostics_increased: [
      'BESTIE, EXPLAIN.',
      'red squiggles! who did this?!',
      'PANIC STATIONS! THE COMPILER IS CRYING.',
      'a wild bug appeared!',
      'my chaos meter is tingling...',
      'we broke something and I love/hate it!'
    ],
    diagnostics_decreased: [
      'I WAS NEVER WORRIED.',
      'clean code unlocked!',
      'squashed it like a pro.',
      'look at you fixing things!',
      'relief washes over my ethereal body.',
      'compiler satisfied. for now.'
    ],
    manual_mood: [
      'shape-shifting at your command!',
      'mood updated: vibing on cue.',
      'I am whatever you need me to be.',
      'the vibes have shifted.'
    ],
    level_up: [
      'I HAVE EVOLVED. FEAR ME.',
      'LEVEL UP! Spectral powers intensifying!',
      'New level unlocked! Give me more bugs to feast on!',
      'Look at us growing together!'
    ],
    workspace_activated: [
      'BOO! I\'m your new code companion.',
      'Workspace haunted successfully.',
      'Let\'s build something magical today!'
    ],
    high_chaos: [
      'EVERYTHING IS ON FIRE AND IT\'S BEAUTIFUL.',
      'Maximum drama mode engaged!',
      'Red squiggles everywhere! Ahhhhh!',
      'The chaos is intoxicating.'
    ]
  };

  /**
   * Selects a random dialogue from category without immediately repeating the exact same message.
   */
  public getDialogue(category: string): string {
    const pool = this.dialogues[category] || this.dialogues.idle;
    if (pool.length === 1) {
      this.lastDialogue = pool[0];
      return pool[0];
    }

    const available = pool.filter((d) => d !== this.lastDialogue);
    const chosen = available[Math.floor(Math.random() * available.length)] || pool[0];
    this.lastDialogue = chosen;
    return chosen;
  }

  public evaluateEvent(event: NormalizedEvent, currentChaos: number): PersonalityOutcome {
    switch (event.type) {
      case 'diagnostics_increased': {
        const delta = Math.min(25, Math.max(5, (event.details?.diagnosticDelta || 1) * 8));
        const mood: GhostMood = 'panicked';
        const dialogue = currentChaos > 70 
          ? this.getDialogue('high_chaos') 
          : this.getDialogue('diagnostics_increased');
        return {
          mood,
          dialogue,
          chaosDelta: +delta,
          xpDelta: 0,
          reason: 'Diagnostic errors increased'
        };
      }

      case 'diagnostics_decreased': {
        const delta = Math.min(25, Math.max(5, Math.abs(event.details?.diagnosticDelta || 1) * 8));
        const mood: GhostMood = 'celebrating';
        return {
          mood,
          dialogue: this.getDialogue('diagnostics_decreased'),
          chaosDelta: -delta,
          xpDelta: 10,
          reason: 'Diagnostic errors resolved'
        };
      }

      case 'document_saved': {
        const mood: GhostMood = currentChaos > 60 ? 'panicked' : 'happy';
        return {
          mood,
          dialogue: this.getDialogue('save'),
          chaosDelta: -2,
          xpDelta: 2,
          reason: 'Document saved'
        };
      }

      case 'active_editor_changed': {
        const mood: GhostMood = 'curious';
        return {
          mood,
          dialogue: this.getDialogue('editor_opened'),
          chaosDelta: 0,
          xpDelta: 0,
          reason: 'Switched active editor'
        };
      }

      case 'typing': {
        const mood: GhostMood = currentChaos > 65 ? 'panicked' : 'happy';
        return {
          mood,
          dialogue: this.getDialogue('typing'),
          chaosDelta: 0,
          xpDelta: 0,
          reason: 'Developer typing'
        };
      }

      case 'workspace_activated': {
        return {
          mood: 'happy',
          dialogue: this.getDialogue('workspace_activated'),
          chaosDelta: 0,
          xpDelta: 5,
          reason: 'First session interaction'
        };
      }

      case 'idle_timeout': {
        return {
          mood: 'idle',
          dialogue: this.getDialogue('idle'),
          chaosDelta: -5,
          xpDelta: 0,
          reason: 'Inactivity idle timeout'
        };
      }

      case 'manual_mood': {
        const targetMood = event.details?.targetMood || 'happy';
        return {
          mood: targetMood,
          dialogue: this.getDialogue('manual_mood'),
          chaosDelta: 0,
          xpDelta: 0,
          reason: 'User manual mood switch'
        };
      }

      default: {
        return {
          mood: 'idle',
          dialogue: this.getDialogue('idle'),
          chaosDelta: 0,
          xpDelta: 0,
          reason: 'Default fallback'
        };
      }
    }
  }

  public getLevelUpDialogue(): string {
    return this.getDialogue('level_up');
  }

  public static getChaosStage(chaos: number): 'Chill' | 'Suspicious' | 'Chaotic' | 'Maximum drama' {
    if (chaos < 25) {
      return 'Chill';
    } else if (chaos < 50) {
      return 'Suspicious';
    } else if (chaos < 75) {
      return 'Chaotic';
    } else {
      return 'Maximum drama';
    }
  }
}
