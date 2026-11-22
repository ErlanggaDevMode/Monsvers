export const SHOP_ITEMS = [
  {
    id: 'potion',
    name: 'Potion',
    price: 40,
    category: 'heal',
    value: 45,
    color: 0x22c55e,
    shortDesc: '+45 HP',
    description: 'Memulihkan 45 HP Monsver aktif.',
  },
  {
    id: 'super_potion',
    name: 'Super Potion',
    price: 95,
    category: 'heal',
    value: 90,
    color: 0x10b981,
    shortDesc: '+90 HP',
    description: 'Memulihkan 90 HP Monsver aktif.',
  },
  {
    id: 'antidote',
    name: 'Antidote',
    price: 35,
    category: 'cure',
    value: 1,
    color: 0xa855f7,
    shortDesc: 'Cure Status',
    description: 'Menyembuhkan Burn, Poison, atau Paralyze.',
  },
  {
    id: 'rift_orb',
    name: 'Rift Orb',
    price: 60,
    category: 'capture',
    value: 1.25,
    color: 0x38bdf8,
    shortDesc: '1.25x Catch',
    description: 'Orb standar untuk menangkap Monsver liar.',
  },
  {
    id: 'hyper_orb',
    name: 'Hyper Orb',
    price: 140,
    category: 'capture',
    value: 2.0,
    color: 0xf59e0b,
    shortDesc: '2.0x Catch',
    description: 'Orb energi tinggi dengan peluang tangkap 2x.',
  },
];

export const ITEMS_BY_ID = Object.fromEntries(SHOP_ITEMS.map((item) => [item.id, item]));

export function getItem(id) {
  if (typeof id !== 'string') return null;
  return Object.prototype.hasOwnProperty.call(ITEMS_BY_ID, id) ? ITEMS_BY_ID[id] : null;
}
