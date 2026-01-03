
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Transaction, FinancialStats } from './types';
import StatsCard from './components/StatsCard';
import TransactionList from './components/TransactionList';
import AddTransactionPage from './components/AddTransactionPage';
import VisualCharts from './components/VisualCharts';
import Auth from './components/Auth';
import { 
  Wallet, 
  LayoutDashboard, 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  Database,
  Plus,
  LogOut,
  User
} from 'lucide-react';
import { supabase } from './lib/supabase';

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
      console.error('Erro ao buscar transações:', error);
      setConnectionError(error.message || 'Erro de conexão');
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

    const payload = {
      description: newT.description,
      amount: newT.amount,
      date: newT.date,
      category: newT.category,
      type: newT.type,
      notes: newT.notes || null,
      location: newT.location || null,
      payment_method: newT.payment_method || null,
      tags: newT.tags && newT.tags.length > 0 ? newT.tags : null,
      user_id: session.user.id
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select();

    if (error) {
      console.error("Erro Supabase:", error);
      throw new Error(`${error.message}`);
    }

    if (data && data.length > 0) {
      setTransactions(prev => [data[0] as Transaction, ...prev]);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter">SmartCash</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('add-transaction')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              currentView === 'add-transaction' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <Plus className="w-5 h-5" />
            Lançamento
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-5 rounded-[32px] border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">
                {session.user.email?.[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conectado</p>
                <p className="text-xs font-bold text-slate-700 truncate">{session.user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {currentView === 'add-transaction' ? (
          <AddTransactionPage 
            onBack={() => setCurrentView('dashboard')} 
            onAdd={handleAddTransaction} 
          />
        ) : (
          <div className="p-4 md:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
            {connectionError && (
              <div className="mb-8 p-6 bg-rose-50 border-2 border-rose-200 rounded-3xl text-rose-900 shadow-xl flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                <div>
                  <p className="font-black text-lg">Erro de Sincronização</p>
                  <p className="font-medium text-sm opacity-80">{connectionError}</p>
                </div>
              </div>
            )}

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Seu Patrimônio</h1>
                <p className="text-slate-400 text-lg font-bold italic">Gestão profissional para suas finanças pessoais.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchTransactions(true)}
                  disabled={isSyncing}
                  className="p-4 text-slate-700 bg-white border border-slate-200 rounded-2xl transition-all shadow-sm flex items-center gap-2 px-8 font-black text-xs uppercase tracking-widest"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando' : 'Sincronizar'}
                </button>
                <button 
                  onClick={() => setCurrentView('add-transaction')}
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-blue-200 font-black text-xs uppercase tracking-[0.2em]"
                >
                  <PlusCircle className="w-5 h-5" />
                  Novo Registro
                </button>
              </div>
            </header>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                <Loader2 className="w-16 h-16 animate-spin mb-6 text-blue-600" />
                <p className="font-black text-sm uppercase tracking-widest">Recuperando registros seguros...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <StatsCard title="Disponível Agora" amount={stats.totalBalance} type="balance" />
                  <StatsCard title="Total em Entradas" amount={stats.totalIncome} type="income" />
                  <StatsCard title="Total em Saídas" amount={stats.totalExpenses} type="expense" />
                </div>

                {transactions.length === 0 ? (
                  <div className="bg-white rounded-[60px] p-24 border-4 border-dashed border-slate-100 text-center">
                    <Database className="w-16 h-16 text-blue-600 mx-auto mb-8" />
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Nenhum Registro Ainda</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-12 text-xl font-bold italic">
                      Seu banco de dados privado está pronto. Comece a registrar suas transações para gerar estatísticas.
                    </p>
                    <button 
                      onClick={() => setCurrentView('add-transaction')}
                      className="flex items-center gap-4 mx-auto bg-blue-600 text-white px-12 py-6 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-blue-200 uppercase tracking-widest"
                    >
                      <PlusCircle className="w-7 h-7" />
                      Criar Primeiro Registro
                    </button>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {/* Visual Analytics */}
                    <VisualCharts transactions={transactions} />

                    {/* Transaction History - Now taking full width for better legibility */}
                    <div className="w-full">
                      <TransactionList 
                        transactions={transactions} 
                        onDelete={handleDeleteTransaction} 
                      />
                    </div>
                  </div>
                )}
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
