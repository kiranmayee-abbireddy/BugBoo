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
      <span class="title">👻 BugBoo</span>
      <div class="level-badge" id="levelBadge">LVL 1</div>
    </div>

    <!-- Character Stage -->
    <div class="stage">
      <div class="speech-bubble" id="speechBubble">
        <span id="speechText">Loading...</span>
      </div>
      <div class="ghost-box mood-idle" id="ghostBox" title="Poke me!">
        <svg class="ghost-container" id="ghostSvg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        </svg>
      </div>
    </div>

    <!-- Compact Meters -->
    <div class="meters">
      <div class="meter-row">
        <div class="meter-header">
          <span>🔥 Chaos <span id="chaosStage" style="color: #c084fc;">(Chill)</span></span>
          <span class="meter-val" id="chaosScore">0%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill chaos-fill" id="chaosFill" style="width: 0%;"></div>
        </div>
      </div>

      <div class="meter-row">
        <div class="meter-header">
          <span>⭐ XP Progress</span>
          <span class="meter-val" id="xpFraction">0/100</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill xp-fill" id="xpFill" style="width: 0%;"></div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="btn" id="changeMoodBtn" title="Change Mood">✨ Mood</button>
      <button class="btn" id="statsBtn" title="View Stats">📊 Stats</button>
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
