import { GhostMood, NormalizedEvent } from './types';

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
      'taking a nap, don\'t break anything.',
      'zzz... don\'t crash the app while I\'m resting.',
      'wake me up when you actually start coding.',
      'just floating here doing nothing.',
      'resting my eyes.',
      'quiet hours, let\'s keep it that way.'
    ],
    editor_opened: [
      'yo what are we working on now?',
      'another file? bold choice.',
      'let\'s see what mess you got in here.',
      'new tab, please don\'t break it.',
      'alright let\'s get into it.',
      'another file to debug later lol.'
    ],
    typing: [
      'ok ok you\'re typing fast!',
      'lock in!',
      'look at those fingers go.',
      'hopefully this actually compiles.',
      'keep typing, let\'s ship this.',
      'type faster the bugs are catching up!'
    ],
    ai_prompting: [
      'whispering sweet prompts to the AI again?',
      'let\'s see if the AI can write better code than you lol.',
      'copilot take the wheel!!',
      'asking the AI to fix your mess? respect.',
      'prompt engineering goes crazy rn.',
      'make sure to say please so they spare us later.',
      'prompting the robot overlords...',
      'let\'s hope this prompt doesn\'t hallucinate 100 errors.'
    ],
    save: [
      'saved! don\'t lose this one.',
      'ctrl+s is my favorite shortcut.',
      'saved. please commit it now.',
      'nice save, literally.',
      'one step closer to shipping.',
      'saved! now don\'t touch anything.'
    ],
    diagnostics_increased: [
      'BRO WHAT DID YOU JUST DO?!',
      'RED LINES EVERYWHERE HELP.',
      'dude the compiler is screaming at us.',
      'no no no undo that right now!',
      'who wrote this?! oh wait you did.',
      'MY CHAOS METER IS EXPLODING!'
    ],
    diagnostics_decreased: [
      'AYYY you actually fixed it!',
      'told you you had this.',
      'bug squashed! good stuff.',
      'clean code baby, let\'s gooo!',
      'compiler is happy again.',
      'crisis averted. nice job!'
    ],
    rage: [
      'STOP WRITING ERRORS AHHHHH!',
      'WHAT IS THIS CODE EVEN?!',
      'MY EYES ARE BURNING BRO.',
      'IM GONNA THROW HANDS WITH THE COMPILER!'
    ],
    smug: [
      'yeah we\'re pretty good at this.',
      'too clean. nothing can stop us.',
      'zero errors, you\'re welcome.',
      'built different today.'
    ],
    dizzy: [
      'so many files my head is spinning...',
      'woah slow down buddy.',
      'what line are we even on right now?',
      'too much going on at once...'
    ],
    manual_mood: [
      'new vibe unlocked.',
      'alright changing faces for you.',
      'looking fresh.',
      'whatever you say boss.'
    ],
    level_up: [
      'YOOOO LEVEL UP!!',
      'LEVEL UP! Look at us actually making progress!',
      'We leveled up! Don\'t let it get to your head.',
      'New level unlocked! We\'re unstoppable now!'
    ],
    workspace_activated: [
      'sup! ready to write some bugs today?',
      'workspace loaded, let\'s get to work.',
      'here to keep you company and judge your code.'
    ],
    high_chaos: [
      'EVERYTHING IS ON FIRE BRO RUN!!',
      'HOW DID IT GET THIS BAD SO FAST?!',
      'THERE ARE ERRORS EVERYWHERE STOP TYPING!',
      'WE ARE COOKED LMAOOO'
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
        const delta = Math.min(30, Math.max(8, (event.details?.diagnosticDelta || 1) * 10));
        const newChaos = currentChaos + delta;
        const mood: GhostMood = newChaos >= 70 ? 'rage' : 'panicked';
        const dialogue = newChaos >= 75
          ? this.getDialogue('high_chaos')
          : newChaos >= 50
          ? this.getDialogue('rage')
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
        const delta = Math.min(25, Math.max(6, Math.abs(event.details?.diagnosticDelta || 1) * 8));
        const remainingChaos = Math.max(0, currentChaos - delta);
        const mood: GhostMood = remainingChaos <= 15 ? 'smug' : 'celebrating';
        const dialogue = mood === 'smug'
          ? this.getDialogue('smug')
          : this.getDialogue('diagnostics_decreased');
        return {
          mood,
          dialogue,
          chaosDelta: -delta,
          xpDelta: 10,
          reason: 'Diagnostic errors resolved'
        };
      }

      case 'document_saved': {
        const mood: GhostMood = currentChaos > 70 ? 'rage' : currentChaos > 45 ? 'panicked' : 'happy';
        return {
          mood,
          dialogue: this.getDialogue('save'),
          chaosDelta: -2,
          xpDelta: 2,
          reason: 'Document saved'
        };
      }

      case 'active_editor_changed': {
        const mood: GhostMood = currentChaos > 60 ? 'dizzy' : 'curious';
        const dialogue = mood === 'dizzy' ? this.getDialogue('dizzy') : this.getDialogue('editor_opened');
        return {
          mood,
          dialogue,
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

      case 'ai_prompting': {
        const mood: GhostMood = currentChaos > 50 ? 'panicked' : 'curious';
        return {
          mood,
          dialogue: this.getDialogue('ai_prompting'),
          chaosDelta: +1,
          xpDelta: 1,
          reason: 'Developer writing AI prompt'
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
