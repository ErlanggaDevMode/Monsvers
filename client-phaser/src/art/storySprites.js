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
 * - 3 Chapter Battle Arena Backdrops (360x360 pixel art):
 *   1. bg_arena_azure (turquoise ocean horizon, pixel waves, coastal cliffs, moonlit shimmer)
 *   2. bg_arena_ignis (volcanic sky, glowing lava fissures, basalt pillars, rising embers)
 *   3. bg_arena_eclipse (deep violet starfield, fractured Eclipse Rift portal, floating obsidian ruins)
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
// Procedural Canvas Drawing Functions for 3 Chapter Arena Backdrops (360x360)
// ============================================================================

/**
 * Chapter 2 — Teluk Azure Arena
 * Turquoise ocean horizon, pixel waves, coastal cliffs, moonlit shimmer
 */
function drawAzureArena(ctx) {
  ctx.imageSmoothingEnabled = false;

  // 1. Twilight Oceanic Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 165);
  skyGrad.addColorStop(0.0, '#02101e');
  skyGrad.addColorStop(0.35, '#06293e');
  skyGrad.addColorStop(0.7, '#0b4d6a');
  skyGrad.addColorStop(1.0, '#15758f');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 360, 165);

  // 2. Crescent Moon (Center-Left: 70, 50)
  ctx.fillStyle = '#bae6fd';
  ctx.beginPath();
  ctx.arc(70, 48, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(68, 46, 15, 0, Math.PI * 2);
  ctx.fill();
  // Crescent shadow cutout
  ctx.fillStyle = '#06293e';
  ctx.beginPath();
  ctx.arc(77, 43, 16, 0, Math.PI * 2);
  ctx.fill();

  // Distant stars
  const stars = [
    [24, 20], [130, 25], [175, 18], [220, 32], [270, 15], [315, 28], [340, 42],
    [105, 65], [160, 55], [290, 60], [240, 75], [330, 80],
  ];
  ctx.fillStyle = '#e0f2fe';
  for (const [sx, sy] of stars) {
    ctx.fillRect(sx, sy, 2, 2);
  }

  // 3. Moonlit Shimmer on Sea
  ctx.fillStyle = '#7dd3fc';
  for (let y = 162; y < 225; y += 4) {
    const spread = (y - 160) * 1.4;
    const shimmerX = 70 + ((y * 13) % 24) - 12;
    ctx.fillRect(shimmerX - spread / 2, y, spread, 2);
  }

  // 4. Distant Coastal Sea Stacks & Cliffs Silhouette
  ctx.fillStyle = '#0a2336';
  ctx.beginPath();
  ctx.moveTo(0, 165);
  ctx.lineTo(40, 138);
  ctx.lineTo(85, 154);
  ctx.lineTo(135, 126);
  ctx.lineTo(190, 150);
  ctx.lineTo(240, 134);
  ctx.lineTo(290, 155);
  ctx.lineTo(330, 130);
  ctx.lineTo(360, 148);
  ctx.lineTo(360, 170);
  ctx.lineTo(0, 170);
  ctx.closePath();
  ctx.fill();

  // 5. Ocean Water & Pixel Waves (y: 160..225)
  const oceanGrad = ctx.createLinearGradient(0, 160, 0, 225);
  oceanGrad.addColorStop(0.0, '#0369a1');
  oceanGrad.addColorStop(0.5, '#0284c7');
  oceanGrad.addColorStop(1.0, '#0ea5e9');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 165, 360, 60);

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
    for (let wx = 0; wx < 360; wx += 24) {
      const offset = (wx * 7) % 6;
      ctx.fillRect(wx, wave.y + offset, 16, 3);
      ctx.fillStyle = wave.foam;
      ctx.fillRect(wx + 2, wave.y + offset - 1, 10, 1);
      ctx.fillStyle = wave.color;
    }
  }

  // 6. Coastal Bedrock & Sandy Shelf Ground (y: 215..360)
  const groundGrad = ctx.createLinearGradient(0, 215, 0, 360);
  groundGrad.addColorStop(0.0, '#062030');
  groundGrad.addColorStop(0.4, '#082b40');
  groundGrad.addColorStop(1.0, '#03131c');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 215, 360, 145);

  // Coastal Bioluminescent Plankton
  const plankton = [
    [25, 230, '#38bdf8'], [75, 250, '#2dd4bf'], [135, 240, '#a7f3d0'],
    [195, 225, '#38bdf8'], [250, 245, '#67e8f9'], [310, 235, '#2dd4bf'],
    [40, 280, '#2dd4bf'], [150, 275, '#38bdf8'], [230, 270, '#bae6fd'],
    [290, 290, '#2dd4bf'], [80, 320, '#67e8f9'], [200, 315, '#38bdf8'],
  ];
  for (const [px, py, pcol] of plankton) {
    ctx.fillStyle = pcol;
    ctx.fillRect(px, py, 2, 2);
  }

  // 7. Enemy Platform (Right-Top: center X=270, Y=175)
  // Soft shadow
  ctx.fillStyle = '#020b12';
  ctx.beginPath();
  ctx.ellipse(270, 184, 62, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Basalt foundation
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(270, 178, 58, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Marine stone disk
  ctx.fillStyle = '#0369a1';
  ctx.beginPath();
  ctx.ellipse(270, 174, 55, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Turquoise coral reef battle surface
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.ellipse(270, 170, 52, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.ellipse(270, 168, 48, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 8. Player Platform (Left-Bottom: center X=95, Y=290)
  // Soft shadow
  ctx.fillStyle = '#020b12';
  ctx.beginPath();
  ctx.ellipse(95, 302, 78, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ancient tide-temple masonry base
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(95, 294, 74, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0369a1';
  ctx.beginPath();
  ctx.ellipse(95, 289, 70, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Azure marble battle disk
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.ellipse(95, 284, 66, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.ellipse(95, 282, 60, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Center tidal glyph
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(92, 280, 6, 2);
  ctx.fillRect(94, 278, 2, 6);
}

/**
 * Chapter 3 — Kawah Ignis Arena
 * Volcanic sky, glowing lava fissures, basalt pillars, rising embers
 */
function drawIgnisArena(ctx) {
  ctx.imageSmoothingEnabled = false;

  // 1. Dark Volcanic Ash & Smoke Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 175);
  skyGrad.addColorStop(0.0, '#130304');
  skyGrad.addColorStop(0.35, '#2e0809');
  skyGrad.addColorStop(0.7, '#62110a');
  skyGrad.addColorStop(1.0, '#b91c1c');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 360, 175);

  // 2. Distant Caldera Volcano Crater Silhouette
  ctx.fillStyle = '#22080a';
  ctx.beginPath();
  ctx.moveTo(0, 175);
  ctx.lineTo(50, 130);
  ctx.lineTo(110, 155);
  ctx.lineTo(170, 105); // Caldera peak
  ctx.lineTo(210, 115);
  ctx.lineTo(270, 95);  // Main smoking cone
  ctx.lineTo(320, 140);
  ctx.lineTo(360, 130);
  ctx.lineTo(360, 180);
  ctx.lineTo(0, 180);
  ctx.closePath();
  ctx.fill();

  // Glowing Lava Cascades from Caldera Peak
  ctx.fillStyle = '#f97316';
  ctx.fillRect(268, 100, 5, 45);
  ctx.fillRect(168, 110, 4, 35);
  ctx.fillStyle = '#fde047';
  ctx.fillRect(269, 105, 3, 30);
  ctx.fillRect(169, 114, 2, 20);

  // 3. Basalt Hexagonal Columns (Left & Right framing)
  ctx.fillStyle = '#1c1917';
  for (let bx = 0; bx < 60; bx += 10) {
    const colH = 35 + ((bx * 13) % 25);
    ctx.fillRect(bx, 180 - colH, 9, colH + 20);
    ctx.fillStyle = '#292524';
    ctx.fillRect(bx + 1, 180 - colH, 7, 2);
    ctx.fillStyle = '#1c1917';
  }
  for (let bx = 300; bx < 360; bx += 10) {
    const colH = 40 + ((bx * 17) % 25);
    ctx.fillRect(bx, 180 - colH, 9, colH + 20);
    ctx.fillStyle = '#292524';
    ctx.fillRect(bx + 1, 180 - colH, 7, 2);
    ctx.fillStyle = '#1c1917';
  }

  // 4. Caldera Basalt Floor Base (y: 175..360)
  const floorGrad = ctx.createLinearGradient(0, 175, 0, 360);
  floorGrad.addColorStop(0.0, '#1c1012');
  floorGrad.addColorStop(0.4, '#241416');
  floorGrad.addColorStop(1.0, '#0e0506');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 175, 360, 185);

  // 5. Glowing Lava Fissures across the floor
  const fissures = [
    // Fissure 1 (Horizontal jagged branch)
    [[0, 245], [45, 240], [90, 248], [150, 242], [220, 252], [290, 246], [360, 250]],
    // Fissure 2 (Diagonal branch)
    [[60, 275], [120, 285], [180, 278], [240, 290], [310, 282]],
  ];
  for (const line of fissures) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    for (let i = 1; i < line.length; i++) ctx.lineTo(line[i][0], line[i][1]);
    ctx.stroke();

    ctx.lineWidth = 2;
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

  // 6. Rising Fiery Embers
  const embers = [
    [35, 60, '#fef08a'], [80, 45, '#f97316'], [140, 70, '#ef4444'],
    [195, 40, '#fef08a'], [245, 55, '#f97316'], [285, 35, '#ef4444'],
    [330, 65, '#fef08a'], [60, 115, '#f97316'], [120, 105, '#fef08a'],
    [210, 95, '#ef4444'], [265, 85, '#fef08a'], [315, 120, '#f97316'],
    [45, 195, '#fef08a'], [160, 210, '#f97316'], [280, 205, '#ef4444'],
  ];
  for (const [ex, ey, ecol] of embers) {
    ctx.fillStyle = ecol;
    ctx.fillRect(ex, ey, 2, 2);
  }

  // 7. Enemy Platform (Right-Top: center X=270, Y=175)
  // Soft shadow
  ctx.fillStyle = '#080203';
  ctx.beginPath();
  ctx.ellipse(270, 184, 62, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Basalt foundation
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(270, 178, 58, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Magma rim
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.ellipse(270, 174, 55, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Obsidian volcanic battle plate
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.ellipse(270, 170, 52, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.ellipse(270, 168, 48, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 8. Player Platform (Left-Bottom: center X=95, Y=290)
  // Soft shadow
  ctx.fillStyle = '#060102';
  ctx.beginPath();
  ctx.ellipse(95, 302, 78, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hexagonal basalt base
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(95, 294, 74, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.ellipse(95, 289, 70, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Obsidian volcanic battle plate
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.ellipse(95, 284, 66, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.ellipse(95, 282, 60, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Center incandescent flame glyph
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(92, 280, 6, 2);
  ctx.fillRect(94, 278, 2, 6);
}

/**
 * Chapter 4 — Menara Eclipse Arena
 * Deep violet starfield, fractured Eclipse Rift portal, floating obsidian ruins
 */
function drawEclipseArena(ctx) {
  ctx.imageSmoothingEnabled = false;

  // 1. Deep Cosmic Void Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 210);
  skyGrad.addColorStop(0.0, '#030008');
  skyGrad.addColorStop(0.3, '#0e021c');
  skyGrad.addColorStop(0.65, '#22063d');
  skyGrad.addColorStop(0.85, '#3b0764');
  skyGrad.addColorStop(1.0, '#19042b');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 360, 210);

  // 2. Cosmic Void Starfield
  const voidStars = [
    [15, 18], [42, 35], [85, 22], [120, 48], [155, 16], [215, 30],
    [260, 18], [295, 45], [335, 25], [35, 75], [90, 85], [245, 80],
    [320, 95], [60, 130], [280, 140], [330, 155], [25, 170],
  ];
  ctx.fillStyle = '#ffffff';
  for (const [vx, vy] of voidStars) {
    ctx.fillRect(vx, vy, 2, 2);
  }
  ctx.fillStyle = '#c084fc';
  ctx.fillRect(110, 32, 2, 2);
  ctx.fillRect(250, 40, 2, 2);
  ctx.fillRect(70, 90, 2, 2);

  // 3. Fractured Eclipse Rift Portal (Center Sky: 180, 72)
  // Outer coronal flare
  ctx.fillStyle = '#581c87';
  ctx.beginPath();
  ctx.ellipse(180, 72, 54, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7e22ce';
  ctx.beginPath();
  ctx.ellipse(180, 72, 44, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.ellipse(180, 72, 34, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.ellipse(180, 72, 24, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  // Black Hole Singularity Void Core
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(180, 72, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spacetime Fracture Lightning Tendrils
  ctx.strokeStyle = '#e9d5ff';
  ctx.lineWidth = 1;
  const tendrils = [
    [[164, 72], [140, 60], [115, 68], [90, 52]],
    [[196, 72], [220, 62], [245, 70], [275, 55]],
    [[180, 62], [185, 42], [178, 25], [182, 10]],
    [[180, 82], [175, 102], [182, 120]],
  ];
  for (const t of tendrils) {
    ctx.beginPath();
    ctx.moveTo(t[0][0], t[0][1]);
    for (let i = 1; i < t.length; i++) ctx.lineTo(t[i][0], t[i][1]);
    ctx.stroke();
  }

  // 4. Weightless Floating Obsidian Ruins in Midground
  const ruins = [
    [40, 120, 22, 14], [85, 140, 16, 20], [130, 155, 26, 12],
    [230, 135, 24, 16], [290, 115, 30, 18], [325, 145, 18, 22],
  ];
  for (const [rx, ry, rw, rh] of ruins) {
    ctx.fillStyle = '#0f071f';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(rx + 2, ry, rw - 4, 2);
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(rx + rw / 2 - 1, ry + rh / 2 - 1, 2, 2); // Core rift rune
  }

  // 5. Cosmic Abyss Floor Base (y: 205..360)
  const floorGrad = ctx.createLinearGradient(0, 205, 0, 360);
  floorGrad.addColorStop(0.0, '#090214');
  floorGrad.addColorStop(0.4, '#15062a');
  floorGrad.addColorStop(1.0, '#04010a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 205, 360, 155);

  // Floating Cosmic Void Motes
  const motes = [
    [28, 225, '#c084fc'], [82, 245, '#e9d5ff'], [145, 235, '#38bdf8'],
    [205, 220, '#a855f7'], [265, 240, '#c084fc'], [320, 230, '#e9d5ff'],
    [45, 275, '#a855f7'], [165, 265, '#c084fc'], [240, 280, '#38bdf8'],
    [305, 295, '#e9d5ff'], [95, 320, '#c084fc'], [225, 315, '#a855f7'],
  ];
  for (const [mx, my, mcol] of motes) {
    ctx.fillStyle = mcol;
    ctx.fillRect(mx, my, 2, 2);
  }

  // 6. Enemy Platform (Right-Top: center X=270, Y=175)
  // Soft void shadow
  ctx.fillStyle = '#020005';
  ctx.beginPath();
  ctx.ellipse(270, 184, 62, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Obsidian ruin foundation
  ctx.fillStyle = '#1e0836';
  ctx.beginPath();
  ctx.ellipse(270, 178, 58, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Arcane rift rim
  ctx.fillStyle = '#6b21a8';
  ctx.beginPath();
  ctx.ellipse(270, 174, 55, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Void crystal battle surface
  ctx.fillStyle = '#3b0764';
  ctx.beginPath();
  ctx.ellipse(270, 170, 52, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.ellipse(270, 168, 48, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 7. Player Platform (Left-Bottom: center X=95, Y=290)
  // Soft void shadow
  ctx.fillStyle = '#020005';
  ctx.beginPath();
  ctx.ellipse(95, 302, 78, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ancient sanctuary dias masonry
  ctx.fillStyle = '#1e0836';
  ctx.beginPath();
  ctx.ellipse(95, 294, 74, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b21a8';
  ctx.beginPath();
  ctx.ellipse(95, 289, 70, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Astral purple battle plate
  ctx.fillStyle = '#4c1d95';
  ctx.beginPath();
  ctx.ellipse(95, 284, 66, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.ellipse(95, 282, 60, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Center celestial seal glyph
  ctx.fillStyle = '#f3e8ff';
  ctx.fillRect(92, 280, 6, 2);
  ctx.fillRect(94, 278, 2, 6);
}

// ============================================================================
// Main Registration Function (Exported)
// ============================================================================

/**
 * Registers all story campaign pixel textures:
 * - 5 Character Portraits (48x48)
 * - 3 Chapter Battle Arena Backdrops (360x360)
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
  // 2. Chapter Battle Arena Backdrops (360x360)
  // --------------------------------------------------------------------------
  const arenaBackdrops = [
    { key: 'bg_arena_azure', draw: drawAzureArena, fallbackColor: 0x0284c7 },
    { key: 'bg_arena_ignis', draw: drawIgnisArena, fallbackColor: 0xb91c1c },
    { key: 'bg_arena_eclipse', draw: drawEclipseArena, fallbackColor: 0x6b21a8 },
  ];

  for (const arena of arenaBackdrops) {
    if (scene.textures.exists(arena.key)) continue;

    const tex = createOrGetCanvasTexture(scene, arena.key, 360, 360);
    if (tex && tex.context) {
      arena.draw(tex.context);
      if (typeof tex.refresh === 'function') {
        tex.refresh();
      }
    } else if (typeof scene.make?.graphics === 'function') {
      // Graphics fallback
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(arena.fallbackColor, 1);
      g.fillRect(0, 0, 360, 360);
      g.generateTexture(arena.key, 360, 360);
      g.destroy();
    }
  }
}
