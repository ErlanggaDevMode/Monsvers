import Phaser from 'phaser';
import { battleBridge } from '../bridge/battleBridge.js';
import { getMonsterTextureKey } from '../art/pixelSprites.js';
import { gameState } from '../state/gameState.js';

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
    const cx = Math.round(width / 2);

    this._buildBackdrop(width, height, cx);
    this._buildTitleHeader(cx);
    this._buildStarterShowcase(cx);
    this._buildMenuButtons(cx);

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

  _buildBackdrop(width, height, cx) {
    // Darkened Solara backdrop
    if (this.textures.exists('bg_arena_solara')) {
      const bg = this.add.image(cx, height / 2, 'bg_arena_solara').setDepth(0);
      bg.setDisplaySize(width, height);
      bg.setTint(0x3b4d70);
    } else {
      this.add.rectangle(cx, height / 2, width, height, 0x090e1a).setDepth(0);
    }

    // Layered dark twilight scrim for readability
    const scrim = this.add.graphics().setDepth(1);
    scrim.fillStyle(0x060b16, 0.72);
    scrim.fillRect(0, 0, width, height);
    scrim.fillStyle(0x090e1a, 0.85);
    scrim.fillRect(0, 390, width, 250);

    // Subtle pixel frame borders
    scrim.lineStyle(2, 0x1e293b, 0.9);
    scrim.strokeRect(8, 8, width - 16, height - 16);

    // Twinkling pixel stars
    const starCoords = [
      [32, 34], [74, 52], [116, 28], [156, 46], [210, 30], [254, 48], [308, 36], [334, 72],
      [48, 96], [96, 118], [278, 102], [322, 134], [26, 168], [336, 186], [62, 224], [304, 214],
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
        duration: 900 + (i % 5) * 320,
        delay: (i % 4) * 200,
        ease: 'Sine.easeInOut',
      });
    });

    // Glowing pixel emblem behind title
    const glow = this.add.circle(cx, 84, 34, 0x38bdf8, 0.14).setDepth(2);
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
    emblem.fillRect(cx - 12, 72, 24, 24);
    emblem.fillStyle(0xfde047, 1);
    emblem.fillRect(cx - 7, 77, 14, 14);
    emblem.fillStyle(0x38bdf8, 0.9);
    emblem.fillRect(cx - 32, 79, 10, 10);
    emblem.fillStyle(0x22c55e, 0.9);
    emblem.fillRect(cx + 22, 79, 10, 10);
    emblem.fillStyle(0xa855f7, 0.85);
    emblem.fillRect(cx - 5, 58, 10, 8);
  }

  _buildTitleHeader(cx) {
    this.add
      .text(cx, 134, 'MONSVERS', {
        fontFamily: FONT,
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#f8fafc',
        stroke: '#0f172a',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.add
      .text(cx, 166, 'THE BATTLE MONSTER', {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#38bdf8',
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setDepth(5);

    // Engine badge (C++ WASM emerald / JS CORE amber)
    const isWasm = this.runtime === 'cpp-wasm';
    this.add
      .rectangle(cx, 196, 114, 22, isWasm ? 0x064e3b : 0x451a03)
      .setStrokeStyle(1, isWasm ? 0x10b981 : 0xf59e0b)
      .setDepth(5);

    this.add
      .text(cx, 196, isWasm ? 'C++ WASM CORE' : 'JS CORE', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: isWasm ? '#34d399' : '#fbbf24',
      })
      .setOrigin(0.5)
      .setDepth(6);
  }

  _buildStarterShowcase(cx) {
    const positions = [
      { id: SHOWCASE_IDS[0], x: cx - 96, y: 294, glow: 0xf97316, delay: 0 },
      { id: SHOWCASE_IDS[1], x: cx, y: 278, glow: 0x38bdf8, delay: 220 },
      { id: SHOWCASE_IDS[2], x: cx + 96, y: 294, glow: 0x22c55e, delay: 440 },
    ];

    this.showcaseSprites = [];

    positions.forEach((p) => {
      // Soft platform shadow & aura
      this.add.ellipse(p.x, p.y + 42, 62, 14, 0x020617, 0.65).setDepth(4);
      this.add.circle(p.x, p.y + 6, 30, p.glow, 0.12).setDepth(4);

      const texKey = getMonsterTextureKey(p.id, 0);
      const sprite = this.add
        .image(p.x, p.y, this.textures.exists(texKey) ? texKey : 'particle_pixel')
        .setScale(1.3)
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

    // Subtle divider line
    this.add.rectangle(cx, 366, 260, 2, 0x1e293b).setDepth(5);
  }

  _buildMenuButtons(cx) {
    const hasSave = gameState.hasSave();
    const btnW = 260;
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

    const startY = hasSave ? 416 : 438;
    const gap = 62;

    buttons.forEach((btn, idx) => {
      const y = startY + idx * gap;
      const bg = this.add
        .rectangle(cx, y, btnW, btnH, btn.fill)
        .setStrokeStyle(2, btn.border)
        .setInteractive({ useHandCursor: true })
        .setDepth(8);

      const txt = this.add
        .text(cx, y, btn.label, {
          fontFamily: FONT,
          fontSize: '14px',
          fontStyle: 'bold',
          color: btn.textColor,
        })
        .setOrigin(0.5)
        .setDepth(9);

      bg.on('pointerover', () => bg.setFillStyle(btn.hover));
      bg.on('pointerout', () => bg.setFillStyle(btn.fill));
      bg.on('pointerdown', () => {
        bg.setScale(0.97);
        txt.setScale(0.97);
        this.time.delayedCall(70, () => btn.onClick());
      });
    });

    this.add
      .text(cx, 616, 'AETHERIA CAMPAIGN • 4 CHAPTERS', {
        fontFamily: FONT,
        fontSize: '10px',
        color: '#64748b',
      })
      .setOrigin(0.5)
      .setDepth(5);
  }
}
