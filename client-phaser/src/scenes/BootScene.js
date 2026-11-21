import Phaser from 'phaser';
import { battleBridge } from '../bridge/battleBridge.js';
import { registerAllPixelTextures } from '../art/pixelSprites.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  async create() {
    const { width, height } = this.scale;
    const cx = Math.round(width / 2);
    const cy = Math.round(height / 2);

    // Rich dark pixel-art boot backdrop
    this.add.rectangle(cx, cy, width, height, 0x090e1a);
    this.add.rectangle(cx, cy - 110, 260, 2, 0x1e293b);
    this.add.rectangle(cx, cy + 120, 260, 2, 0x1e293b);

    // Subtle decorative pixel diamond emblem
    const emblem = this.add.graphics();
    emblem.fillStyle(0xf97316, 0.9);
    emblem.fillRect(cx - 10, cy - 154, 20, 20);
    emblem.fillStyle(0xfde047, 1);
    emblem.fillRect(cx - 6, cy - 150, 12, 12);
    emblem.fillStyle(0x38bdf8, 0.85);
    emblem.fillRect(cx - 26, cy - 148, 8, 8);
    emblem.fillStyle(0x22c55e, 0.85);
    emblem.fillRect(cx + 18, cy - 148, 8, 8);

    this.add
      .text(cx, cy - 82, 'MONSVERS', {
        fontFamily: 'monospace',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#f8fafc',
        stroke: '#1e293b',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 52, 'THE BATTLE MONSTER', {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#38bdf8',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    // Crisp pixel loading bar frame
    const barW = 220;
    const barH = 16;
    const barX = cx - barW / 2;
    const barY = cy + 8;

    this.add.rectangle(cx, barY + barH / 2, barW + 4, barH + 4, 0x334155);
    this.add.rectangle(cx, barY + barH / 2, barW, barH, 0x0f172a);
    const fillBar = this.add.rectangle(barX + 2, barY + 2, 0, barH - 4, 0x38bdf8).setOrigin(0, 0);

    const statusText = this.add
      .text(cx, barY + 34, 'Generating pixel sprites...', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#94a3b8',
      })
      .setOrigin(0.5);

    const setProgress = (pct, label) => {
      fillBar.width = Math.round((barW - 4) * pct);
      statusText.setText(label);
    };

    // 1. Register procedural pixel sprites & arena textures
    setProgress(0.35, 'Building pixel textures...');
    registerAllPixelTextures(this);

    // 2. Initialize C++ WASM Battle Engine (with JS fallback)
    setProgress(0.7, 'Initializing Battle Core...');
    const runtime = await battleBridge.init();

    const badgeLabel = runtime === 'cpp-wasm' ? 'C++ WASM CORE READY' : 'JS CORE READY';
    fillBar.setFillStyle(runtime === 'cpp-wasm' ? 0x10b981 : 0xf59e0b);
    setProgress(1.0, badgeLabel);

    this.time.delayedCall(260, () => {
      this.scene.start('BattleScene', { runtime });
    });
  }
}
