# BugBoo 👻

A tiny, lightweight, and chaotic pixel-art ghost companion that lives directly beneath your Explorer file tree in VS Code, Cursor, and Antigravity.

BugBoo reacts to real coding events—editor navigation, rapid typing, AI prompting, and live compiler errors—expressing moods through snappy animations and hilariously unhinged dialogue. Track your code's **Chaos Meter**, earn persistent **XP**, and watch BugBoo freak out when you break the build!

---

## ✨ Features

- 📂 **Auto-Docked in Explorer**: Sits right below your file tree in the primary Explorer sidebar. Always visible without needing to click an Activity Bar icon.
- ⚡ **Ultra-Lightweight & Efficient**:
  - Zero polling timers and zero interval CPU loops.
  - Diagnostics are debounced to avoid thrashing your system during fast typing.
  - Webview message broadcasts and animations automatically sleep when the sidebar is collapsed or hidden.
  - Pure hardware-accelerated CSS transforms (`translate3d` & `translateZ`).
- 🎭 **8 Expressive Moods**:
  - 😴 **Idle**: Resting and taking a nap when you step away from the keyboard.
  - 😊 **Happy**: Floating peacefully during steady, productive coding.
  - 🧐 **Curious**: Inspecting new tabs whenever you switch files.
  - 😱 **Panicked**: Wide-eyed screams and sweat drops when syntax errors spike!
  - 🎉 **Celebrating**: Party hat and confetti when you fix errors.
  - 🔥 **Rage**: Red fiery fury when the chaos meter jumps over 70%.
  - 😏 **Smug**: Sassy side-smirk with sparkles when code is clean and error-free.
  - 💫 **Dizzy**: Spinning with spiral eyes when juggling too many files under high chaos.
- 🤖 **AI Prompt Awareness**:
  - Detects when you type prompts into Copilot, Cursor, Antigravity, or inline AI inputs (`Ctrl+I`).
  - Reacts with witty, self-aware commentary (*"whispering sweet prompts to the AI again?"*, *"copilot take the wheel!!"*).
- 🔥 **Live Chaos Meter**: Dynamically tracks editor chaos from 0% to 100% across four stages:
  - `0% – 24%`: **Chill**
  - `25% – 49%`: **Suspicious**
  - `50% – 74%`: **Chaotic**
  - `75% – 100%`: **Maximum drama**
- ⭐ **Persistent Progression (XP & Levels)**:
  - Gain XP for saves, session activity, AI prompts, and bug fixes.
  - Levels scale gracefully (`100 × Current Level` XP required for next level).
  - Saved securely in VS Code's local storage across restarts.
- 🛡️ **Offline & 100% Private**:
  - Zero external API calls, zero telemetry, no AI model calls, and no data leaves your machine.

---

## 🎮 Command Palette

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and type `BugBoo`:

| Command | Description |
|---|---|
| `BugBoo: Summon` | Focuses and reveals the BugBoo view. |
| `BugBoo: Change Mood` | Lets you preview any of the 8 expressions on demand. |
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
3. Check the bottom of the Explorer file tree—BugBoo is docked and ready!

### Package into `.vsix`
```bash
npx @vscode/vsce package
```

---

## 📄 License

Distributed under the [MIT License](LICENSE).
