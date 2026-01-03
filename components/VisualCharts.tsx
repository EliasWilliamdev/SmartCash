
import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Transaction } from '../types';
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';

interface VisualChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const VisualCharts: React.FC<VisualChartsProps> = ({ transactions }) => {
  // Dados para o Gráfico de Rosca (Categorias de Despesa)
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const grouped = expenses.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      // Fixed: Added explicit types for 'a' and 'b' to resolve arithmetic operation errors
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value);
  }, [transactions]);

  // Dados para o Gráfico de Barras (Fluxo de Caixa)
  const flowData = useMemo(() => {
    // Definindo interface interna para os itens do fluxo
    interface FlowItem { date: string; income: number; expense: number; }
    
    // Agrupa por data (últimos 7 dias ou dias com movimentação no mês)
    const grouped = transactions.reduce((acc: Record<string, FlowItem>, t) => {
      const dateKey = new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, income: 0, expense: 0 };
      
      if (t.type === 'income') acc[dateKey].income += t.amount;
      else acc[dateKey].expense += t.amount;
      
      return acc;
    }, {} as Record<string, FlowItem>);

    // Fixed: Explicitly cast Object.values to FlowItem[] and typed sort parameters to fix 'unknown' type errors
    return (Object.values(grouped) as FlowItem[]).sort((a: FlowItem, b: FlowItem) => {
      const [d1, m1] = a.date.split('/');
      const [d2, m2] = b.date.split('/');
      return new Date(2024, parseInt(m1)-1, parseInt(d1)).getTime() - new Date(2024, parseInt(m2)-1, parseInt(d2)).getTime();
    }).slice(-7); // Mostra os últimos 7 dias com movimentação
  }, [transactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 font-bold text-xs uppercase tracking-widest">
          <p className="mb-2 text-slate-400">{payload[0].name || payload[0].payload.date}</p>
          <p className="text-lg">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
      {/* Gráfico de Categorias */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-[450px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <PieIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Onde você gasta</h3>
            <p className="text-slate-400 text-xs font-bold">Distribuição por categoria</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legenda Lateral customizada */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-3 max-h-full overflow-y-auto pr-2 hidden sm:block">
            {categoryData.slice(0, 5).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate w-24">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico de Fluxo de Caixa */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-[450px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-50 rounded-2xl">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Fluxo de Caixa</h3>
            <p className="text-slate-400 text-xs font-bold">Últimos 7 dias movimentados</p>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar 
                dataKey="income" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                barSize={20} 
                name="Entradas"
              />
              <Bar 
                dataKey="expense" 
                fill="#ef4444" 
                radius={[6, 6, 0, 0]} 
                barSize={20} 
                name="Saídas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VisualCharts;
