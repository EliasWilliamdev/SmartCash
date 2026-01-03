
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { 
  Trash2, 
  MapPin, 
  CreditCard, 
  MessageSquare, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Tag
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  return (
    <div className="space-y-6">
      {/* Controles do Histórico */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-600 placeholder:text-slate-400 transition-all"
          />
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filterType === type 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type === 'all' ? 'Tudo' : type === 'income' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase text-xs">Fluxo de Caixa Detalhado</h2>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">
              {filteredTransactions.length} registros
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            <div className="py-24 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold italic">Nenhuma movimentação encontrada com esses filtros.</p>
            </div>
          ) : (
            filteredTransactions.map((t) => (
              <div key={t.id} className="group hover:bg-slate-50/50 transition-all p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                {/* Ícone e Info Principal */}
                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                    t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {CATEGORY_ICONS[t.category] || <Tag className="w-6 h-6" />}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-slate-900 text-lg truncate leading-tight">
                        {t.description}
                      </h3>
                      {t.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                        {t.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </span>
                      {t.payment_method && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                          {t.payment_method}
                        </span>
                      )}
                      {t.location && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          {t.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags e Valor */}
                <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                  {t.tags && t.tags.length > 0 && (
                    <div className="hidden lg:flex gap-1.5">
                      {t.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-500 rounded-lg text-[9px] font-black uppercase">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-right">
                    <p className={`text-2xl font-black tracking-tight ${
                      t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'
                    }`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </p>
                    {t.notes && (
                      <div className="flex items-center justify-end gap-1.5 text-slate-300 group-hover:text-blue-400 transition-colors">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase">Nota</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onDelete(t.id)}
                    className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir registro"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
