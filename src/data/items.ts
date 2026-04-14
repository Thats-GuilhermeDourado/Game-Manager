export interface Item {
  id: string;
  name: string;
  category: 'Weapon' | 'Armor' | 'Wondrous Item' | 'Potion' | 'Scroll' | 'Tool' | 'Adventuring Gear';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact';
  description: string;
  weight: number;
  cost: string;
  price: number;
  ac?: number;
  bonus?: number;
  dexBonus?: boolean;
  maxDexBonus?: number;
  damage?: string;
  properties?: string[];
  requiresAttunement?: boolean;
  consumable?: boolean;
  stealthDisadvantage?: boolean;
  strengthRequirement?: number;
}

export const itemCategories = [
  'Weapon',
  'Armor',
  'Wondrous Item',
  'Potion',
  'Scroll',
  'Tool',
  'Adventuring Gear'
] as const;

export const ITEMS: Record<string, Item> = {
  // Armaduras
  'acolchoada': {
    id: 'acolchoada',
    name: 'Armadura Acolchoada',
    category: 'Armor',
    rarity: 'Common',
    description: 'Armadura de camadas de tecido acolchoado.',
    weight: 8,
    cost: '5 po',
    price: 5,
    ac: 11,
    dexBonus: true,
    stealthDisadvantage: true
  },
  'couro': {
    id: 'couro',
    name: 'Armadura de Couro',
    category: 'Armor',
    rarity: 'Common',
    description: 'Peitoral e ombreiras de couro endurecido.',
    weight: 10,
    cost: '10 po',
    price: 10,
    ac: 11,
    dexBonus: true
  },
  'couro-batido': {
    id: 'couro-batido',
    name: 'Couro Batido',
    category: 'Armor',
    rarity: 'Common',
    description: 'Couro reforçado com rebites ou pontas de metal.',
    weight: 13,
    cost: '45 po',
    price: 45,
    ac: 12,
    dexBonus: true
  },
  'pele': {
    id: 'pele',
    name: 'Armadura de Pele',
    category: 'Armor',
    rarity: 'Common',
    description: 'Peles grossas de animal. Comum em bárbaros.',
    weight: 12,
    cost: '10 po',
    price: 10,
    ac: 12,
    dexBonus: true,
    maxDexBonus: 2
  },
  'camisa-de-malha': {
    id: 'camisa-de-malha',
    name: 'Camisa de Malha',
    category: 'Armor',
    rarity: 'Common',
    description: 'Malha de anéis de metal usada entre camadas de roupa.',
    weight: 20,
    cost: '50 po',
    price: 50,
    ac: 13,
    dexBonus: true,
    maxDexBonus: 2
  },
  'escamas': {
    id: 'escamas',
    name: 'Armadura de Escamas',
    category: 'Armor',
    rarity: 'Common',
    description: 'Casaco e perneiras de couro cobertos por escamas de metal.',
    weight: 45,
    cost: '50 po',
    price: 50,
    ac: 14,
    dexBonus: true,
    maxDexBonus: 2,
    stealthDisadvantage: true
  },
  'peitoral': {
    id: 'peitoral',
    name: 'Peitoral',
    category: 'Armor',
    rarity: 'Common',
    description: 'Peça de metal que cobre o torso. Deixa braços e pernas livres.',
    weight: 20,
    cost: '400 po',
    price: 400,
    ac: 14,
    dexBonus: true,
    maxDexBonus: 2
  },
  'meia-armadura': {
    id: 'meia-armadura',
    name: 'Meia-Armadura',
    category: 'Armor',
    rarity: 'Common',
    description: 'Placas de metal que cobrem a maior parte do corpo.',
    weight: 40,
    cost: '750 po',
    price: 750,
    ac: 15,
    dexBonus: true,
    maxDexBonus: 2,
    stealthDisadvantage: true
  },
  'cota-de-aneis': {
    id: 'cota-de-aneis',
    name: 'Cota de Anéis',
    category: 'Armor',
    rarity: 'Common',
    description: 'Armadura de couro com anéis pesados costurados.',
    weight: 40,
    cost: '30 po',
    price: 30,
    ac: 14,
    dexBonus: false,
    stealthDisadvantage: true
  },
  'cota-de-malha': {
    id: 'cota-de-malha',
    name: 'Cota de Malha',
    category: 'Armor',
    rarity: 'Common',
    description: 'Anéis de metal entrelaçados. Inclui camada acolchoada por baixo.',
    weight: 55,
    cost: '75 po',
    price: 75,
    ac: 16,
    dexBonus: false,
    strengthRequirement: 13,
    stealthDisadvantage: true
  },
  'brunea': {
    id: 'brunea',
    name: 'Brunea',
    category: 'Armor',
    rarity: 'Common',
    description: 'Tiras verticais de metal rebitadas a um forro de couro.',
    weight: 60,
    cost: '200 po',
    price: 200,
    ac: 17,
    dexBonus: false,
    strengthRequirement: 15,
    stealthDisadvantage: true
  },
  'placa-completa': {
    id: 'placa-completa',
    name: 'Placa Completa',
    category: 'Armor',
    rarity: 'Common',
    description: 'Placas de metal interligadas que cobrem o corpo inteiro.',
    weight: 65,
    cost: '1500 po',
    price: 1500,
    ac: 18,
    dexBonus: false,
    strengthRequirement: 15,
    stealthDisadvantage: true
  },
  'escudo': {
    id: 'escudo',
    name: 'Escudo',
    category: 'Armor',
    rarity: 'Common',
    description: 'Feito de madeira ou metal. Segurado com uma mão.',
    weight: 6,
    cost: '10 po',
    price: 10,
    ac: 2
  },

  // Armas
  'adaga': {
    id: 'adaga',
    name: 'Adaga',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Versátil, pode ser usada como arma de arremesso.',
    weight: 1,
    cost: '2 po',
    price: 2,
    damage: '1d4 Perfuração',
    properties: ['Acuidade', 'Leve', 'Arremesso (20/60)']
  },
  'clava': {
    id: 'clava',
    name: 'Clava',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Um pedaço de madeira ou metal usado para causar dano.',
    weight: 2,
    cost: '1 pp',
    price: 0.1,
    damage: '1d4 Contusão',
    properties: ['Leve']
  },
  'maca': {
    id: 'maca',
    name: 'Maça',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Cabeça de metal presa a um cabo.',
    weight: 4,
    cost: '5 po',
    price: 5,
    damage: '1d6 Contusão'
  },
  'lanca': {
    id: 'lanca',
    name: 'Lança',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Pode ser usada com uma ou duas mãos.',
    weight: 3,
    cost: '1 po',
    price: 1,
    damage: '1d6 Perfuração',
    properties: ['Arremesso (20/60)', 'Versátil (1d8)']
  },
  'espada-longa': {
    id: 'espada-longa',
    name: 'Espada Longa',
    category: 'Weapon',
    rarity: 'Common',
    description: 'A arma clássica de cavaleiro.',
    weight: 3,
    cost: '15 po',
    price: 15,
    damage: '1d8 Corte',
    properties: ['Versátil (1d10)']
  },
  'grande-machado': {
    id: 'grande-machado',
    name: 'Grande Machado',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Um enorme machado de duas mãos.',
    weight: 7,
    cost: '30 po',
    price: 30,
    damage: '1d12 Corte',
    properties: ['Pesada', 'Duas Mãos']
  },
  'montante': {
    id: 'montante',
    name: 'Montante',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Uma enorme espada de duas mãos.',
    weight: 6,
    cost: '50 po',
    price: 50,
    damage: '2d6 Corte',
    properties: ['Pesada', 'Duas Mãos']
  },
  'rapieira': {
    id: 'rapieira',
    name: 'Rapieira',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Espada fina e ágil, perfeita para duelistas.',
    weight: 2,
    cost: '25 po',
    price: 25,
    damage: '1d8 Perfuração',
    properties: ['Acuidade']
  },
  'arco-curto': {
    id: 'arco-curto',
    name: 'Arco Curto',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Um arco pequeno, comum entre cavaleiros montados.',
    weight: 2,
    cost: '25 po',
    price: 25,
    damage: '1d6 Perfuração',
    properties: ['Munição (80/320)', 'Duas Mãos']
  },
  'arco-longo': {
    id: 'arco-longo',
    name: 'Arco Longo',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Poderoso arco de guerra élfico.',
    weight: 2,
    cost: '50 po',
    price: 50,
    damage: '1d8 Perfuração',
    properties: ['Munição (150/600)', 'Pesada', 'Duas Mãos']
  },
  'besta-leve': {
    id: 'besta-leve',
    name: 'Besta Leve',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Fácil de recarregar.',
    weight: 5,
    cost: '25 po',
    price: 25,
    damage: '1d8 Perfuração',
    properties: ['Munição (80/320)', 'Carregamento', 'Duas Mãos']
  },
  'funda': {
    id: 'funda',
    name: 'Funda',
    category: 'Weapon',
    rarity: 'Common',
    description: 'Atira pedras ou balas de funda.',
    weight: 0,
    cost: '1 pp',
    price: 0.1,
    damage: '1d4 Contusão',
    properties: ['Munição (30/120)']
  },

  // Ferramentas e Kits
  'ferramentas-alquimista': {
    id: 'ferramentas-alquimista',
    name: 'Ferramentas de Alquimista',
    category: 'Tool',
    rarity: 'Common',
    description: 'Para criar poções, ácidos e outros compostos.',
    weight: 8,
    cost: '50 po',
    price: 50
  },
  'utensilios-culinaria': {
    id: 'utensilios-culinaria',
    name: 'Utensílios de Culinária',
    category: 'Tool',
    rarity: 'Common',
    description: 'Para preparar refeições e conservar alimentos.',
    weight: 8,
    cost: '1 po',
    price: 1
  },
  'ferramentas-ferreiro': {
    id: 'ferramentas-ferreiro',
    name: 'Ferramentas de Ferreiro',
    category: 'Tool',
    rarity: 'Common',
    description: 'Para forjar metais e reparar armaduras.',
    weight: 8,
    cost: '20 po',
    price: 20
  },
  'ferramentas-ladroes': {
    id: 'ferramentas-ladroes',
    name: 'Ferramentas de Ladrões',
    category: 'Tool',
    rarity: 'Common',
    description: 'Essencial para abrir fechaduras e desarmar armadilhas.',
    weight: 1,
    cost: '25 po',
    price: 25
  },
  'jogo-de-dados': {
    id: 'jogo-de-dados',
    name: 'Jogo de Dados',
    category: 'Tool',
    rarity: 'Common',
    description: 'Entretenimento e jogatina.',
    weight: 0,
    cost: '1 pp',
    price: 0.1
  },
  'alaude': {
    id: 'alaude',
    name: 'Alaúde',
    category: 'Tool',
    rarity: 'Common',
    description: 'Instrumento de cordas popular em tavernas.',
    weight: 2,
    cost: '35 po',
    price: 35
  },
  'kit-disfarce': {
    id: 'kit-disfarce',
    name: 'Kit de Disfarce',
    category: 'Tool',
    rarity: 'Common',
    description: 'Para criar disfarces e maquiagem.',
    weight: 3,
    cost: '25 po',
    price: 25
  },
  'kit-herbalismo': {
    id: 'kit-herbalismo',
    name: 'Kit de Herbalismo',
    category: 'Tool',
    rarity: 'Common',
    description: 'Para criar poções de cura e antídotos.',
    weight: 3,
    cost: '5 po',
    price: 5
  },

  // Itens Mágicos e Consumíveis
  'pocao-cura': {
    id: 'pocao-cura',
    name: 'Poção de Cura',
    category: 'Potion',
    rarity: 'Common',
    description: 'Recupera 2d4 + 2 pontos de vida.',
    weight: 0.5,
    cost: '50 po',
    price: 50,
    consumable: true
  },
  'bolsa-da-fortuna': {
    id: 'bolsa-da-fortuna',
    name: 'Bolsa da Fortuna (Bag of Holding)',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    description: 'Bolsa que abre um espaço extradimensional. Comporta até 500 lb.',
    weight: 15,
    cost: '500 po',
    price: 500
  },
  'espada-lingua-flamejante': {
    id: 'espada-lingua-flamejante',
    name: 'Espada Língua Flamejante',
    category: 'Weapon',
    rarity: 'Rare',
    description: 'Você pode usar uma ação bônus para falar a palavra de comando desta arma mágica, fazendo com que chamas emitam luz brilhante em um raio de 12 metros e luz fraca por mais 12 metros. Enquanto a espada estiver em chamas, ela causa 2d6 de dano de fogo extra a qualquer alvo que atingir.',
    weight: 3,
    cost: '2000 po',
    price: 2000,
    requiresAttunement: true,
    damage: '1d8 Corte + 2d6 Fogo'
  },
  'vassoura-de-bruxa': {
    id: 'vassoura-de-bruxa',
    name: 'Vassoura de Bruxa',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    description: 'Esta vassoura de madeira pode voar sob seu comando. Ela tem uma velocidade de voo de 15 metros.',
    weight: 3,
    cost: '500 po',
    price: 500
  },
  'varinha-magica': {
    id: 'varinha-magica',
    name: 'Varinha Mágica',
    category: 'Wondrous Item',
    rarity: 'Common',
    description: 'Uma varinha simples usada como foco arcano.',
    weight: 1,
    cost: '10 po',
    price: 10
  },
  'espada-longa-plus-2': {
    id: 'espada-longa-plus-2',
    name: 'Espada Longa +2',
    category: 'Weapon',
    rarity: 'Rare',
    description: 'Você recebe um bônus de +2 nas jogadas de ataque e dano feitas com esta arma mágica.',
    weight: 3,
    cost: '2000 po',
    price: 2000,
    bonus: 2,
    damage: '1d8+2 Corte',
    properties: ['Versátil (1d10+2)']
  }
};
