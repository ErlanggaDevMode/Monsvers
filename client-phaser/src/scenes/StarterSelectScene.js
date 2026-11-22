import Phaser from 'phaser';
import { MONSTERS, STARTER_IDS, createMonsterInstance } from '../data/monsters.js';
import { INTRO_DIALOGUE } from '../data/campaign.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { gameState } from '../state/gameState.js';
import { audioManager } from '../audio/audioManager.js';
import { FONTS, ELEMENT_STYLE, drawRpgPanel, createRpgButton } from '../ui/UiTheme.js';

export class StarterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StarterSelectScene' });
  }

  init(data) {
    this.selectedId = STARTER_IDS[0] ?? 'pyrofang';
    this.playerName = data?.playerName || gameState.playerName || 'Arion';
    this.fromPrologue = Boolean(data?.fromPrologue);
    this.inputLocked = true;
    this.idleFrame = 0;
    this.cardRefs = [];
  }

  async create() {
    const { width, height } = this.scale;
    const cx = Math.round(width / 2);

    this._buildBackdrop(width, height, cx);
    this._buildHeader(width, cx);
    this._buildStarterCards();
    this._buildConfirmButton(cx);
    this._refreshSelection();

    // 2-frame idle animation for starter sprites
    this.time.addEvent({
      delay: 420,
      loop: true,
      callback: () => {
        this.idleFrame = this.idleFrame === 0 ? 1 : 0;
        this.cardRefs.forEach((ref) => {
          const key = getMonsterTextureKey(ref.id, this.idleFrame);
          if (this.textures.exists(key)) ref.sprite.setTexture(key);
        });
      },
    });

    // Play intro story dialogue before unlocking starter selection
    if (this.fromPrologue) {
      await new DialogueBox(this).play([
        {
          speaker: 'Prof. Orin',
          portrait: 'portrait_orin',
          text: `Baiklah, ${this.playerName}! Di hadapanmu ada 3 Monsver pilihan: Pyrofang, Aquafin, dan Verdantix. Pilih partner pertamamu!`,
        },
      ]);
    } else if (Array.isArray(INTRO_DIALOGUE) && INTRO_DIALOGUE.length > 0) {
      await new DialogueBox(this).play(INTRO_DIALOGUE);
    }
    this.inputLocked = false;
  }

  _buildBackdrop(width, height, cx) {
    if (this.textures.exists('bg_arena_solara')) {
      const bg = this.add.image(cx, height / 2, 'bg_arena_solara').setDepth(0);
      bg.setDisplaySize(width, height);
      bg.setTint(0x2d3f5e);
    } else {
      this.add.rectangle(cx, height / 2, width, height, 0x090e1a).setDepth(0);
    }

    this.add.rectangle(cx, height / 2, width, height, 0x060b16, 0.82).setDepth(1);
  }

  _buildHeader(width, cx) {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x070c18, 0.96);
    g.fillRect(0, 0, width, 44);
    g.fillStyle(0x3b527a, 1);
    g.fillRect(0, 42, width, 2);

    // Back button
    createRpgButton(this, 42, 21, 64, 24, {
      label: 'BACK',
      fill: 0x1e293b,
      hover: 0x334155,
      border: 0x64748b,
      lip: 0x04070f,
      textColor: '#e2e8f0',
      fontSize: '8px',
      fontFamily: FONTS.display,
      depth: 11,
      onClick: () => {
        if (this.inputLocked) return;
        audioManager.playSfx('click');
        this.scene.start('TitleScene');
      },
    });

    this.add
      .text(cx, 15, 'PILIH STARTER MONSVER', {
        fontFamily: FONTS.display,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.add
      .text(cx, 32, 'Lab Prof. Orin • Desa Solara', {
        fontFamily: FONTS.ui,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#38bdf8',
      })
      .setOrigin(0.5)
      .setDepth(11);

    // Audio toggle top-right
    const syncAudio = () => {
      const muted = audioManager.isMuted();
      this.audioBtn.setStyle(muted ? 0x291522 : 0x162440, muted ? 0xef4444 : 0x38bdf8, muted ? '#fca5a5' : '#7dd3fc');
      this.audioBtn.setLabel(muted ? 'MUTED' : 'SFX ON');
    };
    this.audioBtn = createRpgButton(this, width - 48, 21, 74, 24, {
      label: 'SFX ON',
      fill: 0x162440,
      hover: 0x1e3358,
      border: 0x38bdf8,
      lip: 0x04070f,
      textColor: '#7dd3fc',
      fontSize: '8px',
      fontFamily: FONTS.display,
      depth: 11,
      onClick: () => {
        audioManager.unlock();
        audioManager.toggleMute();
        syncAudio();
        if (!audioManager.isMuted()) audioManager.playSfx('click');
      },
    });
    syncAudio();
  }

  _buildStarterCards() {
    // 3 crisp beveled side-by-side starter cards (x: 112, 320, 528, w: 188, h: 224)
    const cardCenters = [112, 320, 528];
    const cardW = 188;
    const cardH = 224;
    const cy = 168;
    const top = cy - cardH / 2;

    STARTER_IDS.slice(0, 3).forEach((id, idx) => {
      const def = MONSTERS[id];
      if (!def) return;
      const sample = createMonsterInstance(id, 5);
      const meta = ELEMENT_STYLE[def.element] ?? ELEMENT_STYLE[0];
      const cx = cardCenters[idx] ?? 320;
      const left = cx - cardW / 2;

      drawRpgPanel(this, left, top, cardW, cardH, {
        fill: 0x0c1426,
        alpha: 0.96,
        border: 0x2a3d61,
        outer: 0x04070f,
        depth: 4,
        rivets: true,
      });

      const bg = this.add
        .rectangle(cx, cy, cardW - 4, cardH - 4, 0x0c1426, 0.92)
        .setStrokeStyle(2, 0x2a3d61)
        .setInteractive({ useHandCursor: true })
        .setDepth(5);

      const stripe = this.add.rectangle(cx, top + 4, cardW - 6, 4, meta.color).setDepth(6);

      // Selected badge (top-left)
      const selBg = this.add.rectangle(left + 38, top + 19, 64, 15, meta.color).setDepth(8).setVisible(false);
      const selTxt = this.add
        .text(left + 38, top + 19, 'TERPILIH', {
          fontFamily: FONTS.display,
          fontSize: '7px',
          fontStyle: 'bold',
          color: '#070b14',
        })
        .setOrigin(0.5)
        .setDepth(9)
        .setVisible(false);

      // Element pill with optional 12x12 icon (top-right)
      const hasIcon = meta.iconKey && this.textures.exists(meta.iconKey);
      const pillX = left + cardW - 36;
      this.add.rectangle(pillX, top + 19, 60, 15, meta.bg).setStrokeStyle(1, meta.color).setDepth(7);
      if (hasIcon) {
        this.add.image(pillX - 20, top + 19, meta.iconKey).setDisplaySize(11, 11).setDepth(8);
      }
      this.add
        .text(hasIcon ? pillX + 6 : pillX, top + 19, meta.label, {
          fontFamily: FONTS.display,
          fontSize: '7px',
          fontStyle: 'bold',
          color: meta.hex,
        })
        .setOrigin(0.5)
        .setDepth(8);

      // Illuminated pedestal for 64x64 HD starter sprite
      const spriteY = top + 66;
      this.add.ellipse(cx, spriteY + 30, 68, 14, 0x020617, 0.65).setDepth(6);
      this.add.ellipse(cx, spriteY + 29, 60, 12, meta.color, 0.2).setStrokeStyle(1, meta.color, 0.65).setDepth(6);
      this.add.circle(cx, spriteY + 2, 28, meta.color, 0.14).setDepth(6);

      const texKey = getMonsterTextureKey(id, 0);
      const sprite = this.add
        .image(cx, spriteY, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(1.16)
        .setDepth(7);

      // Name & Title
      this.add
        .text(cx, top + 104, def.name, {
          fontFamily: FONTS.display,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setOrigin(0.5, 0)
        .setDepth(7);

      this.add
        .text(cx, top + 122, def.title ?? '', {
          fontFamily: FONTS.ui,
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#94a3b8',
        })
        .setOrigin(0.5, 0)
        .setDepth(7);

      // Compact stats bar (HP / ATK / DEF / SPD at Lv.5)
      const statBoxY = top + 148;
      this.add.rectangle(cx, statBoxY, cardW - 16, 22, 0x09111f).setStrokeStyle(1, 0x263554).setDepth(6);
      this.add
        .text(cx, statBoxY, `HP ${sample.maxHp}  ATK ${sample.attack}  DEF ${sample.defense}  SPD ${sample.speed}`, {
          fontFamily: FONTS.ui,
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#e2e8f0',
        })
        .setOrigin(0.5)
        .setDepth(7);

      // Short Indonesian lore bio
      this.add
        .text(cx, top + 166, def.bio ?? '', {
          fontFamily: FONTS.ui,
          fontSize: '9px',
          color: '#cbd5e1',
          align: 'center',
          lineSpacing: 3,
          wordWrap: { width: cardW - 18 },
        })
        .setOrigin(0.5, 0)
        .setDepth(7);

      bg.on('pointerdown', () => {
        if (this.inputLocked) return;
        audioManager.playSfx('click');
        this.selectedId = id;
        this._refreshSelection();
      });

      this.cardRefs.push({ id, def, meta, bg, stripe, sprite, selBg, selTxt });
    });
  }

  _buildConfirmButton(cx) {
    this.confirmBtn = createRpgButton(this, cx, 326, 356, 40, {
      label: 'PILIH PYROFANG & MULAI!',
      fill: 0x10b981,
      hover: 0x34d399,
      border: 0xf8fafc,
      lip: 0x04070f,
      textColor: '#070b14',
      fontSize: '11px',
      fontFamily: FONTS.display,
      depth: 10,
      onClick: () => {
        if (this.inputLocked) return;
        audioManager.playSfx('click');
        gameState.resetNewGame(this.selectedId, this.playerName);
        this.time.delayedCall(90, () => {
          this.scene.start('WorldMapScene', { chapter: 1 });
        });
      },
    });
  }

  _refreshSelection() {
    this.cardRefs.forEach((ref) => {
      const selected = ref.id === this.selectedId;
      ref.bg.setFillStyle(selected ? 0x162442 : 0x0c1426, 0.94);
      ref.bg.setStrokeStyle(selected ? 3 : 2, selected ? ref.meta.color : 0x2a3d61);
      ref.stripe.setAlpha(selected ? 1 : 0.45);
      ref.selBg.setVisible(selected);
      ref.selTxt.setVisible(selected);
      ref.sprite.setScale(selected ? 1.28 : 1.12);
    });

    const selectedDef = MONSTERS[this.selectedId];
    const meta = ELEMENT_STYLE[selectedDef?.element] ?? ELEMENT_STYLE[1];
    this.confirmBtn.setStyle(meta.color, 0xf8fafc, '#070b14');
    this.confirmBtn.setLabel(`PILIH ${(selectedDef?.name ?? 'STARTER').toUpperCase()} & MULAI!`);
  }
}
