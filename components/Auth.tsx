
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Wallet, Loader2, AlertCircle, PlayCircle, ArrowLeft, Send } from 'lucide-react';

interface AuthProps {
  onDemoMode: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

const Auth: React.FC<AuthProps> = ({ onDemoMode }) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("O servidor do banco de dados não está configurado. Use o 'Modo Visitante' abaixo.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMessage('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
        setView('login');
      } else if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setSuccessMessage('Link de recuperação enviado para seu e-mail!');
        setView('login');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* Header Dinâmico */}
        <div className="bg-blue-600 p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <Wallet className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">SmartCash AI</h1>
            <p className="text-blue-100 mt-2 font-bold uppercase text-[10px] tracking-widest">
              {view === 'login' && 'Bem-vindo de volta'}
              {view === 'signup' && 'Comece sua jornada'}
              {view === 'forgot-password' && 'Recuperação de conta'}
            </p>
          </div>
        </div>

        <div className="p-10 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in slide-in-from-top-2">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <Send className="w-3 h-3 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{successMessage}</p>
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

            {view !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                  {view === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-lg transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {view === 'login' && 'ACESSAR DASHBOARD'}
                  {view === 'signup' && 'CRIAR CONTA AGORA'}
                  {view === 'forgot-password' && 'ENVIAR LINK'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
            {view === 'forgot-password' ? (
              <button
                onClick={() => setView('login')}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para o Login
              </button>
            ) : (
              <button
                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                className="w-full text-center text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
              >
                {view === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
              </button>
            )}

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">OU</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button
              onClick={onDemoMode}
              className="w-full py-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-emerald-100 group shadow-sm"
            >
              <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Acessar Modo Visitante
            </button>
          </div>
        </div>
      </div>
      
      <p className="fixed bottom-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
        © 2024 SmartCash AI • Secure Infrastructure
      </p>
    </div>
  );
};

export default Auth;
