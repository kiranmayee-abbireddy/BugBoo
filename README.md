# BugBoo

A lightweight, event-driven pixel-art ghost companion docked directly beneath the Explorer file tree in VS Code, Cursor, and Antigravity.

BugBoo provides real-time ambient feedback based on editor events, file navigation, typing cadence, AI prompts, and syntax diagnostics. It features a dynamic Chaos Meter, 7 customizable color themes, and 8 responsive emotional states—built without polling intervals or background performance penalties.

---

## Showcase

[![BugBoo Showcase](media/showcase-preview.gif)](https://github.com/kiranmayee-abbireddy/BugBoo/blob/master/BugBoo.mp4)

> 📹 **[Click here to watch the full 1080p video with audio on GitHub (BugBoo.mp4)](https://github.com/kiranmayee-abbireddy/BugBoo/blob/master/BugBoo.mp4)**.
>
> *(Click the preview GIF or link above to open GitHub's native video player with sound).*

---

## Overview

![BugBoo Hero Overview](media/hero-preview.png)

BugBoo resides natively in the primary Explorer sidebar, ensuring continuous visibility without consuming space in your main editor workspace or requiring manual switching between activity tabs.

### Core Highlights

- **Native Explorer Docking**: Integrated directly into the primary file tree view container.
- **Hardware-Accelerated Rendering**: Utilizes isolated CSS 3D transforms (`translate3d`) and GPU compositing.
- **Resource Efficient**: Operates with zero polling loops; diagnostics are debounced and animations sleep when the view is collapsed or hidden.
- **Local & Offline**: Zero network calls, zero external model queries, and zero telemetry. All state is maintained locally within VS Code's extension storage.

---

## Key Features

### 1. Multi-State Emotional Engine

![BugBoo Emotions Showcase](media/emotions-preview.png)

BugBoo dynamically expresses 8 distinct emotional states driven by real-time development activity:

| State | Trigger Context | Description |
|---|---|---|
| **Idle** | Inactivity / Resting | BugBoo sleeps quietly when user is away from keyboard. |
| **Happy** | Productive Flow | Gentle hovering during continuous coding sessions. |
| **Curious** | File Navigation | Observes file switching and project directory browsing. |
| **Panicked** | Syntax / Build Errors | High-alert expression triggered by diagnostics failures. |
| **Celebrating** | Error Resolution | Commemorative party animation upon fixing broken code. |
| **Rage** | High Chaos Spike | Fiery reaction when editor error rate exceeds threshold. |
| **Smug** | Clean Build | Relaxed satisfaction when tests and linting succeed. |
| **Dizzy** | File Thrashing | Disoriented reaction when switching rapidly between files. |

---

### 2. AI Prompt Awareness

![AI Prompt Awareness](media/ai-prompt-preview.png)

BugBoo detects when AI assistance tools (such as GitHub Copilot, Cursor Composer, or Antigravity) are active, providing context-aware remarks and reactions as prompts are composed and executed.

---

### 3. Real-Time Diagnostic Reactions & Chaos Meter

![Diagnostics & Panic State](media/panic-preview.png)

When compiler errors or linter warnings occur, BugBoo responds immediately with visual panic cues and updates the real-time **Chaos Meter**:

- **Chill (0% – 24%)**: Normal development conditions with clean diagnostics.
- **Suspicious (25% – 49%)**: Minor warnings or rapid code modifications.
- **Chaotic (50% – 74%)**: Multiple syntax errors or failing test runs.
- **Maximum Drama (75% – 100%)**: Critical compiler breakage across multiple files.

---

### 4. Avatar Color Customization

![Avatar Color Customization](media/customization-preview.png)

Choose between 7 sleek ghost color themes directly from the sidebar or via the Command Palette:

- **Lavender** (Default soft purple)
- **Mint** (Vibrant cyber-green)
- **Cyberpunk** (Electric neon cyan)
- **Rose** (Bubblegum pastel pink)
- **Midnight** (Deep moody violet)
- **Sunshine** (Warm golden amber)
- **Spectral** (Classic spooky off-white)

---

## Quick Start & Usage

1. **Install BugBoo** directly from the **VS Code Extensions Marketplace** (`Ctrl+Shift+X` / `Cmd+Shift+X` → search for `BugBoo`).
2. Open your project Explorer panel (`Ctrl+Shift+E` / `Cmd+Shift+E`). BugBoo is docked right under your workspace files!
3. Click the buttons in the dock to customize your experience:
   - **`✨ Mood`**: Preview BugBoo's 8 expressions.
   - **`🎨 Color`**: Toggle the color palette and switch between 7 avatar themes.
   - **`📊 Stats`**: Check your session Chaos rating and active configuration.

---

## Extension Settings

Customize BugBoo through VS Code Settings (`Ctrl+,` or `Cmd+,` searching for `bugboo`):

| Setting | Type | Default | Description |
|---|---|---|---|
| `bugboo.avatarColor` | `string` | `"lavender"` | Theme color (`lavender`, `mint`, `cyberpunk`, `rose`, `midnight`, `sunshine`, `spectral`) |

---

## Command Palette Reference

All features are also accessible via `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) by typing `BugBoo`:

| Command | Identifier | Function |
|---|---|---|
| `BugBoo: Summon` | `bugboo.summon` | Reveals and focuses the BugBoo companion view in the Explorer. |
| `BugBoo: Change Mood` | `bugboo.changeMood` | Cycles and previews emotional expressions. |
| `BugBoo: Customize Avatar Color` | `bugboo.changeColor` | Quick-pick menu to choose an avatar color theme. |
| `BugBoo: Show Stats` | `bugboo.showStats` | Displays session Chaos percentage, current mood, and active theme. |
| `BugBoo: Reset Progress` | `bugboo.resetProgress` | Resets the Chaos meter and restores BugBoo to a chilled state. |

---

## Privacy & Performance Guarantee

- **100% Local & Offline**: BugBoo makes zero network calls, requires no API keys, sends no analytics, and collects zero telemetry.
- **Ultra-Low Overhead**: Diagnostics are debounced, rendering uses CSS hardware transforms, and all timers enter sleep mode when the sidebar view is collapsed or hidden.

---

## Development & Contributing

Looking to build from source, run tests, or contribute to BugBoo? Check out our detailed **[Development & Contribution Guide](DEVELOPMENT.md)**.

---

## License

This project is licensed under the [MIT License](LICENSE).

