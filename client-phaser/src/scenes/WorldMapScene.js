import Phaser from 'phaser';
import { CHAPTERS, CAMPAIGN_NODES, getNodesByChapter } from '../data/campaign.js';
import { MONSTERS } from '../data/monsters.js';
import { SHOP_ITEMS } from '../data/items.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { battleBridge } from '../bridge/battleBridge.js';
import { ELEMENT_META } from '../ui/BattleHud.js';
import { gameState } from '../state/gameState.js';
import { audioManager } from '../audio/audioManager.js';

const FONT = 'monospace';

function hexToInt(hex, fallback = 0x38bdf8) {
  if (typeof hex === 'number') return hex;
  if (typeof hex === 'string') {
    const clean = hex.replace('#', '');
    const parsed = Number.parseInt(clean, 16);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function hpBarColor(ratio) {
  if (ratio > 0.5) return 0x22c55e;
  if (ratio > 0.25) return 0xf59e0b;
  return 0xef4444;
}

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMapScene' });
  }

  init(data) {
    if (data?.chapter) {
      this.activeChapter = data.chapter;
    } else {
      const nextOpen = CAMPAIGN_NODES.find(
        (n) => gameState.isNodeUnlocked(n.id) && !gameState.completedNodeIds.includes(n.id)
      );
      this.activeChapter = nextOpen?.chapter ?? CHAPTERS[CHAPTERS.length - 1]?.id ?? 1;
    }

    this.mapContainer = null;
    this.partyStripContainer = null;
    this.previewContainer = null;
    this.partyModalContainer = null;
    this.shopModalContainer = null;
    this.dexModalContainer = null;
    this.dexAnimTimer = null;
    this.partyModalTab = 'party';
    this.selectedDexId = Object.keys(MONSTERS)[0] ?? 'pyrofang';
    this.selectedPartySwapIdx = 0;
    this.storagePage = 0;
    this.tabRefs = [];
  }

  create() {
    this.add.rectangle(320, 180, 640, 360, 0x090e1a).setDepth(0);

    this._buildTopBar();
    this._buildBottomActionBar();

    this._renderChapterMap();
    this._renderPartyStrip();

    audioManager.playBgm('map');
  }

  _buildTopBar() {
    // Top Bar (y: 0..34, w: 640)
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x0b1222, 0.98);
    g.fillRect(0, 0, 640, 34);
    g.fillStyle(0x263554, 1);
    g.fillRect(0, 32, 640, 2);

    this.add
      .text(10, 17, 'CAMPAIGN MAP', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0, 0.5)
      .setDepth(21);

    // Inline 4 Chapter tabs (CH.1 - CH.4)
    const tabW = 54;
    const tabH = 24;
    const gap = 4;
    const startX = 114;
    const tabY = 5;

    this.tabRefs = CHAPTERS.slice(0, 4).map((ch, idx) => {
      const x = startX + idx * (tabW + gap);
      const accentInt = hexToInt(ch.accent, 0x38bdf8);

      const bg = this.add
        .rectangle(x + tabW / 2, tabY + tabH / 2, tabW, tabH, 0x131c31)
        .setStrokeStyle(1, 0x263554)
        .setInteractive({ useHandCursor: true })
        .setDepth(21);

      const bar = this.add.rectangle(x + tabW / 2, tabY + 2, tabW - 4, 3, accentInt).setDepth(22);

      const label = this.add
        .text(x + tabW / 2, tabY + tabH / 2 + 1, `CH.${ch.id}`, {
          fontFamily: FONT,
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#94a3b8',
        })
        .setOrigin(0.5)
        .setDepth(22);

      bg.on('pointerdown', () => {
        if (this.activeChapter === ch.id) return;
        audioManager.playSfx('click');
        this.activeChapter = ch.id;
        this._hidePreviewCard();
        this._renderChapterMap();
      });

      return { ch, accentInt, bg, bar, label };
    });

    this._refreshTabs();

    // Gold & Progress %
    const totalNodes = Math.max(1, CAMPAIGN_NODES.length);
    const pct = Math.min(100, Math.round((gameState.completedNodeIds.length / totalNodes) * 100));

    this.goldText = this.add
      .text(420, 17, `${gameState.gold}G`, {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#fbbf24',
      })
      .setOrigin(1, 0.5)
      .setDepth(21);

    this.progressText = this.add
      .text(468, 17, `${pct}%`, {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#34d399',
      })
      .setOrigin(1, 0.5)
      .setDepth(21);

    // Audio mute toggle
    const audioBg = this.add
      .rectangle(522, 17, 68, 22, 0x162440)
      .setStrokeStyle(1, 0x38bdf8)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    const audioTxt = this.add
      .text(522, 17, 'SFX ON', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#7dd3fc',
      })
      .setOrigin(0.5)
      .setDepth(22);

    const syncAudio = () => {
      const muted = audioManager.isMuted();
      audioBg.setFillStyle(muted ? 0x291522 : 0x162440);
      audioBg.setStrokeStyle(1, muted ? 0xef4444 : 0x38bdf8);
      audioTxt.setText(muted ? 'MUTED' : 'SFX ON');
      audioTxt.setColor(muted ? '#fca5a5' : '#7dd3fc');
    };

    audioBg.on('pointerdown', () => {
      audioManager.unlock();
      audioManager.toggleMute();
      syncAudio();
      if (!audioManager.isMuted()) {
        audioManager.playSfx('click');
        audioManager.playBgm('map');
      }
    });
    syncAudio();

    // TITLE button
    const titleBtn = this.add
      .rectangle(598, 17, 64, 22, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    this.add
      .text(598, 17, 'TITLE', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#e2e8f0',
      })
      .setOrigin(0.5)
      .setDepth(22);

    titleBtn.on('pointerover', () => titleBtn.setFillStyle(0x334155));
    titleBtn.on('pointerout', () => titleBtn.setFillStyle(0x1e293b));
    titleBtn.on('pointerdown', () => {
      audioManager.playSfx('click');
      this.scene.start('TitleScene');
    });
  }

  _refreshTabs() {
    this.tabRefs.forEach((tab) => {
      const active = tab.ch.id === this.activeChapter;
      tab.bg.setFillStyle(active ? 0x1e2d4a : 0x111829);
      tab.bg.setStrokeStyle(1, active ? tab.accentInt : 0x24314a);
      tab.label.setColor(active ? '#ffffff' : '#64748b');
      tab.bar.setAlpha(active ? 1 : 0.35);
    });
  }

  _renderChapterMap() {
    this._refreshTabs();

    if (this.mapContainer) {
      this.mapContainer.destroy(true);
      this.mapContainer = null;
    }

    this.mapContainer = this.add.container(0, 0).setDepth(5);
    const chapter = CHAPTERS.find((c) => c.id === this.activeChapter) ?? CHAPTERS[0];
    const accentInt = hexToInt(chapter?.accent, 0x38bdf8);

    // Scenic Wide Map Canvas: y: 38..274 (height 236, width 640)
    const mapCenterY = 156;
    const mapH = 236;

    const bgKey = chapter?.theme && this.textures.exists(chapter.theme) ? chapter.theme : 'bg_arena_solara';
    if (this.textures.exists(bgKey)) {
      const bgImg = this.add.image(320, mapCenterY, bgKey);
      bgImg.setDisplaySize(640, mapH);
      bgImg.setTint(0x64748b);
      this.mapContainer.add(bgImg);
    } else {
      this.mapContainer.add(this.add.rectangle(320, mapCenterY, 640, mapH, 0x0f172a));
    }

    // Tasteful dark scrim
    const scrim = this.add.rectangle(320, mapCenterY, 640, mapH, 0x060b16, 0.58);
    this.mapContainer.add(scrim);

    // Chapter title banner top-left (x: 10, y: 42, w: 244, h: 30)
    const bannerBg = this.add.rectangle(132, 57, 244, 30, 0x0b1222, 0.92).setStrokeStyle(1, accentInt);
    const bannerStripe = this.add.rectangle(13, 57, 4, 26, accentInt);
    const bannerTitle = this.add.text(22, 46, `CH.${chapter.id} — ${chapter.name}`, {
      fontFamily: FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f8fafc',
    });
    const bannerSub = this.add.text(22, 60, chapter.subtitle ?? '', {
      fontFamily: FONT,
      fontSize: '9px',
      color: chapter.accent ?? '#38bdf8',
    });
    this.mapContainer.add([bannerBg, bannerStripe, bannerTitle, bannerSub]);

    const nodes = [...getNodesByChapter(this.activeChapter)].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    if (nodes.length === 0) {
      const emptyTxt = this.add
        .text(320, mapCenterY, 'Chapter ini belum memiliki stage.\nSelesaikan chapter sebelumnya!', {
          fontFamily: FONT,
          fontSize: '11px',
          color: '#94a3b8',
          align: 'center',
        })
        .setOrigin(0.5);
      this.mapContainer.add(emptyTxt);
      return;
    }

    // Position nodes left-to-right; if campaign.js still carries legacy portrait y (> 274),
    // gracefully map them across the wide 640x360 canvas, always clamped to x: 70..570, y: 78..244.
    const hasLegacyPortraitCoords = nodes.some((n) => (n.mapPos?.y ?? 0) > 274);
    const fallbackXs = [132, 320, 508];
    const fallbackYs = [196, 134, 174];

    const positioned = nodes.map((node, idx) => {
      let rawX = node.mapPos?.x ?? fallbackXs[idx % fallbackXs.length];
      let rawY = node.mapPos?.y ?? fallbackYs[idx % fallbackYs.length];
      if (hasLegacyPortraitCoords) {
        rawX = fallbackXs[idx] ?? 110 + idx * 190;
        rawY = fallbackYs[idx] ?? 168;
      }
      return {
        node,
        x: Math.max(70, Math.min(570, rawX)),
        y: Math.max(78, Math.min(244, rawY)),
      };
    });

    // Draw glowing dotted pixel trails connecting consecutive nodes left-to-right
    const trailG = this.add.graphics();
    for (let i = 0; i < positioned.length - 1; i++) {
      const a = positioned[i];
      const b = positioned[i + 1];
      const nextUnlocked = gameState.isNodeUnlocked(b.node.id);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(5, Math.floor(dist / 14));

      for (let s = 1; s < steps; s++) {
        const px = Math.round(a.x + (dx * s) / steps);
        const py = Math.round(a.y + (dy * s) / steps);
        if (nextUnlocked) {
          trailG.fillStyle(accentInt, 0.35);
          trailG.fillRect(px - 3, py - 3, 6, 6);
          trailG.fillStyle(0xf8fafc, 0.9);
          trailG.fillRect(px - 1, py - 1, 3, 3);
        } else {
          trailG.fillStyle(0x475569, 0.65);
          trailG.fillRect(px - 2, py - 2, 4, 4);
        }
      }
    }
    this.mapContainer.add(trailG);

    // Render interactive node pins
    positioned.forEach(({ node, x, y }) => {
      const unlocked = gameState.isNodeUnlocked(node.id);
      const cleared = gameState.completedNodeIds.includes(node.id);
      const isBoss = node.type === 'boss';
      const isCurrent = unlocked && !cleared;
      const radius = isBoss ? 22 : 18;

      if (isCurrent) {
        const pulseRing = this.add
          .circle(x, y, radius + 7, isBoss ? 0xef4444 : accentInt, 0.25)
          .setStrokeStyle(2, isBoss ? 0xf87171 : accentInt);
        this.tweens.add({
          targets: pulseRing,
          scale: 1.24,
          alpha: 0.12,
          yoyo: true,
          repeat: -1,
          duration: 850,
          ease: 'Sine.easeInOut',
        });
        this.mapContainer.add(pulseRing);
      }

      const fillColor = !unlocked
        ? 0x1e293b
        : isBoss
          ? cleared
            ? 0x6b21a8
            : 0x991b1b
          : cleared
            ? 0x065f46
            : 0x1d4ed8;
      const strokeColor = !unlocked
        ? 0x475569
        : isBoss
          ? 0xf43f5e
          : cleared
            ? 0x34d399
            : accentInt;

      const pin = this.add.circle(x, y, radius, fillColor).setStrokeStyle(3, strokeColor);
      this.mapContainer.add(pin);

      // Boss pixel crown
      if (isBoss) {
        const crown = this.add.graphics();
        const cy = y - radius - 8;
        crown.fillStyle(unlocked ? 0xfacc15 : 0x64748b, 1);
        crown.fillRect(x - 10, cy + 4, 20, 4);
        crown.fillRect(x - 10, cy, 4, 4);
        crown.fillRect(x - 2, cy - 2, 4, 6);
        crown.fillRect(x + 6, cy, 4, 4);
        this.mapContainer.add(crown);
      }

      // Center icon: lock / check / stage number
      if (!unlocked) {
        const lockG = this.add.graphics();
        lockG.lineStyle(2, 0x94a3b8, 1);
        lockG.strokeRect(x - 4, y - 8, 8, 6);
        lockG.fillStyle(0x94a3b8, 1);
        lockG.fillRect(x - 6, y - 2, 12, 9);
        this.mapContainer.add(lockG);
      } else if (cleared) {
        const checkTxt = this.add
          .text(x, y, '✓', {
            fontFamily: FONT,
            fontSize: isBoss ? '17px' : '15px',
            fontStyle: 'bold',
            color: '#6ee7b7',
          })
          .setOrigin(0.5);
        this.mapContainer.add(checkTxt);
      } else {
        const numTxt = this.add
          .text(x, y, `${node.index ?? 1}`, {
            fontFamily: FONT,
            fontSize: isBoss ? '15px' : '13px',
            fontStyle: 'bold',
            color: '#ffffff',
          })
          .setOrigin(0.5);
        this.mapContainer.add(numTxt);
      }

      // OPEN / BOSS / CLEARED status tag above pin
      if (isCurrent) {
        const tagY = y - radius - (isBoss ? 17 : 11);
        const tagBg = this.add.rectangle(x, tagY, 44, 14, isBoss ? 0xef4444 : accentInt);
        const tagTxt = this.add
          .text(x, tagY, isBoss ? 'BOSS' : 'OPEN', {
            fontFamily: FONT,
            fontSize: '8px',
            fontStyle: 'bold',
            color: '#070b14',
          })
          .setOrigin(0.5);
        this.mapContainer.add([tagBg, tagTxt]);
      }

      // Node title pill below pin
      const labelY = Math.min(262, y + radius + 14);
      const pillW = Math.min(148, node.title.length * 6.5 + 18);
      const labelBg = this.add.rectangle(x, labelY, pillW, 16, 0x090e1a, 0.9);
      const labelTxt = this.add
        .text(x, labelY, node.title, {
          fontFamily: FONT,
          fontSize: '9px',
          fontStyle: 'bold',
          color: unlocked ? '#f8fafc' : '#64748b',
        })
        .setOrigin(0.5);
      this.mapContainer.add([labelBg, labelTxt]);

      if (unlocked) {
        pin.setInteractive({ useHandCursor: true });
        pin.on('pointerdown', () => {
          audioManager.playSfx('click');
          this._showPreviewCard(node);
        });
      }
    });
  }

  _showPreviewCard(node) {
    this._hidePreviewCard();

    const enemyDef = MONSTERS[node.enemyId] ?? MONSTERS.verdantix;
    const enemyMeta = ELEMENT_META[enemyDef.element] ?? ELEMENT_META[0];
    const typeLabel = (node.type ?? 'wild').toUpperCase();
    const typeColor = typeLabel === 'BOSS' ? 0xef4444 : typeLabel === 'RIVAL' ? 0xf59e0b : 0x22c55e;
    const cleared = gameState.completedNodeIds.includes(node.id);

    this.previewContainer = this.add.container(0, 0).setDepth(60);

    // Dismiss backdrop
    const dim = this.add.rectangle(320, 180, 640, 360, 0x04070f, 0.62).setInteractive();
    dim.on('pointerdown', () => this._hidePreviewCard());

    const cardW = 392;
    const cardH = 196;
    const cx = 320;
    const cy = 176;
    const left = cx - cardW / 2;
    const top = cy - cardH / 2;

    const panel = this.add.rectangle(cx, cy, cardW, cardH, 0x111a2e).setStrokeStyle(2, typeColor).setInteractive();
    const topBar = this.add.rectangle(cx, top + 3, cardW - 4, 6, typeColor);

    // Close button
    const closeBtn = this.add
      .rectangle(left + cardW - 22, top + 24, 26, 24, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });
    const closeTxt = this.add
      .text(left + cardW - 22, top + 24, 'X', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#e2e8f0',
      })
      .setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      audioManager.playSfx('click');
      this._hidePreviewCard();
    });

    // Enemy sprite preview
    const spriteBg = this.add.rectangle(left + 56, top + 76, 78, 78, 0x090e1a).setStrokeStyle(2, enemyMeta.color);
    const texKey = getMonsterTextureKey(node.enemyId, 0);
    const enemyImg = this.add
      .image(left + 56, top + 76, this.textures.exists(texKey) ? texKey : 'particle_pixel')
      .setScale(1.18);

    // Stage & Enemy Info
    const infoX = left + 108;
    const stageTxt = this.add.text(infoX, top + 16, `CH.${node.chapter} • ${node.title}`, {
      fontFamily: FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f8fafc',
    });

    const typeBg = this.add.rectangle(infoX + 28, top + 42, 56, 16, typeColor);
    const typeTxt = this.add
      .text(infoX + 28, top + 42, typeLabel, {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#070b14',
      })
      .setOrigin(0.5);

    const statusBadge = cleared
      ? this.add.text(infoX + 64, top + 36, 'CLEARED (REPLAY)', {
          fontFamily: FONT,
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#34d399',
        })
      : this.add.text(infoX + 64, top + 36, enemyMeta.label, {
          fontFamily: FONT,
          fontSize: '9px',
          fontStyle: 'bold',
          color: enemyMeta.hex,
        });

    const enemyTxt = this.add.text(infoX, top + 58, `${enemyDef.name}  Lv.${node.enemyLevel}`, {
      fontFamily: FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fde047',
    });

    // Rewards line
    const itemEntries = Object.entries(node.itemRewards ?? {});
    const itemStr =
      itemEntries.length > 0
        ? '  ' + itemEntries.map(([k, v]) => `+${v} ${k.replace('_', ' ')}`).join(', ')
        : '';
    const rewardTxt = this.add.text(
      infoX,
      top + 80,
      `REWARD: +${node.xpReward ?? 50} XP  +${node.goldReward ?? 30}G${itemStr}`,
      {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#cbd5e1',
        wordWrap: { width: 266 },
      }
    );

    // Start Battle button
    const startBtn = this.add
      .rectangle(cx, top + cardH - 32, 344, 42, 0x10b981)
      .setStrokeStyle(2, 0xa7f3d0)
      .setInteractive({ useHandCursor: true });

    const startTxt = this.add
      .text(cx, top + cardH - 32, 'MULAI PERTARUNGAN', {
        fontFamily: FONT,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#052e16',
      })
      .setOrigin(0.5);

    startBtn.on('pointerover', () => startBtn.setFillStyle(0x34d399));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0x10b981));
    startBtn.on('pointerdown', () => {
      audioManager.playSfx('click');
      this._hidePreviewCard();
      this.scene.start('BattleScene', {
        mode: 'campaign',
        nodeId: node.id,
        runtime: battleBridge.runtime,
      });
    });

    this.previewContainer.add([
      dim,
      panel,
      topBar,
      closeBtn,
      closeTxt,
      spriteBg,
      enemyImg,
      stageTxt,
      typeBg,
      typeTxt,
      statusBadge,
      enemyTxt,
      rewardTxt,
      startBtn,
      startTxt,
    ]);
  }

  _hidePreviewCard() {
    if (this.previewContainer) {
      this.previewContainer.destroy(true);
      this.previewContainer = null;
    }
  }

  _syncTopBarGold() {
    if (this.goldText) {
      this.goldText.setText(`${gameState.gold}G`);
    }
  }

  _hideAllModals() {
    this._hidePreviewCard();
    this._hidePartyModal();
    this._hideShopModal();
    this._hideDexModal();
  }

  _buildBottomActionBar() {
    // Bottom Bar (y: 274..360, height 86)
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x0a101f, 1);
    g.fillRect(0, 274, 640, 86);
    g.fillStyle(0x263554, 1);
    g.fillRect(0, 274, 640, 2);

    // 2x2 thumb-friendly action buttons alongside Party strip (x: 456..632, y: 282..352)
    const buttons = [
      {
        label: 'HEAL',
        x: 498,
        y: 298,
        fill: 0x065f46,
        hover: 0x047857,
        stroke: 0x34d399,
        textColor: '#ecfdf5',
        onClick: () => {
          audioManager.playSfx('heal');
          gameState.healAllParty();
          this._renderPartyStrip();
          this._showToast('HEAL CAMP: Tim pulih 100% HP & SP!', '#4ade80');
        },
      },
      {
        label: 'SHOP',
        x: 590,
        y: 298,
        fill: 0x78350f,
        hover: 0x92400e,
        stroke: 0xfbbf24,
        textColor: '#fef3c7',
        onClick: () => {
          audioManager.playSfx('click');
          this._showShopModal();
        },
      },
      {
        label: 'DEX',
        x: 498,
        y: 336,
        fill: 0x4c1d95,
        hover: 0x5b21b6,
        stroke: 0xc084fc,
        textColor: '#f3e8ff',
        onClick: () => {
          audioManager.playSfx('click');
          this._showDexModal();
        },
      },
      {
        label: 'PARTY',
        x: 590,
        y: 336,
        fill: 0x1e293b,
        hover: 0x334155,
        stroke: 0x38bdf8,
        textColor: '#e0f2fe',
        onClick: () => {
          audioManager.playSfx('click');
          this.partyModalTab = 'party';
          this._showPartyModal();
        },
      },
    ];

    buttons.forEach((b) => {
      const btn = this.add
        .rectangle(b.x, b.y, 84, 32, b.fill)
        .setStrokeStyle(2, b.stroke)
        .setInteractive({ useHandCursor: true })
        .setDepth(22);

      this.add
        .text(b.x, b.y, b.label, {
          fontFamily: FONT,
          fontSize: '11px',
          fontStyle: 'bold',
          color: b.textColor,
        })
        .setOrigin(0.5)
        .setDepth(23);

      btn.on('pointerover', () => btn.setFillStyle(b.hover));
      btn.on('pointerout', () => btn.setFillStyle(b.fill));
      btn.on('pointerdown', b.onClick);
    });
  }

  _renderPartyStrip() {
    if (this.partyStripContainer) {
      this.partyStripContainer.destroy(true);
      this.partyStripContainer = null;
    }

    this.partyStripContainer = this.add.container(0, 0).setDepth(22);

    // Compact 3-slot Party strip (left/center, x: 10..448, y: 282..352)
    const slotW = 140;
    const slotH = 70;
    const gap = 8;
    const startX = 10;
    const y = 282;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (slotW + gap);
      const mon = gameState.party[i];

      if (!mon) {
        const emptyBg = this.add
          .rectangle(x + slotW / 2, y + slotH / 2, slotW, slotH, 0x0f172a)
          .setStrokeStyle(1, 0x1e293b);
        const emptyTxt = this.add
          .text(x + slotW / 2, y + slotH / 2, 'EMPTY SLOT', {
            fontFamily: FONT,
            fontSize: '10px',
            color: '#475569',
          })
          .setOrigin(0.5);
        this.partyStripContainer.add([emptyBg, emptyTxt]);
        continue;
      }

      const meta = ELEMENT_META[mon.element] ?? ELEMENT_META[0];
      const ratio = mon.currentHp / Math.max(1, mon.maxHp);
      const isLead = i === 0;

      const bg = this.add
        .rectangle(x + slotW / 2, y + slotH / 2, slotW, slotH, isLead ? 0x162440 : 0x111a2e)
        .setStrokeStyle(isLead ? 2 : 1, isLead ? meta.color : 0x2e3c59)
        .setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        audioManager.playSfx('click');
        this._showPartyModal();
      });

      const texKey = getMonsterTextureKey(mon.id, 0);
      const sprite = this.add
        .image(x + 24, y + 26, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(0.68);

      const nameTxt = this.add.text(x + 48, y + 8, mon.name.slice(0, 10), {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#f8fafc',
      });

      const lvTxt = this.add.text(x + 48, y + 22, `Lv.${mon.level}${isLead ? ' ★' : ''}`, {
        fontFamily: FONT,
        fontSize: '9px',
        color: isLead ? '#fde047' : '#94a3b8',
      });

      const barW = 122;
      const track = this.add.rectangle(x + 9, y + 48, barW, 7, 0x090e1a).setOrigin(0, 0.5);
      const fill = this.add
        .rectangle(x + 10, y + 48, Math.round((barW - 2) * Math.max(0, Math.min(1, ratio))), 5, hpBarColor(ratio))
        .setOrigin(0, 0.5);

      const hpTxt = this.add
        .text(x + slotW - 9, y + 60, `${mon.currentHp}/${mon.maxHp}`, {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#cbd5e1',
        })
        .setOrigin(1, 0.5);

      this.partyStripContainer.add([bg, sprite, nameTxt, lvTxt, track, fill, hpTxt]);
    }
  }

  _showShopModal() {
    this._hideAllModals();
    this.shopModalContainer = this.add.container(0, 0).setDepth(70);

    const dim = this.add.rectangle(320, 180, 640, 360, 0x04070f, 0.8).setInteractive();
    dim.on('pointerdown', () => this._hideShopModal());

    const panelW = 540;
    const panelH = 278;
    const cx = 320;
    const cy = 180;
    const left = cx - panelW / 2;
    const top = cy - panelH / 2;

    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x111a2e).setStrokeStyle(2, 0xfbbf24).setInteractive();
    const title = this.add.text(left + 16, top + 12, 'SOLARA SHOP', {
      fontFamily: FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fde047',
    });
    const sub = this.add.text(left + 16, top + 28, 'Beli Potion, Antidote & Orb Penangkap', {
      fontFamily: FONT,
      fontSize: '9px',
      color: '#94a3b8',
    });

    const goldPill = this.add.rectangle(left + panelW - 96, top + 22, 100, 22, 0x1c1917).setStrokeStyle(1, 0xfbbf24);
    const goldTxt = this.add
      .text(left + panelW - 96, top + 22, `GOLD: ${gameState.gold}G`, {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#fbbf24',
      })
      .setOrigin(0.5);

    const closeBtn = this.add
      .rectangle(left + panelW - 24, top + 22, 26, 22, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });
    const closeTxt = this.add
      .text(left + panelW - 24, top + 22, 'X', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      audioManager.playSfx('click');
      this._hideShopModal();
    });

    this.shopModalContainer.add([dim, panel, title, sub, goldPill, goldTxt, closeBtn, closeTxt]);

    const rowW = panelW - 32;
    const rowH = 39;
    const gapY = 5;
    const startY = top + 48;

    SHOP_ITEMS.forEach((item, idx) => {
      const rx = left + 16;
      const ry = startY + idx * (rowH + gapY);
      const owned = gameState.bag?.[item.id] ?? 0;
      const canAfford = gameState.gold >= item.price;

      const rowBg = this.add
        .rectangle(rx + rowW / 2, ry + rowH / 2, rowW, rowH, 0x0f172a)
        .setStrokeStyle(1, 0x263554);
      const stripe = this.add.rectangle(rx + 4, ry + rowH / 2, 5, rowH - 4, item.color ?? 0x38bdf8);

      const nameTxt = this.add.text(rx + 14, ry + 5, `${item.name}  [${item.shortDesc}]`, {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#f8fafc',
      });
      const descTxt = this.add.text(rx + 14, ry + 21, item.description ?? '', {
        fontFamily: FONT,
        fontSize: '8px',
        color: '#94a3b8',
      });

      const ownedTxt = this.add
        .text(rx + rowW - 144, ry + rowH / 2, `TAS: x${owned}`, {
          fontFamily: FONT,
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#7dd3fc',
        })
        .setOrigin(1, 0.5);

      const priceTxt = this.add
        .text(rx + rowW - 86, ry + rowH / 2, `${item.price}G`, {
          fontFamily: FONT,
          fontSize: '11px',
          fontStyle: 'bold',
          color: canAfford ? '#fbbf24' : '#ef4444',
        })
        .setOrigin(1, 0.5);

      const buyBtn = this.add
        .rectangle(rx + rowW - 40, ry + rowH / 2, 66, 26, canAfford ? 0x059669 : 0x1e293b)
        .setStrokeStyle(1, canAfford ? 0x34d399 : 0x475569)
        .setInteractive({ useHandCursor: true });
      const buyTxt = this.add
        .text(rx + rowW - 40, ry + rowH / 2, 'BELI', {
          fontFamily: FONT,
          fontSize: '10px',
          fontStyle: 'bold',
          color: canAfford ? '#ecfdf5' : '#64748b',
        })
        .setOrigin(0.5);

      buyBtn.on('pointerover', () => {
        if (gameState.gold >= item.price) buyBtn.setFillStyle(0x10b981);
      });
      buyBtn.on('pointerout', () => {
        buyBtn.setFillStyle(gameState.gold >= item.price ? 0x059669 : 0x1e293b);
      });
      buyBtn.on('pointerdown', () => {
        let ok = false;
        if (typeof gameState.buyItem === 'function') {
          const res = gameState.buyItem(item.id, 1);
          ok = typeof res === 'object' && res !== null ? Boolean(res.ok ?? res.success) : Boolean(res);
        } else if (gameState.gold >= item.price) {
          gameState.gold -= item.price;
          gameState.bag[item.id] = (gameState.bag[item.id] ?? 0) + 1;
          gameState.save?.();
          ok = true;
        }

        if (ok) {
          audioManager.playSfx('heal');
          this._syncTopBarGold();
          this._showShopModal();
          this._showToast(`Membeli ${item.name}! (Sisa ${gameState.gold}G)`, '#4ade80');
        } else {
          audioManager.playSfx('miss');
          this._showToast(`Gold tidak cukup! Butuh ${item.price}G.`, '#f87171');
        }
      });

      this.shopModalContainer.add([rowBg, stripe, nameTxt, descTxt, ownedTxt, priceTxt, buyBtn, buyTxt]);
    });
  }

  _hideShopModal() {
    if (this.shopModalContainer) {
      this.shopModalContainer.destroy(true);
      this.shopModalContainer = null;
    }
  }

  _showDexModal() {
    this._hideAllModals();
    this.dexModalContainer = this.add.container(0, 0).setDepth(70);

    const dim = this.add.rectangle(320, 180, 640, 360, 0x04070f, 0.82).setInteractive();
    dim.on('pointerdown', () => this._hideDexModal());

    const panelW = 560;
    const panelH = 286;
    const cx = 320;
    const cy = 180;
    const left = cx - panelW / 2;
    const top = cy - panelH / 2;

    const allMons = Object.values(MONSTERS);
    const ownedFallback = [
      ...(gameState.party ?? []).map((m) => m.id),
      ...(gameState.storage ?? []).map((m) => m.id),
    ];
    const caughtSet = new Set(Array.isArray(gameState.caughtIds) ? gameState.caughtIds : ownedFallback);
    const seenSet = new Set([
      ...(Array.isArray(gameState.seenIds) ? gameState.seenIds : ownedFallback),
      ...caughtSet,
    ]);
    const stats = gameState.getDexStats?.() ?? {
      seen: seenSet.size,
      caught: caughtSet.size,
      total: allMons.length,
    };

    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x111a2e).setStrokeStyle(2, 0xc084fc).setInteractive();
    const headerTxt = this.add.text(
      left + 16,
      top + 14,
      `MONSVERDEX • SEEN ${stats.seen ?? seenSet.size}/${stats.total ?? allMons.length} • CAUGHT ${stats.caught ?? caughtSet.size}/${stats.total ?? allMons.length}`,
      {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#e9d5ff',
      }
    );

    const closeBtn = this.add
      .rectangle(left + panelW - 24, top + 20, 26, 22, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });
    const closeTxt = this.add
      .text(left + panelW - 24, top + 20, 'X', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      audioManager.playSfx('click');
      this._hideDexModal();
    });

    this.dexModalContainer.add([dim, panel, headerTxt, closeBtn, closeTxt]);

    // Left 4x3 grid of all 12 Monsvers
    const gridX = left + 14;
    const gridY = top + 44;
    const cellW = 62;
    const cellH = 72;
    const gapX = 6;
    const gapY = 6;

    allMons.slice(0, 12).forEach((mon, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const x = gridX + col * (cellW + gapX);
      const y = gridY + row * (cellH + gapY);
      const isCaught = caughtSet.has(mon.id);
      const isSeen = isCaught || seenSet.has(mon.id);
      const isSelected = this.selectedDexId === mon.id;

      const cellBg = this.add
        .rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, isSelected ? 0x1e2d4a : 0x0f172a)
        .setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xfde047 : isCaught ? 0x34d399 : 0x263554)
        .setInteractive({ useHandCursor: true });

      const texKey = getMonsterTextureKey(mon.id, 0);
      const sp = this.add
        .image(x + cellW / 2, y + 28, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(0.72);
      if (!isSeen) {
        sp.setTint(0x090e1a);
        sp.setAlpha(0.72);
      } else if (!isCaught) {
        sp.setAlpha(0.88);
      }

      const lbl = this.add
        .text(x + cellW / 2, y + cellH - 11, isSeen ? mon.name.slice(0, 9) : '???', {
          fontFamily: FONT,
          fontSize: '8px',
          fontStyle: isSelected ? 'bold' : 'normal',
          color: isSeen ? '#f8fafc' : '#64748b',
        })
        .setOrigin(0.5);

      cellBg.on('pointerdown', () => {
        if (this.selectedDexId === mon.id) return;
        audioManager.playSfx('click');
        this.selectedDexId = mon.id;
        this._showDexModal();
      });

      this.dexModalContainer.add([cellBg, sp, lbl]);

      if (isCaught) {
        const dot = this.add.circle(x + cellW - 8, y + 8, 4, 0x10b981).setStrokeStyle(1, 0xa7f3d0);
        this.dexModalContainer.add(dot);
      }
    });

    // Right Detail Card (w: 254, h: 228)
    const detX = left + 292;
    const detY = top + 44;
    const detW = 254;
    const detH = 228;
    const sel = MONSTERS[this.selectedDexId] ?? allMons[0];
    const selCaught = caughtSet.has(sel.id);
    const selSeen = selCaught || seenSet.has(sel.id);
    const meta = ELEMENT_META[sel.element] ?? ELEMENT_META[0];

    const detBg = this.add
      .rectangle(detX + detW / 2, detY + detH / 2, detW, detH, 0x0f172a)
      .setStrokeStyle(2, selSeen ? meta.color : 0x334155);
    this.dexModalContainer.add(detBg);

    const spriteFrame = this.add
      .rectangle(detX + 46, detY + 48, 72, 72, 0x090e1a)
      .setStrokeStyle(1, selSeen ? meta.color : 0x334155);
    const selTex0 = getMonsterTextureKey(sel.id, 0);
    const selTex1 = getMonsterTextureKey(sel.id, 1);
    const detSprite = this.add
      .image(detX + 46, detY + 48, this.textures.exists(selTex0) ? selTex0 : 'particle_pixel')
      .setScale(1.18);
    if (!selSeen) {
      detSprite.setTint(0x090e1a);
      detSprite.setAlpha(0.72);
    } else {
      let f = 0;
      this.dexAnimTimer = this.time.addEvent({
        delay: 440,
        loop: true,
        callback: () => {
          if (!detSprite.active) return;
          f = f === 0 ? 1 : 0;
          const k = f === 0 ? selTex0 : selTex1;
          if (this.textures.exists(k)) detSprite.setTexture(k);
        },
      });
    }
    this.dexModalContainer.add([spriteFrame, detSprite]);

    const infoX = detX + 90;
    const statusLabel = selCaught ? 'CAUGHT ★' : selSeen ? 'SEEN' : 'UNSEEN';
    const statusColor = selCaught ? '#34d399' : selSeen ? '#7dd3fc' : '#64748b';

    const nameTxt = this.add.text(infoX, detY + 12, selSeen ? sel.name : '???', {
      fontFamily: FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f8fafc',
    });
    const titleTxt = this.add.text(infoX, detY + 29, selSeen ? (sel.title ?? '') : 'Belum Ditemukan', {
      fontFamily: FONT,
      fontSize: '9px',
      color: '#94a3b8',
    });

    const elPill = this.add.rectangle(infoX + 26, detY + 51, 52, 15, selSeen ? meta.bg : 0x1e293b);
    const elTxt = this.add
      .text(infoX + 26, detY + 51, selSeen ? meta.label : '???', {
        fontFamily: FONT,
        fontSize: '8px',
        fontStyle: 'bold',
        color: selSeen ? meta.hex : '#64748b',
      })
      .setOrigin(0.5);

    const stTxt = this.add.text(infoX + 60, detY + 46, statusLabel, {
      fontFamily: FONT,
      fontSize: '9px',
      fontStyle: 'bold',
      color: statusColor,
    });

    const evoStr = !selSeen
      ? 'Stage ? • ???'
      : sel.evolvesTo && MONSTERS[sel.evolvesTo]
        ? `Stage ${sel.stage ?? 1} → ${MONSTERS[sel.evolvesTo].name} (Lv.${sel.evolvesAt})`
        : `Stage ${sel.stage ?? 1} • Final Form`;
    const evoTxt = this.add.text(infoX, detY + 67, evoStr, {
      fontFamily: FONT,
      fontSize: '8px',
      color: '#fde047',
      wordWrap: { width: 156 },
    });

    const statsBar = this.add.rectangle(detX + detW / 2, detY + 104, detW - 20, 22, 0x16223a).setStrokeStyle(1, 0x263554);
    const statsText = selSeen
      ? `HP ${sel.baseHp}  ATK ${sel.baseAttack}  DEF ${sel.baseDefense}  SPD ${sel.baseSpeed}`
      : 'HP ??   ATK ??   DEF ??   SPD ??';
    const statsLbl = this.add
      .text(detX + detW / 2, detY + 104, statsText, {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: selSeen ? '#e2e8f0' : '#64748b',
      })
      .setOrigin(0.5);

    const bioHeading = this.add.text(detX + 12, detY + 124, 'LORE / CATATAN RISET:', {
      fontFamily: FONT,
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#c084fc',
    });
    const bioTxt = this.add.text(
      detX + 12,
      detY + 138,
      selSeen
        ? (sel.bio ?? 'Data ekosistem belum lengkap.')
        : 'Temui Monsver ini di pertarungan Campaign untuk membuka data & catatan risetnya.',
      {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#cbd5e1',
        lineSpacing: 3,
        wordWrap: { width: detW - 24 },
      }
    );

    this.dexModalContainer.add([nameTxt, titleTxt, elPill, elTxt, stTxt, evoTxt, statsBar, statsLbl, bioHeading, bioTxt]);
  }

  _hideDexModal() {
    if (this.dexAnimTimer) {
      this.dexAnimTimer.remove(false);
      this.dexAnimTimer = null;
    }
    if (this.dexModalContainer) {
      this.dexModalContainer.destroy(true);
      this.dexModalContainer = null;
    }
  }

  _showPartyModal() {
    this._hideAllModals();

    this.partyModalContainer = this.add.container(0, 0).setDepth(70);

    const dim = this.add.rectangle(320, 180, 640, 360, 0x04070f, 0.8).setInteractive();
    dim.on('pointerdown', () => this._hidePartyModal());

    const panelW = 568;
    const panelH = 284;
    const cx = 320;
    const cy = 180;
    const left = cx - panelW / 2;
    const top = cy - panelH / 2;

    const storageList = gameState.storage ?? [];
    const isPartyTab = this.partyModalTab !== 'storage';

    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x111a2e).setStrokeStyle(2, 0x38bdf8).setInteractive();

    // Toggle tabs: ACTIVE PARTY (x/3) | RIFT STORAGE (n)
    const tab1Bg = this.add
      .rectangle(left + 112, top + 24, 192, 26, isPartyTab ? 0x1d4ed8 : 0x0f172a)
      .setStrokeStyle(2, isPartyTab ? 0x60a5fa : 0x334155)
      .setInteractive({ useHandCursor: true });
    const tab1Txt = this.add
      .text(left + 112, top + 24, `ACTIVE PARTY (${gameState.party.length}/3)`, {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: isPartyTab ? '#ffffff' : '#94a3b8',
      })
      .setOrigin(0.5);
    tab1Bg.on('pointerdown', () => {
      if (this.partyModalTab === 'party') return;
      audioManager.playSfx('click');
      this.partyModalTab = 'party';
      this._showPartyModal();
    });

    const tab2Bg = this.add
      .rectangle(left + 314, top + 24, 192, 26, !isPartyTab ? 0x6d28d9 : 0x0f172a)
      .setStrokeStyle(2, !isPartyTab ? 0xc084fc : 0x334155)
      .setInteractive({ useHandCursor: true });
    const tab2Txt = this.add
      .text(left + 314, top + 24, `RIFT STORAGE (${storageList.length})`, {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: !isPartyTab ? '#ffffff' : '#94a3b8',
      })
      .setOrigin(0.5);
    tab2Bg.on('pointerdown', () => {
      if (this.partyModalTab === 'storage') return;
      audioManager.playSfx('click');
      this.partyModalTab = 'storage';
      this.storagePage = 0;
      this._showPartyModal();
    });

    const closeBtn = this.add
      .rectangle(left + panelW - 24, top + 24, 28, 24, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });
    const closeTxt = this.add
      .text(left + panelW - 24, top + 24, 'X', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      audioManager.playSfx('click');
      this._hidePartyModal();
    });

    this.partyModalContainer.add([dim, panel, tab1Bg, tab1Txt, tab2Bg, tab2Txt, closeBtn, closeTxt]);

    if (isPartyTab) {
      this._renderPartyModalActiveTab(left, top);
    } else {
      this._renderPartyModalStorageTab(left, top, panelW, panelH);
    }
  }

  _renderPartyModalActiveTab(left, top) {
    // 3 horizontal Monsver cards side-by-side inside modal
    const cardW = 172;
    const cardH = 212;
    const gapX = 10;
    const startX = left + 16;
    const cardY = top + 52;
    const canSendToStorage = gameState.party.length > 1;

    gameState.party.slice(0, 3).forEach((mon, idx) => {
      const cardX = startX + idx * (cardW + gapX);
      const cardCx = cardX + cardW / 2;
      const cardCy = cardY + cardH / 2;
      const meta = ELEMENT_META[mon.element] ?? ELEMENT_META[0];
      const isLead = idx === 0;
      const ratio = mon.currentHp / Math.max(1, mon.maxHp);

      const cardBg = this.add
        .rectangle(cardCx, cardCy, cardW, cardH, isLead ? 0x182744 : 0x0f172a)
        .setStrokeStyle(2, isLead ? meta.color : 0x263554);

      const texKey = getMonsterTextureKey(mon.id, 0);
      const img = this.add
        .image(cardCx, cardY + 38, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(0.95);

      const nameTxt = this.add
        .text(cardCx, cardY + 74, `${mon.name}  Lv.${mon.level}`, {
          fontFamily: FONT,
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setOrigin(0.5, 0);

      const elTxt = this.add
        .text(cardCx, cardY + 90, `${meta.label} • SP ${mon.currentSp}/${mon.maxSp}`, {
          fontFamily: FONT,
          fontSize: '9px',
          color: meta.hex,
        })
        .setOrigin(0.5, 0);

      const barW = 144;
      const track = this.add.rectangle(cardCx - barW / 2, cardY + 110, barW, 7, 0x090e1a).setOrigin(0, 0.5);
      const fill = this.add
        .rectangle(cardCx - barW / 2 + 1, cardY + 110, Math.round((barW - 2) * Math.max(0, Math.min(1, ratio))), 5, hpBarColor(ratio))
        .setOrigin(0, 0.5);

      const hpTxt = this.add
        .text(cardCx, cardY + 122, `HP ${mon.currentHp}/${mon.maxHp}`, {
          fontFamily: FONT,
          fontSize: '9px',
          color: '#cbd5e1',
        })
        .setOrigin(0.5, 0);

      const statsTxt = this.add
        .text(cardCx, cardY + 137, `ATK ${mon.attack}  DEF ${mon.defense}  SPD ${mon.speed}`, {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#94a3b8',
        })
        .setOrigin(0.5, 0);

      const xpTxt = this.add
        .text(cardCx, cardY + 150, `XP ${mon.xp ?? 0}/${mon.xpToNext ?? mon.level * 50}`, {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#a855f7',
        })
        .setOrigin(0.5, 0);

      this.partyModalContainer.add([cardBg, img, nameTxt, elTxt, track, fill, hpTxt, statsTxt, xpTxt]);

      const btnY = cardY + 186;
      if (isLead) {
        const w = canSendToStorage ? 76 : 128;
        const bx = canSendToStorage ? cardCx - 38 : cardCx;
        const leadBg = this.add.rectangle(bx, btnY, w, 24, 0x065f46).setStrokeStyle(1, 0x34d399);
        const leadTxt = this.add
          .text(bx, btnY, 'LEAD ★', {
            fontFamily: FONT,
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#6ee7b7',
          })
          .setOrigin(0.5);
        this.partyModalContainer.add([leadBg, leadTxt]);
      } else {
        const w = canSendToStorage ? 76 : 128;
        const bx = canSendToStorage ? cardCx - 38 : cardCx;
        const swapBtn = this.add
          .rectangle(bx, btnY, w, 24, 0x1d4ed8)
          .setStrokeStyle(1, 0x60a5fa)
          .setInteractive({ useHandCursor: true });
        const swapTxt = this.add
          .text(bx, btnY, 'SET LEAD', {
            fontFamily: FONT,
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#ffffff',
          })
          .setOrigin(0.5);

        swapBtn.on('pointerdown', () => {
          audioManager.playSfx('click');
          gameState.swapPartyOrder(0, idx);
          this._renderPartyStrip();
          this._showPartyModal();
          this._showToast(`${gameState.party[0].name} sekarang menjadi Lead!`, '#38bdf8');
        });
        this.partyModalContainer.add([swapBtn, swapTxt]);
      }

      if (canSendToStorage) {
        const storeBtn = this.add
          .rectangle(cardCx + 42, btnY, 68, 24, 0x4c1d95)
          .setStrokeStyle(1, 0xc084fc)
          .setInteractive({ useHandCursor: true });
        const storeTxt = this.add
          .text(cardCx + 42, btnY, 'SIMPAN', {
            fontFamily: FONT,
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#f3e8ff',
          })
          .setOrigin(0.5);

        storeBtn.on('pointerdown', () => {
          let ok = false;
          if (typeof gameState.movePartyToStorage === 'function') {
            ok = Boolean(gameState.movePartyToStorage(idx));
          } else if (gameState.party.length > 1 && gameState.party[idx]) {
            const [moved] = gameState.party.splice(idx, 1);
            if (!Array.isArray(gameState.storage)) gameState.storage = [];
            gameState.storage.push(moved);
            gameState.save?.();
            ok = true;
          }
          if (ok) {
            audioManager.playSfx('click');
            this._renderPartyStrip();
            this._showPartyModal();
            this._showToast(`${mon.name} dipindahkan ke Rift Storage!`, '#c084fc');
          }
        });
        this.partyModalContainer.add([storeBtn, storeTxt]);
      }
    });
  }

  _renderPartyModalStorageTab(left, top, panelW, panelH) {
    const storageList = gameState.storage ?? [];
    if (storageList.length === 0) {
      const emptyTxt = this.add
        .text(
          left + panelW / 2,
          top + panelH / 2 + 10,
          'Rift Storage masih kosong.\nTangkap Monsver liar dengan Rift Orb atau Hyper Orb!',
          {
            fontFamily: FONT,
            fontSize: '11px',
            color: '#94a3b8',
            align: 'center',
            lineSpacing: 5,
          }
        )
        .setOrigin(0.5);
      this.partyModalContainer.add(emptyTxt);
      return;
    }

    const partyFull = gameState.party.length >= 3;
    if (this.selectedPartySwapIdx >= gameState.party.length) {
      this.selectedPartySwapIdx = 0;
    }

    let gridStartY = top + 52;

    if (partyFull) {
      // Party swap target selector bar
      const barY = top + 58;
      const lbl = this.add.text(left + 16, barY - 6, 'TUKAR DGN:', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#fde047',
      });
      this.partyModalContainer.add(lbl);

      gameState.party.slice(0, 3).forEach((pm, pIdx) => {
        const px = left + 150 + pIdx * 138;
        const selected = this.selectedPartySwapIdx === pIdx;
        const pill = this.add
          .rectangle(px, barY, 130, 22, selected ? 0x1e3a5f : 0x0f172a)
          .setStrokeStyle(selected ? 2 : 1, selected ? 0xfde047 : 0x334155)
          .setInteractive({ useHandCursor: true });
        const pTxt = this.add
          .text(px, barY, `${pIdx + 1}. ${pm.name.slice(0, 9)} Lv.${pm.level}`, {
            fontFamily: FONT,
            fontSize: '8px',
            fontStyle: 'bold',
            color: selected ? '#fde047' : '#cbd5e1',
          })
          .setOrigin(0.5);
        pill.on('pointerdown', () => {
          audioManager.playSfx('click');
          this.selectedPartySwapIdx = pIdx;
          this._showPartyModal();
        });
        this.partyModalContainer.add([pill, pTxt]);
      });

      gridStartY = top + 78;
    }

    const perPage = 6;
    const totalPages = Math.max(1, Math.ceil(storageList.length / perPage));
    this.storagePage = Math.max(0, Math.min(this.storagePage, totalPages - 1));
    const pageStart = this.storagePage * perPage;
    const pageItems = storageList.slice(pageStart, pageStart + perPage);

    const cardW = 172;
    const cardH = partyFull ? 86 : 96;
    const gapX = 10;
    const gapY = 8;
    const startX = left + 16;

    pageItems.forEach((mon, localIdx) => {
      const sIdx = pageStart + localIdx;
      const col = localIdx % 3;
      const row = Math.floor(localIdx / 3);
      const x = startX + col * (cardW + gapX);
      const y = gridStartY + row * (cardH + gapY);
      const meta = ELEMENT_META[mon.element] ?? ELEMENT_META[0];

      const bg = this.add
        .rectangle(x + cardW / 2, y + cardH / 2, cardW, cardH, 0x0f172a)
        .setStrokeStyle(1, meta.color);

      const texKey = getMonsterTextureKey(mon.id, 0);
      const sp = this.add
        .image(x + 28, y + 32, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(0.72);

      const nameTxt = this.add.text(x + 54, y + 10, `${mon.name.slice(0, 10)}`, {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#f8fafc',
      });
      const subTxt = this.add.text(x + 54, y + 24, `Lv.${mon.level} • ${meta.label}`, {
        fontFamily: FONT,
        fontSize: '8px',
        color: meta.hex,
      });
      const statTxt = this.add.text(x + 54, y + 37, `HP ${mon.maxHp}  ATK ${mon.attack}`, {
        fontFamily: FONT,
        fontSize: '8px',
        color: '#94a3b8',
      });

      const actBtn = this.add
        .rectangle(x + cardW / 2, y + cardH - 16, cardW - 18, 22, partyFull ? 0xb45309 : 0x059669)
        .setStrokeStyle(1, partyFull ? 0xfbbf24 : 0x34d399)
        .setInteractive({ useHandCursor: true });
      const actTxt = this.add
        .text(x + cardW / 2, y + cardH - 16, partyFull ? 'TUKAR' : 'MASUK PARTY', {
          fontFamily: FONT,
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0.5);

      actBtn.on('pointerdown', () => {
        if (!partyFull) {
          let ok = false;
          if (typeof gameState.moveStorageToParty === 'function') {
            ok = Boolean(gameState.moveStorageToParty(sIdx));
          } else if (gameState.party.length < 3 && gameState.storage?.[sIdx]) {
            const [moved] = gameState.storage.splice(sIdx, 1);
            gameState.party.push(moved);
            gameState.save?.();
            ok = true;
          }
          if (ok) {
            audioManager.playSfx('heal');
            this._renderPartyStrip();
            this._showPartyModal();
            this._showToast(`${mon.name} bergabung ke Active Party!`, '#4ade80');
          }
        } else {
          const prevName = gameState.party[this.selectedPartySwapIdx]?.name ?? 'Monsver';
          const ok = gameState.swapWithStorage?.(this.selectedPartySwapIdx, sIdx);
          if (ok) {
            audioManager.playSfx('click');
            this._renderPartyStrip();
            this._showPartyModal();
            this._showToast(`${mon.name} ditukar dengan ${prevName}!`, '#fde047');
          }
        }
      });

      this.partyModalContainer.add([bg, sp, nameTxt, subTxt, statTxt, actBtn, actTxt]);
    });

    if (totalPages > 1) {
      const py = top + panelH - 14;
      const prevBtn = this.add
        .text(left + panelW / 2 - 54, py, '< PREV', {
          fontFamily: FONT,
          fontSize: '9px',
          fontStyle: 'bold',
          color: this.storagePage > 0 ? '#7dd3fc' : '#475569',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      const pageTxt = this.add
        .text(left + panelW / 2, py, `${this.storagePage + 1}/${totalPages}`, {
          fontFamily: FONT,
          fontSize: '9px',
          color: '#cbd5e1',
        })
        .setOrigin(0.5);
      const nextBtn = this.add
        .text(left + panelW / 2 + 54, py, 'NEXT >', {
          fontFamily: FONT,
          fontSize: '9px',
          fontStyle: 'bold',
          color: this.storagePage < totalPages - 1 ? '#7dd3fc' : '#475569',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      prevBtn.on('pointerdown', () => {
        if (this.storagePage > 0) {
          audioManager.playSfx('click');
          this.storagePage -= 1;
          this._showPartyModal();
        }
      });
      nextBtn.on('pointerdown', () => {
        if (this.storagePage < totalPages - 1) {
          audioManager.playSfx('click');
          this.storagePage += 1;
          this._showPartyModal();
        }
      });

      this.partyModalContainer.add([prevBtn, pageTxt, nextBtn]);
    }
  }

  _hidePartyModal() {
    if (this.partyModalContainer) {
      this.partyModalContainer.destroy(true);
      this.partyModalContainer = null;
    }
  }

  _showToast(message, color = '#4ade80') {
    const toastBg = this.add
      .rectangle(320, 260, 360, 26, 0x090e1a, 0.95)
      .setStrokeStyle(1, hexToInt(color, 0x4ade80))
      .setDepth(85);
    const toastTxt = this.add
      .text(320, 260, message, {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color,
      })
      .setOrigin(0.5)
      .setDepth(86);

    this.tweens.add({
      targets: [toastBg, toastTxt],
      y: 246,
      alpha: 0,
      delay: 1100,
      duration: 450,
      onComplete: () => {
        toastBg.destroy();
        toastTxt.destroy();
      },
    });
  }
}
