import * as vscode from 'vscode';
import { WebviewOutgoingMessage, WebviewIncomingMessage, GhostMood, ProgressionState, AvatarColor } from './types';
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
    avatarColor?: AvatarColor;
  };
  private lastBroadcastState?: {
    mood: GhostMood;
    dialogue: string;
    chaos: number;
    totalXp: number;
    activeFile?: string;
    avatarColor?: AvatarColor;
  };

  constructor(
    extensionUri: vscode.Uri,
    initialState: {
      mood: GhostMood;
      dialogue: string;
      chaos: number;
      progression: ProgressionState;
      activeFile?: string;
      avatarColor?: AvatarColor;
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

    // Notify when visibility changes to save CPU/RAM
    webviewView.onDidChangeVisibility(() => {
      if (this.view?.visible) {
        this.broadcastCurrentState();
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
    avatarColor?: AvatarColor;
  }): void {
    const hasChanged =
      !this.lastBroadcastState ||
      this.lastBroadcastState.mood !== state.mood ||
      this.lastBroadcastState.dialogue !== state.dialogue ||
      this.lastBroadcastState.chaos !== state.chaos ||
      this.lastBroadcastState.totalXp !== state.progression.totalXp ||
      this.lastBroadcastState.activeFile !== (state.activeFile ?? this.currentState.activeFile) ||
      this.lastBroadcastState.avatarColor !== (state.avatarColor ?? this.currentState.avatarColor) ||
      Boolean(state.levelUp);

    this.currentState = {
      mood: state.mood,
      dialogue: state.dialogue,
      chaos: state.chaos,
      progression: state.progression,
      activeFile: state.activeFile ?? this.currentState.activeFile,
      avatarColor: state.avatarColor ?? this.currentState.avatarColor
    };

    if (!hasChanged) {
      return;
    }

    this.lastBroadcastState = {
      mood: state.mood,
      dialogue: state.dialogue,
      chaos: state.chaos,
      totalXp: state.progression.totalXp,
      activeFile: this.currentState.activeFile,
      avatarColor: this.currentState.avatarColor
    };

    this.broadcastCurrentState(state.levelUp);
  }

  private broadcastCurrentState(levelUp?: boolean): void {
    if (!this.view || !this.view.visible) {
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
        activeFile: this.currentState.activeFile,
        avatarColor: this.currentState.avatarColor
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
  <div class="companion-dock" id="companionDock">
    <!-- Header -->
    <div class="dock-header">
      <div class="dock-title">
        <span>BUGBOO</span>
      </div>
      <div class="dock-mood-pill" id="dockMoodPill">MOOD: IDLE 😴</div>
    </div>

    <!-- Ghost Box (Side-by-side character & speech bubble) -->
    <div class="ghost-box" id="ghostBox" title="Poke BugBoo!">
      <div id="ghostAnchor">
        <svg id="ghostSvg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>
      </div>
      <div class="ghost-speech">
        <div id="speechTextBubble">taking a nap, don't break anything.</div>
      </div>
    </div>

    <!-- Gauges -->
    <div class="dock-gauge">
      <div class="gauge-labels">
        <span>Chaos Meter</span>
        <span id="chaosNumber">0% (Chill)</span>
      </div>
      <div class="gauge-rail">
        <div id="chaosBarFill"></div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="dock-actions">
      <button class="action-btn" id="changeMoodBtn" title="Cycle / Pick Mood">✨ Mood</button>
      <button class="action-btn" id="changeColorBtn" title="Customize Ghost Color">🎨 Color</button>
      <button class="action-btn" id="statsBtn" title="View BugBoo Stats">📊 Stats</button>
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
