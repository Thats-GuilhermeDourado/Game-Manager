export interface EquipmentItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'tool' | 'adventuring-gear' | 'magic-item';
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
  cost?: string;
  weight?: string;
  description: string;
  properties?: string[];
  damage?: string;
  ac?: number;
  dexBonus?: boolean;
  maxDexBonus?: number;
  strengthRequirement?: number;
  stealthDisadvantage?: boolean;
}

export const EQUIPMENT: EquipmentItem[] = [
  {
    id: 'longsword',
    name: 'Longsword',
    type: 'weapon',
    rarity: 'common',
    cost: '15 gp',
    weight: '3 lb.',
    damage: '1d8 slashing',
    properties: ['Versatile (1d10)'],
    description: 'A classic double-edged sword, versatile and reliable in combat.'
  },
  {
    id: 'plate-armor',
    name: 'Plate Armor',
    type: 'armor',
    rarity: 'common',
    cost: '1,500 gp',
    weight: '65 lb.',
    ac: 18,
    dexBonus: false,
    strengthRequirement: 15,
    stealthDisadvantage: true,
    description: 'Plate consists of shaped, interlocking metal plates to cover the entire body. A suit of plate includes gauntlets, heavy leather boots, a visored helmet, and thick layers of padding underneath the armor. Buckles and straps distribute the weight over the body.'
  },
  {
    id: 'bag-of-holding',
    name: 'Bag of Holding',
    type: 'magic-item',
    rarity: 'uncommon',
    weight: '15 lb.',
    description: 'This bag has an interior space considerably larger than its outside dimensions, roughly 2 feet in diameter at the mouth and 4 feet deep. The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet.'
  },
  {
    id: 'thieves-tools',
    name: 'Thieves\' Tools',
    type: 'tool',
    rarity: 'common',
    cost: '25 gp',
    weight: '1 lb.',
    description: 'This set of tools includes a small file, a set of lock picks, a small mirror mounted on a metal handle, a set of narrow-bladed scissors, and a pair of pliers.'
  },
  {
    id: 'vorpal-sword',
    name: 'Vorpal Sword',
    type: 'magic-item',
    rarity: 'legendary',
    weight: '3 lb.',
    damage: '1d8 slashing',
    properties: ['Versatile (1d10)', 'Magic (+3)'],
    description: 'You gain a +3 bonus to attack and damage rolls made with this magic weapon. In addition, the weapon ignores resistance to slashing damage. When you roll a 20 on your attack roll with this weapon, you cut off the target\'s head.'
  }
];
