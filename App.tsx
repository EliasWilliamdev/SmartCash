
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Transaction, FinancialStats } from './types.ts';
import StatsCard from './components/StatsCard.tsx';
import TransactionList from './components/TransactionList.tsx';
import AddTransactionPage from './components/AddTransactionPage.tsx';
import VisualCharts from './components/VisualCharts.tsx';
import AIInsightsSection from './components/AIInsightsSection.tsx';
import Auth from './components/Auth.tsx';
import { 
  Wallet, 
  LayoutDashboard, 
  Loader2, 
  RefreshCw, 
  PlusCircle, 
  Database,
  Plus,
  LogOut,
  Sparkles,
  Info
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase.ts';
import { INITIAL_TRANSACTIONS } from './constants.tsx';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-transaction'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth & Session Management
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
      return () => subscription.unsubscribe();
    }
  }, []);

  // Data Loading (Hybrid approach)
  const loadData = useCallback(async () => {
    setLoading(true);
    if (isSupabaseConfigured && session) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (!error && data) setTransactions(data as Transaction[]);
    } else {
      const local = localStorage.getItem('smartcash_data');
      if (local) {
        setTransactions(JSON.parse(local));
      } else {
        setTransactions(INITIAL_TRANSACTIONS as Transaction[]);
      }
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session || isDemoMode) loadData();
  }, [session, isDemoMode, loadData]);

  // Persistence for Offline Mode
  useEffect(() => {
    if (!isSupabaseConfigured || isDemoMode) {
      localStorage.setItem('smartcash_data', JSON.stringify(transactions));
    }
  }, [transactions, isDemoMode]);

  const stats = useMemo((): FinancialStats => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const breakdown = transactions.filter(t => t.type === 'expense').reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: income - expenses,
      categoryBreakdown: Object.entries(breakdown).map(([name, value]) => ({ name, value: value as number }))
    };
  }, [transactions]);

  const handleAddTransaction = async (newT: Omit<Transaction, 'id'>) => {
    if (isSupabaseConfigured && session) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...newT, user_id: session.user.id }])
        .select();
      if (!error && data) setTransactions(prev => [data[0] as Transaction, ...prev]);
    } else {
      const t: Transaction = { ...newT, id: crypto.randomUUID() };
      setTransactions(prev => [t, ...prev]);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (isSupabaseConfigured && session) {
      await supabase.from('transactions').delete().eq('id', id);
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  if (!session && !isDemoMode) return <Auth onDemoMode={() => setIsDemoMode(true)} />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900">
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-8 h-screen sticky top-0">
        <div className="flex items-center gap-4 mb-16">
          <div className="bg-blue-600 p-3 rounded-[20px] text-white shadow-xl shadow-blue-100"><Wallet className="w-6 h-6" /></div>
          <h1 className="text-2xl font-black tracking-tighter">SmartCash</h1>
        </div>

        <nav className="flex-1 space-y-3">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${currentView === 'dashboard' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutDashboard className="w-5 h-5" />Painel</button>
          <button onClick={() => setCurrentView('add-transaction')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${currentView === 'add-transaction' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}><Plus className="w-5 h-5" />Lançar</button>
        </nav>

        <div className="mt-auto bg-blue-50/50 p-6 rounded-[32px] border border-blue-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black">{isDemoMode ? 'V' : session.user.email?.[0].toUpperCase()}</div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{isDemoMode ? 'Visitante' : 'Pro'}</p>
              <p className="text-xs font-bold text-slate-700 truncate">{isDemoMode ? 'Modo Local' : session.user.email}</p>
            </div>
          </div>
          <button onClick={() => { setIsDemoMode(false); if (isSupabaseConfigured) supabase.auth.signOut(); }} className="w-full py-3 bg-white text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-rose-100 hover:bg-rose-50 transition-all"><LogOut className="w-4 h-4 inline mr-2" />Sair</button>
        </div>
      </aside>

      <main className="flex-1">
        {currentView === 'add-transaction' ? (
          <AddTransactionPage onBack={() => setCurrentView('dashboard')} onAdd={handleAddTransaction} />
        ) : (
          <div className="p-6 md:p-16 max-w-7xl mx-auto w-full">
            {!isSupabaseConfigured && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                <Info className="w-5 h-5" />
                Modo Offline Ativado: Seus dados estão sendo salvos apenas no navegador.
              </div>
            )}

            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
              <div>
                <h2 className="text-5xl font-black tracking-tighter mb-4 text-slate-900">Seu Fluxo.</h2>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    Sincronizado
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => loadData()} className="p-5 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> Atualizar
                </button>
                <button onClick={() => setCurrentView('add-transaction')} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3"><PlusCircle className="w-5 h-5" />Novo Lançamento</button>
              </div>
            </header>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-6" />
                <p className="font-black text-xs text-slate-400 uppercase tracking-widest">Preparando dados...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatsCard title="Saldo Consolidado" amount={stats.totalBalance} type="balance" />
                    <StatsCard title="Total Entradas" amount={stats.totalIncome} type="income" />
                    <StatsCard title="Total Saídas" amount={stats.totalExpenses} type="expense" />
                  </div>
                  <VisualCharts transactions={transactions} />
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Movimentações</h3>
                    <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
                  </div>
                </div>
                <div className="space-y-8">
                  <AIInsightsSection transactions={transactions} />
                  <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                    <Database className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
                    <h4 className="font-black text-lg mb-2">Segurança</h4>
                    <p className="text-slate-400 text-sm font-bold mb-6 italic">Seus dados financeiros não saem do seu controle.</p>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
