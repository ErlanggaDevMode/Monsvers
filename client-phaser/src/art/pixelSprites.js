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
 * Handcrafted 32x32 HD pixel-art sprite matrices for all 12 unique Monsvers.
 * Scaled 2x -> 64x64 HD-2D rendering.
 *
 * Legend:
 *  . = transparent
 *  O = dark colored outline (element-specific)
 *  P = primary body base
 *  p = primary light / bright mid-highlight
 *  H = primary specular rim highlight
 *  D = primary deep shadow / dark shade
 *  S = secondary body base (underbelly / inner ear / muzzle / chest ruff)
 *  s = secondary light highlight
 *  d = secondary shadow
 *  A = elemental accent base (flames / crystal / leaf / lightning / rift wisp)
 *  a = elemental accent bright glow / highlight
 *  g = elemental specular / white-hot glow
 *  B = dark horn / shell / obsidian plate base
 *  b = light horn / carapace highlight
 *  E = expressive colored anime eye iris
 *  W = eye white specular glint
 *  K = eye pupil / deep shadow
 *  R = special glowing core / chest rune / pearl
 */
const MONSTER_ART_GRIDS = {
  "pyrofang": {
    "frame0": [
      "................................",
      "................................",
      "........AA......................",
      ".......AaaA.........OO.....OO...",
      "......AAgaaA.......OPPO...OPPO..",
      ".....AAggaaA......OPppPO.OPppPO.",
      ".....AggaaAA......OPpSPO.OPsSPO.",
      ".....AaaAAA........OPPPO.OPPPO..",
      ".....AAA...OOOO....OPPPPPPPPPO..",
      "....AA....OPppPO...OPPPPPPPPPO..",
      "...AA....OPppppPO..OPPpPPPPpPO..",
      "...AaA..OPppPpPPOOOPPpEWPPpEWPO.",
      "..AaaA..OPpPPpPPOPPPEKWPPPEKWPO.",
      "..AgaA...OPPPPPPPOPPPEEPPPEEPO..",
      "..AggaA..OPPPPPPPOPPSSSSSSSSPO..",
      "...AgaA...OPPPPPPOPPsSSSSSSsPO..",
      "....AaA....OPPPPOOOPPSSsSsSSPO..",
      ".....AA...OPPPPPPOOPPPPPPPPPPO..",
      ".........OPPpPpPPOOOPPsSsSPPO...",
      "........OPPppppPPO.OOPSSSSPO....",
      ".......OPPppPppPPO..OOPPPPO.....",
      "......OPPPPPPPPPPO..OPPPPPO.....",
      "......OPPDDPPDDPPO.OPPDDPPPO....",
      ".....OPPDDDPPDDDPPOOPPDDDPPO....",
      "....OPPDD..OPPDD.OOPPDD..OPPO...",
      "....OPPD...OPPD...OPPD...OPD....",
      "...OPpPO..OPpPO..OPpPO..OPpPO...",
      "...OPPPO..OPPPO..OPPPO..OPPPO...",
      "....OOO....OOO....OOO....OOO....",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "................................",
      ".......AAA......................",
      "......AaaAA.........OO.....OO...",
      ".....AAgaaA........OPPO...OPPO..",
      "....AAggaaA.......OPppPO.OPppPO.",
      "....AgggaAA.......OPpSPO.OPsSPO.",
      "....AaaAAA.........OPPPO.OPPPO..",
      "....AAA....OOOO....OPPPPPPPPPO..",
      "...AA.....OPppPO...OPPPPPPPPPO..",
      "..AA.....OPppppPO..OPPpPPPPpPO..",
      "..AaA...OPppPpPPOOOPPpEWPPpEWPO.",
      ".AaaA...OPpPPpPPOPPPEKWPPPEKWPO.",
      ".AgaA....OPPPPPPPOPPPEEPPPEEPO..",
      ".AggaA...OPPPPPPPOPPSSSSSSSSPO..",
      "..AgaA....OPPPPPPOPPsSSSSSSsPO..",
      "...AaA.....OPPPPOOOPPSSsSsSSPO..",
      "....AA....OPPPPPPOOPPPPPPPPPPO..",
      ".........OPPpPpPPOOOPPsSsSPPO...",
      "........OPPppppPPO.OOPSSSSPO....",
      ".......OPPppPppPPO..OOPPPPO.....",
      "......OPPPPPPPPPPO..OPPPPPO.....",
      "......OPPDDPPDDPPO.OPPDDPPPO....",
      ".....OPPDDDPPDDDPPOOPPDDDPPO....",
      "....OPPDD..OPPDD.OOPPDD..OPPO...",
      "....OPPD...OPPD...OPPD...OPD....",
      "...OPpPO..OPpPO..OPpPO..OPpPO...",
      "...OPPPO..OPPPO..OPPPO..OPPPO...",
      "....OOO....OOO....OOO....OOO....",
      "................................",
      "................................",
      "................................",
      "................................"
    ]
  },
  "blazefang": {
    "frame0": [
      "..........AAAAA.................",
      ".........AaAAaaA.....OO.....OO..",
      "........AAgaaaAA....OPPO...OPPO.",
      ".......AAgggaaAA...OPppPO.OPppPO",
      "......AAaggaaaAA..OPPpSPO.OPsSPO",
      ".....AAaaaAAaaA...OPPPPPO.OPPPPO",
      "....AAaaaaaAAA...OPPPPPPPPPPPPPO",
      "...AAaAAAAAAA...OPPpHPPPPpHPpPOO",
      "..AAaaAAAAAA...OPPpHpPPPPpHPpPOO",
      ".AAgaaAAAAAAA.OPpPEWPPPpPEWPPPOO",
      "AAgggaAAAAAAAAOPPEKWPPOPEKWPPOOO",
      "AggggaaAAAAAAAOPPEEPPPOPEEPPPOOO",
      "AAgggaAAAAAaAAOPPsSSssssSSssPPOO",
      ".AAgaaAAAAaaAAOPPsSSSSSSSSSsPPO.",
      "..AAaAAAaaaaAA.OPPsSsSSSSssSPPO.",
      "...AAAAAgaaAA..OPPPsSSSSssPPPO..",
      "....AAAAaAAA..OPPPPPPPPPPPPPPO..",
      ".....AAAAAA..OPPDDPPPPPPPPDDPPO.",
      "......AAAA..OPPDDDDPPPPPDDDDPPO.",
      "...........OPPDDDDDPPPPPDDDDDPPO",
      "..........OPPDD..DDPPPPPDD..DDPP",
      ".........OPPDD...DDPPPPPDD...DDP",
      "........OPPDD...OPPDDDDDPPO...OD",
      ".......OPPDD....OPPDDDDDPPO....O",
      "......OPpPO....OPpPO...OPpPO....",
      ".....OPAaAO...OPAaAO...OPAaAO...",
      "....OPaggaO..OPaggaO...OPaggaO..",
      "....OAAaaAO..OAAaaAO...OAAaaAO..",
      ".....OOOOO....OOOOO.....OOOOO...",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      ".........AAAAAA.................",
      "........AaaAAaaA.....OO.....OO..",
      ".......AAgaaaaAA....OPPO...OPPO.",
      "......AAgggaaaAA...OPppPO.OPppPO",
      ".....AAaggggaaAA..OPPpSPO.OPsSPO",
      "....AAaaaAAaaaA...OPPPPPO.OPPPPO",
      "...AAaaaaaaAAA...OPPPPPPPPPPPPPO",
      "..AAaAAAAAAAA...OPPpHPPPPpHPpPOO",
      ".AAaaAAAAAAAA..OPPpHpPPPPpHPpPOO",
      "AAgaaAAAAAAAA.OPpPEWPPPpPEWPPPOO",
      "AgggaaAAAAAAAAOPPEKWPPOPEKWPPOOO",
      "AggggaaAAAAAAAOPPEEPPPOPEEPPPOOO",
      "AAgggaAAAAAaAAOPPsSSssssSSssPPOO",
      ".AAgaaAAAAaaAAOPPsSSSSSSSSSsPPO.",
      "..AAaAAAaaaaAA.OPPsSsSSSSssSPPO.",
      "...AAAAAgaaAA..OPPPsSSSSssPPPO..",
      "....AAAAaAAA..OPPPPPPPPPPPPPPO..",
      ".....AAAAAA..OPPDDPPPPPPPPDDPPO.",
      "......AAAA..OPPDDDDPPPPPDDDDPPO.",
      "...........OPPDDDDDPPPPPDDDDDPPO",
      "..........OPPDD..DDPPPPPDD..DDPP",
      ".........OPPDD...DDPPPPPDD...DDP",
      "........OPPDD...OPPDDDDDPPO...OD",
      ".......OPPDD....OPPDDDDDPPO....O",
      "......OPpPO....OPpPO...OPpPO....",
      ".....OPAaAO...OPAaAO...OPAaAO...",
      "....OPaggaO..OPaggaO...OPaggaO..",
      "....OAAaaAO..OAAaaAO...OAAaaAO..",
      ".....OOOOO....OOOOO.....OOOOO...",
      "................................",
      "................................",
      "................................"
    ]
  },
  "aquafin": {
    "frame0": [
      "................................",
      "................................",
      "...................AA...........",
      ".................AAaaA..........",
      ".........AA.....AAgaaA...OO.....",
      "........AaaA...AAggaaA..OPPO....",
      ".......AAaaA..AAgaaAAA.OPppPO...",
      "......AAgaaA.AAaaAA...OPppPpPO..",
      ".....AAggaaAAaaAA....OPpRWPPpPO.",
      "....AAgaaAAAAAAA....OPpREKWPPPOO",
      "....AaaAAA...OO....OPpPEEPPPPOO.",
      "...AAaAA....OPPO...OPPSSSSPPPO..",
      "..AAaaA....OPppPO..OPsSSSSsPPO..",
      ".AAgaaA...OPpPpPOOOPPSSsSsSPPO..",
      "AAggaaA..OPPPPPPPPPPPPPPPPPPPO..",
      "AAgaaA...OPPPPPPPPPPPPPPPPPPO...",
      ".AaaA....OPPDDPPPPPPPPPPDDPPO...",
      "..AA.....OPPDDDPPPPPPPPDDDPPO...",
      ".........OPPDDDDDPPPPDDDDDPPO...",
      "..........OPPDD..OPPO..DDPPO....",
      "..........OPPD...OPPO...DPPO....",
      "..........OPPO...ODDO...OPPO....",
      "..........OPPO...ODDO...OPPO....",
      ".........OPppPO.OPppPO.OPppPO...",
      ".........OPAAaOOPAAaO.OPAAaO....",
      "..........OOOO..OOOO...OOOO.....",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "................................",
      "...................AAA..........",
      ".................AAaaAA.........",
      ".........AA.....AAgaaaA..OO.....",
      "........AaaA...AAggaaaA.OPPO....",
      ".......AAaaA..AAgaaaAA.OPppPO...",
      "......AAgaaA.AAaaAAA..OPppPpPO..",
      ".....AAggaaAAaaAAA...OPpRWPPpPO.",
      "....AAgaaAAAAAAA....OPpREKWPPPOO",
      "...AAaAAAA...OO....OPpPEEPPPPOO.",
      "..AAaaA.....OPPO...OPPSSSSPPPO..",
      ".AAgaaA....OPppPO..OPsSSSSsPPO..",
      "AAggaaA...OPpPpPOOOPPSSsSsSPPO..",
      "AAgaaA...OPPPPPPPPPPPPPPPPPPPO..",
      ".AaaA....OPPPPPPPPPPPPPPPPPPO...",
      "..AA.....OPPDDPPPPPPPPPPDDPPO...",
      ".........OPPDDDPPPPPPPPDDDPPO...",
      "..........OPPDDDDDPPPPDDDDDPPO..",
      "..........OPPDD..OPPO..DDPPO....",
      "..........OPPD...OPPO...DPPO....",
      "..........OPPO...ODDO...OPPO....",
      "..........OPPO...ODDO...OPPO....",
      ".........OPppPO.OPppPO.OPppPO...",
      ".........OPAAaOOPAAaO.OPAAaO....",
      "..........OOOO..OOOO...OOOO.....",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ]
  },
  "tidecrest": {
    "frame0": [
      "...........AA........AA.........",
      "..........AaaA......AaaA........",
      ".........AAgaaA....AAgaaA...OO..",
      "........AAgggaaA..AAgggaaA.OPPO.",
      ".......AAagggaAA..AAagggaAOPppPO",
      "......AAaaaAAAA..AAaaaaAAOPppPpO",
      ".....AAaaaaAA...AAaaaaAAOPPpPPPO",
      "....AAaaaAA....AAaaaAA.OPPpEWPPO",
      "...AAaaaAA....AAaaaAA.OPPPEKWPPO",
      "..AAaaaAA....AAaaaAA..OPPPEEPPOO",
      "..AAaaAA....AAaaaAA..OPPSSSSPPPO",
      ".AAaaAA....AAaaaAA..OPPsSSSSsPPO",
      ".AAgaaA...AAaaaAA..OPPSSRRSSSPPO",
      "AAggaaA..AAaaaAA..OPPsSRRRRsSPPO",
      "AAgaaA...AAaaAA...OPPSSRRSSSPPO.",
      ".AaaA...AAaaAA...OPPPSSSSSSPPPO.",
      "..AA...AAaaAA...OPPPPPPPPPPPPPO.",
      "......AAaaAA...OPPDDPPPPPPDDPPO.",
      ".....AAaaAA...OPPDDDPPPPPDDDPPO.",
      "....AAaaAA...OPPDDDDDPPPDDDDDPPO",
      "...AAaaAA...OPPDD..DDPPDD..DDPPO",
      "..AAaaAA...OPPDD...DDPPDD...DDPO",
      ".AAgaaA...OPPDD...OPPDDDDPO...OD",
      "AAggaaA..OPPDD...OPPDDDDDPO....O",
      "AAgaaA..OPpPO...OPpPO...OPpPO...",
      ".AaaA..OPAaAO..OPAaAO...OPAaAO..",
      "..AA..OPaggaO.OPaggaO...OPaggaO.",
      "......OAAaaAO.OAAaaAO...OAAaaAO.",
      ".......OOOOO...OOOOO.....OOOOO..",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "..........AAA........AAA........",
      ".........AaaAA......AaaAA.......",
      "........AAgaaaA....AAgaaaA..OO..",
      ".......AAgggaaaA..AAgggaaaAOPPO.",
      "......AAaggggaAA..AAaggggaOPppPO",
      ".....AAaaaaAAAA..AAaaaaAAOPppPpO",
      "....AAaaaaaAA...AAaaaaAAOPPpPPPO",
      "...AAaaaaAA...AAaaaaAA.OPPpEWPPO",
      "..AAaaaaAA...AAaaaaAA.OPPPEKWPPO",
      ".AAaaaaAA...AAaaaaAA..OPPPEEPPOO",
      ".AAaaaAA...AAaaaaAA..OPPSSSSPPPO",
      "AAaaaAA...AAaaaaAA..OPPsSSSSsPPO",
      "AAgaaAA..AAaaaaAA..OPPSSRRSSSPPO",
      "AgggaaA.AAaaaaAA..OPPsSRRRRsSPPO",
      "AAgaaA..AAaaaAA...OPPSSRRSSSPPO.",
      ".AaaA..AAaaaAA...OPPPSSSSSSPPPO.",
      "..AA..AAaaaAA...OPPPPPPPPPPPPPO.",
      ".....AAaaaAA...OPPDDPPPPPPDDPPO.",
      "....AAaaaAA...OPPDDDPPPPPDDDPPO.",
      "...AAaaaAA...OPPDDDDDPPPDDDDDPPO",
      "..AAaaaAA...OPPDD..DDPPDD..DDPPO",
      ".AAaaaAA...OPPDD...DDPPDD...DDPO",
      ".AAgaaA...OPPDD...OPPDDDDPO...OD",
      "AAggaaA..OPPDD...OPPDDDDDPO....O",
      "AAgaaA..OPpPO...OPpPO...OPpPO...",
      ".AaaA..OPAaAO..OPAaAO...OPAaAO..",
      "..AA..OPaggaO.OPaggaO...OPaggaO.",
      "......OAAaaAO.OAAaaAO...OAAaaAO.",
      ".......OOOOO...OOOOO.....OOOOO..",
      "................................",
      "................................",
      "................................"
    ]
  },
  "verdantix": {
    "frame0": [
      "................................",
      "........AA............AA........",
      ".......AaaA..........AaaA.......",
      "......AAgaaA........AAgaaA..OO..",
      "......AaggaaA..OO..AaggaaA.OPPO.",
      ".......AAaAAA.OPPO..AAaAA.OPppPO",
      "........AAA..OPppPO..AAA.OPppPpO",
      "............OPpPpPPO....OPPpPPPO",
      "...........OPppPpPPPO..OPPpEWPOO",
      "..........OPpPPPPPPPO..OPPEKWPOO",
      "..........OPPPsSsSPPO..OPPEEPOO.",
      ".........OPPsSSSSSSPO.OPPSSSSPO.",
      "........OPPssAAAAaaPOOPPsSSSSPO.",
      ".......OPPsAAgaaagaAOOPPSSssSPO.",
      "......OPPsAAgaaggaAAOPPPsSSsPPO.",
      ".....OPPsAAAaaaaaAAOPPPPPPPPPPO.",
      "....OPPPPPPaaaaaAAOPPDDPPDDPPPO.",
      "...OPPDDPPPPPPPPPPOPDDDPPDDDPPO.",
      "..OPPDDDPPDDDPPPDDOPDDDDPDDDDPPO",
      ".OPPDD..DPPDD.OPDDOPPDD..OPPDD.O",
      ".OPPD...DPPD...OPDOPPD...OPPD..O",
      "..OP....OPP....OP..OP....OPP....",
      "..OP....OPP....OP..OP....OPP....",
      "..OP....OPP....OP..OP....OPP....",
      ".OPPO..OPPPO..OPPOOPPO..OPPPO...",
      ".OPaAO.OPaaAO.OPaAOPaAO.OPaaAO..",
      "..OOO...OOOO...OOOOOOO...OOOO...",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "................................",
      ".......AAA............AAA.......",
      "......AaaAA..........AaaAA......",
      ".....AAgaaaA........AAgaaaA.OO..",
      ".....AagggaaA..OO..AagggaaAOPPO.",
      "......AAaAAA..OPPO..AAaAAAOPppPO",
      ".......AAA...OPppPO..AAA.OPppPpO",
      "............OPpPpPPO....OPPpPPPO",
      "...........OPppPpPPPO..OPPpEWPOO",
      "..........OPpPPPPPPPO..OPPEKWPOO",
      "..........OPPPsSsSPPO..OPPEEPOO.",
      ".........OPPsSSSSSSPO.OPPSSSSPO.",
      "........OPPssAAAAaaPOOPPsSSSSPO.",
      ".......OPPsAAgaaagaAOOPPSSssSPO.",
      "......OPPsAAgaaggaAAOPPPsSSsPPO.",
      ".....OPPsAAAaaaaaAAOPPPPPPPPPPO.",
      "....OPPPPPPaaaaaAAOPPDDPPDDPPPO.",
      "...OPPDDPPPPPPPPPPOPDDDPPDDDPPO.",
      "..OPPDDDPPDDDPPPDDOPDDDDPDDDDPPO",
      ".OPPDD..DPPDD.OPDDOPPDD..OPPDD.O",
      ".OPPD...DPPD...OPDOPPD...OPPD..O",
      "..OP....OPP....OP..OP....OPP....",
      "..OP....OPP....OP..OP....OPP....",
      "..OP....OPP....OP..OP....OPP....",
      ".OPPO..OPPPO..OPPOOPPO..OPPPO...",
      ".OPaAO.OPaaAO.OPaAOPaAO.OPaaAO..",
      "..OOO...OOOO...OOOOOOO...OOOO...",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ]
  },
  "sylvanox": {
    "frame0": [
      "....AA........AA......AA........",
      "...AaaA......AaaA....AaaA...AA..",
      "..AAgaaA....AAgaaA..AAgaaA.AaaA.",
      "..AagggaA..AAgggaAA.AagggaAAgaaA",
      "...AaggaAAAAaggaaA...AaggaAggaaA",
      "....AAaAAAAAAaAA......AAaAAaaAA.",
      ".....AAAA..AAAA........AAAAAA...",
      "......AA....AA...OOOO...AAAA....",
      "................OPppPO..........",
      ".....AA........OPpPpPPO...AA....",
      "....AaaA......OPppPpPPPO.AaaA...",
      "....AgaA.....OPpPPPPPPPPOAAaA...",
      ".....AA......OPpPEWPPPpPEWPO....",
      "............OPPPEKWPPOPEKWPO....",
      "............OPPPEEPPPOPEEPOO....",
      "...........OPPsSSRRRRRRSSsPO....",
      "..........OPPsSSRRggRRssSsPO....",
      ".........OPPssSSRRRRRRssSsPO....",
      "........OPPPsSSSSSSSSSSssPPPO...",
      ".......OPPDDPPPPPPPPPPPPDDPPPO..",
      "......OPPDDDPPPPPPPPPPPPDDDPPPO.",
      ".....OPPDDDDDPPPPPPPPPPDDDDDPPPO",
      "....OPPDD..DDPPDDPPDD..DDPPDD..O",
      "....OPPD...DDPPDDPPD...DDPPD...O",
      "....OPD....OPPD..OPD...OPPD....O",
      "....OPD....OPPD..OPD...OPPD....O",
      "...OPPO...OPPPO.OPPO..OPPPO.....",
      "...OBaO...OBaaO.OBaO..OBaaO.....",
      "...OOOO...OOOOO.OOOO..OOOOO.....",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "...AAA........AAA.....AAA.......",
      "..AaaAA......AaaAA...AaaAA..AA..",
      ".AAgaaaA....AAgaaaA.AAgaaaA.AaaA",
      ".AagggaaA..AAgggaaaAAagggaaAAgaA",
      "..AagggaAAAAagggaaA..AagggaAggaA",
      "...AAaAAAAAAaAAA......AAaAAaaAA.",
      "....AAAA..AAAA.........AAAAAA...",
      ".....AA....AA....OOOO...AAAA....",
      "................OPppPO..........",
      "....AA.........OPpPpPPO...AA....",
      "...AaaA.......OPppPpPPPO.AaaA...",
      "...AgaA......OPpPPPPPPPPOAAaA...",
      "....AA.......OPpPEWPPPpPEWPO....",
      "............OPPPEKWPPOPEKWPO....",
      "............OPPPEEPPPOPEEPOO....",
      "...........OPPsSSRRRRRRSSsPO....",
      "..........OPPsSSRRggRRssSsPO....",
      ".........OPPssSSRRRRRRssSsPO....",
      "........OPPPsSSSSSSSSSSssPPPO...",
      ".......OPPDDPPPPPPPPPPPPDDPPPO..",
      "......OPPDDDPPPPPPPPPPPPDDDPPPO.",
      ".....OPPDDDDDPPPPPPPPPPDDDDDPPPO",
      "....OPPDD..DDPPDDPPDD..DDPPDD..O",
      "....OPPD...DDPPDDPPD...DDPPD...O",
      "....OPD....OPPD..OPD...OPPD....O",
      "....OPD....OPPD..OPD...OPPD....O",
      "...OPPO...OPPPO.OPPO..OPPPO.....",
      "...OBaO...OBaaO.OBaO..OBaaO.....",
      "...OOOO...OOOOO.OOOO..OOOOO.....",
      "................................",
      "................................",
      "................................"
    ]
  },
  "sparkit": {
    "frame0": [
      "................................",
      "................................",
      ".......AA..............AA.......",
      "......AaaA............AaaA......",
      ".....AAgaaA..........AAgaaA.OO..",
      "....AAggaaA...OO....AAggaaAOPPO.",
      "....AaggaaA.OPPO...AaggaaAOPppPO",
      ".....AAaaAA.OPppPO..AAaaAAOPPpPO",
      "......AAAA.OPpPpPPO..AAAAOPPpPPO",
      "..........OPppPpPPPO....OPPpEWPO",
      "....AA..OPpPPPPPPPO..AA.OPPEKWPO",
      "...AaaA.OPPaAPPPaAAPOAaaAOPPEEPO",
      "..AAgaaAOPPaaPPPaaaPOAAgaOPPSSPO",
      ".AAggaaAOPPaAPPPaAAPOAAggOPsSSPO",
      ".AggaaAA.OPPPPPPPPPPO.AggOPSSsPO",
      "..AaaA....OPPsSsSPPO...A.OPPPPPO",
      "...AA....OPPDDPPDDPPO....OPPDDPO",
      "........OPPDDDPPDDDPPO..OPPDDDPO",
      ".......OPPDD..OPPDD..DPOPDD..DPO",
      ".......OPPD...OPPD...DPDPPD...DP",
      ".......OPPO...OPPO...OPDOPPO..OD",
      ".......OPPO...OPPO...OPDOPPO..OD",
      "......OPpPO..OPpPO..OPpPOPpPO..O",
      "......OPaAO..OPaAO..OPaAOPaAO...",
      ".......OOO....OOO....OOOOOOO....",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "................................",
      "......AAA..............AAA......",
      ".....AaaAA............AaaAA.....",
      "....AAgaaaA..........AAgaaaA.OO.",
      "...AAgggaaA...OO....AAgggaaAOPPO",
      "...AagggaaA.OPPO...AagggaaAOPppP",
      "....AAaaAA..OPppPO...AAaaAAOPPpP",
      ".....AAAA..OPpPpPPO...AAAAOPPpPP",
      "..........OPppPpPPPO.....OPPpEWP",
      "...AA....OPpPPPPPPPPO.AA.OPPEKWP",
      "..AaaA..OPPaAPPPaAAPOAaaAOPPEEPO",
      ".AAgaaA.OPPaaPPPaaaPOAAgaOPPSSPO",
      "AAggaaA.OPPaAPPPaAAPOAAggOPsSSPO",
      "AAgaaAA..OPPPPPPPPPPO.AggOPSSsPO",
      ".AaaA.....OPPsSsSPPO...A.OPPPPPO",
      "..AA.....OPPDDPPDDPPO....OPPDDPO",
      "........OPPDDDPPDDDPPO..OPPDDDPO",
      ".......OPPDD..OPPDD..DPOPDD..DPO",
      ".......OPPD...OPPD...DPDPPD...DP",
      ".......OPPO...OPPO...OPDOPPO..OD",
      ".......OPPO...OPPO...OPDOPPO..OD",
      "......OPpPO..OPpPO..OPpPOPpPO..O",
      "......OPaAO..OPaAO..OPaAOPaAO...",
      ".......OOO....OOO....OOOOOOO....",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ]
  },
  "voltlynx": {
    "frame0": [
      ".........AA............AA.......",
      "........AaaA..........AaaA......",
      ".......AAgaaA........AAgaaA..OO.",
      "......AAgggaaA..AA..AAgggaaAOPPO",
      ".....AAaggggaaAAaaAAaggggaaAOPpP",
      "....AAaaaAAAAAagaaAaaaAAAAAOPppP",
      "...AAaaaaAAAAAggaaaAaaaaAAAOPPpP",
      "..AAaAAAAAAA..AAaaAAAAAAA.OPPpEW",
      ".AAaaAAAAAA....AAAAAAAA..OPPEKWP",
      "AAgaaAAAAA......AAAAAA..OPPEEPOO",
      "AgggaaAAAA..AA...AA....OPPsSSPPO",
      "AggggaaAA..AaaA.AaaA..OPPsSSSSPO",
      "AAgggaAA..AAgaAAgaaA.OPPPsSSssPO",
      ".AAgaaAA.AAggaaaaAA.OPPDDPPPPPOO",
      "..AAaAA.AAgaaaaaAA.OPPDDDPPPPPO.",
      "...AAAA.AaaAAAAAA.OPPDDDDPPPPPO.",
      "....AA..AA.AAAA..OPPDDDDPPPPPO..",
      "................OPPDD..DDPPDDPO.",
      "...............OPPDD...DDPPDDP..",
      "..............OPPDD...OPPDDDPO..",
      ".............OPPDD...OPPDDDDPO..",
      "............OPpPO...OPpPO..OPPO.",
      "...........OPAaAO..OPAaAO..OPaAO",
      "..........OPaggaO.OPaggaO.OPagga",
      "..........OAAaaAO.OAAaaAO.OAAaaA",
      "...........OOOOO...OOOOO...OOOOO",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "........AAA............AAA......",
      ".......AaaAA..........AaaAA.....",
      "......AAgaaaA........AAgaaaA.OO.",
      ".....AAgggaaaA..AA..AAgggaaaAOPP",
      "....AAaggggaaaAAaaAAaggggaaaAOPp",
      "...AAaaaAAAAAAagaaAaaaAAAAAAOPpp",
      "..AAaaaaAAAAAAggaaaAaaaaAAAAOPPp",
      ".AAaAAAAAAAA..AAaaAAAAAAAA.OPPpE",
      "AAaaAAAAAAA....AAAAAAAAA..OPPEKW",
      "AgggaaAAAA......AAAAAAA..OPPEEPO",
      "AggggaaAAA..AA...AA....OPPsSSPPO",
      "AAgggaaAA..AaaA.AaaA..OPPsSSSSPO",
      ".AAgaaAA..AAgaAAgaaA.OPPPsSSssPO",
      "..AAaAA..AAggaaaaAA.OPPDDPPPPPOO",
      "...AAAA.AAgaaaaaAA.OPPDDDPPPPPO.",
      "....AA..AaaAAAAAA.OPPDDDDPPPPPO.",
      "........AA.AAAA..OPPDDDDPPPPPO..",
      "................OPPDD..DDPPDDPO.",
      "...............OPPDD...DDPPDDP..",
      "..............OPPDD...OPPDDDPO..",
      ".............OPPDD...OPPDDDDPO..",
      "............OPpPO...OPpPO..OPPO.",
      "...........OPAaAO..OPAaAO..OPaAO",
      "..........OPaggaO.OPaggaO.OPagga",
      "..........OAAaaAO.OAAaaAO.OAAaaA",
      "...........OOOOO...OOOOO...OOOOO",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ]
  },
  "shadeling": {
    "frame0": [
      "................................",
      "................................",
      ".............AAAAAA.............",
      "...........AAgaaagaAA...........",
      "..........AAggaaaaagaAA.........",
      ".........AAgaaAAAAaagaAA........",
      "........AAaAAOOOOOOAAaAA........",
      ".......AAaAOPPDDDDPPOAaAA.......",
      ".......AAAOPPDDDDDDPPOAAA.......",
      "......AA.OPPDDDDDDDDPPO.AA......",
      ".....AA.OPPDDDKKKDDDDPO..AA.....",
      "....AA..OPDDDKWEKKWDDDP...AA....",
      "...AA...OPDDDKWEEKWDDPPO...AA...",
      "...A....OPPDDDKKKDDDDPO....A....",
      "........OPPDDDDDDDDDDPPO........",
      ".......OPPDDPPDDDDPPDDPPO.......",
      "......OPPDDDPPPDDPPDDDPPPO......",
      ".....OPPDDDDPPPPDPPPPDDDDPPO....",
      "....AA.OPPDDPPPPDDDPPPDDPPO.AA..",
      "...AaaA.OPPDDDPPDDDPPDDDPO.AaaA.",
      "..AAgaaA.OPPDDPPDDPPDDPPO.AAgaaA",
      ".AAggaaA..OPPDD..DDPPDPO..AggaaA",
      "AAgaaAA....OPPD..DDPPPO....AgaaA",
      ".AaaA.......OPP..OPPPO......AaaA",
      "..AA.........OP..OPPO........AA.",
      "..............O..OPP............",
      "..................O.............",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "................................",
      "............AAAAAAA.............",
      "..........AAgaaaaagaAA..........",
      ".........AAggaaaaaagaAA.........",
      "........AAgaaAAAAAAaagaAA.......",
      ".......AAaAAOOOOOOOOAAaAA.......",
      "......AAaAOPPDDDDDDPPOAaAA......",
      "......AAAOPPDDDDDDDDPPOAAA......",
      ".....AA.OPPDDDDDDDDDDPPO.AA.....",
      "....AA.OPPDDDKKKKKDDDDPO..AA....",
      "...AA..OPDDDKWEKKWEDDDP...AA....",
      "..AA...OPDDDKWEEKWEEEDPPO..AA...",
      "..A....OPPDDDKKKKKDDDDPO....A...",
      ".......OPPDDDDDDDDDDDDPPO.......",
      "......OPPDDPPDDDDDDPPDDPPO......",
      ".....OPPDDDPPPDDDDPPDDDPPPO.....",
      "....OPPDDDDPPPPPDPPPPDDDDPPO....",
      "...AA.OPPDDPPPPPDDPPPDDPPO.AA...",
      "..AaaA.OPPDDDPPDDDPPDDDPO.AaaA..",
      ".AAgaaA.OPPDDPPDDPPDDPPO.AAgaaA.",
      "AAggaaA..OPPDD..DDPPDPO..AggaaAA",
      "AAgaaAA...OPPD..DDPPPO....AgaaA.",
      ".AaaA......OPP..OPPPO......AaaA.",
      "..AA........OP..OPPO........AA..",
      ".............O..OPP.............",
      ".................O..............",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ]
  },
  "umbravex": {
    "frame0": [
      "..BB........................BB..",
      ".BbaB......AAAA..AAAA......BbaB.",
      "BbaaB.....AAgaAAAAgaAA.....BbaaB",
      "BbbaB....AAgggaAAagggaAA...BbbaB",
      ".BBaB...AAgaaaAAAAaaagaAA..BBaB.",
      "..BBB..AAaAAOOOOOOOOAAaAA..BBB..",
      "..OPP.AAaAOPPDDDDDDPPOAaAA.PPO..",
      ".OPpPOAAAOPPDDDDDDDDPPOAAAPpPO..",
      "OPpPpPPO.OPPDDDKKKDDDDPO.OPpPpPO",
      "OPPpPPPOOPDDDKWEKKWDDDPPOOPPpPPO",
      "OPPpEWPOOPDDDKWEEKWDDPPOOPEWPPOO",
      ".OPPEKWP.OPPDDDKKKDDDDPO.PEKWPO.",
      ".OPPEEPO.OPPDDDDDDDDDDPPOPEEPO..",
      "..OPPPO..OPPDDDRRRRDDDPP.OPPPO..",
      "..OPPO...OPPDDRRggRRDDPP..OPPO..",
      "...OO....OPPDDRRggRRDDPP...OO...",
      ".........OPPDDDRRRRDDDPP........",
      "........OPPDDPPDDDDPPDDPPO......",
      ".......OPPDDDPPPDDPPDDDPPPO.....",
      "......OPPDDDDPPPPDPPPPDDDDPPO...",
      ".....OPPDD..DDPPDDPPDD..DDPPDD..",
      "....OPPDD...DDPPDDPPD...DDPPD...",
      "...OPPDD...OPPD..OPD...OPPD.....",
      "..OPPDD...OPPD..OPD...OPPD......",
      ".OPpPO...OPPO..OPPO..OPPO.......",
      "OBbaO...OBaO..OBaO..OBaO........",
      "OOOO...OOOO..OOOO..OOOO.........",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      ".BBB........................BBB.",
      "BbaB.......AAAA..AAAA.......BbaB",
      "BbaaB.....AAgaAAAAgaAA.....BbaaB",
      "BbbaB....AAgggaAAagggaAA...BbbaB",
      ".BBaB...AAgaaaAAAAaaagaAA..BBaB.",
      "..BBB..AAaAAOOOOOOOOAAaAA..BBB..",
      "..OPP.AAaAOPPDDDDDDPPOAaAA.PPO..",
      ".OPpPOAAAOPPDDDDDDDDPPOAAAPpPO..",
      "OPpPpPPO.OPPDDDKKKDDDDPO.OPpPpPO",
      "OPPpPPPOOPDDDKWEKKWDDDPPOOPPpPPO",
      "OPPpEWPOOPDDDKWEEKWDDPPOOPEWPPOO",
      ".OPPEKWP.OPPDDDKKKDDDDPO.PEKWPO.",
      ".OPPEEPO.OPPDDDDDDDDDDPPOPEEPO..",
      "..OPPPO..OPPDDDRRRRDDDPP.OPPPO..",
      "..OPPO...OPPDDRRggRRDDPP..OPPO..",
      "...OO....OPPDDRRggRRDDPP...OO...",
      ".........OPPDDDRRRRDDDPP........",
      "........OPPDDPPDDDDPPDDPPO......",
      ".......OPPDDDPPPDDPPDDDPPPO.....",
      "......OPPDDDDPPPPDPPPPDDDDPPO...",
      ".....OPPDD..DDPPDDPPDD..DDPPDD..",
      "....OPPDD...DDPPDDPPD...DDPPD...",
      "...OPPDD...OPPD..OPD...OPPD.....",
      "..OPPDD...OPPD..OPD...OPPD......",
      ".OPpPO...OPPO..OPPO..OPPO.......",
      "OBbaO...OBaO..OBaO..OBaO........",
      "OOOO...OOOO..OOOO..OOOO.........",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ]
  },
  "thornback": {
    "frame0": [
      "...........BB..........BB.......",
      "..........BbbB........BbbB......",
      ".........BbbbB...BB..BbbbB......",
      "........BbbbbB..BbbB.BbbbbB.....",
      ".......BbbbbB..BbbbbBBbbbbB.....",
      "......BbbbBB..BbbbbbBBbbbbB.....",
      ".....BbbbB...BbbbbbbBBbbbbB.OO..",
      "....BBbbB...BBbbbbbbBBbbbbBOPPO.",
      "...OOPPPPPPPPPPPPPPPPPPPPPOPpPPO",
      "..OPPDDPPDDPPDDPPDDPPDDPPPOPPPPO",
      ".OPPDDDPPDDDPPDDDPPDDDPPDDPOEWPO",
      "OPPDDDDPPDDDDPPDDDDPPDDDDPPEKWPO",
      "OPPDDDDPPDDDDPPDDDDPPDDDDPPEEPOO",
      "OPPssAAAAssAAAAssAAAAssAAAPPPPO.",
      "OPPsAAgaAssAAgaAssAAgaAssAPPPPO.",
      "OPPsAAggassAAggassAAggassAPPPPO.",
      "OPPssAAAAssAAAAssAAAAssAAAPPPPO.",
      ".OPPPPPPPPPPPPPPPPPPPPPPPPPOOOO.",
      "..OPPDDDPPDDDPPDDDPPDDDPPPO.....",
      "...OPPDD.OPPDD.OPPDD.OPPDD......",
      "...OPPD..OPPD..OPPD..OPPD.......",
      "...OPPD..OPPD..OPPD..OPPD.......",
      "...OPPO..OPPO..OPPO..OPPO.......",
      "..OPpPO.OPpPO.OPpPO.OPpPO.......",
      "..OBbBO.OBbBO.OBbBO.OBbBO.......",
      "...OOOO..OOOO..OOOO..OOOO.......",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "..........BBB..........BBB......",
      ".........BbbbB........BbbbB.....",
      "........BbbbbB...BB..BbbbbB.....",
      ".......BbbbbbB..BbbB.BbbbbbB....",
      "......BbbbbbB..BbbbbBBbbbbbB....",
      ".....BbbbbBB..BbbbbbBBbbbbbB....",
      "....BbbbbB...BbbbbbbBBbbbbbB.OO.",
      "...BBbbbB...BBbbbbbbBBbbbbbBOPPO",
      "..OOPPPPPPPPPPPPPPPPPPPPPPOPpPPO",
      ".OPPDDPPDDPPDDPPDDPPDDPPPOPPPPPO",
      "OPPDDDPPDDDPPDDDPPDDDPPDDPOEWPOO",
      "OPPDDDDPPDDDDPPDDDDPPDDDDPPEKWPO",
      "OPPDDDDPPDDDDPPDDDDPPDDDDPPEEPOO",
      "OPPssAAAAssAAAAssAAAAssAAAPPPPO.",
      "OPPsAAgaAssAAgaAssAAgaAssAPPPPO.",
      "OPPsAAggassAAggassAAggassAPPPPO.",
      "OPPssAAAAssAAAAssAAAAssAAAPPPPO.",
      ".OPPPPPPPPPPPPPPPPPPPPPPPPPOOOO.",
      "..OPPDDDPPDDDPPDDDPPDDDPPPO.....",
      "...OPPDD.OPPDD.OPPDD.OPPDD......",
      "...OPPD..OPPD..OPPD..OPPD.......",
      "...OPPD..OPPD..OPPD..OPPD.......",
      "...OPPO..OPPO..OPPO..OPPO.......",
      "..OPpPO.OPpPO.OPpPO.OPpPO.......",
      "..OBbBO.OBbBO.OBbBO.OBbBO.......",
      "...OOOO..OOOO..OOOO..OOOO.......",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ]
  },
  "volcarok": {
    "frame0": [
      "....AAAA..............AAAA......",
      "...AaaAA..............AAaaA.....",
      "..AAgaaAA............AAgaaAA....",
      ".AAgggaaA....OOOO....AgggaaAA...",
      ".AagggaaA...OPppPO...AagggaaA...",
      "..AAaaaA...OPpPpPPO...AaaaAA....",
      "...AAAA...OPppPpPPPO...AAAA.....",
      "..OOOOO...OPpPPPPPPPO..OOOOO....",
      ".OPDDDPO..OPpPEWPEWPO.OPDDDPO...",
      "OPPDDDDPO.OPPEKWPEKWPOOPDDDDPO..",
      "OPPDDDDPO.OPPEEPPEEPOOOPDDDDPO..",
      "OPPDDDDPOOPPsSSSSSSsPOOPDDDDPO..",
      "OPPDDDDPOPsSSRRRRRRSSsPDDDDDPO..",
      "OPPDDDDPOPsSRRggRRssSsPDDDDDPO..",
      "OPPDDDDPOPsSSRRRRRRSSsPDDDDDPO..",
      ".OPDDDPOOPPsSSSSSSSSSsPOPDDDPO..",
      "..OPPPO.OPPPPPPPPPPPPPPO.OPPPO..",
      "..OPPO..OPPDDPPPPPPDDPPO..OPPO..",
      "..OAAO..OPPDDDPPPPPDDDPPO.OAAO..",
      ".OAaaAO.OPPDDDD..DDDDDPO.OAaaAO.",
      ".OAgaAO.OPPDDD....DDDDPO.OAgaAO.",
      "OAgggaO.OPPDD......DDPPO.OAgggaO",
      "OAAaaAO.OPPD........DDPO.OAAaaAO",
      ".OOOOO..OPPO........OPPO..OOOOO.",
      "........OPPO........OPPO........",
      ".......OPpPO........OPpPO.......",
      ".......OBbBO........OBbBO.......",
      "........OOOO........OOOO........",
      "................................",
      "................................",
      "................................",
      "................................"
    ],
    "frame1": [
      "...AAAAAA............AAAAAA.....",
      "..AaaAAAA............AAAAaaA....",
      ".AAgaaaAA............AAaaagaAA..",
      "AAgggaaaA....OOOO....AgggaaaAA..",
      "AagggaaaA...OPppPO...AagggaaaA..",
      ".AAaaaaA...OPpPpPPO...AaaaaAA...",
      "..AAAAA...OPppPpPPPO...AAAAA....",
      "..OOOOO...OPpPPPPPPPO..OOOOO....",
      ".OPDDDPO..OPpPEWPEWPO.OPDDDPO...",
      "OPPDDDDPO.OPPEKWPEKWPOOPDDDDPO..",
      "OPPDDDDPO.OPPEEPPEEPOOOPDDDDPO..",
      "OPPDDDDPOOPPsSSSSSSsPOOPDDDDPO..",
      "OPPDDDDPOPsSSRRRRRRSSsPDDDDDPO..",
      "OPPDDDDPOPsSRRggRRssSsPDDDDDPO..",
      "OPPDDDDPOPsSSRRRRRRSSsPDDDDDPO..",
      ".OPDDDPOOPPsSSSSSSSSSsPOPDDDPO..",
      "..OPPPO.OPPPPPPPPPPPPPPO.OPPPO..",
      "..OPPO..OPPDDPPPPPPDDPPO..OPPO..",
      "..OAAO..OPPDDDPPPPPDDDPPO.OAAO..",
      ".OAaaAO.OPPDDDD..DDDDDPO.OAaaAO.",
      ".OAgaAO.OPPDDD....DDDDPO.OAgaAO.",
      "OAgggaO.OPPDD......DDPPO.OAgggaO",
      "OAAaaAO.OPPD........DDPO.OAAaaAO",
      ".OOOOO..OPPO........OPPO..OOOOO.",
      "........OPPO........OPPO........",
      ".......OPpPO........OPpPO.......",
      ".......OBbBO........OBbBO.......",
      "........OOOO........OOOO........",
      "................................",
      "................................",
      "................................",
      "................................"
    ]
  }
};

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
  [Element.Fire]: '#3b0a0a',
  [Element.Water]: '#08203e',
  [Element.Nature]: '#062916',
  [Element.Electric]: '#2b1c03',
  [Element.Shadow]: '#160529',
};

const HORN_BASES = {
  volcarok: '#262626',
  tidecrest: '#e11d48',
  thornback: '#1f2937',
  sylvanox: '#2e1065',
  umbravex: '#18042b',
};

const HORN_LIGHTS = {
  volcarok: '#525252',
  tidecrest: '#fb7185',
  thornback: '#4b5563',
  sylvanox: '#6b21a8',
  umbravex: '#4c1d95',
};

const EYE_IRISES = {
  [Element.Fire]: '#f59e0b',
  [Element.Water]: '#38bdf8',
  [Element.Nature]: '#10b981',
  [Element.Electric]: '#38bdf8',
  [Element.Shadow]: '#c084fc',
};

const SPECIAL_RUNES = {
  volcarok: '#fef08a',
  aquafin: '#67e8f9',
  tidecrest: '#67e8f9',
  sylvanox: '#86efac',
  umbravex: '#e9d5ff',
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
 * - 24 monster idle frames (12 monsters * 2 frames in HD 32x32 -> 64x64)
 * - 6 elemental icon glyphs (12x12)
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

      // Open arena clearing ground (Dynamic battle platforms drawn cleanly by BattleScene)

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

  // 6. Monster Pixel Art Sprites (32x32 HD scaled 2x -> 64x64)
  const scale = 2;
  const size = 32 * scale; // 64px

  for (const [id, monsterDef] of Object.entries(MONSTERS)) {
    const art = MONSTER_ART_GRIDS[id];
    if (!art) continue;

    const palette = monsterDef.palette;
    const element = monsterDef.element;

    const outlineColor = ELEMENT_OUTLINES[element] ?? '#1e293b';
    const primaryLight = lighten(palette.primary, 0.28);
    const primarySpecular = lighten(palette.primary, 0.52);
    const darkShade = palette.dark ?? darken(palette.primary, 0.38);

    const secondaryLight = lighten(palette.secondary, 0.3);
    const secondaryDark = darken(palette.secondary, 0.3);

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

      const grid = frame === 0 ? art.frame0 : art.frame1;
      const tex = createOrGetCanvasTexture(scene, key, size, size);
      if (!tex || !tex.context) continue;

      const ctx = tex.context;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);

      for (let y = 0; y < 32; y++) {
        const row = grid[y];
        if (!row) continue;
        for (let x = 0; x < 32; x++) {
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
