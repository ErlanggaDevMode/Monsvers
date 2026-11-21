/**
 * Bridge between Phaser.js client and the C++20 BattleEngine (WebAssembly).
 *
 * When `public/wasm/monsvers_engine.js` is built via Emscripten, all combat
 * math runs inside the compiled C++ WASM module. Otherwise, an identical
 * deterministic JS fallback keeps local development immediately playable.
 */

export const Element = Object.freeze({
  Neutral: 0,
  Fire: 1,
  Water: 2,
  Nature: 3,
  Electric: 4,
  Shadow: 5,
});

function fallbackEffectiveness(attackEl, defendEl) {
  if (attackEl === Element.Fire) {
    if (defendEl === Element.Nature) return 1.5;
    if (defendEl === Element.Water) return 0.75;
  } else if (attackEl === Element.Water) {
    if (defendEl === Element.Fire) return 1.5;
    if (defendEl === Element.Nature || defendEl === Element.Electric) return 0.75;
  } else if (attackEl === Element.Nature) {
    if (defendEl === Element.Water) return 1.5;
    if (defendEl === Element.Fire) return 0.75;
  } else if (attackEl === Element.Electric) {
    if (defendEl === Element.Water) return 1.5;
    if (defendEl === Element.Nature) return 0.75;
  } else if (attackEl === Element.Shadow && defendEl === Element.Shadow) {
    return 1.25;
  }
  return 1.0;
}

function fallbackCalculateDamage(attacker, defender, skill, forceCrit = false) {
  const elementMultiplier = fallbackEffectiveness(skill.element, defender.element);
  const stab = skill.element !== Element.Neutral && skill.element === attacker.element;
  const critical = Boolean(forceCrit);

  const levelFactor = (2.0 * attacker.level) / 5.0 + 2.0;
  const atkRatio = Math.max(1, attacker.attack) / Math.max(1, defender.defense);

  let raw = (levelFactor * skill.power * atkRatio) / 10.0 + 2.0;
  raw *= elementMultiplier;
  if (stab) raw *= 1.2;
  if (critical) raw *= 1.5;

  const damage = Math.max(1, Math.round(raw));
  const targetRemainingHp = Math.max(0, defender.currentHp - damage);

  return {
    damage,
    elementMultiplier,
    stab,
    critical,
    targetFainted: targetRemainingHp === 0,
    targetRemainingHp,
  };
}

class BattleBridge {
  constructor() {
    this.wasm = null;
    this.runtime = 'js-fallback';
  }

  async init() {
    try {
      const wasmUrl = './wasm/monsvers_engine.js';
      const mod = await import(/* @vite-ignore */ wasmUrl);
      if (typeof mod.default === 'function') {
        this.wasm = await mod.default();
        this.runtime = 'cpp-wasm';
      }
    } catch {
      this.wasm = null;
      this.runtime = 'js-fallback';
    }
    return this.runtime;
  }

  calculateDamage(attacker, defender, skill, forceCrit = false) {
    if (this.wasm && typeof this.wasm.calculateDamage === 'function') {
      return this.wasm.calculateDamage(attacker, defender, skill, forceCrit);
    }
    return fallbackCalculateDamage(attacker, defender, skill, forceCrit);
  }
}

export const battleBridge = new BattleBridge();
