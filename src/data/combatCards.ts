export interface CombatCard {
  id: string;
  name: string;
  type: 'action' | 'bonus' | 'reaction' | 'passive';
  category: 'attack' | 'spell' | 'skill' | 'item' | 'class' | 'consumable';
  range: string;
  cost?: string;
  staminaCost?: number;
  manaCost?: number;
  effect: string;
  tags: string[];
  imageUrl?: string;
  value?: string;
  damageType?: string;
  scaling?: string;
  cooldown?: number;
  keywords?: string[];
  appliesTags?: string[];
  synergy?: {
    tag: string;
    bonus: string;
    description: string;
  };
  charges?: number;
  maxCharges?: number;
  isFinisher?: boolean;
}

export const COMMON_CARDS: CombatCard[] = [
  {
    id: 'common-observe',
    name: 'Observar',
    type: 'action',
    category: 'skill',
    range: '60 ft',
    effect: 'Analisa o inimigo, removendo Elusivo por 1 turno.',
    tags: ['Estratégia', 'Visão'],
    keywords: ['Visão Aguçada']
  },
  {
    id: 'common-focus',
    name: 'Foco Arcano',
    type: 'bonus',
    category: 'skill',
    range: 'Pessoal',
    effect: 'Ganha +2 no próximo ataque ou CD de magia.',
    tags: ['Concentração', 'Bônus'],
    appliesTags: ['Focado']
  }
];

export const BASE_CARDS: Record<string, CombatCard[]> = {
  'Guerreiro': [
    {
      id: 'warrior-strike',
      name: 'Golpe de Espada',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      staminaCost: 2,
      effect: 'Ataque corpo a corpo com sua arma principal.',
      tags: ['Ataque', 'Físico'],
      value: '1d8 + STR',
      damageType: 'Cortante',
      keywords: ['Perfurante'],
      synergy: {
        tag: 'Vulnerável',
        bonus: '+1d6',
        description: 'Causa dano extra se o alvo estiver Vulnerável.'
      }
    },
    {
      id: 'warrior-heavy-strike',
      name: 'Golpe Pesado',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      staminaCost: 5,
      effect: 'Um golpe devastador que pode atordoar o alvo.',
      tags: ['Ataque', 'Físico', 'Impacto'],
      value: '2d10 + STR',
      damageType: 'Concussão',
      appliesTags: ['Atordoado'],
      isFinisher: true
    },
    {
      id: 'warrior-second-wind',
      name: 'Retomar o Fôlego',
      type: 'bonus',
      category: 'class',
      range: 'Pessoal',
      staminaCost: 0,
      effect: 'Recupera 1d10 + nível de vida e 4 de Stamina.',
      tags: ['Cura', 'Recurso'],
      cooldown: 1
    },
    {
      id: 'warrior-shield-block',
      name: 'Bloqueio com Escudo',
      type: 'reaction',
      category: 'skill',
      range: 'Pessoal',
      effect: 'Reduz o dano recebido em 1d10 + DEX.',
      tags: ['Defesa', 'Reação']
    },
    {
      id: 'warrior-riposte',
      name: 'Ripostar',
      type: 'reaction',
      category: 'attack',
      range: '5 ft',
      effect: 'Quando um inimigo erra um ataque contra você, faça um ataque imediato.',
      tags: ['Ataque', 'Reação'],
      value: '1d8 + STR',
      keywords: ['Reação']
    },
    {
      id: 'warrior-expose',
      name: 'Expor Vulnerabilidade',
      type: 'action',
      category: 'skill',
      range: '5 ft',
      effect: 'O alvo fica Vulnerável a ataques físicos.',
      tags: ['Controle', 'Debuff'],
      appliesTags: ['Vulnerável'],
      keywords: ['Perfurante']
    },
    {
      id: 'warrior-human-shield',
      name: 'Escudo Humano',
      type: 'reaction',
      category: 'skill',
      range: '5 ft',
      effect: 'Protege um aliado adjacente, reduzindo o dano pela metade.',
      tags: ['Defesa', 'Reação', 'Dupla'],
      keywords: ['Resistente (Tudo)']
    },
    {
      id: 'warrior-battle-cry',
      name: 'Grito de Batalha',
      type: 'action',
      category: 'class',
      range: '30 ft (Área)',
      effect: 'Aliados ganham +2 em ataques por 1 turno.',
      tags: ['Suporte', 'Área'],
      appliesTags: ['Inspirado']
    }
  ],
  'Mago': [
    {
      id: 'wizard-firebolt',
      name: 'Raio de Fogo',
      type: 'action',
      category: 'spell',
      range: '120 ft',
      manaCost: 1,
      effect: 'Lança um feixe de fogo no inimigo.',
      tags: ['Magia', 'Fogo', 'Truque'],
      value: '1d10',
      damageType: 'Fogo',
      keywords: ['Queimadura (12)'],
      synergy: {
        tag: 'Óleo',
        bonus: 'Explosão',
        description: 'Causa explosão em área se o alvo estiver coberto de Óleo.'
      }
    },
    {
      id: 'wizard-arcane-surge',
      name: 'Surto Arcano',
      type: 'action',
      category: 'spell',
      range: '60 ft',
      manaCost: 8,
      effect: 'Libera uma onda de energia pura. Dano massivo.',
      tags: ['Magia', 'Força', 'Impacto'],
      value: '4d10 + INT',
      damageType: 'Força',
      isFinisher: true
    },
    {
      id: 'wizard-fireball',
      name: 'Bola de Fogo',
      type: 'action',
      category: 'spell',
      range: '150 ft',
      cost: 'Slot Nível 3',
      effect: 'Uma explosão massiva de fogo em área.',
      tags: ['Magia', 'Fogo', 'Área'],
      value: '8d6',
      damageType: 'Fogo'
    },
    {
      id: 'wizard-shield',
      name: 'Escudo Arcano',
      type: 'reaction',
      category: 'spell',
      range: 'Pessoal',
      cost: 'Slot Nível 1',
      effect: 'Aumenta sua CA em +5 até o início do seu próximo turno.',
      tags: ['Magia', 'Defesa', 'Reação'],
      keywords: ['Barreira (5)']
    },
    {
      id: 'wizard-counterspell',
      name: 'Contramagia',
      type: 'reaction',
      category: 'spell',
      range: '60 ft',
      cost: 'Slot Nível 3',
      effect: 'Tenta interromper uma magia sendo conjurada.',
      tags: ['Magia', 'Controle', 'Reação']
    },
    {
      id: 'wizard-magic-missile',
      name: 'Mísseis Mágicos',
      type: 'action',
      category: 'spell',
      range: '120 ft',
      effect: 'Três dardos de força que sempre acertam.',
      tags: ['Magia', 'Dano', 'Garantido'],
      value: '3d4 + 3',
      damageType: 'Força'
    },
    {
      id: 'wizard-mage-armor',
      name: 'Armadura Arcana',
      type: 'action',
      category: 'spell',
      range: 'Toque',
      effect: 'Aumenta a CA base para 13 + DEX.',
      tags: ['Magia', 'Defesa'],
      appliesTags: ['Protegido']
    },
    {
      id: 'wizard-mirror-image',
      name: 'Reflexos',
      type: 'action',
      category: 'spell',
      range: 'Pessoal',
      effect: 'Cria duplicatas ilusórias. Inimigos têm desvantagem.',
      tags: ['Magia', 'Defesa'],
      appliesTags: ['Elusivo']
    }
  ],
  'Clérigo': [
    {
      id: 'cleric-mace',
      name: 'Golpe de Maça',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      effect: 'Ataque corpo a corpo sagrado.',
      tags: ['Ataque', 'Físico'],
      value: '1d6 + STR',
      damageType: 'Concussão'
    },
    {
      id: 'cleric-cure-wounds',
      name: 'Curar Ferimentos',
      type: 'action',
      category: 'spell',
      range: 'Toque',
      cost: 'Slot Nível 1',
      effect: 'Cura um aliado por 1d8 + WIS.',
      tags: ['Magia', 'Cura'],
      value: '1d8 + WIS',
      synergy: {
        tag: 'Bênção',
        bonus: '+1d4',
        description: 'Cura extra se o alvo estiver sob efeito de Bênção.'
      }
    },
    {
      id: 'cleric-healing-word',
      name: 'Palavra de Cura',
      type: 'bonus',
      category: 'spell',
      range: '60 ft',
      cost: 'Slot Nível 1',
      effect: 'Cura rápida à distância por 1d4 + WIS.',
      tags: ['Magia', 'Cura', 'Bônus'],
      value: '1d4 + WIS'
    },
    {
      id: 'cleric-bless',
      name: 'Bênção',
      type: 'action',
      category: 'spell',
      range: '30 ft',
      cost: 'Slot Nível 1',
      effect: 'Dá Bênção a um aliado, aumentando cura e acerto.',
      tags: ['Magia', 'Suporte'],
      appliesTags: ['Bênção'],
      keywords: ['Inspirado']
    },
    {
      id: 'cleric-guiding-bolt',
      name: 'Guia Luminosa',
      type: 'action',
      category: 'spell',
      range: '120 ft',
      effect: 'Dano radiante e o próximo ataque contra o alvo tem vantagem.',
      tags: ['Magia', 'Dano', 'Suporte'],
      value: '4d6',
      damageType: 'Radiante',
      appliesTags: ['Revelado']
    },
    {
      id: 'cleric-spiritual-weapon',
      name: 'Arma Espiritual',
      type: 'bonus',
      category: 'spell',
      range: '60 ft',
      effect: 'Cria uma arma mágica que ataca por você.',
      tags: ['Magia', 'Ataque', 'Bônus'],
      value: '1d8 + WIS',
      damageType: 'Força'
    },
    {
      id: 'cleric-sacred-flame',
      name: 'Chama Sagrada',
      type: 'action',
      category: 'spell',
      range: '60 ft',
      effect: 'Chama desce sobre o inimigo. Ignora cobertura.',
      tags: ['Magia', 'Radiante', 'Truque'],
      value: '1d8',
      damageType: 'Radiante'
    }
  ],
  'Ladino': [
    {
      id: 'rogue-dagger',
      name: 'Ataque com Adaga',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      effect: 'Ataque rápido. +2d6 se tiver vantagem.',
      tags: ['Ataque', 'Físico'],
      value: '1d4 + DEX',
      damageType: 'Perfurante',
      keywords: ['Furtivo (+2d6)']
    },
    {
      id: 'rogue-cunning-action',
      name: 'Ação Astuta',
      type: 'bonus',
      category: 'class',
      range: 'Pessoal',
      effect: 'Desengajar ou Esconder como ação bônus.',
      tags: ['Movimento', 'Bônus'],
      appliesTags: ['Elusivo']
    },
    {
      id: 'rogue-uncanny-dodge',
      name: 'Esquiva Sobrenatural',
      type: 'reaction',
      category: 'class',
      range: 'Pessoal',
      effect: 'Reduz o dano de um ataque pela metade.',
      tags: ['Defesa', 'Reação']
    },
    {
      id: 'rogue-poison-blade',
      name: 'Lâmina Envenenada',
      type: 'bonus',
      category: 'skill',
      range: 'Toque',
      effect: 'Próximo ataque aplica veneno.',
      tags: ['Dano', 'Veneno'],
      appliesTags: ['Envenenado']
    },
    {
      id: 'rogue-smoke-bomb',
      name: 'Bomba de Fumaça',
      type: 'action',
      category: 'item',
      range: 'Pessoal (Área)',
      effect: 'Cria uma nuvem. Todos os aliados ficam Elusivos por 1 turno.',
      tags: ['Defesa', 'Área'],
      appliesTags: ['Elusivo']
    },
    {
      id: 'rogue-evasion',
      name: 'Evasão',
      type: 'passive',
      category: 'class',
      range: 'Pessoal',
      effect: 'Dano em área reduzido a zero se passar no teste.',
      tags: ['Defesa', 'Passiva']
    },
    {
      id: 'rogue-assassinate',
      name: 'Assassinar',
      type: 'action',
      category: 'class',
      range: '5 ft',
      effect: 'Crítico garantido contra alvos surpresos.',
      tags: ['Dano', 'Especial'],
      value: '2d4 + DEX'
    }
  ]
};

export const POOL_CARDS: CombatCard[] = [
  {
    id: 'pool-toughness',
    name: 'Resiliência',
    type: 'passive',
    category: 'skill',
    range: 'Pessoal',
    effect: 'Aumenta HP máximo em 5.',
    tags: ['Passiva', 'Defesa']
  },
  {
    id: 'pool-meditation',
    name: 'Meditação',
    type: 'action',
    category: 'skill',
    range: 'Pessoal',
    effect: 'Recupera um slot de magia de nível 1.',
    tags: ['Recurso', 'Magia']
  },
  {
    id: 'pool-quick-reflexes',
    name: 'Reflexos Rápidos',
    type: 'passive',
    category: 'skill',
    range: 'Pessoal',
    effect: 'Ganha +2 em Iniciativa.',
    tags: ['Passiva', 'Iniciativa']
  },
  {
    id: 'pool-dual-wielder',
    name: 'Combatente com Duas Armas',
    type: 'bonus',
    category: 'skill',
    range: '5 ft',
    effect: 'Faz um ataque extra com a mão inábil.',
    tags: ['Ataque', 'Bônus'],
    value: '1d6'
  },
  {
    id: 'pool-arcane-study',
    name: 'Estudo Arcano',
    type: 'passive',
    category: 'skill',
    range: 'Pessoal',
    effect: 'Aumenta o dano de magias em +2.',
    tags: ['Passiva', 'Magia']
  },
  {
    id: 'pool-intimidating-shout',
    name: 'Grito Intimidador',
    type: 'action',
    category: 'skill',
    range: '30 ft',
    effect: 'O alvo fica Amedrontado por 1 turno.',
    tags: ['Controle', 'Debuff'],
    appliesTags: ['Amedrontado']
  },
  {
    id: 'pool-first-aid',
    name: 'Primeiros Socorros',
    type: 'action',
    category: 'skill',
    range: 'Toque',
    effect: 'Cura 1d6 de vida de um aliado.',
    tags: ['Cura', 'Suporte'],
    value: '1d6'
  },
  {
    id: 'pool-sharpshooter',
    name: 'Atirador de Elite',
    type: 'passive',
    category: 'skill',
    range: 'Pessoal',
    effect: 'Ignora penalidade de distância longa.',
    tags: ['Passiva', 'Ataque']
  },
  {
    id: 'pool-shield-master',
    name: 'Mestre de Escudo',
    type: 'reaction',
    category: 'skill',
    range: 'Pessoal',
    effect: 'Adiciona bônus do escudo em testes de Destreza.',
    tags: ['Defesa', 'Reação']
  },
  {
    id: 'pool-lucky',
    name: 'Sortudo',
    type: 'reaction',
    category: 'skill',
    range: 'Pessoal',
    effect: 'Rola novamente um d20.',
    tags: ['Especial', 'Reação']
  }
];

export const MONSTER_CARDS: Record<string, CombatCard[]> = {
  'goblin': [
    {
      id: 'goblin-scimitar',
      name: 'Cimitarra',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      effect: 'Ataque rápido com cimitarra.',
      tags: ['Ataque', 'Físico'],
      value: '1d6 + 2',
      damageType: 'Cortante',
      keywords: ['Furtivo (+2d6)']
    },
    {
      id: 'goblin-shortbow',
      name: 'Arco Curto',
      type: 'action',
      category: 'attack',
      range: '80/320 ft',
      effect: 'Disparo de flecha.',
      tags: ['Ataque', 'Distância'],
      value: '1d6 + 2',
      damageType: 'Perfurante'
    },
    {
      id: 'goblin-nimble-escape',
      name: 'Escapada Ágil',
      type: 'bonus',
      category: 'skill',
      range: 'Pessoal',
      effect: 'Desengajar ou Esconder como ação bônus.',
      tags: ['Movimento', 'Bônus']
    }
  ],
  'skeleton': [
    {
      id: 'skeleton-shortsword',
      name: 'Espada Curta',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      effect: 'Golpe de espada enferrujada.',
      tags: ['Ataque', 'Físico'],
      value: '1d6 + 2',
      damageType: 'Perfurante'
    },
    {
      id: 'skeleton-shortbow',
      name: 'Arco Curto',
      type: 'action',
      category: 'attack',
      range: '80/320 ft',
      effect: 'Disparo de flecha.',
      tags: ['Ataque', 'Distância'],
      value: '1d6 + 2',
      damageType: 'Perfurante'
    }
  ],
  'owlbear': [
    {
      id: 'owlbear-multiattack',
      name: 'Ataques Múltiplos',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      effect: 'Faz um ataque de bicada e um de garras.',
      tags: ['Ataque', 'Combo'],
      value: '1d10+5 + 2d8+5',
      keywords: ['Ataque Duplo']
    },
    {
      id: 'owlbear-beak',
      name: 'Bicada',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      effect: 'Ataque com bico afiado.',
      tags: ['Ataque'],
      value: '1d10 + 5',
      damageType: 'Perfurante'
    },
    {
      id: 'owlbear-claws',
      name: 'Garras',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      effect: 'Ataque com garras poderosas.',
      tags: ['Ataque'],
      value: '2d8 + 5',
      damageType: 'Cortante',
      keywords: ['Sangramento']
    }
  ],
  'ghost': [
    {
      id: 'ghost-withering-touch',
      name: 'Toque Degradante',
      type: 'action',
      category: 'attack',
      range: '5 ft',
      effect: 'Ataque necrótico que drena a vida do alvo.',
      tags: ['Ataque', 'Necrótico'],
      value: '4d6 + 3',
      damageType: 'Necrótico',
      keywords: ['Perfurante']
    },
    {
      id: 'ghost-etherealness',
      name: 'Forma Etérea',
      type: 'action',
      category: 'skill',
      range: 'Pessoal',
      effect: 'O fantasma entra no Plano Etéreo, tornando-se invisível e intocável.',
      tags: ['Especial', 'Defesa'],
      appliesTags: ['Etéreo'],
      keywords: ['Elusivo', 'Incorpóreo']
    },
    {
      id: 'ghost-horrifying-visage',
      name: 'Aspecto Horripilante',
      type: 'action',
      category: 'skill',
      range: '60 ft',
      effect: 'Criaturas próximas devem resistir ou ficarão amedrontadas.',
      tags: ['Controle', 'Área'],
      appliesTags: ['Amedrontado'],
      keywords: ['Amedrontador']
    },
    {
      id: 'ghost-possession',
      name: 'Possessão',
      type: 'action',
      category: 'skill',
      range: '5 ft',
      effect: 'Tenta possuir um humanoide próximo.',
      tags: ['Especial', 'Controle'],
      appliesTags: ['Possuído'],
      cooldown: 6,
      keywords: ['Letal (10)']
    }
  ]
};

export const CONSUMABLE_CARDS: CombatCard[] = [
  {
    id: 'potion-healing',
    name: 'Poção de Cura',
    type: 'action',
    category: 'consumable',
    range: 'Toque',
    effect: 'Recupera 2d4 + 2 de vida. (4 Cargas)',
    tags: ['Cura', 'Poção', 'Consumível'],
    value: '2d4 + 2',
    charges: 4,
    maxCharges: 4
  },
  {
    id: 'potion-greater-healing',
    name: 'Poção de Cura Maior',
    type: 'action',
    category: 'consumable',
    range: 'Toque',
    effect: 'Recupera 4d4 + 4 de vida. (2 Cargas)',
    tags: ['Cura', 'Poção', 'Consumível', 'Raro'],
    value: '4d4 + 4',
    charges: 2,
    maxCharges: 2
  },
  {
    id: 'revealing-dust',
    name: 'Poeira Reveladora',
    type: 'action',
    category: 'consumable',
    range: '30 ft (Área)',
    effect: 'Remove Elusivo por 2 turnos e aplica -2 na Defesa.',
    tags: ['Consumível', 'Anti-Elusivo', 'Área'],
    keywords: ['Visão Aguçada'],
    appliesTags: ['Revelado']
  },
  {
    id: 'arcane-mark',
    name: 'Marca Arcana',
    type: 'action',
    category: 'consumable',
    range: '60 ft',
    effect: 'Duração: 2 turnos. Ignora Elusivo e adiciona +1d4 de dano.',
    tags: ['Consumível', 'Anti-Elusivo', 'Marcador'],
    appliesTags: ['Marcado'],
    value: '1d4'
  },
  {
    id: 'focused-gaze',
    name: 'Olhar Focado',
    type: 'bonus',
    category: 'consumable',
    range: 'Pessoal',
    effect: 'Próximo ataque: Rola 2d20 (escolhe o maior) e ganha +2 para acertar.',
    tags: ['Consumível', 'Anti-Elusivo', 'Bônus'],
    appliesTags: ['Focado']
  },
  {
    id: 'blinding-light',
    name: 'Luz Ofuscante',
    type: 'action',
    category: 'consumable',
    range: '30 ft (Área)',
    effect: 'Remove Elusivo por 1 turno de todos os inimigos. Causa 1d4 dano radiante.',
    tags: ['Consumível', 'Anti-Elusivo', 'Dano', 'Área'],
    value: '1d4',
    damageType: 'Radiante',
    keywords: ['Visão Aguçada']
  },
  {
    id: 'arcane-burst',
    name: 'Explosão Arcana',
    type: 'action',
    category: 'consumable',
    range: '60 ft',
    effect: 'Causa 3d4 de dano garantido.',
    tags: ['Consumível', 'Dano', 'Magia'],
    value: '3d4',
    damageType: 'Força',
    keywords: ['Área'] // Using Área to bypass Elusive
  },
  {
    id: 'lesser-fireball',
    name: 'Bola de Fogo Menor',
    type: 'action',
    category: 'consumable',
    range: '60 ft (Área)',
    effect: 'Causa 2d6 de dano em área. Teste de Destreza: metade no sucesso.',
    tags: ['Consumível', 'Dano', 'Fogo', 'Área'],
    value: '2d6',
    damageType: 'Fogo'
  },
  {
    id: 'quick-poison',
    name: 'Veneno Rápido',
    type: 'bonus',
    category: 'consumable',
    range: 'Toque',
    effect: '1d4 imediato + 1d4 por turno (2 turnos). Ignora Elusivo.',
    tags: ['Consumível', 'Dano', 'Veneno'],
    value: '1d4',
    damageType: 'Veneno',
    appliesTags: ['Envenenado']
  },
  {
    id: 'arcane-shield-consumable',
    name: 'Escudo Arcano (Consumível)',
    type: 'reaction',
    category: 'consumable',
    range: 'Pessoal',
    effect: 'Reação: +5 Defesa. Se o ataque errar, você sofre 0 de dano.',
    tags: ['Consumível', 'Defesa', 'Reação'],
    keywords: ['Barreira (5)']
  },
  {
    id: 'misty-step-consumable',
    name: 'Passo Nebuloso',
    type: 'bonus',
    category: 'consumable',
    range: 'Pessoal',
    effect: 'Evita todo dano até o próximo turno.',
    tags: ['Consumível', 'Defesa', 'Movimento'],
    appliesTags: ['Etéreo']
  },
  {
    id: 'stoneskin-consumable',
    name: 'Pele de Pedra',
    type: 'action',
    category: 'consumable',
    range: 'Pessoal',
    effect: 'Duração: 2 turnos. Reduz todo dano recebido em 3.',
    tags: ['Consumível', 'Defesa'],
    appliesTags: ['Pele de Pedra']
  },
  {
    id: 'ethereal-prison',
    name: 'Prisão Etérea',
    type: 'action',
    category: 'consumable',
    range: '60 ft',
    effect: 'Teste de Sabedoria. Falha: perde o turno. Sucesso: 1d6 dano psíquico.',
    tags: ['Consumível', 'Controle'],
    value: '1d6',
    damageType: 'Psíquico'
  },
  {
    id: 'repelling-blast-consumable',
    name: 'Rajada Repulsiva',
    type: 'action',
    category: 'consumable',
    range: '60 ft',
    effect: 'Causa 1d6 de dano e aplica -2 no próximo ataque do inimigo.',
    tags: ['Consumível', 'Dano', 'Controle'],
    value: '1d6',
    appliesTags: ['Amedrontado'] // Using Amedrontado as a proxy for attack penalty
  },
  {
    id: 'silence-consumable',
    name: 'Silêncio',
    type: 'action',
    category: 'consumable',
    range: '60 ft (Área)',
    effect: 'Inimigos não podem usar magia por 1 turno.',
    tags: ['Consumível', 'Controle', 'Área'],
    appliesTags: ['Silenciado']
  },
  {
    id: 'heroic-inspiration',
    name: 'Inspiração Heroica',
    type: 'bonus',
    category: 'consumable',
    range: '30 ft',
    effect: 'Dá +1d6 em uma rolagem (até 2 turnos).',
    tags: ['Consumível', 'Suporte'],
    appliesTags: ['Inspirado']
  },
  {
    id: 'quick-heal',
    name: 'Cura Rápida',
    type: 'bonus',
    category: 'consumable',
    range: 'Toque',
    effect: 'Recupera 2d6 + 2 HP.',
    tags: ['Consumível', 'Cura'],
    value: '2d6 + 2'
  },
  {
    id: 'divine-protection',
    name: 'Proteção Divina',
    type: 'action',
    category: 'consumable',
    range: '30 ft (Área)',
    effect: 'Divide dano entre aliados e reduz o dano total em 2.',
    tags: ['Consumível', 'Suporte', 'Defesa'],
    appliesTags: ['Protegido']
  },
  {
    id: 'arcane-overload',
    name: 'Sobrecarga Arcana',
    type: 'action',
    category: 'consumable',
    range: '60 ft',
    effect: 'Causa 4d6 de dano, mas você sofre 2d6 de dano depois.',
    tags: ['Consumível', 'Dano', 'Risco'],
    value: '4d6',
    damageType: 'Arcano'
  },
  {
    id: 'desperate-attack',
    name: 'Ataque Desesperado',
    type: 'action',
    category: 'consumable',
    range: '5 ft',
    effect: 'Ganha +4 para acertar e causa 3d6 de dano. Se errar, você sofre 1d6.',
    tags: ['Consumível', 'Dano', 'Risco'],
    value: '3d6'
  },
  {
    id: 'healers-kit',
    name: 'Kit de Curandeiro',
    type: 'action',
    category: 'item',
    range: 'Toque',
    effect: 'Estabiliza um personagem com 0 HP.',
    tags: ['Cura', 'Ferramenta', 'Estabilização']
  }
];
