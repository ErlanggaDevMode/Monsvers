import Phaser from 'phaser';
import { battleBridge, Element } from '../bridge/battleBridge.js';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.runtime = data?.runtime ?? battleBridge.runtime;
    this.isBusy = false;

    this.player = {
      id: 'pyro_01',
      name: 'Pyrofang',
      element: Element.Fire,
      level: 5,
      maxHp: 120,
      currentHp: 120,
      attack: 28,
      defense: 16,
      speed: 22,
    };

    this.enemy = {
      id: 'leaf_01',
      name: 'Verdantix',
      element: Element.Nature,
      level: 5,
      maxHp: 115,
      currentHp: 115,
      attack: 24,
      defense: 17,
      speed: 19,
    };

    this.skills = [
      { id: 'ember_claw', name: 'Ember Claw', element: Element.Fire, power: 40, accuracy: 100, critRatePct: 15 },
      { id: 'tackle', name: 'Quick Strike', element: Element.Neutral, power: 30, accuracy: 100, critRatePct: 20 },
    ];
  }

  create() {
    const { width, height } = this.scale;

    // Arena backdrop
    this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);
    this.add.ellipse(250, 330, 220, 60, 0x1e293b);
    this.add.ellipse(710, 240, 220, 60, 0x1e293b);

    // Header
    this.add.text(24, 18, 'MONSVERS: THE BATTLE MONSTER', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f8fafc',
    });
    this.add
      .text(width - 24, 22, `Core: ${this.runtime}`, {
        fontSize: '13px',
        color: '#94a3b8',
      })
      .setOrigin(1, 0);

    // Monster placeholders (ready to swap with sprite sheets)
    this.playerSprite = this.add.circle(250, 275, 52, 0xef4444).setStrokeStyle(4, 0xfca5a5);
    this.enemySprite = this.add.circle(710, 185, 52, 0x22c55e).setStrokeStyle(4, 0x86efac);

    this.playerHpText = this.add.text(140, 180, '', { fontSize: '16px', color: '#f8fafc', fontStyle: 'bold' });
    this.enemyHpText = this.add.text(600, 90, '', { fontSize: '16px', color: '#f8fafc', fontStyle: 'bold' });

    // Battle log panel
    this.add.rectangle(width / 2, height - 72, width - 48, 112, 0x1e293b).setStrokeStyle(2, 0x334155);
    this.logText = this.add.text(44, height - 114, 'Pilih skill untuk menyerang Verdantix!', {
      fontSize: '16px',
      color: '#e2e8f0',
      wordWrap: { width: 520 },
    });

    // Action buttons
    this.skills.forEach((skill, idx) => {
      const btnX = 690 + idx * 135;
      const btnY = height - 72;
      const bg = this.add
        .rectangle(btnX, btnY, 122, 48, idx === 0 ? 0xdc2626 : 0x334155)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x94a3b8);

      this.add.text(btnX, btnY, skill.name, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      bg.on('pointerdown', () => this.handlePlayerSkill(skill));
    });

    this.refreshHud();
  }

  refreshHud() {
    this.playerHpText.setText(`${this.player.name} Lv.${this.player.level}\nHP: ${this.player.currentHp}/${this.player.maxHp}`);
    this.enemyHpText.setText(`${this.enemy.name} Lv.${this.enemy.level}\nHP: ${this.enemy.currentHp}/${this.enemy.maxHp}`);
  }

  handlePlayerSkill(skill) {
    if (this.isBusy || this.player.currentHp <= 0 || this.enemy.currentHp <= 0) return;
    this.isBusy = true;

    const isCrit = Math.random() * 100 < skill.critRatePct;
    const report = battleBridge.calculateDamage(this.player, this.enemy, skill, isCrit);
    this.enemy.currentHp = report.targetRemainingHp;

    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0.25,
      yoyo: true,
      repeat: 2,
      duration: 80,
    });

    const eff = report.elementMultiplier > 1 ? ' (Super Effective!)' : '';
    const crit = report.critical ? ' CRITICAL!' : '';
    this.logText.setText(`${this.player.name} memakai ${skill.name}! Damage: ${report.damage}${eff}${crit}`);
    this.refreshHud();

    if (report.targetFainted) {
      this.logText.setText(`${this.enemy.name} tumbang! ${this.player.name} MENANG!`);
      this.isBusy = false;
      return;
    }

    // Enemy counterattack
    this.time.delayedCall(650, () => {
      const enemySkill = { id: 'vine_whip', name: 'Vine Lash', element: Element.Nature, power: 36, accuracy: 100, critRatePct: 10 };
      const counter = battleBridge.calculateDamage(this.enemy, this.player, enemySkill, false);
      this.player.currentHp = counter.targetRemainingHp;

      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0.25,
        yoyo: true,
        repeat: 2,
        duration: 80,
      });

      this.refreshHud();
      if (counter.targetFainted) {
        this.logText.setText(`${this.player.name} tumbang! Coba lagi.`);
      } else {
        this.logText.setText(`${this.enemy.name} membalas dengan ${enemySkill.name} (${counter.damage} dmg). Giliranmu!`);
      }
      this.isBusy = false;
    });
  }
}
