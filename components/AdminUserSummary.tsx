
import React from 'react';
import { UserSummary } from '../types';
import { Users, ArrowUpRight, ShoppingBag, Calendar } from 'lucide-react';

interface AdminUserSummaryProps {
  summaries: UserSummary[];
}

const AdminUserSummary: React.FC<AdminUserSummaryProps> = ({ summaries }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="bg-white rounded-[40px] border-2 border-indigo-50 shadow-sm overflow-hidden mb-12">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-50/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ranking de Utilização</h3>
            <p className="text-xs font-bold text-slate-400">Fluxo de gastos acumulado por usuário</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador / E-mail</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Movimentações</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Desembolsado</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {summaries.sort((a,b) => b.totalSpent - a.totalSpent).map((user) => (
              <tr key={user.email} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600">
                      {user.email[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-700">{user.email}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-sm font-black text-slate-700">{user.transactionCount}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="text-lg font-black text-indigo-600">{formatCurrency(user.totalSpent)}</span>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Última Compra</span>
                      <span className="text-xs font-bold text-slate-600">{new Date(user.lastActivity).toLocaleDateString('pt-BR')}</span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserSummary;
