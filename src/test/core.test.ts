import * as assert from 'assert';
import { PersistenceManager } from '../persistence';
import { PersonalityEngine } from '../personality';
import { NormalizedEvent } from '../types';

describe('BugBoo Core Test Suite', () => {
  describe('Persistence & Progression Calculation', () => {
    it('calculates initial Level 1 for 0 XP', () => {
      const p = PersistenceManager.calculateProgression(0);
      assert.strictEqual(p.level, 1);
      assert.strictEqual(p.totalXp, 0);
      assert.strictEqual(p.xpInCurrentLevel, 0);
      assert.strictEqual(p.xpNeededForNextLevel, 100);
    });

    it('handles progression within Level 1', () => {
      const p = PersistenceManager.calculateProgression(45);
      assert.strictEqual(p.level, 1);
      assert.strictEqual(p.totalXp, 45);
      assert.strictEqual(p.xpInCurrentLevel, 45);
      assert.strictEqual(p.xpNeededForNextLevel, 100);
    });

    it('levels up to Level 2 at 100 XP', () => {
      const p = PersistenceManager.calculateProgression(100);
      assert.strictEqual(p.level, 2);
      assert.strictEqual(p.totalXp, 100);
      assert.strictEqual(p.xpInCurrentLevel, 0);
      assert.strictEqual(p.xpNeededForNextLevel, 200);
    });

    it('levels up to Level 3 at 300 XP (100 + 200)', () => {
      const p = PersistenceManager.calculateProgression(325);
      assert.strictEqual(p.level, 3);
      assert.strictEqual(p.totalXp, 325);
      assert.strictEqual(p.xpInCurrentLevel, 25);
      assert.strictEqual(p.xpNeededForNextLevel, 300);
    });

    it('gracefully handles negative XP by clamping to 0', () => {
      const p = PersistenceManager.calculateProgression(-50);
      assert.strictEqual(p.level, 1);
      assert.strictEqual(p.totalXp, 0);
    });
  });

  describe('Personality Engine & Chaos Logic', () => {
    const engine = new PersonalityEngine();

    it('triggers panicked mood and increases chaos on diagnostics increase', () => {
      const event: NormalizedEvent = {
        type: 'diagnostics_increased',
        timestamp: Date.now(),
        details: { diagnosticDelta: 2 }
      };
      const outcome = engine.evaluateEvent(event, 10);
      assert.strictEqual(outcome.mood, 'panicked');
      assert.ok(outcome.chaosDelta > 0);
      assert.strictEqual(outcome.xpDelta, 0);
      assert.ok(outcome.dialogue.length > 0);
    });

    it('triggers celebrating mood and awards XP on diagnostics decrease', () => {
      const event: NormalizedEvent = {
        type: 'diagnostics_decreased',
        timestamp: Date.now(),
        details: { diagnosticDelta: -2 }
      };
      const outcome = engine.evaluateEvent(event, 40);
      assert.strictEqual(outcome.mood, 'celebrating');
      assert.ok(outcome.chaosDelta < 0);
      assert.strictEqual(outcome.xpDelta, 10);
      assert.ok(outcome.dialogue.length > 0);
    });

    it('triggers curious mood when editor switches', () => {
      const event: NormalizedEvent = {
        type: 'active_editor_changed',
        timestamp: Date.now(),
        details: { fileName: 'index.ts' }
      };
      const outcome = engine.evaluateEvent(event, 0);
      assert.strictEqual(outcome.mood, 'curious');
      assert.strictEqual(outcome.chaosDelta, 0);
      assert.strictEqual(outcome.xpDelta, 0);
    });

    it('triggers save reaction with XP on document_saved', () => {
      const event: NormalizedEvent = {
        type: 'document_saved',
        timestamp: Date.now(),
        details: { fileName: 'test.ts' }
      };
      const outcome = engine.evaluateEvent(event, 10);
      assert.strictEqual(outcome.xpDelta, 2);
      assert.ok(outcome.chaosDelta <= 0);
    });

    it('evaluates chaos stages accurately across ranges', () => {
      assert.strictEqual(PersonalityEngine.getChaosStage(0), 'Chill');
      assert.strictEqual(PersonalityEngine.getChaosStage(24), 'Chill');
      assert.strictEqual(PersonalityEngine.getChaosStage(25), 'Suspicious');
      assert.strictEqual(PersonalityEngine.getChaosStage(49), 'Suspicious');
      assert.strictEqual(PersonalityEngine.getChaosStage(50), 'Chaotic');
      assert.strictEqual(PersonalityEngine.getChaosStage(74), 'Chaotic');
      assert.strictEqual(PersonalityEngine.getChaosStage(75), 'Maximum drama');
      assert.strictEqual(PersonalityEngine.getChaosStage(100), 'Maximum drama');
    });

    it('triggers AI prompting reaction when typing prompts', () => {
      const event: NormalizedEvent = {
        type: 'ai_prompting',
        timestamp: Date.now(),
        details: { fileName: 'AI Prompt' }
      };
      const outcome = engine.evaluateEvent(event, 20);
      assert.strictEqual(outcome.mood, 'curious');
      assert.strictEqual(outcome.xpDelta, 1);
      assert.ok(outcome.dialogue.length > 0);
    });

    it('prevents consecutive identical dialogue messages when multiple options exist', () => {
      const d1 = engine.getDialogue('diagnostics_increased');
      const d2 = engine.getDialogue('diagnostics_increased');
      assert.notStrictEqual(d1, d2);
    });
  });
});
