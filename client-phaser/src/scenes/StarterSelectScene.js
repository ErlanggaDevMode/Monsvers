import Phaser from 'phaser';
import { MONSTERS, STARTER_IDS, createMonsterInstance } from '../data/monsters.js';
import { INTRO_DIALOGUE } from '../data/campaign.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { ELEMENT_META } from '../ui/BattleHud.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { gameState } from '../state/gameState.js';
import { audioManager } from '../audio/audioManager.js';

const FONT = 'monospace';

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

    this.add.rectangle(cx, height / 2, width, height, 0x070c17, 0.82).setDepth(1);
  }

  _buildHeader(width, cx) {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0b1222, 0.96);
    g.fillRect(0, 0, width, 44);
    g.fillStyle(0x263554, 1);
    g.fillRect(0, 42, width, 2);

    // Back button
    const backBg = this.add
      .rectangle(38, 22, 56, 24, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);

    this.add
      .text(38, 22, 'BACK', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#e2e8f0',
      })
      .setOrigin(0.5)
      .setDepth(12);

    backBg.on('pointerdown', () => {
      if (this.inputLocked) return;
      audioManager.playSfx('click');
      this.scene.start('TitleScene');
    });

    this.add
      .text(cx, 15, 'PILIH STARTER MONSVER', {
        fontFamily: FONT,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.add
      .text(cx, 32, 'Lab Prof. Orin • Desa Solara', {
        fontFamily: FONT,
        fontSize: '10px',
        color: '#38bdf8',
      })
      .setOrigin(0.5)
      .setDepth(11);

    // Audio toggle top-right
    const audioBg = this.add
      .rectangle(width - 48, 22, 72, 24, 0x162440)
      .setStrokeStyle(1, 0x38bdf8)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);
    const audioTxt = this.add
      .text(width - 48, 22, 'SFX ON', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#7dd3fc',
      })
      .setOrigin(0.5)
      .setDepth(12);

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
      if (!audioManager.isMuted()) audioManager.playSfx('click');
    });
    syncAudio();
  }

  _buildStarterCards() {
    // 3 crisp side-by-side starter cards (x: 112, 320, 528, w: 186, h: 214)
    const cardCenters = [112, 320, 528];
    const cardW = 186;
    const cardH = 214;
    const cy = 166;
    const top = cy - cardH / 2;

    STARTER_IDS.slice(0, 3).forEach((id, idx) => {
      const def = MONSTERS[id];
      if (!def) return;
      const sample = createMonsterInstance(id, 5);
      const meta = ELEMENT_META[def.element] ?? ELEMENT_META[0];
      const cx = cardCenters[idx] ?? 320;
      const left = cx - cardW / 2;

      const bg = this.add
        .rectangle(cx, cy, cardW, cardH, 0x111a2e)
        .setStrokeStyle(2, 0x334155)
        .setInteractive({ useHandCursor: true })
        .setDepth(5);

      const stripe = this.add.rectangle(cx, top + 3, cardW - 4, 5, meta.color).setDepth(6);

      // Selected badge (top-left)
      const selBg = this.add.rectangle(left + 36, top + 18, 60, 15, meta.color).setDepth(8).setVisible(false);
      const selTxt = this.add
        .text(left + 36, top + 18, 'TERPILIH', {
          fontFamily: FONT,
          fontSize: '8px',
          fontStyle: 'bold',
          color: '#070b14',
        })
        .setOrigin(0.5)
        .setDepth(9)
        .setVisible(false);

      // Element pill (top-right)
      this.add.rectangle(left + cardW - 32, top + 18, 52, 15, meta.bg).setStrokeStyle(1, meta.color).setDepth(7);
      this.add
        .text(left + cardW - 32, top + 18, meta.label, {
          fontFamily: FONT,
          fontSize: '8px',
          fontStyle: 'bold',
          color: meta.hex,
        })
        .setOrigin(0.5)
        .setDepth(8);

      // Sprite pedestal centered in upper half
      const spriteY = top + 64;
      this.add.ellipse(cx, spriteY + 30, 62, 12, 0x020617, 0.55).setDepth(6);
      this.add.circle(cx, spriteY + 2, 28, meta.color, 0.14).setDepth(6);

      const texKey = getMonsterTextureKey(id, 0);
      const sprite = this.add
        .image(cx, spriteY, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(1.22)
        .setDepth(7);

      // Name & Title
      this.add
        .text(cx, top + 104, def.name, {
          fontFamily: FONT,
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setOrigin(0.5, 0)
        .setDepth(7);

      this.add
        .text(cx, top + 121, def.title ?? '', {
          fontFamily: FONT,
          fontSize: '9px',
          color: '#94a3b8',
        })
        .setOrigin(0.5, 0)
        .setDepth(7);

      // Compact stats bar (HP / ATK / DEF / SPD at Lv.5)
      const statBoxY = top + 146;
      this.add.rectangle(cx, statBoxY, cardW - 14, 22, 0x090e1a).setStrokeStyle(1, 0x1e293b).setDepth(6);
      this.add
        .text(cx, statBoxY, `HP ${sample.maxHp}  ATK ${sample.attack}  DEF ${sample.defense}  SPD ${sample.speed}`, {
          fontFamily: FONT,
          fontSize: '8px',
          fontStyle: 'bold',
          color: '#e2e8f0',
        })
        .setOrigin(0.5)
        .setDepth(7);

      // Short Indonesian lore bio
      this.add
        .text(cx, top + 164, def.bio ?? '', {
          fontFamily: FONT,
          fontSize: '9px',
          color: '#cbd5e1',
          align: 'center',
          lineSpacing: 2,
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
    this.confirmBg = this.add
      .rectangle(cx, 326, 340, 42, 0x10b981)
      .setStrokeStyle(2, 0xf8fafc)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    this.confirmTxt = this.add
      .text(cx, 326, 'PILIH PYROFANG & MULAI!', {
        fontFamily: FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#070b14',
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.confirmBg.on('pointerdown', () => {
      if (this.inputLocked) return;
      audioManager.playSfx('click');
      this.confirmBg.setScale(0.97);
      this.confirmTxt.setScale(0.97);
      gameState.resetNewGame(this.selectedId, this.playerName);
      this.time.delayedCall(90, () => {
        this.scene.start('WorldMapScene', { chapter: 1 });
      });
    });
  }

  _refreshSelection() {
    this.cardRefs.forEach((ref) => {
      const selected = ref.id === this.selectedId;
      ref.bg.setFillStyle(selected ? 0x1b2b48 : 0x10182b);
      ref.bg.setStrokeStyle(selected ? 3 : 2, selected ? ref.meta.color : 0x263554);
      ref.stripe.setAlpha(selected ? 1 : 0.45);
      ref.selBg.setVisible(selected);
      ref.selTxt.setVisible(selected);
      ref.sprite.setScale(selected ? 1.35 : 1.18);
    });

    const selectedDef = MONSTERS[this.selectedId];
    const meta = ELEMENT_META[selectedDef?.element] ?? ELEMENT_META[1];
    this.confirmBg.setFillStyle(meta.color);
    this.confirmTxt.setText(`PILIH ${(selectedDef?.name ?? 'STARTER').toUpperCase()} & MULAI!`);
  }
}
