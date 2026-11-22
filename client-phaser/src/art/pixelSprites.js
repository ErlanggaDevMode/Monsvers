import { MONSTERS } from '../data/monsters.js';
import { Element } from '../bridge/battleBridge.js';

/**
 * Returns texture key for a given monster and animation frame.
 * @param {string} id
 * @param {number} frame
 * @returns {string}
 */
export function getMonsterTextureKey(id, frame = 0) {
  return `monsver_${id}_${frame}`;
}

/**
 * Returns dark silhouette texture key for unseen Monsverdex entries
 * (works identically in both WebGL and Canvas Phaser renderers).
 * @param {string} id
 * @returns {string}
 */
export function getMonsterSilhouetteKey(id) {
  return `monsver_${id}_sil`;
}

// Color utility helpers for tinting / shading
function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.min(255, Math.max(0, Math.round(x))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function lighten(hex, amt = 0.32) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}

function darken(hex, amt = 0.42) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}

/**
 * High-craft 32x32 pixel-art rasterizer with directional cel-shading
 * and automatic 1px element-tinted colored outline.
 */
class PixelGrid {
  constructor(w = 32, h = 32) {
    this.w = w;
    this.h = h;
    this.cells = Array.from({ length: h }, () => Array(w).fill(null));
  }

  get(x, y) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || ix >= this.w || iy < 0 || iy >= this.h) return null;
    return this.cells[iy][ix];
  }

  set(x, y, ch) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 1 || ix >= this.w - 1 || iy < 1 || iy >= this.h - 1) return;
    this.cells[iy][ix] = ch;
  }

  setRaw(x, y, ch) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || ix >= this.w || iy < 0 || iy >= this.h) return;
    this.cells[iy][ix] = ch;
  }

  rect(x, y, w, h, ch) {
    const x0 = Math.round(x);
    const y0 = Math.round(y);
    for (let py = y0; py < y0 + Math.round(h); py++) {
      for (let px = x0; px < x0 + Math.round(w); px++) {
        this.set(px, py, ch);
      }
    }
  }

  ellipse(cx, cy, rx, ry, ch) {
    const minX = Math.floor(cx - rx - 1);
    const maxX = Math.ceil(cx + rx + 1);
    const minY = Math.floor(cy - ry - 1);
    const maxY = Math.ceil(cy + ry + 1);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) {
          this.set(x, y, ch);
        }
      }
    }
  }

  circle(cx, cy, r, ch) {
    this.ellipse(cx, cy, r, r, ch);
  }

  tri(x1, y1, x2, y2, x3, y3, ch) {
    const minX = Math.floor(Math.min(x1, x2, x3));
    const maxX = Math.ceil(Math.max(x1, x2, x3));
    const minY = Math.floor(Math.min(y1, y2, y3));
    const maxY = Math.ceil(Math.max(y1, y2, y3));
    const area = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
    if (Math.abs(area) < 0.001) return;
    const sign = area > 0 ? 1 : -1;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const w1 = ((x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)) * sign;
        const w2 = ((x3 - x2) * (y - y2) - (y3 - y2) * (x - x2)) * sign;
        const w3 = ((x1 - x3) * (y - y3) - (y1 - y3) * (x - x3)) * sign;
        if (w1 >= -0.15 && w2 >= -0.15 && w3 >= -0.15) {
          this.set(x, y, ch);
        }
      }
    }
  }

  line(x1, y1, x2, y2, ch, radius = 0.65) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 2.2));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      if (radius <= 0.6) {
        this.set(x, y, ch);
      } else {
        this.circle(x, y, radius, ch);
      }
    }
  }

  quadCurve(x0, y0, cx, cy, x1, y1, ch, r0 = 1.4, r1 = 0.7) {
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
      const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      const r = r0 + (r1 - r0) * t;
      if (r <= 0.6) {
        this.set(x, y, ch);
      } else {
        this.circle(x, y, r, ch);
      }
    }
  }

  /**
   * Directional top-left cel-shading pass for body/secondary/armor pixels.
   * Run BEFORE drawing eyes, face details, and outline.
   */
  celShade() {
    const snap = this.cells.map((row) => row.slice());
    const isEmpty = (x, y) => {
      if (x < 0 || x >= this.w || y < 0 || y >= this.h) return true;
      return snap[y][x] === null;
    };

    for (let y = 1; y < this.h - 1; y++) {
      for (let x = 1; x < this.w - 1; x++) {
        const c = snap[y][x];
        if (!c) continue;
        const upEmpty = isEmpty(x, y - 1);
        const leftEmpty = isEmpty(x - 1, y);
        const downEmpty = isEmpty(x, y + 1);
        const rightEmpty = isEmpty(x + 1, y);

        if (c === 'P') {
          if (upEmpty && leftEmpty) this.cells[y][x] = 'H';
          else if (upEmpty || (leftEmpty && !downEmpty)) this.cells[y][x] = 'p';
          else if (downEmpty || (rightEmpty && y > 15)) this.cells[y][x] = 'D';
        } else if (c === 'S') {
          if (upEmpty) this.cells[y][x] = 's';
          else if (downEmpty) this.cells[y][x] = 'd';
        } else if (c === 'B') {
          if (upEmpty || leftEmpty) this.cells[y][x] = 'b';
        } else if (c === 'A') {
          if (upEmpty && leftEmpty) this.cells[y][x] = 'g';
          else if (upEmpty) this.cells[y][x] = 'a';
        }
      }
    }
  }

  /**
   * Draws an expressive RPG creature eye facing right.
   */
  eye(x, y, style = 'cute') {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (style === 'cute') {
      // 2x3 sparkling anime starter eye
      this.set(ix, iy, 'W');
      this.set(ix + 1, iy, 'K');
      this.set(ix, iy + 1, 'K');
      this.set(ix + 1, iy + 1, 'K');
      this.set(ix, iy + 2, 'E');
      this.set(ix + 1, iy + 2, 'E');
    } else if (style === 'fierce') {
      // Slanted fierce predator eye with brow
      this.set(ix - 1, iy - 1, 'O');
      this.set(ix, iy - 1, 'O');
      this.set(ix + 1, iy, 'O');
      this.set(ix - 1, iy, 'W');
      this.set(ix, iy, 'E');
      this.set(ix, iy + 1, 'K');
      this.set(ix + 1, iy + 1, 'E');
    } else if (style === 'glow') {
      // Glowing crescent eye (Shadeling / Umbravex / Volcarok)
      this.set(ix, iy, 'g');
      this.set(ix + 1, iy, 'E');
      this.set(ix + 1, iy + 1, 'a');
    } else if (style === 'small') {
      this.set(ix, iy, 'W');
      this.set(ix + 1, iy, 'K');
      this.set(ix, iy + 1, 'E');
      this.set(ix + 1, iy + 1, 'K');
    }
  }

  /**
   * Automatic crisp 1px dark colored outline around the entire silhouette.
   */
  outline(ch = 'O') {
    const snap = this.cells.map((row) => row.slice());
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (snap[y][x] !== null) continue;
        for (const [dx, dy] of dirs) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < this.w && ny >= 0 && ny < this.h && snap[ny][nx] !== null) {
            this.cells[y][x] = ch;
            break;
          }
        }
      }
    }
  }
}

/**
 * Procedural 32x32 HD pixel-art blueprints for all 12 Monsvers (2-frame idle animation).
 * All creatures face 3/4 RIGHT with grounded silhouettes, crisp anatomy & expressive faces.
 */
function buildMonsterGrid(id, frame = 0) {
  const g = new PixelGrid(32, 32);
  const b = frame === 1 ? 1 : 0; // 1px idle breathe/bob offset

  switch (id) {
    // 1. PYROFANG — Flame Pup (Cute fierce fire wolf-fox pup)
    case 'pyrofang': {
      // Curling flame tail behind rump
      g.quadCurve(9, 20, 4, 15 - b, 8 + b, 7, 'S', 2.4, 1.0);
      g.quadCurve(8, 18, 5, 13 - b, 8 + b, 8, 'A', 1.6, 0.8);
      g.circle(7, 11 - b, 1.3, 'g');
      g.tri(7 + b, 7, 10 + b, 5 - b, 10, 10, 'A');

      // Back legs (darker shadow)
      g.rect(10, 22, 3, 6, 'D');
      g.rect(17, 22, 3, 6, 'D');

      // Compact pup body
      g.ellipse(15, 20 + b * 0.5, 5.5, 4.0, 'P');
      // Cream-orange chest ruff
      g.ellipse(19, 19 + b * 0.5, 3.0, 3.3, 'S');

      // Front legs & bright paws
      g.rect(12, 22, 3, 6, 'P');
      g.rect(19, 22, 3, 6, 'P');
      g.rect(10, 27, 3, 2, 'S');
      g.rect(12, 27, 3, 2, 'S');
      g.rect(17, 27, 3, 2, 'S');
      g.rect(19, 27, 3, 2, 'S');

      // Pointed fox ears
      g.tri(15, 11 + b, 14, 4 + b, 19, 9 + b, 'P');
      g.tri(16, 9 + b, 15, 6 + b, 18, 9 + b, 'S');
      g.tri(20, 9 + b, 22, 4 + b, 24, 10 + b, 'P');
      g.tri(21, 9 + b, 22, 6 + b, 23, 9 + b, 'S');

      // Rounded head & snout
      g.ellipse(20, 13 + b, 5.2, 4.5, 'P');
      g.ellipse(24.5, 14.5 + b, 2.5, 1.8, 'P');
      g.ellipse(23.5, 15.5 + b, 2.3, 1.2, 'S'); // lower cheek/jaw
      // Flame forehead tuft
      g.tri(19, 9 + b, 20, 6 + b, 22, 9 + b, 'A');

      g.celShade();
      // Cute-fierce eye & dark nose
      g.eye(21, 11 + b, 'cute');
      g.set(26, 13 + b, 'K');
      g.set(27, 13 + b, 'K');
      g.set(25, 15 + b, 'D');
      g.outline('O');
      break;
    }

    // 2. BLAZEFANG — Infernal Saber (Heroic flame-maned dire wolf)
    case 'blazefang': {
      // Huge roaring flame tail
      g.quadCurve(9, 19, 2, 13 - b, 7 + b, 4, 'S', 3.0, 1.3);
      g.quadCurve(8, 17, 4, 11 - b, 7 + b, 5, 'A', 2.0, 0.9);
      g.circle(6, 10 - b, 1.6, 'g');
      g.tri(4, 9 - b, 6, 3, 10, 8 - b, 'A');

      // Muscular back legs
      g.rect(9, 21, 3, 8, 'D');
      g.rect(18, 21, 3, 8, 'D');

      // Powerful wolf torso
      g.ellipse(15, 19 + b * 0.5, 6.8, 4.4, 'P');
      g.ellipse(16, 22 + b * 0.5, 5.0, 2.0, 'D');

      // Blazing fire mane sweeping from neck & shoulders
      g.ellipse(19, 16 + b * 0.5, 4.4, 4.6, 'S');
      g.tri(15, 15, 12, 9 - b, 18, 12, 'S');
      g.tri(17, 13, 15, 7 - b, 20, 11, 'A');
      g.tri(13, 17, 10, 12 - b, 16, 15, 'A');
      g.circle(17, 14 + b * 0.5, 1.5, 'g');

      // Front legs + fiery ankle tufts
      g.rect(11, 21, 3, 8, 'P');
      g.rect(20, 21, 3, 8, 'P');
      g.tri(10, 26, 8, 24, 11, 28, 'A');
      g.tri(19, 26, 17, 24, 20, 28, 'A');
      g.rect(9, 28, 3, 2, 'B');
      g.rect(11, 28, 3, 2, 'B');
      g.rect(18, 28, 3, 2, 'B');
      g.rect(20, 28, 3, 2, 'B');

      // Sharp swept-back wolf ears
      g.tri(18, 9 + b, 16, 4 + b, 21, 8 + b, 'P');
      g.tri(21, 8 + b, 22, 3 + b, 24, 9 + b, 'P');

      // Fierce wolf head & saber snout
      g.ellipse(22, 11.5 + b, 4.6, 3.8, 'P');
      g.ellipse(26, 12.5 + b, 2.6, 1.8, 'P');
      g.ellipse(24.5, 14 + b, 2.5, 1.2, 'S');

      g.celShade();
      // Fierce slanted eye, nose & white saber fang!
      g.eye(23, 11 + b, 'fierce');
      g.set(28, 12 + b, 'K');
      g.set(26, 15 + b, 'g'); // glowing white saber fang!
      g.set(26, 16 + b, 'g');
      g.outline('O');
      break;
    }

    // 3. AQUAFIN — Tidefin Salamander (Adorable amphibious axolotl-salamander)
    case 'aquafin': {
      // Sleek curved aquatic tail with crescent fin
      g.quadCurve(10, 21, 5, 19, 4, 12 - b, 'P', 2.4, 1.1);
      g.tri(4, 13 - b, 2, 8 - b, 8, 11 - b, 'A');
      g.tri(4, 14 - b, 3, 18 - b, 8, 15 - b, 'S');

      // Back webbed legs
      g.rect(11, 23, 3, 5, 'D');
      g.rect(18, 23, 3, 5, 'D');

      // Plump smooth amphibian body + bright aqua belly
      g.ellipse(16, 21 + b * 0.5, 5.8, 4.2, 'P');
      g.ellipse(18, 22 + b * 0.5, 3.8, 2.8, 'A');

      // Front webbed feet
      g.rect(13, 23, 3, 5, 'P');
      g.rect(20, 23, 3, 5, 'P');
      g.rect(11, 27, 4, 2, 'S');
      g.rect(19, 27, 4, 2, 'S');

      // Iconic axolotl frilled cheek/head fins!
      g.tri(16, 11 + b, 11, 7 + b, 16, 13 + b, 'R');
      g.tri(15, 13 + b, 10, 12 + b, 16, 15 + b, 'R');
      g.tri(16, 15 + b, 12, 17 + b, 17, 16 + b, 'A');
      // Dorsal head fin crest
      g.tri(19, 9 + b, 18, 4 + b, 22, 8 + b, 'R');
      g.tri(21, 9 + b, 22, 5 + b, 24, 9 + b, 'A');

      // Round friendly salamander head
      g.ellipse(21, 13 + b, 5.2, 4.5, 'P');
      g.ellipse(23.5, 15 + b, 3.0, 2.0, 'S');

      g.celShade();
      // Big sparkling water eye & happy cheek dot
      g.eye(22, 11 + b, 'cute');
      g.set(25, 14 + b, 'R'); // bright bioluminescent cheek spot
      g.set(26, 15 + b, 'D'); // cute smile
      g.outline('O');
      break;
    }

    // 4. TIDECREST — Abyssal Monarch (Regal crowned sea serpent / leviathan)
    case 'tidecrest': {
      // Sweeping trident tail fin on bottom-left
      g.tri(6, 23, 2, 17 - b, 8, 20, 'R');
      g.tri(6, 25, 2, 28, 9, 26, 'A');

      // Majestic S-curved serpentine body
      g.quadCurve(6, 24, 14, 28, 19, 23, 'P', 2.8, 3.2);
      g.quadCurve(19, 23, 22, 18, 14, 16, 'P', 3.0, 2.8);
      g.quadCurve(14, 16, 12, 11, 21, 10 + b, 'P', 2.7, 2.4);

      // Glowing pale seafoam belly scales along S-curve
      g.quadCurve(9, 25, 15, 27, 19, 23, 'A', 1.3, 1.4);
      g.quadCurve(17, 18, 15, 14, 20, 12 + b, 'A', 1.3, 1.1);

      // Flowing aqua dorsal fins along spine
      g.tri(12, 15, 7, 11 - b, 13, 12, 'R');
      g.tri(14, 11, 10, 6 - b, 17, 9, 'R');
      g.tri(16, 21, 11, 19, 15, 24, 'S');

      // Regal crimson-coral crown horns (B / b)
      g.tri(19, 9 + b, 15, 3 + b, 21, 7 + b, 'B');
      g.tri(21, 8 + b, 20, 3 + b, 23, 8 + b, 'B');
      g.set(17, 5 + b, 'b');

      // Noble sea-dragon head & snout
      g.ellipse(22, 10 + b, 4.4, 3.2, 'P');
      g.ellipse(26, 11 + b, 2.6, 1.7, 'P');
      g.ellipse(25, 12.2 + b, 2.2, 1.0, 'A');
      // Flowing sea-whisker fin
      g.line(23, 13 + b, 27, 16 + b, 'R', 0.6);

      g.celShade();
      // Fierce glowing cyan monarch eye & forehead gem
      g.eye(23, 9 + b, 'fierce');
      g.set(22, 7 + b, 'g');
      g.outline('O');
      break;
    }

    // 5. VERDANTIX — Sproutling Deer (Adorable emerald forest fawn with forehead sprout)
    case 'verdantix': {
      // Fluffy leafy tail
      g.tri(9, 18, 5, 14 - b, 10, 20, 'A');
      g.tri(8, 19, 6, 17, 10, 21, 'S');

      // Slender nimble back legs + dark hooves
      g.rect(10, 21, 2, 7, 'D');
      g.rect(17, 21, 2, 7, 'D');

      // Graceful fawn body & slender neck
      g.ellipse(14.5, 19.5 + b * 0.5, 5.2, 3.4, 'P');
      g.ellipse(18, 15 + b * 0.5, 2.4, 3.8, 'P');
      g.ellipse(19, 17 + b * 0.5, 2.2, 2.4, 'S'); // pale chest

      // Front nimble legs + dark hooves
      g.rect(12, 21, 2, 7, 'P');
      g.rect(19, 21, 2, 7, 'P');
      g.rect(10, 27, 2, 2, 'B');
      g.rect(12, 27, 2, 2, 'B');
      g.rect(17, 27, 2, 2, 'B');
      g.rect(19, 27, 2, 2, 'B');

      // Pointed leaf-shaped deer ears
      g.tri(17, 10 + b, 13, 6 + b, 19, 8 + b, 'P');
      g.tri(16, 9 + b, 14, 7 + b, 18, 8 + b, 'S');

      // Sweet fawn head & little snout
      g.ellipse(20.5, 11 + b, 4.4, 3.5, 'P');
      g.ellipse(24.5, 12 + b, 2.2, 1.5, 'S');

      // Iconic twin-leaf sprout growing on forehead!
      g.line(21, 8 + b, 21, 5 + b, 'D', 0.6);
      g.ellipse(18.5, 4.5 + b, 2.5, 1.3, 'A');
      g.ellipse(23.5, 4.5 + b, 2.5, 1.3, 'A');
      g.set(18, 4 + b, 'g');
      g.set(23, 4 + b, 'g');

      g.celShade();
      // Cream-lime fawn spots on flank
      g.set(12, 18, 'A');
      g.set(13, 18, 'A');
      g.set(15, 19, 'A');
      g.set(11, 20, 'S');
      // Cute deer eye & nose
      g.eye(21, 10 + b, 'cute');
      g.set(26, 11 + b, 'K');
      g.outline('O');
      break;
    }

    // 6. SYLVANOX — Elder Forest Stag (Noble towering stag with blooming antlers)
    case 'sylvanox': {
      // Flowing leafy woodland tail
      g.tri(8, 18, 3, 14 - b, 9, 21, 'S');
      g.tri(7, 19, 4, 19, 9, 22, 'A');

      // Tall sturdy stag back legs
      g.rect(9, 21, 2, 8, 'D');
      g.rect(18, 21, 2, 8, 'D');

      // Noble stag body & proud neck
      g.ellipse(14.5, 19 + b * 0.5, 6.2, 3.9, 'P');
      g.ellipse(19, 14 + b * 0.5, 3.0, 4.4, 'P');
      // Lush mossy emerald chest mane
      g.ellipse(20, 17 + b * 0.5, 3.6, 3.4, 'S');
      g.tri(17, 18, 19, 22, 22, 18, 'A');

      // Front legs + dark hooves
      g.rect(11, 21, 2, 8, 'P');
      g.rect(20, 21, 2, 8, 'P');
      g.rect(9, 28, 3, 2, 'B');
      g.rect(11, 28, 3, 2, 'B');
      g.rect(18, 28, 3, 2, 'B');
      g.rect(20, 28, 3, 2, 'B');

      // Grand branching wooden antlers with blooming emerald canopy!
      g.line(19, 8 + b, 14, 3 + b, 'B', 0.8);
      g.line(16, 6 + b, 12, 5 + b, 'B', 0.6);
      g.line(21, 8 + b, 24, 2 + b, 'B', 0.8);
      g.line(23, 5 + b, 27, 4 + b, 'B', 0.6);
      // Glowing forest leaves & blossoms on antlers
      g.circle(13, 3 + b, 2.0, 'A');
      g.circle(17, 2 + b, 1.8, 'S');
      g.circle(24, 2 + b, 2.0, 'A');
      g.circle(27, 4 + b, 1.5, 'R');
      g.set(13, 2 + b, 'g');
      g.set(24, 2 + b, 'g');

      // Regal stag head & snout
      g.ellipse(22, 10.5 + b, 4.2, 3.2, 'P');
      g.ellipse(26, 11.5 + b, 2.4, 1.5, 'P');
      g.ellipse(25, 12.5 + b, 2.0, 0.9, 'S');

      g.celShade();
      // Noble eye, nose & glowing forest forehead rune
      g.eye(23, 9.5 + b, 'fierce');
      g.set(28, 11 + b, 'K');
      g.set(21, 9 + b, 'R');
      g.outline('O');
      break;
    }

    // 7. SPARKIT — Volt Kitten (Spunky yellow electric kitten with zigzag bolt tail)
    case 'sparkit': {
      // Crisp zigzag lightning-bolt tail!
      g.line(9, 20, 5, 16 - b, 'P', 1.3);
      g.line(5, 16 - b, 8, 13 - b, 'A', 1.2);
      g.line(8, 13 - b, 4, 7 - b, 'A', 1.1);
      g.set(4, 7 - b, 'g');
      g.set(5, 8 - b, 'g');

      // Agile kitten back legs
      g.rect(10, 22, 3, 6, 'D');
      g.rect(17, 22, 3, 6, 'D');

      // Compact spunky cat body
      g.ellipse(15, 20.5 + b * 0.5, 5.0, 3.6, 'P');
      g.ellipse(18.5, 20 + b * 0.5, 2.6, 2.6, 'S'); // bright chest tuft

      // Front agile paws
      g.rect(12, 22, 3, 6, 'P');
      g.rect(19, 22, 3, 6, 'P');
      g.rect(12, 27, 3, 2, 'A');
      g.rect(19, 27, 3, 2, 'A');

      // Tall pointed electric cat ears with dark tips
      g.tri(15, 11 + b, 14, 4 + b, 19, 9 + b, 'P');
      g.tri(14, 4 + b, 15, 7 + b, 16, 6 + b, 'D');
      g.tri(20, 9 + b, 23, 4 + b, 24, 11 + b, 'P');
      g.tri(23, 4 + b, 21, 6 + b, 23, 7 + b, 'D');

      // Big round kitten head & spiky cheek tufts
      g.ellipse(20, 13.5 + b, 5.2, 4.4, 'P');
      g.tri(15, 15 + b, 12, 14 + b, 16, 17 + b, 'S');
      g.tri(24, 15 + b, 27, 15 + b, 24, 17 + b, 'S');

      g.celShade();
      // Back lightning stripes & bright cheek spark
      g.rect(12, 18, 2, 2, 'D');
      g.rect(15, 17, 2, 2, 'D');
      g.eye(21, 11.5 + b, 'cute');
      g.set(24, 14.5 + b, 'g'); // electric cheek spark
      g.set(25, 13.5 + b, 'K'); // tiny nose
      g.outline('O');
      break;
    }

    // 8. VOLTLYNX — Thunder Predator (Sleek lightning lynx with jagged thunder mane)
    case 'voltlynx': {
      // Twin-forked plasma bolt tail
      g.line(9, 19, 4, 15 - b, 'P', 1.4);
      g.line(4, 15 - b, 7, 11 - b, 'A', 1.3);
      g.line(7, 11 - b, 3, 5 - b, 'g', 1.1);
      g.line(7, 11 - b, 9, 6 - b, 'A', 0.9);

      // Muscular predatory legs
      g.rect(9, 21, 3, 8, 'D');
      g.rect(18, 21, 3, 8, 'D');

      // Sleek athletic feline torso
      g.ellipse(15, 19.5 + b * 0.5, 6.8, 3.8, 'P');

      // Jagged golden thunder-mane around neck & shoulders
      g.tri(16, 14, 12, 9 - b, 19, 12, 'A');
      g.tri(15, 17, 11, 14 - b, 18, 17, 'S');
      g.tri(18, 19, 16, 23, 22, 18, 'A');
      g.ellipse(19.5, 16 + b * 0.5, 3.8, 3.8, 'S');

      // Front legs + lightning ankle spurs
      g.rect(11, 21, 3, 8, 'P');
      g.rect(20, 21, 3, 8, 'P');
      g.tri(10, 25, 7, 24, 11, 27, 'g');
      g.tri(20, 25, 17, 24, 21, 27, 'g');
      g.rect(9, 28, 3, 2, 'D');
      g.rect(11, 28, 3, 2, 'D');
      g.rect(18, 28, 3, 2, 'D');
      g.rect(20, 28, 3, 2, 'D');

      // Tall tufted lynx ears with crackling tips
      g.tri(18, 9 + b, 16, 3 + b, 21, 8 + b, 'P');
      g.tri(21, 8 + b, 24, 3 + b, 25, 9 + b, 'P');
      g.set(16, 3 + b, 'g');
      g.set(24, 3 + b, 'g');

      // Sharp fierce lynx head & muzzle
      g.ellipse(22, 11.5 + b, 4.6, 3.6, 'P');
      g.ellipse(26, 12.5 + b, 2.3, 1.5, 'S');
      g.tri(18, 13 + b, 15, 13 + b, 19, 15 + b, 'A');

      g.celShade();
      // Tiger stripes on back
      g.rect(11, 17, 2, 3, 'D');
      g.rect(14, 16, 2, 3, 'D');
      g.eye(23, 10.5 + b, 'fierce');
      g.set(27, 12 + b, 'K');
      g.outline('O');
      break;
    }

    // 9. SHADELING — Rift Imp (Mysterious floating hooded shadow phantom)
    case 'shadeling': {
      const floatY = b ? -1 : 1; // gentle levitation!
      // Tattered floating shadow cloak tendrils below
      g.tri(11, 20 + floatY, 9, 27 + floatY, 14, 22 + floatY, 'D');
      g.tri(14, 21 + floatY, 16, 28 + floatY, 18, 21 + floatY, 'P');
      g.tri(18, 20 + floatY, 22, 27 + floatY, 21, 20 + floatY, 'D');

      // Floating hooded phantom cloak body
      g.ellipse(16, 17 + floatY, 6.2, 6.2, 'P');
      // Imp-ear hood horns
      g.tri(11, 12 + floatY, 8, 5 + floatY, 15, 10 + floatY, 'P');
      g.tri(17, 10 + floatY, 22, 5 + floatY, 21, 12 + floatY, 'P');
      // Collar/scarf wisps
      g.ellipse(16, 19 + floatY, 5.5, 2.2, 'S');

      // Little mischievous shadow claws peeking out
      g.circle(10, 18 + floatY, 1.6, 'D');
      g.circle(23, 17 + floatY, 1.6, 'P');

      // Deep dark hood void face
      g.ellipse(17.5, 14 + floatY, 4.4, 3.6, 'K');

      g.celShade();
      // Glowing violet crescent eyes shining inside the dark hood!
      g.eye(15, 13 + floatY, 'glow');
      g.eye(19, 13 + floatY, 'glow');
      // Chest rift crystal rune
      g.set(16, 20 + floatY, 'g');
      g.set(16, 21 + floatY, 'R');
      g.set(15, 20 + floatY, 'A');
      g.set(17, 20 + floatY, 'A');

      // Orbiting rift spirit wisps!
      g.circle(5, 13 - floatY, 1.4, 'S');
      g.set(5, 13 - floatY, 'g');
      g.circle(27, 11 - floatY, 1.3, 'S');
      g.set(27, 11 - floatY, 'g');

      g.outline('O');
      break;
    }

    // 10. UMBRAVEX — Eclipse Apex Sovereign (Imposing floating Final Boss)
    case 'umbravex': {
      const floatY = b ? -1 : 0;
      // Wide outstretched tattered nebula void wings!
      g.tri(12, 14 + floatY, 2, 7 + floatY, 6, 19 + floatY, 'D');
      g.tri(11, 16 + floatY, 3, 16 + floatY, 8, 22 + floatY, 'P');
      g.line(11, 14 + floatY, 4, 10 + floatY, 'S', 0.7);
      g.line(10, 17 + floatY, 5, 17 + floatY, 'A', 0.6);

      g.tri(20, 14 + floatY, 30, 7 + floatY, 26, 19 + floatY, 'D');
      g.tri(21, 16 + floatY, 29, 16 + floatY, 24, 22 + floatY, 'P');
      g.line(21, 14 + floatY, 28, 10 + floatY, 'S', 0.7);
      g.line(22, 17 + floatY, 27, 17 + floatY, 'A', 0.6);

      // Floating tapered sovereign energy cloak
      g.tri(11, 21 + floatY, 16, 29 + floatY, 21, 21 + floatY, 'D');
      g.tri(13, 21 + floatY, 16, 27 + floatY, 19, 21 + floatY, 'P');

      // Armored sovereign torso & royal shoulder pauldrons
      g.ellipse(16, 17 + floatY, 5.4, 5.8, 'P');
      g.ellipse(11, 14 + floatY, 2.8, 2.2, 'B');
      g.ellipse(21, 14 + floatY, 2.8, 2.2, 'B');

      // Iconic curved crescent-moon Eclipse Crown Horns!
      g.quadCurve(14, 9 + floatY, 8, 6 + floatY, 10, 2 + floatY, 'B', 1.5, 0.7);
      g.quadCurve(18, 9 + floatY, 24, 6 + floatY, 22, 2 + floatY, 'B', 1.5, 0.7);
      // Glowing Eclipse Halo Orb floating between the horns!
      g.circle(16, 4 + floatY, 2.0, 'R');
      g.set(16, 4 + floatY, 'g');

      // Dark void sovereign helm
      g.ellipse(16, 10.5 + floatY, 3.8, 3.2, 'B');
      g.ellipse(16, 11 + floatY, 2.8, 2.0, 'K');

      g.celShade();
      // Glowing twin eclipse visor eyes
      g.set(14, 11 + floatY, 'g');
      g.set(15, 11 + floatY, 'E');
      g.set(17, 11 + floatY, 'E');
      g.set(18, 11 + floatY, 'g');

      // Blazing Eclipse Rift core in chest!
      g.circle(16, 17 + floatY, 2.2, 'S');
      g.circle(16, 17 + floatY, 1.3, 'R');
      g.set(16, 17 + floatY, 'g');
      g.outline('O');
      break;
    }

    // 11. THORNBACK — Solara Grove Colossus (Massive armored stone-and-bramble tortoise Boss)
    case 'thornback': {
      // Short thorny tail
      g.tri(6, 21, 2, 19, 6, 23, 'P');

      // Back heavy boulder pillar legs
      g.rect(7, 21, 4, 8, 'D');
      g.rect(17, 21, 4, 8, 'D');

      // Massive domed ancient stone-and-moss shell
      g.ellipse(14, 16 + b * 0.5, 9.2, 7.2, 'B');
      // Lush emerald moss armor plates on top of shell
      g.ellipse(14, 14 + b * 0.5, 8.2, 5.2, 'P');
      g.ellipse(14, 12.5 + b * 0.5, 6.2, 3.2, 'S');
      // Shell rim ridge
      g.ellipse(14, 20.5 + b * 0.5, 9.4, 2.2, 'B');

      // 3 Jagged glowing bramble thorn spikes crowning the shell!
      g.tri(8, 11 + b * 0.5, 6, 5 + b * 0.5, 11, 10 + b * 0.5, 'A');
      g.tri(12, 9 + b * 0.5, 14, 3 + b * 0.5, 17, 9 + b * 0.5, 'A');
      g.tri(17, 11 + b * 0.5, 20, 6 + b * 0.5, 21, 12 + b * 0.5, 'A');

      // Front heavy boulder legs + stone claws
      g.rect(9, 22, 4, 7, 'P');
      g.rect(19, 22, 4, 7, 'P');
      g.rect(9, 28, 4, 2, 'B');
      g.rect(19, 28, 4, 2, 'B');
      g.set(12, 28, 'A');
      g.set(22, 28, 'A');

      // Sturdy armored reptile head jutting right
      g.ellipse(24.5, 18 + b * 0.5, 4.3, 3.4, 'P');
      g.ellipse(25.5, 20 + b * 0.5, 3.5, 1.5, 'S'); // heavy jaw
      g.tri(23, 15 + b * 0.5, 25, 12 + b * 0.5, 26, 15 + b * 0.5, 'B'); // nose horn

      g.celShade();
      g.eye(25, 17 + b * 0.5, 'fierce');
      g.set(27, 19.5 + b * 0.5, 'g'); // tusk tooth
      g.outline('O');
      break;
    }

    // 12. VOLCAROK — Ignis Caldera Titan (Hulking obsidian basalt magma golem Boss)
    case 'volcarok': {
      // Heavy basalt pillar legs planted wide
      g.rect(10, 22, 5, 7, 'B');
      g.rect(18, 22, 5, 7, 'B');
      g.line(12, 24, 12, 28, 'S', 0.6); // glowing magma leg crack
      g.line(20, 24, 20, 28, 'S', 0.6);

      // Massive broad obsidian basalt torso
      g.ellipse(16, 16 + b * 0.5, 7.6, 6.6, 'B');
      // Volcanic jagged shoulder pauldrons venting magma!
      g.tri(9, 13 + b * 0.5, 5, 7 + b * 0.5, 13, 10 + b * 0.5, 'B');
      g.tri(23, 13 + b * 0.5, 27, 7 + b * 0.5, 19, 10 + b * 0.5, 'B');
      // Venting lava flames on shoulder peaks
      g.circle(6, 7 - b, 1.5, 'S');
      g.set(6, 6 - b, 'A');
      g.circle(26, 7 - b, 1.5, 'S');
      g.set(26, 6 - b, 'A');

      // Huge heavy smashing fists hanging at sides
      g.ellipse(6.5, 20 + b, 3.3, 4.2, 'B');
      g.ellipse(25.5, 20 + b, 3.3, 4.2, 'B');
      g.line(6, 19 + b, 7, 22 + b, 'P', 0.8); // glowing molten knuckles
      g.line(25, 19 + b, 26, 22 + b, 'P', 0.8);

      // Recessed armored caldera head with volcano horn crest
      g.ellipse(16.5, 9.5 + b * 0.5, 4.2, 3.4, 'B');
      g.tri(14, 7 + b * 0.5, 16.5, 3 + b * 0.5, 19, 7 + b * 0.5, 'P');
      g.set(16.5, 4 + b * 0.5, 'A');

      g.celShade();
      // Glowing molten lava fissures & blazing furnace core in chest!
      g.line(12, 13 + b * 0.5, 16, 16 + b * 0.5, 'P', 0.8);
      g.line(21, 13 + b * 0.5, 16, 16 + b * 0.5, 'P', 0.8);
      g.line(16, 16 + b * 0.5, 16, 21 + b * 0.5, 'P', 0.8);
      g.circle(16, 16 + b * 0.5, 2.4, 'S');
      g.circle(16, 16 + b * 0.5, 1.5, 'A');
      g.set(16, 16 + b * 0.5, 'g');

      // Glowing molten visor eyes
      g.rect(14, 9 + b * 0.5, 2, 2, 'A');
      g.rect(18, 9 + b * 0.5, 2, 2, 'A');
      g.set(15, 9 + b * 0.5, 'g');
      g.set(19, 9 + b * 0.5, 'g');
      g.outline('O');
      break;
    }

    default: {
      // Fallback generic cute elemental slime
      g.ellipse(16, 18 + b, 8, 7, 'P');
      g.celShade();
      g.eye(18, 15 + b, 'cute');
      g.outline('O');
    }
  }

  return g;
}

/**
 * Crisp 12x12 elemental icon glyphs for UI badges and skill cards.
 * Keys: icon_el_0 (Neutral) through icon_el_5 (Shadow).
 */
const ELEMENTAL_ICONS = {
  icon_el_0: {
    // Neutral silver-white 4-point star
    grid: [
      '............',
      '.....OO.....',
      '....OwwO....',
      '....OWWO....',
      '.OOOswwsOOO.',
      'OwwWWWWWWwwO',
      'OwwWWWWWWwwO',
      '.OOOswwsOOO.',
      '....OWWO....',
      '....OwwO....',
      '.....OO.....',
      '............',
    ],
    colors: {
      O: '#334155',
      s: '#94a3b8',
      w: '#e2e8f0',
      W: '#ffffff',
    },
  },
  icon_el_1: {
    // Fire orange-gold dancing flame
    grid: [
      '......OO....',
      '.....OffO...',
      '....OffffO..',
      '...OffygffO.',
      '..OffyyggffO',
      '..OfyywwyffO',
      '.OffywwwyffO',
      '.OffywwwyffO',
      '.OffyyyyffO.',
      '..OffffffO..',
      '...OOOOOO...',
      '............',
    ],
    colors: {
      O: '#450a0a',
      f: '#dc2626',
      y: '#f97316',
      w: '#fde047',
      g: '#fef08a',
    },
  },
  icon_el_2: {
    // Water glossy cyan droplet
    grid: [
      '.....OO.....',
      '....ObbO....',
      '...ObwwbO...',
      '...ObwwbO...',
      '..ObbwwbbO..',
      '.ObbwwwwbbO.',
      '.ObbbwwbbbO.',
      '.ObbbbbbbbO.',
      '..ObbbbbbO..',
      '...ObbbbO...',
      '....OOOO....',
      '............',
    ],
    colors: {
      O: '#082f49',
      b: '#0ea5e9',
      w: '#ffffff',
    },
  },
  icon_el_3: {
    // Nature emerald leaf
    grid: [
      '........OO..',
      '.......OggO.',
      '......OggvO.',
      '....OgggvO..',
      '...OggggvO..',
      '..OgggvggO..',
      '.OggvggggO..',
      '.OvvggggO...',
      '..OggggO....',
      '...OggO.....',
      '....OO......',
      '............',
    ],
    colors: {
      O: '#052e16',
      g: '#22c55e',
      v: '#d9f99d',
    },
  },
  icon_el_4: {
    // Electric golden lightning bolt
    grid: [
      '......OO....',
      '.....OyyO...',
      '....OyywO...',
      '...OyywO....',
      '..OyyyyyyOO.',
      '..OyyyyyyyO.',
      '....OOOyyO..',
      '.....OyywO..',
      '....OyywO...',
      '...OyyO.....',
      '...OO.......',
      '............',
    ],
    colors: {
      O: '#422006',
      y: '#eab308',
      w: '#ffffff',
    },
  },
  icon_el_5: {
    // Shadow violet crescent moon / rift crystal
    grid: [
      '.....OOOO...',
      '...OOppppO..',
      '..OppppOO...',
      '.OppppO.....',
      '.OppppO.....',
      '.OpppvO.....',
      '.OpppvvO....',
      '.OpppvwvO...',
      '..OpppvvO...',
      '...OOppppO..',
      '.....OOOO...',
      '............',
    ],
    colors: {
      O: '#1e053a',
      p: '#9333ea',
      v: '#c084fc',
      w: '#f3e8ff',
    },
  },
};

const ELEMENT_OUTLINES = {
  [Element.Fire]: '#380909',
  [Element.Water]: '#071f3b',
  [Element.Nature]: '#052614',
  [Element.Electric]: '#291a03',
  [Element.Shadow]: '#140426',
};

const HORN_BASES = {
  volcarok: '#334155',
  tidecrest: '#e11d48',
  thornback: '#475569',
  sylvanox: '#78350f',
  verdantix: '#451a03',
  blazefang: '#450a0a',
  umbravex: '#31105c',
};

const HORN_LIGHTS = {
  volcarok: '#64748b',
  tidecrest: '#fb7185',
  thornback: '#94a3b8',
  sylvanox: '#b45309',
  verdantix: '#78350f',
  blazefang: '#7f1d1d',
  umbravex: '#6d28d9',
};

const EYE_IRISES = {
  [Element.Fire]: '#f59e0b',
  [Element.Water]: '#38bdf8',
  [Element.Nature]: '#10b981',
  [Element.Electric]: '#38bdf8',
  [Element.Shadow]: '#d946ef',
};

const SPECIAL_RUNES = {
  volcarok: '#fef08a',
  aquafin: '#67e8f9',
  tidecrest: '#67e8f9',
  sylvanox: '#fde047',
  shadeling: '#f0abfc',
  umbravex: '#f0abfc',
};

/**
 * Safely creates or adds a CanvasTexture to the scene TextureManager.
 */
function createOrGetCanvasTexture(scene, key, width, height) {
  if (scene.textures.exists(key)) return null;

  if (typeof scene.textures.createCanvas === 'function') {
    return scene.textures.createCanvas(key, width, height);
  }
  if (typeof document !== 'undefined' && document.createElement) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return scene.textures.addCanvas(key, canvas);
  }
  return null;
}

/**
 * Generates and registers all procedural pixel textures:
 * - 24 monster idle frames (12 monsters * 2 frames in HD 32x32 -> 64x64)
 * - 12 monster dark silhouette textures (monsver_${id}_sil) for Monsverdex
 * - 6 elemental icon glyphs (12x12)
 * - 'bg_arena_solara' (640x360 panoramic pixel arena backdrop)
 * - 'particle_pixel' (4x4), 'particle_spark' (6x6), 'icon_orb' (16x16)
 */
export function registerAllPixelTextures(scene) {
  // 1. Particle Pixel (4x4)
  if (!scene.textures.exists('particle_pixel')) {
    const tex = createOrGetCanvasTexture(scene, 'particle_pixel', 4, 4);
    if (tex && tex.context) {
      const ctx = tex.context;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 4, 4);
      if (typeof tex.refresh === 'function') tex.refresh();
    }
  }

  // 2. Particle Spark (6x6 diamond spark)
  if (!scene.textures.exists('particle_spark')) {
    const tex = createOrGetCanvasTexture(scene, 'particle_spark', 6, 6);
    if (tex && tex.context) {
      const ctx = tex.context;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(2, 0, 2, 6);
      ctx.fillRect(0, 2, 6, 2);
      ctx.fillRect(1, 1, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 2, 2);
      if (typeof tex.refresh === 'function') tex.refresh();
    }
  }

  // 3. Rift Orb Icon (16x16)
  if (!scene.textures.exists('icon_orb')) {
    const tex = createOrGetCanvasTexture(scene, 'icon_orb', 16, 16);
    if (tex && tex.context) {
      const ctx = tex.context;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5, 1, 6, 14);
      ctx.fillRect(1, 5, 14, 6);
      ctx.fillRect(3, 3, 10, 10);

      ctx.fillStyle = '#64748b';
      ctx.fillRect(4, 2, 8, 1);
      ctx.fillRect(2, 4, 1, 8);
      ctx.fillRect(13, 4, 1, 8);
      ctx.fillRect(4, 13, 8, 1);

      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(6, 6, 4, 4);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 5, 2, 2);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(7, 3, 2, 1);
      ctx.fillRect(7, 12, 2, 1);
      ctx.fillRect(3, 7, 1, 2);
      ctx.fillRect(12, 7, 1, 2);

      if (typeof tex.refresh === 'function') tex.refresh();
    }
  }

  // 4. Battle Arena Parallax Pixel Backdrop (640x360)
  if (!scene.textures.exists('bg_arena_solara')) {
    const tex = createOrGetCanvasTexture(scene, 'bg_arena_solara', 640, 360);
    if (tex && tex.context) {
      const ctx = tex.context;
      ctx.imageSmoothingEnabled = false;

      const skyGrad = ctx.createLinearGradient(0, 0, 0, 240);
      skyGrad.addColorStop(0.0, '#040714');
      skyGrad.addColorStop(0.25, '#0b1329');
      skyGrad.addColorStop(0.55, '#0d2538');
      skyGrad.addColorStop(0.8, '#0a352c');
      skyGrad.addColorStop(1.0, '#0d2e22');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 640, 240);

      const starCoords = [
        [24, 18], [55, 34], [90, 14], [130, 42], [165, 22],
        [210, 15], [260, 35], [305, 18], [335, 45], [380, 25],
        [420, 16], [470, 38], [515, 20], [560, 32], [605, 18],
        [40, 75], [80, 88], [145, 70], [285, 78], [320, 92],
        [360, 68], [405, 82], [490, 74], [540, 88], [590, 64],
        [180, 52], [450, 50], [620, 48],
      ];
      ctx.fillStyle = '#ffffff';
      for (const [sx, sy] of starCoords) {
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(120, 28, 2, 2);
      ctx.fillRect(240, 22, 2, 2);
      ctx.fillRect(480, 26, 2, 2);
      ctx.fillRect(570, 40, 2, 2);
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(195, 36, 2, 2);
      ctx.fillRect(350, 30, 2, 2);

      // Distant Eclipse Tower spire silhouette on horizon
      ctx.fillStyle = '#0d0b1f';
      ctx.fillRect(446, 32, 8, 148);
      ctx.fillRect(442, 62, 16, 118);
      ctx.fillRect(436, 102, 28, 78);
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(448, 40, 4, 14);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(449, 42, 2, 8);

      // Distant mountain ridges
      ctx.fillStyle = '#0a1622';
      ctx.beginPath();
      ctx.moveTo(0, 170);
      ctx.lineTo(55, 135);
      ctx.lineTo(110, 160);
      ctx.lineTo(175, 128);
      ctx.lineTo(240, 155);
      ctx.lineTo(300, 132);
      ctx.lineTo(370, 162);
      ctx.lineTo(430, 125);
      ctx.lineTo(500, 152);
      ctx.lineTo(570, 130);
      ctx.lineTo(640, 158);
      ctx.lineTo(640, 240);
      ctx.lineTo(0, 240);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0b201f';
      ctx.beginPath();
      ctx.moveTo(0, 188);
      ctx.lineTo(80, 155);
      ctx.lineTo(150, 180);
      ctx.lineTo(220, 150);
      ctx.lineTo(310, 185);
      ctx.lineTo(390, 152);
      ctx.lineTo(470, 178);
      ctx.lineTo(540, 148);
      ctx.lineTo(640, 180);
      ctx.lineTo(640, 240);
      ctx.lineTo(0, 240);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#041612';
      for (let tx = 0; tx < 640; tx += 12) {
        const treeHeight = 24 + ((tx * 7) % 20);
        ctx.beginPath();
        ctx.moveTo(tx - 6, 220);
        ctx.lineTo(tx + 6, 220 - treeHeight);
        ctx.lineTo(tx + 18, 220);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#06261c';
      for (let tx = 6; tx < 640; tx += 16) {
        const treeHeight = 18 + ((tx * 11) % 16);
        ctx.beginPath();
        ctx.moveTo(tx - 5, 220);
        ctx.lineTo(tx + 5, 220 - treeHeight);
        ctx.lineTo(tx + 15, 220);
        ctx.closePath();
        ctx.fill();
      }

      const groundGrad = ctx.createLinearGradient(0, 215, 0, 360);
      groundGrad.addColorStop(0.0, '#061712');
      groundGrad.addColorStop(0.4, '#0c261e');
      groundGrad.addColorStop(1.0, '#040d0a');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 215, 640, 145);

      ctx.fillStyle = '#166534';
      for (let gx = 10; gx < 630; gx += 28) {
        const gy = 230 + ((gx * 13) % 100);
        ctx.fillRect(gx, gy, 6, 2);
        ctx.fillRect(gx + 2, gy - 2, 2, 2);
      }

      const fireflies = [
        [32, 175, '#38bdf8'], [75, 195, '#4ade80'], [130, 185, '#fde047'],
        [190, 170, '#c084fc'], [250, 190, '#38bdf8'], [310, 165, '#bef264'],
        [360, 180, '#4ade80'], [410, 172, '#fde047'], [470, 188, '#38bdf8'],
        [530, 168, '#c084fc'], [580, 192, '#bef264'], [620, 176, '#4ade80'],
        [45, 245, '#4ade80'], [110, 275, '#fde047'], [175, 235, '#38bdf8'],
        [235, 280, '#bef264'], [295, 255, '#c084fc'], [370, 265, '#4ade80'],
        [440, 240, '#fde047'], [510, 285, '#38bdf8'], [575, 250, '#bef264'],
        [615, 290, '#4ade80'],
      ];
      for (const [fx, fy, col] of fireflies) {
        ctx.fillStyle = col;
        ctx.fillRect(fx, fy, 2, 2);
      }

      if (typeof tex.refresh === 'function') tex.refresh();
    }
  }

  // 5. Crisp 12x12 Elemental Icon Textures
  for (const [key, iconDef] of Object.entries(ELEMENTAL_ICONS)) {
    if (scene.textures.exists(key)) continue;

    const tex = createOrGetCanvasTexture(scene, key, 12, 12);
    if (!tex || !tex.context) continue;

    const ctx = tex.context;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 12, 12);

    for (let y = 0; y < 12; y++) {
      const row = iconDef.grid[y];
      if (!row) continue;
      for (let x = 0; x < 12; x++) {
        const ch = row[x];
        if (ch === '.' || !ch) continue;
        const color = iconDef.colors[ch];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    if (typeof tex.refresh === 'function') {
      tex.refresh();
    }
  }

  // 6. Monster HD Pixel Art Sprites (32x32 scaled 2x -> 64x64) + Monsverdex Silhouettes
  const scale = 2;
  const size = 32 * scale; // 64px

  for (const [id, monsterDef] of Object.entries(MONSTERS)) {
    const palette = monsterDef.palette;
    const element = monsterDef.element;

    const outlineColor = ELEMENT_OUTLINES[element] ?? '#1e293b';
    const primaryLight = lighten(palette.primary, 0.28);
    const primarySpecular = lighten(palette.primary, 0.5);
    const darkShade = palette.dark ?? darken(palette.primary, 0.38);

    const secondaryLight = lighten(palette.secondary, 0.28);
    const secondaryDark = darken(palette.secondary, 0.28);

    const accentLight = lighten(palette.accent, 0.35);

    const hornBase = HORN_BASES[id] ?? '#334155';
    const hornLight = HORN_LIGHTS[id] ?? '#64748b';

    const eyeIris = EYE_IRISES[element] ?? '#f59e0b';
    const specialRune = SPECIAL_RUNES[id] ?? '#ffffff';

    const colorMap = {
      O: outlineColor,
      P: palette.primary,
      p: primaryLight,
      H: primarySpecular,
      D: darkShade,
      S: palette.secondary,
      s: secondaryLight,
      d: secondaryDark,
      A: palette.accent,
      a: accentLight,
      g: '#ffffff',
      B: hornBase,
      b: hornLight,
      E: eyeIris,
      W: '#ffffff',
      K: '#09090b',
      R: specialRune,
    };

    for (let frame = 0; frame < 2; frame++) {
      const key = getMonsterTextureKey(id, frame);
      if (scene.textures.exists(key)) continue;

      const grid = buildMonsterGrid(id, frame);
      const tex = createOrGetCanvasTexture(scene, key, size, size);
      if (!tex || !tex.context) continue;

      const ctx = tex.context;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);

      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const ch = grid.cells[y][x];
          if (!ch) continue;
          const fill = colorMap[ch];
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }

      if (typeof tex.refresh === 'function') {
        tex.refresh();
      }

      // Generate matching dark silhouette texture from frame 0 for Monsverdex
      if (frame === 0) {
        const silKey = getMonsterSilhouetteKey(id);
        if (!scene.textures.exists(silKey)) {
          const silTex = createOrGetCanvasTexture(scene, silKey, size, size);
          if (silTex && silTex.context) {
            const sctx = silTex.context;
            sctx.imageSmoothingEnabled = false;
            sctx.clearRect(0, 0, size, size);
            for (let y = 0; y < 32; y++) {
              for (let x = 0; x < 32; x++) {
                const ch = grid.cells[y][x];
                if (!ch) continue;
                sctx.fillStyle = ch === 'O' ? '#1e293b' : '#090e1a';
                sctx.fillRect(x * scale, y * scale, scale, scale);
              }
            }
            if (typeof silTex.refresh === 'function') silTex.refresh();
          }
        }
      }
    }
  }
}
