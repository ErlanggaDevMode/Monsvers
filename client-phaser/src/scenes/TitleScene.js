import Phaser from 'phaser';
import { battleBridge } from '../bridge/battleBridge.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { gameState } from '../state/gameState.js';
import { audioManager } from '../audio/audioManager.js';
import { FONTS, drawRpgPanel, createRpgButton } from '../ui/UiTheme.js';

const SHOWCASE_IDS = ['pyrofang', 'aquafin', 'verdantix'];

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  init(data) {
    this.runtime = data?.runtime ?? battleBridge.runtime;
    this.idleFrame = 0;
  }

  create() {
    const { width, height } = this.scale;
    const leftX = 178;
    const rightX = 486;

    this._buildBackdrop(width, height, leftX);
    this._buildAudioToggle(width);
    this._buildTitleHeader(leftX);
    this._buildStarterShowcase(leftX);
    this._buildMenuButtons(rightX);

    // Attempt BGM immediately and guarantee unlock+play on first scene interaction
    audioManager.playBgm('title');
    this.input.once('pointerdown', () => {
      audioManager.unlock();
      audioManager.playBgm('title');
    });

    // 2-frame idle animation for showcase starters
    this.time.addEvent({
      delay: 440,
      loop: true,
      callback: () => {
        this.idleFrame = this.idleFrame === 0 ? 1 : 0;
        this.showcaseSprites.forEach(({ id, sprite }) => {
          const key = getMonsterTextureKey(id, this.idleFrame);
          if (this.textures.exists(key)) sprite.setTexture(key);
        });
      },
    });
  }

  _buildBackdrop(width, height, leftX) {
    // Panoramic Solara backdrop (640x360)
    if (this.textures.exists('bg_arena_solara')) {
      const bg = this.add.image(width / 2, height / 2, 'bg_arena_solara').setDepth(0);
      bg.setDisplaySize(width, height);
      bg.setTint(0x3b4d70);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x090e1a).setDepth(0);
    }

    // Layered dark twilight scrim for crisp legibility
    const scrim = this.add.graphics().setDepth(1);
    scrim.fillStyle(0x050914, 0.72);
    scrim.fillRect(0, 0, width, height);

    // Subtle outer pixel frame
    scrim.lineStyle(2, 0x263554, 0.9);
    scrim.strokeRect(8, 8, width - 16, height - 16);

    // Beveled right-side Menu Deck Panel
    drawRpgPanel(this, 352, 52, 268, 268, {
      fill: 0x0c1426,
      alpha: 0.92,
      border: 0x3b527a,
      outer: 0x04070f,
      accent: 0x38bdf8,
      depth: 3,
      rivets: true,
    });

    // Twinkling pixel stars across 640x360
    const starCoords = [
      [34, 30], [88, 52], [148, 24], [224, 36], [296, 28], [374, 34], [448, 24], [526, 40], [602, 46],
      [42, 118], [312, 108], [28, 206], [326, 214], [52, 312], [314, 326],
    ];
    starCoords.forEach(([sx, sy], i) => {
      const size = i % 3 === 0 ? 3 : 2;
      const color = i % 4 === 0 ? 0xfde047 : i % 3 === 0 ? 0x38bdf8 : 0xe2e8f0;
      const star = this.add.rectangle(sx, sy, size, size, color, 0.85).setDepth(2);
      this.tweens.add({
        targets: star,
        alpha: 0.15,
        yoyo: true,
        repeat: -1,
        duration: 900 + (i % 5) * 300,
        delay: (i % 4) * 180,
        ease: 'Sine.easeInOut',
      });
    });

    // Glowing pixel emblem behind left title
    const glow = this.add.circle(leftX, 46, 34, 0x38bdf8, 0.16).setDepth(2);
    this.tweens.add({
      targets: glow,
      scale: 1.24,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 1600,
      ease: 'Sine.easeInOut',
    });

    const emblem = this.add.graphics().setDepth(3);
    emblem.fillStyle(0xf97316, 0.95);
    emblem.fillRect(leftX - 10, 36, 20, 20);
    emblem.fillStyle(0xfde047, 1);
    emblem.fillRect(leftX - 6, 40, 12, 12);
    emblem.fillStyle(0x38bdf8, 0.9);
    emblem.fillRect(leftX - 28, 42, 8, 8);
    emblem.fillStyle(0x22c55e, 0.9);
    emblem.fillRect(leftX + 20, 42, 8, 8);
    emblem.fillStyle(0xa855f7, 0.85);
    emblem.fillRect(leftX - 4, 24, 8, 7);
  }

  _buildAudioToggle(width) {
    const bx = width - 56;
    const by = 26;

    const sync = () => {
      const muted = audioManager.isMuted();
      this.audioBtn.setStyle(muted ? 0x291522 : 0x162440, muted ? 0xef4444 : 0x38bdf8, muted ? '#fca5a5' : '#7dd3fc');
      this.audioBtn.setLabel(muted ? 'MUTED' : 'SFX ON');
    };

    this.audioBtn = createRpgButton(this, bx, by, 76, 22, {
      label: 'SFX ON',
      fill: 0x162440,
      hover: 0x1e3358,
      border: 0x38bdf8,
      lip: 0x04070f,
      textColor: '#7dd3fc',
      fontSize: '8px',
      fontFamily: FONTS.display,
      depth: 12,
      onClick: () => {
        audioManager.unlock();
        audioManager.toggleMute();
        sync();
        if (!audioManager.isMuted()) {
          audioManager.playSfx('click');
          audioManager.playBgm('title');
        }
      },
    });
    sync();

    // Small PROLOG replay button next to audio toggle
    createRpgButton(this, bx - 84, by, 74, 22, {
      label: 'PROLOG',
      fill: 0x1e293b,
      hover: 0x334155,
      border: 0x64748b,
      lip: 0x04070f,
      textColor: '#e2e8f0',
      fontSize: '8px',
      fontFamily: FONTS.display,
      depth: 12,
      onClick: () => {
        audioManager.unlock();
        audioManager.playSfx('click');
        this.scene.start('PrologueScene', { runtime: this.runtime, replayOnly: true });
      },
    });
  }

  _buildTitleHeader(leftX) {
    // Soft cyan-gold halo behind logo
    const logoGlow = this.add.ellipse(leftX, 92, 236, 36, 0x38bdf8, 0.14).setDepth(4);
    this.tweens.add({
      targets: logoGlow,
      alpha: 0.24,
      scaleX: 1.06,
      yoyo: true,
      repeat: -1,
      duration: 1800,
      ease: 'Sine.easeInOut',
    });

    // Beveled drop-shadow layer + glowing Silkscreen MONSVERS logo
    this.add
      .text(leftX + 2, 95, 'MONSVERS', {
        fontFamily: FONTS.display,
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#0c4a6e',
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.add
      .text(leftX, 92, 'MONSVERS', {
        fontFamily: FONTS.display,
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#f8fafc',
        stroke: '#04070f',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.add
      .text(leftX, 122, 'THE BATTLE MONSTER', {
        fontFamily: FONTS.display,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#38bdf8',
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(6);

    // Engine badge (C++ WASM emerald / JS CORE amber)
    const isWasm = this.runtime === 'cpp-wasm';
    this.add
      .rectangle(leftX, 148, 124, 20, isWasm ? 0x064e3b : 0x451a03)
      .setStrokeStyle(1, isWasm ? 0x10b981 : 0xf59e0b)
      .setDepth(5);

    this.add
      .text(leftX, 148, isWasm ? 'C++ WASM CORE' : 'JS CORE', {
        fontFamily: FONTS.display,
        fontSize: '8px',
        fontStyle: 'bold',
        color: isWasm ? '#34d399' : '#fbbf24',
      })
      .setOrigin(0.5)
      .setDepth(6);
  }

  _buildStarterShowcase(leftX) {
    const positions = [
      { id: SHOWCASE_IDS[0], x: leftX - 96, y: 244, glow: 0xf97316, delay: 0 },
      { id: SHOWCASE_IDS[1], x: leftX, y: 226, glow: 0x38bdf8, delay: 220 },
      { id: SHOWCASE_IDS[2], x: leftX + 96, y: 244, glow: 0x22c55e, delay: 440 },
    ];

    this.showcaseSprites = [];

    positions.forEach((p) => {
      // Illuminated circular spotlight + pulsing ground halo under each floating starter
      this.add.ellipse(p.x, p.y + 42, 74, 18, 0x020617, 0.72).setDepth(4);
      const outerSpot = this.add
        .ellipse(p.x, p.y + 40, 68, 16, p.glow, 0.18)
        .setStrokeStyle(2, p.glow, 0.65)
        .setDepth(4);
      const innerSpot = this.add.ellipse(p.x, p.y + 40, 40, 9, 0xffffff, 0.18).setDepth(5);
      const aura = this.add.circle(p.x, p.y + 4, 30, p.glow, 0.14).setDepth(4);

      this.tweens.add({
        targets: [outerSpot, innerSpot, aura],
        alpha: 0.34,
        scaleX: 1.08,
        yoyo: true,
        repeat: -1,
        duration: 1250,
        delay: p.delay,
        ease: 'Sine.easeInOut',
      });

      const texKey = getMonsterTextureKey(p.id, 0);
      const sprite = this.add
        .image(p.x, p.y, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(1.26)
        .setDepth(6);

      if (p.id === 'verdantix') sprite.setFlipX(true);

      this.tweens.add({
        targets: sprite,
        y: p.y - 8,
        yoyo: true,
        repeat: -1,
        duration: 1150,
        delay: p.delay,
        ease: 'Sine.easeInOut',
      });

      this.showcaseSprites.push({ id: p.id, sprite });
    });

    this.add
      .text(leftX, 330, 'AETHERIA CAMPAIGN • 4 CHAPTERS', {
        fontFamily: FONTS.ui,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  _buildMenuButtons(rightX) {
    const hasSave = gameState.hasSave();
    const btnW = 232;
    const btnH = 44;

    const buttons = hasSave
      ? [
          {
            label: 'CONTINUE CAMPAIGN',
            fill: 0x10b981,
            hover: 0x34d399,
            border: 0xa7f3d0,
            lip: 0x064e3b,
            textColor: '#052e16',
            onClick: () => {
              gameState.load();
              this.scene.start('WorldMapScene');
            },
          },
          {
            label: 'NEW ADVENTURE',
            fill: 0x1e293b,
            hover: 0x334155,
            border: 0x64748b,
            lip: 0x090f1d,
            textColor: '#f8fafc',
            onClick: () => {
              this.scene.start('PrologueScene', { runtime: this.runtime });
            },
          },
          {
            label: 'QUICK BATTLE',
            fill: 0x1a1625,
            hover: 0x2e243d,
            border: 0xf59e0b,
            lip: 0x090710,
            textColor: '#fbbf24',
            onClick: () => {
              this.scene.start('BattleScene', { mode: 'quick', runtime: this.runtime });
            },
          },
        ]
      : [
          {
            label: 'START CAMPAIGN',
            fill: 0x10b981,
            hover: 0x34d399,
            border: 0xa7f3d0,
            lip: 0x064e3b,
            textColor: '#052e16',
            onClick: () => {
              this.scene.start('PrologueScene', { runtime: this.runtime });
            },
          },
          {
            label: 'QUICK BATTLE',
            fill: 0x1a1625,
            hover: 0x2e243d,
            border: 0xf59e0b,
            lip: 0x090710,
            textColor: '#fbbf24',
            onClick: () => {
              this.scene.start('BattleScene', { mode: 'quick', runtime: this.runtime });
            },
          },
        ];

    this.add
      .text(rightX, 76, 'PILIH MODE PERMAINAN', {
        fontFamily: FONTS.display,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#7dd3fc',
      })
      .setOrigin(0.5)
      .setDepth(6);

    const startY = hasSave ? 128 : 154;
    const gap = 60;

    buttons.forEach((btn, idx) => {
      const y = startY + idx * gap;
      createRpgButton(this, rightX, y, btnW, btnH, {
        label: btn.label,
        fill: btn.fill,
        hover: btn.hover,
        border: btn.border,
        lip: btn.lip,
        textColor: btn.textColor,
        fontSize: '10px',
        fontFamily: FONTS.display,
        depth: 8,
        onClick: () => {
          audioManager.unlock();
          audioManager.playSfx('click');
          this.time.delayedCall(70, () => btn.onClick());
        },
      });
    });

    this.add
      .text(rightX, 334, 'MOBILE LANDSCAPE • 640x360', {
        fontFamily: FONTS.ui,
        fontSize: '9px',
        color: '#64748b',
      })
      .setOrigin(0.5)
      .setDepth(5);
  }
}
