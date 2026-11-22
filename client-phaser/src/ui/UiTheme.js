import { Element } from '../bridge/battleBridge.js';

export const FONTS = Object.freeze({
  display: '"Silkscreen", "Chakra Petch", ui-monospace, monospace',
  ui: '"Chakra Petch", ui-monospace, SFMono-Regular, monospace',
  mono: '"Chakra Petch", ui-monospace, SFMono-Regular, monospace',
});

export const ELEMENT_STYLE = Object.freeze({
  [Element.Neutral]: {
    label: 'NEUT',
    color: 0x94a3b8,
    hex: '#cbd5e1',
    bg: 0x334155,
    glow: 0xe2e8f0,
    iconKey: 'icon_el_0',
  },
  [Element.Fire]: {
    label: 'FIRE',
    color: 0xf97316,
    hex: '#fb923c',
    bg: 0x7c2d12,
    glow: 0xfdba74,
    iconKey: 'icon_el_1',
  },
  [Element.Water]: {
    label: 'WATER',
    color: 0x38bdf8,
    hex: '#38bdf8',
    bg: 0x0c4a6e,
    glow: 0xbae6fd,
    iconKey: 'icon_el_2',
  },
  [Element.Nature]: {
    label: 'NATURE',
    color: 0x22c55e,
    hex: '#4ade80',
    bg: 0x14532d,
    glow: 0x86efac,
    iconKey: 'icon_el_3',
  },
  [Element.Electric]: {
    label: 'ELEC',
    color: 0xfacc15,
    hex: '#fde047',
    bg: 0x713f12,
    glow: 0xfef08a,
    iconKey: 'icon_el_4',
  },
  [Element.Shadow]: {
    label: 'SHADOW',
    color: 0xa855f7,
    hex: '#c084fc',
    bg: 0x3b0764,
    glow: 0xe9d5ff,
    iconKey: 'icon_el_5',
  },
});

/**
 * Draws a layered HD-2D RPG dark-glass slate panel with bevel rim,
 * subtle vertical glass sheen, metallic corner rivets, and optional glowing accent top bar.
 */
export function drawRpgPanel(scene, x, y, w, h, opts = {}) {
  const {
    fill = 0x0b1324,
    fillBottom = 0x070d1b,
    alpha = 0.94,
    border = 0x3b527a,
    borderHighlight = 0x64748b,
    outer = 0x03060d,
    accent = null,
    depth = 20,
    rivets = true,
    shadow = true,
    graphics = null,
  } = opts;

  const g = graphics || scene.add.graphics().setDepth(depth);

  // Subtle grounded drop shadow
  if (shadow) {
    g.fillStyle(0x020617, 0.55);
    g.fillRect(x + 2, y + 3, w + 1, h + 1);
  }

  // Crisp 1px obsidian outer frame
  g.fillStyle(outer, 1);
  g.fillRect(x - 1, y - 1, w + 2, h + 2);

  // Main metallic bevel border
  g.fillStyle(border, 1);
  g.fillRect(x, y, w, h);

  // Top & left metallic highlight edge for HD-2D depth
  g.fillStyle(borderHighlight, 0.45);
  g.fillRect(x, y, w, 1);
  g.fillRect(x, y, 1, h);

  // Bottom & right metallic shadow edge
  g.fillStyle(0x020617, 0.55);
  g.fillRect(x, y + h - 1, w, 1);
  g.fillRect(x + w - 1, y, 1, h);

  // Layered dark-glass slate interior (gradient when supported, solid fallback)
  const ix = x + 2;
  const iy = y + 2;
  const iw = Math.max(0, w - 4);
  const ih = Math.max(0, h - 4);

  if (typeof g.fillGradientStyle === 'function') {
    g.fillGradientStyle(fill, fill, fillBottom, fillBottom, alpha, alpha, alpha, alpha);
    g.fillRect(ix, iy, iw, ih);
  } else {
    g.fillStyle(fill, alpha);
    g.fillRect(ix, iy, iw, ih);
  }

  // Subtle upper glass sheen band
  const sheenH = Math.max(2, Math.floor(ih * 0.32));
  g.fillStyle(0xffffff, 0.045);
  g.fillRect(ix, iy, iw, sheenH);

  // Top inner light rim & bottom inner shadow
  g.fillStyle(0xe2e8f0, 0.16);
  g.fillRect(ix, iy, iw, 1);
  g.fillStyle(0xffffff, 0.08);
  g.fillRect(ix, iy + 1, iw, 1);

  g.fillStyle(0x020617, 0.52);
  g.fillRect(ix, y + h - 4, iw, 2);

  // Optional glowing elemental top bar + subtle light bleed
  if (accent !== null) {
    g.fillStyle(accent, 0.18);
    g.fillRect(ix, iy + 3, iw, 4);
    g.fillStyle(accent, 1);
    g.fillRect(ix, iy, iw, 3);
    g.fillStyle(0xffffff, 0.42);
    g.fillRect(ix, iy, iw, 1);
  }

  // Crisp metallic corner rivets (2-tone recessed + specular)
  if (rivets && w >= 20 && h >= 20) {
    const rivetYTop = accent !== null ? y + 6 : y + 4;
    const rivetYBot = y + h - 6;
    const rivetXLeft = x + 4;
    const rivetXRight = x + w - 6;
    const coords = [
      [rivetXLeft, rivetYTop],
      [rivetXRight, rivetYTop],
      [rivetXLeft, rivetYBot],
      [rivetXRight, rivetYBot],
    ];
    for (const [rx, ry] of coords) {
      g.fillStyle(0x020617, 0.85);
      g.fillRect(rx, ry, 3, 3);
      g.fillStyle(0x64748b, 0.85);
      g.fillRect(rx, ry, 2, 2);
      g.fillStyle(0xe2e8f0, 0.75);
      g.fillRect(rx, ry, 1, 1);
    }
  }

  return g;
}

/**
 * Draws a crisp RPG stat bar (HP/SP/XP) with pixel end-caps, optional white trailing damage bar,
 * and glossy top reflection highlight.
 */
export function drawStatBar(gfx, x, y, w, h, ratio, fillColor, bgColor = 0x09111f, opts = {}) {
  const {
    trailRatio = null,
    trailColor = 0xf8fafc,
    borderColor = 0x020617,
    capColor = 0x475569,
  } = opts;

  const clamped = Math.max(0, Math.min(1, ratio));
  const clampedTrail = trailRatio === null || trailRatio === undefined
    ? clamped
    : Math.max(clamped, Math.min(1, trailRatio));

  // Crisp outer pixel border
  gfx.fillStyle(borderColor, 1);
  gfx.fillRect(x - 1, y - 1, w + 2, h + 2);

  // Subtle metallic pixel end-caps on outer left/right edges
  gfx.fillStyle(capColor, 0.85);
  gfx.fillRect(x - 1, y, 1, h);
  gfx.fillRect(x + w, y, 1, h);

  // Recessed track background + top inner shadow
  gfx.fillStyle(bgColor, 1);
  gfx.fillRect(x, y, w, h);
  gfx.fillStyle(0x020617, 0.45);
  gfx.fillRect(x, y, w, Math.min(2, h));

  // Optional white trailing damage bar
  const fw = Math.round(w * clamped);
  const trailW = Math.round(w * clampedTrail);
  if (trailW > fw) {
    gfx.fillStyle(trailColor, 0.92);
    gfx.fillRect(x + fw, y, trailW - fw, h);
    gfx.fillStyle(0xffffff, 0.5);
    gfx.fillRect(x + fw, y, trailW - fw, Math.max(1, Math.floor(h / 3)));
  }

  // Main filled bar with glossy top highlight & bottom shade
  if (fw > 0) {
    gfx.fillStyle(fillColor, 1);
    gfx.fillRect(x, y, fw, h);

    // Glossy top reflection strip
    const glossH = Math.max(1, Math.floor(h / 3));
    gfx.fillStyle(0xffffff, 0.34);
    gfx.fillRect(x, y, fw, glossH);

    // Subtle lower shadow strip for cylindrical depth
    if (h >= 5) {
      gfx.fillStyle(0x020617, 0.28);
      gfx.fillRect(x, y + h - 1, fw, 1);
    }

    // Crisp leading edge specular highlight when partially filled
    if (fw >= 3 && fw < w) {
      gfx.fillStyle(0xffffff, 0.65);
      gfx.fillRect(x + fw - 1, y, 1, h);
    }
  }
}

/**
 * Draws a compact beveled RPG badge/pill (element, level, phase, or status).
 */
export function drawBeveledBadge(scene, x, y, w, h, opts = {}) {
  const {
    fill = 0x162440,
    border = 0x38bdf8,
    outer = 0x020617,
    alpha = 0.96,
    depth = 24,
    graphics = null,
  } = opts;

  const g = graphics || scene.add.graphics().setDepth(depth);
  g.fillStyle(outer, 0.95);
  g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle(border, 1);
  g.fillRect(x, y, w, h);
  g.fillStyle(fill, alpha);
  g.fillRect(x + 1, y + 1, Math.max(0, w - 2), Math.max(0, h - 2));
  g.fillStyle(0xffffff, 0.22);
  g.fillRect(x + 1, y + 1, Math.max(0, w - 2), 1);
  return g;
}

/**
 * Draws a sleek 2px beveled horizontal divider with an optional center accent jewel.
 */
export function drawDivider(gfx, x, y, w, opts = {}) {
  const {
    color = 0x334155,
    highlight = 0x94a3b8,
    accent = null,
    alpha = 0.85,
  } = opts;

  gfx.fillStyle(0x020617, 0.65);
  gfx.fillRect(x, y + 1, w, 1);
  gfx.fillStyle(color, alpha);
  gfx.fillRect(x, y, w, 1);
  gfx.fillStyle(highlight, 0.28);
  gfx.fillRect(x + 4, y, Math.max(0, w - 8), 1);

  if (accent !== null && w >= 24) {
    const cx = Math.round(x + w / 2);
    gfx.fillStyle(accent, 1);
    gfx.fillRect(cx - 2, y - 1, 4, 3);
    gfx.fillStyle(0xffffff, 0.65);
    gfx.fillRect(cx - 1, y - 1, 2, 1);
  }
}

/**
 * Creates a tactile 3D RPG button with 3px bottom lip, hover highlight,
 * press depress (+2px), and optional left icon texture.
 */
export function createRpgButton(scene, x, y, w, h, opts = {}) {
  const {
    label = 'BUTTON',
    fill = 0x1e293b,
    hover = 0x334155,
    border = 0x64748b,
    hoverBorder = 0x94a3b8,
    lip = 0x090f1d,
    textColor = '#f8fafc',
    fontSize = '11px',
    fontFamily = FONTS.display,
    depth = 20,
    iconKey = null,
    iconScale = 1,
    iconGap = 6,
    onClick = null,
  } = opts;

  let baseFill = fill;
  let baseHover = hover;
  let baseBorder = border;
  let enabled = true;
  let pressed = false;
  let hovered = false;

  const container = scene.add.container(x, y).setDepth(depth);

  // Outer drop shadow + crisp 3px 3D bottom lip
  const outerShadow = scene.add.rectangle(0, 4, w + 2, h + 2, 0x020617, 0.72);
  const lipRect = scene.add.rectangle(0, 3, w, h, lip, 1).setStrokeStyle(1, 0x020617, 0.9);
  const bg = scene.add
    .rectangle(0, 0, w, h, baseFill, 1)
    .setStrokeStyle(2, baseBorder)
    .setInteractive({ useHandCursor: true });

  const shineY = -h / 2 + 2;
  const bevelY = h / 2 - 2;
  const shine = scene.add.rectangle(0, shineY, Math.max(4, w - 6), 2, 0xffffff, 0.24);
  const bottomBevel = scene.add.rectangle(0, bevelY, Math.max(4, w - 6), 2, 0x020617, 0.35);

  const txt = scene.add
    .text(0, 0, label, {
      fontFamily,
      fontSize,
      fontStyle: 'bold',
      color: textColor,
    })
    .setOrigin(0.5);

  let icon = null;
  if (typeof iconKey === 'string' && iconKey && scene.textures?.exists(iconKey)) {
    icon = scene.add.image(0, 0, iconKey).setScale(iconScale).setOrigin(0.5);
  }

  const children = [outerShadow, lipRect, bg, shine, bottomBevel];
  if (icon) children.push(icon);
  children.push(txt);
  container.add(children);

  const layoutContent = () => {
    if (!icon) {
      txt.x = 0;
      return;
    }
    const iconW = icon.displayWidth || 12;
    const textW = txt.width || 0;
    const totalW = iconW + iconGap + textW;
    const leftEdge = -totalW / 2;
    icon.x = Math.round(leftEdge + iconW / 2);
    txt.x = Math.round(leftEdge + iconW + iconGap + textW / 2);
  };
  layoutContent();

  const applyVisualState = () => {
    const dy = pressed ? 2 : 0;
    bg.y = dy;
    shine.y = shineY + dy;
    bottomBevel.y = bevelY + dy;
    txt.y = dy;
    if (icon) icon.y = dy;

    if (!enabled) {
      bg.setFillStyle(baseFill);
      bg.setStrokeStyle(2, baseBorder);
      shine.setAlpha(0.12);
      return;
    }

    bg.setFillStyle(hovered ? baseHover : baseFill);
    bg.setStrokeStyle(2, hovered ? hoverBorder : baseBorder);
    shine.setAlpha(pressed ? 0.14 : hovered ? 0.34 : 0.24);
  };

  bg.on('pointerover', () => {
    if (!enabled) return;
    hovered = true;
    applyVisualState();
  });

  bg.on('pointerout', () => {
    hovered = false;
    pressed = false;
    applyVisualState();
  });

  bg.on('pointerdown', () => {
    if (!enabled) return;
    pressed = true;
    applyVisualState();
    if (typeof onClick === 'function') onClick();
  });

  bg.on('pointerup', () => {
    if (!enabled) return;
    pressed = false;
    applyVisualState();
  });

  return {
    container,
    bg,
    txt,
    icon,
    setLabel: (t) => {
      txt.setText(t);
      layoutContent();
    },
    setEnabled: (val) => {
      enabled = Boolean(val);
      if (!enabled) {
        hovered = false;
        pressed = false;
      }
      container.setAlpha(enabled ? 1 : 0.45);
      applyVisualState();
    },
    setStyle: (newFill, newBorder, newTextColor, newHover) => {
      if (newFill !== undefined) baseFill = newFill;
      if (newBorder !== undefined) baseBorder = newBorder;
      if (newHover !== undefined) baseHover = newHover;
      if (newTextColor !== undefined) txt.setColor(newTextColor);
      applyVisualState();
    },
  };
}
