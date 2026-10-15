(function () {
  // Acquire VS Code API
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  // Elements
  const ghostBox = document.getElementById('ghostBox');
  const ghostSvg = document.getElementById('ghostSvg');
  const speechTextBubble = document.getElementById('speechTextBubble');
  const companionLvlBadge = document.getElementById('companionLvlBadge');
  const dockMoodPill = document.getElementById('dockMoodPill');
  const chaosNumber = document.getElementById('chaosNumber');
  const chaosBarFill = document.getElementById('chaosBarFill');
  const xpNumber = document.getElementById('xpNumber');
  const xpBarFill = document.getElementById('xpBarFill');
  const changeMoodBtn = document.getElementById('changeMoodBtn');
  const statsBtn = document.getElementById('statsBtn');

  // Exact 8 SVG Expression Renderers matching demo video & README feature graphics
  const EXPRESSIONS = {
    idle: `
      <!-- Idle / Sleeping Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#D8B4FE"/>
      <!-- Sleepy eyes -->
      <path d="M34 48 Q40 52 46 48" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M54 48 Q60 52 66 48" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Soft blush -->
      <circle cx="30" cy="54" r="4" fill="#F472B6" opacity="0.6"/>
      <circle cx="70" cy="54" r="4" fill="#F472B6" opacity="0.6"/>
      <!-- Zzz floating -->
      <text x="74" y="28" font-size="12" font-family="monospace" font-weight="bold" fill="#C084FC">z</text>
      <text x="82" y="18" font-size="10" font-family="monospace" font-weight="bold" fill="#A855F7">z</text>
    `,
    happy: `
      <!-- Happy Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#D8B4FE"/>
      <!-- Joyful closed curved eyes -->
      <path d="M34 46 Q40 40 46 46" stroke="#1E1B4B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M54 46 Q60 40 66 46" stroke="#1E1B4B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <!-- Cheerful smile -->
      <path d="M46 54 Q50 58 54 54" stroke="#1E1B4B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Pink cheeks -->
      <circle cx="30" cy="52" r="5" fill="#F472B6"/>
      <circle cx="70" cy="52" r="5" fill="#F472B6"/>
      <!-- Cute hands -->
      <ellipse cx="16" cy="58" rx="4" ry="6" fill="#D8B4FE"/>
      <ellipse cx="84" cy="58" rx="4" ry="6" fill="#D8B4FE"/>
    `,
    curious: `
      <!-- Curious Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#D8B4FE"/>
      <!-- Wide questioning eyes -->
      <ellipse cx="40" cy="45" rx="5" ry="7" fill="#1E1B4B"/>
      <circle cx="42" cy="43" r="2" fill="#FFFFFF"/>
      <circle cx="60" cy="46" r="3.5" fill="#1E1B4B"/>
      <!-- Tilted mouth -->
      <ellipse cx="50" cy="56" rx="3" ry="4" fill="#1E1B4B"/>
      <circle cx="28" cy="54" r="4" fill="#F472B6" opacity="0.6"/>
      <circle cx="72" cy="54" r="4" fill="#F472B6" opacity="0.6"/>
      <!-- Curious sparkle -->
      <path d="M72 26 L74 30 L78 32 L74 34 L72 38 L70 34 L66 32 L70 30 Z" fill="#FDE047"/>
    `,
    panicked: `
      <!-- Panicked Ghost (Red tint + screaming) -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#FCA5A5"/>
      <!-- Huge terrified eyes with tiny highlights -->
      <circle cx="38" cy="44" r="7" fill="#1E1B4B"/>
      <circle cx="36" cy="42" r="2.5" fill="#FFFFFF"/>
      <circle cx="62" cy="44" r="7" fill="#1E1B4B"/>
      <circle cx="60" cy="42" r="2.5" fill="#FFFFFF"/>
      <!-- Screaming mouth -->
      <ellipse cx="50" cy="60" rx="6" ry="8" fill="#1E1B4B"/>
      <!-- Sweat drop -->
      <path d="M74 35 Q77 42 74 45 Q71 42 74 35" fill="#38BDF8"/>
      <!-- Flailing arms -->
      <ellipse cx="14" cy="45" rx="5" ry="7" fill="#FCA5A5" transform="rotate(-30 14 45)"/>
      <ellipse cx="86" cy="45" rx="5" ry="7" fill="#FCA5A5" transform="rotate(30 86 45)"/>
    `,
    celebrating: `
      <!-- Celebrating Ghost with Party Hat -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#DDD6FE"/>
      <!-- Happy arched eyes -->
      <path d="M34 46 Q40 38 46 46" stroke="#1E1B4B" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M54 46 Q60 38 66 46" stroke="#1E1B4B" stroke-width="4" stroke-linecap="round" fill="none"/>
      <!-- Big open laughing mouth -->
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
      <!-- Rage / Furious Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#F87171"/>
      <!-- Slanted furious brows -->
      <path d="M32 40 L46 47" stroke="#450A0A" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="39" cy="49" r="4" fill="#1E1B4B"/>
      <path d="M68 40 L54 47" stroke="#450A0A" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="61" cy="49" r="4" fill="#1E1B4B"/>
      <!-- Sharp gritted teeth mouth -->
      <path d="M40 59 L44 56 L48 60 L52 56 L56 60 L60 56" stroke="#450A0A" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Anger & Fire emojis -->
      <text x="74" y="26" font-size="12" fill="#EF4444">💢</text>
      <text x="14" y="26" font-size="11" fill="#DC2626">🔥</text>
    `,
    smug: `
      <!-- Smug / Sassy Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#C4B5FD"/>
      <!-- Half-closed smug eyes -->
      <path d="M34 46 Q40 42 46 45" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="42" cy="48" r="2.5" fill="#1E1B4B"/>
      <path d="M54 45 Q60 42 66 46" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="58" cy="48" r="2.5" fill="#1E1B4B"/>
      <!-- Sideways smirk -->
      <path d="M48 55 Q56 57 60 51" stroke="#1E1B4B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="30" cy="52" r="4" fill="#F472B6"/>
      <circle cx="70" cy="52" r="4" fill="#F472B6"/>
      <!-- Confidence sparkle -->
      <text x="74" y="32" font-size="10" fill="#FDE047">✨</text>
    `,
    dizzy: `
      <!-- Dizzy / Overwhelmed Ghost -->
      <path d="M20 50 C20 28 35 15 50 15 C65 15 80 28 80 50 L80 85 L70 78 L60 85 L50 78 L40 85 L30 78 L20 85 Z" fill="#E2E8F0"/>
      <!-- Cross eyes -->
      <text x="32" y="49" font-size="13" font-weight="bold" fill="#1E1B4B">×</text>
      <text x="54" y="49" font-size="13" font-weight="bold" fill="#1E1B4B">×</text>
      <!-- Wobbly wavy mouth -->
      <path d="M42 58 Q46 54 50 58 Q54 62 58 58" stroke="#1E1B4B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Dizzy stars -->
      <text x="20" y="24" font-size="11" fill="#FBBF24">💫</text>
      <text x="68" y="20" font-size="11" fill="#38BDF8">🌀</text>
    `
  };

  // Human-readable mood pill representations matching demo video badges
  const MOOD_PILLS = {
    idle: { text: 'MOOD: CHILL 😴', border: 'rgba(168, 85, 247, 0.5)', bg: 'rgba(168, 85, 247, 0.25)', color: '#f1f5f9' },
    happy: { text: 'MOOD: HAPPY ✨', border: 'rgba(74, 222, 128, 0.6)', bg: 'rgba(74, 222, 128, 0.2)', color: '#86efac' },
    curious: { text: 'MOOD: CURIOUS 🔍', border: 'rgba(56, 189, 248, 0.6)', bg: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc' },
    panicked: { text: 'MOOD: PANICKED 😱', border: 'rgba(239, 68, 68, 0.7)', bg: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5' },
    celebrating: { text: 'MOOD: PARTY 🎉', border: 'rgba(245, 158, 11, 0.7)', bg: 'rgba(245, 158, 11, 0.25)', color: '#fde047' },
    rage: { text: 'MOOD: RAGE 💢', border: 'rgba(220, 38, 38, 0.8)', bg: 'rgba(220, 38, 38, 0.3)', color: '#f87171' },
    smug: { text: 'MOOD: SMUG 😎', border: 'rgba(192, 132, 252, 0.7)', bg: 'rgba(192, 132, 252, 0.25)', color: '#e9d5ff' },
    dizzy: { text: 'MOOD: DIZZY 💫', border: 'rgba(251, 191, 36, 0.7)', bg: 'rgba(251, 191, 36, 0.25)', color: '#fef08a' }
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

    if (dockMoodPill) {
      const pillConfig = MOOD_PILLS[mood] || MOOD_PILLS.idle;
      dockMoodPill.textContent = pillConfig.text;
      dockMoodPill.style.borderColor = pillConfig.border;
      dockMoodPill.style.background = pillConfig.bg;
      dockMoodPill.style.color = pillConfig.color;
    }
  }

  function updateUI(state) {
    if (!state) return;

    // Mood & dialogue
    setMood(state.mood);
    if (speechTextBubble && speechTextBubble.textContent !== state.dialogue) {
      speechTextBubble.textContent = state.dialogue || '...';
    }

    // Header Level
    if (companionLvlBadge) {
      companionLvlBadge.textContent = 'LVL ' + (state.progression?.level ?? 1);
    }

    // Chaos
    const chaosVal = Math.round(state.chaos ?? 0);
    const stageName = state.chaosStage || (chaosVal > 75 ? 'Max Drama' : chaosVal > 45 ? 'Chaotic' : chaosVal > 15 ? 'Suspicious' : 'Chill');
    if (chaosNumber) {
      chaosNumber.textContent = `${chaosVal}% (${stageName})`;
    }
    if (chaosBarFill) {
      chaosBarFill.style.width = Math.min(100, Math.max(0, chaosVal)) + '%';
    }

    // Companion XP
    if (state.progression) {
      const currentXp = state.progression.xpInCurrentLevel ?? 0;
      const neededXp = state.progression.xpNeededForNextLevel ?? 100;
      if (xpNumber) {
        xpNumber.textContent = `${currentXp} / ${neededXp}`;
      }
      if (xpBarFill) {
        const pct = (currentXp / neededXp) * 100;
        xpBarFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
      }
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
