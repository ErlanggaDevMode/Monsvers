import Phaser from 'phaser';
import { PROLOGUE_ACTS, MC_PRESET_NAMES } from '../data/campaign.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { gameState } from '../state/gameState.js';
import { audioManager } from '../audio/audioManager.js';

const FONT = 'monospace';

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
      .text(20, 14, 'PROLOG • PENGENALAN TAMER', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#38bdf8',
      })
      .setDepth(32);

    this.actSubtitle = this.add
      .text(width / 2, 50, '', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#94a3b8',
        letterSpacing: 2,
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
    bar.fillStyle(0x090e1a, 0.92);
    bar.fillRect(0, 0, width, 36);
    bar.fillStyle(0x1e293b, 1);
    bar.fillRect(0, 35, width, 2);

    // Skip Prolog button (sits above dialogue overlay if desired, or accessible between acts)
    this.skipBtnBg = this.add
      .rectangle(width - 54, 18, 86, 22, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true })
      .setDepth(260);

    this.skipBtnTxt = this.add
      .text(width - 54, 18, 'SKIP PROLOG', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#cbd5e1',
      })
      .setOrigin(0.5)
      .setDepth(261);

    this.skipBtnBg.on('pointerdown', () => {
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
    const card = this.add.rectangle(cx, cy, 460, 134, 0x0b1325, 0.92).setStrokeStyle(2, 0x38bdf8).setDepth(10);
    const ped = this.add.ellipse(cx - 156, cy + 44, 84, 20, 0x16a34a, 0.35).setStrokeStyle(2, 0x4ade80, 0.7).setDepth(11);

    const glow = this.add.circle(cx - 156, cy + 4, 48, 0x22c55e, 0.16).setDepth(10);
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

    if (this.textures.exists('char_mc_0')) {
      const hero = this.add.image(cx - 156, cy - 2, 'char_mc_0').setScale(1.45).setDepth(12);
      this.tweens.add({ targets: hero, y: cy - 6, yoyo: true, repeat: -1, duration: 950, ease: 'Sine.easeInOut' });
      this.mcSprite = hero;
      items.push(hero);
    } else if (this.textures.exists('portrait_player')) {
      const p = this.add.image(cx - 156, cy, 'portrait_player').setScale(1.65).setDepth(12);
      items.push(p);
    }

    const badge = this.add
      .text(cx - 90, cy - 46, 'MAIN CHARACTER • TAMER MUDA', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#4ade80',
      })
      .setDepth(12);

    const title = this.add
      .text(cx - 90, cy - 26, 'SANG PENJAGA ELEMEN', {
        fontFamily: FONT,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setDepth(12);

    const bio = this.add
      .text(
        cx - 90,
        cy - 2,
        'Asal: Desa Solara, Benua Aetheria\nImpian: Menjalin ikatan sejati dengan Monsver\ndan menjaga harmoni 6 elemen dunia.',
        {
          fontFamily: FONT,
          fontSize: '10px',
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
    const core = this.add.circle(cx, cy, 34, 0x1e0538, 0.95).setStrokeStyle(3, 0xc084fc).setDepth(11);
    const title = this.add
      .text(cx, cy - 6, 'ECLIPSE RIFT', {
        fontFamily: FONT,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#e9d5ff',
        stroke: '#050811',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(13);
    const sub = this.add
      .text(cx, cy + 16, 'RETAKAN ENERGI PURBA TERBUKA', {
        fontFamily: FONT,
        fontSize: '9px',
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
      const shadow = this.add.image(cx + 158, cy, 'portrait_umbravex').setScale(1.6).setAlpha(0.85).setDepth(12);
      this.tweens.add({ targets: shadow, y: cy - 6, yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.easeInOut' });
      items.push(shadow);
    }

    if (this.textures.exists('char_mc_0')) {
      const hero = this.add.image(cx - 158, cy, 'char_mc_0').setScale(1.35).setDepth(12);
      this.mcSprite = hero;
      items.push(hero);
    } else if (this.textures.exists('portrait_player')) {
      const hero = this.add.image(cx - 158, cy, 'portrait_player').setScale(1.5).setDepth(12);
      items.push(hero);
    }

    this.stageObjects.push(...items);
  }

  _renderOrinCall(cx, cy) {
    const card = this.add.rectangle(cx, cy, 430, 118, 0x0b1325, 0.9).setStrokeStyle(2, 0x38bdf8).setDepth(10);
    const items = [card];

    if (this.textures.exists('char_mc_0')) {
      const pFrame = this.add.rectangle(cx - 140, cy, 76, 86, 0x0f172a).setStrokeStyle(2, 0x22c55e).setDepth(11);
      const pImg = this.add.image(cx - 140, cy, 'char_mc_0').setScale(1.18).setDepth(12);
      this.mcSprite = pImg;
      items.push(pFrame, pImg);
    } else if (this.textures.exists('portrait_player')) {
      const pFrame = this.add.rectangle(cx - 140, cy, 76, 76, 0x0f172a).setStrokeStyle(2, 0x22c55e).setDepth(11);
      const pImg = this.add.image(cx - 140, cy, 'portrait_player').setScale(1.45).setDepth(12);
      items.push(pFrame, pImg);
    }

    if (this.textures.exists('char_orin_0')) {
      const oFrame = this.add.rectangle(cx + 140, cy, 76, 86, 0x0f172a).setStrokeStyle(2, 0x38bdf8).setDepth(11);
      const oImg = this.add.image(cx + 140, cy, 'char_orin_0').setScale(1.18).setFlipX(true).setDepth(12);
      this.orinSprite = oImg;
      items.push(oFrame, oImg);
    } else if (this.textures.exists('portrait_orin')) {
      const oFrame = this.add.rectangle(cx + 140, cy, 76, 76, 0x0f172a).setStrokeStyle(2, 0x38bdf8).setDepth(11);
      const oImg = this.add.image(cx + 140, cy, 'portrait_orin').setScale(1.45).setDepth(12);
      items.push(oFrame, oImg);
    }

    const txt = this.add
      .text(cx, cy - 12, 'LABORATORIUM SOLARA', {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#fde047',
      })
      .setOrigin(0.5)
      .setDepth(12);

    const sub = this.add
      .text(cx, cy + 12, 'Misi: Pilih Monsver Pertamamu\n& Segel Eclipse Rift!', {
        fontFamily: FONT,
        fontSize: '10px',
        color: '#e2e8f0',
        align: 'center',
        lineSpacing: 3,
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

    this.skipBtnBg.setVisible(false);
    this.skipBtnTxt.setVisible(false);
    this.actBanner.setText('IDENTITAS MAIN CHARACTER');
    this.actSubtitle.setText('TENTUKAN NAMA TAMER-MU SEBELUM MEMILIH STARTER');

    const cx = 320;
    const panel = this.add.rectangle(cx, 198, 520, 250, 0x0b1325, 0.95).setStrokeStyle(2, 0x38bdf8).setDepth(20);
    const pFrame = this.add.rectangle(150, 172, 92, 92, 0x0f172a).setStrokeStyle(2, 0x22c55e).setDepth(21);
    const items = [panel, pFrame];

    if (this.textures.exists('char_mc_0')) {
      const pImg = this.add.image(150, 172, 'char_mc_0').setScale(1.3).setDepth(22);
      this.mcSprite = pImg;
      items.push(pImg);
    } else if (this.textures.exists('portrait_player')) {
      const pImg = this.add.image(150, 172, 'portrait_player').setScale(1.75).setDepth(22);
      items.push(pImg);
    }

    const nameTag = this.add
      .text(150, 232, this.selectedName.toUpperCase(), {
        fontFamily: FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#4ade80',
      })
      .setOrigin(0.5)
      .setDepth(22);

    const roleLbl = this.add
      .text(150, 250, 'TAMER DESA SOLARA', {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
      .setDepth(22);

    const promptTitle = this.add
      .text(392, 108, 'PILIH NAMA KARAKTER UTAMA', {
        fontFamily: FONT,
        fontSize: '12px',
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
      const bx = 322 + col * 140;
      const by = 148 + row * 42;

      const bg = this.add
        .rectangle(bx, by, 128, 32, 0x1e293b)
        .setStrokeStyle(2, 0x475569)
        .setInteractive({ useHandCursor: true })
        .setDepth(22);

      const txt = this.add
        .text(bx, by, preset.toUpperCase(), {
          fontFamily: FONT,
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#e2e8f0',
        })
        .setOrigin(0.5)
        .setDepth(23);

      bg.on('pointerdown', () => {
        audioManager.playSfx('click');
        this.selectedName = preset;
        nameTag.setText(this.selectedName.toUpperCase());
        this._refreshNameButtons();
      });

      this.nameBtnRefs.push({ preset, bg, txt });
      items.push(bg, txt);
    });

    // Optional custom name button
    const customBg = this.add
      .rectangle(392, 232, 268, 28, 0x10182b)
      .setStrokeStyle(1, 0x38bdf8)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    const customTxt = this.add
      .text(392, 232, '✎ KETIK NAMA CUSTOM', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#7dd3fc',
      })
      .setOrigin(0.5)
      .setDepth(23);

    customBg.on('pointerdown', () => {
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
    });

    // Confirm & Proceed button
    const startBg = this.add
      .rectangle(392, 284, 268, 42, 0x10b981)
      .setStrokeStyle(2, 0xa7f3d0)
      .setInteractive({ useHandCursor: true })
      .setDepth(22);

    const startTxt = this.add
      .text(392, 284, 'LANJUT PILIH STARTER >>', {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#052e16',
      })
      .setOrigin(0.5)
      .setDepth(23);

    startBg.on('pointerdown', () => {
      audioManager.playSfx('click');
      gameState.setPlayerName(this.selectedName);
      this._finishTo('StarterSelectScene', { playerName: this.selectedName, fromPrologue: true });
    });

    items.push(customBg, customTxt, startBg, startTxt);
    this.stageObjects.push(...items);
    this._refreshNameButtons();
  }

  _refreshNameButtons() {
    this.nameBtnRefs.forEach(({ preset, bg, txt }) => {
      const active = preset.toLowerCase() === this.selectedName.toLowerCase();
      bg.setFillStyle(active ? 0x14532d : 0x1e293b);
      bg.setStrokeStyle(2, active ? 0x4ade80 : 0x475569);
      txt.setColor(active ? '#bbf7d0' : '#e2e8f0');
    });
  }

  _finishTo(sceneKey, payload = {}) {
    this.cameras.main.fadeOut(260, 5, 8, 17);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey, payload);
    });
  }
}
