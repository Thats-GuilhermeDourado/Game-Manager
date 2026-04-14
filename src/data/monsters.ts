export interface Monster {
  id: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  ac: number;
  hp: number;
  speed: string;
  imageUrl?: string;
  attributes: {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
  };
  skills?: string;
  senses?: string;
  languages?: string;
  challenge: string;
  xp: number;
  traits: { name: string; description: string }[];
  actions: { name: string; description: string }[];
}

export const MONSTERS: Monster[] = [
  {
    id: 'goblin',
    name: 'Goblin',
    size: 'Small',
    type: 'Humanoid (goblinoid)',
    alignment: 'Neutral Evil',
    ac: 15,
    hp: 7,
    speed: '30 ft.',
    imageUrl: 'https://i.pinimg.com/1200x/5a/8f/25/5a8f25c77fd244e1554a2ad84d067ab3.jpg',
    attributes: {
      Strength: 8,
      Dexterity: 14,
      Constitution: 10,
      Intelligence: 10,
      Wisdom: 8,
      Charisma: 8
    },
    skills: 'Stealth +6',
    senses: 'Darkvision 60 ft., Passive Perception 9',
    languages: 'Common, Goblin',
    challenge: '1/4',
    xp: 50,
    traits: [
      {
        name: 'Nimble Escape',
        description: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.'
      }
    ],
    actions: [
      {
        name: 'Scimitar',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.'
      },
      {
        name: 'Shortbow',
        description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.'
      }
    ]
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    size: 'Medium',
    type: 'Undead',
    alignment: 'Lawful Evil',
    ac: 13,
    hp: 13,
    speed: '30 ft.',
    imageUrl: 'https://i.pinimg.com/736x/24/07/73/240773404baee6ac164708a71b708aa4.jpg',
    attributes: {
      Strength: 10,
      Dexterity: 14,
      Constitution: 15,
      Intelligence: 6,
      Wisdom: 8,
      Charisma: 5
    },
    senses: 'Darkvision 60 ft., Passive Perception 9',
    languages: 'Understands the languages it knew in life but can\'t speak',
    challenge: '1/4',
    xp: 50,
    traits: [
      {
        name: 'Damage Vulnerabilities',
        description: 'Bludgeoning'
      },
      {
        name: 'Damage Immunities',
        description: 'Poison'
      },
      {
        name: 'Condition Immunities',
        description: 'Exhaustion, Poisoned'
      }
    ],
    actions: [
      {
        name: 'Shortsword',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.'
      },
      {
        name: 'Shortbow',
        description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.'
      }
    ]
  },
  {
    id: 'owlbear',
    name: 'Owlbear',
    size: 'Large',
    type: 'Monstrosity',
    alignment: 'Unaligned',
    ac: 13,
    hp: 59,
    speed: '30 ft.',
    imageUrl: 'https://i.pinimg.com/1200x/ec/20/eb/ec20eba189201a7736713234da29109e.jpg',
    attributes: {
      Strength: 20,
      Dexterity: 12,
      Constitution: 17,
      Intelligence: 3,
      Wisdom: 12,
      Charisma: 7
    },
    skills: 'Perception +3',
    senses: 'Darkvision 60 ft., Passive Perception 13',
    challenge: '3',
    xp: 700,
    traits: [
      {
        name: 'Keen Sight and Smell',
        description: 'The owlbear has advantage on Wisdom (Perception) checks that rely on sight or smell.'
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The owlbear makes two attacks: one with its beak and one with its claws.'
      },
      {
        name: 'Beak',
        description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 10 (1d10 + 5) piercing damage.'
      },
      {
        name: 'Claws',
        description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) slashing damage.'
      }
    ]
  },
  {
    id: 'ghost',
    name: 'Fantasma',
    size: 'Medium',
    type: 'Undead',
    alignment: 'Any alignment',
    ac: 11,
    hp: 45,
    speed: '0 ft., fly 40 ft. (hover)',
    imageUrl: 'https://i.pinimg.com/1200x/86/bf/99/86bf993a86536d500b1e7491fadcaa25.jpg',
    attributes: {
      Strength: 7,
      Dexterity: 13,
      Constitution: 10,
      Intelligence: 10,
      Wisdom: 12,
      Charisma: 17
    },
    senses: 'Darkvision 60 ft., Passive Perception 11',
    languages: 'Any languages it knew in life',
    challenge: '4',
    xp: 1100,
    traits: [
      {
        name: 'Ethereal Sight',
        description: 'The ghost can see 60 feet into the Ethereal Plane when it is on the Material Plane, and vice versa.'
      },
      {
        name: 'Incorporeal Movement',
        description: 'The ghost can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object.'
      }
    ],
    actions: [
      {
        name: 'Withering Touch',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 17 (4d6 + 3) necrotic damage.'
      },
      {
        name: 'Etherealness',
        description: 'The ghost enters the Ethereal Plane from the Material Plane, or vice versa. It is visible on the Material Plane while it is in the Border Ethereal, and vice versa, yet it can\'t affect or be affected by anything on the other plane.'
      },
      {
        name: 'Horrifying Visage',
        description: 'Each non-undead creature within 60 feet of the ghost that can see it must succeed on a DC 13 Wisdom saving throw or be frightened for 1 minute.'
      },
      {
        name: 'Possession',
        description: 'One humanoid that the ghost can see within 5 feet of it must succeed on a DC 13 Charisma saving throw or be possessed by the ghost.'
      }
    ]
  }
];
