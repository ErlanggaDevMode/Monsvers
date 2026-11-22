import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { StarterSelectScene } from './scenes/StarterSelectScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';
import { BattleScene } from './scenes/BattleScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 360,
  height: 640,
  backgroundColor: '#090e1a',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  render: {
    pixelArt: true,
    roundPixels: true,
    antialias: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, StarterSelectScene, WorldMapScene, BattleScene],
};

new Phaser.Game(config);
