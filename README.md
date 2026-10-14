# BugBoo 👻

A playful, local-first VS Code companion that introduces a tiny pixel-art ghost into your workspace.

BugBoo reacts to real coding activity—editor changes, typing cadence, and live language diagnostics—expressing emotions through lively animations and contextual dialogue. Track your code's **Chaos Meter**, earn persistent **XP**, and level up your ghost buddy as you build!

---

## ✨ Features

- 👻 **Pixel-Art Companion**: Renders right in the activity sidebar without external servers or heavy dependencies.
- 🎭 **5 Expressive States**:
  - 😴 **Idle / Sleeping**: Gentle nap with floating "Zzz" when you step away from the keyboard.
  - 😊 **Happy**: Content and floating peacefully during steady coding.
  - 🧐 **Curious**: Inspects new files whenever you switch active editor tabs.
  - 😱 **Panicked**: Wide-eyed screams and sweat drops when syntax errors or compiler diagnostics spike!
  - 🎉 **Celebrating**: Party hat and confetti when you squash bugs and clean up errors.
- 🔥 **Live Chaos Meter**: Dynamically tracks editor chaos from 0% to 100% across four stages:
  - `0% – 24%`: **Chill**
  - `25% – 49%`: **Suspicious**
  - `50% – 74%`: **Chaotic**
  - `75% – 100%`: **Maximum drama**
- ⭐ **Persistent Progression (XP & Levels)**:
  - Gain XP for saves, session activity, and bug fixes.
  - Levels scale gracefully (`100 × Current Level` XP required for next level).
  - Saved securely in VS Code `globalState` across sessions.
- 🛡️ **Offline & 100% Private**:
  - No AI APIs, no external telemetry, no remote servers, and zero code exfiltration.
  - Strict Content Security Policy (CSP).

---

## 🎮 Command Palette

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and type `BugBoo`:

| Command | Description |
|---|---|
| `BugBoo: Summon` | Focuses and opens the BugBoo sidebar view. |
| `BugBoo: Change Mood` | Lets you preview any of the 5 expressions on demand. |
| `BugBoo: Show Stats` | Displays current XP, Level, and Chaos status in an info banner. |
| `BugBoo: Reset Progress` | Safely resets XP and Level progress (requires confirmation). |

---

## 🚀 Getting Started (Development & Building)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [VS Code](https://code.visualstudio.com/) (v1.85+)

### Clone & Install
```bash
git clone https://github.com/kiranmayee-abbireddy/BugBoo.git
cd BugBoo
npm install
```

### Compile Code
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Run in VS Code Extension Host
1. Open this repository folder in VS Code (`code .`).
2. Press `F5` to start a new **Extension Development Host** window.
3. Click the 👻 ghost icon on the Activity Bar to see BugBoo in action!

### Package into `.vsix`
```bash
npx @vscode/vsce package
```

---

## 🧪 Acceptance & Demo Scenario

1. **Idle State**: Leave the editor untouched for 30s; watch BugBoo doze off with floating Zzz particles.
2. **Switching Files**: Switch between project files; BugBoo turns curious (`"what are we cooking?"`).
3. **Triggering Diagnostics**: Introduce a syntax error in your code; BugBoo enters panic mode (`"BESTIE, EXPLAIN."`) and chaos rises.
4. **Fixing Diagnostics**: Fix the error and save; BugBoo dons a party hat, launches confetti, and awards +10 XP!

---

## 📄 License

Distributed under the [MIT License](LICENSE).
