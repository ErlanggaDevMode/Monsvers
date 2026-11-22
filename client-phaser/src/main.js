import Phaser from 'phaser';
import { audioManager } from './audio/audioManager.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { StarterSelectScene } from './scenes/StarterSelectScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';
import { BattleScene } from './scenes/BattleScene.js';

// Best-effort WebAudio unlock on first user interaction
const unlockAudioOnce = () => {
  try {
    audioManager.unlock();
  } catch {
    // Ignore audio unlock errors on restricted environments
  }
};
window.addEventListener('pointerdown', unlockAudioOnce, { once: true, passive: true });
window.addEventListener('touchstart', unlockAudioOnce, { once: true, passive: true });
window.addEventListener('keydown', unlockAudioOnce, { once: true, passive: true });

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 640,
  height: 360,
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
