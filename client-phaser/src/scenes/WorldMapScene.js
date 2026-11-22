import Phaser from 'phaser';
import { CHAPTERS, CAMPAIGN_NODES, getNodesByChapter } from '../data/campaign.js';
import { MONSTERS } from '../data/monsters.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { battleBridge } from '../bridge/battleBridge.js';
import { ELEMENT_META } from '../ui/BattleHud.js';
import { gameState } from '../state/gameState.js';

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
      // Auto-focus chapter containing the next uncompleted unlocked node
      const nextOpen = CAMPAIGN_NODES.find(
        (n) => gameState.isNodeUnlocked(n.id) && !gameState.completedNodeIds.includes(n.id)
      );
      this.activeChapter = nextOpen?.chapter ?? CHAPTERS[CHAPTERS.length - 1]?.id ?? 1;
    }

    this.mapContainer = null;
    this.partyStripContainer = null;
    this.previewContainer = null;
    this.partyModalContainer = null;
    this.tabRefs = [];
  }

  create() {
    this.add.rectangle(180, 320, 360, 640, 0x090e1a).setDepth(0);

    this._buildTopBar();
    this._buildChapterTabs();
    this._buildBottomActionBar();

    this._renderChapterMap();
    this._renderPartyStrip();
  }

  _buildTopBar() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x0b1222, 0.98);
    g.fillRect(0, 0, 360, 44);
    g.fillStyle(0x263554, 1);
    g.fillRect(0, 42, 360, 2);

    this.add
      .text(10, 14, 'CAMPAIGN MAP', {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setDepth(21);

    const totalNodes = Math.max(1, CAMPAIGN_NODES.length);
    const pct = Math.min(100, Math.round((gameState.completedNodeIds.length / totalNodes) * 100));

    this.goldText = this.add
      .text(186, 22, `${gameState.gold}G`, {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#fbbf24',
      })
      .setOrigin(1, 0.5)
      .setDepth(21);

    this.progressText = this.add
      .text(244, 22, `${pct}%`, {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#34d399',
      })
      .setOrigin(1, 0.5)
      .setDepth(21);

    const titleBtn = this.add
      .rectangle(316, 22, 68, 26, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    this.add
      .text(316, 22, 'TITLE', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#e2e8f0',
      })
      .setOrigin(0.5)
      .setDepth(22);

    titleBtn.on('pointerover', () => titleBtn.setFillStyle(0x334155));
    titleBtn.on('pointerout', () => titleBtn.setFillStyle(0x1e293b));
    titleBtn.on('pointerdown', () => this.scene.start('TitleScene'));
  }

  _buildChapterTabs() {
    const tabW = 82;
    const tabH = 38;
    const gap = 4;
    const startX = 10;
    const y = 48;

    this.tabRefs = CHAPTERS.slice(0, 4).map((ch, idx) => {
      const x = startX + idx * (tabW + gap);
      const accentInt = hexToInt(ch.accent, 0x38bdf8);

      const bg = this.add
        .rectangle(x + tabW / 2, y + tabH / 2, tabW, tabH, 0x131c31)
        .setStrokeStyle(2, 0x263554)
        .setInteractive({ useHandCursor: true })
        .setDepth(20);

      const bar = this.add.rectangle(x + tabW / 2, y + 3, tabW - 4, 4, accentInt).setDepth(21);

      const label = this.add
        .text(x + tabW / 2, y + tabH / 2 + 2, `CH.${ch.id}`, {
          fontFamily: FONT,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#94a3b8',
        })
        .setOrigin(0.5)
        .setDepth(21);

      bg.on('pointerdown', () => {
        if (this.activeChapter === ch.id) return;
        this.activeChapter = ch.id;
        this._hidePreviewCard();
        this._renderChapterMap();
      });

      return { ch, accentInt, bg, bar, label };
    });

    this._refreshTabs();
  }

  _refreshTabs() {
    this.tabRefs.forEach((tab) => {
      const active = tab.ch.id === this.activeChapter;
      tab.bg.setFillStyle(active ? 0x1e2d4a : 0x111829);
      tab.bg.setStrokeStyle(2, active ? tab.accentInt : 0x24314a);
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

    // Map canvas bounds: y: 92..500 (height 408)
    const mapCenterY = 296;
    const mapH = 408;

    const bgKey = chapter?.theme && this.textures.exists(chapter.theme) ? chapter.theme : 'bg_arena_solara';
    if (this.textures.exists(bgKey)) {
      const bgImg = this.add.image(180, mapCenterY, bgKey);
      bgImg.setDisplaySize(360, mapH);
      bgImg.setTint(0x64748b);
      this.mapContainer.add(bgImg);
    } else {
      this.mapContainer.add(this.add.rectangle(180, mapCenterY, 360, mapH, 0x0f172a));
    }

    // Tasteful dark scrim + frame
    const scrim = this.add.rectangle(180, mapCenterY, 360, mapH, 0x060b16, 0.62);
    this.mapContainer.add(scrim);

    // Chapter banner at top of map (y: 96..134)
    const bannerBg = this.add.rectangle(180, 114, 340, 36, 0x0b1222, 0.92).setStrokeStyle(1, accentInt);
    const bannerStripe = this.add.rectangle(13, 114, 4, 32, accentInt);
    const bannerTitle = this.add.text(24, 102, `CH.${chapter.id} — ${chapter.name}`, {
      fontFamily: FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f8fafc',
    });
    const bannerSub = this.add.text(24, 118, chapter.subtitle ?? '', {
      fontFamily: FONT,
      fontSize: '10px',
      color: chapter.accent ?? '#38bdf8',
    });
    this.mapContainer.add([bannerBg, bannerStripe, bannerTitle, bannerSub]);

    const nodes = [...getNodesByChapter(this.activeChapter)].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    if (nodes.length === 0) {
      const emptyTxt = this.add
        .text(180, 296, 'Chapter ini belum memiliki stage.\nSelesaikan chapter sebelumnya!', {
          fontFamily: FONT,
          fontSize: '11px',
          color: '#94a3b8',
          align: 'center',
        })
        .setOrigin(0.5);
      this.mapContainer.add(emptyTxt);
      return;
    }

    // Compute clamped pin positions inside map canvas (y: 168..456, x: 48..312)
    const positioned = nodes.map((node) => ({
      node,
      x: Math.max(48, Math.min(312, node.mapPos?.x ?? 180)),
      y: Math.max(168, Math.min(456, node.mapPos?.y ?? 300)),
    }));

    // Draw glowing dotted pixel trails between consecutive nodes
    const trailG = this.add.graphics();
    for (let i = 0; i < positioned.length - 1; i++) {
      const a = positioned[i];
      const b = positioned[i + 1];
      const nextUnlocked = gameState.isNodeUnlocked(b.node.id);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(4, Math.floor(dist / 12));

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
      const radius = isBoss ? 24 : 19;

      // Pulsing glowing ring for OPEN / CURRENT node
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

      // Pin base circle
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
            fontSize: isBoss ? '18px' : '15px',
            fontStyle: 'bold',
            color: '#6ee7b7',
          })
          .setOrigin(0.5);
        this.mapContainer.add(checkTxt);
      } else {
        const numTxt = this.add
          .text(x, y, `${node.index ?? 1}`, {
            fontFamily: FONT,
            fontSize: isBoss ? '16px' : '14px',
            fontStyle: 'bold',
            color: '#ffffff',
          })
          .setOrigin(0.5);
        this.mapContainer.add(numTxt);
      }

      // PLAY / BOSS status tag above/below pin
      if (isCurrent) {
        const tagBg = this.add.rectangle(x, y - radius - (isBoss ? 18 : 11), 42, 14, isBoss ? 0xef4444 : accentInt);
        const tagTxt = this.add
          .text(x, y - radius - (isBoss ? 18 : 11), isBoss ? 'BOSS' : 'PLAY', {
            fontFamily: FONT,
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#070b14',
          })
          .setOrigin(0.5);
        this.mapContainer.add([tagBg, tagTxt]);
      }

      // Node title pill below pin
      const labelY = y + radius + 14;
      const labelBg = this.add.rectangle(x, labelY, Math.min(116, node.title.length * 7 + 16), 16, 0x090e1a, 0.88);
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
        pin.on('pointerdown', () => this._showPreviewCard(node));
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

    // Transparent dismiss backdrop over map
    const dim = this.add
      .rectangle(180, 320, 360, 640, 0x04070f, 0.6)
      .setInteractive();
    dim.on('pointerdown', () => this._hidePreviewCard());

    const cardW = 332;
    const cardH = 198;
    const cx = 180;
    const cy = 382;
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
    closeBtn.on('pointerdown', () => this._hidePreviewCard());

    // Enemy sprite preview
    const spriteBg = this.add.rectangle(left + 50, top + 74, 72, 72, 0x090e1a).setStrokeStyle(2, enemyMeta.color);
    const texKey = getMonsterTextureKey(node.enemyId, 0);
    const enemyImg = this.add
      .image(left + 50, top + 74, this.textures.exists(texKey) ? texKey : 'particle_pixel')
      .setScale(1.1);

    // Stage & Enemy Info
    const infoX = left + 98;
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
    const itemStr = itemEntries.length > 0
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
        wordWrap: { width: 220 },
      }
    );

    // Start Battle button
    const startBtn = this.add
      .rectangle(cx, top + cardH - 34, 286, 46, 0x10b981)
      .setStrokeStyle(2, 0xa7f3d0)
      .setInteractive({ useHandCursor: true });

    const startTxt = this.add
      .text(cx, top + cardH - 34, 'MULAI PERTARUNGAN', {
        fontFamily: FONT,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#052e16',
      })
      .setOrigin(0.5);

    startBtn.on('pointerover', () => startBtn.setFillStyle(0x34d399));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0x10b981));
    startBtn.on('pointerdown', () => {
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

  _buildBottomActionBar() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x0a101f, 1);
    g.fillRect(0, 500, 360, 140);
    g.fillStyle(0x263554, 1);
    g.fillRect(0, 500, 360, 2);

    // HEAL CAMP button (left)
    const healBtn = this.add
      .rectangle(94, 608, 166, 46, 0x065f46)
      .setStrokeStyle(2, 0x34d399)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    this.add
      .text(94, 608, 'HEAL CAMP', {
        fontFamily: FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ecfdf5',
      })
      .setOrigin(0.5)
      .setDepth(23);

    healBtn.on('pointerover', () => healBtn.setFillStyle(0x047857));
    healBtn.on('pointerout', () => healBtn.setFillStyle(0x065f46));
    healBtn.on('pointerdown', () => {
      gameState.healAllParty();
      this._renderPartyStrip();
      this._showToast('HEAL CAMP: Tim pulih 100% HP & SP!', '#4ade80');
    });

    // PARTY modal button (right)
    const partyBtn = this.add
      .rectangle(266, 608, 166, 46, 0x1e293b)
      .setStrokeStyle(2, 0x38bdf8)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    this.add
      .text(266, 608, 'PARTY', {
        fontFamily: FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#e0f2fe',
      })
      .setOrigin(0.5)
      .setDepth(23);

    partyBtn.on('pointerover', () => partyBtn.setFillStyle(0x334155));
    partyBtn.on('pointerout', () => partyBtn.setFillStyle(0x1e293b));
    partyBtn.on('pointerdown', () => this._showPartyModal());
  }

  _renderPartyStrip() {
    if (this.partyStripContainer) {
      this.partyStripContainer.destroy(true);
      this.partyStripContainer = null;
    }

    this.partyStripContainer = this.add.container(0, 0).setDepth(22);

    const slotW = 110;
    const slotH = 66;
    const gap = 6;
    const startX = 9;
    const y = 510;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (slotW + gap);
      const mon = gameState.party[i];

      if (!mon) {
        const emptyBg = this.add
          .rectangle(x + slotW / 2, y + slotH / 2, slotW, slotH, 0x0f172a)
          .setStrokeStyle(1, 0x1e293b);
        const emptyTxt = this.add
          .text(x + slotW / 2, y + slotH / 2, 'EMPTY', {
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
      bg.on('pointerdown', () => this._showPartyModal());

      const texKey = getMonsterTextureKey(mon.id, 0);
      const sprite = this.add
        .image(x + 22, y + 26, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(0.62);

      const nameTxt = this.add.text(x + 42, y + 8, mon.name.slice(0, 8), {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#f8fafc',
      });

      const lvTxt = this.add.text(x + 42, y + 22, `Lv.${mon.level}${isLead ? ' ★' : ''}`, {
        fontFamily: FONT,
        fontSize: '9px',
        color: isLead ? '#fde047' : '#94a3b8',
      });

      const barW = 94;
      const track = this.add.rectangle(x + 8, y + 48, barW, 7, 0x090e1a).setOrigin(0, 0.5);
      const fill = this.add
        .rectangle(x + 9, y + 48, Math.round((barW - 2) * Math.max(0, Math.min(1, ratio))), 5, hpBarColor(ratio))
        .setOrigin(0, 0.5);

      const hpTxt = this.add
        .text(x + slotW - 8, y + 58, `${mon.currentHp}/${mon.maxHp}`, {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#cbd5e1',
        })
        .setOrigin(1, 0.5);

      this.partyStripContainer.add([bg, sprite, nameTxt, lvTxt, track, fill, hpTxt]);
    }
  }

  _showPartyModal() {
    this._hidePartyModal();
    this._hidePreviewCard();

    this.partyModalContainer = this.add.container(0, 0).setDepth(70);

    const dim = this.add.rectangle(180, 320, 360, 640, 0x04070f, 0.8).setInteractive();
    dim.on('pointerdown', () => this._hidePartyModal());

    const panelW = 332;
    const panelH = 420;
    const cx = 180;
    const cy = 310;
    const left = cx - panelW / 2;
    const top = cy - panelH / 2;

    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x111a2e).setStrokeStyle(2, 0x38bdf8).setInteractive();
    const title = this.add.text(left + 16, top + 16, 'PARTY & LEAD ORDER', {
      fontFamily: FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f8fafc',
    });

    const storageCount = gameState.storage?.length ?? 0;
    const sub = this.add.text(left + 16, top + 34, `Active: ${gameState.party.length}/3   Storage: ${storageCount}`, {
      fontFamily: FONT,
      fontSize: '10px',
      color: '#94a3b8',
    });

    const closeBtn = this.add
      .rectangle(left + panelW - 26, top + 24, 30, 26, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });
    const closeTxt = this.add
      .text(left + panelW - 26, top + 24, 'X', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5);
    closeBtn.on('pointerdown', () => this._hidePartyModal());

    this.partyModalContainer.add([dim, panel, title, sub, closeBtn, closeTxt]);

    const cardH = 98;
    const startY = top + 106;
    const gapY = 106;

    gameState.party.forEach((mon, idx) => {
      const y = startY + idx * gapY;
      const meta = ELEMENT_META[mon.element] ?? ELEMENT_META[0];
      const isLead = idx === 0;
      const ratio = mon.currentHp / Math.max(1, mon.maxHp);

      const cardBg = this.add
        .rectangle(cx, y, panelW - 24, cardH, isLead ? 0x182744 : 0x0f172a)
        .setStrokeStyle(2, isLead ? meta.color : 0x263554);

      const texKey = getMonsterTextureKey(mon.id, 0);
      const img = this.add
        .image(left + 44, y - 4, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(0.95);

      const nameTxt = this.add.text(left + 84, y - 38, `${mon.name}  Lv.${mon.level}`, {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f8fafc',
      });

      const elTxt = this.add.text(left + 84, y - 20, `${meta.label} • HP ${mon.currentHp}/${mon.maxHp} • SP ${mon.currentSp}/${mon.maxSp}`, {
        fontFamily: FONT,
        fontSize: '9px',
        color: meta.hex,
      });

      const track = this.add.rectangle(left + 84, y - 2, 140, 7, 0x090e1a).setOrigin(0, 0.5);
      const fill = this.add
        .rectangle(left + 85, y - 2, Math.round(138 * Math.max(0, Math.min(1, ratio))), 5, hpBarColor(ratio))
        .setOrigin(0, 0.5);

      const statsTxt = this.add.text(left + 84, y + 12, `ATK ${mon.attack}  DEF ${mon.defense}  SPD ${mon.speed}`, {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#cbd5e1',
      });

      const xpTxt = this.add.text(left + 84, y + 28, `XP ${mon.xp ?? 0}/${mon.xpToNext ?? mon.level * 50}`, {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#a855f7',
      });

      this.partyModalContainer.add([cardBg, img, nameTxt, elTxt, track, fill, statsTxt, xpTxt]);

      if (isLead) {
        const leadBg = this.add.rectangle(left + panelW - 52, y + 24, 62, 24, 0x065f46).setStrokeStyle(1, 0x34d399);
        const leadTxt = this.add
          .text(left + panelW - 52, y + 24, 'LEAD ★', {
            fontFamily: FONT,
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#6ee7b7',
          })
          .setOrigin(0.5);
        this.partyModalContainer.add([leadBg, leadTxt]);
      } else {
        const swapBtn = this.add
          .rectangle(left + panelW - 56, y + 24, 72, 28, 0x1d4ed8)
          .setStrokeStyle(1, 0x60a5fa)
          .setInteractive({ useHandCursor: true });
        const swapTxt = this.add
          .text(left + panelW - 56, y + 24, 'SET LEAD', {
            fontFamily: FONT,
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#ffffff',
          })
          .setOrigin(0.5);

        swapBtn.on('pointerdown', () => {
          gameState.swapPartyOrder(0, idx);
          this._renderPartyStrip();
          this._showPartyModal();
          this._showToast(`${gameState.party[0].name} sekarang menjadi Lead!`, '#38bdf8');
        });
        this.partyModalContainer.add([swapBtn, swapTxt]);
      }
    });
  }

  _hidePartyModal() {
    if (this.partyModalContainer) {
      this.partyModalContainer.destroy(true);
      this.partyModalContainer = null;
    }
  }

  _showToast(message, color = '#4ade80') {
    const toastBg = this.add
      .rectangle(180, 486, 320, 28, 0x090e1a, 0.94)
      .setStrokeStyle(1, hexToInt(color, 0x4ade80))
      .setDepth(85);
    const toastTxt = this.add
      .text(180, 486, message, {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color,
      })
      .setOrigin(0.5)
      .setDepth(86);

    this.tweens.add({
      targets: [toastBg, toastTxt],
      y: 472,
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
