# Contributing & Development Guide

This guide walks you through setting up a local development environment, running tests, debugging the extension in VS Code, and building the distribution package.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0 or later)
- [Visual Studio Code](https://code.visualstudio.com/) (version 1.85.0 or later)
- [Git](https://git-scm.com/)

---

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kiranmayee-abbireddy/BugBoo.git
   cd BugBoo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## Development Workflow

### Compiling Code

BugBoo is built with TypeScript. You can compile the code in one of two modes:

- **Incremental Watch (Recommended during development):**
  ```bash
  npm run watch
  ```
  Automatically recompiles TypeScript files whenever you save changes.

- **One-off Build:**
  ```bash
  npm run compile
  ```

### Debugging in VS Code

1. Open the project root folder in VS Code:
   ```bash
   code .
   ```
2. Press `F5` (or go to **Run and Debug** -> select **Run Extension**).
3. A new **Extension Development Host** window will open with BugBoo loaded.
4. Open any folder or workspace, expand the **Explorer** panel, and you will see the **BugBoo 👻** companion docked at the bottom of the file tree.

---

## Running Tests

Run the automated extension test suite using Mocha and VS Code's test runner:

```bash
npm test
```

---

## Project Structure

```text
BugBoo/
├── src/
│   ├── extension.ts        # Extension activation, registration & event listeners
│   ├── bugBooView.ts       # WebviewViewProvider rendering the companion sidebar
│   ├── eventEngine.ts      # Diagnostic tracking, chaos meter calculation & debounce
│   ├── personality.ts      # Contextual dialogue bank and state machine logic
│   ├── persistence.ts      # State caching and user configuration management
│   └── types.ts            # Core TypeScript interfaces and types
├── media/
│   ├── sidebar.css         # Glassmorphism styling, responsive layout & animations
│   ├── sidebar.js          # Client-side webview controller and SVG expressions
│   └── icon.png            # Marketplace icon
├── video_render/           # Puppeteer showcase video & preview generation scripts
├── package.json            # Extension manifest, contributes & activation events
├── tsconfig.json           # TypeScript configuration
└── CONTRIBUTING.md         # This development guide
```

---

## Packaging the Extension (.vsix)

To build a standalone `.vsix` distribution package for local manual installation or Marketplace upload:

```bash
npx @vscode/vsce package
```

To install the locally generated package into your VS Code:
```bash
code --install-extension bugboo-0.1.0.vsix
```

---

## Publishing to the Marketplace

To publish updates to the Visual Studio Code Marketplace:

1. Update the version number in `package.json` or run:
   ```bash
   npm version patch
   ```
2. Authenticate and publish:
   ```bash
   npx @vscode/vsce publish
   ```
