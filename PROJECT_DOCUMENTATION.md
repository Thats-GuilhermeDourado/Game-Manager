# Documentação Detalhada: D&D Campaign Manager

Este documento fornece um relatório completo sobre a arquitetura, funcionalidades e integração do sistema **D&D Campaign Manager**.

---

## 1. Objetivo e Visão Geral
O projeto é uma plataforma Full-Stack projetada para digitalizar e aprimorar a experiência de jogo de Dungeons & Dragons 5e. Ele foca em automação de regras, colaboração em tempo real entre Mestre (DM) e Jogadores, e assistência baseada em IA.

---

## 2. Autenticação e Acesso
O sistema utiliza o **Firebase Auth** para garantir a segurança dos dados.
- **Login com Google:** Integração direta via OAuth para acesso rápido.
- **E-mail e Senha:** Sistema tradicional de cadastro e login.
- **Fluxo de Segurança:** Após o login, o usuário é redirecionado para o Dashboard. Se não estiver autenticado, as rotas internas são bloqueadas automaticamente.

---

## 3. Gerenciamento de Personagens e Fichas
A criação e manutenção de fichas é dinâmica e integrada ao banco de dados Firestore.
- **Criação de Ficha:** O usuário define Atributos (Força, Destreza, etc.), Raça, Classe e Nível.
- **Cálculos Automáticos:** O sistema calcula modificadores de atributos, Classe de Armadura (AC) e Pontos de Vida (HP) máximos.
- **Edição em Tempo Real:** Qualquer alteração na ficha (como perder HP ou ganhar XP) é salva instantaneamente e pode ser visualizada pelo Mestre.

---

## 4. Sistema de Campanhas
As campanhas são o núcleo da colaboração no app.
- **Criação pelo Mestre:** O DM cria uma campanha e recebe um **Código de Convite**.
- **Entrada de Jogadores:** Jogadores inserem o código para vincular seus personagens àquela campanha específica.
- **Sincronização de Grupo:** Todos os personagens na mesma campanha compartilham o mesmo contexto de jogo.

---

## 5. Funcionalidades do Mestre (DM Dashboard)
O Mestre possui ferramentas exclusivas para controlar o fluxo da aventura:
- **Botão de Visualização (View):** O DM pode clicar no ícone de "Olho" ao lado de qualquer jogador para carregar e inspecionar a ficha completa daquele personagem.
- **Recompensas:** O DM pode distribuir XP e Ouro individualmente ou para todo o grupo com um clique.
- **Descanso (Rest):** Botões de "Short Rest" e "Long Rest" que restauram HP e recursos de todos os jogadores simultaneamente.
- **Entrega de Itens:** O DM pode selecionar qualquer item do banco de dados e enviá-lo diretamente para o inventário de um jogador.
- **Pergaminhos (Scrolls):** Notas compartilhadas que o DM cria para registrar o Lore (história) ou missões, visíveis para todos os jogadores.
- **NPCs:** Aba para criar personagens não-jogadores com imagens, raças e descrições, facilitando a organização da narrativa.
- **Táticas (Formação):** Um grid de arrastar e soltar onde o DM define a posição estratégica dos jogadores (Vanguarda, Meio, Retaguarda).

---

## 6. Inventário, Itens e Economia
- **Loja (Emporium):** Jogadores podem abrir a loja e comprar equipamentos usando o ouro acumulado.
- **Equipamento:** Itens podem ser "Equipados", o que altera automaticamente as estatísticas do personagem (ex: equipar uma armadura aumenta o AC).
- **Envio de Itens (Trade):** Através da aba "Trade with Friend", um jogador pode enviar um item do seu inventário para um aliado, desde que sejam amigos no sistema.

---

## 7. Social: Amizades e Guildas
- **Hub Social:** Permite ver outros jogadores da mesma campanha.
- **Amizades:** É possível enviar pedidos de amizade. Amigos aceitos aparecem como "Aliados".
- **Sugestões de Combo (IA):** Ao clicar no ícone de faísca em um aliado, a IA analisa as duas fichas e sugere estratégias de combate combinadas (ex: como um Mago e um Guerreiro podem combar magias e ataques).
- **Guildas:** Jogadores podem formar guildas com nomes personalizados e compartilhar uma base de conhecimento (notas) exclusiva do grupo.

---

## 8. Bestiário e Monstros
- **Visibilidade Controlada:** O Mestre vê todos os monstros. Os jogadores só vêem monstros que o Mestre "Desbloqueou" (Revelou) durante a sessão.
- **Fichas de Monstros:** Detalhes completos de AC, HP, Atributos, Ações e Habilidades Especiais.

---

## 9. Assistente de IA (Dungeon Master Guide)
Localizado no canto inferior da tela, o assistente utiliza o modelo **Gemini 3 Flash**:
- **Contexto:** Ele sabe quem é o seu personagem atual e o seu nível.
- **Suporte:** Responde dúvidas sobre regras da 5ª Edição, ajuda a criar descrições de cenários ou sugere nomes para NPCs.
- **Atalhos:** Botões rápidos para consultar Regras, Combate ou Lore.

---

## 10. Tecnologias e Design
- **Frontend:** React + Vite + Tailwind CSS.
- **Animações:** Framer Motion para transições de abas e modais.
- **Backend:** Firebase (Firestore para dados, Auth para usuários).
- **Design:** Estilo "Midnight & Gold" com Glassmorphism, focado em imersão e facilidade de leitura em ambientes escuros.
