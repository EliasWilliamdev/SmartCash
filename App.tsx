
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
  AlertTriangle, 
  PlusCircle, 
  Database,
  Plus,
  LogOut,
  Sparkles
} from 'lucide-react';
import { supabase } from './lib/supabase.ts';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTransactions = useCallback(async (isManual = false) => {
    if (!session) return;
    if (isManual) setIsSyncing(true);
    setConnectionError(null);
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data as Transaction[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      if (isManual) setConnectionError('Não foi possível conectar ao banco. Verifique suas credenciais.');
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session, fetchTransactions]);

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
    if (!session) return;
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...newT, user_id: session.user.id }])
      .select();
    if (error) throw error;
    if (data) setTransactions(prev => [data[0] as Transaction, ...prev]);
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      alert("Falha ao remover registro.");
      return;
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-8 h-screen sticky top-0">
        <div className="flex items-center gap-4 mb-16">
          <div className="bg-blue-600 p-3 rounded-[20px] text-white shadow-xl shadow-blue-100">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter">SmartCash</h1>
        </div>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
              currentView === 'dashboard' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <LayoutDashboard className="w-5 h-5" />
              Resumo
            </div>
          </button>
          <button 
            onClick={() => setCurrentView('add-transaction')}
            className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
              currentView === 'add-transaction' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <Plus className="w-5 h-5" />
              Lançamento
            </div>
          </button>
        </nav>

        <div className="mt-auto">
          <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                {session.user.email?.[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Ativo</p>
                <p className="text-xs font-bold text-slate-700 truncate">{session.user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-blue-100 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="flex-1">
        {currentView === 'add-transaction' ? (
          <AddTransactionPage onBack={() => setCurrentView('dashboard')} onAdd={handleAddTransaction} />
        ) : (
          <div className="p-6 md:p-16 max-w-7xl mx-auto w-full">
            {connectionError && (
              <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-[32px] text-rose-600 flex items-center gap-4 animate-in fade-in">
                <AlertTriangle className="w-6 h-6" />
                <p className="font-black text-sm uppercase tracking-widest">{connectionError}</p>
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
                <button
                  onClick={() => fetchTransactions(true)}
                  disabled={isSyncing}
                  className="p-5 text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3 font-black text-[10px] uppercase tracking-widest"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando' : 'Sincronizar'}
                </button>
                <button 
                  onClick={() => setCurrentView('add-transaction')}
                  className="flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl hover:scale-[1.02] transition-all shadow-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  <PlusCircle className="w-5 h-5" />
                  Novo Lançamento
                </button>
              </div>
            </header>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-6" />
                <p className="font-black text-xs text-slate-400 uppercase tracking-[0.3em]">Preparando sua visão...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Column: Left & Middle (Main Data) */}
                <div className="lg:col-span-2 space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatsCard title="Saldo Consolidado" amount={stats.totalBalance} type="balance" />
                    <StatsCard title="Total Entradas" amount={stats.totalIncome} type="income" />
                    <StatsCard title="Total Saídas" amount={stats.totalExpenses} type="expense" />
                  </div>
                  
                  <div className="bg-white p-2 rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <VisualCharts transactions={transactions} />
                  </div>
                  
                  <div className="w-full">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 ml-2">Movimentações Recentes</h3>
                    <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
                  </div>
                </div>

                {/* Column: Right (Insights & Tips) */}
                <div className="space-y-8">
                  <div className="sticky top-16 space-y-8">
                    <AIInsightsSection transactions={transactions} />
                    
                    <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden group">
                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-amber-100 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                          </div>
                          <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Educação Financeira</h4>
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                          "O controle rigoroso de pequenas despesas é o segredo para grandes economias a longo prazo."
                        </p>
                      </div>
                      <div className="h-2 bg-gradient-to-r from-amber-200 to-amber-500"></div>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                      <Database className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                      <h4 className="font-black text-lg mb-4 tracking-tighter">Backup Automático</h4>
                      <p className="text-slate-400 text-sm font-bold mb-6">Seus dados estão protegidos por criptografia ponta a ponta no banco Postgres.</p>
                      <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Servidor Online
                      </div>
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

type View = 'dashboard' | 'add-transaction';

export default App;
