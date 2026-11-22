import { audioManager } from '../audio/audioManager.js';

const FONT = 'monospace';
const TYPE_DELAY_MS = 22;
const BASE_DEPTH = 200;
const BLIP_CHAR_INTERVAL = 3;

const PORTRAIT_SIZE = 72;
const PORTRAIT_TARGET_SCALE = 1.4;

const SPEAKER_THEMES = {
  orin: { bg: 0x0c4a6e, border: 0x38bdf8, text: '#7dd3fc', badgeFill: 0x082f49 },
  kael: { bg: 0x7c2d12, border: 0xf97316, text: '#fdba74', badgeFill: 0x431407 },
  umbravex: { bg: 0x3b0764, border: 0xa855f7, text: '#e9d5ff', badgeFill: 0x2e1065 },
  warden: { bg: 0x7f1d1d, border: 0xef4444, text: '#fecaca', badgeFill: 0x450a0a },
  player: { bg: 0x064e3b, border: 0x10b981, text: '#6ee7b7', badgeFill: 0x022c22 },
  default: { bg: 0x1e293b, border: 0x64748b, text: '#f1f5f9', badgeFill: 0x0f172a },
};

function getSpeakerTheme(speaker = '') {
  const s = String(speaker).toLowerCase();
  if (s.includes('orin')) return SPEAKER_THEMES.orin;
  if (s.includes('kael')) return SPEAKER_THEMES.kael;
  if (s.includes('umbravex')) return SPEAKER_THEMES.umbravex;
  if (s.includes('warden')) return SPEAKER_THEMES.warden;
  if (s.includes('player') || s.includes('tamer') || s.includes('kamu') || s.includes('hero')) {
    return SPEAKER_THEMES.player;
  }
  return SPEAKER_THEMES.default;
}

function getSpeakerInitial(speaker = '') {
  const cleaned = String(speaker)
    .replace(/^(prof\.|dr\.|rival|rift)\s+/i, '')
    .trim();
  return (cleaned[0] || '?').toUpperCase();
}

export class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this._active = false;
    this._lines = [];
    this._lineIndex = 0;
    this._fullText = '';
    this._charIndex = 0;
    this._blipCounter = 0;
    this._isTyping = false;

    this._layout = null;

    this._resolve = null;
    this._typeEvent = null;
    this._cursorTween = null;
    this._elements = [];

    this._portraitImage = null;
    this._portraitFallbackBg = null;
    this._portraitFallbackTxt = null;
    this._speakerPillGfx = null;
    this._speakerText = null;
    this._bodyText = null;
    this._cursorText = null;
    this._progressText = null;
    this._cardGfx = null;

    this._onShutdown = () => this._finish();
    this._onKeyDown = (event) => {
      if (!this._active) return;
      if (event.code === 'Space' || event.code === 'Enter') {
        this._handleAdvanceTap();
      } else if (event.code === 'Escape') {
        audioManager.playSfx('click');
        this._finish();
      }
    };
  }

  _computeLayout() {
    const width = this.scene.scale?.width ?? 640;
    const height = this.scene.scale?.height ?? 360;

    // Optimized for 640x360 Landscape: card { x: 24, y: 238, w: 592, h: 110 }
    const cardW = Math.min(592, Math.max(280, width - 48));
    const cardH = Math.min(110, Math.max(92, height - 250));
    const cardX = Math.round((width - cardW) / 2);
    const cardY = Math.round(height - cardH - 12);

    const portraitSize = PORTRAIT_SIZE;
    const portraitPadX = 16;
    const portraitX = cardX + portraitPadX + portraitSize / 2;
    const portraitY = cardY + Math.round(cardH / 2);

    const bodyX = cardX + portraitPadX + portraitSize + 16;
    const bodyY = cardY + 16;
    const bodyWrapW = Math.max(140, cardW - (bodyX - cardX) - 24);

    return {
      width,
      height,
      cardX,
      cardY,
      cardW,
      cardH,
      portraitSize,
      portraitX,
      portraitY,
      bodyX,
      bodyY,
      bodyWrapW,
    };
  }

  async play(lines = []) {
    if (!Array.isArray(lines) || lines.length === 0) return;
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

    // Clean up any previous overlay before starting a new one
    if (this._active) {
      this._finish();
    }

    this._lines = lines.filter((l) => l && typeof l.text === 'string');
    if (this._lines.length === 0) return;

    this._active = true;
    this._lineIndex = 0;

    return new Promise((resolve) => {
      this._resolve = resolve;

      this.scene.events.once('shutdown', this._onShutdown);
      this.scene.events.once('destroy', this._onShutdown);
      this.scene.input?.keyboard?.on('keydown', this._onKeyDown);

      this._buildOverlay();
      this._showLine(0);
    });
  }

  _track(obj) {
    if (obj) this._elements.push(obj);
    return obj;
  }

  _buildOverlay() {
    const layout = this._computeLayout();
    this._layout = layout;
    const {
      width,
      height,
      cardX,
      cardY,
      cardW,
      cardH,
      portraitSize,
      portraitX,
      portraitY,
      bodyX,
      bodyY,
      bodyWrapW,
    } = layout;

    // 1. Full-screen semi-transparent backdrop dimmer blocking underlying scene clicks
    const backdrop = this._track(
      this.scene.add
        .rectangle(width / 2, height / 2, width, height, 0x050811, 0.62)
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH)
        .setInteractive({ useHandCursor: true })
    );

    backdrop.on('pointerdown', () => {
      this._handleAdvanceTap();
    });

    // 2. Wide bottom pixel-bordered dialogue card (640x360 -> x: 24, y: 238, w: 592, h: 110)
    this._cardGfx = this._track(
      this.scene.add.graphics().setScrollFactor(0).setDepth(BASE_DEPTH + 1)
    );
    this._drawCardFrame(0x3b4f78);

    // 3. Color-coded Speaker Name Pill above card (left side)
    this._speakerPillGfx = this._track(
      this.scene.add.graphics().setScrollFactor(0).setDepth(BASE_DEPTH + 2)
    );
    this._speakerText = this._track(
      this.scene.add
        .text(cardX + 20, cardY - 12, '', {
          fontFamily: FONT,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH + 3)
    );

    // 4. SKIP >> button at top-right of dialogue card
    const skipW = 74;
    const skipH = 22;
    const skipX = cardX + cardW - skipW / 2 - 4;
    const skipY = cardY - 12;

    const skipBg = this._track(
      this.scene.add
        .rectangle(skipX, skipY, skipW, skipH, 0x16223a)
        .setStrokeStyle(2, 0x475569)
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH + 4)
        .setInteractive({ useHandCursor: true })
    );

    const skipTxt = this._track(
      this.scene.add
        .text(skipX, skipY, 'SKIP >>', {
          fontFamily: FONT,
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#cbd5e1',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH + 5)
    );

    skipBg.on('pointerover', () => {
      skipBg.setFillStyle(0x233354);
      skipTxt.setColor('#ffffff');
    });
    skipBg.on('pointerout', () => {
      skipBg.setFillStyle(0x16223a);
      skipTxt.setColor('#cbd5e1');
    });
    skipBg.on('pointerdown', (_pointer, _localX, _localY, event) => {
      event?.stopPropagation?.();
      audioManager.playSfx('click');
      this._finish();
    });

    // 5. Left portrait frame (72x72 centered vertically inside left of card)
    const portraitFrame = this._track(
      this.scene.add.graphics().setScrollFactor(0).setDepth(BASE_DEPTH + 2)
    );
    const pLeft = portraitX - portraitSize / 2;
    const pTop = portraitY - portraitSize / 2;
    portraitFrame.fillStyle(0x3b4f78, 1);
    portraitFrame.fillRect(pLeft - 2, pTop - 2, portraitSize + 4, portraitSize + 4);
    portraitFrame.fillStyle(0x090e1a, 1);
    portraitFrame.fillRect(pLeft, pTop, portraitSize, portraitSize);

    this._portraitFallbackBg = this._track(
      this.scene.add
        .rectangle(portraitX, portraitY, portraitSize - 4, portraitSize - 4, 0x1e293b)
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH + 3)
        .setVisible(false)
    );

    this._portraitFallbackTxt = this._track(
      this.scene.add
        .text(portraitX, portraitY, '?', {
          fontFamily: FONT,
          fontSize: '28px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH + 4)
        .setVisible(false)
    );

    // 6. Dialogue body text (typewriter target)
    this._bodyText = this._track(
      this.scene.add
        .text(bodyX, bodyY, '', {
          fontFamily: FONT,
          fontSize: '13px',
          color: '#f1f5f9',
          lineSpacing: 5,
          wordWrap: { width: bodyWrapW, useAdvancedWrap: true },
        })
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH + 3)
    );

    // 7. Line progress indicator at bottom-right (beside next cursor)
    this._progressText = this._track(
      this.scene.add
        .text(cardX + cardW - 36, cardY + cardH - 16, '', {
          fontFamily: FONT,
          fontSize: '10px',
          color: '#64748b',
        })
        .setOrigin(1, 0.5)
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH + 3)
    );

    // 8. Blinking ▼ next-indicator at bottom-right of dialogue box
    this._cursorText = this._track(
      this.scene.add
        .text(cardX + cardW - 18, cardY + cardH - 16, '▼', {
          fontFamily: FONT,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#38bdf8',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH + 3)
        .setVisible(false)
    );

    this._cursorTween = this.scene.tweens.add({
      targets: this._cursorText,
      alpha: 0.2,
      yoyo: true,
      repeat: -1,
      duration: 460,
    });
  }

  _drawCardFrame(accentColor) {
    if (!this._cardGfx || !this._layout) return;
    const { cardX, cardY, cardW, cardH } = this._layout;
    this._cardGfx.clear();

    // Subtle drop shadow
    this._cardGfx.fillStyle(0x020617, 0.72);
    this._cardGfx.fillRect(cardX + 3, cardY + 4, cardW, cardH);

    // Outer crisp pixel border
    this._cardGfx.fillStyle(accentColor, 1);
    this._cardGfx.fillRect(cardX, cardY, cardW, cardH);

    // Inner dark frame border
    this._cardGfx.fillStyle(0x1e293b, 1);
    this._cardGfx.fillRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4);

    // Main slate body
    this._cardGfx.fillStyle(0x0f172a, 0.97);
    this._cardGfx.fillRect(cardX + 4, cardY + 4, cardW - 8, cardH - 8);

    // Top rim highlight for semi-modern HD-2D feel
    this._cardGfx.fillStyle(0x94a3b8, 0.3);
    this._cardGfx.fillRect(cardX + 4, cardY + 4, cardW - 8, 2);
  }

  _drawSpeakerPill(speaker, theme) {
    if (!this._speakerPillGfx || !this._speakerText || !this._layout) return;
    const { cardX, cardY, cardW } = this._layout;
    const label = String(speaker || 'Narrator').trim();
    this._speakerText.setText(label).setColor(theme.text);

    const maxPillW = Math.max(120, cardW - 110);
    const pillW = Math.max(88, Math.min(maxPillW, Math.ceil(this._speakerText.width) + 24));
    const pillH = 24;
    const pillX = cardX + 8;
    const pillY = cardY - 24;

    this._speakerPillGfx.clear();
    // Outer pixel border
    this._speakerPillGfx.fillStyle(theme.border, 1);
    this._speakerPillGfx.fillRect(pillX, pillY, pillW, pillH);
    // Inner fill
    this._speakerPillGfx.fillStyle(theme.bg, 1);
    this._speakerPillGfx.fillRect(pillX + 2, pillY + 2, pillW - 4, pillH - 4);
    // Top rim highlight
    this._speakerPillGfx.fillStyle(0xffffff, 0.16);
    this._speakerPillGfx.fillRect(pillX + 2, pillY + 2, pillW - 4, 2);

    this._speakerText.setPosition(pillX + 12, pillY + pillH / 2);
  }

  _updatePortrait(line, theme) {
    if (!this._layout) return;
    const { portraitX, portraitY, portraitSize } = this._layout;

    if (this._portraitImage) {
      this._portraitImage.destroy();
      this._portraitImage = null;
    }

    const key = line?.portrait;
    if (typeof key === 'string' && key && this.scene.textures?.exists(key)) {
      this._portraitFallbackBg.setVisible(false);
      this._portraitFallbackTxt.setVisible(false);

      const img = this.scene.add
        .image(portraitX, portraitY, key)
        .setScrollFactor(0)
        .setDepth(BASE_DEPTH + 3);

      const maxDim = portraitSize - 4;
      const fitScale = Math.min(maxDim / Math.max(1, img.width), maxDim / Math.max(1, img.height));
      const scale = Math.min(PORTRAIT_TARGET_SCALE, fitScale);
      img.setScale(scale);
      this._portraitImage = img;
    } else {
      this._portraitFallbackBg
        .setFillStyle(theme.badgeFill)
        .setStrokeStyle(1, theme.border)
        .setVisible(true);
      this._portraitFallbackTxt
        .setText(getSpeakerInitial(line?.speaker))
        .setColor(theme.text)
        .setVisible(true);
    }
  }

  _showLine(index) {
    if (!this._active) return;
    if (index >= this._lines.length) {
      this._finish();
      return;
    }

    this._stopTypewriter();
    this._lineIndex = index;

    const line = this._lines[index];
    const theme = getSpeakerTheme(line.speaker);

    this._drawCardFrame(theme.border);
    this._drawSpeakerPill(line.speaker, theme);
    this._updatePortrait(line, theme);
    this._progressText.setText(`${index + 1}/${this._lines.length}`);
    this._cursorText.setColor(theme.text).setVisible(false);

    this._fullText = String(line.text ?? '');
    this._charIndex = 0;
    this._blipCounter = 0;
    this._bodyText.setText('');

    if (this._fullText.length === 0) {
      this._completeCurrentLine();
      return;
    }

    this._isTyping = true;
    this._typeEvent = this.scene.time.addEvent({
      delay: TYPE_DELAY_MS,
      loop: true,
      callback: () => {
        if (!this._active) return;
        this._charIndex += 1;
        const ch = this._fullText[this._charIndex - 1];
        this._bodyText.setText(this._fullText.slice(0, this._charIndex));

        if (ch && !/\s/.test(ch)) {
          this._blipCounter += 1;
          if (this._blipCounter % BLIP_CHAR_INTERVAL === 1) {
            audioManager.playSfx('click');
          }
        }

        if (this._charIndex >= this._fullText.length) {
          this._completeCurrentLine();
        }
      },
    });
  }

  _stopTypewriter() {
    if (this._typeEvent) {
      this._typeEvent.remove(false);
      this._typeEvent = null;
    }
    this._isTyping = false;
  }

  _completeCurrentLine() {
    this._stopTypewriter();
    if (this._bodyText) {
      this._bodyText.setText(this._fullText);
    }
    if (this._cursorText) {
      this._cursorText.setVisible(true);
    }
  }

  _handleAdvanceTap() {
    if (!this._active) return;
    if (this._isTyping) {
      this._completeCurrentLine();
      return;
    }
    audioManager.playSfx('click');
    this._showLine(this._lineIndex + 1);
  }

  _finish() {
    if (!this._active && !this._resolve) return;
    this._active = false;
    this._stopTypewriter();

    if (this._cursorTween) {
      this._cursorTween.stop();
      this._cursorTween = null;
    }

    this.scene?.events?.off('shutdown', this._onShutdown);
    this.scene?.events?.off('destroy', this._onShutdown);
    this.scene?.input?.keyboard?.off('keydown', this._onKeyDown);

    if (this._portraitImage) {
      this._portraitImage.destroy();
      this._portraitImage = null;
    }

    for (const el of this._elements) {
      if (el && typeof el.destroy === 'function') {
        el.destroy();
      }
    }
    this._elements = [];

    this._portraitFallbackBg = null;
    this._portraitFallbackTxt = null;
    this._speakerPillGfx = null;
    this._speakerText = null;
    this._bodyText = null;
    this._cursorText = null;
    this._progressText = null;
    this._cardGfx = null;
    this._layout = null;

    const resolve = this._resolve;
    this._resolve = null;
    if (resolve) resolve();
  }

  destroy() {
    this._finish();
  }
}
