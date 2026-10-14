import * as vscode from 'vscode';
import { GhostMood, NormalizedEvent, BugBooState } from './types';
import { PersistenceManager } from './persistence';
import { PersonalityEngine } from './personality';
import { EventEngine } from './eventEngine';
import { BugBooViewProvider } from './bugBooView';

let viewProvider: BugBooViewProvider | undefined;
let persistenceManager: PersistenceManager | undefined;
let personalityEngine: PersonalityEngine | undefined;
let eventEngine: EventEngine | undefined;

let currentState: BugBooState;

export function activate(context: vscode.ExtensionContext) {
  // 1. Initialize Persistence & Engines
  persistenceManager = new PersistenceManager(context.globalState);
  personalityEngine = new PersonalityEngine();

  const savedProgression = persistenceManager.getProgression();

  currentState = {
    mood: 'idle',
    dialogue: 'brb, entering sleep mode...',
    chaos: 0,
    progression: savedProgression,
    lastEventTime: Date.now(),
    diagnostics: { errors: 0, warnings: 0, total: 0 }
  };

  // 2. Register Webview Provider
  viewProvider = new BugBooViewProvider(
    context.extensionUri,
    {
      mood: currentState.mood,
      dialogue: currentState.dialogue,
      chaos: currentState.chaos,
      progression: currentState.progression
    },
    (userAction) => {
      handleUserAction(userAction);
    }
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      BugBooViewProvider.viewType,
      viewProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  // 3. Register Event Engine
  eventEngine = new EventEngine((event: NormalizedEvent) => {
    processNormalizedEvent(event);
  });
  context.subscriptions.push(eventEngine);

  // 4. Register VS Code Commands
  registerCommands(context);

  // 5. Fire initial workspace activation event
  processNormalizedEvent({
    type: 'workspace_activated',
    timestamp: Date.now()
  });
}

async function processNormalizedEvent(event: NormalizedEvent): Promise<void> {
  if (!personalityEngine || !persistenceManager || !viewProvider) {
    return;
  }

  // Evaluate personality outcome
  const outcome = personalityEngine.evaluateEvent(event, currentState.chaos);

  // Update chaos meter (bounded 0 to 100)
  currentState.chaos = Math.max(0, Math.min(100, currentState.chaos + outcome.chaosDelta));
  currentState.mood = outcome.mood;
  currentState.dialogue = outcome.dialogue;
  currentState.lastEventTime = event.timestamp;

  let leveledUp = false;
  // Award XP if applicable
  if (outcome.xpDelta > 0) {
    const result = await persistenceManager.addXp(outcome.xpDelta);
    currentState.progression = result.progression;
    leveledUp = result.leveledUp;

    if (leveledUp) {
      currentState.mood = 'celebrating';
      currentState.dialogue = personalityEngine.getLevelUpDialogue();
      vscode.window.showInformationMessage(`🎉 BugBoo leveled up to Level ${currentState.progression.level}!`);
    }
  }

  // Push update to Webview
  viewProvider.updateState({
    mood: currentState.mood,
    dialogue: currentState.dialogue,
    chaos: currentState.chaos,
    progression: currentState.progression,
    levelUp: leveledUp,
    activeFile: event.details?.fileName
  });
}

function handleUserAction(action: { command: string; mood?: GhostMood }): void {
  switch (action.command) {
    case 'interact': {
      // Poke ghost
      processNormalizedEvent({
        type: 'manual_mood',
        timestamp: Date.now(),
        details: { targetMood: 'happy' }
      });
      break;
    }
    case 'changeMood': {
      vscode.commands.executeCommand('bugboo.changeMood');
      break;
    }
    case 'showStats': {
      vscode.commands.executeCommand('bugboo.showStats');
      break;
    }
    case 'resetProgress': {
      vscode.commands.executeCommand('bugboo.resetProgress');
      break;
    }
  }
}

function registerCommands(context: vscode.ExtensionContext): void {
  // Command 1: Summon BugBoo
  context.subscriptions.push(
    vscode.commands.registerCommand('bugboo.summon', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.bugboo-sidebar');
      if (personalityEngine && viewProvider) {
        currentState.mood = 'happy';
        currentState.dialogue = 'at your service! 👻';
        viewProvider.updateState({
          mood: currentState.mood,
          dialogue: currentState.dialogue,
          chaos: currentState.chaos,
          progression: currentState.progression
        });
      }
    })
  );

  // Command 2: Change Mood
  context.subscriptions.push(
    vscode.commands.registerCommand('bugboo.changeMood', async () => {
      const moods: { label: string; mood: GhostMood; desc: string }[] = [
        { label: '😴 Idle / Sleepy', mood: 'idle', desc: 'Resting peacefully' },
        { label: '😊 Happy', mood: 'happy', desc: 'Content and floating gently' },
        { label: '🧐 Curious', mood: 'curious', desc: 'Inspecting code closely' },
        { label: '😱 Panicked', mood: 'panicked', desc: 'Terrified of bugs' },
        { label: '🎉 Celebrating', mood: 'celebrating', desc: 'Party hat and confetti!' }
      ];

      const selected = await vscode.window.showQuickPick(moods, {
        placeHolder: 'Select a mood to preview for BugBoo'
      });

      if (selected) {
        processNormalizedEvent({
          type: 'manual_mood',
          timestamp: Date.now(),
          details: { targetMood: selected.mood }
        });
      }
    })
  );

  // Command 3: Show Stats
  context.subscriptions.push(
    vscode.commands.registerCommand('bugboo.showStats', () => {
      const prog = currentState.progression;
      const stage = PersonalityEngine.getChaosStage(currentState.chaos);
      const msg = `👻 BugBoo Stats — Level ${prog.level} | Total XP: ${prog.totalXp} (${prog.xpInCurrentLevel}/${prog.xpNeededForNextLevel} to next) | Chaos: ${Math.round(currentState.chaos)}% (${stage})`;
      vscode.window.showInformationMessage(msg);
    })
  );

  // Command 4: Reset Progress
  context.subscriptions.push(
    vscode.commands.registerCommand('bugboo.resetProgress', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to reset all BugBoo XP and level progression?',
        { modal: true },
        'Yes, Reset',
        'Cancel'
      );

      if (confirm === 'Yes, Reset' && persistenceManager && viewProvider) {
        const resetProgression = await persistenceManager.resetProgression();
        currentState.progression = resetProgression;
        currentState.chaos = 0;
        currentState.mood = 'idle';
        currentState.dialogue = 'Fresh start! All memories erased.';

        viewProvider.updateState({
          mood: currentState.mood,
          dialogue: currentState.dialogue,
          chaos: currentState.chaos,
          progression: currentState.progression
        });

        vscode.window.showInformationMessage('BugBoo progress has been reset.');
      }
    })
  );
}

export function deactivate() {
  if (eventEngine) {
    eventEngine.dispose();
  }
}
