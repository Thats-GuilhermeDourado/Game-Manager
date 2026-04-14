export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  reward: {
    xp?: number;
    gold?: number;
    item?: string;
  };
}

export const TOA_ACHIEVEMENTS: Achievement[] = [
  // Bronze
  { id: 'dino_hunter', name: 'Caçador de Dinossauros', description: 'Mate 5 dinossauros', icon: 'dinosaur', tier: 'bronze', reward: { xp: 100 } },
  { id: 'jungle_survivor', name: 'Sobrevivente da Selva', description: 'Visite 10 locais diferentes', icon: 'jungle', tier: 'bronze', reward: { xp: 50 } },
  { id: 'cursed_chult', name: 'Amaldiçoado de Chult', description: 'Sofra uma maldição pela primeira vez', icon: 'skull', tier: 'bronze', reward: { xp: 75 } },
  { id: 'bay_bath', name: 'Banho na Baía', description: 'Entre em contato com a água da Baía de Chult', icon: 'wave', tier: 'bronze', reward: { xp: 25 } },
  { id: 'plentiful_hunt', name: 'Caçada Farta', description: 'Abata um animal grande para alimentar o grupo', icon: 'meat', tier: 'bronze', reward: { xp: 50 } },
  
  // Prata
  { id: 'known_nyanzaru', name: 'Nyanzaru Conhecido', description: 'Complete 3 missões em Porto Nyanzaru', icon: 'city', tier: 'silver', reward: { xp: 200, gold: 100 } },
  { id: 'legendary_guide', name: 'Guia Lendário', description: 'Complete todas as missões do seu guia', icon: 'wizard', tier: 'silver', reward: { xp: 500 } },
  { id: 'lost_treasure', name: 'Tesouro Perdido', description: 'Encontre um artefato raro em ruínas antigas', icon: 'treasure', tier: 'silver', reward: { xp: 300, item: 'Item Raro' } },
  { id: 'jungle_master', name: 'Mestre da Selva', description: 'Sobreviva 7 dias seguidos na selva sem retornar à cidade', icon: 'jungle', tier: 'silver', reward: { xp: 400 } },
  { id: 'forgotten_ruins', name: 'Ruínas Esquecidas', description: 'Descubra 5 ruínas diferentes', icon: 'temple', tier: 'silver', reward: { xp: 250 } },
  
  // Ouro
  { id: 'heart_labyrinth', name: 'Coração do Labirinto', description: 'Encontre Omu (a cidade perdida)', icon: 'labyrinth', tier: 'gold', reward: { xp: 1000 } },
  { id: 'spirit_voice', name: 'Voz dos Espíritos', description: 'Faça contato bem-sucedido com um espírito ancestral', icon: 'ghost', tier: 'gold', reward: { xp: 800, item: 'Bênção' } },
  { id: 'curse_breaker', name: 'Quebrador de Maldições', description: 'Ajude a remover uma maldição de um NPC importante', icon: 'broken-shield', tier: 'gold', reward: { xp: 1200, gold: 300 } },
  { id: 'fire_survivor', name: 'Sobrevivente do Fogo', description: 'Resista a um ataque de dragão vermelho', icon: 'dragon', tier: 'gold', reward: { xp: 900 } },
  { id: 'lich_mind', name: 'A Mente do Lich', description: 'Leia um dos diários de Acererak', icon: 'brain', tier: 'gold', reward: { xp: 750 } },
  
  // Platina
  { id: 'acererak_slayer', name: 'Matador do Acererak', description: 'Derrote Acererak na tumba', icon: 'lich', tier: 'platinum', reward: { xp: 5000, item: 'Item Lendário' } },
  { id: 'hero_chult', name: 'Herói de Chult', description: 'Complete TODAS as conquistas da campanha', icon: 'trophy', tier: 'platinum', reward: { item: 'Título Especial' } },
];
