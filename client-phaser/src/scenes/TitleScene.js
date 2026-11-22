import Phaser from 'phaser';
import { battleBridge } from '../bridge/battleBridge.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { gameState } from '../state/gameState.js';
import { audioManager } from '../audio/audioManager.js';

const FONT = 'monospace';
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
    const leftX = 185;
    const rightX = 470;

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
    scrim.fillStyle(0x060b16, 0.72);
    scrim.fillRect(0, 0, width, height);
    // Slightly deeper right menu panel backdrop
    scrim.fillStyle(0x090e1a, 0.56);
    scrim.fillRect(344, 10, width - 354, height - 20);

    // Subtle pixel frame borders + vertical divider
    scrim.lineStyle(2, 0x1e293b, 0.9);
    scrim.strokeRect(8, 8, width - 16, height - 16);
    scrim.fillStyle(0x263554, 0.75);
    scrim.fillRect(342, 34, 2, height - 68);

    // Twinkling pixel stars across 640x360
    const starCoords = [
      [34, 30], [88, 52], [148, 24], [224, 36], [296, 28], [374, 42], [448, 26], [526, 48], [602, 64],
      [42, 118], [312, 108], [368, 134], [614, 152], [28, 206], [326, 214], [598, 274], [52, 312], [380, 318],
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
    const glow = this.add.circle(leftX, 50, 30, 0x38bdf8, 0.14).setDepth(2);
    this.tweens.add({
      targets: glow,
      scale: 1.22,
      alpha: 0.28,
      yoyo: true,
      repeat: -1,
      duration: 1600,
      ease: 'Sine.easeInOut',
    });

    const emblem = this.add.graphics().setDepth(3);
    emblem.fillStyle(0xf97316, 0.95);
    emblem.fillRect(leftX - 10, 40, 20, 20);
    emblem.fillStyle(0xfde047, 1);
    emblem.fillRect(leftX - 6, 44, 12, 12);
    emblem.fillStyle(0x38bdf8, 0.9);
    emblem.fillRect(leftX - 28, 46, 8, 8);
    emblem.fillStyle(0x22c55e, 0.9);
    emblem.fillRect(leftX + 20, 46, 8, 8);
    emblem.fillStyle(0xa855f7, 0.85);
    emblem.fillRect(leftX - 4, 28, 8, 7);
  }

  _buildAudioToggle(width) {
    const bx = width - 54;
    const by = 26;
    this.audioBtnBg = this.add
      .rectangle(bx, by, 76, 24, 0x162440)
      .setStrokeStyle(1, 0x38bdf8)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    this.audioBtnTxt = this.add
      .text(bx, by, 'SFX ON', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#7dd3fc',
      })
      .setOrigin(0.5)
      .setDepth(13);

    const sync = () => {
      const muted = audioManager.isMuted();
      this.audioBtnBg.setFillStyle(muted ? 0x291522 : 0x162440);
      this.audioBtnBg.setStrokeStyle(1, muted ? 0xef4444 : 0x38bdf8);
      this.audioBtnTxt.setText(muted ? 'MUTED' : 'SFX ON');
      this.audioBtnTxt.setColor(muted ? '#fca5a5' : '#7dd3fc');
    };

    this.audioBtnBg.on('pointerdown', () => {
      audioManager.unlock();
      audioManager.toggleMute();
      sync();
      if (!audioManager.isMuted()) {
        audioManager.playSfx('click');
        audioManager.playBgm('title');
      }
    });

    sync();
  }

  _buildTitleHeader(leftX) {
    this.add
      .text(leftX, 94, 'MONSVERS', {
        fontFamily: FONT,
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#f8fafc',
        stroke: '#0f172a',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.add
      .text(leftX, 124, 'THE BATTLE MONSTER', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#38bdf8',
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setDepth(5);

    // Engine badge (C++ WASM emerald / JS CORE amber)
    const isWasm = this.runtime === 'cpp-wasm';
    this.add
      .rectangle(leftX, 152, 114, 20, isWasm ? 0x064e3b : 0x451a03)
      .setStrokeStyle(1, isWasm ? 0x10b981 : 0xf59e0b)
      .setDepth(5);

    this.add
      .text(leftX, 152, isWasm ? 'C++ WASM CORE' : 'JS CORE', {
        fontFamily: FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: isWasm ? '#34d399' : '#fbbf24',
      })
      .setOrigin(0.5)
      .setDepth(6);
  }

  _buildStarterShowcase(leftX) {
    const positions = [
      { id: SHOWCASE_IDS[0], x: leftX - 94, y: 248, glow: 0xf97316, delay: 0 },
      { id: SHOWCASE_IDS[1], x: leftX, y: 232, glow: 0x38bdf8, delay: 220 },
      { id: SHOWCASE_IDS[2], x: leftX + 94, y: 248, glow: 0x22c55e, delay: 440 },
    ];

    this.showcaseSprites = [];

    positions.forEach((p) => {
      // Soft platform shadow & aura
      this.add.ellipse(p.x, p.y + 42, 62, 14, 0x020617, 0.65).setDepth(4);
      this.add.circle(p.x, p.y + 6, 30, p.glow, 0.14).setDepth(4);

      const texKey = getMonsterTextureKey(p.id, 0);
      const sprite = this.add
        .image(p.x, p.y, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(1.35)
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
        fontFamily: FONT,
        fontSize: '10px',
        color: '#64748b',
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  _buildMenuButtons(rightX) {
    const hasSave = gameState.hasSave();
    const btnW = 244;
    const btnH = 48;

    const buttons = hasSave
      ? [
          {
            label: 'CONTINUE CAMPAIGN',
            fill: 0x10b981,
            hover: 0x34d399,
            border: 0xa7f3d0,
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
            textColor: '#f8fafc',
            onClick: () => {
              this.scene.start('StarterSelectScene');
            },
          },
          {
            label: 'QUICK BATTLE',
            fill: 0x121826,
            hover: 0x292524,
            border: 0xf59e0b,
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
            textColor: '#052e16',
            onClick: () => {
              this.scene.start('StarterSelectScene');
            },
          },
          {
            label: 'QUICK BATTLE',
            fill: 0x121826,
            hover: 0x292524,
            border: 0xf59e0b,
            textColor: '#fbbf24',
            onClick: () => {
              this.scene.start('BattleScene', { mode: 'quick', runtime: this.runtime });
            },
          },
        ];

    this.add
      .text(rightX, 74, 'PILIH MODE PERMAINAN', {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#94a3b8',
        letterSpacing: 1,
      })
      .setOrigin(0.5)
      .setDepth(6);

    const startY = hasSave ? 124 : 152;
    const gap = 64;

    buttons.forEach((btn, idx) => {
      const y = startY + idx * gap;
      const bg = this.add
        .rectangle(rightX, y, btnW, btnH, btn.fill)
        .setStrokeStyle(2, btn.border)
        .setInteractive({ useHandCursor: true })
        .setDepth(8);

      const txt = this.add
        .text(rightX, y, btn.label, {
          fontFamily: FONT,
          fontSize: '13px',
          fontStyle: 'bold',
          color: btn.textColor,
        })
        .setOrigin(0.5)
        .setDepth(9);

      bg.on('pointerover', () => bg.setFillStyle(btn.hover));
      bg.on('pointerout', () => bg.setFillStyle(btn.fill));
      bg.on('pointerdown', () => {
        audioManager.unlock();
        audioManager.playSfx('click');
        bg.setScale(0.97);
        txt.setScale(0.97);
        this.time.delayedCall(70, () => btn.onClick());
      });
    });

    this.add
      .text(rightX, 330, 'MOBILE LANDSCAPE • 640x360', {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#475569',
      })
      .setOrigin(0.5)
      .setDepth(5);
  }
}
