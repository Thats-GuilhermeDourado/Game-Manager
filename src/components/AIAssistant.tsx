import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User as UserIcon,
  Loader2,
  MessageSquare,
  BookOpen,
  Sword,
  Scroll
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { useCharacter } from '../contexts/CharacterContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Greetings, traveler! I am your AI Dungeon Master assistant. How can I help you on your quest today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentCharacter } = useCharacter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `You are an expert D&D 5e Dungeon Master assistant. 
      You are helping a player manage their character and understand the rules.
      The current character is: ${currentCharacter ? `${currentCharacter.name}, a Level ${currentCharacter.level} ${currentCharacter.race} ${currentCharacter.charClass}` : 'None selected'}.
      Be helpful, immersive, and accurate to the 5th Edition rules.
      Keep your responses concise and formatted with markdown if needed.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const assistantMessage = response.text || "I apologize, but my connection to the ethereal plane was interrupted.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Forgive me, but a magical surge has disrupted my ability to assist. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 left-0 w-96 h-[500px] bg-midnight/90 border border-gold/20 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gold/10 border-bottom border-gold/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gold rounded-xl flex items-center justify-center text-midnight">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-display font-black text-gold uppercase tracking-widest">AI Assistant</div>
                  <div className="text-[10px] text-gold/40 uppercase font-bold tracking-widest">Dungeon Master Guide</div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gold/40 hover:text-gold transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === 'assistant' ? "bg-gold/10 text-gold" : "bg-white/10 text-white"
                  )}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'assistant' 
                      ? "bg-gold/5 text-parchment/90 border border-gold/10 rounded-tl-none" 
                      : "bg-white/5 text-parchment rounded-tr-none border border-white/5"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 bg-gold/5 text-parchment/40 text-xs italic rounded-2xl rounded-tl-none border border-gold/10">
                    Consulting the ancient scrolls...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
              {[
                { icon: BookOpen, label: 'Rules' },
                { icon: Sword, label: 'Combat' },
                { icon: Scroll, label: 'Lore' }
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => setInput(`Tell me about ${action.label.toLowerCase()} in D&D 5e`)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-parchment/60 hover:text-gold hover:border-gold/40 transition-all whitespace-nowrap"
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-midnight/40 border-t border-gold/10">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-parchment placeholder:text-parchment/20 focus:outline-none focus:border-gold/40 transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gold text-midnight rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-[0_0_15px_rgba(242,125,38,0.3)]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all relative group",
          isOpen ? "bg-gold text-midnight" : "bg-midnight/80 text-gold border border-gold/20 hover:border-gold/50"
        )}
      >
        <div className="absolute inset-0 bg-gold/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="w-6 h-6 relative" /> : <Sparkles className="w-6 h-6 relative" />}
      </motion.button>
    </div>
  );
}
