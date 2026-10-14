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

  // Cooldown durations in milliseconds
  private readonly TYPING_COOLDOWN_MS = 2000;
  private readonly SWITCH_COOLDOWN_MS = 2000;
  private readonly SAVE_COOLDOWN_MS = 1500;
  private readonly IDLE_TIMEOUT_MS = 45000;
  private diagnosticDebounceTimer: NodeJS.Timeout | null = null;

  constructor(onEventCallback: (event: NormalizedEvent) => void) {
    this.onEventCallback = onEventCallback;
    this.initSubscriptions();
    this.initInitialDiagnostics();
    this.startIdleTimer();
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

    // 2. Typing / Text Document Changed
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.contentChanges.length === 0) {
          return;
        }
        const now = Date.now();
        this.resetIdleTimer();

        if (now - this.lastTypingTime < this.TYPING_COOLDOWN_MS) {
          return;
        }
        this.lastTypingTime = now;

        const docUri = e.document.uri;
        const scheme = docUri.scheme.toLowerCase();
        const path = (docUri.path || '').toLowerCase();
        const isAiPrompt =
          scheme.includes('chat') ||
          scheme.includes('copilot') ||
          scheme.includes('input') ||
          scheme.includes('interactive') ||
          path.includes('chat') ||
          path.includes('copilot') ||
          path.includes('prompt') ||
          path.includes('antigravity') ||
          path.includes('cursor');

        if (isAiPrompt) {
          this.onEventCallback({
            type: 'ai_prompting',
            timestamp: now,
            details: { fileName: 'AI Prompt' }
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

    // 4. Diagnostics Changed (Debounced 500ms to avoid thrashing CPU on every single keypress)
    this.disposables.push(
      vscode.languages.onDidChangeDiagnostics(() => {
        if (this.diagnosticDebounceTimer) {
          clearTimeout(this.diagnosticDebounceTimer);
        }
        this.diagnosticDebounceTimer = setTimeout(() => {
          this.handleDiagnosticChange();
        }, 500);
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

  public dispose(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.diagnosticDebounceTimer) {
      clearTimeout(this.diagnosticDebounceTimer);
      this.diagnosticDebounceTimer = null;
    }
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
