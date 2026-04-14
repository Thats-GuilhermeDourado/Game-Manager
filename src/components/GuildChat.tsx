import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sword } from 'lucide-react';
import { useCharacter, Guild, GuildMessage } from '../contexts/CharacterContext';
import { cn } from '../lib/utils';

interface GuildChatProps {
  guild: Guild;
}

export function GuildChat({ guild }: GuildChatProps) {
  const { 
    user,
    allCharacters, 
    sendGuildMessage,
    guildMessages
  } = useCharacter();

  const messages = guildMessages[guild.id] || [];
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendGuildMessage(guild.id, newMessage.trim());
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col -m-8">
      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between bg-white/20 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-black">Chat da Guilda</h3>
          <p className="text-[10px] text-black/40 font-medium uppercase tracking-wider">Canal Seguro e Criptografado</p>
        </div>
        <div className="flex -space-x-2">
          {guild.memberRefs.slice(0, 3).map((ref, i) => {
             const char = allCharacters.find(c => c.id === ref.charId);
             return (
               <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-black/5">
                 <img src={char?.appearance || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ref.charId}`} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
               </div>
             );
          })}
          {guild.memberRefs.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-black/5 flex items-center justify-center text-[8px] font-bold text-black/40">
              +{guild.memberRefs.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
            <MessageSquare size={40} />
            <p className="text-xs font-bold uppercase tracking-widest">Inicie a conversa</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === user?.uid;
            const senderChar = allCharacters.find(c => c.id === msg.senderCharId);
            
            return (
              <div key={msg.id || i} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                {!isMe && (
                  <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest mb-1.5 ml-4">
                    {msg.senderName}
                  </span>
                )}
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isMe && (
                    <div className="w-6 h-6 rounded-lg overflow-hidden border border-black/5 flex-shrink-0 mb-1 shadow-sm">
                      <img src={senderChar?.appearance || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderCharId}`} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className={cn(
                    "px-5 py-3.5 rounded-[2rem] text-sm relative group transition-all duration-300",
                    isMe 
                      ? "bg-emerald-500 text-white rounded-br-none shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)]" 
                      : "bg-white/60 backdrop-blur-xl border border-white/80 text-black rounded-bl-none shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:bg-white/80"
                  )}>
                    {/* Liquid Glass Effect Overlay */}
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[2rem] pointer-events-none" />
                    
                    <p className="relative z-10 font-medium leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-6 bg-white/20 backdrop-blur-md border-t border-black/5">
        <div className="relative flex items-center gap-3">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl px-6 py-4 text-sm text-black placeholder:text-black/20 focus:outline-none focus:bg-white/60 focus:border-emerald-500/30 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:scale-100"
          >
            <Sword size={18} className="rotate-45" />
          </button>
        </div>
      </form>
    </div>
  );
}
