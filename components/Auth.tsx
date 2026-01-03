
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Wallet, Loader2, AlertCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Confirme seu e-mail para ativar sua conta!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-12 text-center text-white relative">
          <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <Wallet className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">SmartCash AI</h1>
          <p className="text-blue-100 mt-2 font-bold uppercase text-[10px] tracking-widest">Controle Financeiro Seguro</p>
        </div>

        <div className="p-10 md:p-12">
          {error && (
            <div className="mb-8 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-black leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-200 rounded-[24px] focus:outline-none focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-200 rounded-[24px] focus:outline-none focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-lg transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-6 h-6" />
                  CRIAR CONTA
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  ACESSAR DASHBOARD
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              {isSignUp ? 'Já tenho uma conta? Entrar' : 'Não tem conta? Cadastrar agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
