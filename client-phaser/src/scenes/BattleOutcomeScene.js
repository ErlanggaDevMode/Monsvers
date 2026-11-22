import Phaser from 'phaser';
import { ENDING_DIALOGUE, getDefeatDialogue, getNextNodeId } from '../data/campaign.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { gameState } from '../state/gameState.js';
import { audioManager } from '../audio/audioManager.js';
import { FONTS, drawRpgPanel, createRpgButton } from '../ui/UiTheme.js';

/**
 * Full-screen cinematic outcome scene (640x360 Landscape) for:
 * - 'victory'        : Stage Win / Wild Capture celebration
 * - 'campaign_clear' : Grand Ending + Hall of Fame after defeating Final Boss Umbravex
 * - 'defeat'         : Somber Defeat screen at Camp Solara with instant rematch / map return
 */
export class BattleOutcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleOutcomeScene' });
  }

  init(data) {
    this.outcome = data?.outcome ?? 'victory'; // 'victory' | 'campaign_clear' | 'defeat'
    this.mode = data?.mode ?? 'campaign'; // 'campaign' | 'quick'
    this.runtime = data?.runtime;
    this.node = data?.node ?? null;
    this.title = data?.title ?? (this.outcome === 'defeat' ? 'DEFEATED' : 'VICTORY!');
    this.subtitle = data?.subtitle ?? '';
    this.xpGained = data?.xpGained ?? 0;
    this.leveledUp = Boolean(data?.leveledUp);
    this.newLevel = data?.newLevel ?? 5;
    this.evoInfo = data?.evoInfo ?? null;
    this.goldReward = data?.goldReward ?? 0;
    this.itemRewards = data?.itemRewards ?? {};
    this.capturedNote = data?.capturedNote ?? '';
    this.playerSnapshot = data?.playerSnapshot ?? gameState.party[0] ?? null;
    this.enemyName = data?.enemyName ?? 'Monsver';
    this.battleNumber = data?.battleNumber ?? 1;
    this.quickParty = data?.quickParty ?? null;
    this.quickActiveIndex = data?.quickActiveIndex ?? 0;
    this.quickBag = data?.quickBag ?? null;
    this.idleFrame = 0;
    this.showcaseSprites = [];
    this.mcSprite = null;
  }

  async create() {
    const { width, height } = this.scale;
    this._destroyed = false;
    this.events.once('shutdown', () => {
      this._destroyed = true;
    });
    this.events.once('destroy', () => {
      this._destroyed = true;
    });
    this.cameras.main.fadeIn(320, 5, 8, 17);

    const playerName = gameState.playerName || 'Arion';

    if (this.outcome === 'campaign_clear') {
      await this._buildCampaignEnding(width, height, playerName);
    } else if (this.outcome === 'defeat') {
      await this._buildDefeatScreen(width, height, playerName);
    } else {
      this._buildVictoryScreen(width, height, playerName);
    }

    // 2-frame idle animation for displayed Monsver & MC sprites
    if (this.showcaseSprites.length > 0 || this.mcSprite) {
      this.time.addEvent({
        delay: 420,
        loop: true,
        callback: () => {
          this.idleFrame = this.idleFrame === 0 ? 1 : 0;
          this.showcaseSprites.forEach(({ id, sprite }) => {
            const key = getMonsterTextureKey(id, this.idleFrame);
            if (this.textures.exists(key)) sprite.setTexture(key);
          });
          if (this.mcSprite && this.mcSprite.active) {
            const mcKey = `char_mc_${this.idleFrame}`;
            if (this.textures.exists(mcKey)) this.mcSprite.setTexture(mcKey);
          }
        },
      });
    }
  }

  _buildBackdrop(width, height, themeKey, tint, scrimColor, scrimAlpha) {
    const key = this.textures.exists(themeKey) ? themeKey : 'bg_arena_solara';
    if (this.textures.exists(key)) {
      const bg = this.add.image(width / 2, height / 2, key).setDepth(0);
      bg.setDisplaySize(width, height);
      bg.setTint(tint);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x090e1a).setDepth(0);
    }
    this.add.rectangle(width / 2, height / 2, width, height, scrimColor, scrimAlpha).setDepth(1);

    const frame = this.add.graphics().setDepth(2);
    frame.lineStyle(2, 0x263554, 0.9);
    frame.strokeRect(8, 8, width - 16, height - 16);
  }

  _spawnCelebrationParticles(width, colors) {
    for (let i = 0; i < 24; i++) {
      const px = 20 + ((i * 73) % (width - 40));
      const py = 10 + ((i * 37) % 300);
      const color = colors[i % colors.length];
      const p = this.add.rectangle(px, py, i % 3 === 0 ? 4 : 3, i % 3 === 0 ? 4 : 3, color, 0.85).setDepth(3);
      this.tweens.add({
        targets: p,
        y: py + 45 + (i % 4) * 14,
        alpha: 0.15,
        repeat: -1,
        duration: 1800 + (i % 5) * 420,
        ease: 'Sine.easeInOut',
      });
    }
  }

  _spawnRainParticles(width) {
    for (let i = 0; i < 26; i++) {
      const rx = 16 + ((i * 59) % (width - 32));
      const ry = (i * 29) % 340;
      const drop = this.add.rectangle(rx, ry, 2, 10, 0x60a5fa, 0.28).setDepth(3);
      this.tweens.add({
        targets: drop,
        y: ry + 90,
        alpha: 0.05,
        repeat: -1,
        duration: 850 + (i % 4) * 180,
      });
    }
  }

  _buildVictoryScreen(width, height, playerName) {
    const theme = this.node?.arenaTheme ?? 'bg_arena_solara';
    const isCapture = this.title.includes('CAPTURED');
    const accent = isCapture ? 0x38bdf8 : 0x22c55e;
    const accentHex = isCapture ? '#38bdf8' : '#4ade80';

    this._buildBackdrop(width, height, theme, 0x4b6a88, 0x051018, 0.72);
    this._spawnCelebrationParticles(width, [0xfde047, 0x4ade80, 0x38bdf8, 0xfb923c]);

    // Header ribbon
    this.add
      .text(width / 2, 32, `★ ${this.title} ★`, {
        fontFamily: FONTS.display,
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#fde047',
        stroke: '#04070f',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(width / 2, 57, this.subtitle || `${this.enemyName} berhasil ditaklukkan!`, {
        fontFamily: FONTS.ui,
        fontSize: '12px',
        fontStyle: 'bold',
        color: accentHex,
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Left panel: MC + Winning Monsver Celebration
    drawRpgPanel(this, 36, 83, 232, 198, {
      fill: 0x0c1426,
      alpha: 0.94,
      border: accent,
      outer: 0x04070f,
      accent,
      depth: 8,
      rivets: true,
    });

    const lead = this.playerSnapshot;
    if (lead && this.textures.exists(getMonsterTextureKey(lead.id, 0))) {
      const glow = this.add.circle(188, 166, 44, accent, 0.16).setDepth(9);
      this.tweens.add({ targets: glow, scale: 1.15, yoyo: true, repeat: -1, duration: 1100 });
      this.add.ellipse(188, 206, 68, 14, 0x020617, 0.55).setDepth(10);

      const sp = this.add.image(188, 164, getMonsterTextureKey(lead.id, 0)).setScale(1.48).setDepth(11);
      this.tweens.add({ targets: sp, y: 155, yoyo: true, repeat: -1, duration: 480, ease: 'Sine.easeOut' });
      this.showcaseSprites.push({ id: lead.id, sprite: sp });
    }

    if (this.textures.exists('char_mc_0')) {
      this.add.ellipse(86, 204, 46, 12, 0x020617, 0.5).setDepth(10);
      this.mcSprite = this.add.image(86, 166, 'char_mc_0').setScale(1.18).setDepth(12);
    } else if (this.textures.exists('portrait_player')) {
      this.add.rectangle(80, 150, 56, 56, 0x0f172a).setStrokeStyle(2, 0x4ade80).setDepth(11);
      this.add.image(80, 150, 'portrait_player').setScale(0.75).setDepth(12);
    }

    this.add
      .text(152, 240, `"Kerja bagus, ${lead?.name ?? 'Monsver'}!"`, {
        fontFamily: FONTS.ui,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#e2e8f0',
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.add
      .text(152, 258, `— Tamer ${playerName}`, {
        fontFamily: FONTS.ui,
        fontSize: '10px',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
      .setDepth(11);

    // Right panel: Rewards, XP Bar & Evolution Summary
    drawRpgPanel(this, 288, 83, 332, 198, {
      fill: 0x0c1426,
      alpha: 0.94,
      border: 0x3b527a,
      outer: 0x04070f,
      depth: 8,
      rivets: true,
    });

    const stageLabel =
      this.mode === 'campaign' && this.node
        ? `CH.${this.node.chapter} • ${this.node.title.toUpperCase()}`
        : `QUICK BATTLE #${this.battleNumber}`;

    this.add
      .text(306, 98, stageLabel, {
        fontFamily: FONTS.display,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#7dd3fc',
      })
      .setDepth(10);

    // XP Row + Animated Glossy Bar
    const lvText = this.leveledUp
      ? `LV.${this.newLevel} (LEVEL UP! ↑)`
      : `LV.${lead?.level ?? this.newLevel}`;
    this.add
      .text(306, 120, `${lead?.name ?? 'Monsver'}  ${lvText}`, {
        fontFamily: FONTS.display,
        fontSize: '10px',
        fontStyle: 'bold',
        color: this.leveledUp ? '#fde047' : '#f8fafc',
      })
      .setDepth(10);

    this.add
      .text(602, 121, `+${this.xpGained} XP`, {
        fontFamily: FONTS.display,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#c084fc',
      })
      .setOrigin(1, 0)
      .setDepth(10);

    const barX = 306;
    const barY = 144;
    const barW = 296;
    this.add.rectangle(barX + barW / 2, barY + 5, barW + 2, 12, 0x020617).setDepth(10);
    this.add.rectangle(barX + barW / 2, barY + 5, barW, 10, 0x09111f).setDepth(10);
    const ratio = lead ? Math.max(0.06, Math.min(1, (lead.xp ?? 0) / Math.max(1, lead.xpToNext ?? 100))) : 0.5;
    const targetW = Math.round((barW - 2) * ratio);
    const xpFill = this.add.rectangle(barX + 1, barY + 1, 2, 8, 0xa855f7).setOrigin(0, 0).setDepth(11);
    const xpShine = this.add.rectangle(barX + 1, barY + 1, 2, 3, 0xffffff, 0.28).setOrigin(0, 0).setDepth(12);
    this.tweens.add({
      targets: [xpFill, xpShine],
      width: targetW,
      duration: 650,
      ease: 'Cubic.easeOut',
    });

    // Reward rows
    let rowY = 168;
    if (this.mode === 'campaign') {
      const itemText = Object.entries(this.itemRewards || {})
        .map(([k, v]) => `+${v} ${k.replace('_', ' ')}`)
        .join(' • ');
      this.add
        .text(306, rowY, `GOLD REWARD : +${this.goldReward} G`, {
          fontFamily: FONTS.display,
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#fbbf24',
        })
        .setDepth(10);
      rowY += 20;

      if (itemText) {
        this.add
          .text(306, rowY, `ITEM DROPS  : ${itemText}`, {
            fontFamily: FONTS.ui,
            fontSize: '11px',
            color: '#cbd5e1',
          })
          .setDepth(10);
        rowY += 20;
      }
    }

    if (this.capturedNote) {
      this.add
        .text(306, rowY, `✦ ${this.capturedNote}`, {
          fontFamily: FONTS.ui,
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#38bdf8',
        })
        .setDepth(10);
      rowY += 20;
    }

    if (this.evoInfo) {
      this.add
        .text(306, rowY, `★ EVOLUSI: ${this.evoInfo.oldName} → ${this.evoInfo.newName}!`, {
          fontFamily: FONTS.display,
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#fde047',
        })
        .setDepth(10);
    }

    // Bottom Action Buttons
    if (this.mode === 'campaign' && this.node) {
      const nextId = getNextNodeId(this.node.id);
      if (nextId) {
        this._makeButton(206, 318, 210, 40, 'PETA CAMPAIGN', 0x1e293b, 0x64748b, '#e2e8f0', () => {
          this.scene.start('WorldMapScene', { chapter: this.node.chapter });
        });
        this._makeButton(444, 318, 234, 40, 'STAGE BERIKUTNYA >>', 0x10b981, 0xa7f3d0, '#052e16', () => {
          this.scene.start('BattleScene', { mode: 'campaign', nodeId: nextId, runtime: this.runtime });
        });
      } else {
        this._makeButton(320, 318, 260, 40, 'KEMBALI KE PETA', 0x10b981, 0xa7f3d0, '#052e16', () => {
          this.scene.start('WorldMapScene', { chapter: this.node.chapter });
        });
      }
    } else {
      this._makeButton(206, 318, 200, 40, 'TITLE SCREEN', 0x1e293b, 0x64748b, '#e2e8f0', () => {
        this.scene.start('TitleScene', { runtime: this.runtime });
      });
      this._makeButton(444, 318, 224, 40, 'NEXT BATTLE >>', 0x10b981, 0xa7f3d0, '#052e16', () => {
        const party = this.quickParty ?? gameState.party;
        party.forEach((m) => {
          if (m.currentHp > 0) {
            m.currentHp = Math.min(m.maxHp, m.currentHp + Math.round(m.maxHp * 0.3));
            m.currentSp = Math.min(m.maxSp, m.currentSp + 12);
          }
          m.status = 'None';
          m.statusTurns = 0;
          m.guarding = false;
        });
        this.scene.start('BattleScene', {
          mode: 'quick',
          runtime: this.runtime,
          battleNumber: this.battleNumber + 1,
          party,
          activePartyIndex: this.quickActiveIndex,
          bag: this.quickBag,
        });
      });
    }
  }

  async _buildCampaignEnding(width, height, playerName) {
    this._buildBackdrop(width, height, 'bg_arena_eclipse', 0x6d5b97, 0x09061a, 0.62);
    this._spawnCelebrationParticles(width, [0xfde047, 0xe9d5ff, 0x38bdf8, 0x4ade80]);
    audioManager.playBgm('title');

    this.add
      .text(width / 2, 29, '★ CAMPAIGN COMPLETED • HALL OF FAME ★', {
        fontFamily: FONTS.display,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#fde047',
        stroke: '#04070f',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(width / 2, 53, `TAMER LEGENDARIS ${playerName.toUpperCase()} — PENYELAMAT AETHERIA`, {
        fontFamily: FONTS.ui,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#7dd3fc',
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Champion Party Hall of Fame showcase
    drawRpgPanel(this, 32, 78, 576, 176, {
      fill: 0x0c1426,
      alpha: 0.92,
      border: 0xfacc15,
      outer: 0x04070f,
      accent: 0xfacc15,
      depth: 8,
      rivets: true,
    });

    // MC Champion Standing Sprite on left
    if (this.textures.exists('char_mc_0')) {
      drawRpgPanel(this, 65, 102, 78, 94, { fill: 0x09111f, border: 0xfde047, depth: 10, rivets: false });
      this.mcSprite = this.add.image(104, 149, 'char_mc_0').setScale(1.18).setDepth(11);
    } else if (this.textures.exists('portrait_player')) {
      drawRpgPanel(this, 65, 114, 78, 78, { fill: 0x09111f, border: 0xfde047, depth: 10, rivets: false });
      this.add.image(104, 153, 'portrait_player').setScale(1.0).setDepth(11);
    }
    this.add
      .text(104, 211, playerName.toUpperCase(), {
        fontFamily: FONTS.display,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#fde047',
      })
      .setOrigin(0.5)
      .setDepth(11);
    this.add
      .text(104, 229, `GOLD: ${gameState.gold}G`, {
        fontFamily: FONTS.display,
        fontSize: '8px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5)
      .setDepth(11);

    // Champion Party Monsvers side-by-side
    const party = gameState.party.slice(0, 3);
    const startX = 246;
    const spacing = 136;
    party.forEach((m, idx) => {
      const mx = startX + idx * spacing;
      drawRpgPanel(this, mx - 61, 94, 122, 140, {
        fill: 0x111a2e,
        alpha: 0.96,
        border: 0x38bdf8,
        depth: 9,
        rivets: false,
      });
      const key = getMonsterTextureKey(m.id, 0);
      if (this.textures.exists(key)) {
        const sp = this.add.image(mx, 144, key).setScale(1.36).setDepth(11);
        this.tweens.add({ targets: sp, y: 136, yoyo: true, repeat: -1, duration: 540 + idx * 120 });
        this.showcaseSprites.push({ id: m.id, sprite: sp });
      }
      this.add
        .text(mx, 198, m.name, { fontFamily: FONTS.display, fontSize: '9px', fontStyle: 'bold', color: '#f8fafc' })
        .setOrigin(0.5)
        .setDepth(11);
      this.add
        .text(mx, 215, `Lv.${m.level} • HP ${m.maxHp}`, { fontFamily: FONTS.ui, fontSize: '10px', color: '#4ade80' })
        .setOrigin(0.5)
        .setDepth(11);
    });

    // Play Grand Ending Dialogue first
    if (Array.isArray(ENDING_DIALOGUE) && ENDING_DIALOGUE.length > 0) {
      const lines = ENDING_DIALOGUE.map((l) => ({
        ...l,
        text: l.text.replace(/Tamer/g, playerName),
      }));
      await new DialogueBox(this, { dimAlpha: 0.14 }).play(lines);
    }

    if (this._destroyed) return;

    // Post-game action buttons
    this._makeButton(206, 314, 210, 40, 'TITLE SCREEN', 0x1e293b, 0x64748b, '#e2e8f0', () => {
      this.scene.start('TitleScene', { runtime: this.runtime });
    });
    this._makeButton(444, 314, 232, 40, 'POST-GAME WORLD MAP', 0xfacc15, 0xfef08a, '#1e1b4b', () => {
      this.scene.start('WorldMapScene', { chapter: 4 });
    });
  }

  async _buildDefeatScreen(width, height, playerName) {
    this._buildBackdrop(width, height, 'bg_arena_solara', 0x3b2f4a, 0x0c0714, 0.8);
    this._spawnRainParticles(width);

    this.add
      .text(width / 2, 34, 'DEFEATED — KEMBALI KE CAMP SOLARA', {
        fontFamily: FONTS.display,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#f87171',
        stroke: '#04070f',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Left campfire & tired MC + lead Monsver card
    drawRpgPanel(this, 38, 82, 236, 184, {
      fill: 0x130d1d,
      alpha: 0.94,
      border: 0xef4444,
      outer: 0x04070f,
      accent: 0xef4444,
      depth: 8,
      rivets: true,
    });

    const lead = this.playerSnapshot;
    if (this.textures.exists('char_mc_0')) {
      this.add.ellipse(92, 188, 44, 11, 0x020617, 0.5).setDepth(10);
      this.mcSprite = this.add.image(92, 152, 'char_mc_0').setScale(1.16).setTint(0xcbd5e1).setDepth(11);
    } else if (this.textures.exists('portrait_player')) {
      this.add.rectangle(86, 146, 62, 62, 0x0f172a).setStrokeStyle(2, 0xef4444).setDepth(10);
      this.add.image(86, 146, 'portrait_player').setScale(0.84).setTint(0xcbd5e1).setDepth(11);
    }
    if (lead && this.textures.exists(getMonsterTextureKey(lead.id, 0))) {
      const sp = this.add
        .image(196, 152, getMonsterTextureKey(lead.id, 0))
        .setScale(1.36)
        .setAlpha(0.75)
        .setTint(0x94a3b8)
        .setDepth(11);
      this.showcaseSprites.push({ id: lead.id, sprite: sp });
    }

    this.add
      .text(156, 222, `"Kita belum selesai, ${lead?.name ?? 'kawan'}..."`, {
        fontFamily: FONTS.ui,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#fca5a5',
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.add
      .text(156, 240, `— Tamer ${playerName}`, {
        fontFamily: FONTS.ui,
        fontSize: '10px',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
      .setDepth(11);

    // Right tactical recovery panel
    drawRpgPanel(this, 292, 82, 328, 184, {
      fill: 0x0c1426,
      alpha: 0.94,
      border: 0x3b527a,
      outer: 0x04070f,
      depth: 8,
      rivets: true,
    });

    const stageLabel =
      this.mode === 'campaign' && this.node
        ? `STAGE: CH.${this.node.chapter} ${this.node.title.toUpperCase()}`
        : `QUICK BATTLE #${this.battleNumber}`;

    this.add
      .text(310, 98, stageLabel, {
        fontFamily: FONTS.display,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#f87171',
      })
      .setDepth(10);

    this.add
      .text(
        310,
        120,
        `Seluruh Monsver tumbang saat melawan\n${this.enemyName}. Jangan menyerah!\n\nTIPS STRATEGI:\n• Manfaatkan keunggulan elemen (1.5x)\n• Pakai GUARD untuk pulihkan +10 SP\n• Gunakan Potion & ganti anggota Party`,
        {
          fontFamily: FONTS.ui,
          fontSize: '11px',
          color: '#cbd5e1',
          lineSpacing: 3,
        }
      )
      .setDepth(10);

    this.add
      .text(310, 238, '✓ Party dipulihkan 100% di Camp Solara', {
        fontFamily: FONTS.ui,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#4ade80',
      })
      .setDepth(10);

    // Brief encouraging dialogue from MC / Prof. Orin in Campaign mode
    if (this.mode === 'campaign') {
      const lines = getDefeatDialogue(playerName);
      if (lines.length > 0) {
        await new DialogueBox(this, { dimAlpha: 0.14 }).play(lines);
      }
    }

    if (this._destroyed) return;

    // Bottom buttons: Rematch / Map / Title
    if (this.mode === 'campaign' && this.node) {
      this._makeButton(124, 314, 148, 38, 'TITLE', 0x1e293b, 0x475569, '#cbd5e1', () => {
        this.scene.start('TitleScene', { runtime: this.runtime });
      });
      this._makeButton(308, 314, 184, 38, 'KEMBALI KE PETA', 0x1e293b, 0x38bdf8, '#7dd3fc', () => {
        this.scene.start('WorldMapScene', { chapter: this.node.chapter });
      });
      this._makeButton(514, 314, 198, 38, 'COBA LAGI STAGE INI', 0xef4444, 0xfca5a5, '#ffffff', () => {
        this.scene.start('BattleScene', { mode: 'campaign', nodeId: this.node.id, runtime: this.runtime });
      });
    } else {
      this._makeButton(206, 314, 200, 38, 'TITLE SCREEN', 0x1e293b, 0x64748b, '#e2e8f0', () => {
        this.scene.start('TitleScene', { runtime: this.runtime });
      });
      this._makeButton(444, 314, 224, 38, 'MAIN LAGI', 0xef4444, 0xfca5a5, '#ffffff', () => {
        this.scene.start('BattleScene', { mode: 'quick', runtime: this.runtime, battleNumber: 1 });
      });
    }
  }

  _makeButton(x, y, w, h, label, fill, border, textColor, onClick) {
    createRpgButton(this, x, y, w, h, {
      label,
      fill,
      hover: fill === 0x1e293b ? 0x334155 : fill === 0xef4444 ? 0xf87171 : fill === 0xfacc15 ? 0xfde047 : 0x34d399,
      border,
      lip: 0x04070f,
      textColor,
      fontSize: '9px',
      fontFamily: FONTS.display,
      depth: 15,
      onClick: () => {
        audioManager.playSfx('click');
        this.time.delayedCall(70, onClick);
      },
    });
  }
}
