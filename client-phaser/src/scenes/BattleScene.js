import Phaser from 'phaser';
import { battleBridge, AiTier } from '../bridge/battleBridge.js';
import { getSkill } from '../data/skills.js';
import { MONSTERS, STARTER_IDS, createMonsterInstance } from '../data/monsters.js';
import { ENDING_DIALOGUE, getNodeById, getNextNodeId } from '../data/campaign.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { BattleHud, ELEMENT_META } from '../ui/BattleHud.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { gameState } from '../state/gameState.js';
import { audioManager } from '../audio/audioManager.js';

const FONT = 'monospace';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.runtime = data?.runtime ?? battleBridge.runtime;
    this.mode = data?.mode ?? 'quick';
    this.nodeId = data?.nodeId ?? null;
    this.node = this.mode === 'campaign' ? getNodeById(this.nodeId) : null;
    this.battleNumber = data?.battleNumber ?? 1;
    this.isBusy = false;
    this.battleEnded = false;
    this.bossPhase2Triggered = false;
    this.bossAuraRing = null;
    this.seedCounter = (Date.now() % 100000) + this.battleNumber * 97;

    if (this.mode === 'campaign' && this.node) {
      if (!gameState.party.some((m) => m.currentHp > 0)) {
        gameState.healAllParty();
      }
      this.party = gameState.party;
      this.activePartyIndex = Math.max(0, this.party.findIndex((m) => m.currentHp > 0));
      this.bag = gameState.bag;
      this.enemy = createMonsterInstance(this.node.enemyId, this.node.enemyLevel);
      this.aiTier = this.node.aiTier ?? AiTier.Trainer;
    } else {
      if (Array.isArray(data?.party) && data.party.length > 0) {
        this.party = data.party;
        this.activePartyIndex = data.activePartyIndex ?? 0;
        this.bag = data.bag ?? { potion: 3, super_potion: 1, antidote: 2, rift_orb: 3 };
      } else {
        this.party = STARTER_IDS.map((id) => createMonsterInstance(id, 5));
        this.activePartyIndex = 0;
        this.bag = { potion: 3, super_potion: 1, antidote: 2, rift_orb: 3 };
      }

      const allIds = Object.keys(MONSTERS);
      const enemyPool = allIds.length > 1 ? allIds.filter((id) => id !== this.player.id) : allIds;
      const enemyId = enemyPool[(this.battleNumber - 1) % enemyPool.length] ?? 'verdantix';
      const enemyLevel = 5 + Math.floor((this.battleNumber - 1) / 2);
      this.enemy = createMonsterInstance(enemyId, enemyLevel);
      this.aiTier = this.battleNumber % 3 === 0 ? AiTier.Boss : AiTier.Trainer;
    }

    this.idleFrame = 0;
    // Landscape 640x360 arena positions (y: 32..234)
    this.playerPos = { x: 158, y: 184 };
    this.enemyPos = { x: 484, y: 112 };
  }

  get player() {
    return this.party[this.activePartyIndex];
  }

  get isBossBattle() {
    return this.aiTier === AiTier.Boss || this.node?.type === 'boss';
  }

  nextSeed() {
    this.seedCounter = (this.seedCounter + 7919) >>> 0;
    return this.seedCounter;
  }

  async create() {
    this._buildArenaBackdrop();
    this._buildMonsterSprites();

    this.hud = new BattleHud(this, {
      onUseSkill: (skill) => this.handlePlayerAttack(skill),
      onGuard: () => this.handlePlayerGuard(),
      onUseItem: (itemId) => this.handleUseItem(itemId),
      onSwitchParty: (idx) => this.handlePartySwitch(idx),
      onRestart: () => {
        if (this.mode === 'campaign') {
          this.scene.start('WorldMapScene', { chapter: this.node?.chapter ?? 1 });
        } else {
          this.scene.restart({ mode: 'quick', runtime: this.runtime, battleNumber: 1 });
        }
      },
    });

    this.hud.setEngineRuntime(this.runtime);
    this.hud.setExitLabel(this.mode === 'campaign' ? 'MAP' : 'RST');
    if (this.mode === 'campaign' && this.node) {
      this.hud.setStageTitle(`CH.${this.node.chapter} ${this.node.title.toUpperCase()}`);
    } else {
      this.hud.setStageTitle(`QUICK BATTLE #${this.battleNumber}`);
    }
    this._syncHud(false);

    // Start battle or boss BGM
    audioManager.playBgm(this.isBossBattle ? 'boss' : 'battle');

    // 2-frame pixel idle animation timer
    this.time.addEvent({
      delay: 420,
      loop: true,
      callback: () => {
        this.idleFrame = this.idleFrame === 0 ? 1 : 0;
        this._applyMonsterTextures();
      },
    });

    // Play pre-battle story dialogue if present in campaign node
    if (this.mode === 'campaign' && this.node?.preDialogue?.length) {
      this._setBusy(true);
      this.hud.setLog(`${this.enemy.name} (Lv.${this.enemy.level}) muncul!`);
      await new DialogueBox(this).play(this.node.preDialogue);
      this._setBusy(false);
    }

    const introPrefix =
      this.mode === 'campaign' && this.node?.type === 'boss'
        ? 'BOSS '
        : this.mode === 'campaign' && this.node?.type === 'rival'
          ? 'Rival '
          : 'Wild ';
    this.hud.setLog(
      `${introPrefix}${this.enemy.name} (Lv.${this.enemy.level}) muncul!\nPilih aksi untuk ${this.player.name}.`
    );
  }

  _buildArenaBackdrop() {
    const themeKey =
      this.mode === 'campaign' && this.node?.arenaTheme && this.textures.exists(this.node.arenaTheme)
        ? this.node.arenaTheme
        : 'bg_arena_solara';

    // Wide Arena area: y: 32..234 (height 202, width 640)
    if (this.textures.exists(themeKey)) {
      const bg = this.add.image(320, 133, themeKey).setDepth(0);
      bg.setDisplaySize(640, 204);
    } else {
      const g = this.add.graphics().setDepth(0);
      g.fillStyle(0x0c172e, 1);
      g.fillRect(0, 32, 640, 56);
      g.fillStyle(0x132645, 1);
      g.fillRect(0, 88, 640, 48);
      g.fillStyle(0x1b3a54, 1);
      g.fillRect(0, 136, 640, 36);

      g.fillStyle(0x102538, 1);
      g.fillTriangle(0, 172, 120, 108, 240, 172);
      g.fillTriangle(190, 172, 340, 96, 490, 172);
      g.fillTriangle(430, 172, 560, 114, 640, 172);

      g.fillStyle(0x173c32, 1);
      g.fillRect(0, 172, 640, 28);
      g.fillStyle(0x122f2a, 1);
      g.fillRect(0, 200, 640, 36);
    }

    // Crisp grounded battle platforms right underneath each sprite
    const plat = this.add.graphics().setDepth(4);
    plat.fillStyle(0x091521, 0.72);
    plat.fillEllipse(this.enemyPos.x, this.enemyPos.y + 38, 136, 30);
    plat.fillStyle(0x1e4d3e, 0.9);
    plat.fillEllipse(this.enemyPos.x, this.enemyPos.y + 34, 126, 24);
    plat.lineStyle(2, 0x34d399, 0.45);
    plat.strokeEllipse(this.enemyPos.x, this.enemyPos.y + 34, 126, 24);

    plat.fillStyle(0x091521, 0.78);
    plat.fillEllipse(this.playerPos.x, this.playerPos.y + 42, 152, 32);
    plat.fillStyle(0x1e4d3e, 0.95);
    plat.fillEllipse(this.playerPos.x, this.playerPos.y + 38, 142, 26);
    plat.lineStyle(2, 0x38bdf8, 0.45);
    plat.strokeEllipse(this.playerPos.x, this.playerPos.y + 38, 142, 26);

    // Ambient floating fireflies spread across 640px arena
    for (let i = 0; i < 10; i++) {
      const mote = this.add
        .rectangle(36 + i * 62, 54 + (i % 3) * 44, 3, 3, i % 2 === 0 ? 0xfde047 : 0x38bdf8, 0.55)
        .setDepth(5);
      this.tweens.add({
        targets: mote,
        y: mote.y - 16,
        alpha: 0.12,
        yoyo: true,
        repeat: -1,
        duration: 1600 + i * 200,
        ease: 'Sine.easeInOut',
      });
    }
  }

  _buildMonsterSprites() {
    this.enemyShadow = this.add
      .ellipse(this.enemyPos.x, this.enemyPos.y + 34, 72, 14, 0x020617, 0.52)
      .setDepth(8);
    this.playerShadow = this.add
      .ellipse(this.playerPos.x, this.playerPos.y + 38, 82, 16, 0x020617, 0.56)
      .setDepth(8);

    // Landscape monster sprite scales (enemy: 1.65, player: 1.85)
    this.enemySprite = this.add
      .image(this.enemyPos.x, this.enemyPos.y, getMonsterTextureKey(this.enemy.id, 0))
      .setScale(1.65)
      .setFlipX(true)
      .setDepth(10);

    this.playerSprite = this.add
      .image(this.playerPos.x, this.playerPos.y, getMonsterTextureKey(this.player.id, 0))
      .setScale(1.85)
      .setDepth(12);

    this._startIdleTweens();
  }

  _startIdleTweens() {
    this.tweens.killTweensOf([this.playerSprite, this.enemySprite]);

    this.playerSprite.setPosition(this.playerPos.x, this.playerPos.y).setAlpha(1);
    this.enemySprite.setPosition(this.enemyPos.x, this.enemyPos.y).setAlpha(1);

    this.tweens.add({
      targets: this.playerSprite,
      y: this.playerPos.y - 4,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: this.enemySprite,
      y: this.enemyPos.y - 4,
      yoyo: true,
      repeat: -1,
      duration: 980,
      ease: 'Sine.easeInOut',
    });
  }

  _applyMonsterTextures() {
    if (!this.playerSprite || !this.enemySprite) return;
    const pKey = getMonsterTextureKey(this.player.id, this.idleFrame);
    const eKey = getMonsterTextureKey(this.enemy.id, this.idleFrame);
    if (this.textures.exists(pKey)) this.playerSprite.setTexture(pKey);
    if (this.textures.exists(eKey)) this.enemySprite.setTexture(eKey);
  }

  _syncHud(animateBars = true) {
    const playerSkills = (this.player.skills ?? []).map((id) => getSkill(id));
    this.hud.updateState(
      {
        player: this.player,
        enemy: this.enemy,
        playerSkills,
        party: this.party,
        activePartyIndex: this.activePartyIndex,
        bag: this.bag,
      },
      animateBars
    );
  }

  _setBusy(busy) {
    this.isBusy = busy;
    this.hud.setBusy(busy);
  }

  _delay(ms) {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }

  _spawnParticles(x, y, color = 0xffffff, count = 14) {
    if (!this.textures.exists('particle_pixel')) return;
    const emitter = this.add.particles(x, y, 'particle_pixel', {
      speed: { min: 45, max: 145 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.8, end: 0.3 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 260, max: 460 },
      tint: color,
      emitting: false,
    });
    emitter.setDepth(40);
    emitter.explode(count);
    this.time.delayedCall(520, () => emitter.destroy());
  }

  _spawnPopup(x, y, text, color = '#ffffff', fontSize = '14px') {
    const popup = this.add
      .text(x, y, text, {
        fontFamily: FONT,
        fontSize,
        fontStyle: 'bold',
        color,
        stroke: '#070b14',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(50);

    this.tweens.add({
      targets: popup,
      y: y - 34,
      alpha: 0,
      duration: 850,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy(),
    });
  }

  async _animateLunge(sprite, homePos, dx, dy) {
    this.tweens.killTweensOf(sprite);
    await new Promise((resolve) => {
      this.tweens.add({
        targets: sprite,
        x: homePos.x + dx,
        y: homePos.y + dy,
        duration: 120,
        ease: 'Quad.easeOut',
        yoyo: true,
        onComplete: () => {
          sprite.setPosition(homePos.x, homePos.y);
          resolve();
        },
      });
    });
  }

  async _animateHitFlash(sprite, shakeIntensity = 0) {
    if (shakeIntensity > 0) {
      this.cameras.main.shake(140, shakeIntensity);
    }
    sprite.setTintFill(0xffffff);
    await this._delay(80);
    if (sprite === this.enemySprite && this.bossPhase2Triggered) {
      sprite.setTint(0xf0abfc);
    } else {
      sprite.clearTint();
    }
    await new Promise((resolve) => {
      this.tweens.add({
        targets: sprite,
        alpha: 0.25,
        yoyo: true,
        repeat: 2,
        duration: 55,
        onComplete: () => {
          sprite.setAlpha(1);
          resolve();
        },
      });
    });
  }

  async _checkBossPhase2() {
    if (!this.isBossBattle || this.bossPhase2Triggered) return;
    if (this.enemy.currentHp <= 0 || this.enemy.currentHp > this.enemy.maxHp * 0.5) return;

    this.bossPhase2Triggered = true;
    audioManager.playSfx('boss_phase2');

    // Dramatic crimson/purple camera flash, shake & 28-particle burst
    this.cameras.main.flash(320, 168, 28, 120);
    this.cameras.main.shake(360, 0.014);
    this._spawnParticles(this.enemyPos.x, this.enemyPos.y, 0xc026d3, 28);

    // Awakening aura tint + pulsing crimson/purple ring behind boss
    this.enemySprite.setTint(0xf0abfc);
    if (!this.bossAuraRing) {
      this.bossAuraRing = this.add
        .circle(this.enemyPos.x, this.enemyPos.y + 4, 46, 0x9333ea, 0.22)
        .setStrokeStyle(2, 0xf43f5e, 0.85)
        .setDepth(9);
      this.tweens.add({
        targets: this.bossAuraRing,
        scale: 1.22,
        alpha: 0.42,
        yoyo: true,
        repeat: -1,
        duration: 720,
        ease: 'Sine.easeInOut',
      });
    }

    // Boost ATK+ for 4 turns & heal 10% adrenaline HP
    const healAmt = Math.max(1, Math.round(this.enemy.maxHp * 0.1));
    this.enemy.currentHp = Math.min(this.enemy.maxHp, this.enemy.currentHp + healAmt);
    this.enemy.status = 'AttackUp';
    this.enemy.statusTurns = 4;

    this.hud.setBossPhase2(true);
    this._syncHud(true);

    this._spawnPopup(this.enemyPos.x, this.enemyPos.y - 36, 'PHASE 2 AWAKENED!', '#f43f5e', '13px');
    this._spawnPopup(this.enemyPos.x, this.enemyPos.y - 16, `+${healAmt} HP  ATK+`, '#e879f9', '11px');
    this.hud.setLog(`${this.enemy.name} membangkitkan PHASE 2! (+${healAmt} HP & ATK+ aktif!)`);
    await this._delay(650);

    const phase2Lines =
      Array.isArray(this.node?.phase2Dialogue) && this.node.phase2Dialogue.length > 0
        ? this.node.phase2Dialogue
        : [
            {
              speaker: this.enemy.name,
              portrait: this.enemy.id === 'umbravex' ? 'portrait_umbravex' : 'portrait_warden',
              text: `${this.enemy.name.toUpperCase()} mengaum dahsyat! Aura kegelapan Eclipse melonjak — kekuatan Phase 2 telah bangkit!`,
            },
          ];

    await new DialogueBox(this).play(phase2Lines);
  }

  async _executeAttack(attacker, defender, skill, isPlayerAttacking) {
    const atkSprite = isPlayerAttacking ? this.playerSprite : this.enemySprite;
    const defSprite = isPlayerAttacking ? this.enemySprite : this.playerSprite;
    const atkHome = isPlayerAttacking ? this.playerPos : this.enemyPos;
    const defHome = isPlayerAttacking ? this.enemyPos : this.playerPos;

    const report = battleBridge.resolveAttack(attacker, defender, skill, this.nextSeed());

    const spCost = skill.spCost ?? 0;
    attacker.currentSp =
      report.attackerRemainingSp !== undefined
        ? report.attackerRemainingSp
        : Math.max(0, (attacker.currentSp ?? 0) - spCost);
    this._syncHud(true);

    if (report.paralyzed) {
      audioManager.playSfx('status');
      this.hud.setLog(`${attacker.name} lumpuh dan tidak bisa bergerak!`);
      this._spawnPopup(atkHome.x, atkHome.y - 26, 'PARALYZED!', '#facc15', '12px');
      await this._delay(650);
      return report;
    }

    await this._animateLunge(atkSprite, atkHome, isPlayerAttacking ? 42 : -42, isPlayerAttacking ? -16 : 16);

    if (report.missed) {
      audioManager.playSfx('miss');
      this.hud.setLog(`${attacker.name} memakai ${skill.name}, tetapi meleset!`);
      this._spawnPopup(defHome.x, defHome.y - 24, 'MISS!', '#94a3b8', '13px');
      await this._delay(600);
      return report;
    }

    const vfxColor = skill.vfxColor ?? (ELEMENT_META[skill.element]?.color ?? 0xffffff);
    if ((skill.power ?? 0) <= 0) {
      this._spawnParticles(atkHome.x, atkHome.y, vfxColor, 16);
      let logMsg = `${attacker.name} memakai ${skill.name}!`;
      if ((report.healed ?? 0) > 0) {
        audioManager.playSfx('heal');
        attacker.currentHp = report.attackerRemainingHp ?? Math.min(attacker.maxHp, attacker.currentHp + report.healed);
        this._spawnPopup(atkHome.x, atkHome.y - 24, `+${report.healed} HP`, '#4ade80', '14px');
        logMsg += ` (+${report.healed} HP)`;
      } else {
        audioManager.playSfx('status');
      }
      if (report.appliedStatus === 'Shield' || report.appliedStatus === 'AttackUp') {
        attacker.status = report.appliedStatus;
        attacker.statusTurns = report.statusTurns || 3;
        this._spawnPopup(atkHome.x, atkHome.y - 4, `${report.appliedStatus.toUpperCase()}!`, '#38bdf8', '11px');
        logMsg += ` [${report.appliedStatus} aktif]`;
      } else if (report.appliedStatus && report.appliedStatus !== 'None') {
        defender.status = report.appliedStatus;
        defender.statusTurns = report.statusTurns || 3;
        this._spawnPopup(defHome.x, defHome.y - 4, `${report.appliedStatus.toUpperCase()}!`, '#f97316', '11px');
        logMsg += ` (${defender.name} terkena ${report.appliedStatus}!)`;
      }
      this._syncHud(true);
      this.hud.setLog(logMsg);
      await this._delay(650);
      return report;
    }

    const isSuper = report.elementMultiplier > 1.05;
    const isResist = report.elementMultiplier < 0.95;

    // Play contextual impact SFX
    if (report.critical) {
      audioManager.playSfx('crit');
    } else if (isSuper) {
      audioManager.playSfx('super');
    } else {
      audioManager.playSfx(isPlayerAttacking ? 'attack' : 'hit');
    }

    this._spawnParticles(defHome.x, defHome.y, vfxColor, report.critical ? 22 : 14);

    const shake = report.critical ? 0.015 : isSuper ? 0.009 : 0;

    defender.currentHp = report.targetRemainingHp;
    this._syncHud(true);
    await this._animateHitFlash(defSprite, shake);

    const dmgLabel = report.critical ? `-${report.damage} CRIT!` : `-${report.damage}`;
    const dmgColor = report.critical ? '#fde047' : isSuper ? '#fb923c' : '#f8fafc';
    this._spawnPopup(defHome.x, defHome.y - 22, dmgLabel, dmgColor, report.critical ? '16px' : '14px');

    if (isSuper) {
      this._spawnPopup(defHome.x, defHome.y - 44, 'SUPER EFFECTIVE!', '#4ade80', '11px');
    } else if (isResist) {
      this._spawnPopup(defHome.x, defHome.y - 44, 'NOT EFFECTIVE', '#94a3b8', '10px');
    }

    let logMsg = `${attacker.name} memakai ${skill.name}! (${report.damage} dmg)`;
    if (report.critical) logMsg += ' CRITICAL!';
    if (isSuper) logMsg += ' Super Effective!';

    if (report.appliedStatus && report.appliedStatus !== 'None') {
      audioManager.playSfx('status');
      defender.status = report.appliedStatus;
      defender.statusTurns = report.statusTurns || 3;
      this._spawnPopup(defHome.x, defHome.y - 4, `${report.appliedStatus.toUpperCase()}!`, '#f97316', '11px');
      logMsg += `\n${defender.name} terkena ${report.appliedStatus}!`;
      this._syncHud(true);
    }

    this.hud.setLog(logMsg);
    await this._delay(700);
    return report;
  }

  _pickEnemySkill() {
    const enemySkills = (this.enemy.skills ?? []).map((id) => getSkill(id));
    const choice = battleBridge.chooseEnemySkill(
      this.enemy,
      this.player,
      enemySkills,
      this.aiTier,
      this.nextSeed()
    );
    return choice.skill ?? getSkill('quick_strike');
  }

  async handlePlayerAttack(skill) {
    if (this.isBusy || this.battleEnded) return;
    if ((this.player.currentSp ?? 0) < (skill.spCost ?? 0)) {
      this.hud.setLog('SP tidak cukup! Gunakan Quick Strike atau Guard.');
      return;
    }

    this._setBusy(true);
    this.player.guarding = false;
    this.enemy.guarding = false;

    const enemySkill = this._pickEnemySkill();
    const order = battleBridge.determineTurnOrder(this.player, skill, this.enemy, enemySkill);

    if (order.m1First) {
      const pRes = await this._executeAttack(this.player, this.enemy, skill, true);
      if (pRes.targetFainted) {
        await this._handleVictory();
        return;
      }
      await this._checkBossPhase2();

      const eRes = await this._executeAttack(this.enemy, this.player, enemySkill, false);
      if (eRes.targetFainted) {
        await this._handlePlayerFainted();
        return;
      }
    } else {
      const eRes = await this._executeAttack(this.enemy, this.player, enemySkill, false);
      if (eRes.targetFainted) {
        await this._handlePlayerFainted();
        return;
      }
      const pRes = await this._executeAttack(this.player, this.enemy, skill, true);
      if (pRes.targetFainted) {
        await this._handleVictory();
        return;
      }
      await this._checkBossPhase2();
    }

    await this._runEndOfTurnPhase();
  }

  async handlePlayerGuard() {
    if (this.isBusy || this.battleEnded) return;
    this._setBusy(true);

    audioManager.playSfx('guard');
    const guardRes = battleBridge.resolveGuard(this.player);
    this.player.guarding = true;
    this.player.currentSp = guardRes.currentSp;
    this._syncHud(true);

    this._spawnParticles(this.playerPos.x, this.playerPos.y, 0x38bdf8, 12);
    this._spawnPopup(this.playerPos.x, this.playerPos.y - 26, `GUARD +${guardRes.spRestored} SP`, '#38bdf8', '12px');
    this.hud.setLog(`${this.player.name} bertahan! Damage -40% & pulih +${guardRes.spRestored} SP.`);
    await this._delay(650);

    const enemySkill = this._pickEnemySkill();
    const eRes = await this._executeAttack(this.enemy, this.player, enemySkill, false);
    this.player.guarding = false;

    if (eRes.targetFainted) {
      await this._handlePlayerFainted();
      return;
    }

    await this._runEndOfTurnPhase();
  }

  async handleUseItem(itemId) {
    if (this.isBusy || this.battleEnded) return;
    if ((this.bag[itemId] ?? 0) <= 0) return;

    this._setBusy(true);
    this.player.guarding = false;

    if (itemId === 'potion' || itemId === 'super_potion') {
      const healAmount = itemId === 'super_potion' ? 90 : 45;
      if (this.player.currentHp >= this.player.maxHp) {
        this.hud.setLog(`HP ${this.player.name} sudah penuh!`);
        this._setBusy(false);
        return;
      }
      audioManager.playSfx('heal');
      this.bag[itemId] -= 1;
      const before = this.player.currentHp;
      this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + healAmount);
      const actual = this.player.currentHp - before;
      this._syncHud(true);

      this._spawnParticles(this.playerPos.x, this.playerPos.y, 0x4ade80, 14);
      this._spawnPopup(this.playerPos.x, this.playerPos.y - 26, `+${actual} HP`, '#4ade80', '14px');
      this.hud.setLog(
        `Menggunakan ${itemId === 'super_potion' ? 'Super Potion' : 'Potion'}! ${this.player.name} pulih +${actual} HP.`
      );
      await this._delay(700);
    } else if (itemId === 'antidote') {
      if (!this.player.status || this.player.status === 'None') {
        this.hud.setLog(`${this.player.name} tidak memiliki status negatif.`);
        this._setBusy(false);
        return;
      }
      audioManager.playSfx('heal');
      this.bag.antidote -= 1;
      this.player.status = 'None';
      this.player.statusTurns = 0;
      this._syncHud(true);

      this._spawnParticles(this.playerPos.x, this.playerPos.y, 0xc084fc, 12);
      this._spawnPopup(this.playerPos.x, this.playerPos.y - 26, 'CURED!', '#e9d5ff', '13px');
      this.hud.setLog(`Antidote menyembuhkan status ${this.player.name}!`);
      await this._delay(650);
    } else if (itemId === 'rift_orb') {
      audioManager.playSfx('capture_throw');
      this.bag.rift_orb -= 1;
      this._syncHud(true);
      this.hud.setLog(`Melempar Rift Orb ke ${this.enemy.name}...`);

      const orb = this.add
        .circle(this.playerPos.x + 24, this.playerPos.y - 10, 8, 0x38bdf8)
        .setStrokeStyle(2, 0xf8fafc)
        .setDepth(35);
      await new Promise((resolve) => {
        this.tweens.add({
          targets: orb,
          x: this.enemyPos.x,
          y: this.enemyPos.y,
          duration: 380,
          ease: 'Quad.easeOut',
          onComplete: resolve,
        });
      });

      this._spawnParticles(this.enemyPos.x, this.enemyPos.y, 0x38bdf8, 18);
      const cap = battleBridge.calculateCapture(this.enemy, 1.25, this.nextSeed());
      this.enemySprite.setAlpha(0.25);

      for (let i = 0; i < Math.max(1, cap.shakes); i++) {
        await new Promise((resolve) => {
          this.tweens.add({
            targets: orb,
            x: this.enemyPos.x + (i % 2 === 0 ? 8 : -8),
            duration: 140,
            yoyo: true,
            onComplete: resolve,
          });
        });
        await this._delay(120);
      }

      orb.destroy();

      if (cap.captured) {
        audioManager.playSfx('capture_ok');
        this.enemySprite.setVisible(false);
        this.bossAuraRing?.setVisible(false);
        this.battleEnded = true;
        this._spawnPopup(this.enemyPos.x, this.enemyPos.y - 24, 'CAPTURED!', '#38bdf8', '16px');
        this.hud.setLog(`Berhasil! ${this.enemy.name} tertangkap oleh Rift Orb!`);
        await this._delay(650);

        if (this.mode === 'campaign' && this.node) {
          const dest = gameState.addCapturedMonster(this.enemy);
          const destLabel = dest === 'party' ? 'bergabung ke Party!' : 'masuk ke Rift Storage!';
          await this._completeCampaignBattle({
            title: 'CAPTURED!',
            subtitle: `${this.enemy.name} ${destLabel}`,
            accentColor: 0x38bdf8,
            extraNote: `Catch Rate: ${Math.round(cap.catchRate * 100)}%`,
          });
        } else {
          this._showNextBattleModal(
            'CAPTURED!',
            `${this.enemy.name} masuk ke Rift Storage!`,
            `Catch Rate: ${Math.round(cap.catchRate * 100)}%\nTim siap melanjutkan petualangan.`,
            0x38bdf8
          );
        }
        return;
      }

      audioManager.playSfx('capture_fail');
      this.enemySprite.setAlpha(1);
      this._spawnPopup(this.enemyPos.x, this.enemyPos.y - 24, 'BROKE FREE!', '#f97316', '12px');
      this.hud.setLog(`${this.enemy.name} berhasil melepaskan diri dari Rift Orb!`);
      await this._delay(650);
    }

    const enemySkill = this._pickEnemySkill();
    const eRes = await this._executeAttack(this.enemy, this.player, enemySkill, false);
    if (eRes.targetFainted) {
      await this._handlePlayerFainted();
      return;
    }

    await this._runEndOfTurnPhase();
  }

  async handlePartySwitch(newIndex) {
    if (this.isBusy || this.battleEnded) return;
    if (newIndex === this.activePartyIndex) return;
    if (!this.party[newIndex] || this.party[newIndex].currentHp <= 0) return;

    const wasFainted = this.player.currentHp <= 0;
    this._setBusy(true);

    this.activePartyIndex = newIndex;
    this.player.guarding = false;
    this._applyMonsterTextures();
    this._startIdleTweens();
    this._syncHud(false);

    this._spawnParticles(this.playerPos.x, this.playerPos.y, ELEMENT_META[this.player.element]?.color ?? 0x38bdf8, 14);
    this.hud.setLog(`Maju, ${this.player.name}!`);
    this.hud.setMode('FIGHT');
    await this._delay(550);

    if (!wasFainted) {
      const enemySkill = this._pickEnemySkill();
      const eRes = await this._executeAttack(this.enemy, this.player, enemySkill, false);
      if (eRes.targetFainted) {
        await this._handlePlayerFainted();
        return;
      }
      await this._runEndOfTurnPhase();
    } else {
      this.hud.setLog(`Giliran ${this.player.name}! Pilih aksimu.`);
      this._setBusy(false);
    }
  }

  async _runEndOfTurnPhase() {
    const pTick = battleBridge.processStatusTick(this.player, this.nextSeed());
    this.player.currentHp = pTick.remainingHp;
    this.player.currentSp = pTick.nextSp;
    this.player.status = pTick.nextStatus;
    this.player.statusTurns = pTick.nextStatusTurns;

    if (pTick.damage > 0) {
      audioManager.playSfx('status');
      this._syncHud(true);
      this._spawnPopup(this.playerPos.x, this.playerPos.y - 22, `-${pTick.damage} ${pTick.status}`, '#f97316', '12px');
      this.hud.setLog(pTick.message);
      await this._delay(600);
      if (pTick.fainted) {
        await this._handlePlayerFainted();
        return;
      }
    }

    const eTick = battleBridge.processStatusTick(this.enemy, this.nextSeed());
    this.enemy.currentHp = eTick.remainingHp;
    this.enemy.currentSp = eTick.nextSp;
    this.enemy.status = eTick.nextStatus;
    this.enemy.statusTurns = eTick.nextStatusTurns;

    if (eTick.damage > 0) {
      audioManager.playSfx('status');
      this._syncHud(true);
      this._spawnPopup(this.enemyPos.x, this.enemyPos.y - 22, `-${eTick.damage} ${eTick.status}`, '#f97316', '12px');
      this.hud.setLog(eTick.message);
      await this._delay(600);
      if (eTick.fainted) {
        await this._handleVictory();
        return;
      }
      await this._checkBossPhase2();
    }

    this._syncHud(true);
    this._startIdleTweens();
    this.hud.setLog(`Giliran ${this.player.name}! Pilih skill atau aksi.`);
    this._setBusy(false);
  }

  async _handlePlayerFainted() {
    audioManager.playSfx('hit');
    this._spawnParticles(this.playerPos.x, this.playerPos.y, 0xef4444, 18);
    this.playerSprite.setAlpha(0.25);
    this.hud.setLog(`${this.player.name} tumbang!`);
    await this._delay(700);

    const aliveIdx = this.party.findIndex((m) => m.currentHp > 0);
    if (aliveIdx !== -1) {
      this.hud.setMode('PARTY');
      this.hud.setLog(`${this.player.name} tumbang! Pilih Monsver lain dari PARTY.`);
      this._syncHud(false);
      this._setBusy(false);
      return;
    }

    this.battleEnded = true;
    audioManager.stopBgm();
    audioManager.playSfx('defeat');

    if (this.mode === 'campaign') {
      gameState.healAllParty();
      this.hud.showResultModal({
        title: 'DEFEATED',
        subtitle: 'Seluruh Monsver dalam party tumbang!',
        detail: 'Tim telah dipulihkan di Camp.\nLatih Monsver-mu dan coba lagi!',
        buttonLabel: 'KEMBALI KE MAP',
        accentColor: 0xef4444,
        onAction: () => this.scene.start('WorldMapScene', { chapter: this.node?.chapter ?? 1 }),
      });
      return;
    }

    this.hud.showResultModal({
      title: 'DEFEATED',
      subtitle: 'Seluruh Monsver dalam party tumbang!',
      detail: `Tantangan berhenti di Battle #${this.battleNumber}.\nPulihkan tim dan coba lagi!`,
      buttonLabel: 'PLAY AGAIN',
      accentColor: 0xef4444,
      onAction: () => this.scene.restart({ mode: 'quick', runtime: this.runtime, battleNumber: 1 }),
    });
  }

  async _handleVictory() {
    this.battleEnded = true;
    audioManager.stopBgm();
    audioManager.playSfx('victory');

    this._spawnParticles(this.enemyPos.x, this.enemyPos.y, 0xfde047, 24);
    this.bossAuraRing?.setVisible(false);
    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0,
      y: this.enemyPos.y + 18,
      duration: 380,
    });

    if (this.mode === 'campaign' && this.node) {
      await this._completeCampaignBattle({
        title: 'VICTORY!',
        subtitle: `${this.enemy.name} berhasil dikalahkan!`,
        accentColor: 0x22c55e,
      });
      return;
    }

    const xpGain = 35 + this.enemy.level * 12;
    const xpRes = battleBridge.grantXp(this.player, xpGain);
    this._applyXpResult(xpRes);

    const lvlNote = xpRes.leveledUp ? `\nLEVEL UP! ${this.player.name} naik ke Lv.${xpRes.newLevel}!` : '';
    this.hud.setLog(`${this.enemy.name} tumbang! +${xpGain} XP.${lvlNote}`);
    await this._delay(850);

    this._showNextBattleModal(
      'VICTORY!',
      `${this.enemy.name} berhasil dikalahkan!`,
      `${this.player.name} mendapat +${xpGain} XP${lvlNote}`,
      0x22c55e
    );
  }

  _applyXpResult(xpRes) {
    this.player.level = xpRes.newLevel;
    this.player.xp = xpRes.xp;
    this.player.xpToNext = xpRes.xpToNext;
    this.player.maxHp = xpRes.maxHp;
    this.player.currentHp = xpRes.currentHp;
    this.player.attack = xpRes.attack;
    this.player.defense = xpRes.defense;
    this.player.speed = xpRes.speed;
    this._syncHud(true);

    if (xpRes.leveledUp) {
      audioManager.playSfx('levelup');
      this._spawnPopup(this.playerPos.x, this.playerPos.y - 34, `LEVEL UP! Lv.${xpRes.newLevel}`, '#fde047', '14px');
    }
  }

  async _showEvolutionCeremony(evo) {
    const cx = 320;
    const cy = 148;

    audioManager.playSfx('evolve');

    // Flash player sprite and swap texture
    this.playerSprite.setTintFill(0xfef08a);
    this._spawnParticles(this.playerPos.x, this.playerPos.y, 0xfde047, 28);
    await this._delay(240);
    this._applyMonsterTextures();
    this.playerSprite.clearTint();
    this._syncHud(true);

    this.tweens.add({
      targets: this.playerSprite,
      scale: 2.2,
      yoyo: true,
      duration: 240,
      ease: 'Back.easeOut',
      onComplete: () => this.playerSprite.setScale(1.85),
    });

    const banner = this.add.container(0, 0).setDepth(75);
    const bg = this.add.rectangle(cx, cy, 380, 84, 0x0b1222, 0.96).setStrokeStyle(3, 0xfacc15);
    const title = this.add
      .text(cx, cy - 18, '★ EVOLUTION CEREMONY! ★', {
        fontFamily: FONT,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#fde047',
      })
      .setOrigin(0.5);
    const msg = this.add
      .text(cx, cy + 12, `${evo.oldName} berevolusi menjadi ${evo.newName}!`, {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f8fafc',
        align: 'center',
        wordWrap: { width: 344 },
      })
      .setOrigin(0.5);

    banner.add([bg, title, msg]);
    this.hud.setLog(`${evo.oldName} berevolusi menjadi ${evo.newName}!`);
    await this._delay(1750);
    banner.destroy(true);
  }

  async _completeCampaignBattle({ title, subtitle, accentColor = 0x22c55e, extraNote = '' }) {
    const node = this.node;
    const xpGain = node.xpReward ?? 35 + this.enemy.level * 12;
    const xpRes = battleBridge.grantXp(this.player, xpGain);
    this._applyXpResult(xpRes);

    const lvlNote = xpRes.leveledUp ? ` • LEVEL UP Lv.${xpRes.newLevel}!` : '';
    this.hud.setLog(`+${xpGain} XP & +${node.goldReward ?? 0}G!${lvlNote}`);
    await this._delay(750);

    // Check evolution trigger
    let evoNote = '';
    const shouldEvolve =
      xpRes.canEvolve ||
      Boolean(this.player.evolvesTo && this.player.evolvesAt && this.player.level >= this.player.evolvesAt);
    if (shouldEvolve) {
      const evo = gameState.applyEvolution(this.player);
      if (evo) {
        evoNote = `\n${evo.oldName} berevolusi menjadi ${evo.newName}!`;
        await this._showEvolutionCeremony(evo);
      }
    }

    // Clear node & persist rewards
    gameState.markNodeCleared(node.id, node.goldReward ?? 0, node.itemRewards ?? {});

    // Play post-battle dialogue (and ending dialogue if final node)
    if (Array.isArray(node.postDialogue) && node.postDialogue.length > 0) {
      await new DialogueBox(this).play(node.postDialogue);
    }
    if (getNextNodeId(node.id) === null && Array.isArray(ENDING_DIALOGUE) && ENDING_DIALOGUE.length > 0) {
      await new DialogueBox(this).play(ENDING_DIALOGUE);
    }

    const detailLines = [
      `${this.player.name} mendapat +${xpGain} XP${lvlNote}`,
      `Reward: +${node.goldReward ?? 0} Gold`,
    ];
    if (extraNote) detailLines.push(extraNote);
    if (evoNote) detailLines.push(evoNote.trim());

    this.hud.showResultModal({
      title,
      subtitle,
      detail: detailLines.join('\n'),
      buttonLabel: 'KEMBALI KE MAP',
      accentColor,
      onAction: () => this.scene.start('WorldMapScene', { chapter: node.chapter }),
    });
  }

  _showNextBattleModal(title, subtitle, detail, accentColor) {
    this.hud.showResultModal({
      title,
      subtitle,
      detail,
      buttonLabel: 'NEXT BATTLE',
      accentColor,
      onAction: () => {
        this.party.forEach((m) => {
          if (m.currentHp > 0) {
            m.currentHp = Math.min(m.maxHp, m.currentHp + Math.round(m.maxHp * 0.3));
            m.currentSp = Math.min(m.maxSp, m.currentSp + 12);
          }
          m.status = 'None';
          m.statusTurns = 0;
          m.guarding = false;
        });
        this.scene.restart({
          mode: 'quick',
          runtime: this.runtime,
          battleNumber: this.battleNumber + 1,
          party: this.party,
          activePartyIndex: this.activePartyIndex,
          bag: this.bag,
        });
      },
    });
  }
}
