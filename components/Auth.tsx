
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Mail, Lock, Wallet, Loader2, AlertCircle, Send, PlayCircle } from 'lucide-react';

interface AuthProps {
  onDemoMode: () => void;
  onLogin: (session: any) => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

const Auth: React.FC<AuthProps> = ({ onDemoMode, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        if (view === 'signup') {
          setSuccessMessage('Conta local preparada com sucesso!');
          setTimeout(() => setView('login'), 1000);
        } else if (view === 'login') {
          if (email && password) {
            const safeId = 'local-' + Math.random().toString(36).substring(2, 9);
            const mockSession = { 
              user: { email, id: safeId }, 
              expires_at: Date.now() + 3600000 
            };
            localStorage.setItem('smartcash_local_session', JSON.stringify(mockSession));
            onLogin(mockSession); // ATUALIZA ESTADO EM VEZ DE DAR RELOAD
          } else {
            setError("Por favor, preencha todos os campos.");
          }
        } else if (view === 'forgot-password') {
          setSuccessMessage('Link de reset enviado (Simulação)');
          setTimeout(() => setView('login'), 2000);
        }
        setLoading(false);
      }, 600);
      return;
    }

    try {
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMessage('Verifique seu e-mail para confirmar o cadastro.');
      } else if (view === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) onLogin(data.session);
      } else if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSuccessMessage('Link de recuperação enviado!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        <div className="bg-blue-600 p-12 text-center text-white relative overflow-hidden">
          {!isSupabaseConfigured && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/80">Modo Offline</span>
            </div>
          )}
          
          <div className="relative z-10">
            <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <Wallet className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">SmartCash AI</h1>
            <p className="text-blue-100 mt-2 font-bold uppercase text-[10px] tracking-widest">
              Controle Financeiro Inteligente
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
              <Send className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-200 rounded-[24px] focus:outline-none focus:border-blue-600 transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            {view !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sua Senha</label>
                  {view === 'login' && (
                    <button type="button" onClick={() => setView('forgot-password')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">
                      Recuperar
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
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-200 rounded-[24px] focus:outline-none focus:border-blue-600 transition-all font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-lg transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  {view === 'login' && 'ENTRAR NO PAINEL'}
                  {view === 'signup' && 'CRIAR ACESSO LOCAL'}
                  {view === 'forgot-password' && 'SOLICITAR RESET'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
            <button
              onClick={() => {
                setView(view === 'login' ? 'signup' : 'login');
                setError(null);
                setSuccessMessage(null);
              }}
              className="w-full text-center text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              {view === 'login' ? 'Novo por aqui? Crie um acesso' : 'Já tem um acesso? Voltar'}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">OPCIONAL</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button
              onClick={onDemoMode}
              className="w-full py-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-emerald-100"
            >
              <PlayCircle className="w-4 h-4" />
              Acessar sem Cadastro (Visitante)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
