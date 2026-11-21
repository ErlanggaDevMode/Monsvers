import { Element } from '../bridge/battleBridge.js';

const FONT = 'monospace';

export const ELEMENT_META = {
  [Element.Neutral]: { label: 'NEUT', color: 0x94a3b8, hex: '#94a3b8', bg: 0x334155 },
  [Element.Fire]: { label: 'FIRE', color: 0xf97316, hex: '#fb923c', bg: 0x7c2d12 },
  [Element.Water]: { label: 'WATER', color: 0x38bdf8, hex: '#38bdf8', bg: 0x0c4a6e },
  [Element.Nature]: { label: 'NATURE', color: 0x22c55e, hex: '#4ade80', bg: 0x14532d },
  [Element.Electric]: { label: 'ELEC', color: 0xfacc15, hex: '#fde047', bg: 0x713f12 },
  [Element.Shadow]: { label: 'SHADOW', color: 0xa855f7, hex: '#c084fc', bg: 0x3b0764 },
};

const STATUS_BADGE = {
  Burn: { label: 'BRN', bg: 0x9a3412, text: '#fed7aa' },
  Poison: { label: 'PSN', bg: 0x581c87, text: '#e9d5ff' },
  Paralyze: { label: 'PAR', bg: 0x854d0e, text: '#fef08a' },
  Shield: { label: 'SHD', bg: 0x1e3a8a, text: '#bfdbfe' },
  AttackUp: { label: 'ATK+', bg: 0x991b1b, text: '#fecaca' },
};

function hpBarColor(ratio) {
  if (ratio > 0.5) return 0x22c55e;
  if (ratio > 0.25) return 0xf59e0b;
  return 0xef4444;
}

export class BattleHud {
  constructor(scene, callbacks) {
    this.scene = scene;
    this.cb = callbacks;
    this.mode = 'FIGHT';
    this.isBusy = false;
    this.state = null;

    this.deckContainer = null;
    this.modalContainer = null;
    this.tabButtons = {};

    this._buildTopBar();
    this._buildEnemyCard();
    this._buildPlayerCard();
    this._buildCommandDeckShell();
  }

  _drawPixelPanel(x, y, w, h, fill = 0x111a2e, border = 0x334155, depth = 20) {
    const g = this.scene.add.graphics().setDepth(depth);
    // Outer pixel border
    g.fillStyle(border, 1);
    g.fillRect(x, y, w, h);
    // Inner body
    g.fillStyle(fill, 1);
    g.fillRect(x + 2, y + 2, w - 4, h - 4);
    // Top rim highlight for semi-modern HD-2D feel
    g.fillStyle(0x64748b, 0.28);
    g.fillRect(x + 2, y + 2, w - 4, 2);
    return g;
  }

  _buildTopBar() {
    const { width } = this.scene.scale;
    const g = this.scene.add.graphics().setDepth(30);
    g.fillStyle(0x0b1222, 0.96);
    g.fillRect(0, 0, width, 42);
    g.fillStyle(0x263554, 1);
    g.fillRect(0, 40, width, 2);

    this.stageTitle = this.scene.add
      .text(10, 14, 'CH.1 HUTAN SOLARA', {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setDepth(31);

    // Engine badge (WASM emerald vs JS CORE amber)
    this.engineBadgeBg = this.scene.add.rectangle(244, 21, 74, 22, 0x451a03).setDepth(31);
    this.engineBadgeBg.setStrokeStyle(1, 0xf59e0b);
    this.engineBadgeText = this.scene.add
      .text(244, 21, 'JS CORE', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#fbbf24',
      })
      .setOrigin(0.5)
      .setDepth(32);

    // Quick Restart button
    const rstBg = this.scene.add
      .rectangle(320, 21, 62, 26, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);

    this.scene.add
      .text(320, 21, 'RST', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#e2e8f0',
      })
      .setOrigin(0.5)
      .setDepth(32);

    rstBg.on('pointerover', () => rstBg.setFillStyle(0x334155));
    rstBg.on('pointerout', () => rstBg.setFillStyle(0x1e293b));
    rstBg.on('pointerdown', () => {
      rstBg.setFillStyle(0x0f172a);
      this.cb.onRestart?.();
    });
  }

  setEngineRuntime(runtime) {
    const isWasm = runtime === 'cpp-wasm';
    this.engineBadgeBg.setFillStyle(isWasm ? 0x064e3b : 0x451a03);
    this.engineBadgeBg.setStrokeStyle(1, isWasm ? 0x10b981 : 0xf59e0b);
    this.engineBadgeText.setText(isWasm ? 'C++ WASM' : 'JS CORE');
    this.engineBadgeText.setColor(isWasm ? '#34d399' : '#fbbf24');
  }

  setStageTitle(title) {
    this.stageTitle.setText(title);
  }

  _buildEnemyCard() {
    // Top-left card: y: 52..114 (height 62), x: 10..212 (width 202)
    this._drawPixelPanel(10, 52, 202, 62, 0x111a2e, 0x334155, 25);

    this.enemyAccent = this.scene.add.rectangle(13, 83, 4, 56, 0x22c55e).setDepth(26);

    this.enemyNameText = this.scene.add
      .text(22, 58, 'Verdantix', {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setDepth(26);

    this.enemyLvText = this.scene.add
      .text(146, 59, 'Lv.5', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#cbd5e1',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // Element pill
    this.enemyElBg = this.scene.add.rectangle(180, 65, 50, 14, 0x14532d).setDepth(26);
    this.enemyElText = this.scene.add
      .text(180, 65, 'NATURE', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#4ade80',
      })
      .setOrigin(0.5)
      .setDepth(27);

    // HP bar track
    this.scene.add
      .text(22, 78, 'HP', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#94a3b8',
      })
      .setDepth(26);

    this.enemyHpTrackW = 162;
    this.scene.add.rectangle(42, 83, this.enemyHpTrackW, 10, 0x090e1a).setOrigin(0, 0.5).setDepth(26);
    this.enemyHpFill = this.scene.add
      .rectangle(43, 83, this.enemyHpTrackW - 2, 8, 0x22c55e)
      .setOrigin(0, 0.5)
      .setDepth(27);

    this.enemyHpText = this.scene.add
      .text(204, 94, '120/120', {
        fontFamily: FONT,
        fontSize: '10px',
        color: '#cbd5e1',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // Status pill
    this.enemyStatusBg = this.scene.add.rectangle(40, 101, 36, 14, 0x9a3412).setDepth(26).setVisible(false);
    this.enemyStatusText = this.scene.add
      .text(40, 101, 'BRN', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#fed7aa',
      })
      .setOrigin(0.5)
      .setDepth(27)
      .setVisible(false);
  }

  _buildPlayerCard() {
    // Mid-right card: y: 266..342 (height 76), x: 146..350 (width 204)
    this._drawPixelPanel(146, 266, 204, 76, 0x111a2e, 0x3b4f78, 25);

    this.playerAccent = this.scene.add.rectangle(149, 304, 4, 70, 0xf97316).setDepth(26);

    this.playerNameText = this.scene.add
      .text(158, 272, 'Pyrofang', {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setDepth(26);

    this.playerLvText = this.scene.add
      .text(286, 273, 'Lv.5', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#fde047',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // Element pill
    this.playerElBg = this.scene.add.rectangle(318, 279, 50, 14, 0x7c2d12).setDepth(26);
    this.playerElText = this.scene.add
      .text(318, 279, 'FIRE', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#fb923c',
      })
      .setOrigin(0.5)
      .setDepth(27);

    // HP Row
    this.scene.add
      .text(158, 290, 'HP', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#94a3b8',
      })
      .setDepth(26);

    this.playerHpTrackW = 114;
    this.scene.add.rectangle(176, 295, this.playerHpTrackW, 10, 0x090e1a).setOrigin(0, 0.5).setDepth(26);
    this.playerHpFill = this.scene.add
      .rectangle(177, 295, this.playerHpTrackW - 2, 8, 0x22c55e)
      .setOrigin(0, 0.5)
      .setDepth(27);

    this.playerHpText = this.scene.add
      .text(344, 290, '120/120', {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#e2e8f0',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // SP Row
    this.scene.add
      .text(158, 307, 'SP', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#38bdf8',
      })
      .setDepth(26);

    this.playerSpTrackW = 114;
    this.scene.add.rectangle(176, 312, this.playerSpTrackW, 8, 0x090e1a).setOrigin(0, 0.5).setDepth(26);
    this.playerSpFill = this.scene.add
      .rectangle(177, 312, this.playerSpTrackW - 2, 6, 0x38bdf8)
      .setOrigin(0, 0.5)
      .setDepth(27);

    this.playerSpText = this.scene.add
      .text(344, 307, '40/40', {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#7dd3fc',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // Status pill + XP mini bar
    this.playerStatusBg = this.scene.add.rectangle(176, 329, 36, 13, 0x9a3412).setDepth(26).setVisible(false);
    this.playerStatusText = this.scene.add
      .text(176, 329, 'BRN', {
        fontFamily: FONT,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#fed7aa',
      })
      .setOrigin(0.5)
      .setDepth(27)
      .setVisible(false);

    this.scene.add
      .text(204, 324, 'XP', {
        fontFamily: FONT,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#a855f7',
      })
      .setDepth(26);

    this.playerXpTrackW = 122;
    this.scene.add.rectangle(220, 329, this.playerXpTrackW, 5, 0x090e1a).setOrigin(0, 0.5).setDepth(26);
    this.playerXpFill = this.scene.add
      .rectangle(221, 329, 0, 3, 0xa855f7)
      .setOrigin(0, 0.5)
      .setDepth(27);
  }

  _buildCommandDeckShell() {
    // Deck background (y: 350..640)
    const deckBg = this.scene.add.graphics().setDepth(18);
    deckBg.fillStyle(0x0a101f, 1);
    deckBg.fillRect(0, 350, 360, 290);
    deckBg.fillStyle(0x1e293b, 1);
    deckBg.fillRect(0, 350, 360, 2);

    // Battle Log Box (y: 356..428, height 72)
    this._drawPixelPanel(10, 356, 340, 72, 0x0f172a, 0x3b4f78, 20);
    this.logText = this.scene.add
      .text(20, 365, 'Pertarungan dimulai!', {
        fontFamily: FONT,
        fontSize: '12px',
        color: '#f1f5f9',
        lineSpacing: 4,
        wordWrap: { width: 318 },
      })
      .setDepth(22);

    // Subtle animated cursor triangle in bottom-right of log box
    this.logCursor = this.scene.add
      .text(338, 416, '▼', {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#38bdf8',
      })
      .setOrigin(0.5)
      .setDepth(22);

    this.scene.tweens.add({
      targets: this.logCursor,
      alpha: 0.2,
      yoyo: true,
      repeat: -1,
      duration: 520,
    });

    // Mode Tabs (y: 436..482, height 46 >= 44px!)
    const tabs = [
      { key: 'FIGHT', label: 'FIGHT', accent: 0xef4444 },
      { key: 'GUARD', label: 'GUARD', accent: 0x38bdf8 },
      { key: 'BAG', label: 'BAG', accent: 0xf59e0b },
      { key: 'PARTY', label: 'PARTY', accent: 0x22c55e },
    ];

    const tabW = 82;
    const gap = 4;
    const startX = 10;

    tabs.forEach((tab, idx) => {
      const x = startX + idx * (tabW + gap);
      const y = 436;
      const h = 46;

      const bg = this.scene.add
        .rectangle(x + tabW / 2, y + h / 2, tabW, h, 0x162038)
        .setStrokeStyle(2, 0x334155)
        .setInteractive({ useHandCursor: true })
        .setDepth(22);

      const bar = this.scene.add.rectangle(x + tabW / 2, y + 3, tabW - 4, 4, tab.accent).setDepth(23);

      const text = this.scene.add
        .text(x + tabW / 2, y + h / 2 + 2, tab.label, {
          fontFamily: FONT,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#e2e8f0',
        })
        .setOrigin(0.5)
        .setDepth(23);

      bg.on('pointerdown', () => {
        if (this.isBusy) return;
        if (tab.key === 'GUARD') {
          this.cb.onGuard?.();
          return;
        }
        this.setMode(tab.key);
      });

      this.tabButtons[tab.key] = { bg, bar, text, accent: tab.accent };
    });

    this._highlightTabs();
  }

  _highlightTabs() {
    Object.entries(this.tabButtons).forEach(([key, btn]) => {
      const active = key === this.mode;
      btn.bg.setFillStyle(active ? 0x233354 : 0x131c31);
      btn.bg.setStrokeStyle(2, active ? btn.accent : 0x29354d);
      btn.text.setColor(active ? '#ffffff' : '#94a3b8');
      btn.bar.setAlpha(active ? 1 : 0.45);
    });
  }

  setMode(mode) {
    this.mode = mode;
    this._highlightTabs();
    this._renderDeckContent();
  }

  setLog(message) {
    this.logText.setText(message);
  }

  setBusy(busy) {
    this.isBusy = Boolean(busy);
    this.logCursor.setVisible(!this.isBusy);
    if (this.deckContainer) {
      this.deckContainer.setAlpha(this.isBusy ? 0.55 : 1);
    }
  }

  updateState(state, animateBars = true) {
    this.state = state;
    const { player, enemy } = state;

    // Update Enemy Card
    const enemyMeta = ELEMENT_META[enemy.element] ?? ELEMENT_META[Element.Neutral];
    this.enemyAccent.setFillStyle(enemyMeta.color);
    this.enemyNameText.setText(enemy.name);
    this.enemyLvText.setText(`Lv.${enemy.level}`);
    this.enemyElBg.setFillStyle(enemyMeta.bg);
    this.enemyElText.setText(enemyMeta.label).setColor(enemyMeta.hex);
    this.enemyHpText.setText(`${enemy.currentHp}/${enemy.maxHp}`);
    this._updateBar(this.enemyHpFill, this.enemyHpTrackW - 2, enemy.currentHp / Math.max(1, enemy.maxHp), true, animateBars);
    this._updateStatusPill(this.enemyStatusBg, this.enemyStatusText, enemy.status);

    // Update Player Card
    const playerMeta = ELEMENT_META[player.element] ?? ELEMENT_META[Element.Neutral];
    this.playerAccent.setFillStyle(playerMeta.color);
    this.playerNameText.setText(player.name);
    this.playerLvText.setText(`Lv.${player.level}`);
    this.playerElBg.setFillStyle(playerMeta.bg);
    this.playerElText.setText(playerMeta.label).setColor(playerMeta.hex);
    this.playerHpText.setText(`${player.currentHp}/${player.maxHp}`);
    this.playerSpText.setText(`${player.currentSp}/${player.maxSp}`);
    this._updateBar(this.playerHpFill, this.playerHpTrackW - 2, player.currentHp / Math.max(1, player.maxHp), true, animateBars);
    this._updateBar(this.playerSpFill, this.playerSpTrackW - 2, player.currentSp / Math.max(1, player.maxSp), false, animateBars);
    this._updateBar(this.playerXpFill, this.playerXpTrackW - 2, (player.xp ?? 0) / Math.max(1, player.xpToNext ?? 50), false, animateBars);
    this._updateStatusPill(this.playerStatusBg, this.playerStatusText, player.status);

    this._renderDeckContent();
  }

  _updateBar(rect, maxW, ratio, shiftHpColor, animate) {
    const clamped = Math.max(0, Math.min(1, ratio));
    const targetW = Math.round(maxW * clamped);
    if (shiftHpColor) {
      rect.setFillStyle(hpBarColor(clamped));
    }
    if (animate) {
      this.scene.tweens.killTweensOf(rect);
      this.scene.tweens.add({
        targets: rect,
        width: targetW,
        duration: 240,
        ease: 'Quad.easeOut',
      });
    } else {
      rect.width = targetW;
    }
  }

  _updateStatusPill(bg, text, status) {
    const badge = STATUS_BADGE[status];
    if (!badge) {
      bg.setVisible(false);
      text.setVisible(false);
      return;
    }
    bg.setFillStyle(badge.bg).setVisible(true);
    text.setText(badge.label).setColor(badge.text).setVisible(true);
  }

  _renderDeckContent() {
    if (this.deckContainer) {
      this.deckContainer.destroy(true);
      this.deckContainer = null;
    }
    if (!this.state) return;

    this.deckContainer = this.scene.add.container(0, 0).setDepth(24);
    this.deckContainer.setAlpha(this.isBusy ? 0.55 : 1);

    if (this.mode === 'FIGHT') {
      this._renderFightGrid();
    } else if (this.mode === 'BAG') {
      this._renderBagGrid();
    } else if (this.mode === 'PARTY') {
      this._renderPartyList();
    }
  }

  _renderFightGrid() {
    const { player, playerSkills } = this.state;
    const btnW = 166;
    const btnH = 66;
    const gapX = 8;
    const gapY = 8;
    const startX = 10;
    const startY = 490;

    playerSkills.slice(0, 4).forEach((skill, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = startX + col * (btnW + gapX);
      const y = startY + row * (btnH + gapY);

      const meta = ELEMENT_META[skill.element] ?? ELEMENT_META[Element.Neutral];
      const spCost = skill.spCost ?? 0;
      const affordable = (player.currentSp ?? 0) >= spCost;

      const bg = this.scene.add
        .rectangle(x + btnW / 2, y + btnH / 2, btnW, btnH, affordable ? 0x16223a : 0x0f172a)
        .setStrokeStyle(2, affordable ? 0x3b4f78 : 0x1e293b);

      const stripe = this.scene.add.rectangle(x + 4, y + btnH / 2, 6, btnH - 4, meta.color);

      const nameTxt = this.scene.add.text(x + 14, y + 10, skill.name, {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: affordable ? '#f8fafc' : '#64748b',
      });

      const powerTxt = this.scene.add.text(x + 14, y + 32, `PWR ${skill.power}  ${meta.label}`, {
        fontFamily: FONT,
        fontSize: '10px',
        color: affordable ? meta.hex : '#475569',
      });

      const spLabel = spCost > 0 ? `${spCost} SP` : 'FREE';
      const spTxt = this.scene.add
        .text(x + btnW - 8, y + 48, spLabel, {
          fontFamily: FONT,
          fontSize: '10px',
          fontStyle: 'bold',
          color: spCost > 0 ? (affordable ? '#38bdf8' : '#ef4444') : '#4ade80',
        })
        .setOrigin(1, 0.5);

      if (!affordable) {
        stripe.setAlpha(0.4);
      } else {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setFillStyle(0x1f3052));
        bg.on('pointerout', () => bg.setFillStyle(0x16223a));
        bg.on('pointerdown', () => {
          if (this.isBusy) return;
          this.cb.onUseSkill?.(skill);
        });
      }

      this.deckContainer.add([bg, stripe, nameTxt, powerTxt, spTxt]);
    });
  }

  _renderBagGrid() {
    const { bag } = this.state;
    const items = [
      { id: 'potion', name: 'Potion', desc: '+45 HP', color: 0x22c55e, count: bag.potion ?? 0 },
      { id: 'super_potion', name: 'Super Potion', desc: '+90 HP', color: 0x10b981, count: bag.super_potion ?? 0 },
      { id: 'antidote', name: 'Antidote', desc: 'Cure Status', color: 0xa855f7, count: bag.antidote ?? 0 },
      { id: 'rift_orb', name: 'Rift Orb', desc: 'Capture', color: 0x38bdf8, count: bag.rift_orb ?? 0 },
    ];

    const btnW = 166;
    const btnH = 66;
    const gapX = 8;
    const gapY = 8;
    const startX = 10;
    const startY = 490;

    items.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = startX + col * (btnW + gapX);
      const y = startY + row * (btnH + gapY);
      const usable = item.count > 0;

      const bg = this.scene.add
        .rectangle(x + btnW / 2, y + btnH / 2, btnW, btnH, usable ? 0x16223a : 0x0f172a)
        .setStrokeStyle(2, usable ? 0x3b4f78 : 0x1e293b);

      const stripe = this.scene.add.rectangle(x + 4, y + btnH / 2, 6, btnH - 4, item.color);
      if (!usable) stripe.setAlpha(0.35);

      const nameTxt = this.scene.add.text(x + 14, y + 10, item.name, {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: usable ? '#f8fafc' : '#64748b',
      });

      const descTxt = this.scene.add.text(x + 14, y + 32, item.desc, {
        fontFamily: FONT,
        fontSize: '10px',
        color: usable ? '#cbd5e1' : '#475569',
      });

      const countTxt = this.scene.add
        .text(x + btnW - 10, y + 48, `x${item.count}`, {
          fontFamily: FONT,
          fontSize: '11px',
          fontStyle: 'bold',
          color: usable ? '#fde047' : '#64748b',
        })
        .setOrigin(1, 0.5);

      if (usable) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setFillStyle(0x1f3052));
        bg.on('pointerout', () => bg.setFillStyle(0x16223a));
        bg.on('pointerdown', () => {
          if (this.isBusy) return;
          this.cb.onUseItem?.(item.id);
        });
      }

      this.deckContainer.add([bg, stripe, nameTxt, descTxt, countTxt]);
    });
  }

  _renderPartyList() {
    const { party, activePartyIndex } = this.state;
    const cardW = 340;
    const cardH = 44;
    const gapY = 4;
    const startX = 10;
    const startY = 490;

    party.forEach((mon, idx) => {
      const y = startY + idx * (cardH + gapY);
      const isActive = idx === activePartyIndex;
      const isAlive = mon.currentHp > 0;
      const meta = ELEMENT_META[mon.element] ?? ELEMENT_META[Element.Neutral];
      const ratio = mon.currentHp / Math.max(1, mon.maxHp);

      const bg = this.scene.add
        .rectangle(startX + cardW / 2, y + cardH / 2, cardW, cardH, isActive ? 0x1d2e4d : 0x131c31)
        .setStrokeStyle(2, isActive ? meta.color : 0x2e3c59);

      const stripe = this.scene.add.rectangle(startX + 4, y + cardH / 2, 6, cardH - 4, meta.color);
      if (!isAlive) stripe.setAlpha(0.35);

      const nameTxt = this.scene.add.text(startX + 16, y + 7, `${mon.name}  Lv.${mon.level}`, {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: isAlive ? '#f8fafc' : '#64748b',
      });

      const barW = 148;
      const barTrack = this.scene.add.rectangle(startX + 16, y + 29, barW, 8, 0x090e1a).setOrigin(0, 0.5);
      const barFill = this.scene.add
        .rectangle(startX + 17, y + 29, Math.round((barW - 2) * ratio), 6, hpBarColor(ratio))
        .setOrigin(0, 0.5);

      const hpTxt = this.scene.add
        .text(startX + 172, y + 29, `${mon.currentHp}/${mon.maxHp}`, {
          fontFamily: FONT,
          fontSize: '10px',
          color: '#cbd5e1',
        })
        .setOrigin(0, 0.5);

      const badgeLabel = isActive ? 'ACTIVE' : isAlive ? 'SWITCH' : 'KO';
      const badgeColor = isActive ? '#38bdf8' : isAlive ? '#4ade80' : '#ef4444';
      const badgeTxt = this.scene.add
        .text(startX + cardW - 12, y + cardH / 2, badgeLabel, {
          fontFamily: FONT,
          fontSize: '10px',
          fontStyle: 'bold',
          color: badgeColor,
        })
        .setOrigin(1, 0.5);

      if (!isActive && isAlive) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setFillStyle(0x1f3052));
        bg.on('pointerout', () => bg.setFillStyle(0x131c31));
        bg.on('pointerdown', () => {
          if (this.isBusy) return;
          this.cb.onSwitchParty?.(idx);
        });
      }

      this.deckContainer.add([bg, stripe, nameTxt, barTrack, barFill, hpTxt, badgeTxt]);
    });
  }

  showResultModal({ title, subtitle, detail, buttonLabel, accentColor = 0x22c55e, onAction }) {
    this.hideModal();

    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const cy = height / 2 - 20;

    this.modalContainer = this.scene.add.container(0, 0).setDepth(80);

    const dim = this.scene.add
      .rectangle(cx, height / 2, width, height, 0x050811, 0.78)
      .setInteractive();

    const panelBg = this.scene.add
      .rectangle(cx, cy, 300, 210, 0x111a2e)
      .setStrokeStyle(3, accentColor);

    const topStripe = this.scene.add.rectangle(cx, cy - 101, 294, 6, accentColor);

    const titleTxt = this.scene.add
      .text(cx, cy - 66, title, {
        fontFamily: FONT,
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5);

    const subTxt = this.scene.add
      .text(cx, cy - 32, subtitle, {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#fde047',
        align: 'center',
        wordWrap: { width: 264 },
      })
      .setOrigin(0.5);

    const detailTxt = this.scene.add
      .text(cx, cy + 6, detail, {
        fontFamily: FONT,
        fontSize: '11px',
        color: '#cbd5e1',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: 264 },
      })
      .setOrigin(0.5);

    const btnBg = this.scene.add
      .rectangle(cx, cy + 66, 210, 48, accentColor)
      .setStrokeStyle(2, 0xf8fafc)
      .setInteractive({ useHandCursor: true });

    const btnTxt = this.scene.add
      .text(cx, cy + 66, buttonLabel, {
        fontFamily: FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#070b14',
      })
      .setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      this.hideModal();
      onAction?.();
    });

    this.modalContainer.add([dim, panelBg, topStripe, titleTxt, subTxt, detailTxt, btnBg, btnTxt]);
  }

  hideModal() {
    if (this.modalContainer) {
      this.modalContainer.destroy(true);
      this.modalContainer = null;
    }
  }
}
