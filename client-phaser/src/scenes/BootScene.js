import Phaser from 'phaser';
import { battleBridge } from '../bridge/battleBridge.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  async create() {
    const { width, height } = this.scale;
    const loadingText = this.add
      .text(width / 2, height / 2, 'Loading Monsvers Battle Engine...', {
        fontSize: '24px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const runtime = await battleBridge.init();
    loadingText.setText(`Engine ready (${runtime})`);

    this.time.delayedCall(250, () => {
      this.scene.start('BattleScene', { runtime });
    });
  }
}
