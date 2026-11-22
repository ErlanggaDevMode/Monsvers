/**
 * Monsvers: The Battle Monster — Story Pixel Art Sprites & Chapter Arena Backdrops
 *
 * Generates:
 * - 5 Character Dialogue Portraits (48x48, drawn 16x16 scaled 3x):
 *   1. portrait_orin (wise scholar glasses & cyan scarf)
 *   2. portrait_kael (spiky fiery rival hair & visor)
 *   3. portrait_player (heroic young Tamer headband)
 *   4. portrait_warden (masked crimson Rift Warden)
 *   5. portrait_umbravex (glowing purple Eclipse Apex silhouette)
 *
 * - 3 Chapter Battle Arena Backdrops (640x360 pixel art):
 *   1. bg_arena_azure (wide moonlit turquoise bay, layered pixel ocean waves, coastal rock arches & lighthouse silhouette)
 *   2. bg_arena_ignis (wide volcanic caldera, jagged basalt cliffs, glowing magma rivers & drifting ember ash)
 *   3. bg_arena_eclipse (wide violet-indigo cosmos, colossal fractured Eclipse Rift portal glowing in the sky, floating obsidian ruins)
 */

/**
 * Safely creates or adds a CanvasTexture to the scene TextureManager.
 * @param {Phaser.Scene} scene
 * @param {string} key
 * @param {number} width
 * @param {number} height
 * @returns {Phaser.Textures.CanvasTexture|null}
 */
function createOrGetCanvasTexture(scene, key, width, height) {
  if (!scene || !scene.textures) return null;
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

// ============================================================================
// 16x16 Pixel Matrices & Palettes for 48x48 Character Portraits
// ============================================================================
const PORTRAIT_DEFINITIONS = {
  // Prof. Orin: Wise scholar glasses & cyan scarf
  portrait_orin: {
    accentColor: 0x38bdf8,
    palette: {
      '.': '#090e17', // Dark frame background
      'B': '#020617', // Dark frame border
      'R': '#38bdf8', // Elemental rim (cyan)
      'H': '#94a3b8', // Silver scholar hair
      'h': '#f1f5f9', // Hair highlight
      'S': '#fde68a', // Skin tone
      's': '#f59e0b', // Skin shadow
      'G': '#cbd5e1', // Glasses frame
      'g': '#ffffff', // Glasses lens glare
      'E': '#0284c7', // Eye iris
      'C': '#06b6d4', // Cyan scarf
      'c': '#67e8f9', // Scarf highlight
      'T': '#1e293b', // Scholar tunic
    },
    grid: [
      'BBBBBBBBBBBBBBBB',
      'BRRHHHHHHHHHHRRB',
      'BRHHhhHHHHhhHHRB',
      'BHHhhhHHHHhhhHHB',
      'BHHHHHHHHHHHHHHB',
      'BHHSSSSSSSSSSHHB',
      'BHHSSGGSSSSGGSHB',
      'BHSGgEGSSGgEGSHB',
      'BHHSSGGSSSSGGSHB',
      'BHHSSSSssSSSSHHB',
      'BBHHSSssssSSHHBB',
      'BRHHSSSSSSSSHHRB',
      'BRRCCccCCccCCRRB',
      'BTCCccccccccCCTB',
      'BTTTCCCCCCCCTTTB',
      'BBBBBBBBBBBBBBBB',
    ],
  },

  // Kael: Spiky fiery rival hair & tech visor
  portrait_kael: {
    accentColor: 0xf97316,
    palette: {
      '.': '#140804', // Dark background
      'B': '#050201', // Dark border
      'R': '#f97316', // Elemental rim (fiery orange)
      'H': '#ea580c', // Fiery spiky hair
      'h': '#fde047', // Flame hair highlight
      'S': '#fed7aa', // Skin
      's': '#fb923c', // Skin shadow
      'V': '#f59e0b', // Visor body
      'v': '#ffffff', // Visor shine
      'M': '#991b1b', // Smirk mouth
      'J': '#18181b', // Dark collar jacket
      'j': '#f97316', // Orange jacket trim
    },
    grid: [
      'BBBBBBBBBBBBBBBB',
      'BRRH.HH..HH.HRRB',
      'BRHHHhHHHhHHHHHR',
      'BHHhhhHHhhhHHHHB',
      'BHhhhhHhhhhhHHHB',
      'BHHHHHHHHHHHHHHB',
      'BHHSSSSSSSSSSHHB',
      'BHSVvvVVSSVvvVSH',
      'BHSVVVVVSSVVVVSH',
      'BHHSSSSSSSSSSHHB',
      'BBHHSSSSMMSSHHBB',
      'BRHHSSSSSSSSHHRB',
      'BRRJJJJjjJJJJRRB',
      'BJJJJJjjjjJJJJJB',
      'BJJJJJJjjJJJJJJB',
      'BBBBBBBBBBBBBBBB',
    ],
  },

  // Player: Heroic young Tamer with headband
  portrait_player: {
    accentColor: 0x22c55e,
    palette: {
      '.': '#06130b', // Background
      'B': '#020a05', // Dark border
      'R': '#22c55e', // Elemental rim (nature green)
      'H': '#78350f', // Chestnut adventurer hair
      'h': '#b45309', // Hair highlight
      'D': '#15803d', // Green headband
      'd': '#facc15', // Headband gold emblem
      'S': '#fde68a', // Skin
      's': '#f59e0b', // Skin shadow
      'E': '#0f172a', // Eye pupil
      'e': '#ffffff', // Eye shine
      'i': '#38bdf8', // Iris
      'T': '#047857', // Hero tunic
      't': '#a7f3d0', // Collar trim
    },
    grid: [
      'BBBBBBBBBBBBBBBB',
      'BRRHHHHHHHHHHRRB',
      'BRHHhhHHHHhhHHRB',
      'BHHhhhHHHHhhhHHB',
      'BHDDDDddddDDDDHB',
      'BHDDDDddddDDDDHB',
      'BHHSSSSSSSSSSHHB',
      'BHHSEieSSSEieSHB',
      'BHHSEiSSSSSEiSHB',
      'BHHSSSSSSSSSSHHB',
      'BBHHSSSSssSSHHBB',
      'BRHHSSSSSSSSHHRB',
      'BRRttttttttttRRB',
      'BTTTTTTttTTTTTTB',
      'BTTTTTTTTTTTTTTB',
      'BBBBBBBBBBBBBBBB',
    ],
  },

  // Rift Warden: Masked crimson Rift Warden
  portrait_warden: {
    accentColor: 0xef4444,
    palette: {
      '.': '#130407', // Background
      'B': '#060103', // Dark border
      'R': '#ef4444', // Elemental rim (crimson)
      'C': '#7f1d1d', // Crimson hood/cowl
      'c': '#450a0a', // Hood fold shade
      'M': '#f8fafc', // Porcelain mask base
      'm': '#94a3b8', // Mask shade
      'E': '#dc2626', // Crimson eye slit
      'e': '#fca5a5', // Eye flare
      'P': '#18181b', // Obsidian pauldron
      'p': '#b91c1c', // Pauldron rune
    },
    grid: [
      'BBBBBBBBBBBBBBBB',
      'BRRCCCCCCCCCCRRB',
      'BRCCCCCCCCCCCCRB',
      'BCCccccccccccCCB',
      'BCCcMMMMMMMMcCCB',
      'BCcMMMMMMMMMMcCB',
      'BCcMMEeMMMEeMcCB',
      'BCcMMEEMMMEEMcCB',
      'BCcMMMMmmMMMMcCB',
      'BCCcMMmmmmMMcCCB',
      'BBCCcMMMMMMcCCBB',
      'BRCCCccccccCCCRB',
      'BRRPPPPppPPPPRRB',
      'BPPPPPppppPPPPPB',
      'BPPPPPPPPPPPPPPB',
      'BBBBBBBBBBBBBBBB',
    ],
  },

  // Umbravex: Glowing purple Eclipse Apex silhouette
  portrait_umbravex: {
    accentColor: 0xa855f7,
    palette: {
      '.': '#080210', // Dark background
      'B': '#030006', // Border
      'R': '#a855f7', // Elemental rim (purple)
      'H': '#3b0764', // Obsidian horns
      'h': '#d8b4fe', // Horn tip glow
      'V': '#0f0520', // Void shadow silhouette
      'v': '#2e1065', // Void body shade
      'E': '#c084fc', // Glowing apex eye
      'e': '#ffffff', // Eye core spark
      'A': '#7e22ce', // Eclipse aura
      'a': '#e9d5ff', // Aura sparkle
    },
    grid: [
      'BBBBBBBBBBBBBBBB',
      'BRRH........HRRB',
      'BRhHH......HHhRB',
      'BhHHHH....HHHHhB',
      'BHHHVVVVVVVVHHHB',
      'B.HVVvvvvvvVVH.B',
      'B.VVvEeAAEeavV.B',
      'BAVVvEEAAvEEvVAB',
      'BaVVVvvvvvvVVVaB',
      'B.VVVVvvvvVVVV.B',
      'BB.VVVVVVVVVV.BB',
      'BRA.VVVVVVVV.ARB',
      'BRRaVVVvvVVVaRRB',
      'BVVVVVvvvvVVVVVB',
      'BVVVVVVVVVVVVVVB',
      'BBBBBBBBBBBBBBBB',
    ],
  },
};

// ============================================================================
// Procedural Canvas Drawing Functions for 3 Chapter Arena Backdrops (640x360)
// ============================================================================

/**
 * Chapter 2 — Teluk Azure Arena (640x360)
 * Wide moonlit turquoise bay, layered pixel ocean waves, coastal rock arches & lighthouse silhouette
 */
function drawAzureArena(ctx) {
  ctx.imageSmoothingEnabled = false;

  // 1. Twilight Oceanic Sky Gradient (width 640, height 170)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 170);
  skyGrad.addColorStop(0.0, '#020e1c');
  skyGrad.addColorStop(0.3, '#05273b');
  skyGrad.addColorStop(0.65, '#0a4b69');
  skyGrad.addColorStop(0.85, '#116e87');
  skyGrad.addColorStop(1.0, '#1a8b9f');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 640, 170);

  // 2. Crescent Moon (Center-Left: 130, 48)
  ctx.fillStyle = '#bae6fd';
  ctx.beginPath();
  ctx.arc(130, 48, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(128, 46, 17, 0, Math.PI * 2);
  ctx.fill();
  // Crescent shadow cutout
  ctx.fillStyle = '#05273b';
  ctx.beginPath();
  ctx.arc(138, 43, 18, 0, Math.PI * 2);
  ctx.fill();

  // Distant stars across 640 width
  const stars = [
    [24, 20], [65, 30], [105, 18], [175, 25], [220, 32], [270, 15],
    [315, 28], [360, 16], [410, 35], [455, 22], [505, 18], [545, 30],
    [590, 20], [625, 36], [40, 65], [180, 70], [250, 60], [330, 75],
    [395, 62], [470, 80], [530, 65], [605, 72],
  ];
  ctx.fillStyle = '#e0f2fe';
  for (const [sx, sy] of stars) {
    ctx.fillRect(sx, sy, 2, 2);
  }

  // 3. Moonlit Shimmer on Sea below Crescent Moon
  ctx.fillStyle = '#7dd3fc';
  for (let y = 162; y < 225; y += 4) {
    const spread = (y - 158) * 1.5;
    const shimmerX = 130 + ((y * 13) % 24) - 12;
    ctx.fillRect(shimmerX - spread / 2, y, spread, 2);
  }

  // 4. Distant Coastal Rock Arches & Sea Stacks & Lighthouse Silhouette
  // Distant headland & sea stacks
  ctx.fillStyle = '#081d2d';
  ctx.beginPath();
  ctx.moveTo(0, 165);
  ctx.lineTo(40, 138);
  ctx.lineTo(85, 154);
  ctx.lineTo(135, 128);
  ctx.lineTo(180, 150);
  ctx.lineTo(210, 125);
  // Natural Coastal Rock Arch (X: 210..270)
  ctx.lineTo(270, 125);
  ctx.lineTo(290, 152);
  ctx.lineTo(340, 132);
  ctx.lineTo(390, 155);
  ctx.lineTo(440, 136);
  ctx.lineTo(500, 150);
  ctx.lineTo(540, 120);
  // Lighthouse Headland (X: 540..640)
  ctx.lineTo(580, 115);
  ctx.lineTo(640, 138);
  ctx.lineTo(640, 172);
  ctx.lineTo(0, 172);
  ctx.closePath();
  ctx.fill();

  // Coastal Rock Arch Opening cutout (hole showing sea/moonlight)
  ctx.fillStyle = '#106e87';
  ctx.beginPath();
  ctx.ellipse(240, 148, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lighthouse silhouette atop headland (X: 575)
  ctx.fillStyle = '#05131f';
  ctx.fillRect(572, 85, 8, 30); // Tower shaft
  ctx.fillRect(570, 80, 12, 6);  // Lantern room
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(572, 81, 8, 4);   // Luminous beacon lamp
  // Beacon beam light cone across the bay
  ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
  ctx.beginPath();
  ctx.moveTo(570, 83);
  ctx.lineTo(420, 115);
  ctx.lineTo(430, 145);
  ctx.closePath();
  ctx.fill();

  // 5. Ocean Water & Layered Pixel Ocean Waves (y: 165..225 across 640 width)
  const oceanGrad = ctx.createLinearGradient(0, 165, 0, 225);
  oceanGrad.addColorStop(0.0, '#035380');
  oceanGrad.addColorStop(0.5, '#0284c7');
  oceanGrad.addColorStop(1.0, '#0ea5e9');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 165, 640, 60);

  // Stepped Pixel Waves & Seafoam Crests
  const waveLayers = [
    { y: 172, color: '#38bdf8', foam: '#bae6fd' },
    { y: 184, color: '#0ea5e9', foam: '#e0f2fe' },
    { y: 196, color: '#38bdf8', foam: '#ffffff' },
    { y: 208, color: '#7dd3fc', foam: '#bae6fd' },
    { y: 220, color: '#0284c7', foam: '#e0f2fe' },
  ];
  for (const wave of waveLayers) {
    ctx.fillStyle = wave.color;
    for (let wx = 0; wx < 640; wx += 24) {
      const offset = (wx * 7) % 6;
      ctx.fillRect(wx, wave.y + offset, 16, 3);
      ctx.fillStyle = wave.foam;
      ctx.fillRect(wx + 2, wave.y + offset - 1, 10, 1);
      ctx.fillStyle = wave.color;
    }
  }

  // 6. Coastal Bedrock & Sandy Shelf Ground (y: 215..360, width 640)
  const groundGrad = ctx.createLinearGradient(0, 215, 0, 360);
  groundGrad.addColorStop(0.0, '#062030');
  groundGrad.addColorStop(0.4, '#082b40');
  groundGrad.addColorStop(1.0, '#03131c');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 215, 640, 145);

  // Coastal Bioluminescent Plankton across 640 width
  const plankton = [
    [25, 230, '#38bdf8'], [75, 250, '#2dd4bf'], [135, 240, '#a7f3d0'],
    [195, 225, '#38bdf8'], [250, 245, '#67e8f9'], [310, 235, '#2dd4bf'],
    [370, 250, '#38bdf8'], [430, 230, '#a7f3d0'], [490, 245, '#67e8f9'],
    [550, 235, '#2dd4bf'], [610, 240, '#38bdf8'], [40, 280, '#2dd4bf'],
    [150, 275, '#38bdf8'], [230, 270, '#bae6fd'], [290, 290, '#2dd4bf'],
    [380, 280, '#38bdf8'], [450, 275, '#67e8f9'], [520, 285, '#2dd4bf'],
    [590, 275, '#bae6fd'], [80, 320, '#67e8f9'], [200, 315, '#38bdf8'],
    [350, 325, '#2dd4bf'], [480, 320, '#38bdf8'], [570, 330, '#67e8f9'],
  ];
  for (const [px, py, pcol] of plankton) {
    ctx.fillStyle = pcol;
    ctx.fillRect(px, py, 2, 2);
  }

  // Open coastal shelf arena ground (Dynamic battle platforms drawn cleanly by BattleScene)
}

/**
 * Chapter 3 — Kawah Ignis Arena (640x360)
 * Wide volcanic caldera, jagged basalt cliffs, glowing magma rivers & drifting ember ash
 */
function drawIgnisArena(ctx) {
  ctx.imageSmoothingEnabled = false;

  // 1. Dark Volcanic Ash & Smoke Sky Gradient (width 640, height 175)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 175);
  skyGrad.addColorStop(0.0, '#120204');
  skyGrad.addColorStop(0.3, '#2a0608');
  skyGrad.addColorStop(0.65, '#5c0f0a');
  skyGrad.addColorStop(0.85, '#8c140d');
  skyGrad.addColorStop(1.0, '#b91c1c');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 640, 175);

  // 2. Wide Volcanic Caldera & Jagged Cliffs Silhouette (width 640)
  ctx.fillStyle = '#200709';
  ctx.beginPath();
  ctx.moveTo(0, 175);
  ctx.lineTo(50, 130);
  ctx.lineTo(110, 155);
  ctx.lineTo(170, 105); // West caldera ridge
  ctx.lineTo(220, 120);
  ctx.lineTo(280, 90);  // Center-west caldera cone
  ctx.lineTo(340, 135);
  ctx.lineTo(410, 95);  // Central eruption peak
  ctx.lineTo(470, 125);
  ctx.lineTo(530, 85);  // East smoking caldera cone
  ctx.lineTo(590, 140);
  ctx.lineTo(640, 125);
  ctx.lineTo(640, 185);
  ctx.lineTo(0, 185);
  ctx.closePath();
  ctx.fill();

  // Glowing Lava Cascades from Caldera Peaks
  const lavaFalls = [
    [168, 110, 4, 38],
    [278, 95, 5, 45],
    [408, 100, 5, 48],
    [528, 90, 5, 50],
  ];
  for (const [lx, ly, lw, lh] of lavaFalls) {
    ctx.fillStyle = '#f97316';
    ctx.fillRect(lx, ly, lw, lh);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(lx + 1, ly + 4, Math.max(1, lw - 2), lh - 10);
  }

  // 3. Jagged Basalt Hexagonal Columns (Left & Right colonnades)
  ctx.fillStyle = '#1c1917';
  // Left basalt colonnade (X: 0..80)
  for (let bx = 0; bx < 80; bx += 10) {
    const colH = 35 + ((bx * 13) % 25);
    ctx.fillRect(bx, 180 - colH, 9, colH + 20);
    ctx.fillStyle = '#292524';
    ctx.fillRect(bx + 1, 180 - colH, 7, 2);
    ctx.fillStyle = '#1c1917';
  }
  // Right basalt colonnade (X: 560..640)
  for (let bx = 560; bx < 640; bx += 10) {
    const colH = 38 + ((bx * 17) % 25);
    ctx.fillRect(bx, 180 - colH, 9, colH + 20);
    ctx.fillStyle = '#292524';
    ctx.fillRect(bx + 1, 180 - colH, 7, 2);
    ctx.fillStyle = '#1c1917';
  }

  // 4. Caldera Basalt Floor Base (y: 175..360, width 640)
  const floorGrad = ctx.createLinearGradient(0, 175, 0, 360);
  floorGrad.addColorStop(0.0, '#1c1012');
  floorGrad.addColorStop(0.4, '#241416');
  floorGrad.addColorStop(1.0, '#0e0506');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 175, 640, 185);

  // 5. Glowing Magma Rivers across the floor
  const fissures = [
    // Magma River 1 (Main jagged river across floor)
    [[0, 245], [55, 238], [120, 248], [195, 240], [280, 252], [370, 244], [460, 254], [550, 246], [640, 252]],
    // Magma River 2 (Lower branching river)
    [[70, 275], [150, 285], [230, 276], [320, 290], [420, 280], [510, 292], [600, 284]],
    // Magma River 3 (Forefront tributary)
    [[140, 320], [260, 335], [380, 325], [490, 338]],
  ];
  for (const line of fissures) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    for (let i = 1; i < line.length; i++) ctx.lineTo(line[i][0], line[i][1]);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    for (let i = 1; i < line.length; i++) ctx.lineTo(line[i][0], line[i][1]);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    for (let i = 1; i < line.length; i++) ctx.lineTo(line[i][0], line[i][1]);
    ctx.stroke();
  }

  // 6. Drifting Ember Ash rising across panoramic sky
  const embers = [
    [35, 60, '#fef08a'], [80, 45, '#f97316'], [140, 70, '#ef4444'],
    [195, 40, '#fef08a'], [245, 55, '#f97316'], [285, 35, '#ef4444'],
    [330, 65, '#fef08a'], [380, 45, '#f97316'], [430, 75, '#ef4444'],
    [485, 35, '#fef08a'], [535, 60, '#f97316'], [580, 40, '#ef4444'],
    [620, 70, '#fef08a'], [60, 115, '#f97316'], [120, 105, '#fef08a'],
    [210, 95, '#ef4444'], [265, 85, '#fef08a'], [350, 110, '#f97316'],
    [415, 95, '#fef08a'], [475, 115, '#ef4444'], [545, 90, '#fef08a'],
    [605, 120, '#f97316'], [45, 195, '#fef08a'], [160, 210, '#f97316'],
    [280, 205, '#ef4444'], [390, 215, '#fef08a'], [510, 200, '#f97316'],
    [615, 210, '#ef4444'],
  ];
  for (const [ex, ey, ecol] of embers) {
    ctx.fillStyle = ecol;
    ctx.fillRect(ex, ey, 2, 2);
  }

  // Open caldera basalt arena floor (Dynamic battle platforms drawn cleanly by BattleScene)
}

/**
 * Chapter 4 — Menara Eclipse Arena (640x360)
 * Wide violet-indigo cosmos, colossal fractured Eclipse Rift portal glowing in the sky, floating obsidian ruins
 */
function drawEclipseArena(ctx) {
  ctx.imageSmoothingEnabled = false;

  // 1. Deep Cosmic Void Sky Gradient (width 640, height 210)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 210);
  skyGrad.addColorStop(0.0, '#020006');
  skyGrad.addColorStop(0.25, '#0b0216');
  skyGrad.addColorStop(0.6, '#1f0537');
  skyGrad.addColorStop(0.85, '#3b0764');
  skyGrad.addColorStop(1.0, '#170327');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 640, 210);

  // 2. Cosmic Void Starfield across 640 width
  const voidStars = [
    [15, 18], [42, 35], [85, 22], [120, 48], [155, 16], [215, 30],
    [260, 18], [295, 45], [345, 20], [390, 42], [435, 16], [480, 34],
    [525, 22], [570, 46], [610, 18], [35, 75], [90, 85], [160, 95],
    [245, 80], [380, 90], [450, 78], [515, 88], [585, 76], [625, 92],
    [60, 130], [280, 140], [360, 135], [490, 145], [560, 130], [620, 155],
    [25, 170], [530, 175], [600, 180],
  ];
  ctx.fillStyle = '#ffffff';
  for (const [vx, vy] of voidStars) {
    ctx.fillRect(vx, vy, 2, 2);
  }
  ctx.fillStyle = '#c084fc';
  ctx.fillRect(110, 32, 2, 2);
  ctx.fillRect(250, 40, 2, 2);
  ctx.fillRect(390, 28, 2, 2);
  ctx.fillRect(520, 38, 2, 2);
  ctx.fillRect(70, 90, 2, 2);
  ctx.fillRect(470, 92, 2, 2);

  // 3. Colossal Fractured Eclipse Rift Portal (Center Sky: 320, 75)
  // Outer coronal flare
  ctx.fillStyle = '#4c1d95';
  ctx.beginPath();
  ctx.ellipse(320, 75, 96, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b21a8';
  ctx.beginPath();
  ctx.ellipse(320, 75, 78, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  ctx.ellipse(320, 75, 60, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.ellipse(320, 75, 42, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  // Black Hole Singularity Void Core
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(320, 75, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spacetime Fracture Lightning Tendrils branching across cosmic void
  ctx.strokeStyle = '#f3e8ff';
  ctx.lineWidth = 1;
  const tendrils = [
    [[294, 75], [260, 60], [215, 68], [170, 50], [130, 62]],
    [[346, 75], [380, 62], [425, 70], [470, 52], [510, 65]],
    [[320, 63], [328, 40], [318, 22], [324, 8]],
    [[320, 87], [312, 110], [325, 130]],
    [[302, 68], [275, 45], [240, 35]],
    [[338, 68], [365, 45], [400, 32]],
  ];
  for (const t of tendrils) {
    ctx.beginPath();
    ctx.moveTo(t[0][0], t[0][1]);
    for (let i = 1; i < t.length; i++) ctx.lineTo(t[i][0], t[i][1]);
    ctx.stroke();
  }

  // 4. Weightless Floating Obsidian Ruins in Midground (across 640 width)
  const ruins = [
    [40, 120, 24, 15], [95, 142, 18, 22], [150, 155, 28, 14],
    [220, 135, 26, 18], [420, 135, 26, 18], [480, 115, 32, 18],
    [540, 145, 20, 24], [590, 125, 24, 16],
  ];
  for (const [rx, ry, rw, rh] of ruins) {
    ctx.fillStyle = '#0f071f';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(rx + 2, ry, rw - 4, 2);
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(rx + rw / 2 - 1, ry + rh / 2 - 1, 2, 2); // Core rift rune
  }

  // 5. Cosmic Abyss Floor Base (y: 205..360, width 640)
  const floorGrad = ctx.createLinearGradient(0, 205, 0, 360);
  floorGrad.addColorStop(0.0, '#090214');
  floorGrad.addColorStop(0.4, '#15062a');
  floorGrad.addColorStop(1.0, '#04010a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 205, 640, 155);

  // Floating Cosmic Void Motes across 640 width
  const motes = [
    [28, 225, '#c084fc'], [82, 245, '#e9d5ff'], [145, 235, '#38bdf8'],
    [205, 220, '#a855f7'], [265, 240, '#c084fc'], [330, 225, '#e9d5ff'],
    [390, 245, '#38bdf8'], [450, 220, '#a855f7'], [510, 240, '#c084fc'],
    [570, 230, '#e9d5ff'], [620, 245, '#38bdf8'], [45, 275, '#a855f7'],
    [165, 265, '#c084fc'], [240, 280, '#38bdf8'], [320, 270, '#e9d5ff'],
    [400, 285, '#a855f7'], [480, 265, '#c084fc'], [550, 280, '#38bdf8'],
    [605, 295, '#e9d5ff'], [95, 320, '#c084fc'], [225, 315, '#a855f7'],
    [360, 325, '#38bdf8'], [490, 315, '#c084fc'], [580, 330, '#a855f7'],
  ];
  for (const [mx, my, mcol] of motes) {
    ctx.fillStyle = mcol;
    ctx.fillRect(mx, my, 2, 2);
  }

  // Open cosmic abyss arena floor (Dynamic battle platforms drawn cleanly by BattleScene)
}

// ============================================================================
// Main Registration Function (Exported)
// ============================================================================

/**
 * Registers all story campaign pixel textures:
 * - 5 Character Portraits (48x48)
 * - 3 Chapter Battle Arena Backdrops (640x360)
 *
 * Idempotent: Skips any texture that already exists in scene.textures.
 *
 * @param {Phaser.Scene} scene
 */
export function registerStoryTextures(scene) {
  if (!scene || !scene.textures) return;

  // --------------------------------------------------------------------------
  // 1. Character Portraits (48x48: drawn 16x16 scaled 3x)
  // --------------------------------------------------------------------------
  const scale = 3;
  const portraitSize = 16 * scale; // 48px

  for (const [key, def] of Object.entries(PORTRAIT_DEFINITIONS)) {
    if (scene.textures.exists(key)) continue;

    const tex = createOrGetCanvasTexture(scene, key, portraitSize, portraitSize);
    if (tex && tex.context) {
      const ctx = tex.context;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, portraitSize, portraitSize);

      for (let y = 0; y < 16; y++) {
        const row = def.grid[y];
        if (!row) continue;
        for (let x = 0; x < 16; x++) {
          const char = row[x];
          const color = def.palette[char] ?? def.palette['.'];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }

      if (typeof tex.refresh === 'function') {
        tex.refresh();
      }
    } else if (typeof scene.make?.graphics === 'function') {
      // Graphics fallback for environments lacking canvas context
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x0f172a, 1);
      g.fillRect(0, 0, portraitSize, portraitSize);
      g.fillStyle(def.accentColor, 1);
      g.fillRect(6, 6, 36, 36);
      g.generateTexture(key, portraitSize, portraitSize);
      g.destroy();
    }
  }

  // --------------------------------------------------------------------------
  // 1b. Full-Body Standing Pixel-Art Characters (20x22 scaled 3x -> 60x66, 2 frames each)
  // - char_mc_0 & char_mc_1: Player MC (Headband, emerald tunic, blue scarf)
  // - char_orin_0 & char_orin_1: Prof. Orin (Silver hair, glasses, lab coat, cyan scarf, datapad)
  // - char_kael_0 & char_kael_1: Rival Kael (Spiky fiery hair, visor, crimson-trimmed jacket, cape)
  // - char_warden_0 & char_warden_1: Rift Warden (Crimson cowl, porcelain mask, glowing eyes, obsidian cloak)
  // --------------------------------------------------------------------------
  const standingCharacters = [
    {
      prefix: 'char_mc',
      palette: {
        '.': null,
        'O': '#050811', // Dark outline
        'H': '#78350f', // Chestnut hair
        'h': '#b45309', // Hair highlight
        'D': '#16a34a', // Green headband
        'd': '#facc15', // Gold headband emblem
        'S': '#fde68a', // Skin
        's': '#f59e0b', // Skin shade
        'E': '#0f172a', // Eye pupil
        'e': '#ffffff', // Eye shine
        'i': '#38bdf8', // Blue iris
        'T': '#047857', // Emerald Tamer tunic
        't': '#34d399', // Tunic trim/highlight
        'C': '#1e3a8a', // Adventurer cape/scarf
        'c': '#38bdf8', // Scarf highlight
        'G': '#f59e0b', // Belt buckle / Rift Orb pouch
        'P': '#1e293b', // Trousers
        'B': '#451a03', // Boots
        'b': '#92400e', // Boot highlight
      },
      frames: [
        [
          '......OOOOOOOO......',
          '.....OHHhHHhHHO.....',
          '....OHHhhHHhhHHO....',
          '....ODDDDddDDDDO....',
          '....OHSSSSSSSSHO....',
          '....OHSEiSSiESHO....',
          '....OHSEeSSeESHO....',
          '.....OSSSssSSSO.....',
          '....OOcCCCCCCcOO....',
          '...OCCtTTTTTTtCCO...',
          '...OCOTTTTTTTTOCO...',
          '...O.OSTTTTTTSO.O...',
          '.....OSTTGTTTSO.....',
          '.....OOTTTTTTOO.....',
          '......OPPPPPPO......',
          '......OPP..PPO......',
          '......OPP..PPO......',
          '......OPP..PPO......',
          '.....OBbO..ObBO.....',
          '.....OBBO..OBBO.....',
          '.....OOOO..OOOO.....',
          '....................',
        ],
        [
          '....................',
          '......OOOOOOOO......',
          '.....OHHhHHhHHO.....',
          '....OHHhhHHhhHHO....',
          '....ODDDDddDDDDO....',
          '....OHSSSSSSSSHO....',
          '....OHSEiSSiESHO....',
          '....OHSEeSSeESHO....',
          '.....OSSSssSSSO.....',
          '...OOccCCCCCCccOO...',
          '..OCCTtTTTTTTtTCCO..',
          '...O.OSTTTTTTSO.O...',
          '.....OSTTGTTTSO.....',
          '.....OOTTTTTTOO.....',
          '......OPPPPPPO......',
          '......OPP..PPO......',
          '......OPP..PPO......',
          '......OPP..PPO......',
          '.....OBbO..ObBO.....',
          '.....OBBO..OBBO.....',
          '.....OOOO..OOOO.....',
          '....................',
        ],
      ],
    },
    {
      prefix: 'char_orin',
      palette: {
        '.': null,
        'O': '#050811', // Dark outline
        'H': '#94a3b8', // Silver scholar hair
        'h': '#f1f5f9', // Hair highlight
        'G': '#cbd5e1', // Glasses frame
        'g': '#ffffff', // Glasses glare
        'S': '#fde68a', // Skin tone
        's': '#f59e0b', // Skin shade
        'E': '#0284c7', // Eye iris
        'C': '#06b6d4', // Cyan scarf
        'c': '#67e8f9', // Scarf highlight
        'L': '#f8fafc', // White lab coat
        'l': '#cbd5e1', // Lab coat shade
        'T': '#1e293b', // Scholar tunic
        't': '#334155', // Tunic fold
        'D': '#0891b2', // Datapad body
        'd': '#38bdf8', // Datapad glowing screen
        'W': '#ffffff', // Datapad screen glow
        'w': '#bae6fd', // Datapad screen cyan glow
        'P': '#334155', // Lab trousers
        'B': '#1e293b', // Shoes
        'b': '#475569', // Shoe highlight
      },
      frames: [
        [
          '......OOOOOOOO......',
          '.....OHHhHHhHHO.....',
          '....OHHhhHHhhHHO....',
          '....OHHHHHHHHHHO....',
          '....OHSSGGSSGGHO....',
          '....OHSGgESGgEHO....',
          '....OHSSGGSSGGHO....',
          '.....OSSSssSSSO.....',
          '....OOcCCCCCCcOO....',
          '...OLLcCCCCCCLLlO...',
          '..OLllLTtTTtTLllLO..',
          '..OLLlLTtTTtTLddDO..',
          '..OLSLlTllTTLSWdDO..',
          '..OLLLlLLLLlLLllLO..',
          '..OLLLlLL..LLlLLLO..',
          '...OLLlPP..PPlLLO...',
          '...OLllPP..PPlLLO...',
          '....O.OPP..PPO.O....',
          '.....OBbO..ObBO.....',
          '.....OBBO..OBBO.....',
          '.....OOOO..OOOO.....',
          '....................',
        ],
        [
          '....................',
          '......OOOOOOOO......',
          '.....OHHhHHhHHO.....',
          '....OHHhhHHhhHHO....',
          '....OHHHHHHHHHHO....',
          '....OHSSGGSSGGHO....',
          '....OHSGgESGgEHO....',
          '....OHSSGGSSGGHO....',
          '.....OSSSssSSSO.....',
          '...OOccCCCCCCccOO...',
          '..OLLccCCCCCCccLLlO.',
          '..OLllLTtTTtTLllLO..',
          '..OLLlLTtTTtTLdDDO..',
          '..OLSLlTllTTLSwWDO..',
          '..OLLLlLLLLlLLllLO..',
          '..OLLLlLL..LLlLLLO..',
          '...OLLlPP..PPlLLO...',
          '....O.OPP..PPO.O....',
          '.....OBbO..ObBO.....',
          '.....OBBO..OBBO.....',
          '.....OOOO..OOOO.....',
          '....................',
        ],
      ],
    },
    {
      prefix: 'char_kael',
      palette: {
        '.': null,
        'O': '#050201', // Dark outline
        'H': '#ea580c', // Fiery orange hair
        'h': '#f97316', // Flame hair highlight
        'Y': '#fde047', // Hair tip flame yellow
        'V': '#f59e0b', // Golden tech visor body
        'v': '#fef08a', // Visor shine flare
        'S': '#fed7aa', // Skin
        's': '#fb923c', // Skin shadow
        'M': '#991b1b', // Smirk mouth
        'J': '#18181b', // Dark jacket
        'j': '#27272a', // Jacket highlight
        'R': '#dc2626', // Crimson jacket trim
        'r': '#ef4444', // Bright crimson trim
        'K': '#b91c1c', // Rival cape trim
        'G': '#f59e0b', // Golden belt buckle / badge
        'P': '#09090b', // Trousers
        'B': '#3f3f46', // Combat boots
        'b': '#71717a', // Boot metal clasp
      },
      frames: [
        [
          '...YY....HH...YY....',
          '..YhhH..HHHH.HhhY...',
          '.OHHhhHHHHHHHHhhHO..',
          '.OHHHHHHHHHHHHHHHO..',
          '..OHHHSSSSSSSSHHHO..',
          '..OHSSVvvVVvvVSSHO..',
          '..OHSSVVVVVVVVSSHO..',
          '...OSSSSMSSMSSSO....',
          '...OORRrRRrRRrROO...',
          '..OKJJJJRRRRJJJJO...',
          '.OKKJJjjJJJJjjJJO...',
          '.OK.OSJJJJJJJSO.O...',
          '.....OSJJGJJSPO.....',
          '.....OJJRRRRJJO.....',
          '.....OKOPPPPPO......',
          '....OK..OPP.PPO.....',
          '........OPP.PPO.....',
          '........OPP.PPO.....',
          '.......OBbO.ObBO....',
          '.......OBBO.OBBO....',
          '.......OOOO.OOOO....',
          '....................',
        ],
        [
          '..YY.....HH....YY...',
          '.YhhH...HHHH..HhhY..',
          '.OHHhhHHHHHHHHhhHO..',
          '.OHHHHHHHHHHHHHHHO..',
          '..OHHHSSSSSSSSHHHO..',
          '..OHSSVvvVVvvVSSHO..',
          '..OHSSVVVVVVVVSSHO..',
          '...OSSSSMSSMSSSO....',
          '..OORRrRRrRRrROO....',
          '.OKKJJJJRRRRJJJJO...',
          'OKKKJJjjJJJJjjJJO...',
          '.OK.OSJJJJJJJSO.O...',
          '..K..OSJJGJJSPO.....',
          '.....OJJRRRRJJO.....',
          '....OKOPPPPPO.......',
          '...OK...OPP.PPO.....',
          '........OPP.PPO.....',
          '........OPP.PPO.....',
          '.......OBbO.ObBO....',
          '.......OBBO.OBBO....',
          '.......OOOO.OOOO....',
          '....................',
        ],
      ],
    },
    {
      prefix: 'char_warden',
      palette: {
        '.': null,
        'O': '#060103', // Dark outline
        'C': '#7f1d1d', // Crimson hood/cowl
        'c': '#991b1b', // Bright hood highlight
        'D': '#450a0a', // Deep hood shadow
        'M': '#f8fafc', // Porcelain mask base
        'm': '#cbd5e1', // Porcelain mask shadow
        'E': '#dc2626', // Crimson eye slit
        'e': '#fca5a5', // Eye flare spark
        'P': '#18181b', // Obsidian pauldrons
        'p': '#27272a', // Armor highlight
        'R': '#b91c1c', // Pauldron rift rune
        'K': '#09090b', // Dark abyss cloak
        'k': '#18181b', // Cloak fold
        'V': '#581c87', // Void rift mist
      },
      frames: [
        [
          '......OOOOOOOO......',
          '.....OCccccCCDO.....',
          '....OCccccccCDDO....',
          '...OCCDccccCDDDCO...',
          '...OCDDMMMMMMDDCO...',
          '..OCDDMMmMMmMMMDCO..',
          '..OCDDMmEeMMmEeMDCO.',
          '..OCDDDMMMMMMDDCO...',
          '..OODDDCCCCCDDDOO...',
          '.OPpRPPDDDDDDPPRpPO.',
          'OPppRPPKKKKKKPPRppPO',
          'OPPppPOKKKKKKOPPppPO',
          '.OOOO.OKKKKKKO.OOOO.',
          '......OKKkKKkKO.....',
          '.....OKKKkkKKKKO....',
          '....OKKKKkkKKKKKO...',
          '....OKKkKKKKkKKKO...',
          '...OKKKkkKKkkKKKKO..',
          '...OKKkKKKKKKkKKKO..',
          '..OKKKkKVVVkKKKKKO..',
          '..OOOOOVVVVVOOOOOO..',
          '....................',
        ],
        [
          '....................',
          '......OOOOOOOO......',
          '.....OCccccCCDO.....',
          '....OCccccccCDDO....',
          '...OCCDccccCDDDCO...',
          '..OCDDMMMMMMDDCO....',
          '..OCDDMmEeMMmEeMDCO.',
          '..OCDDDMMMMMMDDCO...',
          '..OODDDCCCCCDDDOO...',
          '.OPpRPPDDDDDDPPRpPO.',
          'OPppRPPKKKKKKPPRppPO',
          'OPPppPOKKKkKkOPPppPO',
          '.OOOO.OKKKkKkO.OOOO.',
          '......OKkkKKkKO.....',
          '.....OKKkkKKKKKO....',
          '....OKKKkkKKKKKKO...',
          '...OKKKkKKKKkKKKKO..',
          '...OKKkkKKkkKKKKKO..',
          '..OKKKkKKKKKKkKKKKO.',
          '..OKKKkVVVVVVkKKKKO.',
          '..OOOOOVVVVVVVOOOOO.',
          '....................',
        ],
      ],
    },
  ];

  standingCharacters.forEach((charDef) => {
    charDef.frames.forEach((grid, frameIdx) => {
      const key = `${charDef.prefix}_${frameIdx}`;
      if (scene.textures.exists(key)) return;
      const charScale = 3;
      const w = 20 * charScale;
      const h = 22 * charScale;
      const tex = createOrGetCanvasTexture(scene, key, w, h);
      if (tex && tex.context) {
        const ctx = tex.context;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, w, h);
        for (let y = 0; y < grid.length; y++) {
          const row = grid[y];
          for (let x = 0; x < row.length; x++) {
            const col = charDef.palette[row[x]];
            if (col) {
              ctx.fillStyle = col;
              ctx.fillRect(x * charScale, y * charScale, charScale, charScale);
            }
          }
        }
        if (typeof tex.refresh === 'function') tex.refresh();
      }
    });
  });

  // --------------------------------------------------------------------------
  // 2. Chapter Battle Arena Backdrops (640x360)
  // --------------------------------------------------------------------------
  const arenaBackdrops = [
    { key: 'bg_arena_azure', draw: drawAzureArena, fallbackColor: 0x0284c7 },
    { key: 'bg_arena_ignis', draw: drawIgnisArena, fallbackColor: 0xb91c1c },
    { key: 'bg_arena_eclipse', draw: drawEclipseArena, fallbackColor: 0x6b21a8 },
  ];

  for (const arena of arenaBackdrops) {
    if (scene.textures.exists(arena.key)) continue;

    const tex = createOrGetCanvasTexture(scene, arena.key, 640, 360);
    if (tex && tex.context) {
      arena.draw(tex.context);
      if (typeof tex.refresh === 'function') {
        tex.refresh();
      }
    } else if (typeof scene.make?.graphics === 'function') {
      // Graphics fallback
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(arena.fallbackColor, 1);
      g.fillRect(0, 0, 640, 360);
      g.generateTexture(arena.key, 640, 360);
      g.destroy();
    }
  }
}
