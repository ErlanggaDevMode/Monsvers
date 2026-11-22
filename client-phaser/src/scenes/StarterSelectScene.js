import Phaser from 'phaser';
import { MONSTERS, STARTER_IDS, createMonsterInstance } from '../data/monsters.js';
import { INTRO_DIALOGUE } from '../data/campaign.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { ELEMENT_META } from '../ui/BattleHud.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { gameState } from '../state/gameState.js';

const FONT = 'monospace';

export class StarterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StarterSelectScene' });
  }

  init() {
    this.selectedId = STARTER_IDS[0] ?? 'pyrofang';
    this.inputLocked = true;
    this.idleFrame = 0;
    this.cardRefs = [];
  }

  async create() {
    const { width, height } = this.scale;
    const cx = Math.round(width / 2);

    this._buildBackdrop(width, height, cx);
    this._buildHeader(cx);
    this._buildStarterCards(cx);
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
    if (Array.isArray(INTRO_DIALOGUE) && INTRO_DIALOGUE.length > 0) {
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

  _buildHeader(cx) {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0b1222, 0.96);
    g.fillRect(0, 0, 360, 56);
    g.fillStyle(0x263554, 1);
    g.fillRect(0, 54, 360, 2);

    // Back button
    const backBg = this.add
      .rectangle(34, 28, 52, 28, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);

    this.add
      .text(34, 28, 'BACK', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#e2e8f0',
      })
      .setOrigin(0.5)
      .setDepth(12);

    backBg.on('pointerdown', () => {
      if (this.inputLocked) return;
      this.scene.start('TitleScene');
    });

    this.add
      .text(cx + 18, 20, 'PILIH STARTER MONSVER', {
        fontFamily: FONT,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.add
      .text(cx + 18, 39, 'Lab Prof. Orin • Desa Solara', {
        fontFamily: FONT,
        fontSize: '10px',
        color: '#38bdf8',
      })
      .setOrigin(0.5)
      .setDepth(11);
  }

  _buildStarterCards(cx) {
    const cardW = 336;
    const cardH = 148;
    const startY = 144;
    const gapY = 158;

    STARTER_IDS.forEach((id, idx) => {
      const def = MONSTERS[id];
      if (!def) return;
      const sample = createMonsterInstance(id, 5);
      const meta = ELEMENT_META[def.element] ?? ELEMENT_META[0];
      const y = startY + idx * gapY;
      const left = cx - cardW / 2;
      const top = y - cardH / 2;

      const bg = this.add
        .rectangle(cx, y, cardW, cardH, 0x111a2e)
        .setStrokeStyle(2, 0x334155)
        .setInteractive({ useHandCursor: true })
        .setDepth(5);

      const stripe = this.add.rectangle(left + 4, y, 6, cardH - 4, meta.color).setDepth(6);

      // Sprite pedestal on left
      this.add.ellipse(left + 54, y + 36, 58, 12, 0x020617, 0.55).setDepth(6);
      this.add.circle(left + 54, y - 2, 32, meta.color, 0.14).setDepth(6);

      const texKey = getMonsterTextureKey(id, 0);
      const sprite = this.add
        .image(left + 54, y - 4, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(1.3)
        .setDepth(7);

      // Selected badge
      const selBg = this.add.rectangle(left + 54, top + 16, 68, 16, meta.color).setDepth(8).setVisible(false);
      const selTxt = this.add
        .text(left + 54, top + 16, 'TERPILIH', {
          fontFamily: FONT,
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#070b14',
        })
        .setOrigin(0.5)
        .setDepth(9)
        .setVisible(false);

      // Name & Element pill
      const infoX = left + 102;
      this.add
        .text(infoX, top + 12, def.name, {
          fontFamily: FONT,
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setDepth(7);

      this.add
        .text(infoX, top + 30, def.title ?? '', {
          fontFamily: FONT,
          fontSize: '10px',
          color: '#94a3b8',
        })
        .setDepth(7);

      // Element pill (top-right)
      this.add.rectangle(left + cardW - 38, top + 20, 56, 18, meta.bg).setStrokeStyle(1, meta.color).setDepth(7);
      this.add
        .text(left + cardW - 38, top + 20, meta.label, {
          fontFamily: FONT,
          fontSize: '9px',
          fontStyle: 'bold',
          color: meta.hex,
        })
        .setOrigin(0.5)
        .setDepth(8);

      // Compact stats bar (HP / ATK / DEF / SPD at Lv.5)
      const statBoxY = top + 56;
      this.add.rectangle(infoX + 112, statBoxY, 224, 22, 0x090e1a).setStrokeStyle(1, 0x1e293b).setDepth(6);
      this.add
        .text(
          infoX + 8,
          statBoxY,
          `HP ${sample.maxHp}  ATK ${sample.attack}  DEF ${sample.defense}  SPD ${sample.speed}`,
          {
            fontFamily: FONT,
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#e2e8f0',
          }
        )
        .setOrigin(0, 0.5)
        .setDepth(7);

      // Short Indonesian lore bio
      this.add
        .text(infoX, top + 74, def.bio ?? '', {
          fontFamily: FONT,
          fontSize: '10px',
          color: '#cbd5e1',
          lineSpacing: 3,
          wordWrap: { width: 222 },
        })
        .setDepth(7);

      bg.on('pointerdown', () => {
        if (this.inputLocked) return;
        this.selectedId = id;
        this._refreshSelection();
      });

      this.cardRefs.push({ id, def, meta, bg, stripe, sprite, selBg, selTxt });
    });
  }

  _buildConfirmButton(cx) {
    this.confirmBg = this.add
      .rectangle(cx, 596, 304, 50, 0x10b981)
      .setStrokeStyle(2, 0xf8fafc)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    this.confirmTxt = this.add
      .text(cx, 596, 'PILIH PYROFANG & MULAI!', {
        fontFamily: FONT,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#070b14',
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.confirmBg.on('pointerdown', () => {
      if (this.inputLocked) return;
      this.confirmBg.setScale(0.97);
      this.confirmTxt.setScale(0.97);
      gameState.resetNewGame(this.selectedId);
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
      ref.sprite.setScale(selected ? 1.4 : 1.22);
    });

    const selectedDef = MONSTERS[this.selectedId];
    const meta = ELEMENT_META[selectedDef?.element] ?? ELEMENT_META[1];
    this.confirmBg.setFillStyle(meta.color);
    this.confirmTxt.setText(`PILIH ${(selectedDef?.name ?? 'STARTER').toUpperCase()} & MULAI!`);
  }
}
