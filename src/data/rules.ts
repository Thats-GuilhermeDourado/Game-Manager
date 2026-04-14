// Regras Oficiais D&D 5e (Player's Handbook)

export const XP_TABLE = [
  { level: 1, xp: 0, proficiency: 2 },
  { level: 2, xp: 300, proficiency: 2 },
  { level: 3, xp: 900, proficiency: 2 },
  { level: 4, xp: 2700, proficiency: 2 },
  { level: 5, xp: 6500, proficiency: 3 },
  { level: 6, xp: 14000, proficiency: 3 },
  { level: 7, xp: 23000, proficiency: 3 },
  { level: 8, xp: 34000, proficiency: 3 },
  { level: 9, xp: 48000, proficiency: 4 },
  { level: 10, xp: 64000, proficiency: 4 },
  { level: 11, xp: 85000, proficiency: 4 },
  { level: 12, xp: 100000, proficiency: 4 },
  { level: 13, xp: 120000, proficiency: 5 },
  { level: 14, xp: 140000, proficiency: 5 },
  { level: 15, xp: 165000, proficiency: 5 },
  { level: 16, xp: 195000, proficiency: 5 },
  { level: 17, xp: 225000, proficiency: 6 },
  { level: 18, xp: 265000, proficiency: 6 },
  { level: 19, xp: 305000, proficiency: 6 },
  { level: 20, xp: 355000, proficiency: 6 },
];

export interface Race {
  subraces: string[];
  traits: string[];
  bonuses: Record<string, number>;
  description?: string;
  culture?: string;
  howToPlay?: string;
  traitDescriptions?: Record<string, string>;
  size?: string;
  speed?: number;
  languages?: string[];
}

export const RACES: Record<string, Race> = {
  Anão: {
    subraces: ["Anão da Colina", "Anão da Montanha"],
    traits: ["Visão no Escuro", "Resistência Anã", "Treinamento Anão em Combate"],
    bonuses: { Constitution: 2 },
    size: "Médio",
    speed: 25,
    languages: ["Comum", "Anão"],
    description: "Mestres ferreiros e mineradores, os anões são conhecidos por sua resistência, determinação e lealdade às suas tradições e clãs.",
    traitDescriptions: {
      "Visão no Escuro": "Você enxerga na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      "Resistência Anã": "Você tem vantagem em testes de resistência contra veneno e resistência a dano de veneno.",
      "Treinamento Anão em Combate": "Você tem proficiência com machados de batalha, machadinhas, martelos leves e martelos de guerra."
    }
  },
  Elfo: {
    subraces: ["Alto Elfo", "Elfo da Floresta", "Drow (Elfo Obscuro)"],
    traits: ["Visão no Escuro", "Sentidos Aguçados", "Ancestralidade Feérica", "Transe"],
    bonuses: { Dexterity: 2 },
    size: "Médio",
    speed: 30,
    languages: ["Comum", "Élfico"],
    description: "Povo gracioso e de vida longa, os elfos vivem em harmonia com a natureza ou em cidades de beleza estonteante, dedicando-se às artes e à magia.",
    traitDescriptions: {
      "Visão no Escuro": "Você enxerga na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      "Sentidos Aguçados": "Você tem proficiência na perícia Percepção.",
      "Ancestralidade Feérica": "Você tem vantagem em testes de resistência contra ser enfeitiçado e magia não pode colocar você para dormir.",
      "Transe": "Elfos não precisam dormir. Em vez disso, meditam profundamente por 4 horas por dia."
    }
  },
  Halfling: {
    subraces: ["Pés-Leves", "Robusto"],
    traits: ["Sortudo", "Bravo", "Agilidade Halfling"],
    bonuses: { Dexterity: 2 },
    size: "Pequeno",
    speed: 25,
    languages: ["Comum", "Halfling"],
    description: "Pequenos e ágeis, os halflings valorizam o conforto, a boa comida e a amizade, mas possuem uma coragem surpreendente quando necessário.",
    traitDescriptions: {
      "Sortudo": "Quando você rolar um 1 natural em um ataque, teste de habilidade ou resistência, você pode rolar novamente o dado.",
      "Bravo": "Você tem vantagem em testes de resistência contra ficar amedrontado.",
      "Agilidade Halfling": "Você pode se mover através do espaço de qualquer criatura que seja um tamanho maior que o seu."
    }
  },
  Humano: {
    subraces: ["Padrão", "Variante"],
    traits: ["Versatilidade"],
    bonuses: { Strength: 1, Dexterity: 1, Constitution: 1, Intelligence: 1, Wisdom: 1, Charisma: 1 },
    size: "Médio",
    speed: 30,
    languages: ["Comum", "Um idioma adicional"],
    description: "A raça mais versátil e ambiciosa entre os povos comuns, os humanos são conhecidos por sua capacidade de adaptação e diversidade cultural.",
    traitDescriptions: {
      "Versatilidade": "Humanos ganham bônus em todos os seus atributos, refletindo sua natureza equilibrada e adaptável."
    }
  },
  Draconato: {
    subraces: [],
    traits: ["Ancestralidade Dracônica", "Arma de Sopro", "Resistência a Dano"],
    bonuses: { Strength: 2, Charisma: 1 },
    size: "Médio",
    speed: 30,
    languages: ["Comum", "Dracônico"],
    description: "Descendentes de dragões, os draconatos possuem escamas coloridas e a habilidade de expelir energia elemental, valorizando a honra e o clã acima de tudo.",
    traitDescriptions: {
      "Ancestralidade Dracônica": "Você escolhe um tipo de dragão, o que determina o elemento da sua arma de sopro e sua resistência.",
      "Arma de Sopro": "Você pode usar sua ação para exalar energia destrutiva baseada na sua ancestralidade.",
      "Resistência a Dano": "Você tem resistência ao tipo de dano associado à sua ancestralidade dracônica."
    }
  },
  Gnomo: {
    subraces: ["Gnomo da Floresta", "Gnomo da Rocha"],
    traits: ["Visão no Escuro", "Esperteza Gnômica"],
    bonuses: { Intelligence: 2 },
    size: "Pequeno",
    speed: 25,
    languages: ["Comum", "Gnômico"],
    description: "Criaturas vibrantes e curiosas, os gnomos são inventores natos e entusiastas da vida, possuindo uma afinidade natural com a magia e a engenharia.",
    traitDescriptions: {
      "Visão no Escuro": "Você enxerga na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      "Esperteza Gnômica": "Você tem vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma contra magia."
    }
  },
  "Meio-Elfo": {
    subraces: [],
    traits: ["Visão no Escuro", "Ancestralidade Feérica", "Versatilidade em Perícias"],
    bonuses: { Charisma: 2 }, // +1 em outros dois
    size: "Médio",
    speed: 30,
    languages: ["Comum", "Élfico", "Um idioma adicional"],
    description: "Caminhando entre dois mundos, os meio-elfos combinam a graça élfica com a ambição humana, sendo excelentes diplomatas e andarilhos.",
    traitDescriptions: {
      "Visão no Escuro": "Você enxerga na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      "Ancestralidade Feérica": "Você tem vantagem em testes de resistência contra ser enfeitiçado e magia não pode colocar você para dormir.",
      "Versatilidade em Perícias": "Você ganha proficiência em duas perícias à sua escolha."
    }
  },
  "Meio-Orc": {
    subraces: [],
    traits: ["Visão no Escuro", "Ameaçador", "Resistência Implacável", "Ataques Selvagens"],
    bonuses: { Strength: 2, Constitution: 1 },
    size: "Médio",
    speed: 30,
    languages: ["Comum", "Orc"],
    description: "Fortes e ferozes, os meio-orcs possuem uma vitalidade incrível e uma determinação inabalável, frequentemente buscando provar seu valor através da força.",
    traitDescriptions: {
      "Visão no Escuro": "Você enxerga na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      "Ameaçador": "Você ganha proficiência na perícia Intimidação.",
      "Resistência Implacável": "Quando você é reduzido a 0 pontos de vida mas não morre, você pode voltar para 1 ponto de vida (uma vez por descanso longo).",
      "Ataques Selvagens": "Quando você atinge um acerto crítico, você pode rolar um dos dados de dano da arma mais uma vez e adicioná-lo ao dano extra."
    }
  },
  Tiefling: {
    subraces: [],
    traits: ["Visão no Escuro", "Resistência Infernal", "Legado Infernal"],
    bonuses: { Intelligence: 1, Charisma: 2 },
    size: "Médio",
    speed: 30,
    languages: ["Comum", "Infernal"],
    description: "Marcados por uma linhagem infernal, os tieflings frequentemente enfrentam preconceito, mas possuem uma vontade forte e habilidades mágicas inatas.",
    traitDescriptions: {
      "Visão no Escuro": "Você enxerga na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      "Resistência Infernal": "Você tem resistência a dano de fogo.",
      "Legado Infernal": "Você conhece o truque Taumaturgia e ganha magias adicionais conforme sobe de nível."
    }
  },
  Grung: {
    subraces: [],
    traits: ["Anfíbio", "Imunidade a Veneno", "Pele Venenosa", "Salto Parado", "Alerta Arbóreo", "Dependência de Água"],
    traitDescriptions: {
      "Anfíbio": "Você pode respirar ar e água.",
      "Imunidade a Veneno": "Você é imune a dano de veneno e à condição envenenado.",
      "Pele Venenosa": "Qualquer criatura que agarre você ou faça contato direto com sua pele deve ser bem-sucedida num teste de resistência de Constituição ou ficará envenenada.",
      "Salto Parado": "Seu salto em distância é de até 7,5 metros e seu salto em altura é de até 4,5 metros, com ou sem corrida.",
      "Alerta Arbóreo": "Você tem proficiência na perícia Percepção.",
      "Dependência de Água": "Se você não se imergir em água por pelo menos 1 hora durante um dia, você sofre um nível de exaustão ao final do dia."
    },
    bonuses: { Dexterity: 2, Constitution: 1 },
    size: "Pequeno",
    speed: 25,
    languages: ["Grung"],
    description: "Pequenos humanoides anfíbios e agressivos das selvas tropicais, com uma sociedade rígida de castas baseada na cor da pele.",
    culture: "A sociedade Grung é uma comunalidade rígida, operando em um sistema de castas determinado pela cor da pele. Cada família deposita seus ovos em viveiros comunitários.",
    howToPlay: "Você foi criado para ver o mundo em termos de hierarquia. Como aventureiro, pode estar tentando provar seu valor ou ser um exilado que busca seu próprio caminho."
  }
};

export const CLASSES = {
  Bárbaro: {
    hitDie: 12,
    subclasses: ["Caminho do Berserker", "Caminho do Totem"],
    primaryAbility: "Strength",
    savingThrows: ["Strength", "Constitution"],
    startingGoldDice: "2d4",
    skillChoicesCount: 2
  },
  Bardo: {
    hitDie: 8,
    subclasses: ["Colégio do Conhecimento", "Colégio da Bravura"],
    primaryAbility: "Charisma",
    savingThrows: ["Dexterity", "Charisma"],
    startingGoldDice: "5d4",
    skillChoicesCount: 3
  },
  Clérigo: {
    hitDie: 8,
    subclasses: ["Conhecimento", "Vida", "Luz", "Natureza", "Tempestade", "Engano", "Guerra"],
    primaryAbility: "Wisdom",
    savingThrows: ["Wisdom", "Charisma"],
    startingGoldDice: "5d4",
    skillChoicesCount: 2
  },
  Druida: {
    hitDie: 8,
    subclasses: ["Círculo da Terra", "Círculo da Lua"],
    primaryAbility: "Wisdom",
    savingThrows: ["Intelligence", "Wisdom"],
    startingGoldDice: "2d4",
    skillChoicesCount: 2
  },
  Guerreiro: {
    hitDie: 10,
    subclasses: ["Campeão", "Mestre de Batalha", "Cavaleiro Arcano"],
    primaryAbility: "Strength", // ou Dexterity
    savingThrows: ["Strength", "Constitution"],
    startingGoldDice: "5d4",
    skillChoicesCount: 2
  },
  Monge: {
    hitDie: 8,
    subclasses: ["Caminho da Mão Aberta", "Caminho das Sombras", "Caminho do Elemento"],
    primaryAbility: "Dexterity",
    savingThrows: ["Strength", "Dexterity"],
    startingGoldDice: "5d4",
    skillChoicesCount: 2
  },
  Paladino: {
    hitDie: 10,
    subclasses: ["Juramento da Devoção", "Juramento dos Antigos", "Juramento da Vingança"],
    primaryAbility: "Strength",
    savingThrows: ["Wisdom", "Charisma"],
    startingGoldDice: "5d4",
    skillChoicesCount: 2
  },
  Ranger: {
    hitDie: 10,
    subclasses: ["Caçador", "Mestre das Feras"],
    primaryAbility: "Dexterity",
    savingThrows: ["Strength", "Dexterity"],
    startingGoldDice: "5d4",
    skillChoicesCount: 3
  },
  Ladino: {
    hitDie: 8,
    subclasses: ["Ladrão", "Assassino", "Trapaceiro Arcano"],
    primaryAbility: "Dexterity",
    savingThrows: ["Dexterity", "Intelligence"],
    startingGoldDice: "4d4",
    skillChoicesCount: 4
  },
  Feiticeiro: {
    hitDie: 6,
    subclasses: ["Linhagem Dracônica", "Magia Selvagem"],
    primaryAbility: "Charisma",
    savingThrows: ["Constitution", "Charisma"],
    startingGoldDice: "3d4",
    skillChoicesCount: 2
  },
  Bruxo: {
    hitDie: 8,
    subclasses: ["Arcano Obscuro", "Fada", "Demônio", "Grande Antigo"],
    primaryAbility: "Charisma",
    savingThrows: ["Wisdom", "Charisma"],
    startingGoldDice: "4d4",
    skillChoicesCount: 2
  },
  Mago: {
    hitDie: 6,
    subclasses: ["Abjuração", "Adivinhação", "Conjuração", "Encantamento", "Evocação", "Ilusão", "Necromancia", "Transmutação"],
    primaryAbility: "Intelligence",
    savingThrows: ["Intelligence", "Wisdom"],
    startingGoldDice: "4d4",
    skillChoicesCount: 2
  }
};

export const SKILLS = [
  { name: "Atletismo", ability: "Strength" },
  { name: "Acrobacia", ability: "Dexterity" },
  { name: "Prestidigitação", ability: "Dexterity" },
  { name: "Furtividade", ability: "Dexterity" },
  { name: "Arcanismo", ability: "Intelligence" },
  { name: "História", ability: "Intelligence" },
  { name: "Investigação", ability: "Intelligence" },
  { name: "Natureza", ability: "Intelligence" },
  { name: "Religião", ability: "Intelligence" },
  { name: "Animais", ability: "Wisdom" },
  { name: "Intuição", ability: "Wisdom" },
  { name: "Medicina", ability: "Wisdom" },
  { name: "Percepção", ability: "Wisdom" },
  { name: "Sobrevivência", ability: "Wisdom" },
  { name: "Enganação", ability: "Charisma" },
  { name: "Intimidação", ability: "Charisma" },
  { name: "Atuação", ability: "Charisma" },
  { name: "Persuasão", ability: "Charisma" },
];

export const ALIGNMENTS = [
  { code: "LB", name: "Leal e Bom", description: "Age como uma boa pessoa deve, respeitando a lei e a sociedade." },
  { code: "NB", name: "Neutro e Bom", description: "Faz o bem sem se importar com regras ou ordens." },
  { code: "CB", name: "Caótico e Bom", description: "Age de acordo com sua consciência, sem se importar com o que os outros esperam." },
  { code: "LN", name: "Leal e Neutro", description: "Segue a lei, tradição ou código estritamente, sem pender para o bem ou mal." },
  { code: "N", name: "Neutro Puro", description: "Não toma partido, prefere a neutralidade." },
  { code: "CN", name: "Caótico e Neutro", description: "Segue seus caprichos, valoriza a liberdade acima de tudo." },
  { code: "LM", name: "Leal e Mau", description: "Age dentro de regras, mas para causar dano e benefício próprio." },
  { code: "NM", name: "Neutro e Mau", description: "É egoísta e malvado, sem lealdade ou desrespeito específico pelas regras." },
  { code: "CM", name: "Caótico e Mau", description: "Destrói, mata e age por ganância e fúria, sem respeitar nada." },
];

export const REGIONS = [
  {
    id: "baldurs-gate",
    name: "Baldur's Gate",
    image: "https://static.wikia.nocookie.net/forgottenrealms/images/c/c4/Baldur%27s_Gate_overview_BG3.png/revision/latest?cb=20190606171350",
    description: "A metrópole portuária mais famosa da Costa da Espada, conhecida por seu comércio e intrigas."
  },
  {
    id: "neverwinter",
    name: "Neverwinter",
    image: "https://static.wikia.nocookie.net/forgottenrealms/images/8/80/NeverwinterHarbor.jpg/revision/latest?cb=20200825214415",
    description: "A Joia do Norte, uma cidade resiliente que se reergueu após grandes catástrofes."
  },
  {
    id: "silverymoon",
    name: "Silverymoon",
    image: "https://cdnb.artstation.com/p/assets/images/images/002/466/555/large/tom-lee-the-silvery-moon.jpg?1462089174",
    description: "Um centro de aprendizado e magia, famosa por sua beleza e harmonia entre as raças."
  },
  {
    id: "icewind-dale",
    name: "Icewind Dale",
    image: "https://cdna.artstation.com/p/assets/images/images/073/011/422/large/asim-a-steckel-icewind-dale-asim-steckel.jpg?1708699396",
    description: "Uma região gelada e implacável no extremo norte, lar de pessoas endurecidas pelo frio."
  },
  {
    id: "candlekeep",
    name: "Candlekeep",
    image: "https://alphastream.org/wp-content/uploads/2015/10/bee7a4f9ff4e9c3cd3de53e11563ebe1.jpg",
    description: "Uma fortaleza-biblioteca colossal que guarda o maior conhecimento de Faerûn."
  },
  {
    id: "other",
    name: "Outro",
    image: "https://nerdsonearth.com/wp-content/uploads/2018/09/IMG_1489.jpeg",
    description: "Uma terra distante ou desconhecida, vinda de sua própria história."
  }
];

export const getAttr = (attrs: any, key: string): number => {
  if (!attrs) return 10;
  const mapping: Record<string, string[]> = {
    str: ['str', 'Strength', 'Força', 'at_for'],
    dex: ['dex', 'Dexterity', 'Destreza', 'at_des'],
    con: ['con', 'Constitution', 'Constituição', 'at_con'],
    int: ['int', 'Intelligence', 'Inteligência', 'at_int'],
    wis: ['wis', 'Wisdom', 'Sabedoria', 'at_sab'],
    cha: ['cha', 'Charisma', 'Carisma', 'at_car']
  };
  
  const keys = mapping[key.toLowerCase()] || [key];
  for (const k of keys) {
    if (attrs[k] !== undefined) return attrs[k];
  }
  return 10;
};

export const calculateAC = (char: any): number => {
  const dexScore = getAttr(char.attributes, 'dex');
  const dexMod = calculateModifier(dexScore);
  
  let baseAC = 10 + dexMod;
  let shieldBonus = 0;
  let magicBonus = 0;
  
  const equippedItems = char.inventory?.filter((item: any) => item.equipped) || [];
  
  // Find armor
  const armor = equippedItems.find((item: any) => 
    (item.type === 'armor' || item.category === 'Armor') && 
    !item.name?.toLowerCase().includes('shield') &&
    !item.name?.toLowerCase().includes('escudo')
  );
  
  if (armor) {
    if (armor.dexBonus === false) {
      baseAC = armor.ac || 10;
    } else {
      const maxDex = armor.maxDexBonus ?? 99;
      baseAC = (armor.ac || 10) + Math.min(dexMod, maxDex);
    }
  }
  
  // Find shield
  const shield = equippedItems.find((item: any) => 
    item.name?.toLowerCase().includes('shield') || 
    item.name?.toLowerCase().includes('escudo')
  );
  
  if (shield) {
    shieldBonus = shield.ac || 2;
  }
  
  // Magic bonuses
  equippedItems.forEach((item: any) => {
    if (item.bonus) magicBonus += item.bonus;
    item.properties?.forEach((prop: string) => {
      const match = prop.match(/\+(\d+)/);
      if (match) {
        if (!item.bonus && (item.category === 'Armor' || item.category === 'Shield' || item.category === 'Wondrous Item')) {
          magicBonus += parseInt(match[1]);
        }
      }
    });
  });
  
  return baseAC + shieldBonus + magicBonus;
};

export const calculateInitiative = (char: any): number => {
  const dexScore = getAttr(char.attributes, 'dex');
  const dexMod = calculateModifier(dexScore);
  let bonus = 0;
  
  const equippedItems = char.inventory?.filter((item: any) => item.equipped) || [];
  equippedItems.forEach((item: any) => {
    if (item.initiativeBonus) bonus += item.initiativeBonus;
    item.properties?.forEach((prop: string) => {
       if (prop?.toLowerCase().includes('initiative') && prop.includes('+')) {
         const match = prop.match(/\+(\d+)/);
         if (match) bonus += parseInt(match[1]);
       }
    });
  });
  
  return dexMod + bonus;
};

export const calculatePassivePerception = (char: any): number => {
  const wisScore = getAttr(char.attributes, 'wis');
  const wisMod = calculateModifier(wisScore);
  const levelData = getLevelFromXP(char.xp || 0);
  const profBonus = levelData.proficiency;
  
  const isProficient = char.skills?.['Percepção'] || char.skills?.['Perception'];
  return 10 + wisMod + (isProficient ? profBonus : 0);
};

export const calculateModifier = (score: any) => {
  const s = Number(score);
  if (isNaN(s)) return 0;
  return Math.floor((s - 10) / 2);
};

export const getLevelFromXP = (xp: number) => {
  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (xp >= XP_TABLE[i].xp) {
      return XP_TABLE[i];
    }
  }
  return XP_TABLE[0];
};

// Spell Slots Table (D&D 5e)
// Full Casters: Bard, Cleric, Druid, Sorcerer, Wizard
// Half Casters: Paladin, Ranger
// Warlock: Unique (Pact Magic)
export const SPELL_SLOTS_TABLE: Record<string, Record<number, Record<string, number>>> = {
  FullCaster: {
    1: { "1": 2 },
    2: { "1": 3 },
    3: { "1": 4, "2": 2 },
    4: { "1": 4, "2": 3 },
    5: { "1": 4, "2": 3, "3": 2 },
    6: { "1": 4, "2": 3, "3": 3 },
    7: { "1": 4, "2": 3, "3": 3, "4": 1 },
    8: { "1": 4, "2": 3, "3": 3, "4": 2 },
    9: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 1 },
    10: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2 },
    11: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1 },
    12: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1 },
    13: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1 },
    14: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1 },
    15: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1, "8": 1 },
    16: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1, "8": 1 },
    17: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1, "8": 1, "9": 1 },
    18: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 3, "6": 1, "7": 1, "8": 1, "9": 1 },
    19: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 3, "6": 2, "7": 1, "8": 1, "9": 1 },
    20: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 3, "6": 2, "7": 2, "8": 1, "9": 1 },
  },
  HalfCaster: {
    1: {},
    2: { "1": 2 },
    3: { "1": 3 },
    4: { "1": 3 },
    5: { "1": 4, "2": 2 },
    6: { "1": 4, "2": 2 },
    7: { "1": 4, "2": 3 },
    8: { "1": 4, "2": 3 },
    9: { "1": 4, "2": 3, "3": 2 },
    10: { "1": 4, "2": 3, "3": 2 },
    11: { "1": 4, "2": 3, "3": 3 },
    12: { "1": 4, "2": 3, "3": 3 },
    13: { "1": 4, "2": 3, "3": 3, "4": 1 },
    14: { "1": 4, "2": 3, "3": 3, "4": 1 },
    15: { "1": 4, "2": 3, "3": 3, "4": 2 },
    16: { "1": 4, "2": 3, "3": 3, "4": 2 },
    17: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 1 },
    18: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 1 },
    19: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2 },
    20: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2 },
  },
  Warlock: {
    1: { "1": 1 },
    2: { "1": 2 },
    3: { "2": 2 },
    4: { "2": 2 },
    5: { "3": 2 },
    6: { "3": 2 },
    7: { "4": 2 },
    8: { "4": 2 },
    9: { "5": 2 },
    10: { "5": 2 },
    11: { "5": 3 },
    12: { "5": 3 },
    13: { "5": 3 },
    14: { "5": 3 },
    15: { "5": 3 },
    16: { "5": 3 },
    17: { "5": 4 },
    18: { "5": 4 },
    19: { "5": 4 },
    20: { "5": 4 },
  }
};
