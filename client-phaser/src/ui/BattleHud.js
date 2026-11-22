import { Element, battleBridge } from '../bridge/battleBridge.js';
import { audioManager } from '../audio/audioManager.js';
import {
  FONTS,
  ELEMENT_STYLE,
  drawRpgPanel,
  createRpgButton,
} from './UiTheme.js';

export const ELEMENT_META = ELEMENT_STYLE;

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

    this.enemyHpRatio = 1;
    this.enemyTrailRatio = 1;
    this.playerHpRatio = 1;
    this.playerTrailRatio = 1;

    this._buildTopBar();
    this._buildEnemyCard();
    this._buildPlayerCard();
    this._buildCommandDeckShell();
  }

  _buildTopBar() {
    const { width } = this.scene.scale;
    const g = this.scene.add.graphics().setDepth(30);
    g.fillStyle(0x070c18, 0.96);
    g.fillRect(0, 0, width, 32);
    g.fillStyle(0x3b527a, 1);
    g.fillRect(0, 30, width, 2);
    g.fillStyle(0xffffff, 0.08);
    g.fillRect(0, 0, width, 1);

    this.stageTitle = this.scene.add
      .text(12, 16, 'CH.1 HUTAN SOLARA', {
        fontFamily: FONTS.display,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0, 0.5)
      .setDepth(31);

    // Engine badge (C++ WASM emerald vs JS CORE amber)
    this.engineBadgeBg = this.scene.add.rectangle(416, 16, 82, 20, 0x451a03).setDepth(31);
    this.engineBadgeBg.setStrokeStyle(1, 0xf59e0b);
    this.engineBadgeText = this.scene.add
      .text(416, 16, 'JS CORE', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#fbbf24',
      })
      .setOrigin(0.5)
      .setDepth(32);

    // Audio Mute button (SFX ON / MUTED)
    this.audioBtnLip = this.scene.add.rectangle(506, 18, 74, 20, 0x04070f).setDepth(30);
    this.audioBtnBg = this.scene.add
      .rectangle(506, 15, 74, 20, 0x162440)
      .setStrokeStyle(1, 0x38bdf8)
      .setInteractive({ useHandCursor: true })
      .setDepth(31);
    this.audioBtnText = this.scene.add
      .text(506, 15, 'SFX ON', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#7dd3fc',
      })
      .setOrigin(0.5)
      .setDepth(32);

    this.audioBtnBg.on('pointerdown', () => {
      audioManager.unlock();
      audioManager.toggleMute();
      this.syncAudioButton();
      if (!audioManager.isMuted()) {
        audioManager.playSfx('click');
      }
    });
    this.syncAudioButton();

    // MAP / RST button right
    this.exitBtn = createRpgButton(this.scene, 592, 15, 70, 20, {
      label: 'RST',
      fill: 0x1e293b,
      hover: 0x334155,
      border: 0x64748b,
      lip: 0x04070f,
      textColor: '#e2e8f0',
      fontSize: '8px',
      fontFamily: FONTS.display,
      depth: 31,
      onClick: () => {
        audioManager.playSfx('click');
        this.cb.onRestart?.();
      },
    });
  }

  syncAudioButton() {
    const muted = audioManager.isMuted();
    this.audioBtnBg.setFillStyle(muted ? 0x291522 : 0x162440);
    this.audioBtnBg.setStrokeStyle(1, muted ? 0xef4444 : 0x38bdf8);
    this.audioBtnText.setText(muted ? 'MUTED' : 'SFX ON');
    this.audioBtnText.setColor(muted ? '#fca5a5' : '#7dd3fc');
  }

  setExitLabel(label) {
    this.exitBtn?.setLabel(label);
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
    // Top-left card: x: 14, y: 40, w: 230, h: 68
    drawRpgPanel(this.scene, 14, 40, 230, 68, {
      fill: 0x0c1426,
      alpha: 0.95,
      border: 0x3b527a,
      outer: 0x04070f,
      depth: 25,
      rivets: true,
    });

    this.enemyAccent = this.scene.add.rectangle(18, 74, 4, 58, 0x22c55e).setDepth(26);

    this.enemyNameText = this.scene.add
      .text(26, 46, 'Verdantix', {
        fontFamily: FONTS.display,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setDepth(26);

    this.enemyLvText = this.scene.add
      .text(172, 47, 'Lv.5', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#cbd5e1',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // Element badge with optional 12x12 icon
    this.enemyElBg = this.scene.add.rectangle(208, 53, 60, 15, 0x14532d).setStrokeStyle(1, 0x22c55e, 0.7).setDepth(26);
    this.enemyElIcon = null;
    this.enemyElText = this.scene.add
      .text(208, 53, 'NATURE', {
        fontFamily: FONTS.display,
        fontSize: '7px',
        fontStyle: 'bold',
        color: '#4ade80',
      })
      .setOrigin(0.5)
      .setDepth(27);

    // HP bar track + white damage trail + main glossy fill
    this.scene.add
      .text(26, 66, 'HP', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#94a3b8',
      })
      .setDepth(26);

    this.enemyHpTrackW = 186;
    this.scene.add.rectangle(48, 72, this.enemyHpTrackW + 2, 12, 0x020617).setOrigin(0, 0.5).setDepth(26);
    this.scene.add.rectangle(49, 72, this.enemyHpTrackW, 10, 0x09111f).setOrigin(0, 0.5).setDepth(26);
    this.enemyHpTrail = this.scene.add
      .rectangle(50, 72, this.enemyHpTrackW - 2, 8, 0xfef08a)
      .setOrigin(0, 0.5)
      .setDepth(27);
    this.enemyHpFill = this.scene.add
      .rectangle(50, 72, this.enemyHpTrackW - 2, 8, 0x22c55e)
      .setOrigin(0, 0.5)
      .setDepth(28);
    this.enemyHpShine = this.scene.add
      .rectangle(50, 69, this.enemyHpTrackW - 2, 2, 0xffffff, 0.28)
      .setOrigin(0, 0.5)
      .setDepth(29);

    this.enemyHpText = this.scene.add
      .text(235, 84, '120/120', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        color: '#cbd5e1',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // Status pill
    this.enemyStatusBg = this.scene.add.rectangle(44, 94, 38, 14, 0x9a3412).setDepth(26).setVisible(false);
    this.enemyStatusText = this.scene.add
      .text(44, 94, 'BRN', {
        fontFamily: FONTS.display,
        fontSize: '7px',
        fontStyle: 'bold',
        color: '#fed7aa',
      })
      .setOrigin(0.5)
      .setDepth(27)
      .setVisible(false);

    // Boss Phase 2 crimson badge
    this.enemyPhase2Bg = this.scene.add
      .rectangle(102, 94, 62, 14, 0x991b1b)
      .setStrokeStyle(1, 0xf43f5e)
      .setDepth(26)
      .setVisible(false);
    this.enemyPhase2Text = this.scene.add
      .text(102, 94, 'PHASE 2', {
        fontFamily: FONTS.display,
        fontSize: '7px',
        fontStyle: 'bold',
        color: '#fecaca',
      })
      .setOrigin(0.5)
      .setDepth(27)
      .setVisible(false);
  }

  setBossPhase2(active) {
    const show = Boolean(active);
    this.enemyPhase2Bg.setVisible(show);
    this.enemyPhase2Text.setVisible(show);
    this.scene.tweens.killTweensOf([this.enemyPhase2Bg, this.enemyPhase2Text]);
    if (show) {
      this.enemyPhase2Bg.setAlpha(1);
      this.enemyPhase2Text.setAlpha(1);
      this.scene.tweens.add({
        targets: [this.enemyPhase2Bg, this.enemyPhase2Text],
        alpha: 0.65,
        yoyo: true,
        repeat: -1,
        duration: 540,
        ease: 'Sine.easeInOut',
      });
    }
  }

  _buildPlayerCard() {
    // Mid-right card: x: 396, y: 146, w: 230, h: 80
    drawRpgPanel(this.scene, 396, 146, 230, 80, {
      fill: 0x0c1426,
      alpha: 0.95,
      border: 0x3b527a,
      outer: 0x04070f,
      depth: 25,
      rivets: true,
    });

    this.playerAccent = this.scene.add.rectangle(400, 186, 4, 70, 0xf97316).setDepth(26);

    this.playerNameText = this.scene.add
      .text(408, 152, 'Pyrofang', {
        fontFamily: FONTS.display,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setDepth(26);

    this.playerLvText = this.scene.add
      .text(554, 153, 'Lv.5', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#fde047',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // Element badge with optional 12x12 icon
    this.playerElBg = this.scene.add.rectangle(590, 159, 60, 15, 0x7c2d12).setStrokeStyle(1, 0xf97316, 0.7).setDepth(26);
    this.playerElIcon = null;
    this.playerElText = this.scene.add
      .text(590, 159, 'FIRE', {
        fontFamily: FONTS.display,
        fontSize: '7px',
        fontStyle: 'bold',
        color: '#fb923c',
      })
      .setOrigin(0.5)
      .setDepth(27);

    // HP Row with damage-trail
    this.scene.add
      .text(408, 171, 'HP', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#94a3b8',
      })
      .setDepth(26);

    this.playerHpTrackW = 128;
    this.scene.add.rectangle(429, 176, this.playerHpTrackW + 2, 12, 0x020617).setOrigin(0, 0.5).setDepth(26);
    this.scene.add.rectangle(430, 176, this.playerHpTrackW, 10, 0x09111f).setOrigin(0, 0.5).setDepth(26);
    this.playerHpTrail = this.scene.add
      .rectangle(431, 176, this.playerHpTrackW - 2, 8, 0xfef08a)
      .setOrigin(0, 0.5)
      .setDepth(27);
    this.playerHpFill = this.scene.add
      .rectangle(431, 176, this.playerHpTrackW - 2, 8, 0x22c55e)
      .setOrigin(0, 0.5)
      .setDepth(28);
    this.playerHpShine = this.scene.add
      .rectangle(431, 173, this.playerHpTrackW - 2, 2, 0xffffff, 0.28)
      .setOrigin(0, 0.5)
      .setDepth(29);

    this.playerHpText = this.scene.add
      .text(619, 171, '120/120', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        color: '#e2e8f0',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // SP Row
    this.scene.add
      .text(408, 189, 'SP', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#38bdf8',
      })
      .setDepth(26);

    this.playerSpTrackW = 128;
    this.scene.add.rectangle(429, 194, this.playerSpTrackW + 2, 10, 0x020617).setOrigin(0, 0.5).setDepth(26);
    this.scene.add.rectangle(430, 194, this.playerSpTrackW, 8, 0x09111f).setOrigin(0, 0.5).setDepth(26);
    this.playerSpFill = this.scene.add
      .rectangle(431, 194, this.playerSpTrackW - 2, 6, 0x38bdf8)
      .setOrigin(0, 0.5)
      .setDepth(27);
    this.playerSpShine = this.scene.add
      .rectangle(431, 192, this.playerSpTrackW - 2, 2, 0xffffff, 0.26)
      .setOrigin(0, 0.5)
      .setDepth(28);

    this.playerSpText = this.scene.add
      .text(619, 189, '40/40', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        color: '#7dd3fc',
      })
      .setOrigin(1, 0)
      .setDepth(26);

    // Status pill + XP mini bar
    this.playerStatusBg = this.scene.add.rectangle(428, 212, 38, 13, 0x9a3412).setDepth(26).setVisible(false);
    this.playerStatusText = this.scene.add
      .text(428, 212, 'BRN', {
        fontFamily: FONTS.display,
        fontSize: '7px',
        fontStyle: 'bold',
        color: '#fed7aa',
      })
      .setOrigin(0.5)
      .setDepth(27)
      .setVisible(false);

    this.scene.add
      .text(456, 207, 'XP', {
        fontFamily: FONTS.display,
        fontSize: '7px',
        fontStyle: 'bold',
        color: '#a855f7',
      })
      .setDepth(26);

    this.playerXpTrackW = 144;
    this.scene.add.rectangle(473, 212, this.playerXpTrackW + 2, 7, 0x020617).setOrigin(0, 0.5).setDepth(26);
    this.scene.add.rectangle(474, 212, this.playerXpTrackW, 5, 0x09111f).setOrigin(0, 0.5).setDepth(26);
    this.playerXpFill = this.scene.add
      .rectangle(475, 212, 0, 3, 0xa855f7)
      .setOrigin(0, 0.5)
      .setDepth(27);
  }

  _buildCommandDeckShell() {
    // Wide Bottom Command Deck (y: 234..360)
    const deckBg = this.scene.add.graphics().setDepth(18);
    deckBg.fillStyle(0x070c18, 1);
    deckBg.fillRect(0, 234, 640, 126);
    deckBg.fillStyle(0x3b527a, 1);
    deckBg.fillRect(0, 234, 640, 2);

    // Left Panel: Battle Log Box (x: 10, y: 239, w: 246, h: 113)
    drawRpgPanel(this.scene, 10, 239, 246, 113, {
      fill: 0x0c1426,
      alpha: 0.98,
      border: 0x3b527a,
      outer: 0x04070f,
      depth: 20,
      rivets: true,
    });

    this.logText = this.scene.add
      .text(20, 249, 'Pertarungan dimulai!', {
        fontFamily: FONTS.ui,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f1f5f9',
        lineSpacing: 4,
        wordWrap: { width: 224 },
      })
      .setDepth(22);

    // Subtle animated cursor triangle in bottom-right of log box
    this.logCursor = this.scene.add
      .text(244, 340, '▼', {
        fontFamily: FONTS.display,
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

    // Right Command Deck backing panel (x: 260, y: 239, w: 372, h: 113)
    drawRpgPanel(this.scene, 260, 239, 372, 113, {
      fill: 0x091020,
      alpha: 0.96,
      border: 0x2a3d61,
      outer: 0x04070f,
      depth: 19,
      rivets: true,
    });

    // Right Panel Top Tabs row (y: 242..268, 4 tactile 3D beveled tabs)
    const tabs = [
      { key: 'FIGHT', label: 'FIGHT', accent: 0xef4444 },
      { key: 'GUARD', label: 'GUARD', accent: 0x38bdf8 },
      { key: 'BAG', label: 'BAG', accent: 0xf59e0b },
      { key: 'PARTY', label: 'PARTY', accent: 0x22c55e },
    ];

    const tabW = 86;
    const tabH = 24;
    const gap = 5;
    const startX = 266;
    const tabY = 242;

    tabs.forEach((tab, idx) => {
      const x = startX + idx * (tabW + gap);
      const cx = x + tabW / 2;
      const cy = tabY + tabH / 2;

      const lip = this.scene.add.rectangle(cx, cy + 2, tabW, tabH, 0x04070f).setDepth(21);
      const bg = this.scene.add
        .rectangle(cx, cy, tabW, tabH, 0x162038)
        .setStrokeStyle(2, 0x334155)
        .setInteractive({ useHandCursor: true })
        .setDepth(22);
      const shine = this.scene.add.rectangle(cx, tabY + 3, tabW - 6, 2, 0xffffff, 0.16).setDepth(23);
      const bar = this.scene.add.rectangle(cx, tabY + tabH - 2, tabW - 6, 3, tab.accent).setDepth(23);

      const text = this.scene.add
        .text(cx, cy, tab.label, {
          fontFamily: FONTS.display,
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#e2e8f0',
        })
        .setOrigin(0.5)
        .setDepth(23);

      bg.on('pointerover', () => {
        if (this.isBusy) return;
        const active = tab.key === this.mode;
        bg.setFillStyle(active ? 0x2c4066 : 0x1e2c49);
      });
      bg.on('pointerout', () => {
        const active = tab.key === this.mode;
        bg.setFillStyle(active ? 0x233354 : 0x131c31);
        bg.y = cy;
        shine.y = tabY + 3;
        bar.y = tabY + tabH - 2;
        text.y = cy;
      });
      bg.on('pointerdown', () => {
        if (this.isBusy) return;
        bg.y = cy + 1;
        shine.y = tabY + 4;
        bar.y = tabY + tabH - 1;
        text.y = cy + 1;
        if (tab.key === 'GUARD') {
          this.cb.onGuard?.();
          return;
        }
        audioManager.playSfx('click');
        this.setMode(tab.key);
      });
      bg.on('pointerup', () => {
        bg.y = cy;
        shine.y = tabY + 3;
        bar.y = tabY + tabH - 2;
        text.y = cy;
      });

      this.tabButtons[tab.key] = { lip, bg, shine, bar, text, accent: tab.accent };
    });

    this._highlightTabs();
  }

  _highlightTabs() {
    Object.entries(this.tabButtons).forEach(([key, btn]) => {
      const active = key === this.mode;
      btn.bg.setFillStyle(active ? 0x233354 : 0x131c31);
      btn.bg.setStrokeStyle(2, active ? btn.accent : 0x29354d);
      btn.text.setColor(active ? '#ffffff' : '#94a3b8');
      btn.bar.setAlpha(active ? 1 : 0.35);
      btn.shine.setAlpha(active ? 0.24 : 0.1);
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

  _updateElementBadge(bg, iconProp, textObj, meta, centerX, centerY) {
    bg.setFillStyle(meta.bg);
    bg.setStrokeStyle(1, meta.color, 0.85);

    if (this[iconProp]) {
      this[iconProp].destroy();
      this[iconProp] = null;
    }

    const hasIcon = meta.iconKey && this.scene.textures.exists(meta.iconKey);
    if (hasIcon) {
      this[iconProp] = this.scene.add
        .image(centerX - 21, centerY, meta.iconKey)
        .setDisplaySize(12, 12)
        .setDepth(27);
      textObj.setPosition(centerX + 6, centerY);
    } else {
      textObj.setPosition(centerX, centerY);
    }
    textObj.setText(meta.label).setColor(meta.hex);
  }

  updateState(state, animateBars = true) {
    this.state = state;
    const { player, enemy } = state;

    // Update Enemy Card
    const enemyMeta = ELEMENT_STYLE[enemy.element] ?? ELEMENT_STYLE[Element.Neutral];
    this.enemyAccent.setFillStyle(enemyMeta.color);
    this.enemyNameText.setText(enemy.name);
    this.enemyLvText.setText(`Lv.${enemy.level}`);
    this._updateElementBadge(this.enemyElBg, 'enemyElIcon', this.enemyElText, enemyMeta, 208, 53);
    this.enemyHpText.setText(`${enemy.currentHp}/${enemy.maxHp}`);
    this._updateHpBarWithTrail(
      this.enemyHpFill,
      this.enemyHpShine,
      this.enemyHpTrail,
      this.enemyHpTrackW - 2,
      enemy.currentHp / Math.max(1, enemy.maxHp),
      'enemy',
      animateBars
    );
    this._updateStatusPill(this.enemyStatusBg, this.enemyStatusText, enemy.status);

    // Update Player Card
    const playerMeta = ELEMENT_STYLE[player.element] ?? ELEMENT_STYLE[Element.Neutral];
    this.playerAccent.setFillStyle(playerMeta.color);
    this.playerNameText.setText(player.name);
    this.playerLvText.setText(`Lv.${player.level}`);
    this._updateElementBadge(this.playerElBg, 'playerElIcon', this.playerElText, playerMeta, 590, 159);
    this.playerHpText.setText(`${player.currentHp}/${player.maxHp}`);
    this.playerSpText.setText(`${player.currentSp}/${player.maxSp}`);
    this._updateHpBarWithTrail(
      this.playerHpFill,
      this.playerHpShine,
      this.playerHpTrail,
      this.playerHpTrackW - 2,
      player.currentHp / Math.max(1, player.maxHp),
      'player',
      animateBars
    );
    this._updateSimpleBar(
      this.playerSpFill,
      this.playerSpShine,
      this.playerSpTrackW - 2,
      player.currentSp / Math.max(1, player.maxSp),
      animateBars
    );
    this._updateSimpleBar(
      this.playerXpFill,
      null,
      this.playerXpTrackW - 2,
      (player.xp ?? 0) / Math.max(1, player.xpToNext ?? 50),
      animateBars
    );
    this._updateStatusPill(this.playerStatusBg, this.playerStatusText, player.status);

    this._renderDeckContent();
  }

  _updateHpBarWithTrail(fillRect, shineRect, trailRect, maxW, ratio, who, animate) {
    const clamped = Math.max(0, Math.min(1, ratio));
    const targetW = Math.round(maxW * clamped);
    const prevKey = who === 'enemy' ? 'enemyHpRatio' : 'playerHpRatio';
    const trailKey = who === 'enemy' ? 'enemyTrailRatio' : 'playerTrailRatio';
    const prevRatio = this[prevKey] ?? clamped;

    fillRect.setFillStyle(hpBarColor(clamped));

    this.scene.tweens.killTweensOf([fillRect, shineRect, trailRect]);

    if (!animate) {
      fillRect.width = targetW;
      if (shineRect) shineRect.width = targetW;
      trailRect.width = targetW;
      this[prevKey] = clamped;
      this[trailKey] = clamped;
      return;
    }

    if (clamped < prevRatio) {
      // Damage taken: main bar drops swiftly, pale-gold/white trail holds briefly then drains smoothly
      trailRect.setFillStyle(0xfef08a);
      this.scene.tweens.add({
        targets: [fillRect, shineRect].filter(Boolean),
        width: targetW,
        duration: 170,
        ease: 'Quad.easeOut',
      });
      this.scene.tweens.add({
        targets: trailRect,
        width: targetW,
        delay: 220,
        duration: 420,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this[trailKey] = clamped;
        },
      });
    } else {
      // Healing or unchanged: both bars rise together
      this.scene.tweens.add({
        targets: [fillRect, shineRect, trailRect].filter(Boolean),
        width: targetW,
        duration: 240,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this[trailKey] = clamped;
        },
      });
    }

    this[prevKey] = clamped;
  }

  _updateSimpleBar(rect, shineRect, maxW, ratio, animate) {
    const clamped = Math.max(0, Math.min(1, ratio));
    const targetW = Math.round(maxW * clamped);
    const targets = [rect, shineRect].filter(Boolean);
    if (animate) {
      this.scene.tweens.killTweensOf(targets);
      this.scene.tweens.add({
        targets,
        width: targetW,
        duration: 240,
        ease: 'Quad.easeOut',
      });
    } else {
      targets.forEach((t) => {
        t.width = targetW;
      });
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
    const { player, enemy, playerSkills } = this.state;
    const btnW = 175;
    const btnH = 35;
    const gapX = 9;
    const gapY = 6;
    const startX = 266;
    const startY = 272;

    playerSkills.slice(0, 4).forEach((skill, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = startX + col * (btnW + gapX);
      const y = startY + row * (btnH + gapY);

      const meta = ELEMENT_STYLE[skill.element] ?? ELEMENT_STYLE[Element.Neutral];
      const spCost = skill.spCost ?? 0;
      const affordable = (player.currentSp ?? 0) >= spCost;

      const cardContainer = this.scene.add.container(x, y);

      const lip = this.scene.add.rectangle(btnW / 2, btnH / 2 + 2, btnW, btnH, 0x04070f);
      const bg = this.scene.add
        .rectangle(btnW / 2, btnH / 2, btnW, btnH, affordable ? 0x16233d : 0x0e1526)
        .setStrokeStyle(2, affordable ? 0x3b527a : 0x1e293b);
      const shine = this.scene.add.rectangle(btnW / 2, 3, btnW - 6, 2, 0xffffff, affordable ? 0.14 : 0.04);
      const stripe = this.scene.add.rectangle(4, btnH / 2, 5, btnH - 4, meta.color);

      const hasIcon = meta.iconKey && this.scene.textures.exists(meta.iconKey);
      const textStartX = hasIcon ? 25 : 11;

      const parts = [lip, bg, shine, stripe];

      if (hasIcon) {
        const icon = this.scene.add.image(16, btnH / 2, meta.iconKey).setDisplaySize(12, 12);
        if (!affordable) icon.setAlpha(0.4);
        parts.push(icon);
      }

      const nameTxt = this.scene.add.text(textStartX, 4, skill.name, {
        fontFamily: FONTS.ui,
        fontSize: '11px',
        fontStyle: 'bold',
        color: affordable ? '#f8fafc' : '#64748b',
      });

      const powerTxt = this.scene.add.text(textStartX, 19, `PWR ${skill.power} • ${meta.label}`, {
        fontFamily: FONTS.ui,
        fontSize: '9px',
        fontStyle: 'bold',
        color: affordable ? meta.hex : '#475569',
      });

      const spLabel = spCost > 0 ? `${spCost} SP` : 'FREE';
      const spTxt = this.scene.add
        .text(btnW - 6, 24, spLabel, {
          fontFamily: FONTS.display,
          fontSize: '7px',
          fontStyle: 'bold',
          color: spCost > 0 ? (affordable ? '#38bdf8' : '#ef4444') : '#4ade80',
        })
        .setOrigin(1, 0.5);

      parts.push(nameTxt, powerTxt, spTxt);

      // Elemental effectiveness micro-tag (SUPER / RESIST) for damaging skills
      if ((skill.power ?? 0) > 0 && enemy) {
        const eff = battleBridge.elementEffectiveness(skill.element, enemy.element);
        if (eff >= 1.4) {
          const tagBg = this.scene.add
            .rectangle(btnW - 22, 9, 36, 11, 0x064e3b)
            .setStrokeStyle(1, 0x34d399);
          const tagTxt = this.scene.add
            .text(btnW - 22, 9, 'SUPER', {
              fontFamily: FONTS.display,
              fontSize: '6px',
              fontStyle: 'bold',
              color: '#6ee7b7',
            })
            .setOrigin(0.5);
          parts.push(tagBg, tagTxt);
        } else if (eff <= 0.8) {
          const tagBg = this.scene.add
            .rectangle(btnW - 24, 9, 40, 11, 0x1e293b)
            .setStrokeStyle(1, 0x64748b);
          const tagTxt = this.scene.add
            .text(btnW - 24, 9, 'RESIST', {
              fontFamily: FONTS.display,
              fontSize: '6px',
              fontStyle: 'bold',
              color: '#94a3b8',
            })
            .setOrigin(0.5);
          parts.push(tagBg, tagTxt);
        }
      }

      cardContainer.add(parts);

      if (!affordable) {
        stripe.setAlpha(0.35);
      } else {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => {
          bg.setFillStyle(0x22365c);
          bg.setStrokeStyle(2, meta.color);
        });
        bg.on('pointerout', () => {
          bg.setFillStyle(0x16233d);
          bg.setStrokeStyle(2, 0x3b527a);
          cardContainer.y = y;
        });
        bg.on('pointerdown', () => {
          if (this.isBusy) return;
          cardContainer.y = y + 1;
          audioManager.playSfx('click');
          this.cb.onUseSkill?.(skill);
        });
        bg.on('pointerup', () => {
          cardContainer.y = y;
        });
      }

      this.deckContainer.add(cardContainer);
    });
  }

  _renderBagGrid() {
    const { bag } = this.state;
    const topItems = [
      { id: 'potion', name: 'Potion', desc: '+45 HP', color: 0x22c55e, count: bag.potion ?? 0 },
      { id: 'super_potion', name: 'Super Pot', desc: '+90 HP', color: 0x10b981, count: bag.super_potion ?? 0 },
      { id: 'antidote', name: 'Antidote', desc: 'Cure Status', color: 0xa855f7, count: bag.antidote ?? 0 },
    ];
    const orbItems = [
      { id: 'rift_orb', name: 'Rift Orb', desc: '1.25x Catch', color: 0x38bdf8, count: bag.rift_orb ?? 0 },
      { id: 'hyper_orb', name: 'Hyper Orb', desc: '2.0x Catch', color: 0xf59e0b, count: bag.hyper_orb ?? 0 },
    ];

    const startX = 266;
    const row1Y = 272;
    const rowH = 35;
    const row2Y = row1Y + rowH + 6;

    const drawCard = (item, x, y, w, h, compact) => {
      const usable = item.count > 0;
      const card = this.scene.add.container(x, y);

      const lip = this.scene.add.rectangle(w / 2, h / 2 + 2, w, h, 0x04070f);
      const bg = this.scene.add
        .rectangle(w / 2, h / 2, w, h, usable ? 0x16233d : 0x0e1526)
        .setStrokeStyle(2, usable ? 0x3b527a : 0x1e293b);
      const shine = this.scene.add.rectangle(w / 2, 3, w - 6, 2, 0xffffff, usable ? 0.14 : 0.04);
      const stripe = this.scene.add.rectangle(4, h / 2, 5, h - 4, item.color);
      if (!usable) stripe.setAlpha(0.35);

      const nameTxt = this.scene.add.text(11, 4, item.name, {
        fontFamily: FONTS.ui,
        fontSize: compact ? '10px' : '11px',
        fontStyle: 'bold',
        color: usable ? '#f8fafc' : '#64748b',
      });

      const descTxt = this.scene.add.text(11, 19, item.desc, {
        fontFamily: FONTS.ui,
        fontSize: compact ? '8px' : '9px',
        color: usable ? '#cbd5e1' : '#475569',
      });

      const countTxt = this.scene.add
        .text(w - 6, 24, `x${item.count}`, {
          fontFamily: FONTS.display,
          fontSize: '8px',
          fontStyle: 'bold',
          color: usable ? '#fde047' : '#64748b',
        })
        .setOrigin(1, 0.5);

      card.add([lip, bg, shine, stripe, nameTxt, descTxt, countTxt]);

      if (usable) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => {
          bg.setFillStyle(0x22365c);
          bg.setStrokeStyle(2, item.color);
        });
        bg.on('pointerout', () => {
          bg.setFillStyle(0x16233d);
          bg.setStrokeStyle(2, 0x3b527a);
          card.y = y;
        });
        bg.on('pointerdown', () => {
          if (this.isBusy) return;
          card.y = y + 1;
          audioManager.playSfx('click');
          this.cb.onUseItem?.(item.id);
        });
        bg.on('pointerup', () => {
          card.y = y;
        });
      }

      this.deckContainer.add(card);
    };

    // Row 1: 3 compact heal/cure cards
    const topW = 116;
    const topGap = 6;
    topItems.forEach((item, idx) => {
      drawCard(item, startX + idx * (topW + topGap), row1Y, topW, rowH, true);
    });

    // Row 2: 2 wide capture orb cards
    const orbW = 176;
    const orbGap = 8;
    orbItems.forEach((item, idx) => {
      drawCard(item, startX + idx * (orbW + orbGap), row2Y, orbW, rowH, false);
    });
  }

  _renderPartyList() {
    const { party, activePartyIndex } = this.state;
    const cardW = 116;
    const cardH = 76;
    const gapX = 6;
    const startX = 266;
    const startY = 272;

    party.slice(0, 3).forEach((mon, idx) => {
      const x = startX + idx * (cardW + gapX);
      const y = startY;
      const isActive = idx === activePartyIndex;
      const isAlive = mon.currentHp > 0;
      const meta = ELEMENT_STYLE[mon.element] ?? ELEMENT_STYLE[Element.Neutral];
      const ratio = mon.currentHp / Math.max(1, mon.maxHp);

      const card = this.scene.add.container(x, y);

      const lip = this.scene.add.rectangle(cardW / 2, cardH / 2 + 2, cardW, cardH, 0x04070f);
      const bg = this.scene.add
        .rectangle(cardW / 2, cardH / 2, cardW, cardH, isActive ? 0x1d2e4d : 0x131c31)
        .setStrokeStyle(2, isActive ? meta.color : 0x2e3c59);
      const topStripe = this.scene.add.rectangle(cardW / 2, 3, cardW - 4, 4, meta.color);
      if (!isAlive) topStripe.setAlpha(0.35);

      const parts = [lip, bg, topStripe];

      const hasIcon = meta.iconKey && this.scene.textures.exists(meta.iconKey);
      if (hasIcon) {
        const icon = this.scene.add.image(cardW - 12, 15, meta.iconKey).setDisplaySize(11, 11);
        if (!isAlive) icon.setAlpha(0.4);
        parts.push(icon);
      }

      const nameTxt = this.scene.add.text(7, 9, mon.name.slice(0, 9), {
        fontFamily: FONTS.ui,
        fontSize: '10px',
        fontStyle: 'bold',
        color: isAlive ? '#f8fafc' : '#64748b',
      });

      const lvTxt = this.scene.add.text(7, 22, `Lv.${mon.level} ${meta.label}`, {
        fontFamily: FONTS.ui,
        fontSize: '8px',
        color: isAlive ? meta.hex : '#475569',
      });

      const barW = cardW - 14;
      const barTrack = this.scene.add.rectangle(7, 38, barW, 7, 0x09111f).setOrigin(0, 0.5);
      const barFill = this.scene.add
        .rectangle(8, 38, Math.round((barW - 2) * Math.max(0, Math.min(1, ratio))), 5, hpBarColor(ratio))
        .setOrigin(0, 0.5);

      const hpTxt = this.scene.add
        .text(cardW - 7, 48, `${mon.currentHp}/${mon.maxHp}`, {
          fontFamily: FONTS.display,
          fontSize: '7px',
          color: '#cbd5e1',
        })
        .setOrigin(1, 0.5);

      const badgeLabel = isActive ? 'ACTIVE' : isAlive ? 'SWITCH' : 'KO';
      const badgeBgColor = isActive ? 0x0c4a6e : isAlive ? 0x064e3b : 0x450a0a;
      const badgeColor = isActive ? '#38bdf8' : isAlive ? '#4ade80' : '#f87171';
      const badgeBg = this.scene.add
        .rectangle(cardW / 2, 64, cardW - 14, 15, badgeBgColor)
        .setStrokeStyle(1, isActive ? 0x38bdf8 : isAlive ? 0x22c55e : 0xef4444, 0.6);
      const badgeTxt = this.scene.add
        .text(cardW / 2, 64, badgeLabel, {
          fontFamily: FONTS.display,
          fontSize: '7px',
          fontStyle: 'bold',
          color: badgeColor,
        })
        .setOrigin(0.5);

      parts.push(nameTxt, lvTxt, barTrack, barFill, hpTxt, badgeBg, badgeTxt);
      card.add(parts);

      if (!isActive && isAlive) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => {
          bg.setFillStyle(0x22365c);
          bg.setStrokeStyle(2, meta.color);
        });
        bg.on('pointerout', () => {
          bg.setFillStyle(0x131c31);
          bg.setStrokeStyle(2, 0x2e3c59);
          card.y = y;
        });
        bg.on('pointerdown', () => {
          if (this.isBusy) return;
          card.y = y + 1;
          audioManager.playSfx('click');
          this.cb.onSwitchParty?.(idx);
        });
        bg.on('pointerup', () => {
          card.y = y;
        });
      }

      this.deckContainer.add(card);
    });
  }

  showResultModal({ title, subtitle, detail, buttonLabel, accentColor = 0x22c55e, onAction }) {
    this.hideModal();

    const { width, height } = this.scene.scale;
    const cx = Math.round(width / 2);
    const cy = Math.round(height / 2);

    this.modalContainer = this.scene.add.container(0, 0).setDepth(80);

    const dim = this.scene.add.rectangle(cx, cy, width, height, 0x04070f, 0.8).setInteractive();

    const panel = drawRpgPanel(this.scene, cx - 180, cy - 105, 360, 210, {
      fill: 0x0c1426,
      alpha: 0.98,
      border: accentColor,
      outer: 0x04070f,
      accent: accentColor,
      depth: 81,
      rivets: true,
    });

    const titleTxt = this.scene.add
      .text(cx, cy - 66, title, {
        fontFamily: FONTS.display,
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5);

    const subTxt = this.scene.add
      .text(cx, cy - 32, subtitle, {
        fontFamily: FONTS.ui,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#fde047',
        align: 'center',
        wordWrap: { width: 320 },
      })
      .setOrigin(0.5);

    const detailTxt = this.scene.add
      .text(cx, cy + 8, detail, {
        fontFamily: FONTS.ui,
        fontSize: '11px',
        color: '#cbd5e1',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: 320 },
      })
      .setOrigin(0.5);

    const btn = createRpgButton(this.scene, cx, cy + 68, 224, 40, {
      label: buttonLabel,
      fill: accentColor,
      hover: 0x34d399,
      border: 0xf8fafc,
      lip: 0x04070f,
      textColor: '#070b14',
      fontSize: '11px',
      fontFamily: FONTS.display,
      depth: 82,
      onClick: () => {
        audioManager.playSfx('click');
        this.hideModal();
        onAction?.();
      },
    });

    this.modalContainer.add([dim, panel, titleTxt, subTxt, detailTxt, btn.container]);
  }

  hideModal() {
    if (this.modalContainer) {
      this.modalContainer.destroy(true);
      this.modalContainer = null;
    }
  }
}
