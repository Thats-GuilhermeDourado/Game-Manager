import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sword, Shield, Scroll, Zap, LogIn, Mail, Lock } from 'lucide-react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("O login com Google não está ativado no Console do Firebase.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Este domínio não está autorizado no Firebase. Por favor, aguarde alguns instantes para a propagação das configurações ou tente recarregar a página.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("O login por Email/Senha não está ativado no Console do Firebase.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está em uso. Tente fazer login em vez de criar uma conta.");
        setIsLogin(true);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("E-mail ou senha incorretos. Verifique suas credenciais.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Este domínio não está autorizado no Firebase. Por favor, aguarde alguns instantes para a propagação das configurações.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md glass-card p-10 space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gold/10 rounded-3xl flex items-center justify-center text-gold mx-auto border border-gold/20 shadow-[0_0_30px_rgba(201,160,61,0.2)]">
            <Sparkles size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black text-gold uppercase tracking-tighter">D&D Companion</h1>
            <p className="text-parchment/40 text-xs uppercase tracking-widest mt-2">Your Digital Grimoire Awaits</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-ruby/10 border border-ruby/20 rounded-xl text-ruby text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-parchment/40 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment/20" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-parchment focus:outline-none focus:border-gold/40 transition-all"
                placeholder="adventurer@realms.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-parchment/40 uppercase tracking-widest ml-1">Secret Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment/20" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-parchment focus:outline-none focus:border-gold/40 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gold text-midnight rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(201,160,61,0.3)] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Enter the Realm' : 'Join the Guild')}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-midnight px-4 text-parchment/20">Or use Divine Power</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-parchment uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
        >
          <LogIn size={18} /> Continue with Google
        </button>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] text-parchment/40 hover:text-gold uppercase font-bold tracking-widest transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5 opacity-20">
          <div className="flex flex-col items-center gap-2">
            <Sword size={20} />
            <div className="text-[8px] uppercase font-bold">Combat</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Shield size={20} />
            <div className="text-[8px] uppercase font-bold">Defense</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Scroll size={20} />
            <div className="text-[8px] uppercase font-bold">Lore</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
