/**
 * Monsvers: The Battle Monster — 4-Chapter Campaign Data & Story Nodes
 *
 * Strict contract:
 * - CHAPTERS: 4 Chapters matching GDD
 * - CAMPAIGN_NODES: 12 story nodes (3 nodes per chapter)
 * - INTRO_DIALOGUE: 4 Indonesian story lines introducing Aetheria
 * - ENDING_DIALOGUE: 4 Indonesian victory celebration lines
 * - Helper functions: getNodeById, getNextNodeId, getNodesByChapter
 */

export const CHAPTERS = [
  { id: 1, name: 'Hutan Solara', subtitle: 'Starter & Awakening', theme: 'bg_arena_solara', accent: '#22c55e' },
  { id: 2, name: 'Teluk Azure', subtitle: 'Capture & Synergy', theme: 'bg_arena_azure', accent: '#38bdf8' },
  { id: 3, name: 'Kawah Ignis', subtitle: 'Evolution & Mastery', theme: 'bg_arena_ignis', accent: '#f97316' },
  { id: 4, name: 'Menara Eclipse', subtitle: 'Final Showdown', theme: 'bg_arena_eclipse', accent: '#a855f7' },
];

export const INTRO_DIALOGUE = [
  {
    speaker: 'Prof. Orin',
    portrait: 'portrait_orin',
    text: 'Selamat datang di Aetheria, Tamer muda! Dunia kita sedang berada dalam ancaman kehancuran besar.',
  },
  {
    speaker: 'Prof. Orin',
    portrait: 'portrait_orin',
    text: 'Retakan kuno Eclipse Rift di puncak Menara Eclipse telah terbuka, memancarkan kabut hampa yang merasuki para Monsver.',
  },
  {
    speaker: 'Prof. Orin',
    portrait: 'portrait_orin',
    text: 'Sebagai Tamer terpilih dari Desa Solara, ikatan batinmu dengan Monsver adalah kunci untuk menyegel celah itu kembali.',
  },
  {
    speaker: 'Prof. Orin',
    portrait: 'portrait_orin',
    text: 'Pilihlah satu Monsver starter untuk menemanimu: Pyrofang, Aquafin, atau Verdantix. Perjalanan agungmu dimulai sekarang!',
  },
];

export const ENDING_DIALOGUE = [
  {
    speaker: 'Prof. Orin',
    portrait: 'portrait_orin',
    text: 'Luar biasa! Energi hampa Umbravex akhirnya tenang dan Eclipse Rift telah disegel rapat untuk selamanya!',
  },
  {
    speaker: 'Kael',
    portrait: 'portrait_kael',
    text: 'Heh, aku harus angkat topi padamu. Kamu memang pantas menyandang gelar Tamer nomor satu di seluruh Aetheria!',
  },
  {
    speaker: 'Prof. Orin',
    portrait: 'portrait_orin',
    text: 'Harmoni enam elemen telah kembali menyinari benua kita berkat keberanian dan ketulusan ikatan tim Monsver-mu.',
  },
  {
    speaker: 'Prof. Orin',
    portrait: 'portrait_orin',
    text: 'Namamu akan terukir abadi dalam sejarah Aetheria. Selamat atas kemenanganmu, Master Tamer!',
  },
];

export const CAMPAIGN_NODES = [
  // ==========================================
  // CHAPTER 1: Hutan Solara (Starter & Awakening)
  // ==========================================
  {
    id: 'ch1_1',
    chapter: 1,
    index: 1,
    title: 'Semak Berlistrik',
    subtitle: 'Pertemuan Monsver Liar',
    type: 'wild',
    enemyId: 'sparkit',
    enemyLevel: 4,
    aiTier: 0,
    xpReward: 65,
    goldReward: 50,
    itemRewards: { potion: 1 },
    mapPos: { x: 120, y: 195 },
    arenaTheme: 'bg_arena_solara',
    preDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Lihat ke semak belukar itu! Ada Sparkit liar yang gelisah karena getaran Eclipse Rift. Uji taktik pertamamu!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Langkah awal yang hebat! Kamu sudah memahami pentingnya ritme dan keunggulan elemen dalam pertarungan.',
      },
    ],
  },
  {
    id: 'ch1_2',
    chapter: 1,
    index: 2,
    title: 'Tantangan Perdana Kael',
    subtitle: 'Pertarungan Rival',
    type: 'rival',
    enemyId: 'aquafin',
    enemyLevel: 6,
    aiTier: 1,
    xpReward: 120,
    goldReward: 90,
    itemRewards: { potion: 1, rift_orb: 1 },
    mapPos: { x: 320, y: 130 },
    arenaTheme: 'bg_arena_solara',
    preDialogue: [
      {
        speaker: 'Kael',
        portrait: 'portrait_kael',
        text: 'Hei! Jadi kamu yang dibicarakan Prof. Orin? Jangan mimpi melangkah lebih jauh jika belum bisa mengalahkanku!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Kael',
        portrait: 'portrait_kael',
        text: 'Cih, jangan berpuas diri dulu! Aku hanya kurang fokus tadi. Sampai jumpa di Teluk Azure!',
      },
    ],
  },
  {
    id: 'ch1_3',
    chapter: 1,
    index: 3,
    title: 'Sang Penjaga Rimba',
    subtitle: 'Chapter Boss — Thornback',
    type: 'boss',
    enemyId: 'thornback',
    enemyLevel: 7,
    aiTier: 2,
    xpReward: 190,
    goldReward: 160,
    itemRewards: { super_potion: 1, rift_orb: 1 },
    mapPos: { x: 520, y: 175 },
    arenaTheme: 'bg_arena_solara',
    preDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Waspadalah! Thornback, penjaga kuno Hutan Solara, dirasuki kristal duri kegelapan Eclipse!',
      },
    ],
    phase2Dialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Hati-hati! Duri kristal Thornback memancarkan gelombang kejut liar—ia memasuki Fase Amarah!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Luar biasa! Duri korupsinya telah hancur. Hutan kembali damai dan jalur menuju Teluk Azure kini terbuka lebar!',
      },
    ],
  },

  // ==========================================
  // CHAPTER 2: Teluk Azure (Capture & Synergy)
  // ==========================================
  {
    id: 'ch2_1',
    chapter: 2,
    index: 1,
    title: 'Pesisir Ombak Biru',
    subtitle: 'Monsver Air Liar',
    type: 'wild',
    enemyId: 'aquafin',
    enemyLevel: 7,
    aiTier: 0,
    xpReward: 140,
    goldReward: 80,
    itemRewards: { potion: 1 },
    mapPos: { x: 125, y: 185 },
    arenaTheme: 'bg_arena_azure',
    preDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Udara laut Teluk Azure sangat menyegarkan! Aquafin liar berenang di dekat karang. Manfaatkan Rift Orb jika ingin merekrutnya!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Kerja tim yang solid! Komposisi party yang beragam akan menjadi kunci kesuksesanmu di babak berikutnya.',
      },
    ],
  },
  {
    id: 'ch2_2',
    chapter: 2,
    index: 2,
    title: 'Tebing Badai Karang',
    subtitle: 'Monsver Petir Liar',
    type: 'wild',
    enemyId: 'sparkit',
    enemyLevel: 8,
    aiTier: 0,
    xpReward: 175,
    goldReward: 110,
    itemRewards: { potion: 2 },
    mapPos: { x: 315, y: 120 },
    arenaTheme: 'bg_arena_azure',
    preDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Tebing karang ini dipenuhi muatan listrik statis! Waspadai kecepatan kilat Sparkit liar pesisir!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Pertahanan yang mantap! Gerbang menuju palung laut dalam kini sudah berada tepat di depan mata.',
      },
    ],
  },
  {
    id: 'ch2_3',
    chapter: 2,
    index: 3,
    title: 'Penguasa Samudra',
    subtitle: 'Chapter Boss — Tidecrest',
    type: 'boss',
    enemyId: 'tidecrest',
    enemyLevel: 9,
    aiTier: 2,
    xpReward: 275,
    goldReward: 240,
    itemRewards: { super_potion: 1, antidote: 1, rift_orb: 1 },
    mapPos: { x: 515, y: 180 },
    arenaTheme: 'bg_arena_azure',
    preDialogue: [
      {
        speaker: 'Rift Warden',
        portrait: 'portrait_warden',
        text: 'Berhenti di sana, bocah! Arus pasang Tidecrest yang diperkuat energi Eclipse akan menenggelamkan asa kalian!',
      },
    ],
    phase2Dialogue: [
      {
        speaker: 'Rift Warden',
        portrait: 'portrait_warden',
        text: 'Arus pasang Eclipse terbangun seutuhnya! Ombak badai Tidecrest akan menenggelamkan kalian!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Pusaran air mereda dan Tidecrest kembali tenang! Rift Warden itu kabur ke arah lereng Kawah Ignis. Ayo kejar!',
      },
    ],
  },

  // ==========================================
  // CHAPTER 3: Kawah Ignis (Evolution & Mastery)
  // ==========================================
  {
    id: 'ch3_1',
    chapter: 3,
    index: 1,
    title: 'Celah Magma Gelap',
    subtitle: 'Monsver Bayangan Liar',
    type: 'wild',
    enemyId: 'shadeling',
    enemyLevel: 9,
    aiTier: 0,
    xpReward: 230,
    goldReward: 130,
    itemRewards: { antidote: 1, potion: 1 },
    mapPos: { x: 130, y: 190 },
    arenaTheme: 'bg_arena_ignis',
    preDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Aneh sekali... di kawah sepanas ini, hawa dingin terasa menusuk. Shadeling bersembunyi di balik bayang-bayang batu basal!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Kabut bayangan itu sirna. Aura korupsi Eclipse Rift di kawah ini terasa semakin pekat dan berbahaya.',
      },
    ],
  },
  {
    id: 'ch3_2',
    chapter: 3,
    index: 2,
    title: 'Rematch Api Berkobar',
    subtitle: 'Pertarungan Rival — Kael',
    type: 'rival',
    enemyId: 'blazefang',
    enemyLevel: 10,
    aiTier: 1,
    xpReward: 340,
    goldReward: 270,
    itemRewards: { super_potion: 2, rift_orb: 1 },
    mapPos: { x: 325, y: 140 },
    arenaTheme: 'bg_arena_ignis',
    preDialogue: [
      {
        speaker: 'Kael',
        portrait: 'portrait_kael',
        text: 'Kita bertemu lagi! Monsver-ku telah berevolusi menjadi Blazefang sang taring inferno. Mari kita buktikan siapa Tamer terhebat!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Kael',
        portrait: 'portrait_kael',
        text: 'Kekuatanmu benar-benar melampaui dugaanku... Masuklah ke kaldera utama, kalahkan titan lava itu!',
      },
    ],
  },
  {
    id: 'ch3_3',
    chapter: 3,
    index: 3,
    title: 'Titan Kaldera Basalt',
    subtitle: 'Chapter Boss — Volcarok',
    type: 'boss',
    enemyId: 'volcarok',
    enemyLevel: 11,
    aiTier: 2,
    xpReward: 440,
    goldReward: 360,
    itemRewards: { super_potion: 2, rift_orb: 2 },
    mapPos: { x: 525, y: 170 },
    arenaTheme: 'bg_arena_ignis',
    preDialogue: [
      {
        speaker: 'Rift Warden',
        portrait: 'portrait_warden',
        text: 'Kalian terlambat! Volcarok sang titan kaldera telah menyatu dengan bara kutukan lava terdalam!',
      },
    ],
    phase2Dialogue: [
      {
        speaker: 'Rift Warden',
        portrait: 'portrait_warden',
        text: 'Kaldera bergolak! Volcarok menyerap inti lava terdalam—rasakan amarah bumi yang membara!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Magma raksasa kembali tertidur lelap! Jembatan obsidian menuju Menara Eclipse kini berdiri megah di hadapan kita.',
      },
    ],
  },

  // ==========================================
  // CHAPTER 4: Menara Eclipse (Final Showdown)
  // ==========================================
  {
    id: 'ch4_1',
    chapter: 4,
    index: 1,
    title: 'Tangga Halilintar Hampa',
    subtitle: 'Rift Guardian — Voltlynx',
    type: 'rival',
    enemyId: 'voltlynx',
    enemyLevel: 12,
    aiTier: 1,
    xpReward: 500,
    goldReward: 320,
    itemRewards: { super_potion: 2 },
    mapPos: { x: 120, y: 180 },
    arenaTheme: 'bg_arena_eclipse',
    preDialogue: [
      {
        speaker: 'Rift Warden',
        portrait: 'portrait_warden',
        text: 'Takkan ada yang kuizinkan mengganggu puncak Menara! Voltlynx, sambar mereka dengan halilintar kehampaan!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Rift Warden',
        portrait: 'portrait_warden',
        text: 'Ugh... kecepatannya masih belum sanggup menembus pertahanan timmu... Tapi jalan ke atas takkan semudah ini!',
      },
    ],
  },
  {
    id: 'ch4_2',
    chapter: 4,
    index: 2,
    title: 'Gerbang Belukar Hampa',
    subtitle: 'Rift Guardian — Sylvanox',
    type: 'boss',
    enemyId: 'sylvanox',
    enemyLevel: 13,
    aiTier: 2,
    xpReward: 590,
    goldReward: 400,
    itemRewards: { super_potion: 2, rift_orb: 2 },
    mapPos: { x: 310, y: 125 },
    arenaTheme: 'bg_arena_eclipse',
    preDialogue: [
      {
        speaker: 'Rift Warden',
        portrait: 'portrait_warden',
        text: 'Sylvanox purba yang terkorupsi adalah benteng terakhir kami! Terperangkaplah selamanya dalam duri kegelapan Eclipse!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Benteng penjaga runtuh! Puncak Menara Eclipse kini tak terlindungi. Di atas sanalah Umbravex menunggumu!',
      },
    ],
  },
  {
    id: 'ch4_3',
    chapter: 4,
    index: 3,
    title: 'Puncak Gerhana Abadi',
    subtitle: 'Final Boss — Umbravex',
    type: 'boss',
    enemyId: 'umbravex',
    enemyLevel: 15,
    aiTier: 2,
    xpReward: 900,
    goldReward: 650,
    itemRewards: { super_potion: 3, rift_orb: 3 },
    mapPos: { x: 520, y: 165 },
    arenaTheme: 'bg_arena_eclipse',
    preDialogue: [
      {
        speaker: 'Umbravex',
        portrait: 'portrait_umbravex',
        text: 'GRAAAWRRR...! KEGELAPAN ABADI AKAN MENELAN SELURUH AETHERIA... IKATAN KALIAN AKAN HANCUR LEBUR DI SINI!',
      },
    ],
    phase2Dialogue: [
      {
        speaker: 'Umbravex',
        portrait: 'portrait_umbravex',
        text: 'KAU BERANI MENENTANG KEHENDAK GERHANA?! SAKSIKAN KEKUATAN SEJATI DARI KEHAMPAAN ABADI!',
      },
      {
        speaker: 'Umbravex',
        portrait: 'portrait_umbravex',
        text: 'ECLIPSE AWAKENING! SELURUH CAHAYA AETHERIA AKAN PADAM DI DALAM KELAM!',
      },
    ],
    postDialogue: [
      {
        speaker: 'Umbravex',
        portrait: 'portrait_umbravex',
        text: 'Cahaya itu... kehangatan ikatan sejati antara Tamer dan Monsver... kehampaan Eclipse... akhirnya sirna...',
      },
    ],
  },
];

/**
 * Returns a campaign node by its unique ID.
 * @param {string} id
 * @returns {object}
 */
export function getNodeById(id) {
  return CAMPAIGN_NODES.find((n) => n.id === id) ?? CAMPAIGN_NODES[0];
}

/**
 * Returns the ID of the next node following the given node ID.
 * @param {string} id
 * @returns {string|null}
 */
export function getNextNodeId(id) {
  const idx = CAMPAIGN_NODES.findIndex((n) => n.id === id);
  if (idx >= 0 && idx + 1 < CAMPAIGN_NODES.length) return CAMPAIGN_NODES[idx + 1].id;
  return null;
}

/**
 * Returns all campaign nodes associated with a specific chapter.
 * @param {number} chapterId
 * @returns {Array<object>}
 */
export function getNodesByChapter(chapterId) {
  return CAMPAIGN_NODES.filter((n) => n.chapter === chapterId);
}

/**
 * Preset MC (Main Character) names for quick one-tap mobile selection.
 */
export const MC_PRESET_NAMES = ['Arion', 'Sora', 'Kaen', 'Zera'];

/**
 * 3-Act Prologue introducing the Main Character (MC) at the start of Campaign.
 */
export const PROLOGUE_ACTS = [
  {
    id: 'act1_mc_intro',
    tag: 'PROLOG • BABAK 1/3',
    location: 'DESA SOLARA — FAJAR DI BENUA AETHERIA',
    backdrop: 'bg_arena_solara',
    tint: 0x7c93b5,
    dialogue: [
      {
        speaker: 'Narator',
        portrait: 'portrait_player',
        text: 'Di benua Aetheria, manusia dan makhluk elemental bernama Monsver telah hidup berdampingan selama berabad-abad.',
      },
      {
        speaker: 'Tamer Muda (MC)',
        portrait: 'portrait_player',
        text: 'Hari ini akhirnya tiba! Setelah bertahun-tahun belajar di Desa Solara, aku siap menjadi Tamer sejati dan memiliki Monsver pertamaku!',
      },
    ],
  },
  {
    id: 'act2_eclipse_rift',
    tag: 'PROLOG • BABAK 2/3',
    location: 'PUNCAK MENARA ECLIPSE — MALAM GERHANA',
    backdrop: 'bg_arena_eclipse',
    tint: 0x9b7bc4,
    dialogue: [
      {
        speaker: 'Narator',
        portrait: 'portrait_umbravex',
        text: 'Namun ketenangan itu mendadak pecah! Langit Aetheria terbelah oleh retakan energi kuno bernama Eclipse Rift!',
      },
      {
        speaker: 'Tamer Muda (MC)',
        portrait: 'portrait_player',
        text: 'Cahaya ungu dari Menara Eclipse itu... seluruh hutan bergetar! Para Monsver liar dan Apex Guardian mulai kehilangan kendali!',
      },
    ],
  },
  {
    id: 'act3_orin_call',
    tag: 'PROLOG • BABAK 3/3',
    location: 'LABORATORIUM PROF. ORIN — DESA SOLARA',
    backdrop: 'bg_arena_solara',
    tint: 0x6280a8,
    dialogue: [
      {
        speaker: 'Prof. Orin',
        portrait: 'portrait_orin',
        text: 'Syukurlah kau datang tepat waktu! Aetheria membutuhkan Tamer berhati murni untuk menenangkan para Guardian dan menyegel Eclipse Rift.',
      },
      {
        speaker: 'Tamer Muda (MC)',
        portrait: 'portrait_player',
        text: 'Aku tidak akan lari, Prof! Bersama partner Monsver pertamaku, aku akan menempuh 4 wilayah Aetheria dan menyelamatkan dunia ini!',
      },
    ],
  },
];

/**
 * Encouraging dialogue played on the Defeat screen in Campaign mode.
 * @param {string} playerName
 */
export function getDefeatDialogue(playerName = 'Arion') {
  return [
    {
      speaker: playerName,
      portrait: 'portrait_player',
      text: 'Sial... serangan mereka kuat sekali. Tapi aku tidak boleh menyerah sampai di sini!',
    },
    {
      speaker: 'Prof. Orin',
      portrait: 'portrait_orin',
      text: `Tenang, ${playerName}. Tim Monsver-mu sudah pulih penuh di Camp Solara. Atur strategi elemenmu dan bangkit lagi!`,
    },
  ];
}
