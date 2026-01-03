
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { 
  Trash2, 
  MapPin, 
  CreditCard, 
  MessageSquare, 
  Search, 
  Tag, 
  Clock,
  User
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isAdminView?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, isAdminView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const groupedTransactions = useMemo(() => {
    const filtered = transactions.filter(t => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = t.description.toLowerCase().includes(search) ||
                          t.category.toLowerCase().includes(search) ||
                          (t.user_email?.toLowerCase().includes(search));
      const matchesFilter = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const groups: Record<string, { transactions: Transaction[], dailyTotal: number }> = {};

    filtered.forEach(t => {
      const dateKey = t.date;
      if (!groups[dateKey]) {
        groups[dateKey] = { transactions: [], dailyTotal: 0 };
      }
      groups[dateKey].transactions.push(t);
      groups[dateKey].dailyTotal += (t.type === 'income' ? t.amount : -t.amount);
    });

    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [transactions, searchTerm, filterType]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder={isAdminView ? "Buscar por usuário ou descrição..." : "O que você procura?"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-[20px] outline-none font-bold text-slate-700 placeholder:text-slate-400 transition-all shadow-inner"
          />
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-[20px] w-full lg:w-auto">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                filterType === type 
                ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type === 'all' ? 'Ver Tudo' : type === 'income' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {groupedTransactions.length === 0 ? (
          <div className="bg-white rounded-[40px] py-32 text-center border border-slate-100 shadow-sm">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">Sem movimentações</h3>
            <p className="text-slate-400 font-bold">Nenhum registro encontrado para este filtro.</p>
          </div>
        ) : (
          groupedTransactions.map(([date, data]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-6 rounded-full ${isAdminView ? 'bg-indigo-600' : 'bg-blue-600'}`}></div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{formatDateLabel(date)}</h3>
                </div>
                <div className={`text-[11px] font-black px-3 py-1 rounded-lg ${data.dailyTotal >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {isAdminView ? 'FLUXO TOTAL: ' : 'SALDO DO DIA: '} {formatCurrency(data.dailyTotal)}
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {data.transactions.map((t) => (
                  <div key={t.id} className="group hover:bg-slate-50 transition-all p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-6 flex-1">
                      <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 shadow-sm ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        <div className="scale-150">{CATEGORY_ICONS[t.category] || <Tag className="w-4 h-4" />}</div>
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-black text-slate-900 text-xl truncate tracking-tight">{t.description}</h4>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {t.category}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
                          {isAdminView && (
                            <span className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-wider">
                              <User className="w-3 h-3" />
                              {t.user_email || 'Anônimo'}
                            </span>
                          )}
                          {t.payment_method && (
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                              <CreditCard className="w-3.5 h-3.5 text-blue-500" /> {t.payment_method}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto">
                      <div className="text-right">
                        <p className={`text-2xl font-black tracking-tighter ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </p>
                      </div>

                      <button onClick={() => onDelete(t.id)} className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-[18px] transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;
