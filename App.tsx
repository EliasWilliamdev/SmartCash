
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Transaction, FinancialStats, UserSummary } from './types.ts';
import StatsCard from './components/StatsCard.tsx';
import TransactionList from './components/TransactionList.tsx';
import AddTransactionPage from './components/AddTransactionPage.tsx';
import VisualCharts from './components/VisualCharts.tsx';
import AIInsightsSection from './components/AIInsightsSection.tsx';
import AdminUserSummary from './components/AdminUserSummary.tsx';
import Auth from './components/Auth.tsx';
import { 
  Wallet, 
  LayoutDashboard, 
  Loader2, 
  RefreshCw, 
  Plus,
  LogOut,
  ShieldCheck,
  Eye,
  X,
  Activity,
  Users
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase.ts';
import { INITIAL_TRANSACTIONS } from './constants.tsx';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15);
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminError, setAdminError] = useState(false);
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-transaction'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (initialSession) setSession(initialSession);
          supabase.auth.onAuthStateChange((_event, session) => setSession(session));
        } catch (e) { console.error(e); }
      }
      const local = localStorage.getItem('smartcash_local_session');
      if (local && !session) setSession(JSON.parse(local));
    };
    initAuth();
  }, [session]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setIsSyncing(true);
    try {
      if (isSupabaseConfigured && (session || isAdminMode)) {
        let query = supabase.from('transactions').select('*');
        if (!isAdminMode && session?.user?.id) query = query.eq('user_id', session.user.id);
        const { data, error } = await query.order('date', { ascending: false });
        if (!error && data) setTransactions(data as Transaction[]);
      } else {
        const local = localStorage.getItem('smartcash_data');
        let allTransactions = local ? JSON.parse(local) : INITIAL_TRANSACTIONS;
        if (session?.user?.email && !isAdminMode) {
          setTransactions(allTransactions.filter((t: any) => t.user_email === session.user.email || !t.user_email));
        } else {
          setTransactions(allTransactions);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); setIsSyncing(false); }
  }, [session, isAdminMode]);

  useEffect(() => {
    if (session || isDemoMode || isAdminMode) loadData();
  }, [session, isDemoMode, isAdminMode, loadData]);

  const stats = useMemo((): FinancialStats => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const users = new Set(transactions.map(t => t.user_email || 'visitante')).size;
    
    const breakdown = transactions.filter(t => t.type === 'expense').reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: income - expenses,
      userCount: users,
      categoryBreakdown: Object.entries(breakdown).map(([name, value]) => ({ name, value: value as number }))
    };
  }, [transactions]);

  const userSummaries = useMemo((): UserSummary[] => {
    const summaryMap: Record<string, UserSummary> = {};
    transactions.forEach(t => {
      const email = t.user_email || 'Anônimo/Visitante';
      if (!summaryMap[email]) {
        summaryMap[email] = { email, totalSpent: 0, transactionCount: 0, lastActivity: t.date };
      }
      if (t.type === 'expense') {
        summaryMap[email].totalSpent += t.amount;
        summaryMap[email].transactionCount += 1;
      }
      if (new Date(t.date) > new Date(summaryMap[email].lastActivity)) {
        summaryMap[email].lastActivity = t.date;
      }
    });
    return Object.values(summaryMap);
  }, [transactions]);

  const handleLogout = () => {
    setIsDemoMode(false);
    setIsAdminMode(false);
    setSession(null);
    localStorage.removeItem('smartcash_local_session');
    if (isSupabaseConfigured) supabase.auth.signOut();
  };

  const handleAdminLogin = () => {
    const key = adminKey.trim().toUpperCase();
    if (!isSupabaseConfigured || key === 'ADMIN123') {
      setIsAdminMode(true);
      setShowAdminModal(false);
      setAdminError(false);
      setAdminKey('');
    } else {
      setAdminError(true);
      setTimeout(() => setAdminError(false), 2000);
    }
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const transactionWithId: Transaction = {
      ...newTx,
      id: generateId(),
      user_id: session?.user?.id,
      user_email: session?.user?.email,
    };

    if (isSupabaseConfigured && (session || isAdminMode)) {
      const { error } = await supabase.from('transactions').insert([transactionWithId]);
      if (error) throw error;
    } else {
      const local = localStorage.getItem('smartcash_data');
      const allTransactions = local ? JSON.parse(local) : INITIAL_TRANSACTIONS;
      const updated = [transactionWithId, ...allTransactions];
      localStorage.setItem('smartcash_data', JSON.stringify(updated));
    }
    
    setTransactions(prev => [transactionWithId, ...prev]);
  };

  if (!session && !isDemoMode && !isAdminMode) {
    return <Auth onDemoMode={() => setIsDemoMode(true)} onLogin={(s) => setSession(s)} />;
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row text-slate-900 transition-all duration-700 ${isAdminMode ? 'bg-[#f1f5f9]' : 'bg-[#f8fafc]'}`}>
      <aside className={`hidden md:flex flex-col w-72 bg-white border-r p-8 h-screen sticky top-0 transition-all ${isAdminMode ? 'border-indigo-100' : 'border-slate-200'}`}>
        <div className="flex items-center gap-4 mb-16">
          <div className={`p-3 rounded-[20px] text-white shadow-xl transition-all ${isAdminMode ? 'bg-indigo-600 shadow-indigo-100 rotate-12' : 'bg-blue-600 shadow-blue-100'}`}>
            {isAdminMode ? <ShieldCheck className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-black tracking-tighter">SmartCash</h1>
        </div>

        <nav className="flex-1 space-y-3">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${currentView === 'dashboard' ? (isAdminMode ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-900 shadow-slate-200') + ' text-white shadow-2xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard className="w-5 h-5" /> Painel
          </button>
          {!isAdminMode && (
            <button onClick={() => setCurrentView('add-transaction')} className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-400 hover:bg-slate-50">
              <Plus className="w-5 h-5" /> Lançar
            </button>
          )}
        </nav>

        <div className="mt-auto space-y-4">
          <button onClick={() => isAdminMode ? setIsAdminMode(false) : setShowAdminModal(true)} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${isAdminMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>
            <div className="flex items-center gap-3"><Eye className="w-4 h-4" /> {isAdminMode ? 'Visão Usuário' : 'Painel Mestre'}</div>
          </button>
          <div className={`p-6 rounded-[32px] border transition-all ${isAdminMode ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-blue-50/50 border-blue-100'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${isAdminMode ? 'bg-white text-indigo-600' : 'bg-blue-600 text-white'}`}>
                {isAdminMode ? 'ADM' : (isDemoMode ? 'V' : session?.user?.email?.[0]?.toUpperCase() || 'U')}
              </div>
              <div className="overflow-hidden">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isAdminMode ? 'text-indigo-200' : 'text-blue-600'}`}>{isAdminMode ? 'Super' : 'Pro'}</p>
                <p className={`text-xs font-bold truncate ${isAdminMode ? 'text-white' : 'text-slate-700'}`}>{isAdminMode ? 'Admin Mestre' : (isDemoMode ? 'Visitante' : session?.user?.email || 'Usuário')}</p>
              </div>
            </div>
            <button onClick={handleLogout} className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${isAdminMode ? 'bg-indigo-700 border-indigo-500 text-white' : 'bg-white text-rose-500 border-rose-100'}`}><LogOut className="w-4 h-4 inline mr-2" />Sair</button>
          </div>
        </div>
      </aside>

      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6" onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}>
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10">
            <div className="flex justify-between items-center mb-8">
              <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><ShieldCheck className="w-8 h-8" /></div>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-8">Autenticação Mestre</h3>
            <div className="space-y-6">
              <input type="password" autoFocus value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Chave de Acesso" className={`w-full px-8 py-5 bg-slate-50 border-2 rounded-[24px] focus:outline-none font-black ${adminError ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-indigo-600'}`} />
              <button onClick={handleAdminLogin} className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black shadow-lg">ENTRAR</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {currentView === 'add-transaction' ? (
          <AddTransactionPage onBack={() => setCurrentView('dashboard')} onAdd={handleAddTransaction} />
        ) : (
          <div className="p-6 md:p-16 max-w-7xl mx-auto w-full">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
              <div>
                <h2 className={`text-6xl font-black tracking-tighter mb-4 transition-colors ${isAdminMode ? 'text-indigo-900' : 'text-slate-900'}`}>
                  {isAdminMode ? 'Monitor Global.' : 'Seu Fluxo.'}
                </h2>
                <div className="flex items-center gap-4">
                  <span className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isAdminMode ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    <Activity className="w-3.5 h-3.5" /> {isAdminMode ? `Modo Auditoria (${stats.userCount} usuários)` : 'Sincronizado'}
                  </span>
                </div>
              </div>
              <button onClick={() => loadData()} className="p-5 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm">
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar Rede
              </button>
            </header>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40"><Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-6" /></div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard title={isAdminMode ? "Volume Total Rede" : "Saldo Consolidado"} amount={isAdminMode ? stats.totalExpenses + stats.totalIncome : stats.totalBalance} type="balance" />
                  <StatsCard title="Entradas Globais" amount={stats.totalIncome} type="income" />
                  <StatsCard title="Saídas Globais" amount={stats.totalExpenses} type="expense" />
                  <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 flex items-center gap-4 text-white">
                    <div className="p-3 bg-white/10 rounded-xl"><Users className="w-6 h-6" /></div>
                    <div><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Usuários Ativos</p><h3 className="text-3xl font-black">{stats.userCount}</h3></div>
                  </div>
                </div>

                {isAdminMode && <AdminUserSummary summaries={userSummaries} />}
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                  <div className="xl:col-span-2 space-y-12">
                    <VisualCharts transactions={transactions} />
                    <TransactionList transactions={transactions} onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} isAdminView={isAdminMode} />
                  </div>
                  <div className="space-y-8">
                    <AIInsightsSection transactions={transactions} isAdminMode={isAdminMode} />
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
