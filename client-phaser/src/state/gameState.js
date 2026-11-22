import { MONSTERS, createMonsterInstance } from '../data/monsters.js';
import { CAMPAIGN_NODES } from '../data/campaign.js';

export const SAVE_KEY = 'monsvers_save_v1';
const SAVE_VERSION = 1;
const MAX_PARTY_SIZE = 3;
const DEFAULT_BAG = { potion: 3, super_potion: 1, antidote: 2, rift_orb: 3 };
const NEW_GAME_BAG = { potion: 3, super_potion: 1, antidote: 2, rift_orb: 4 };

function getStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function getDefaultNodeId() {
  return CAMPAIGN_NODES[0]?.id ?? 'ch1_1';
}

function clampNonNegInt(val, fallback = 0) {
  return Number.isFinite(val) && val >= 0 ? Math.floor(val) : fallback;
}

function sanitizeMonster(raw) {
  const validId = raw?.id && MONSTERS[raw.id] ? raw.id : 'pyrofang';
  const def = MONSTERS[validId];
  const level = Number.isFinite(raw?.level) && raw.level >= 1 ? Math.floor(raw.level) : 5;
  const baseline = createMonsterInstance(validId, level);

  const maxHp =
    Number.isFinite(raw?.maxHp) && raw.maxHp > 0 ? Math.round(raw.maxHp) : baseline.maxHp;
  const maxSp =
    Number.isFinite(raw?.maxSp) && raw.maxSp > 0 ? Math.round(raw.maxSp) : baseline.maxSp;
  const currentHp = Number.isFinite(raw?.currentHp)
    ? Math.max(0, Math.min(maxHp, Math.round(raw.currentHp)))
    : maxHp;
  const currentSp = Number.isFinite(raw?.currentSp)
    ? Math.max(0, Math.min(maxSp, Math.round(raw.currentSp)))
    : maxSp;

  const skills =
    Array.isArray(raw?.skills) && raw.skills.length > 0
      ? raw.skills.filter((s) => typeof s === 'string' && s.length > 0)
      : [...def.skills];

  return {
    id: def.id,
    name: typeof raw?.name === 'string' && raw.name.trim() ? raw.name.trim() : def.name,
    element: raw?.element ?? def.element,
    level,
    xp: clampNonNegInt(raw?.xp, 0),
    xpToNext:
      Number.isFinite(raw?.xpToNext) && raw.xpToNext > 0
        ? Math.floor(raw.xpToNext)
        : baseline.xpToNext,
    maxHp,
    currentHp,
    maxSp,
    currentSp,
    attack:
      Number.isFinite(raw?.attack) && raw.attack > 0 ? Math.round(raw.attack) : baseline.attack,
    defense:
      Number.isFinite(raw?.defense) && raw.defense > 0 ? Math.round(raw.defense) : baseline.defense,
    speed: Number.isFinite(raw?.speed) && raw.speed > 0 ? Math.round(raw.speed) : baseline.speed,
    status: typeof raw?.status === 'string' && raw.status ? raw.status : 'None',
    statusTurns: clampNonNegInt(raw?.statusTurns, 0),
    guarding: Boolean(raw?.guarding),
    // Always rehydrate evolution metadata from current roster definitions
    evolvesAt: def.evolvesAt ?? null,
    evolvesTo: def.evolvesTo ?? null,
    skills: skills.length > 0 ? skills : [...def.skills],
  };
}

function sanitizeBag(rawBag, baseBag = DEFAULT_BAG) {
  const bag = { ...baseBag };
  if (rawBag && typeof rawBag === 'object' && !Array.isArray(rawBag)) {
    for (const [k, v] of Object.entries(rawBag)) {
      if (typeof k === 'string' && k.length > 0) {
        bag[k] = clampNonNegInt(v, bag[k] ?? 0);
      }
    }
  }
  return bag;
}

class GameState {
  constructor() {
    this.playerName = 'Arion';
    this.starterId = 'pyrofang';
    this.party = [createMonsterInstance('pyrofang', 5)];
    this.storage = [];
    this.bag = { ...DEFAULT_BAG };
    this.gold = 100;
    this.completedNodeIds = [];
    this.currentNodeId = getDefaultNodeId();
  }

  setPlayerName(name) {
    if (typeof name === 'string' && name.trim()) {
      this.playerName = name.trim().slice(0, 16);
      this.save();
    }
    return this.playerName;
  }

  _serialize() {
    return {
      version: SAVE_VERSION,
      updatedAt: Date.now(),
      playerName: this.playerName,
      party: this.party,
      storage: this.storage,
      bag: this.bag,
      gold: this.gold,
      completedNodeIds: this.completedNodeIds,
      currentNodeId: this.currentNodeId,
      starterId: this.starterId,
    };
  }

  _applyParsedState(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return false;
    }

    this.playerName =
      typeof parsed.playerName === 'string' && parsed.playerName.trim()
        ? parsed.playerName.trim().slice(0, 16)
        : 'Arion';

    const starterId =
      typeof parsed.starterId === 'string' && MONSTERS[parsed.starterId]
        ? parsed.starterId
        : 'pyrofang';

    const rawParty = Array.isArray(parsed.party) ? parsed.party : [];
    const sanitizedParty = rawParty.slice(0, MAX_PARTY_SIZE).map(sanitizeMonster);
    this.party =
      sanitizedParty.length > 0 ? sanitizedParty : [createMonsterInstance(starterId, 5)];

    const overflowParty = rawParty.slice(MAX_PARTY_SIZE).map(sanitizeMonster);
    const rawStorage = Array.isArray(parsed.storage) ? parsed.storage.map(sanitizeMonster) : [];
    this.storage = [...overflowParty, ...rawStorage];

    this.bag = sanitizeBag(parsed.bag, DEFAULT_BAG);
    this.gold = clampNonNegInt(parsed.gold, 100);

    const completed = Array.isArray(parsed.completedNodeIds)
      ? [...new Set(parsed.completedNodeIds.filter((id) => typeof id === 'string' && id.length > 0))]
      : [];
    this.completedNodeIds = completed;

    this.currentNodeId =
      typeof parsed.currentNodeId === 'string' && parsed.currentNodeId.length > 0
        ? parsed.currentNodeId
        : getDefaultNodeId();

    this.starterId = starterId;
    return true;
  }

  hasSave() {
    try {
      const storage = getStorage();
      const raw = storage?.getItem(SAVE_KEY);
      return typeof raw === 'string' && raw.length > 0;
    } catch {
      return false;
    }
  }

  save() {
    try {
      const storage = getStorage();
      if (!storage) return false;
      storage.setItem(SAVE_KEY, JSON.stringify(this._serialize()));
      return true;
    } catch {
      return false;
    }
  }

  load() {
    try {
      const storage = getStorage();
      const raw = storage?.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return this._applyParsedState(parsed);
    } catch {
      return false;
    }
  }

  clearSave() {
    try {
      const storage = getStorage();
      if (!storage) return false;
      storage.removeItem(SAVE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  resetNewGame(starterId = 'pyrofang', playerName = null) {
    const validStarter = MONSTERS[starterId] ? starterId : 'pyrofang';
    if (typeof playerName === 'string' && playerName.trim()) {
      this.playerName = playerName.trim().slice(0, 16);
    }
    this.starterId = validStarter;
    this.party = [createMonsterInstance(validStarter, 5)];
    this.storage = [];
    this.bag = { ...NEW_GAME_BAG };
    this.gold = 100;
    this.completedNodeIds = [];
    this.currentNodeId = getDefaultNodeId();
    this.save();
  }

  exportSaveJson() {
    try {
      return JSON.stringify(this._serialize());
    } catch {
      return '{}';
    }
  }

  importSaveJson(jsonStr) {
    try {
      if (typeof jsonStr !== 'string' || !jsonStr.trim()) return false;
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
      const hasRecognizableKey =
        'party' in parsed ||
        'version' in parsed ||
        'starterId' in parsed ||
        'bag' in parsed ||
        'completedNodeIds' in parsed;
      if (!hasRecognizableKey) return false;
      if (!this._applyParsedState(parsed)) return false;
      this.save();
      return true;
    } catch {
      return false;
    }
  }

  healAllParty() {
    for (const m of this.party) {
      m.currentHp = m.maxHp;
      m.currentSp = m.maxSp ?? 40;
      m.status = 'None';
      m.statusTurns = 0;
      m.guarding = false;
    }
    this.save();
  }

  addCapturedMonster(monster) {
    const clean = sanitizeMonster(monster);
    clean.currentHp = clean.maxHp;
    clean.currentSp = clean.maxSp;
    clean.status = 'None';
    clean.statusTurns = 0;
    clean.guarding = false;

    if (this.party.length < MAX_PARTY_SIZE) {
      this.party.push(clean);
      this.save();
      return 'party';
    }
    this.storage.push(clean);
    this.save();
    return 'storage';
  }

  swapPartyOrder(idxA, idxB) {
    if (
      !Number.isInteger(idxA) ||
      !Number.isInteger(idxB) ||
      idxA < 0 ||
      idxB < 0 ||
      idxA >= this.party.length ||
      idxB >= this.party.length ||
      idxA === idxB
    ) {
      return false;
    }
    [this.party[idxA], this.party[idxB]] = [this.party[idxB], this.party[idxA]];
    this.save();
    return true;
  }

  swapWithStorage(partyIdx, storageIdx) {
    if (
      !Number.isInteger(partyIdx) ||
      !Number.isInteger(storageIdx) ||
      partyIdx < 0 ||
      partyIdx >= this.party.length ||
      storageIdx < 0 ||
      storageIdx >= this.storage.length
    ) {
      return false;
    }
    const fromParty = this.party[partyIdx];
    this.party[partyIdx] = this.storage[storageIdx];
    this.storage[storageIdx] = fromParty;
    this.save();
    return true;
  }

  consumeItem(itemId) {
    if (typeof itemId !== 'string' || !itemId) return false;
    const count = this.bag[itemId] ?? 0;
    if (count <= 0) return false;
    this.bag[itemId] = count - 1;
    this.save();
    return true;
  }

  addRewards(gold = 0, itemRewards = {}) {
    if (Number.isFinite(gold) && gold > 0) {
      this.gold += Math.floor(gold);
    }
    if (itemRewards && typeof itemRewards === 'object') {
      for (const [k, v] of Object.entries(itemRewards)) {
        if (typeof k === 'string' && k && Number.isFinite(v) && v > 0) {
          this.bag[k] = (this.bag[k] ?? 0) + Math.floor(v);
        }
      }
    }
    this.save();
  }

  isNodeCleared(nodeId) {
    return this.completedNodeIds.includes(nodeId);
  }

  isNodeUnlocked(nodeId) {
    const idx = CAMPAIGN_NODES.findIndex((n) => n.id === nodeId);
    if (idx < 0) return false;
    if (idx === 0) return true;
    return this.completedNodeIds.includes(CAMPAIGN_NODES[idx - 1].id);
  }

  getHighestUnlockedChapter() {
    let highest = 1;
    for (const node of CAMPAIGN_NODES) {
      if (this.isNodeUnlocked(node.id) || this.isNodeCleared(node.id)) {
        if (Number.isFinite(node.chapter) && node.chapter > highest) {
          highest = node.chapter;
        }
      }
    }
    return highest;
  }

  markNodeCleared(nodeId, goldReward = 0, itemRewards = {}) {
    if (typeof nodeId === 'string' && nodeId && !this.completedNodeIds.includes(nodeId)) {
      this.completedNodeIds.push(nodeId);
    }

    if (Number.isFinite(goldReward) && goldReward > 0) {
      this.gold += Math.floor(goldReward);
    }
    if (itemRewards && typeof itemRewards === 'object') {
      for (const [k, v] of Object.entries(itemRewards)) {
        if (typeof k === 'string' && k && Number.isFinite(v) && v > 0) {
          this.bag[k] = (this.bag[k] ?? 0) + Math.floor(v);
        }
      }
    }

    const idx = CAMPAIGN_NODES.findIndex((n) => n.id === nodeId);
    if (idx >= 0 && idx + 1 < CAMPAIGN_NODES.length) {
      this.currentNodeId = CAMPAIGN_NODES[idx + 1].id;
    } else if (typeof nodeId === 'string' && nodeId) {
      this.currentNodeId = nodeId;
    }

    this.save();
  }

  applyEvolution(monster) {
    if (!monster?.evolvesTo || !MONSTERS[monster.evolvesTo]) return null;
    const evo = MONSTERS[monster.evolvesTo];
    const oldName = monster.name;
    const level = Number.isFinite(monster.level) && monster.level >= 1 ? monster.level : 10;
    const scale = 1 + (level - 1) * 0.12;

    monster.id = evo.id;
    monster.name = evo.name;
    monster.element = evo.element;
    monster.evolvesAt = evo.evolvesAt ?? null;
    monster.evolvesTo = evo.evolvesTo ?? null;
    monster.skills = [...evo.skills];

    monster.maxHp = Math.max((monster.maxHp ?? 100) + 24, Math.round(evo.baseHp * scale));
    monster.maxSp = Math.max((monster.maxSp ?? 40) + 10, evo.maxSp ?? 55);
    monster.attack = Math.max((monster.attack ?? 20) + 8, Math.round(evo.baseAttack * scale));
    monster.defense = Math.max((monster.defense ?? 15) + 6, Math.round(evo.baseDefense * scale));
    monster.speed = Math.max((monster.speed ?? 15) + 5, Math.round(evo.baseSpeed * scale));

    monster.currentHp = monster.maxHp;
    monster.currentSp = monster.maxSp;
    monster.status = 'None';
    monster.statusTurns = 0;
    monster.guarding = false;

    this.save();
    return { oldName, newName: evo.name, newId: evo.id };
  }

  getCampaignProgressPct() {
    if (!Array.isArray(CAMPAIGN_NODES) || CAMPAIGN_NODES.length === 0) return 0;
    const validNodeIds = new Set(CAMPAIGN_NODES.map((n) => n.id));
    let clearedCount = 0;
    for (const id of this.completedNodeIds) {
      if (validNodeIds.has(id)) clearedCount += 1;
    }
    return Math.max(0, Math.min(100, Math.round((clearedCount / CAMPAIGN_NODES.length) * 100)));
  }
}

export const gameState = new GameState();
