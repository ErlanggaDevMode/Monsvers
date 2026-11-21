/**
 * Unified Bridge between Phaser 3 Client and C++20/WASM BattleEngine.
 *
 * Dynamically loads `./wasm/monsvers_engine.js` when available and detects
 * exported C++ functions (`resolveAttack`, `processStatusTick`,
 * `chooseEnemySkill`, `calculateCapture`, `grantXp`, etc.). Any method not
 * exported by the current WASM build falls back seamlessly to deterministic
 * JS equivalents matching docs/GDD.md.
 */

export const Element = Object.freeze({
  Neutral: 0,
  Fire: 1,
  Water: 2,
  Nature: 3,
  Electric: 4,
  Shadow: 5,
});

export const StatusType = Object.freeze({
  None: 0,
  Burn: 1,
  Poison: 2,
  Paralyze: 3,
  Shield: 4,
  AttackUp: 5,
});

export const AiTier = Object.freeze({
  Wild: 0,
  Trainer: 1,
  Boss: 2,
});

const STATUS_NAMES = ['None', 'Burn', 'Poison', 'Paralyze', 'Shield', 'AttackUp'];

function toStatusName(status) {
  if (typeof status === 'string') {
    const match = STATUS_NAMES.find((s) => s.toLowerCase() === status.toLowerCase());
    return match ?? 'None';
  }
  if (typeof status === 'number' && status >= 0 && status < STATUS_NAMES.length) {
    return STATUS_NAMES[status];
  }
  return 'None';
}

function toStatusCode(status) {
  const name = toStatusName(status);
  return StatusType[name] ?? StatusType.None;
}

/** Deterministic PRNG (Mulberry32) */
function createRng(seed) {
  let state = (Number(seed) || 1337) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

  const levelFactor = (2.0 * (attacker.level ?? 1)) / 5.0 + 2.0;
  const atkStat = Math.max(1, attacker.attack ?? 10);
  const defStat = Math.max(1, defender.defense ?? 10);
  const atkRatio = atkStat / defStat;

  let raw = (levelFactor * (skill.power ?? 30) * atkRatio) / 10.0 + 2.0;
  raw *= elementMultiplier;
  if (stab) raw *= 1.2;
  if (critical) raw *= 1.5;

  const damage = Math.max(1, Math.round(raw));
  const targetRemainingHp = Math.max(0, (defender.currentHp ?? 0) - damage);

  return {
    damage,
    elementMultiplier,
    stab,
    critical,
    targetFainted: targetRemainingHp === 0,
    targetRemainingHp,
  };
}

function fallbackResolveAttack(attacker, defender, skill, seed = Date.now()) {
  const rng = createRng(seed);
  const attackerStatus = toStatusName(attacker.status);
  const defenderStatus = toStatusName(defender.status);
  const spCost = skill.spCost ?? 0;

  // Paralyze check (25% chance to be immobilized)
  if (attackerStatus === 'Paralyze' && rng() < 0.25) {
    return {
      hit: false,
      missed: false,
      paralyzed: true,
      damage: 0,
      elementMultiplier: 1.0,
      stab: false,
      critical: false,
      targetFainted: false,
      targetRemainingHp: defender.currentHp,
      appliedStatus: 'None',
      statusTurns: 0,
      spCost: 0,
    };
  }

  // Accuracy check
  const accuracy = skill.accuracy ?? 100;
  if (rng() * 100 >= accuracy) {
    return {
      hit: false,
      missed: true,
      paralyzed: false,
      damage: 0,
      elementMultiplier: 1.0,
      stab: false,
      critical: false,
      targetFainted: false,
      targetRemainingHp: defender.currentHp,
      appliedStatus: 'None',
      statusTurns: 0,
      spCost,
    };
  }

  // Non-damaging support skill
  if ((skill.power ?? 0) <= 0) {
    const appliedStatus = toStatusName(skill.statusEffect);
    return {
      hit: true,
      missed: false,
      paralyzed: false,
      damage: 0,
      elementMultiplier: 1.0,
      stab: false,
      critical: false,
      targetFainted: false,
      targetRemainingHp: defender.currentHp,
      appliedStatus,
      statusTurns: appliedStatus !== 'None' ? 3 : 0,
      spCost,
    };
  }

  const elementMultiplier = fallbackEffectiveness(skill.element, defender.element);
  const stab = skill.element !== Element.Neutral && skill.element === attacker.element;
  const critRate = skill.critRatePct ?? 10;
  const critical = rng() * 100 < critRate;

  const levelFactor = (2.0 * (attacker.level ?? 1)) / 5.0 + 2.0;
  let effectiveAtk = Math.max(1, attacker.attack ?? 10);
  let effectiveDef = Math.max(1, defender.defense ?? 10);

  if (attackerStatus === 'AttackUp') effectiveAtk *= 1.25;
  if (attackerStatus === 'Burn') effectiveAtk *= 0.85;
  if (defenderStatus === 'Shield') effectiveDef *= 1.25;

  let raw = (levelFactor * skill.power * (effectiveAtk / effectiveDef)) / 10.0 + 2.0;
  raw *= elementMultiplier;
  if (stab) raw *= 1.2;
  if (critical) raw *= 1.5;
  if (defender.guarding) raw *= 0.6; // Guard reduces damage by 40%

  // Subtle deterministic variance (0.94..1.04)
  raw *= 0.94 + rng() * 0.1;

  const damage = Math.max(1, Math.round(raw));
  const targetRemainingHp = Math.max(0, defender.currentHp - damage);
  const targetFainted = targetRemainingHp === 0;

  let appliedStatus = 'None';
  let statusTurns = 0;
  const candidateStatus = toStatusName(skill.statusEffect);
  const statusChance = skill.statusChancePct ?? 0;

  if (!targetFainted && candidateStatus !== 'None' && statusChance > 0 && defenderStatus === 'None') {
    if (rng() * 100 < statusChance) {
      appliedStatus = candidateStatus;
      statusTurns = 3;
    }
  }

  return {
    hit: true,
    missed: false,
    paralyzed: false,
    damage,
    elementMultiplier,
    stab,
    critical,
    targetFainted,
    targetRemainingHp,
    appliedStatus,
    statusTurns,
    spCost,
  };
}

function fallbackResolveGuard(monster) {
  const maxSp = monster.maxSp ?? 40;
  const currentSp = monster.currentSp ?? 0;
  const spRestored = Math.min(maxSp - currentSp, Math.max(8, Math.round(maxSp * 0.25)));
  return {
    guarding: true,
    damageReductionPct: 40,
    spRestored,
    currentSp: currentSp + spRestored,
  };
}

function fallbackProcessStatusTick(monster) {
  const status = toStatusName(monster.status);
  const maxHp = Math.max(1, monster.maxHp ?? 100);
  const maxSp = monster.maxSp ?? 40;
  const spRegen = Math.min(maxSp - (monster.currentSp ?? 0), 4);
  const nextSp = Math.min(maxSp, (monster.currentSp ?? 0) + spRegen);

  let damage = 0;
  let message = '';
  let nextStatus = status;
  let nextStatusTurns = monster.statusTurns ?? 0;
  let statusExpired = false;

  if (status === 'Burn') {
    damage = Math.max(1, Math.round(maxHp * 0.08));
    message = `${monster.name} terkena luka bakar (-${damage} HP)!`;
  } else if (status === 'Poison') {
    damage = Math.max(1, Math.round(maxHp * 0.1));
    message = `${monster.name} terkena racun (-${damage} HP)!`;
  }

  const remainingHp = Math.max(0, (monster.currentHp ?? 0) - damage);
  const fainted = remainingHp === 0;

  if (status !== 'None' && !fainted) {
    nextStatusTurns = Math.max(0, nextStatusTurns - 1);
    if (nextStatusTurns <= 0) {
      statusExpired = true;
      nextStatus = 'None';
    }
  }

  return {
    status,
    damage,
    remainingHp,
    fainted,
    statusExpired,
    nextStatus,
    nextStatusTurns,
    spRegen,
    nextSp,
    message,
  };
}

function fallbackDetermineTurnOrder(m1, s1, m2, s2) {
  const p1 = s1?.priority ?? 0;
  const p2 = s2?.priority ?? 0;

  if (p1 !== p2) {
    const m1First = p1 > p2;
    return { first: m1First ? 'first' : 'second', order: m1First ? [0, 1] : [1, 0], m1First };
  }

  const spd1 = (m1?.speed ?? 10) * (toStatusName(m1?.status) === 'Paralyze' ? 0.5 : 1);
  const spd2 = (m2?.speed ?? 10) * (toStatusName(m2?.status) === 'Paralyze' ? 0.5 : 1);
  const m1First = spd1 >= spd2;
  return { first: m1First ? 'first' : 'second', order: m1First ? [0, 1] : [1, 0], m1First };
}

function fallbackChooseEnemySkill(enemy, player, skills, tier = AiTier.Trainer, seed = Date.now()) {
  const rng = createRng(seed);
  if (!Array.isArray(skills) || skills.length === 0) {
    return { skill: null, skillIndex: 0, reason: 'none' };
  }

  const usable = skills
    .map((skill, idx) => ({ skill, idx }))
    .filter(({ skill }) => (enemy.currentSp ?? 0) >= (skill.spCost ?? 0));

  const pool = usable.length > 0 ? usable : [{ skill: skills[0], idx: 0 }];

  if (tier === AiTier.Wild) {
    const pick = pool[Math.floor(rng() * pool.length)];
    return { skill: pick.skill, skillIndex: pick.idx, reason: 'wild-random' };
  }

  const scored = pool.map(({ skill, idx }) => {
    const eff = fallbackEffectiveness(skill.element, player.element);
    const stab = skill.element !== Element.Neutral && skill.element === enemy.element ? 1.2 : 1.0;
    const acc = (skill.accuracy ?? 100) / 100;
    let score = (skill.power ?? 25) * eff * stab * acc;

    if ((skill.priority ?? 0) > 0 && player.currentHp <= player.maxHp * 0.25) {
      score *= 1.35;
    }
    if (toStatusName(skill.statusEffect) !== 'None' && toStatusName(player.status) === 'None') {
      score += (skill.statusChancePct ?? 0) * 0.35;
    }
    return { skill, idx, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (tier === AiTier.Boss || scored.length === 1 || rng() < 0.8) {
    return { skill: scored[0].skill, skillIndex: scored[0].idx, reason: 'tactical-best' };
  }
  return { skill: scored[1].skill, skillIndex: scored[1].idx, reason: 'tactical-alt' };
}

function fallbackCalculateCapture(target, orbMultiplier = 1.0, seed = Date.now()) {
  const rng = createRng(seed);
  const hpRatio = Math.max(0, Math.min(1, (target.currentHp ?? 1) / Math.max(1, target.maxHp ?? 1)));
  const status = toStatusName(target.status);
  const statusBonus = status === 'Burn' || status === 'Poison' || status === 'Paralyze' ? 0.18 : 0;

  const baseRate = (1 - hpRatio * 0.72) * 0.65 + statusBonus;
  const catchRate = Math.max(0.08, Math.min(0.95, baseRate * (orbMultiplier || 1.0)));
  const roll = rng();
  const captured = roll < catchRate;

  let shakes = 3;
  if (!captured) {
    const closeness = roll - catchRate;
    shakes = closeness < 0.12 ? 2 : closeness < 0.3 ? 1 : 0;
  }

  return { captured, catchRate, shakes };
}

function fallbackGrantXp(monster, xpGained) {
  let level = monster.level ?? 1;
  let xp = (monster.xp ?? 0) + Math.max(0, Math.round(xpGained));
  let xpToNext = monster.xpToNext ?? level * 50;
  let maxHp = monster.maxHp ?? 100;
  let currentHp = monster.currentHp ?? maxHp;
  let attack = monster.attack ?? 20;
  let defense = monster.defense ?? 15;
  let speed = monster.speed ?? 15;
  let levelsGained = 0;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    levelsGained += 1;
    xpToNext = level * 50;
    const hpGain = Math.max(6, Math.round(maxHp * 0.09));
    maxHp += hpGain;
    currentHp = Math.min(maxHp, currentHp + hpGain);
    attack += Math.max(2, Math.round(attack * 0.08));
    defense += Math.max(2, Math.round(defense * 0.08));
    speed += Math.max(1, Math.round(speed * 0.07));
  }

  const canEvolve = Boolean(monster.evolvesAt && level >= monster.evolvesAt);

  return {
    xpGained,
    leveledUp: levelsGained > 0,
    levelsGained,
    newLevel: level,
    xp,
    xpToNext,
    maxHp,
    currentHp,
    attack,
    defense,
    speed,
    canEvolve,
  };
}

class BattleBridge {
  constructor() {
    this.wasm = null;
    this.runtime = 'js-fallback';
    this.capabilities = {
      resolveAttack: false,
      processStatusTick: false,
      chooseEnemySkill: false,
      calculateCapture: false,
      grantXp: false,
      calculateDamage: false,
    };
  }

  async init() {
    try {
      const baseHref =
        typeof window !== 'undefined' && window.location?.href
          ? window.location.href
          : import.meta.url;
      const wasmJsUrl = new URL('./wasm/monsvers_engine.js', baseHref).href;
      const wasmBaseUrl = new URL('./wasm/', baseHref).href;
      const mod = await import(/* @vite-ignore */ wasmJsUrl);
      if (typeof mod.default === 'function') {
        this.wasm = await mod.default({
          locateFile: (path) => `${wasmBaseUrl}${path}`,
        });
        this.runtime = 'cpp-wasm';
        this.capabilities = {
          resolveAttack: typeof this.wasm.resolveAttack === 'function',
          processStatusTick: typeof this.wasm.processStatusTick === 'function',
          chooseEnemySkill: typeof this.wasm.chooseEnemySkill === 'function',
          calculateCapture: typeof this.wasm.calculateCapture === 'function',
          grantXp: typeof this.wasm.grantXp === 'function',
          calculateDamage: typeof this.wasm.calculateDamage === 'function',
        };
      }
    } catch {
      this.wasm = null;
      this.runtime = 'js-fallback';
    }
    return this.runtime;
  }

  _toWasmElement(el) {
    if (!this.wasm?.Element) return el;
    const names = ['Neutral', 'Fire', 'Water', 'Nature', 'Electric', 'Shadow'];
    return this.wasm.Element[names[el] ?? 'Neutral'] ?? el;
  }

  _toWasmStatus(status) {
    const name = toStatusName(status);
    if (!this.wasm?.StatusType) return toStatusCode(name);
    return this.wasm.StatusType[name] ?? toStatusCode(name);
  }

  _toWasmMonster(m) {
    return {
      id: String(m.id ?? 'monsver'),
      name: String(m.name ?? 'Monsver'),
      element: this._toWasmElement(m.element ?? Element.Neutral),
      level: Number(m.level ?? 1),
      xp: Number(m.xp ?? 0),
      maxHp: Number(m.maxHp ?? 100),
      currentHp: Number(m.currentHp ?? 100),
      maxSp: Number(m.maxSp ?? 40),
      currentSp: Number(m.currentSp ?? 40),
      attack: Number(m.attack ?? 20),
      defense: Number(m.defense ?? 15),
      speed: Number(m.speed ?? 15),
      status: this._toWasmStatus(m.status),
      statusTurns: Number(m.statusTurns ?? 0),
      guarding: Boolean(m.guarding),
      evolvesAt: Number(m.evolvesAt ?? 0),
      evolvesTo: String(m.evolvesTo ?? ''),
    };
  }

  _toWasmSkill(s) {
    return {
      id: String(s.id ?? 'skill'),
      name: String(s.name ?? 'Skill'),
      element: this._toWasmElement(s.element ?? Element.Neutral),
      power: Number(s.power ?? 30),
      spCost: Number(s.spCost ?? 0),
      accuracy: Number(s.accuracy ?? 100),
      priority: Number(s.priority ?? 0),
      critRatePct: Number(s.critRatePct ?? 10),
      statusEffect: this._toWasmStatus(s.statusEffect),
      statusChancePct: Number(s.statusChancePct ?? 0),
      healPct: Number(s.healPct ?? 0),
    };
  }

  elementEffectiveness(attackEl, defendEl) {
    if (this.wasm && typeof this.wasm.elementEffectiveness === 'function') {
      try {
        return this.wasm.elementEffectiveness(
          this._toWasmElement(attackEl),
          this._toWasmElement(defendEl)
        );
      } catch {
        // fallback below
      }
    }
    return fallbackEffectiveness(attackEl, defendEl);
  }

  calculateDamage(attacker, defender, skill, forceCrit = false) {
    if (this.capabilities.calculateDamage) {
      try {
        return this.wasm.calculateDamage(
          this._toWasmMonster(attacker),
          this._toWasmMonster(defender),
          this._toWasmSkill(skill),
          Boolean(forceCrit)
        );
      } catch {
        // fallback below
      }
    }
    return fallbackCalculateDamage(attacker, defender, skill, forceCrit);
  }

  resolveAttack(attacker, defender, skill, seed = Date.now()) {
    if (this.capabilities.resolveAttack) {
      try {
        const res = this.wasm.resolveAttack(
          this._toWasmMonster(attacker),
          this._toWasmMonster(defender),
          this._toWasmSkill(skill),
          seed >>> 0
        );
        const appliedStatus = toStatusName(res.appliedStatus);
        const hit = Boolean(res.hit);
        const note = String(res.note ?? '');
        return {
          hit,
          missed: !hit && !note.toLowerCase().includes('sp'),
          paralyzed: false,
          damage: res.damage ?? 0,
          healed: res.healed ?? 0,
          elementMultiplier: res.elementMultiplier ?? 1.0,
          stab: Boolean(res.stab),
          critical: Boolean(res.critical),
          targetFainted: Boolean(res.targetFainted),
          targetRemainingHp: res.targetRemainingHp ?? Math.max(0, defender.currentHp - (res.damage ?? 0)),
          attackerRemainingSp: res.attackerRemainingSp ?? Math.max(0, (attacker.currentSp ?? 0) - (skill.spCost ?? 0)),
          attackerRemainingHp: res.attackerRemainingHp ?? attacker.currentHp,
          appliedStatus,
          statusTurns: appliedStatus !== 'None' ? 3 : 0,
          spCost: skill.spCost ?? 0,
          note,
          engine: 'cpp-wasm',
        };
      } catch {
        // fallback below
      }
    }
    return fallbackResolveAttack(attacker, defender, skill, seed);
  }

  resolveGuard(monster) {
    if (this.wasm && typeof this.wasm.resolveGuard === 'function') {
      try {
        const updated = this.wasm.resolveGuard(this._toWasmMonster(monster));
        const spRestored = Math.max(0, (updated.currentSp ?? monster.currentSp ?? 0) - (monster.currentSp ?? 0));
        return {
          guarding: Boolean(updated.guarding),
          damageReductionPct: 40,
          spRestored,
          currentSp: updated.currentSp ?? (monster.currentSp ?? 0) + spRestored,
          engine: 'cpp-wasm',
        };
      } catch {
        // fallback below
      }
    }
    return fallbackResolveGuard(monster);
  }

  processStatusTick(monster, seed = Date.now()) {
    if (this.capabilities.processStatusTick) {
      try {
        const res = this.wasm.processStatusTick(this._toWasmMonster(monster), seed >>> 0);
        const status = toStatusName(monster.status);
        const maxSp = monster.maxSp ?? 40;
        const spRegen = res.fainted ? 0 : Math.min(maxSp - (monster.currentSp ?? 0), 4);
        const statusExpired = Boolean(res.statusExpired);
        return {
          status,
          damage: res.damage ?? 0,
          skippedTurn: Boolean(res.skippedTurn),
          remainingHp: res.remainingHp ?? Math.max(0, monster.currentHp - (res.damage ?? 0)),
          fainted: Boolean(res.fainted),
          statusExpired,
          nextStatus: statusExpired ? 'None' : status,
          nextStatusTurns: res.remainingTurns ?? 0,
          spRegen,
          nextSp: Math.min(maxSp, (monster.currentSp ?? 0) + spRegen),
          message: res.note || (res.damage > 0 ? `${monster.name} terkena ${status} (-${res.damage} HP)!` : ''),
          engine: 'cpp-wasm',
        };
      } catch {
        // fallback below
      }
    }
    return fallbackProcessStatusTick(monster);
  }

  determineTurnOrder(m1, s1, m2, s2) {
    if (this.wasm && typeof this.wasm.determineTurnOrder === 'function') {
      try {
        const res = this.wasm.determineTurnOrder(
          Number(m1?.speed ?? 10),
          Number(s1?.priority ?? 0),
          this._toWasmStatus(m1?.status),
          Number(m2?.speed ?? 10),
          Number(s2?.priority ?? 0),
          this._toWasmStatus(m2?.status)
        );
        const m1First = res === 1;
        return { first: m1First ? 'first' : 'second', order: m1First ? [0, 1] : [1, 0], m1First, engine: 'cpp-wasm' };
      } catch {
        // fallback below
      }
    }
    return fallbackDetermineTurnOrder(m1, s1, m2, s2);
  }

  chooseEnemySkill(enemy, player, skills, tier = AiTier.Trainer, seed = Date.now()) {
    if (this.capabilities.chooseEnemySkill && typeof this.wasm.SkillList === 'function') {
      let skillList = null;
      try {
        skillList = new this.wasm.SkillList();
        for (const s of skills) {
          skillList.push_back(this._toWasmSkill(s));
        }
        const tierNames = ['Wild', 'Rival', 'Boss'];
        const wasmTier = this.wasm.AiTier
          ? this.wasm.AiTier[tierNames[tier] ?? 'Rival'] ?? this.wasm.AiTier.Rival
          : tier;
        const idx = this.wasm.chooseEnemySkill(
          this._toWasmMonster(enemy),
          this._toWasmMonster(player),
          skillList,
          wasmTier,
          seed >>> 0
        );
        if (idx === -1) {
          return { skill: null, skillIndex: -1, guard: true, reason: 'cpp-wasm-guard' };
        }
        const safeIdx = Math.max(0, Math.min(skills.length - 1, idx));
        return { skill: skills[safeIdx], skillIndex: safeIdx, guard: false, reason: 'cpp-wasm-ai' };
      } catch {
        // fallback below
      } finally {
        if (skillList && typeof skillList.delete === 'function') {
          skillList.delete();
        }
      }
    }
    return fallbackChooseEnemySkill(enemy, player, skills, tier, seed);
  }

  calculateCapture(target, orbMultiplier = 1.0, seed = Date.now()) {
    if (this.capabilities.calculateCapture) {
      try {
        const res = this.wasm.calculateCapture(
          this._toWasmMonster(target),
          Number(orbMultiplier) || 1.0,
          seed >>> 0
        );
        const captured = Boolean(res.caught ?? res.captured);
        return {
          captured,
          catchRate: res.probability ?? res.catchRate ?? 0.5,
          shakes: res.shakes ?? (captured ? 3 : 1),
          engine: 'cpp-wasm',
        };
      } catch {
        // fallback below
      }
    }
    return fallbackCalculateCapture(target, orbMultiplier, seed);
  }

  grantXp(monster, xpGained) {
    if (this.capabilities.grantXp) {
      try {
        const res = this.wasm.grantXp(this._toWasmMonster(monster), Math.round(xpGained));
        const levelsGained = Number(res.levelsGained ?? 0);
        const hpGain = Number(res.hpGain ?? 0);
        const maxHp = (monster.maxHp ?? 100) + hpGain;
        return {
          xpGained,
          leveledUp: levelsGained > 0,
          levelsGained,
          newLevel: res.newLevel ?? monster.level,
          xp: res.remainingXp ?? monster.xp,
          xpToNext: res.nextLevelXp ?? monster.xpToNext,
          maxHp,
          currentHp: Math.min(maxHp, (monster.currentHp ?? maxHp) + hpGain),
          attack: (monster.attack ?? 20) + Number(res.atkGain ?? 0),
          defense: (monster.defense ?? 15) + Number(res.defGain ?? 0),
          speed: (monster.speed ?? 15) + Number(res.spdGain ?? 0),
          canEvolve: Boolean(res.evolved),
          evolvedTo: res.evolvedTo || monster.evolvesTo || '',
          engine: 'cpp-wasm',
        };
      } catch {
        // fallback below
      }
    }
    return fallbackGrantXp(monster, xpGained);
  }
}

export const battleBridge = new BattleBridge();
