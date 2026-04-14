import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Shield, 
  Sparkles, 
  MessageSquare,
  Sword,
  Target,
  Trophy
} from 'lucide-react';
import { useCharacter, Character, Guild } from '../contexts/CharacterContext';
import { cn } from '../lib/utils';
import { GuildHall } from '../components/GuildHall';
import { toast } from 'sonner';

export default function Social() {
  const navigate = useNavigate();
  const { 
    currentCharacter, 
    allCharacters,
    friendships, 
    guilds, 
    sendFriendRequest, 
    acceptFriendRequest, 
    createGuild,
    joinGuild,
    leaveGuild,
    loadCharacter,
    getAICombos
  } = useCharacter();

  const [activeTab, setActiveTab] = useState<'friends' | 'guilds'>('friends');
  const [isGuildModalOpen, setIsGuildModalOpen] = useState(false);
  const [selectedGuildForHall, setSelectedGuildForHall] = useState<Guild | null>(null);
  const [newGuildName, setNewGuildName] = useState('');
  const [aiComboResult, setAiComboResult] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const pendingRequests = friendships.filter(f => f.status === 'pending' && f.charIds[1] === currentCharacter?.id);
  const acceptedFriends = friendships.filter(f => f.status === 'accepted');
  
  const friendCharacters = allCharacters.filter(c => 
    c.id !== currentCharacter?.id && 
    acceptedFriends.some(f => f.charIds.includes(c.id))
  );

  const availablePlayers = allCharacters.filter(c => 
    c.id !== currentCharacter?.id && 
    !friendships.some(f => f.charIds.includes(c.id))
  );

  const handleAICombos = async (friend: Character) => {
    setLoadingAI(true);
    const result = await getAICombos(friend);
    setAiComboResult(result);
    setLoadingAI(false);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-6xl font-display font-black text-parchment uppercase tracking-tighter drop-shadow-2xl">Hub Social</h1>
          <p className="text-parchment/20 font-black tracking-[0.4em] uppercase text-[10px] mt-3 flex items-center gap-3">
            <Users size={14} className="text-gold" /> Alianças & Guildas
          </p>
        </div>
        <div className="flex bg-white/2 p-2 rounded-[2rem] border border-white/5 shadow-inner backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('friends')}
            className={cn(
              "px-10 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
              activeTab === 'friends' 
                ? "bg-gold text-midnight shadow-[0_10px_20px_rgba(212,175,55,0.3)] scale-105" 
                : "text-parchment/20 hover:text-parchment hover:bg-white/5"
            )}
          >
            Amigos
          </button>
          <button 
            onClick={() => setActiveTab('guilds')}
            className={cn(
              "px-10 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
              activeTab === 'guilds' 
                ? "bg-gold text-midnight shadow-[0_10px_20px_rgba(212,175,55,0.3)] scale-105" 
                : "text-parchment/20 hover:text-parchment hover:bg-white/5"
            )}
          >
            Guildas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {activeTab === 'friends' ? (
          <>
            {/* Friends List & Requests */}
            <div className="lg:col-span-8 space-y-12">
              {pendingRequests.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-display font-black text-gold uppercase tracking-tighter flex items-center gap-4">
                    <UserPlus className="text-gold" size={24} strokeWidth={2.5} /> Pedidos Pendentes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingRequests.map(req => {
                      const sender = allCharacters.find(c => c.id === req.charIds[0]);
                      return (
                        <motion.div 
                          key={req.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bento-item p-5 flex items-center justify-between border-gold/20 bg-gold/5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-gold/20 shadow-xl">
                              <img src={sender?.appearance} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-display font-black text-parchment text-lg leading-tight">{sender?.name}</div>
                              <div className="text-[9px] text-parchment/30 uppercase font-black tracking-widest">{sender?.charClass}</div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => acceptFriendRequest(req.id)}
                              className="w-10 h-10 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all active:scale-90 flex items-center justify-center"
                            >
                              <Check size={20} strokeWidth={3} />
                            </button>
                            <button className="w-10 h-10 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all active:scale-90 flex items-center justify-center">
                              <X size={20} strokeWidth={3} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="space-y-8">
                <h2 className="text-3xl font-display font-black text-parchment uppercase tracking-tighter flex items-center gap-4 drop-shadow-2xl">
                  <Users className="text-gold" size={28} strokeWidth={2.5} /> Seus Aliados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {friendCharacters.map(friend => (
                    <motion.div 
                      key={friend.id}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="bento-item p-8 space-y-8 border-white/5 hover:border-gold/20 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-2 border-white/5 group-hover:border-gold/30 transition-all duration-700 shadow-2xl">
                            <img src={friend.appearance} alt="" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-2xl font-display font-black text-parchment tracking-tight group-hover:text-gold transition-colors">{friend.name}</h3>
                            <div className="text-[9px] text-parchment/20 uppercase font-black tracking-[0.2em]">Nível {friend.level} {friend.charClass}</div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={() => handleAICombos(friend)}
                            className="w-12 h-12 bg-gold/5 text-gold border border-gold/10 rounded-2xl hover:bg-gold/20 hover:border-gold/30 transition-all duration-500 flex items-center justify-center shadow-xl group/btn"
                            title="Sugestão de Combo IA"
                          >
                            <Sparkles size={22} strokeWidth={2} className="group-hover/btn:rotate-12 transition-transform" />
                          </button>
                          <button className="w-12 h-12 bg-white/2 text-parchment/20 border border-white/5 rounded-2xl hover:text-parchment hover:bg-white/5 transition-all duration-500 flex items-center justify-center shadow-xl">
                            <MessageSquare size={22} strokeWidth={2} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/2 rounded-2xl p-4 border border-white/5 shadow-inner group-hover:border-gold/10 transition-colors">
                          <div className="text-[8px] uppercase text-parchment/20 font-black tracking-[0.2em] mb-1">Função</div>
                          <div className="text-sm font-black text-parchment tracking-tight">
                            {['Guerreiro', 'Paladino', 'Bárbaro'].includes(friend.charClass) ? 'Tank' : 
                             ['Mago', 'Feiticeiro', 'Bruxo'].includes(friend.charClass) ? 'DPS' : 'Suporte'}
                          </div>
                        </div>
                        <div className="bg-white/2 rounded-2xl p-4 border border-white/5 shadow-inner group-hover:border-gold/10 transition-colors">
                          <div className="text-[8px] uppercase text-parchment/20 font-black tracking-[0.2em] mb-1">Status</div>
                          <div className="text-sm font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {friendCharacters.length === 0 && (
                    <div className="col-span-2 py-32 text-center bento-item border-dashed border-white/5 opacity-30 cursor-default shadow-none">
                      <Users className="mx-auto text-parchment/10 mb-6" size={64} strokeWidth={1} />
                      <p className="text-xl font-display font-black text-parchment/20 uppercase tracking-widest">Nenhum aliado ainda. Encontre jogadores para se conectar!</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Discover Players */}
            <div className="lg:col-span-4 space-y-12">
              <section className="liquid-glass p-10 space-y-8 border-white/5 shadow-2xl">
                <h2 className="text-3xl font-display font-black text-parchment uppercase tracking-tighter flex items-center gap-4 drop-shadow-2xl">
                  <Target className="text-gold" size={28} strokeWidth={2.5} /> Descobrir
                </h2>
                <div className="space-y-6">
                  {availablePlayers.map(player => (
                    <motion.div 
                      key={player.id} 
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-5 bg-white/2 rounded-3xl border border-white/5 hover:border-gold/20 transition-all duration-500 group shadow-inner"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-gold/20 transition-all duration-700 shadow-xl">
                          <img src={player.appearance} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-display font-black text-parchment tracking-tight group-hover:text-gold transition-colors">{player.name}</div>
                          <div className="text-[9px] text-parchment/20 uppercase font-black tracking-widest">{player.charClass}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendFriendRequest(player.id)}
                        className="w-12 h-12 flex items-center justify-center text-gold bg-gold/5 border border-gold/10 rounded-2xl hover:bg-gold/20 hover:border-gold/30 transition-all duration-500 shadow-xl active:scale-90"
                      >
                        <UserPlus size={22} strokeWidth={2.5} />
                      </button>
                    </motion.div>
                  ))}
                  {availablePlayers.length === 0 && (
                    <div className="py-12 text-center space-y-4 opacity-20">
                      <Users className="mx-auto text-parchment/20" size={48} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum novo jogador encontrado.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* AI Combo Result Modal */}
              <AnimatePresence>
                {aiComboResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="liquid-glass p-10 border-gold/40 bg-gold/5 relative overflow-hidden shadow-[0_20px_50px_rgba(212,175,55,0.1)]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <button 
                      onClick={() => setAiComboResult(null)}
                      className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-gold/30 hover:text-gold bg-white/5 rounded-xl transition-all duration-500"
                    >
                      <X size={20} strokeWidth={3} />
                    </button>
                    <h3 className="text-3xl font-display font-black text-gold mb-8 flex items-center gap-4 drop-shadow-2xl">
                      <Sparkles size={28} strokeWidth={2.5} /> Estratégia IA
                    </h3>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold/40 via-gold/10 to-transparent rounded-full" />
                      <div className="text-sm text-parchment/80 leading-relaxed whitespace-pre-wrap pl-8 font-medium italic">
                        {aiComboResult}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Guilds Tab */
          <div className="lg:col-span-12 space-y-12">
            <div className="liquid-glass p-8 border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
              <h2 className="text-4xl font-display font-black text-parchment uppercase tracking-tighter flex items-center gap-5 drop-shadow-2xl">
                <Shield className="text-gold" size={32} strokeWidth={2.5} /> Guildas Ativas
              </h2>
              <button 
                onClick={() => setIsGuildModalOpen(true)}
                className="w-full md:w-auto px-10 py-5 rounded-2xl bg-gold text-midnight text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all duration-500"
              >
                <Shield size={18} strokeWidth={3} /> Formar Guilda
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {guilds.map(guild => (
                <motion.div 
                  key={guild.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bento-item p-10 space-y-10 border-white/5 hover:border-gold/30 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-20 bg-gold/5 rounded-[2rem] flex items-center justify-center text-gold border border-gold/10 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                      <Shield size={40} strokeWidth={2} />
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-[10px] text-gold font-black uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">Nível da Guilda 1</div>
                      <div className="text-[10px] text-parchment/20 uppercase font-black tracking-widest">{guild.memberRefs.length} Membros</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-4xl font-display font-black text-parchment uppercase tracking-tighter leading-none group-hover:text-gold transition-colors">{guild.name}</h3>
                    <p className="text-xs text-parchment/40 italic font-medium">"Força na União, Sabedoria na Estratégia"</p>
                  </div>

                  <div className="flex -space-x-4 overflow-hidden p-1">
                    {guild.memberRefs.map((ref, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -5, scale: 1.1, zIndex: 10 }}
                        className="inline-block h-14 w-14 rounded-2xl ring-4 ring-midnight overflow-hidden border-2 border-gold/20 shadow-2xl transition-all"
                      >
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ref.charId}`} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] text-gold font-black uppercase tracking-[0.3em] flex items-center gap-3">
                      <Sparkles size={14} strokeWidth={3} /> Base de Conhecimento
                    </h4>
                    <div className="space-y-3">
                      {guild.notes?.length > 0 ? guild.notes.map((note, idx) => (
                        <div key={idx} className="p-4 bg-white/2 rounded-2xl border border-white/5 text-xs shadow-inner group-hover:border-gold/10 transition-colors">
                          <div className="text-[10px] text-parchment/40 line-clamp-2 leading-relaxed font-medium italic">"{note}"</div>
                        </div>
                      )) : (
                        <p className="text-[10px] text-parchment/10 italic font-black uppercase tracking-widest text-center py-4">Nenhum conhecimento compartilhado ainda.</p>
                      )}
                    </div>
                  </div>

                  {guild.memberRefs.some(m => m.charId === currentCharacter?.id) ? (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedGuildForHall(guild)}
                        className="flex-1 py-5 bg-white/2 border border-white/5 rounded-2xl text-[10px] font-black text-parchment/40 uppercase tracking-[0.2em] hover:bg-gold/10 hover:text-gold hover:border-gold/30 transition-all duration-500 shadow-xl"
                      >
                        Entrar no Salão
                      </button>
                      <button 
                        onClick={() => {
                          leaveGuild(guild.id);
                        }}
                        className="px-6 py-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all duration-500"
                        title="Sair da Guilda"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        if (!currentCharacter) {
                          toast.error("Selecione um personagem primeiro!");
                          return;
                        }
                        if (currentCharacter.guildId) {
                          toast.error("Você já pertence a uma guilda! Saia dela primeiro.");
                          return;
                        }
                        joinGuild(guild.id);
                      }}
                      className="w-full py-5 bg-gold text-midnight rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all duration-500 shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
                    >
                      Alistar-se
                    </button>
                  )}
                </motion.div>
              ))}
              {guilds.length === 0 && (
                <div className="col-span-full py-40 text-center bento-item border-dashed border-white/5 opacity-20 cursor-default shadow-none">
                  <Shield className="mx-auto text-parchment/10 mb-8" size={80} strokeWidth={1} />
                  <h3 className="text-3xl font-display font-black text-parchment uppercase tracking-widest">Nenhuma Guilda Encontrada</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] max-w-md mx-auto mt-4">Guildas requerem pelo menos 3 membros para estarem totalmente ativas. Forme uma hoje!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      {/* Guild Hall Overlay */}
      <AnimatePresence>
        {selectedGuildForHall && (
          <GuildHall 
            guild={selectedGuildForHall} 
            onClose={() => setSelectedGuildForHall(null)} 
            onViewProfile={async (charId, userId) => {
              await loadCharacter(charId, userId);
              navigate('/character');
            }}
          />
        )}
      </AnimatePresence>

      {/* Guild Creation Modal */}
      <AnimatePresence>
        {isGuildModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGuildModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-10"
            >
              <h2 className="text-3xl font-display font-black text-gold uppercase tracking-tighter mb-6 text-center">Form Your Guild</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gold/60 tracking-widest mb-2">Guild Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Order of the Silver Flame"
                    value={newGuildName}
                    onChange={(e) => setNewGuildName(e.target.value)}
                    className="w-full bg-midnight/40 border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:outline-none focus:border-gold"
                  />
                </div>
                
                <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl">
                  <p className="text-[10px] text-gold/80 leading-relaxed italic">
                    "A guild is more than a group; it is a legacy. As leader, you will manage the hall, formations, and the shared knowledge base."
                  </p>
                </div>

                <button 
                  onClick={() => {
                    if (!currentCharacter) {
                      toast.error("Selecione um personagem primeiro!");
                      return;
                    }
                    createGuild(newGuildName);
                    setIsGuildModalOpen(false);
                    setNewGuildName('');
                  }}
                  disabled={!newGuildName}
                  className="w-full btn-magic btn-magic-primary py-4 text-sm font-black uppercase tracking-widest disabled:opacity-50"
                >
                  Establish Legacy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
