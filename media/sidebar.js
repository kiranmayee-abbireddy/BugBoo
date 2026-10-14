(function () {
  // Acquire VS Code API
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  // Elements
  const ghostBox = document.getElementById('ghostBox');
  const ghostSvg = document.getElementById('ghostSvg');
  const speechText = document.getElementById('speechText');
  const levelBadge = document.getElementById('levelBadge');
  const chaosScore = document.getElementById('chaosScore');
  const chaosStage = document.getElementById('chaosStage');
  const chaosFill = document.getElementById('chaosFill');
  const xpFraction = document.getElementById('xpFraction');
  const xpFill = document.getElementById('xpFill');
  const totalXpDisplay = document.getElementById('totalXpDisplay');
  const activeFileDisplay = document.getElementById('activeFileDisplay');
  const changeMoodBtn = document.getElementById('changeMoodBtn');
  const statsBtn = document.getElementById('statsBtn');

  // Five SVG Expression Renderers for pixel-art ghost
  const EXPRESSIONS = {
    idle: `
      <!-- Sleeping/Idle Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#D8B4FE"/>
      <!-- Closed sleepy eyes -->
      <path d="M34 48 Q40 52 46 48" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M54 48 Q60 52 66 48" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Soft blush -->
      <circle cx="30" cy="54" r="4" fill="#F472B6" opacity="0.6"/>
      <circle cx="70" cy="54" r="4" fill="#F472B6" opacity="0.6"/>
      <!-- Zzz particles -->
      <text x="74" y="28" font-size="12" font-family="monospace" font-weight="bold" fill="#C084FC">z</text>
      <text x="82" y="18" font-size="10" font-family="monospace" font-weight="bold" fill="#A855F7">z</text>
    `,
    happy: `
      <!-- Happy Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#D8B4FE"/>
      <!-- Happy curved eyes -->
      <path d="M34 46 Q40 40 46 46" stroke="#1E1B4B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M54 46 Q60 40 66 46" stroke="#1E1B4B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <!-- Little smile -->
      <path d="M46 54 Q50 58 54 54" stroke="#1E1B4B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Rosy cheeks -->
      <circle cx="30" cy="52" r="5" fill="#F472B6"/>
      <circle cx="70" cy="52" r="5" fill="#F472B6"/>
      <!-- Tiny hands floating -->
      <ellipse cx="16" cy="58" rx="4" ry="6" fill="#D8B4FE"/>
      <ellipse cx="84" cy="58" rx="4" ry="6" fill="#D8B4FE"/>
    `,
    curious: `
      <!-- Curious Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#D8B4FE"/>
      <!-- One wide eye, one squinted -->
      <ellipse cx="40" cy="45" rx="5" ry="7" fill="#1E1B4B"/>
      <circle cx="42" cy="43" r="2" fill="#FFFFFF"/>
      <circle cx="60" cy="46" r="3.5" fill="#1E1B4B"/>
      <!-- Curious tilted mouth :o -->
      <ellipse cx="50" cy="56" rx="3" ry="4" fill="#1E1B4B"/>
      <circle cx="28" cy="54" r="4" fill="#F472B6" opacity="0.6"/>
      <circle cx="72" cy="54" r="4" fill="#F472B6" opacity="0.6"/>
      <!-- Sparkle -->
      <path d="M72 26 L74 30 L78 32 L74 34 L72 38 L70 34 L66 32 L70 30 Z" fill="#FDE047"/>
    `,
    panicked: `
      <!-- Panicked Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#FCA5A5"/>
      <!-- Giant horrified eyes -->
      <circle cx="38" cy="44" r="7" fill="#1E1B4B"/>
      <circle cx="36" cy="42" r="2.5" fill="#FFFFFF"/>
      <circle cx="62" cy="44" r="7" fill="#1E1B4B"/>
      <circle cx="60" cy="42" r="2.5" fill="#FFFFFF"/>
      <!-- Screaming mouth -->
      <ellipse cx="50" cy="60" rx="6" ry="8" fill="#1E1B4B"/>
      <!-- Sweat drops -->
      <path d="M74 35 Q77 42 74 45 Q71 42 74 35" fill="#38BDF8"/>
      <!-- Flailing hands -->
      <ellipse cx="14" cy="45" rx="5" ry="7" fill="#FCA5A5" transform="rotate(-30 14 45)"/>
      <ellipse cx="86" cy="45" rx="5" ry="7" fill="#FCA5A5" transform="rotate(30 86 45)"/>
    `,
    celebrating: `
      <!-- Celebrating Ghost with Party Hat -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#DDD6FE"/>
      <!-- Excited curved eyes -->
      <path d="M34 46 Q40 38 46 46" stroke="#1E1B4B" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M54 46 Q60 38 66 46" stroke="#1E1B4B" stroke-width="4" stroke-linecap="round" fill="none"/>
      <!-- Big open cheerful mouth -->
      <path d="M44 54 Q50 64 56 54 Z" fill="#E11D48"/>
      <circle cx="28" cy="52" r="6" fill="#F472B6"/>
      <circle cx="72" cy="52" r="6" fill="#F472B6"/>
      <!-- Party Cone Hat -->
      <polygon points="40,16 60,16 50,0" fill="#F59E0B"/>
      <circle cx="50" cy="0" r="3" fill="#EC4899"/>
      <!-- Confetti stars -->
      <text x="14" y="24" font-size="12" fill="#FDE047">★</text>
      <text x="78" y="24" font-size="12" fill="#38BDF8">✦</text>
      <text x="82" y="44" font-size="10" fill="#4ADE80">★</text>
    `,
    rage: `
      <!-- Fiery Rage Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#F87171"/>
      <!-- Angry sharp slanted eyebrows & eyes -->
      <path d="M32 40 L46 47" stroke="#450A0A" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="39" cy="49" r="4" fill="#1E1B4B"/>
      <path d="M68 40 L54 47" stroke="#450A0A" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="61" cy="49" r="4" fill="#1E1B4B"/>
      <!-- Jagged angry mouth -->
      <path d="M40 59 L44 56 L48 60 L52 56 L56 60 L60 56" stroke="#450A0A" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Smoke / fire puffs -->
      <text x="74" y="26" font-size="12" fill="#EF4444">💢</text>
      <text x="14" y="26" font-size="11" fill="#DC2626">🔥</text>
    `,
    smug: `
      <!-- Smug / Sassy Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#C4B5FD"/>
      <!-- Sassy half-closed eyes -->
      <path d="M34 46 Q40 42 46 45" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="42" cy="48" r="2.5" fill="#1E1B4B"/>
      <path d="M54 45 Q60 42 66 46" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="58" cy="48" r="2.5" fill="#1E1B4B"/>
      <!-- Smug sideways smirk -->
      <path d="M48 55 Q56 57 60 51" stroke="#1E1B4B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Pink blush -->
      <circle cx="30" cy="52" r="4" fill="#F472B6"/>
      <circle cx="70" cy="52" r="4" fill="#F472B6"/>
      <!-- Sunglasses sparkle -->
      <text x="74" y="32" font-size="10" fill="#FDE047">✨</text>
    `,
    dizzy: `
      <!-- Dizzy / Overwhelmed Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#E2E8F0"/>
      <!-- Spiral / X dizzy eyes -->
      <text x="32" y="49" font-size="13" font-weight="bold" fill="#1E1B4B">×</text>
      <text x="54" y="49" font-size="13" font-weight="bold" fill="#1E1B4B">×</text>
      <!-- Wobbly mouth -->
      <path d="M42 58 Q46 54 50 58 Q54 62 58 58" stroke="#1E1B4B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Orbiting stars -->
      <text x="20" y="24" font-size="11" fill="#FBBF24">💫</text>
      <text x="68" y="20" font-size="11" fill="#38BDF8">🌀</text>
    `
  };

  let currentRenderedMood = '';

  function setMood(mood) {
    if (!ghostSvg || !ghostBox) return;

    // Only update innerHTML if the mood actually changed to avoid GC thrashing
    if (currentRenderedMood !== mood) {
      currentRenderedMood = mood;
      ghostSvg.innerHTML = EXPRESSIONS[mood] || EXPRESSIONS.idle;
      ghostBox.className = 'ghost-box mood-' + mood;
    }
  }

  function updateUI(state) {
    if (!state) return;

    // Mood & dialogue
    setMood(state.mood);
    if (speechText && speechText.textContent !== state.dialogue) {
      speechText.textContent = state.dialogue || '...';
    }

    // Header Level
    if (levelBadge) {
      levelBadge.textContent = 'LVL ' + state.progression.level;
    }

    // Chaos
    if (chaosScore) {
      chaosScore.textContent = Math.round(state.chaos) + '%';
    }
    if (chaosStage) {
      chaosStage.textContent = state.chaosStage;
    }
    if (chaosFill) {
      chaosFill.style.width = Math.min(100, Math.max(0, state.chaos)) + '%';
    }

    // Progression XP
    if (xpFraction) {
      xpFraction.textContent = state.progression.xpInCurrentLevel + ' / ' + state.progression.xpNeededForNextLevel + ' XP';
    }
    if (xpFill) {
      const pct = (state.progression.xpInCurrentLevel / state.progression.xpNeededForNextLevel) * 100;
      xpFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    // Stats
    if (totalXpDisplay) {
      totalXpDisplay.textContent = state.progression.totalXp;
    }
    if (activeFileDisplay) {
      activeFileDisplay.textContent = state.activeFile || 'Ready';
    }
  }

  // Handle messages sent from the extension host
  window.addEventListener('message', function (event) {
    const message = event.data;
    if (message && message.command === 'stateUpdate') {
      updateUI(message.state);
    }
  });

  // Ghost poke interaction
  if (ghostBox) {
    ghostBox.addEventListener('click', function () {
      vscode.postMessage({ command: 'interact' });
    });
  }

  // Change mood action button
  if (changeMoodBtn) {
    changeMoodBtn.addEventListener('click', function () {
      vscode.postMessage({ command: 'changeMood' });
    });
  }

  // Stats action button
  if (statsBtn) {
    statsBtn.addEventListener('click', function () {
      vscode.postMessage({ command: 'showStats' });
    });
  }

  // Request initial state on load
  vscode.postMessage({ command: 'requestState' });
})();
