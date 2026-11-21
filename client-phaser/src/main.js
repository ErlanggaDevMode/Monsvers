import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { BattleScene } from './scenes/BattleScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 540,
  backgroundColor: '#111827',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, BattleScene],
};

new Phaser.Game(config);
