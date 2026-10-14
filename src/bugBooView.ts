import * as vscode from 'vscode';
import { WebviewOutgoingMessage, WebviewIncomingMessage, GhostMood, ProgressionState } from './types';
import { PersonalityEngine } from './personality';

export class BugBooViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'bugboo.sidebarView';

  private view?: vscode.WebviewView;
  private extensionUri: vscode.Uri;

  // Callbacks for incoming user actions from the webview
  private onUserActionCallback: (action: WebviewIncomingMessage) => void;

  // Cached state to re-hydrate view when reopened
  private currentState: {
    mood: GhostMood;
    dialogue: string;
    chaos: number;
    progression: ProgressionState;
    activeFile?: string;
  };

  constructor(
    extensionUri: vscode.Uri,
    initialState: {
      mood: GhostMood;
      dialogue: string;
      chaos: number;
      progression: ProgressionState;
      activeFile?: string;
    },
    onUserAction: (action: WebviewIncomingMessage) => void
  ) {
    this.extensionUri = extensionUri;
    this.currentState = initialState;
    this.onUserActionCallback = onUserAction;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // Listen for messages from webview
    webviewView.webview.onDidReceiveMessage((message: WebviewIncomingMessage) => {
      if (message.command === 'requestState') {
        this.broadcastCurrentState();
      } else {
        this.onUserActionCallback(message);
      }
    });

    // Send state immediately on render
    this.broadcastCurrentState();
  }

  public updateState(state: {
    mood: GhostMood;
    dialogue: string;
    chaos: number;
    progression: ProgressionState;
    levelUp?: boolean;
    activeFile?: string;
  }): void {
    this.currentState = {
      mood: state.mood,
      dialogue: state.dialogue,
      chaos: state.chaos,
      progression: state.progression,
      activeFile: state.activeFile ?? this.currentState.activeFile
    };

    this.broadcastCurrentState(state.levelUp);
  }

  private broadcastCurrentState(levelUp?: boolean): void {
    if (!this.view) {
      return;
    }

    const message: WebviewOutgoingMessage = {
      command: 'stateUpdate',
      state: {
        mood: this.currentState.mood,
        dialogue: this.currentState.dialogue,
        chaos: this.currentState.chaos,
        chaosStage: PersonalityEngine.getChaosStage(this.currentState.chaos),
        progression: this.currentState.progression,
        levelUp,
        activeFile: this.currentState.activeFile
      }
    };

    this.view.webview.postMessage(message);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'sidebar.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'sidebar.js'));

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet" />
  <title>BugBoo</title>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-group">
        <span>👻</span>
        <span class="title">BugBoo</span>
      </div>
      <div class="level-badge" id="levelBadge">LVL 1</div>
    </div>

    <!-- Character & Dialogue Stage -->
    <div class="stage">
      <div class="speech-bubble" id="speechBubble">
        <span id="speechText">Loading ghost spirits...</span>
      </div>
      <div class="ghost-box mood-idle" id="ghostBox" title="Click to poke BugBoo!">
        <svg class="ghost-container" id="ghostSvg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <!-- Dynamically populated expression SVG -->
        </svg>
      </div>
    </div>

    <!-- Chaos Meter -->
    <div class="meter-card">
      <div class="meter-header">
        <span style="color: #f87171;">🔥 Chaos Meter</span>
        <div>
          <span class="meter-val" id="chaosScore">0%</span>
          <span style="color: #a855f7; font-size: 10px;"> (<span id="chaosStage">Chill</span>)</span>
        </div>
      </div>
      <div class="bar-track">
        <div class="bar-fill chaos-fill" id="chaosFill" style="width: 0%;"></div>
      </div>
    </div>

    <!-- Progression Meter -->
    <div class="meter-card">
      <div class="meter-header">
        <span style="color: #c084fc;">⭐ Experience (XP)</span>
        <span class="meter-val" id="xpFraction" style="font-size: 10px;">0 / 100 XP</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill xp-fill" id="xpFill" style="width: 0%;"></div>
      </div>
    </div>

    <!-- Mini Stats Row -->
    <div class="stats-row">
      <div class="stat-chip">
        <div class="stat-label">Total XP</div>
        <div class="stat-number" id="totalXpDisplay">0</div>
      </div>
      <div class="stat-chip">
        <div class="stat-label">Active Target</div>
        <div class="stat-number" id="activeFileDisplay" style="font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Ready</div>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="btn" id="changeMoodBtn" title="Manually cycle or preview moods">
        <span>✨</span> Change Mood
      </button>
      <button class="btn btn-secondary" id="statsBtn" title="Inspect character details">
        <span>📊</span> Stats
      </button>
    </div>
  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
