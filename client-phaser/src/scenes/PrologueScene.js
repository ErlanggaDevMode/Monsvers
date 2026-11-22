import Phaser from 'phaser';
import { PROLOGUE_ACTS, MC_PRESET_NAMES } from '../data/campaign.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { gameState } from '../state/gameState.js';
import { audioManager } from '../audio/audioManager.js';
import { FONTS, drawRpgPanel, createRpgButton } from '../ui/UiTheme.js';

export class PrologueScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PrologueScene' });
  }

  init(data) {
    this.runtime = data?.runtime;
    this.replayOnly = Boolean(data?.replayOnly);
    this.selectedName = gameState.playerName || MC_PRESET_NAMES[0] || 'Arion';
    this.skipped = false;
    this.inNamePicker = false;
    this._destroyed = false;
    this.stageObjects = [];
    this.nameBtnRefs = [];
    this.mcSprite = null;
    this.orinSprite = null;
    this.mcFrame = 0;
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

    this.cameras.main.fadeIn(360, 5, 8, 17);

    audioManager.playBgm('title');
    this.input.once('pointerdown', () => {
      audioManager.unlock();
      audioManager.playBgm('title');
    });

    // Base dark canvas
    this.add.rectangle(width / 2, height / 2, width, height, 0x060b16).setDepth(0);

    // Top cinematic bar
    this._buildTopBar(width);

    // Dynamic act backdrop container
    this.bgImage = null;
    this.actBanner = this.add
      .text(18, 18, 'PROLOG • PENGENALAN TAMER', {
        fontFamily: FONTS.display,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#38bdf8',
      })
      .setOrigin(0, 0.5)
      .setDepth(32);

    this.actSubtitle = this.add
      .text(width / 2, 50, '', {
        fontFamily: FONTS.display,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#94a3b8',
        letterSpacing: 1,
      })
      .setOrigin(0.5)
      .setDepth(30);

    // Animate standing MC & Orin sprites idle frames
    this.time.addEvent({
      delay: 460,
      loop: true,
      callback: () => {
        this.mcFrame = this.mcFrame === 0 ? 1 : 0;
        if (this.mcSprite && this.mcSprite.active) {
          const key = `char_mc_${this.mcFrame}`;
          if (this.textures.exists(key)) this.mcSprite.setTexture(key);
        }
        if (this.orinSprite && this.orinSprite.active) {
          const oKey = `char_orin_${this.mcFrame}`;
          if (this.textures.exists(oKey)) this.orinSprite.setTexture(oKey);
        }
      },
    });

    // Play the 3 cinematic prologue acts introducing the MC
    for (let i = 0; i < PROLOGUE_ACTS.length; i++) {
      if (this.skipped || this._destroyed) break;
      const act = PROLOGUE_ACTS[i];
      await this._playAct(act, i);
    }

    if (this._destroyed) return;

    if (this.replayOnly) {
      this._finishTo('TitleScene');
      return;
    }

    // Show quick mobile-friendly MC Name confirmation card before Starter Select
    this._showMcIdentityCard();
  }

  _buildTopBar(width) {
    const bar = this.add.graphics().setDepth(30);
    bar.fillStyle(0x070c18, 0.96);
    bar.fillRect(0, 0, width, 36);
    bar.fillStyle(0x3b527a, 1);
    bar.fillRect(0, 34, width, 2);

    // Tactile Skip Prolog button (sits above dialogue overlay)
    this.skipBtn = createRpgButton(this, width - 60, 17, 102, 22, {
      label: 'SKIP PROLOG',
      fill: 0x1e293b,
      hover: 0x334155,
      border: 0x64748b,
      lip: 0x04070f,
      textColor: '#e2e8f0',
      fontSize: '8px',
      fontFamily: FONTS.display,
      depth: 260,
      onClick: () => {
        audioManager.playSfx('click');
        this.skipped = true;
        if (this.activeDialogue && typeof this.activeDialogue.destroy === 'function') {
          this.activeDialogue.destroy();
        }
        if (this.replayOnly) {
          this._finishTo('TitleScene');
        } else if (!this.inNamePicker) {
          this._showMcIdentityCard();
        }
      },
    });
  }

  _clearStageObjects() {
    this.stageObjects.forEach((obj) => {
      if (obj && typeof obj.destroy === 'function') obj.destroy();
    });
    this.stageObjects = [];
  }

  async _playAct(act, actIndex) {
    const { width, height } = this.scale;
    this._clearStageObjects();

    this.actBanner.setText(act.tag || `PROLOG • BABAK ${actIndex + 1}`);
    this.actSubtitle.setText(act.location || '');

    // Swap backdrop smoothly
    if (this.bgImage) {
      this.bgImage.destroy();
      this.bgImage = null;
    }

    const themeKey = this.textures.exists(act.backdrop) ? act.backdrop : 'bg_arena_solara';
    if (this.textures.exists(themeKey)) {
      this.bgImage = this.add.image(width / 2, height / 2, themeKey).setDepth(1);
      this.bgImage.setDisplaySize(width, height);
      this.bgImage.setTint(act.tint ?? 0x64748b);
    }

    // Scrim for cinematic contrast
    const scrim = this.add.rectangle(width / 2, height / 2, width, height, 0x050811, 0.52).setDepth(2);
    this.stageObjects.push(scrim);

    // Act-specific visual storytelling centerpiece (y: 66..226, clear above DialogueBox at y: 238)
    if (act.id === 'act1_mc_intro') {
      this._renderMcSpotlight(width / 2, 146);
    } else if (act.id === 'act2_eclipse_rift') {
      this._renderEclipseAnomaly(width / 2, 146);
      this.cameras.main.flash(260, 147, 51, 234);
      this.cameras.main.shake(220, 0.01);
      audioManager.playSfx('boss_phase2');
    } else {
      this._renderOrinCall(width / 2, 146);
    }

    // Play act dialogue via DialogueBox with light dimmer so MC character stays bright & crystal clear
    const box = new DialogueBox(this, { dimAlpha: 0.12 });
    this.activeDialogue = box;
    await box.play(act.dialogue);
    this.activeDialogue = null;
  }

  _renderMcSpotlight(cx, cy) {
    const card = drawRpgPanel(this, cx - 234, cy - 68, 468, 136, {
      fill: 0x0c1426,
      alpha: 0.94,
      border: 0x38bdf8,
      outer: 0x04070f,
      accent: 0x38bdf8,
      depth: 10,
      rivets: true,
    });
    const ped = this.add
      .ellipse(cx - 156, cy + 44, 86, 20, 0x16a34a, 0.35)
      .setStrokeStyle(2, 0x4ade80, 0.75)
      .setDepth(11);

    const glow = this.add.circle(cx - 156, cy + 4, 46, 0x22c55e, 0.16).setDepth(10);
    this.tweens.add({
      targets: glow,
      scale: 1.15,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 1300,
      ease: 'Sine.easeInOut',
    });

    const items = [card, ped, glow];

    // Crisp framing for 56x64 standing char_mc sprite
    if (this.textures.exists('char_mc_0')) {
      const hero = this.add.image(cx - 156, cy - 2, 'char_mc_0').setScale(1.36).setDepth(12);
      this.tweens.add({ targets: hero, y: cy - 6, yoyo: true, repeat: -1, duration: 950, ease: 'Sine.easeInOut' });
      this.mcSprite = hero;
      items.push(hero);
    } else if (this.textures.exists('portrait_player')) {
      const p = this.add.image(cx - 156, cy, 'portrait_player').setScale(1.0).setDepth(12);
      items.push(p);
    }

    const badge = this.add
      .text(cx - 90, cy - 46, 'MAIN CHARACTER • TAMER MUDA', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#4ade80',
      })
      .setDepth(12);

    const title = this.add
      .text(cx - 90, cy - 26, 'SANG PENJAGA ELEMEN', {
        fontFamily: FONTS.display,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setDepth(12);

    const bio = this.add
      .text(
        cx - 90,
        cy - 1,
        'Asal: Desa Solara, Benua Aetheria\nImpian: Menjalin ikatan sejati dengan Monsver\ndan menjaga harmoni 6 elemen dunia.',
        {
          fontFamily: FONTS.ui,
          fontSize: '11px',
          color: '#cbd5e1',
          lineSpacing: 4,
        }
      )
      .setDepth(12);

    items.push(badge, title, bio);
    this.stageObjects.push(...items);
  }

  _renderEclipseAnomaly(cx, cy) {
    const outer = this.add.circle(cx, cy, 62, 0x7e22ce, 0.25).setDepth(10);
    const core = this.add.circle(cx, cy, 36, 0x1e0538, 0.95).setStrokeStyle(3, 0xc084fc).setDepth(11);
    const title = this.add
      .text(cx, cy - 8, 'ECLIPSE RIFT', {
        fontFamily: FONTS.display,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#e9d5ff',
        stroke: '#04070f',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(13);
    const sub = this.add
      .text(cx, cy + 16, 'RETAKAN ENERGI PURBA TERBUKA', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#f43f5e',
      })
      .setOrigin(0.5)
      .setDepth(13);

    this.tweens.add({
      targets: outer,
      scale: 1.28,
      alpha: 0.45,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: 'Sine.easeInOut',
    });

    const items = [outer, core, title, sub];

    if (this.textures.exists('portrait_umbravex')) {
      const shadow = this.add.image(cx + 164, cy, 'portrait_umbravex').setScale(1.08).setAlpha(0.9).setDepth(12);
      this.tweens.add({ targets: shadow, y: cy - 6, yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.easeInOut' });
      items.push(shadow);
    }

    if (this.textures.exists('char_mc_0')) {
      const hero = this.add.image(cx - 164, cy, 'char_mc_0').setScale(1.26).setDepth(12);
      this.mcSprite = hero;
      items.push(hero);
    } else if (this.textures.exists('portrait_player')) {
      const hero = this.add.image(cx - 164, cy, 'portrait_player').setScale(1.0).setDepth(12);
      items.push(hero);
    }

    this.stageObjects.push(...items);
  }

  _renderOrinCall(cx, cy) {
    const card = drawRpgPanel(this, cx - 224, cy - 60, 448, 120, {
      fill: 0x0c1426,
      alpha: 0.94,
      border: 0x38bdf8,
      outer: 0x04070f,
      accent: 0x38bdf8,
      depth: 10,
      rivets: true,
    });
    const items = [card];

    if (this.textures.exists('char_mc_0')) {
      const pFrame = drawRpgPanel(this, cx - 186, cy - 45, 78, 90, {
        fill: 0x09111f,
        border: 0x22c55e,
        depth: 11,
        rivets: false,
      });
      const pImg = this.add.image(cx - 147, cy, 'char_mc_0').setScale(1.16).setDepth(12);
      this.mcSprite = pImg;
      items.push(pFrame, pImg);
    } else if (this.textures.exists('portrait_player')) {
      const pFrame = drawRpgPanel(this, cx - 185, cy - 38, 76, 76, {
        fill: 0x09111f,
        border: 0x22c55e,
        depth: 11,
        rivets: false,
      });
      const pImg = this.add.image(cx - 147, cy, 'portrait_player').setScale(0.95).setDepth(12);
      items.push(pFrame, pImg);
    }

    if (this.textures.exists('char_orin_0')) {
      const oFrame = drawRpgPanel(this, cx + 108, cy - 45, 78, 90, {
        fill: 0x09111f,
        border: 0x38bdf8,
        depth: 11,
        rivets: false,
      });
      const oImg = this.add.image(cx + 147, cy, 'char_orin_0').setScale(1.16).setFlipX(true).setDepth(12);
      this.orinSprite = oImg;
      items.push(oFrame, oImg);
    } else if (this.textures.exists('portrait_orin')) {
      const oFrame = drawRpgPanel(this, cx + 109, cy - 38, 76, 76, {
        fill: 0x09111f,
        border: 0x38bdf8,
        depth: 11,
        rivets: false,
      });
      const oImg = this.add.image(cx + 147, cy, 'portrait_orin').setScale(0.95).setDepth(12);
      items.push(oFrame, oImg);
    }

    const txt = this.add
      .text(cx, cy - 16, 'LABORATORIUM SOLARA', {
        fontFamily: FONTS.display,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#fde047',
      })
      .setOrigin(0.5)
      .setDepth(12);

    const sub = this.add
      .text(cx, cy + 12, 'Misi: Pilih Monsver Pertamamu\n& Segel Eclipse Rift!', {
        fontFamily: FONTS.ui,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#e2e8f0',
        align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5)
      .setDepth(12);

    items.push(txt, sub);
    this.stageObjects.push(...items);
  }

  _showMcIdentityCard() {
    if (this.inNamePicker) return;
    this.inNamePicker = true;
    this._clearStageObjects();

    this.skipBtn?.container?.setVisible(false);
    this.actBanner.setText('IDENTITAS MAIN CHARACTER');
    this.actSubtitle.setText('TENTUKAN NAMA TAMER-MU SEBELUM MEMILIH STARTER');

    const cx = 320;
    const panel = drawRpgPanel(this, cx - 266, 72, 532, 254, {
      fill: 0x0c1426,
      alpha: 0.96,
      border: 0x38bdf8,
      outer: 0x04070f,
      accent: 0x38bdf8,
      depth: 20,
      rivets: true,
    });
    const pFrame = drawRpgPanel(this, 100, 118, 96, 102, {
      fill: 0x09111f,
      border: 0x22c55e,
      depth: 21,
      rivets: true,
    });
    const items = [panel, pFrame];

    if (this.textures.exists('char_mc_0')) {
      const pImg = this.add.image(148, 169, 'char_mc_0').setScale(1.26).setDepth(22);
      this.mcSprite = pImg;
      items.push(pImg);
    } else if (this.textures.exists('portrait_player')) {
      const pImg = this.add.image(148, 169, 'portrait_player').setScale(1.05).setDepth(22);
      items.push(pImg);
    }

    const nameTag = this.add
      .text(148, 238, this.selectedName.toUpperCase(), {
        fontFamily: FONTS.display,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#4ade80',
      })
      .setOrigin(0.5)
      .setDepth(22);

    const roleLbl = this.add
      .text(148, 258, 'TAMER DESA SOLARA', {
        fontFamily: FONTS.ui,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
      .setDepth(22);

    const promptTitle = this.add
      .text(394, 106, 'PILIH NAMA KARAKTER UTAMA', {
        fontFamily: FONTS.display,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5)
      .setDepth(22);

    items.push(nameTag, roleLbl, promptTitle);

    // 4 preset name buttons (2x2 grid)
    this.nameBtnRefs = [];
    MC_PRESET_NAMES.forEach((preset, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = 324 + col * 140;
      const by = 146 + row * 40;

      const btn = createRpgButton(this, bx, by, 128, 30, {
        label: preset.toUpperCase(),
        fill: 0x1e293b,
        hover: 0x334155,
        border: 0x475569,
        lip: 0x04070f,
        textColor: '#e2e8f0',
        fontSize: '9px',
        fontFamily: FONTS.display,
        depth: 22,
        onClick: () => {
          audioManager.playSfx('click');
          this.selectedName = preset;
          nameTag.setText(this.selectedName.toUpperCase());
          this._refreshNameButtons();
        },
      });

      this.nameBtnRefs.push({ preset, btn });
      items.push(btn.container);
    });

    // Optional custom name button
    const customBtn = createRpgButton(this, 394, 232, 268, 28, {
      label: '✎ KETIK NAMA CUSTOM',
      fill: 0x101c33,
      hover: 0x1b2e52,
      border: 0x38bdf8,
      lip: 0x04070f,
      textColor: '#7dd3fc',
      fontSize: '9px',
      fontFamily: FONTS.display,
      depth: 22,
      onClick: () => {
        audioManager.playSfx('click');
        try {
          const entered = window.prompt('Masukkan nama Tamer-mu (maks 12 karakter):', this.selectedName);
          if (entered && entered.trim()) {
            this.selectedName = entered.trim().slice(0, 12);
            nameTag.setText(this.selectedName.toUpperCase());
            this._refreshNameButtons();
          }
        } catch {
          // Ignore prompt failure on headless environments
        }
      },
    });

    // Confirm & Proceed button
    const startBtn = createRpgButton(this, 394, 284, 268, 40, {
      label: 'LANJUT PILIH STARTER >>',
      fill: 0x10b981,
      hover: 0x34d399,
      border: 0xa7f3d0,
      lip: 0x064e3b,
      textColor: '#052e16',
      fontSize: '10px',
      fontFamily: FONTS.display,
      depth: 22,
      onClick: () => {
        audioManager.playSfx('click');
        gameState.setPlayerName(this.selectedName);
        this._finishTo('StarterSelectScene', { playerName: this.selectedName, fromPrologue: true });
      },
    });

    items.push(customBtn.container, startBtn.container);
    this.stageObjects.push(...items);
    this._refreshNameButtons();
  }

  _refreshNameButtons() {
    this.nameBtnRefs.forEach(({ preset, btn }) => {
      const active = preset.toLowerCase() === this.selectedName.toLowerCase();
      btn.setStyle(active ? 0x14532d : 0x1e293b, active ? 0x4ade80 : 0x475569, active ? '#bbf7d0' : '#e2e8f0');
    });
  }

  _finishTo(sceneKey, payload = {}) {
    this.cameras.main.fadeOut(260, 5, 8, 17);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey, payload);
    });
  }
}
