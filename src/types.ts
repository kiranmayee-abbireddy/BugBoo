export type GhostMood = 'idle' | 'happy' | 'curious' | 'panicked' | 'celebrating' | 'rage' | 'smug' | 'dizzy';

export type EventType =
  | 'idle_timeout'
  | 'active_editor_changed'
  | 'typing'
  | 'ai_prompting'
  | 'document_saved'
  | 'diagnostics_increased'
  | 'diagnostics_decreased'
  | 'manual_mood'
  | 'workspace_activated';

export interface DiagnosticSnapshot {
  errors: number;
  warnings: number;
  total: number;
}

export interface ProgressionState {
  totalXp: number;
  level: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
}

export interface BugBooState {
  mood: GhostMood;
  dialogue: string;
  chaos: number; // 0 to 100
  progression: ProgressionState;
  lastEventTime: number;
  diagnostics: DiagnosticSnapshot;
}

export interface NormalizedEvent {
  type: EventType;
  timestamp: number;
  details?: {
    fileName?: string;
    diagnosticDelta?: number;
    currentDiagnostics?: DiagnosticSnapshot;
    previousDiagnostics?: DiagnosticSnapshot;
    targetMood?: GhostMood;
  };
}

export type AvatarColor = 'lavender' | 'mint' | 'cyberpunk' | 'rose' | 'midnight' | 'sunshine' | 'spectral';

export interface WebviewIncomingMessage {
  command: 'requestState' | 'changeMood' | 'resetProgress' | 'showStats' | 'interact' | 'changeColor';
  mood?: GhostMood;
  color?: AvatarColor;
}

export interface WebviewOutgoingMessage {
  command: 'stateUpdate';
  state: {
    mood: GhostMood;
    dialogue: string;
    chaos: number;
    chaosStage: 'Chill' | 'Suspicious' | 'Chaotic' | 'Maximum drama';
    progression: ProgressionState;
    levelUp?: boolean;
    activeFile?: string;
    avatarColor?: AvatarColor;
  };
}
