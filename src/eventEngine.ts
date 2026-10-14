import * as vscode from 'vscode';
import { NormalizedEvent, DiagnosticSnapshot } from './types';

export class EventEngine implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private onEventCallback: (event: NormalizedEvent) => void;

  private lastDiagnosticCount = 0;
  private lastTypingTime = 0;
  private lastEditorSwitchTime = 0;
  private lastSaveTime = 0;
  private idleTimer: NodeJS.Timeout | null = null;
  private chaosDecayTimer: NodeJS.Timeout | null = null;

  // Cooldown durations in milliseconds
  private readonly TYPING_COOLDOWN_MS = 3000;
  private readonly SWITCH_COOLDOWN_MS = 2500;
  private readonly SAVE_COOLDOWN_MS = 2000;
  private readonly IDLE_TIMEOUT_MS = 30000; // 30s to enter sleep/idle
  private readonly CHAOS_DECAY_INTERVAL_MS = 20000; // every 20s decrease chaos slowly

  constructor(onEventCallback: (event: NormalizedEvent) => void) {
    this.onEventCallback = onEventCallback;
    this.initSubscriptions();
    this.initInitialDiagnostics();
    this.startIdleTimer();
    this.startChaosDecayTimer();
  }

  private initSubscriptions(): void {
    // 1. Active Text Editor Changed
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor || !editor.document) {
          return;
        }
        const now = Date.now();
        if (now - this.lastEditorSwitchTime < this.SWITCH_COOLDOWN_MS) {
          return;
        }
        this.lastEditorSwitchTime = now;
        this.resetIdleTimer();

        this.onEventCallback({
          type: 'active_editor_changed',
          timestamp: now,
          details: {
            fileName: editor.document.fileName.split(/[\\/]/).pop() || 'file'
          }
        });
      })
    );

    // 2. Typing / Text Document Changed (includes AI prompt inputs and chat boxes)
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.contentChanges.length === 0) {
          return;
        }
        const now = Date.now();
        this.resetIdleTimer();

        // Check if typing inside an AI prompt editor / chat input (Copilot, Cursor, Antigravity, VS Code Chat)
        const docUri = e.document.uri;
        const scheme = docUri.scheme.toLowerCase();
        const path = (docUri.path || '').toLowerCase();
        const isAiPrompt =
          scheme === 'vscode-chat-editor' ||
          scheme === 'copilot' ||
          scheme === 'comment' ||
          scheme === 'interactive' ||
          scheme === 'input' ||
          path.includes('chat') ||
          path.includes('copilot') ||
          path.includes('prompt') ||
          path.includes('antigravity') ||
          path.includes('cursor');

        if (now - this.lastTypingTime < this.TYPING_COOLDOWN_MS) {
          return;
        }
        this.lastTypingTime = now;

        if (isAiPrompt) {
          this.onEventCallback({
            type: 'ai_prompting',
            timestamp: now,
            details: {
              fileName: 'AI Prompt'
            }
          });
        } else {
          this.onEventCallback({
            type: 'typing',
            timestamp: now
          });
        }
      })
    );

    // 3. Document Saved
    this.disposables.push(
      vscode.workspace.onDidSaveTextDocument((doc) => {
        const now = Date.now();
        this.resetIdleTimer();

        if (now - this.lastSaveTime < this.SAVE_COOLDOWN_MS) {
          return;
        }
        this.lastSaveTime = now;

        this.onEventCallback({
          type: 'document_saved',
          timestamp: now,
          details: {
            fileName: doc.fileName.split(/[\\/]/).pop() || 'file'
          }
        });
      })
    );

    // 4. Diagnostics Changed
    this.disposables.push(
      vscode.languages.onDidChangeDiagnostics(() => {
        this.handleDiagnosticChange();
      })
    );

    // 5. Text Selection / Cursor Movement (catches user engaging with editor/inputs)
    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection((e) => {
        this.resetIdleTimer();
        const scheme = e.textEditor.document.uri.scheme.toLowerCase();
        const path = (e.textEditor.document.uri.path || '').toLowerCase();
        const isAiPrompt =
          scheme === 'vscode-chat-editor' ||
          scheme === 'copilot' ||
          scheme === 'comment' ||
          scheme === 'interactive' ||
          scheme === 'input' ||
          scheme === 'webview' ||
          path.includes('chat') ||
          path.includes('copilot') ||
          path.includes('prompt') ||
          path.includes('antigravity') ||
          path.includes('cursor');

        if (isAiPrompt) {
          const now = Date.now();
          if (now - this.lastTypingTime >= this.TYPING_COOLDOWN_MS) {
            this.lastTypingTime = now;
            this.onEventCallback({
              type: 'ai_prompting',
              timestamp: now,
              details: { fileName: 'AI Prompt' }
            });
          }
        }
      })
    );

    // 6. Window State / Focus Changes (wake up ghost when switching back to IDE)
    this.disposables.push(
      vscode.window.onDidChangeWindowState((state) => {
        if (state.focused) {
          this.resetIdleTimer();
          const now = Date.now();
          if (now - this.lastEditorSwitchTime >= this.SWITCH_COOLDOWN_MS) {
            this.lastEditorSwitchTime = now;
            this.onEventCallback({
              type: 'active_editor_changed',
              timestamp: now,
              details: { fileName: 'Workspace' }
            });
          }
        }
      })
    );
  }

  public getDiagnosticSnapshot(): DiagnosticSnapshot {
    const all = vscode.languages.getDiagnostics();
    let errors = 0;
    let warnings = 0;

    for (const [, fileDiagnostics] of all) {
      for (const diag of fileDiagnostics) {
        if (diag.severity === vscode.DiagnosticSeverity.Error) {
          errors++;
        } else if (diag.severity === vscode.DiagnosticSeverity.Warning) {
          warnings++;
        }
      }
    }

    return {
      errors,
      warnings,
      total: errors + warnings
    };
  }

  private initInitialDiagnostics(): void {
    const snap = this.getDiagnosticSnapshot();
    this.lastDiagnosticCount = snap.total;
  }

  private handleDiagnosticChange(): void {
    const snap = this.getDiagnosticSnapshot();
    const currentTotal = snap.total;
    const diff = currentTotal - this.lastDiagnosticCount;

    if (diff === 0) {
      return;
    }

    const now = Date.now();
    this.resetIdleTimer();
    this.lastDiagnosticCount = currentTotal;

    if (diff > 0) {
      this.onEventCallback({
        type: 'diagnostics_increased',
        timestamp: now,
        details: {
          diagnosticDelta: diff,
          currentDiagnostics: snap
        }
      });
    } else {
      this.onEventCallback({
        type: 'diagnostics_decreased',
        timestamp: now,
        details: {
          diagnosticDelta: diff,
          currentDiagnostics: snap
        }
      });
    }
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    this.idleTimer = setTimeout(() => {
      this.onEventCallback({
        type: 'idle_timeout',
        timestamp: Date.now()
      });
    }, this.IDLE_TIMEOUT_MS);
  }

  private startIdleTimer(): void {
    this.resetIdleTimer();
  }

  private startChaosDecayTimer(): void {
    this.chaosDecayTimer = setInterval(() => {
      // Periodically trigger idle_timeout which naturally reduces chaos slightly
      this.onEventCallback({
        type: 'idle_timeout',
        timestamp: Date.now()
      });
    }, this.CHAOS_DECAY_INTERVAL_MS);
  }

  public dispose(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.chaosDecayTimer) {
      clearInterval(this.chaosDecayTimer);
      this.chaosDecayTimer = null;
    }
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
