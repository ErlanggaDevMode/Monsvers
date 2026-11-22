import { MONSTERS } from '../data/monsters.js';

/**
 * Returns texture key for a given monster and animation frame.
 * @param {string} id
 * @param {number} frame
 * @returns {string}
 */
export function getMonsterTextureKey(id, frame = 0) {
  return `monsver_${id}_${frame}`;
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

function lighten(hex, amt = 0.35) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}

function darken(hex, amt = 0.45) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}

/**
 * Handcrafted 20x20 pixel-art sprite matrices for all 12 unique Monsvers.
 * Legend:
 *  . = transparent
 *  O = dark outline
 *  P = primary body
 *  p = primary light highlight
 *  S = secondary (underbelly / inner ear / muzzle)
 *  A = elemental accent (flames / horns / crystal / lightning / spikes)
 *  a = accent glow / bright flame
 *  D = dark shadow / underbelly / back legs
 *  E = glowing eye
 *  W = eye pupil / shine
 */
const MONSTER_ART_GRIDS = {
  // --- Fire Starter Line ---
  pyrofang: {
    frame0: [
      '....................',
      '.....AA.............',
      '....AaaA...OO.......',
      '...AAaaA..OPPO......',
      '....AAaA.OPPPPO.....',
      '.....AA.OPPPPSPO....',
      '.....OOPPPPEPSPO....',
      '....OPPPPPWEPPO.....',
      '....OPPPPPSPPPO.....',
      '...OPPPPPPPPPPO.....',
      '..OPPPPPPPPPPPPO....',
      '.OPP.OPPPPPPPPPO....',
      '.OP..OPPPPPPPPPO....',
      'AA...OPP..OPP..O....',
      'aA...ODD..ODD.......',
      'AaA..OO...OO........',
      '.AA.................',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '....................',
      '....AA..............',
      '...AaaAA...OO.......',
      '...AaaaA..OPPO......',
      '....AaaA.OPPPPO.....',
      '.....AA.OPPPPSPO....',
      '.....OOPPPPEPSPO....',
      '....OPPPPPWEPPO.....',
      '....OPPPPPSPPPO.....',
      '...OPPPPPPPPPPO.....',
      '..OPPPPPPPPPPPPO....',
      '.OPP.OPPPPPPPPPO....',
      '.OP..OPPPPPPPPPO....',
      '.AA..OPP..OPP..O....',
      '.aA..ODD..ODD.......',
      'AAa..OO...OO........',
      '.AA.................',
      '....................',
      '....................',
      '....................',
    ],
  },

  blazefang: {
    frame0: [
      '........AAAA........',
      '.......AaAAaA.......',
      '......AAaAaaAA..OO..',
      '.....AAaaaaaAA.OPPO.',
      '....AAaaAAAAA.OPPPO.',
      '...AAAaaAPPPPOPPPEO.',
      '...AaaaaPPPPPPPPWEO.',
      '....AAAPPPPPPPPPPOO.',
      '...OOPPPPPPSSSSPO...',
      '..OPPPPPPPSSSSPO....',
      '.OPPPPPPPPPPPPPO....',
      '.OPPP.OPPPPPPPPO....',
      'AAOP..OPPPPPPPPO....',
      'AaaO..OPPO..OPPO....',
      'AAaO..ODDO..ODDO....',
      '.AAO..OOO...OOO.....',
      '..AA................',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '.......AAAAA........',
      '......AaAaaAA.......',
      '.....AAaaaaaAA..OO..',
      '....AAaAaaAaA..OPPO.',
      '...AAAaaAAAAA.OPPPO.',
      '...AaaaaPPPPPOPPPEO.',
      '...AaaAaPPPPPPPPWEO.',
      '....AAAPPPPPPPPPPOO.',
      '...OOPPPPPPSSSSPO...',
      '..OPPPPPPPSSSSPO....',
      '.OPPPPPPPPPPPPPO....',
      '.OPPP.OPPPPPPPPO....',
      '.AAOP.OPPPPPPPPO....',
      'AaaAO.OPPO..OPPO....',
      'AAaaO.ODDO..ODDO....',
      '.AAA..OOO...OOO.....',
      '..AA................',
      '....................',
      '....................',
      '....................',
    ],
  },

  // --- Water Starter Line ---
  aquafin: {
    frame0: [
      '....................',
      '.........AA.........',
      '........AAAA.OO.....',
      '.......AAAAAOPPO....',
      '......AAAaaOPPPPO...',
      '.....AAAAaOPPPPPEO..',
      '....AAAA..OPPPPWEO..',
      '...AAAA...OPPPSPOO..',
      '...AAA...OPPPSSPO...',
      '..AA....OPPPSSSPO...',
      '..AA...OPPPPPPPO....',
      '.AA...OPPP.PPPPO....',
      '.AA...OPP..OPPPO....',
      '..AA..ODD..ODD.O....',
      '...AA.OO...OO.......',
      '....AA..............',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '....................',
      '........AAA.........',
      '.......AAAAA.OO.....',
      '......AAAAaAOPPO....',
      '.....AAAaaaOPPPPO...',
      '....AAAAaaOPPPPPEO..',
      '...AAAA...OPPPPWEO..',
      '..AAAA....OPPPSPOO..',
      '..AAA....OPPPSSPO...',
      '.AA.....OPPPSSSPO...',
      '.AA....OPPPPPPPO....',
      '.AA...OPPP.PPPPO....',
      '..AA..OPP..OPPPO....',
      '..AA..ODD..ODD.O....',
      '...AA.OO...OO.......',
      '....AA..............',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
  },

  tidecrest: {
    frame0: [
      '..........AA........',
      '.........AaaA.......',
      '........AaaaaA..OO..',
      '.......AAaaaaAAOPPO.',
      '......AA..aa..OPPPO.',
      '.....AA..AA..OPPPEO.',
      '....AA..AaaAOPPPWEO.',
      '...AA..AAaaAPPPPOOO.',
      '...AA.AAaaaOPPPSPO..',
      '..AAAAAaaAOPPSSPO...',
      '..AAAAaaAOPPSSPO....',
      '.AAAAaaAOPPPPO......',
      '.AA.AaAOPPPO........',
      'AA..AAOPPPO..OPPO...',
      'AA...ODDDO...ODDO...',
      '.AA...OOO....OOO....',
      '..AA................',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '.........AAA........',
      '........AaaAA.......',
      '.......AaaaaaA..OO..',
      '......AAaaaaaAOPPO..',
      '.....AA..aaa.OPPPO..',
      '....AA..AAA.OPPPEO..',
      '...AA..AaaA.OPPPWEO.',
      '..AA..AAaaA.PPPPOOO.',
      '..AA.AAaaaAOPPPSPO..',
      '.AAAAAaaAAOPPSSPO...',
      '.AAAAaaAAOPPSSPO....',
      'AAAAaaAAOPPPPO......',
      '.AA.AaAOPPPO........',
      '.AA.AAOPPPO..OPPO...',
      'AA...ODDDO...ODDO...',
      '.AA...OOO....OOO....',
      '..AA................',
      '....................',
      '....................',
      '....................',
    ],
  },

  // --- Nature Starter Line ---
  verdantix: {
    frame0: [
      '......AA....AA......',
      '.....AaA...AaA......',
      '....AaaA...AaaA.....',
      '.....AA.OO..AA......',
      '.......OPPO.........',
      '......OPPPPO........',
      '.....OPPPPSPEO......',
      '....OPPPPPSSWEO.....',
      '...OOPPPPPPSSPOO....',
      '..OPPPPPPPSSSPO.....',
      '.OPP.OPPPPPPPPO.....',
      '.OP..OPPPPPPPPO.....',
      '.AA..OPP..OPP.O.....',
      '.aA..ODD..ODD.......',
      'AaA..OO...OO........',
      '.A..................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '.....AA......AA.....',
      '....AaA.....AaA.....',
      '...AaaA.....AaaA....',
      '....AA..OO...AA.....',
      '.......OPPO.........',
      '......OPPPPO........',
      '.....OPPPPSPEO......',
      '....OPPPPPSSWEO.....',
      '...OOPPPPPPSSPOO....',
      '..OPPPPPPPSSSPO.....',
      '.OPP.OPPPPPPPPO.....',
      '.OP..OPPPPPPPPO.....',
      '..AA.OPP..OPP.O.....',
      '.AaA.ODD..ODD.......',
      '.aA..OO...OO........',
      '.AA.................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
  },

  sylvanox: {
    frame0: [
      '...AA........AA.....',
      '..AaaAA....AAaaA....',
      '..AaaaaA..AaaaaA....',
      '...AaaaaAAaaaaA.OO..',
      '....AaaA..AaaA.OPPO.',
      '.....AA....AA.OPPPEO',
      '.......OOOO..OPPPWEO',
      '......OPPPPO.PPPPPOO',
      '.....OPPPPPPPPPPO...',
      '....OPPPPPSSSSPO....',
      '...OPPPPPPPSSSPO....',
      '..OPP.OPPPPPPPPO....',
      '.OPP..OPPPPPPPPO....',
      '.AA...OPPO..OPPO....',
      'AaA...ODDO..ODDO....',
      'AA....OOO...OOO.....',
      '.A..................',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '..AAA........AAA....',
      '.AaaaAA....AAaaaA...',
      '.AaaaaaA..AaaaaaA...',
      '..AaaaaaAAaaaaaA.OO.',
      '...AaaaA..AaaaA.OPPO',
      '....AAA....AAAOPPPEO',
      '.......OOOO..OPPPWEO',
      '......OPPPPO.PPPPPOO',
      '.....OPPPPPPPPPPO...',
      '....OPPPPPSSSSPO....',
      '...OPPPPPPPSSSPO....',
      '..OPP.OPPPPPPPPO....',
      '.OPP..OPPPPPPPPO....',
      '..AA..OPPO..OPPO....',
      '.AaA..ODDO..ODDO....',
      '.AA...OOO...OOO.....',
      '..A.................',
      '....................',
      '....................',
      '....................',
    ],
  },

  // --- Electric Wild Line ---
  sparkit: {
    frame0: [
      '.....AA.............',
      '....AaaA....AA......',
      '...AAaaA...AaaA.....',
      '....AAaA..AAaaA.....',
      '.....AAA...AAA.OO...',
      '.....OPPO.OPPPOPP...',
      '....OPPPPOPPPPEPO...',
      '...OPPPPPPPPPPWPO...',
      '..OPPPAAPPPPPPOO....',
      '..OPPPAAPPPSSPO.....',
      '...OPPPPPPPSSPO.....',
      '....OPPPPPPPPPO.....',
      '.AA.OPP..OPP..O.....',
      'AaaAODD..ODD........',
      '.AaA.OO...OO........',
      '..A.................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '....AAA.............',
      '...AaaaA....AA......',
      '....AAaaA..AaaA.....',
      '.....AAaA.AAaaA.....',
      '......AAA..AAA.OO...',
      '.....OPPO.OPPPOPP...',
      '....OPPPPOPPPPEPO...',
      '...OPPPPPPPPPPWPO...',
      '..OPPPAAPPPPPPOO....',
      '..OPPPAAPPPSSPO.....',
      '...OPPPPPPPSSPO.....',
      '....OPPPPPPPPPO.....',
      '..AAOPP..OPP..O.....',
      '.AaAODD..ODD........',
      'AaaA.OO...OO........',
      '.AA.................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
  },

  voltlynx: {
    frame0: [
      '....AA..............',
      '...AaaA.......AA....',
      '....AaaAA....AaaA...',
      '.....AaaAA..AAaaA...',
      '......AAaA...AAaA...',
      '.......AAA....AAAOO.',
      '.......OPPO..OPPPOPO',
      '......OPPPPO.PPPPEPO',
      '.....OPPPPPPPPPPPWEO',
      '....OPPPPPPPPPPPPOOO',
      '...OPPPAAAPPPSSSPO..',
      '..OPPPPPAAPPPSSSPO..',
      '.OPPPPPPPPPPPPPO....',
      '.OPP..OPPO..OPPO....',
      'AA....ODDO..ODDO....',
      'AaA...OOO...OOO.....',
      '.AA.................',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '...AAA..............',
      '..AaaaA.......AAA...',
      '...AaaAA.....AaaA...',
      '....AaaAA...AAaaA...',
      '.....AAaA....AAaA...',
      '......AAA.....AAAOO.',
      '.......OPPO..OPPPOPO',
      '......OPPPPO.PPPPEPO',
      '.....OPPPPPPPPPPPWEO',
      '....OPPPPPPPPPPPPOOO',
      '...OPPPAAAPPPSSSPO..',
      '..OPPPPPAAPPPSSSPO..',
      '.OPPPPPPPPPPPPPO....',
      '.OPP..OPPO..OPPO....',
      '.AA...ODDO..ODDO....',
      'AAa...OOO...OOO.....',
      'AaA.................',
      '....................',
      '....................',
      '....................',
    ],
  },

  // --- Shadow Wild Line & Final Boss ---
  shadeling: {
    frame0: [
      '.......AA...AA......',
      '......AaaA.AaaA.....',
      '......AaaaAAaaA.....',
      '.......AAaAAaAA.....',
      '......OOPPPPPOO.....',
      '.....OPPPPPPPPPO....',
      '....OPPPEPPPPEPO....',
      '....OPPPWPPPWPOO....',
      '....OPPPPPPPPPPO....',
      '.....OPPPPSPPPO.....',
      '.....OOPPPSSSPO.....',
      '......OPPPSSSPO.....',
      '.....A.OPPPPO.A.....',
      '....AaA.OPPO.AaA....',
      '....AaaA.OO.AaaA....',
      '.....AAaA..AAaA.....',
      '......AAaAAaAA......',
      '.......AaaaAA.......',
      '........AA..........',
      '....................',
    ],
    frame1: [
      '......AAA...AAA.....',
      '.....AaaA...AaaA....',
      '.....AaaaA.AaaaA....',
      '......AAaAAaAA......',
      '......OOPPPPPOO.....',
      '.....OPPPPPPPPPO....',
      '....OPPPEPPPPEPO....',
      '....OPPPWPPPWPOO....',
      '....OPPPPPPPPPPO....',
      '.....OPPPPSPPPO.....',
      '.....OOPPPSSSPO.....',
      '......OPPPSSSPO.....',
      '....AA.OPPPPO.AA....',
      '...AaaA.OPPO.AaaA...',
      '....AaaA.OO.AaaA....',
      '.....AAaA..AAaA.....',
      '......AAaAAaAA......',
      '.......AAAAA........',
      '........AAA.........',
      '....................',
    ],
  },

  umbravex: {
    frame0: [
      '..AA.............AA.',
      '.AaaA...........AaaA',
      'AAaaaA.........AaaaA',
      'AAaaaaA.......AaaaaA',
      '.AAaaaaA.OOO.AaaaaA.',
      '..AAaaaAOPPPOAaaaA..',
      '...AAaaOPPPPPOAaaA..',
      '....AAOPPPPPPPOAA...',
      '...OOPPPEPPPPEPOO...',
      '..OPPPPPWPPPWPPPPO..',
      '.OPPPPPPPPAAPPPPPPO.',
      '.OPPPP..PAAaAP..PPP.',
      '..OPP...PAAaAP...PO.',
      '...OO....PAAP....OO.',
      '.........OPPO.......',
      '........OPPPPO......',
      '.......OPPDDDPPO....',
      '.......ODDO.ODDO....',
      '........OO...OO.....',
      '....................',
    ],
    frame1: [
      '.AAA.............AAA',
      'AaaaA...........Aaaa',
      'AaaaaA.........Aaaaa',
      'AAaaaaA.......AaaaaA',
      '.AAaaaaA.OOO.AaaaaA.',
      '..AAaaaAOPPPOAaaaA..',
      '...AAaaOPPPPPOAaaA..',
      '....AAOPPPPPPPOAA...',
      '...OOPPPEPPPPEPOO...',
      '..OPPPPPWPPPWPPPPO..',
      '.OPPPPPPPPAAPPPPPPO.',
      '.OPPPP..PAAaAP..PPP.',
      '..OPP...PAAaAP...PO.',
      '...OO....PAAP....OO.',
      '.........OPPO.......',
      '........OPPPPO......',
      '.......OPPDDDPPO....',
      '.......ODDO.ODDO....',
      '........OO...OO.....',
      '....................',
    ],
  },

  // --- Chapter Bosses ---
  thornback: {
    frame0: [
      '.........AA.........',
      '........AaaA...AA...',
      '....AA..AaaA..AaaA..',
      '...AaaA.AAaA.AaaA...',
      '...AaaA.AaaA.AaaA...',
      '....AAaAAAAAAaAA....',
      '...OOPPPPPPPPPPOO...',
      '..OPPPPPPPPPPPPPPO..',
      '.OPPPPPPPPPPPPPPPPO.',
      'OPPPAAPPPPPPAAPPPEPO',
      'OPPAAaAPPPPAAaAPWEO.',
      'OPPPAAPPPPPPAAPPPOO.',
      '.OPPPPPPPPPPPPPPPPO.',
      '..OPPPPPSSSSSPPPPO..',
      '...OPPO..OPPO..OPPO.',
      '...ODDO..ODDO..ODDO.',
      '...OOO...OOO...OOO..',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '.........AA.........',
      '........AaaA...AA...',
      '...AAA..AaaA..AaaA..',
      '..AaaaA.AAaA.AaaaA..',
      '..AaaaA.AaaA.AaaaA..',
      '...AAAaAAAAAAaAAA...',
      '...OOPPPPPPPPPPOO...',
      '..OPPPPPPPPPPPPPPO..',
      '.OPPPPPPPPPPPPPPPPO.',
      'OPPPAAPPPPPPAAPPPEPO',
      'OPPAAaAPPPPAAaAPWEO.',
      'OPPPAAPPPPPPAAPPPOO.',
      '.OPPPPPPPPPPPPPPPPO.',
      '..OPPPPPSSSSSPPPPO..',
      '...OPPO..OPPO..OPPO.',
      '...ODDO..ODDO..ODDO.',
      '...OOO...OOO...OOO..',
      '....................',
      '....................',
      '....................',
    ],
  },

  volcarok: {
    frame0: [
      '.......AAAAA........',
      '......AaAAaAA.......',
      '.....AAaaaaaAA......',
      '......AAaAaAA.......',
      '.....OOPPPPPOO......',
      '....OPPPAAPPPPO.....',
      '...OPPPPAAaAPPPO....',
      '..OPPPPPPAAPPPPPO...',
      '..OPPPEPPPPPWPPPO...',
      '.OPPPPAAPPPPAAPPPO..',
      '.OPPPAAaAPPPPAAaAP..',
      'OPPPPAAaAPPPPAAaAPPO',
      'OPPP..PAAP...PAAP.PO',
      '.OPP...PPO...OPP..PO',
      '.ODD...ODDO..ODD..DO',
      '..OO....OO....OO..O.',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    frame1: [
      '......AAAAAAA.......',
      '.....AaaAAaAAa......',
      '....AAaaaaaaaAA.....',
      '.....AAaaAaAAa......',
      '.....OOPPPPPOO......',
      '....OPPPAAPPPPO.....',
      '...OPPPPAAaAPPPO....',
      '..OPPPPPPAAPPPPPO...',
      '..OPPPEPPPPPWPPPO...',
      '.OPPPPAAPPPPAAPPPO..',
      '.OPPPAAaAPPPPAAaAP..',
      'OPPPPAAaAPPPPAAaAPPO',
      'OPPP..PAAP...PAAP.PO',
      '.OPP...PPO...OPP..PO',
      '.ODD...ODDO..ODD..DO',
      '..OO....OO....OO..O.',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
  },
};

/**
 * Safely creates or adds a CanvasTexture to the scene TextureManager.
 * @param {Phaser.Scene} scene
 * @param {string} key
 * @param {number} width
 * @param {number} height
 * @returns {Phaser.Textures.CanvasTexture|null}
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
 * - 24 monster idle frames (12 monsters * 2 frames)
 * - 'bg_arena_solara' (640x360 panoramic pixel arena backdrop)
 * - 'particle_pixel' (4x4)
 * - 'particle_spark' (6x6)
 * - 'icon_orb' (16x16 Rift Orb)
 *
 * @param {Phaser.Scene} scene
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
      // Metallic outer rim
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5, 1, 6, 14);
      ctx.fillRect(1, 5, 14, 6);
      ctx.fillRect(3, 3, 10, 10);

      ctx.fillStyle = '#64748b';
      ctx.fillRect(4, 2, 8, 1);
      ctx.fillRect(2, 4, 1, 8);
      ctx.fillRect(13, 4, 1, 8);
      ctx.fillRect(4, 13, 8, 1);

      // Core violet rift gem
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(6, 6, 4, 4);

      // Specular highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 5, 2, 2);

      // Cyan meridian arcs
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

      // Deep celestial night twilight-to-emerald sky bands
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 240);
      skyGrad.addColorStop(0.0, '#040714');
      skyGrad.addColorStop(0.25, '#0b1329');
      skyGrad.addColorStop(0.55, '#0d2538');
      skyGrad.addColorStop(0.8, '#0a352c');
      skyGrad.addColorStop(1.0, '#0d2e22');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 640, 240);

      // Distant twinkling stars across panoramic sky
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

      // Distant Eclipse Tower spire silhouette on horizon (center-right, x: 440)
      ctx.fillStyle = '#0d0b1f';
      ctx.fillRect(446, 32, 8, 148);
      ctx.fillRect(442, 62, 16, 118);
      ctx.fillRect(436, 102, 28, 78);
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(448, 40, 4, 14); // Spire rift glow
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(449, 42, 2, 8);

      // Distant mountain ridge silhouettes (layered panoramic depth)
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

      // Glowing Solara pine forest canopy ridge across 640
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

      // Ground terrain base (deep mossy dark stone floor & lush forest clearing)
      const groundGrad = ctx.createLinearGradient(0, 215, 0, 360);
      groundGrad.addColorStop(0.0, '#061712');
      groundGrad.addColorStop(0.4, '#0c261e');
      groundGrad.addColorStop(1.0, '#040d0a');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 215, 640, 145);

      // Pixel moss tufts & stone textures across clearing
      ctx.fillStyle = '#166534';
      for (let gx = 10; gx < 630; gx += 28) {
        const gy = 230 + ((gx * 13) % 100);
        ctx.fillRect(gx, gy, 6, 2);
        ctx.fillRect(gx + 2, gy - 2, 2, 2);
      }

      // Glowing Solara forest particles (bioluminescent fireflies)
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

      // Enemy Platform (Right-Top: center X=480, Y=175)
      // Soft shadow
      ctx.fillStyle = '#05070e';
      ctx.beginPath();
      ctx.ellipse(480, 184, 66, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stone base layers
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(480, 178, 62, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(480, 174, 58, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Top moss surface & rim highlight
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(480, 170, 54, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(480, 168, 50, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player Platform (Left-Bottom: center X=169, Y=290)
      // Soft shadow
      ctx.fillStyle = '#03050a';
      ctx.beginPath();
      ctx.ellipse(169, 302, 82, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ancient stone masonry base layers
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(169, 294, 78, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(169, 289, 74, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lush grassy moss battle surface
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(169, 284, 70, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(169, 282, 64, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Runic glyph highlight in center of player platform
      ctx.fillStyle = '#bef264';
      ctx.fillRect(166, 280, 6, 2);
      ctx.fillRect(168, 278, 2, 6);

      if (typeof tex.refresh === 'function') tex.refresh();
    }
  }

  // 5. Monster Pixel Art Sprites (20x20 scaled 3x -> 60x60)
  const scale = 3;
  const size = 20 * scale; // 60px

  for (const [id, monsterDef] of Object.entries(MONSTERS)) {
    const art = MONSTER_ART_GRIDS[id];
    if (!art) continue;

    const palette = monsterDef.palette;
    const outlineColor = darken(palette.dark ?? palette.primary, 0.45);
    const primaryLight = lighten(palette.primary, 0.32);
    const accentLight = lighten(palette.accent, 0.4);
    const darkShade = palette.dark ?? darken(palette.primary, 0.38);

    const colorMap = {
      O: outlineColor,
      P: palette.primary,
      p: primaryLight,
      S: palette.secondary,
      A: palette.accent,
      a: accentLight,
      D: darkShade,
      E: '#ffffff', // Glowing eye iris
      W: '#0f172a', // Eye pupil
    };

    for (let frame = 0; frame < 2; frame++) {
      const key = getMonsterTextureKey(id, frame);
      if (scene.textures.exists(key)) continue;

      const grid = frame === 0 ? art.frame0 : art.frame1;
      const tex = createOrGetCanvasTexture(scene, key, size, size);
      if (!tex || !tex.context) continue;

      const ctx = tex.context;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);

      for (let y = 0; y < 20; y++) {
        const row = grid[y];
        if (!row) continue;
        for (let x = 0; x < 20; x++) {
          const char = row[x];
          if (char === '.' || !char) continue;
          const fill = colorMap[char];
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }

      if (typeof tex.refresh === 'function') {
        tex.refresh();
      }
    }
  }
}
