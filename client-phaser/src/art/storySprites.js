/**
 * Monsvers: The Battle Monster — Story Pixel Art Sprites & Chapter Arena Backdrops (v1.3)
 *
 * Generates:
 * - 5 HD Character Dialogue Portraits (72x72, drawn 24x24 scaled 3x over elemental gradient skies):
 *   1. portrait_orin (wise scholar glasses, silver locks & cyan scarf)
 *   2. portrait_kael (spiky flame-orange rival hair & glowing amber tech-visor)
 *   3. portrait_player (heroic young Tamer with emerald headband & gold crest)
 *   4. portrait_warden (crimson cowl, sculpted porcelain mask & blazing crimson eyes)
 *   5. portrait_umbravex (glowing purple Eclipse Apex silhouette & obsidian horns)
 *
 * - 4 Dynamic 3/4 Full-Body Standing Trainer Sprites (56x64, drawn 28x32 scaled 2x, 2 frames each):
 *   1. char_mc_0 / char_mc_1 (Young Tamer hero holding glowing Rift Orb)
 *   2. char_orin_0 / char_orin_1 (Prof. Orin holding holographic cyan datapad)
 *   3. char_kael_0 / char_kael_1 (Rival Kael in cocky pointing stance with billowing cape)
 *   4. char_warden_0 / char_warden_1 (Rift Warden channeling levitating purple rift energy)
 *
 * - 3 Chapter Battle Arena Backdrops (640x360 clean panoramic pixel art):
 *   1. bg_arena_azure
 *   2. bg_arena_ignis
 *   3. bg_arena_eclipse
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
// 24x24 Pixel Matrices & Palettes for HD 72x72 Character Portraits (3x scale)
// ============================================================================
const PORTRAIT_DEFINITIONS = {
  // Prof. Orin: Silver scholar hair, gleaming glasses, cyan scarf & crisp lab coat
  portrait_orin: {
    accentColor: 0x38bdf8,
    rimColor: '#38bdf8',
    rimLight: '#bae6fd',
    sky: ['#041320', '#0a2d47', '#0e5875'],
    motes: [
      [3, 4, '#67e8f9'],
      [20, 3, '#bae6fd'],
      [19, 8, '#38bdf8'],
      [4, 11, '#7dd3fc'],
    ],
    palette: {
      '.': null,
      'O': '#040a14', // Crisp dark outline
      'H': '#94a3b8', // Silver scholar hair midtone
      'h': '#cbd5e1', // Silver hair light
      'W': '#f8fafc', // Specular white highlight
      'd': '#64748b', // Hair deep shadow
      'S': '#fde68a', // Warm skin
      's': '#f59e0b', // Skin shadow
      'n': '#b45309', // Nose / mouth / chin accent
      'G': '#e2e8f0', // Glasses metallic rim
      'B': '#7dd3fc', // Glasses lens cyan tint
      'E': '#0284c7', // Wise blue iris
      'e': '#0f172a', // Eye pupil
      'C': '#06b6d4', // Cyan scarf base
      'c': '#67e8f9', // Scarf highlight
      'k': '#0e7490', // Scarf deep fold
      'L': '#f8fafc', // White lab coat collar
      'l': '#cbd5e1', // Lab coat shade
      'T': '#1e293b', // Dark scholar tunic
    },
    grid: [
      '........................',
      '........OOOOOOOO........',
      '......OOWhhhhhhHOO......',
      '.....OWhhhWWWWWhHHO.....',
      '....OHWhhhHHHHhhhHHO....',
      '....OHhhHdHHHHdHhhHO....',
      '...OOHHdHddHHddHHdHOO...',
      '...OHdHHSSSSSSSSHHdHO...',
      '...OHHSShSSSSSShSSHHO...',
      '...OHSSGGGGSSGGGGSSHO...',
      '...OOSGWBEGSSGWBEGSOO...',
      '...OOSGBeeGSSGBeeGSOO...',
      '....OSSGGGGSSGGGGSSO....',
      '....OSSssssSSssssSSO....',
      '.....OSSsSSnnSSsSSO.....',
      '......OSSSnnnnSSSO......',
      '.....OOOsSSSSSSsOOO.....',
      '....OLlOkkcccckkOlLO....',
      '...OLLlOkkCCCCkkOlLLO...',
      '...OLLlOCccCCccCOlLLO...',
      '..OLLlLOkCCccCCkOLlLLO..',
      '..OLLlLOTTkkkkTTOLlLLO..',
      '..OLLlLOTTCCCCCTOLlLLO..',
      '........................',
    ],
  },

  // Rival Kael: Spiky flame-orange hair, glowing amber tech-visor, cocky smirk & crimson-trimmed jacket
  portrait_kael: {
    accentColor: 0xf97316,
    rimColor: '#f97316',
    rimLight: '#fde047',
    sky: ['#160603', '#471208', '#8a250d'],
    motes: [
      [3, 5, '#fde047'],
      [20, 4, '#fb923c'],
      [21, 10, '#fde047'],
      [3, 12, '#f97316'],
    ],
    palette: {
      '.': null,
      'O': '#070201', // Crisp outline
      'H': '#ea580c', // Flame orange hair
      'h': '#f97316', // Bright orange highlight
      'Y': '#fde047', // Flame tip yellow
      'd': '#9a3412', // Hair shadow
      'S': '#fed7aa', // Warm skin
      's': '#fb923c', // Skin shade
      'n': '#c2410c', // Nose/jaw accent
      'V': '#f59e0b', // Amber tech visor
      'v': '#fde047', // Visor glow
      'W': '#ffffff', // Visor glare streak
      'u': '#78350f', // Visor frame rim
      'M': '#7f1d1d', // Smirk outline
      'J': '#18181b', // Obsidian jacket
      'j': '#3f3f46', // Jacket highlight
      'R': '#ef4444', // Crimson trim
      'r': '#b91c1c', // Crimson shade
      'G': '#facc15', // Gold clasp
    },
    grid: [
      '........................',
      '.....OYO...OO...OYO.....',
      '....OYhHO.OYYO.OHhYO....',
      '...OYhHHHOYhhYOHHHhYO...',
      '..OOdHHHHhhHHhhHHHHdOO..',
      '...OdhHHHhhHHhhHHHhdO...',
      '...OdHHhHHdHHdHHhHHdO...',
      '....OHdHSSSSSSSShdHO....',
      '....OHSSsSSSSSSsSSHO....',
      '...OOSuuuuuuuuuuuuSOO...',
      '...OOSuWWvvVVWWvvVSOO...',
      '...OOSuVVWWvvVVWWvSOO...',
      '....OSsuuuuuuuuuusSO....',
      '....OSSSSSSnSSSSSSSO....',
      '.....OSSsSSMMMWsSSO.....',
      '......OSSSsnnnSSSO......',
      '....OOJOsSSSSSSsOJOO....',
      '...OJJROOssssssOORJJO...',
      '...OJjRROOJJJJOORRjJO...',
      '..OJJjRrROJGGOORrRjJJO..',
      '..OJJjJJrOJJJJOJrJJjJO..',
      '..OJJjJJROJjjJORJJJjJO..',
      '..OJJJJJROJJJJORJJJJJO..',
      '........................',
    ],
  },

  // Young Tamer Hero: Windswept chestnut hair, emerald headband + gold crest, expressive cyan eyes, scarf
  portrait_player: {
    accentColor: 0x22c55e,
    rimColor: '#22c55e',
    rimLight: '#86efac',
    sky: ['#03150e', '#083a28', '#0f6a4b'],
    motes: [
      [3, 4, '#86efac'],
      [20, 5, '#fef08a'],
      [19, 11, '#34d399'],
      [4, 13, '#6ee7b7'],
    ],
    palette: {
      '.': null,
      'O': '#040b07', // Crisp dark outline
      'H': '#78350f', // Chestnut hair
      'h': '#b45309', // Hair highlight
      'w': '#d97706', // Warm hair sheen
      'd': '#451a03', // Hair deep shadow
      'D': '#15803d', // Emerald headband
      'g': '#22c55e', // Headband highlight
      'Y': '#facc15', // Gold crest
      'y': '#fef08a', // Gold crest glint
      'S': '#fde68a', // Skin
      's': '#f59e0b', // Skin shade
      'n': '#b45309', // Expression/mouth accent
      'E': '#0f172a', // Upper lash / pupil
      'i': '#0284c7', // Iris deep
      'I': '#38bdf8', // Iris bright glow
      'W': '#ffffff', // Eye specular shine
      'C': '#1e3a8a', // Navy scarf
      'c': '#0284c7', // Scarf mid cyan
      'b': '#38bdf8', // Scarf highlight
      'T': '#047857', // Emerald jacket
      't': '#34d399', // Jacket bright trim
    },
    grid: [
      '........................',
      '.......OOOOOOOOOO.......',
      '.....OOHwhhhhhhwHOO.....',
      '....OHwwhHHHHHHhwwHO....',
      '...OHhHHhHddddHhHHhHO...',
      '...ODgggDDYYYYDDgggDO...',
      '...ODDDDDDYyyYDDDDDDO...',
      '...OHdHHSSSSSSSSHHdHO...',
      '...OHHSSsSSSSSSsSSHHO...',
      '...OHSSEEEssssEEESSHO...',
      '...OOSEWEEssssEWEEsOO...',
      '...OOSEIiEssssEIiEsOO...',
      '....OSSssSSSSSSssSSO....',
      '....OSSSSSSnSSSSSSSO....',
      '.....OSSsSSnnSSsSSO.....',
      '......OSSSssssSSSO......',
      '....OOCOsSSSSSSsOCOO....',
      '...OTtOCbbccccbbCOtTO...',
      '...OTtOCCcCCCCcCCOtTO...',
      '..OTTtOCbbCCCCbbCOtTTO..',
      '..OTTtOOCCCCCCCCOOtTTO..',
      '..OTTtTTOcbbbbccOTtTTO..',
      '..OTTTTTOTTTTTTTOTTTTO..',
      '........................',
    ],
  },

  // Rift Warden: Deep crimson cowl, sculpted porcelain mask, blazing crimson eyes & runic obsidian pauldrons
  portrait_warden: {
    accentColor: 0xef4444,
    rimColor: '#ef4444',
    rimLight: '#fca5a5',
    sky: ['#130206', '#3d0812', '#6e131e'],
    motes: [
      [3, 4, '#f87171'],
      [20, 4, '#c084fc'],
      [20, 12, '#ef4444'],
      [3, 13, '#fca5a5'],
    ],
    palette: {
      '.': null,
      'O': '#050103', // Void outline
      'C': '#7f1d1d', // Crimson cowl
      'c': '#b91c1c', // Hood highlight
      'r': '#dc2626', // Bright crimson rim
      'D': '#450a0a', // Deep cowl shadow
      'M': '#f8fafc', // Porcelain mask white
      'm': '#cbd5e1', // Mask cheek contour
      'n': '#64748b', // Mask shadow/seam
      'E': '#dc2626', // Blazing eye slit
      'e': '#f87171', // Eye flare
      'W': '#ffffff', // Eye core spark
      'P': '#18181b', // Obsidian pauldron
      'p': '#3f3f46', // Armor rim light
      'R': '#ef4444', // Glowing pauldron rune
      'K': '#09090b', // Abyss cloak
    },
    grid: [
      '........................',
      '.........OOOOOO.........',
      '.......OOcrCCrcOO.......',
      '......OCccCCCCccCO......',
      '.....OCcCCDDDDCCcCO.....',
      '....OCcCDDOOOODDCcCO....',
      '....OCCDOmMMMMmODCCO....',
      '...OCCDOmMMMMMMmODCCO...',
      '...OCDDOMMMnnMMMODDCO...',
      '...OCDOMmEEmmEEmMODCO...',
      '...OCDOMeWEmmEWeMODCO...',
      '...OCDOMmEEmmEEmMODCO...',
      '...OCDDOMmMnnMmMODDCO...',
      '....OCDOMmmnnmmMODCO....',
      '....OCDDOMmMMmMODDCO....',
      '.....OCDDOMmmMODDCO.....',
      '....OOPCDDOOOODDCPOO....',
      '...OPpPPDDCCCCDDPPpPO...',
      '..OPpRPPPKKKKKKPPPRpPO..',
      '..OPPRPPPKKCCKKPPPRPPO..',
      '..OPpPPPOKKrrKKOPPPpPO..',
      '..OPPPPOKKKrrKKKOPPPPO..',
      '..OPPPPOKKKKKKKKOPPPPO..',
      '........................',
    ],
  },

  // Umbravex: Eclipse Apex obsidian dragon/void silhouette, twin luminous horns, blazing cosmic eyes
  portrait_umbravex: {
    accentColor: 0xa855f7,
    rimColor: '#a855f7',
    rimLight: '#e9d5ff',
    sky: ['#05010d', '#1c0538', '#420c70'],
    motes: [
      [11, 3, '#e9d5ff'],
      [12, 3, '#c084fc'],
      [4, 10, '#c084fc'],
      [19, 10, '#e9d5ff'],
      [3, 15, '#a855f7'],
      [20, 15, '#a855f7'],
    ],
    palette: {
      '.': null,
      'O': '#030008', // Abyss outline
      'H': '#3b0764', // Obsidian horn body
      'h': '#7e22ce', // Horn luminous ridge
      'A': '#a855f7', // Violet aura / crystal glow
      'a': '#d8b4fe', // Bright lilac tip
      'W': '#ffffff', // Star-bright core
      'V': '#0f0520', // Void body silhouette
      'v': '#240b4c', // Void armor facet
      'U': '#4c1d95', // Cosmic rim light
      'E': '#c084fc', // Blazing apex eye
      'e': '#f3e8ff', // Eye glow halo
    },
    grid: [
      '........................',
      '..OAO..............OAO..',
      '..OaHO............OHaO..',
      '...OahO..........OhaO...',
      '...OHAhO..OOOO..OHAHO...',
      '....OHhHOVUUUUUOHhHO....',
      '....OOHHVVvAAvVVHHOO....',
      '.....OOVVvAeeAvVVOO.....',
      '.....OVVVvvAAvvVVVO.....',
      '....OVVvEEvvvvEEvVVO....',
      '....OVvEeWEvvEWeEvVO....',
      '....OVVVvEEvvEEvVVVO....',
      '.....OVVVvvvvvvVVVO.....',
      '.....OOVVvUvvUvVVOO.....',
      '......OVVVvUUvVVVO......',
      '.....OAVVVvvvvVVVAO.....',
      '....OAhOVVVVVVVVOhAO....',
      '...OVUUVVVvAAvVVVUUVO...',
      '...OVVvVVvAeeAvVVvVVO...',
      '..OVVvVVVVvAAvVVVVvVVO..',
      '..OVVVVVVVvvvvVVVVVVVO..',
      '..OVUvVVVVVvvVVVVVvUVO..',
      '..OVVVVVVVVVVVVVVVVVVO..',
      '........................',
    ],
  },
};

// ============================================================================
// 28x32 Dynamic 3/4 Standing RPG Trainer Sprites (scaled 2x -> 56x64)
// Drawn facing 3/4 RIGHT so Player stands on left and flipped enemies face left!
// ============================================================================
const STANDING_CHARACTER_DEFINITIONS = [
  // 1. Player MC: Young Tamer hero in 3/4 heroic stance holding a glowing Rift Orb!
  {
    prefix: 'char_mc',
    palette: {
      '.': null,
      'O': '#050811', // Dark outline
      'H': '#78350f', // Chestnut hair
      'h': '#b45309', // Hair highlight
      'w': '#d97706', // Warm hair glint
      'd': '#451a03', // Hair deep shade
      'D': '#15803d', // Emerald headband
      'g': '#22c55e', // Headband highlight
      'Y': '#facc15', // Gold crest / belt buckle
      'S': '#fde68a', // Skin
      's': '#f59e0b', // Skin shade
      'E': '#0f172a', // Eye pupil
      'I': '#38bdf8', // Cyan iris / Rift Orb glow
      'W': '#ffffff', // Specular white / Orb core
      'C': '#1e3a8a', // Navy scarf shadow
      'c': '#0284c7', // Cyan scarf mid
      'b': '#38bdf8', // Scarf highlight
      'T': '#047857', // Emerald adventurer jacket
      't': '#10b981', // Jacket highlight
      'm': '#064e3b', // Jacket shadow
      'U': '#f1f5f9', // Inner tunic cream
      'u': '#cbd5e1', // Inner tunic shade
      'P': '#1e293b', // Adventurer trousers
      'p': '#334155', // Trousers highlight
      'B': '#451a03', // Sturdy leather boots
      'k': '#92400e', // Boot cuff / highlight
      'Q': '#7dd3fc', // Rift Orb outer aura spark
    },
    frames: [
      // Frame 0: Heroic 3/4 stance, scarf flowing back-left, right hand holding glowing Rift Orb
      [
        '............................',
        '.........OOOOOOOO...........',
        '.......OOHwhhhhhHOO.........',
        '......OHwwHHHHHHhhHO........',
        '.....OHhHddHHHHhHHhHO.......',
        '.....ODggDDDYYYDDggDO.......',
        '......OHdHHSSSSSSHHHO.......',
        '......OHHSSsSSEISSSHO.......',
        '.......OSSSssSEWSSSO........',
        '.......OOSSssSSSSSO.........',
        '....OOOOOOCCbbccCO..........',
        '..OOcbbCCCcCCCCcCCO.........',
        '.OCbcCCCCOmmTTtTTtOO....Q...',
        '..OOOCOOOmTTtUUTTtTO...OIQ..',
        '......O.OmTTuUUTTTtOO.OIWO..',
        '........OmTTtUUTTTStOOIWIO..',
        '.......OOmTTtUUTTttSOOIIO...',
        '.......OSOmTYTYTTmOO..OO....',
        '.......OOmTTTTTTTmmO........',
        '........OOmPPPPPmmO.........',
        '........OOpPPpPPpPO.........',
        '........OpPPPOOPpPO.........',
        '.......OOpPPO..OpPPO........',
        '.......OpPPO....OpPPO.......',
        '.......OpPO......OpPO.......',
        '......OOkBO......OOkBO......',
        '......OBkBO......OBkBO......',
        '.....OBBBBO......OBBBBO.....',
        '.....OBBBBOO.....OBBBBOO....',
        '.....OOOOOOO.....OOOOOOO....',
        '............................',
        '............................',
      ],
      // Frame 1: Breathing bob, scarf flutters upward, Rift Orb pulses brighter with sparks!
      [
        '............................',
        '............................',
        '.........OOOOOOOO...........',
        '.......OOHwhhhhhHOO.........',
        '......OHwwHHHHHHhhHO........',
        '.....OHhHddHHHHhHHhHO.......',
        '.....ODggDDDYYYDDggDO.......',
        '......OHdHHSSSSSSHHHO.......',
        '......OHHSSsSSEISSSHO.......',
        '..OOOO.OSSSssSEWSSSO........',
        '.OCbbcOOOOCCbbccCO.....Q....',
        'OCbbCCCCCCCcCCCCcCO...QWQ...',
        '.OOCCCOOOmmTTtTTtOO..QOWOQ..',
        '......O.OmTTtUUTTtTO.OIWIO..',
        '........OmTTuUUTTTtOOOWWIO..',
        '........OmTTtUUTTTStOOIIOQ..',
        '.......OOmTTtUUTTttSOOQQO...',
        '.......OSOmTYTYTTmOO........',
        '.......OOmTTTTTTTmmO........',
        '........OOmPPPPPmmO.........',
        '........OOpPPpPPpPO.........',
        '........OpPPPOOPpPO.........',
        '.......OOpPPO..OpPPO........',
        '.......OpPPO....OpPPO.......',
        '.......OpPO......OpPO.......',
        '......OOkBO......OOkBO......',
        '......OBkBO......OBkBO......',
        '.....OBBBBO......OBBBBO.....',
        '.....OBBBBOO.....OBBBBOO....',
        '.....OOOOOOO.....OOOOOOO....',
        '............................',
        '............................',
      ],
    ],
  },

  // 2. Prof. Orin: 3/4 scholar stance, silver hair, gleaming glasses, crisp lab coat, glowing cyan datapad
  {
    prefix: 'char_orin',
    palette: {
      '.': null,
      'O': '#050811', // Crisp outline
      'H': '#94a3b8', // Silver hair
      'h': '#cbd5e1', // Hair highlight
      'W': '#ffffff', // Specular white / hologram core
      'd': '#64748b', // Hair shade
      'S': '#fde68a', // Skin
      's': '#f59e0b', // Skin shade
      'G': '#e2e8f0', // Glasses frame
      'E': '#0284c7', // Eye iris
      'C': '#06b6d4', // Cyan scarf
      'c': '#67e8f9', // Scarf highlight
      'k': '#0e7490', // Scarf shade
      'L': '#f8fafc', // White lab coat
      'l': '#e2e8f0', // Lab coat mid
      'a': '#94a3b8', // Lab coat fold shade
      'T': '#1e293b', // Dark scholar tunic
      't': '#334155', // Tunic highlight
      'D': '#0e7490', // Datapad body
      'q': '#38bdf8', // Datapad / hologram glow
      'Q': '#bae6fd', // Bright hologram pixel
      'P': '#334155', // Trousers
      'p': '#475569', // Trousers highlight
      'B': '#1e293b', // Dress shoes
      'b': '#475569', // Shoe highlight
    },
    frames: [
      // Frame 0: Composed 3/4 scholar stance holding glowing holographic cyan datapad
      [
        '............................',
        '.........OOOOOOOO...........',
        '.......OOWhhhhhhOO..........',
        '......OWhhWWWWWWhHO.........',
        '.....OHhHddHHHHhHHO.........',
        '.....OHdHHSSSSSSHHHO........',
        '......OHSSGGSSGGSSHO........',
        '......OHSGWEsSGWESSHO.......',
        '.......OSSGGSSGGSSO.........',
        '.......OOSSssssSSO..........',
        '.......OOkkcccckkOO....Q....',
        '......OLLOkCCCCkOLLO..qQq...',
        '.....OLlLOcCccCcOLlO..qWq...',
        '.....OLlLOTtTTtTOLlO.ODqDO..',
        '....OLlaLOTtTTtTOLLSOOWqDO..',
        '....OLlaLOTTTTTTOLLSOOqDDO..',
        '....OLlaLOTtTTtTOLLlOODDO...',
        '....OLlaLOTTTTTTOLllOO......',
        '....OLlaLOLlTTlLOLllO.......',
        '....OLlLLOLlPPlLOLllO.......',
        '....OLlaLOPpPPpPOLllO.......',
        '....OLlaLOPpOOPpOalLO.......',
        '....OLllLOPpO.OpPOalO.......',
        '.....OLlLOPpO.OpPOaO........',
        '.....OOO.OPpO..OpPO.........',
        '.........OPpO..OpPO.........',
        '........OOBbO..OOBbO........',
        '........OBBBO..OBBBO........',
        '.......OBBBBOO.OBBBBOO......',
        '.......OOOOOOO.OOOOOOO......',
        '............................',
        '............................',
      ],
      // Frame 1: Hologram screen pulses taller & brighter, scarf and lab coat hem shift gently
      [
        '............................',
        '............................',
        '.........OOOOOOOO...........',
        '.......OOWhhhhhhOO..........',
        '......OWhhWWWWWWhHO.........',
        '.....OHhHddHHHHhHHO.........',
        '.....OHdHHSSSSSSHHHO........',
        '......OHSSGGSSGGSSHO........',
        '......OHSGWWsSGWWSSHO.......',
        '.......OSSGGSSGGSSO...q.Q...',
        '......OOOkkcccckkOO..QWQq...',
        '.....OckLOkCCCCkOLLO.qQQq...',
        '....OLlLOcCccCcOLlO..qWq....',
        '....OLlLOTtTTtTOLlO..ODqDO..',
        '....OLlaLOTtTTtTOLLSOOWWDO..',
        '....OLlaLOTTTTTTOLLSOOqQDO..',
        '....OLlaLOTtTTtTOLLlOODDO...',
        '....OLlaLOTTTTTTOLllOO......',
        '....OLlaLOLlTTlLOLllO.......',
        '...OOLlLLOLlPPlLOLllO.......',
        '...OLllaLOPpPPpPOLllO.......',
        '...OLllaLOPpOOPpOalLO.......',
        '....OLllLOPpO.OpPOalO.......',
        '.....OLlLOPpO.OpPOaO........',
        '.....OOO.OPpO..OpPO.........',
        '.........OPpO..OpPO.........',
        '........OOBbO..OOBbO........',
        '........OBBBO..OBBBO........',
        '.......OBBBBOO.OBBBBOO......',
        '.......OOOOOOO.OOOOOOO......',
        '............................',
        '............................',
      ],
    ],
  },

  // 3. Rival Kael: Cocky 3/4 battle stance, spiky flame hair, amber tech-visor, billowing cape, pointing!
  {
    prefix: 'char_kael',
    palette: {
      '.': null,
      'O': '#070201', // Dark outline
      'H': '#ea580c', // Flame orange hair
      'h': '#f97316', // Hair highlight
      'Y': '#fde047', // Yellow flame tips
      'd': '#9a3412', // Hair shade
      'S': '#fed7aa', // Skin
      's': '#fb923c', // Skin shade
      'V': '#f59e0b', // Amber visor
      'v': '#fde047', // Visor bright
      'W': '#ffffff', // Visor shine
      'M': '#7f1d1d', // Confident smirk
      'J': '#18181b', // Obsidian jacket
      'j': '#3f3f46', // Jacket highlight
      'R': '#dc2626', // Crimson trim / cape
      'r': '#ef4444', // Bright crimson cape highlight
      'K': '#7f1d1d', // Deep cape shadow
      'G': '#facc15', // Gold buckle
      'P': '#09090b', // Dark trousers
      'p': '#27272a', // Trousers highlight
      'B': '#27272a', // Combat boots
      'b': '#71717a', // Metal boot clasp
    },
    frames: [
      // Frame 0: Cocky stance, left hand on hip, right arm pointing forward-right, cape streaming left
      [
        '............................',
        '......OYO....OO...OYO.......',
        '.....OYhHO..OYYO.OHhO.......',
        '....OYhHHHOOYhhYOHHHO.......',
        '.....OdHHHHhhHHhhHHO........',
        '......OHdHSSSSSShdHO........',
        '......OHSVvWWVVvvVSO........',
        '.......OSVVVVWWVVVSO........',
        '.......OSSssSSMMSSO.........',
        '.......OOSSssssSSO..........',
        '.....OOORrRRRRrRROO.........',
        '...OOKrRJJjRRjJJrRO.........',
        '..OKrRRJJjJJJJjJJJOO........',
        '.OKrKROJJjJJJJjJJJjOOOO.....',
        '.OKKROOJJjJJJJjJJJJJjSSOO...',
        'OKKRO.OSJjJJJJjJJJJOOSSSO...',
        'OKRO..OSOJGJJGJJJOO..OOO....',
        'OKO...OOORRRRRRROO..........',
        '.O....OKOPPPPPPPO...........',
        '.....OKROpPPpPPpO...........',
        '.....OKROpPPOOPpPO..........',
        '....OKROOpPO..OpPPO.........',
        '....OKO.OpPO...OpPPO........',
        '.....O..OpPO....OpPO........',
        '.......OObBO....OObBO.......',
        '.......OBbBO....OBbBO.......',
        '......OBBBBO....OBBBBO......',
        '......OBBBBOO...OBBBBOO.....',
        '......OOOOOOO...OOOOOOO.....',
        '............................',
        '............................',
        '............................',
      ],
      // Frame 1: Cape billows higher/wider, visor glare sweeps, hair tips & pointing hand shift!
      [
        '.....OYO.....OO....OYO......',
        '....OYhHO...OYYO..OHhO......',
        '....OYhHHHOOYhhYOHHHO.......',
        '.....OdHHHHhhHHhhHHO........',
        '......OHdHSSSSSShdHO........',
        '......OHSVVVVvvWWVSO........',
        '.......OSVWWVVVVvVSO........',
        '.......OSSssSSMMSSO.........',
        '.......OOSSssssSSO..........',
        '....OOOORrRRRRrRROO.........',
        '..OOKrRRJJjRRjJJrRO.........',
        '.OKrRRRJJjJJJJjJJJOO........',
        'OKrKKROJJjJJJJjJJJjOOOOO....',
        'OKKKROOJJjJJJJjJJJJJjSSSO...',
        'OKKRO.OSJjJJJJjJJJJOOSSOO...',
        'OKRO..OSOJGJJGJJJOO..OOO....',
        '.OKO..OOORRRRRRROO..........',
        '..O..OKROPPPPPPPO...........',
        '....OKRROpPPpPPpO...........',
        '...OKKROOpPPOOPpPO..........',
        '...OKRO.OpPO..OpPPO.........',
        '....OO..OpPO...OpPPO........',
        '........OpPO....OpPO........',
        '.......OObBO....OObBO.......',
        '.......OBbBO....OBbBO.......',
        '......OBBBBO....OBBBBO......',
        '......OBBBBOO...OBBBBOO.....',
        '......OOOOOOO...OOOOOOO.....',
        '............................',
        '............................',
        '............................',
        '............................',
      ],
    ],
  },

  // 4. Rift Warden: Imposing hooded stance, porcelain mask, spiked pauldrons, levitating purple rift orb!
  {
    prefix: 'char_warden',
    palette: {
      '.': null,
      'O': '#050103', // Abyss outline
      'C': '#7f1d1d', // Crimson cowl
      'c': '#b91c1c', // Cowl highlight
      'D': '#450a0a', // Deep cowl shadow
      'M': '#f8fafc', // Porcelain mask
      'm': '#cbd5e1', // Mask shade
      'E': '#dc2626', // Glowing crimson eye
      'e': '#fca5a5', // Eye flare
      'P': '#18181b', // Obsidian spiked armor
      'p': '#3f3f46', // Armor edge highlight
      'R': '#ef4444', // Crimson rune glow
      'r': '#b91c1c', // Deep crimson rune shade
      'K': '#09090b', // Abyss cloak
      'k': '#1e1b2e', // Cloak fold highlight
      'V': '#581c87', // Void purple mist
      'v': '#9333ea', // Bright rift purple
      'A': '#c084fc', // Levitating rift orb glow
      'W': '#ffffff', // Rift energy white core
    },
    frames: [
      // Frame 0: Imposing 3/4 stance, spiked shoulder pauldrons, right hand conjuring levitating rift orb
      [
        '............................',
        '..........OOOOOO............',
        '........OOccCCccOO..........',
        '.......OCccCDDDccCO.........',
        '......OCcDDOOOODDcCO........',
        '......OCDOMMMMMMODCO........',
        '......OCDOMeEMeEMOCO....v...',
        '.......OCDOMmMmMODO....vAv..',
        '.......OODDOCDDOOO....vAWA..',
        '.....OPpOPDDDDDOPpO...vAv...',
        '....OPpRPPDDDDPPRpPO...v....',
        '...OPpRRPPKKKKPPRRpPO.......',
        '....OOOPPKKKKKKPPpPO.OO.....',
        '......OKKkKRRKkKPPPOOPpO....',
        '......OKkKKRRKKkKKOOPpPO....',
        '.....OKKkKKrrKKkKKKOOOPO....',
        '.....OKkKKKKKKKKkKKO..O.....',
        '....OKKkKKKKKKKKkKKO........',
        '....OKkKKkKKKKkKKkKKO.......',
        '...OKKkKKkKKKKkKKkKKO.......',
        '...OKkKKKkKKKKkKKKkKKO......',
        '...OKkKKKkKKKKkKKKkKKO......',
        '..OKKkKKKKkKKkKKKKkKKO......',
        '..OKkKKKKKkKKkKKKKKkKKO.....',
        '..OKkKKKVkkkkkkVKKKKKKO.....',
        '..OKKKKVVvkKKkvVVKKKKKO.....',
        '..OKKKVvvVKKKKVvvVKKKKO.....',
        '..OOKKVvVOKKKKOVvVKKOO......',
        '...OOOOvOO.OO.OOvOOOO.......',
        '......V..........V..........',
        '............................',
        '............................',
      ],
      // Frame 1: Rift orb expands & crackles, mask eyes flare, void mist and cloak billow!
      [
        '............................',
        '..........OOOOOO............',
        '........OOccCCccOO..........',
        '.......OCccCDDDccCO.........',
        '......OCcDDOOOODDcCO...v.A..',
        '......OCDOMMMMMMODCO..vAWAv.',
        '......OCDOMWEMWEMOCO..AWWWA.',
        '.......OCDOMmMmMODO...vAWAv.',
        '.......OODDOCDDOOO.....Avv..',
        '.....OPpOPDDDDDOPpO....v....',
        '....OPpRPPDDDDPPRpPO........',
        '...OPpRRPPKKKKPPRRpPO.......',
        '....OOOPPKKKKKKPPpPO.OO.....',
        '......OKKkKRRKkKPPPOOPpO....',
        '.....OKKkKKRRKKkKKOOPpPO....',
        '.....OKkKKKrrKKkKKKOOOPO....',
        '....OKKkKKKKKKKKkKKO..O.....',
        '....OKkKKKKKKKKKkKKO........',
        '...OKKkKKkKKKKkKKkKKO.......',
        '...OKkKKKkKKKKkKKKkKKO......',
        '..OKKkKKKkKKKKkKKKkKKO......',
        '..OKkKKKKkKKKKkKKKKkKKO.....',
        '..OKKkKKKKkKKkKKKKkKKKO.....',
        '.OKKkKKKKKkKKkKKKKKkKKO.....',
        '.OKkKKKVVvkkkkvVVKKKKKKO....',
        '.OKKKKVVvvVkkVvvVVKKKKKO....',
        '..OKKVvvAvVKKVvAvvVKKKO.....',
        '..OOKVVvVOKKKKOVvVVKKO......',
        '...OOOVvOO.OO.OOvVOOO.......',
        '.....vA..........Av.........',
        '............................',
        '............................',
      ],
    ],
  },
];

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
  ctx.fillRect(572, 85, 8, 30);
  ctx.fillRect(570, 80, 12, 6);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(572, 81, 8, 4);
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
  ctx.lineTo(170, 105);
  ctx.lineTo(220, 120);
  ctx.lineTo(280, 90);
  ctx.lineTo(340, 135);
  ctx.lineTo(410, 95);
  ctx.lineTo(470, 125);
  ctx.lineTo(530, 85);
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
  for (let bx = 0; bx < 80; bx += 10) {
    const colH = 35 + ((bx * 13) % 25);
    ctx.fillRect(bx, 180 - colH, 9, colH + 20);
    ctx.fillStyle = '#292524';
    ctx.fillRect(bx + 1, 180 - colH, 7, 2);
    ctx.fillStyle = '#1c1917';
  }
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
    [[0, 245], [55, 238], [120, 248], [195, 240], [280, 252], [370, 244], [460, 254], [550, 246], [640, 252]],
    [[70, 275], [150, 285], [230, 276], [320, 290], [420, 280], [510, 292], [600, 284]],
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
    ctx.fillRect(rx + rw / 2 - 1, ry + rh / 2 - 1, 2, 2);
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

/**
 * Draws an HD 24x24 portrait (scaled 3x -> 72x72) with elemental gradient sky,
 * atmospheric motes, shaded anime-pixel character art, and crisp framed rim.
 */
function drawPortraitCanvas(ctx, def, scale) {
  const size = 24 * scale; // 72px
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);

  // 1. Elemental Gradient Sky Backdrop
  const skyGrad = ctx.createLinearGradient(0, 0, 0, size);
  skyGrad.addColorStop(0.0, def.sky[0]);
  skyGrad.addColorStop(0.55, def.sky[1]);
  skyGrad.addColorStop(1.0, def.sky[2]);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(scale, scale, size - scale * 2, size - scale * 2);

  // Subtle horizontal pixel light bands for HD-2D depth
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(scale, scale * 2, size - scale * 2, scale * 3);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(scale, scale * 15, size - scale * 2, scale * 5);

  // Atmospheric motes in sky behind character
  if (Array.isArray(def.motes)) {
    for (const [mx, my, mcol] of def.motes) {
      ctx.fillStyle = mcol;
      ctx.fillRect(mx * scale, my * scale, scale, scale);
    }
  }

  // 2. Crisp 24x24 Expressive Anime-Pixel Character Art
  for (let y = 0; y < 24; y++) {
    const row = def.grid[y];
    if (!row) continue;
    for (let x = 0; x < 24; x++) {
      const ch = row[x];
      const color = def.palette[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  // 3. Outer Obsidian Frame + Glowing Elemental Corner Rims
  ctx.fillStyle = '#04070f';
  ctx.fillRect(0, 0, size, scale); // Top
  ctx.fillRect(0, size - scale, size, scale); // Bottom
  ctx.fillRect(0, 0, scale, size); // Left
  ctx.fillRect(size - scale, 0, scale, size); // Right

  // Elemental inner accent brackets at all 4 corners
  ctx.fillStyle = def.rimColor;
  // Top-left bracket
  ctx.fillRect(scale, scale, scale * 3, scale);
  ctx.fillRect(scale, scale, scale, scale * 3);
  // Top-right bracket
  ctx.fillRect(size - scale * 4, scale, scale * 3, scale);
  ctx.fillRect(size - scale * 2, scale, scale, scale * 3);
  // Bottom-left bracket
  ctx.fillRect(scale, size - scale * 2, scale * 3, scale);
  ctx.fillRect(scale, size - scale * 4, scale, scale * 3);
  // Bottom-right bracket
  ctx.fillRect(size - scale * 4, size - scale * 2, scale * 3, scale);
  ctx.fillRect(size - scale * 2, size - scale * 4, scale, scale * 3);

  // Specular glint on the 4 corner vertices
  ctx.fillStyle = def.rimLight;
  ctx.fillRect(scale, scale, scale, scale);
  ctx.fillRect(size - scale * 2, scale, scale, scale);
  ctx.fillRect(scale, size - scale * 2, scale, scale);
  ctx.fillRect(size - scale * 2, size - scale * 2, scale, scale);
}

// ============================================================================
// Main Registration Function (Exported)
// ============================================================================

/**
 * Registers all story campaign pixel textures:
 * - 5 HD Character Portraits (72x72: 24x24 scaled 3x)
 * - 4 Dynamic 3/4 Standing Trainer Sprites (56x64: 28x32 scaled 2x, 2 frames each)
 * - 3 Chapter Battle Arena Backdrops (640x360)
 *
 * Idempotent: Skips any texture that already exists in scene.textures.
 *
 * @param {Phaser.Scene} scene
 */
export function registerStoryTextures(scene) {
  if (!scene || !scene.textures) return;

  // --------------------------------------------------------------------------
  // 1. HD Character Portraits (72x72: drawn 24x24 scaled 3x)
  // --------------------------------------------------------------------------
  const portraitScale = 3;
  const portraitSize = 24 * portraitScale; // 72px

  for (const [key, def] of Object.entries(PORTRAIT_DEFINITIONS)) {
    if (scene.textures.exists(key)) continue;

    const tex = createOrGetCanvasTexture(scene, key, portraitSize, portraitSize);
    if (tex && tex.context) {
      drawPortraitCanvas(tex.context, def, portraitScale);
      if (typeof tex.refresh === 'function') {
        tex.refresh();
      }
    } else if (typeof scene.make?.graphics === 'function') {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x0f172a, 1);
      g.fillRect(0, 0, portraitSize, portraitSize);
      g.fillStyle(def.accentColor, 1);
      g.fillRect(6, 6, portraitSize - 12, portraitSize - 12);
      g.generateTexture(key, portraitSize, portraitSize);
      g.destroy();
    }
  }

  // --------------------------------------------------------------------------
  // 1b. Dynamic 3/4 Full-Body Standing Trainer Sprites (28x32 scaled 2x -> 56x64)
  // --------------------------------------------------------------------------
  const charScale = 2;
  const charW = 28 * charScale; // 56px
  const charH = 32 * charScale; // 64px

  STANDING_CHARACTER_DEFINITIONS.forEach((charDef) => {
    charDef.frames.forEach((grid, frameIdx) => {
      const key = `${charDef.prefix}_${frameIdx}`;
      if (scene.textures.exists(key)) return;

      const tex = createOrGetCanvasTexture(scene, key, charW, charH);
      if (tex && tex.context) {
        const ctx = tex.context;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, charW, charH);

        for (let y = 0; y < grid.length; y++) {
          const row = grid[y];
          if (!row) continue;
          for (let x = 0; x < row.length; x++) {
            const col = charDef.palette[row[x]];
            if (col) {
              ctx.fillStyle = col;
              ctx.fillRect(x * charScale, y * charScale, charScale, charScale);
            }
          }
        }
        if (typeof tex.refresh === 'function') tex.refresh();
      } else if (typeof scene.make?.graphics === 'function') {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x0f172a, 1);
        g.fillRect(8, 6, charW - 16, charH - 12);
        g.generateTexture(key, charW, charH);
        g.destroy();
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
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(arena.fallbackColor, 1);
      g.fillRect(0, 0, 640, 360);
      g.generateTexture(arena.key, 640, 360);
      g.destroy();
    }
  }
}
