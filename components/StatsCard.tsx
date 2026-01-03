
import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface StatsCardProps {
  title: string;
  amount: number;
  type: 'balance' | 'income' | 'expense';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, amount, type }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStyles = () => {
    switch (type) {
      case 'income': return { icon: <TrendingUp className="text-emerald-500" />, bg: 'bg-emerald-50', text: 'text-emerald-700' };
      case 'expense': return { icon: <TrendingDown className="text-rose-500" />, bg: 'bg-rose-50', text: 'text-rose-700' };
      default: return { icon: <Wallet className="text-blue-500" />, bg: 'bg-blue-50', text: 'text-blue-700' };
    }
  };

  const styles = getStyles();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${styles.bg}`}>
        {styles.icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className={`text-2xl font-bold ${styles.text}`}>
          {formatCurrency(amount)}
        </h3>
      </div>
    </div>
  );
};

export default StatsCard;
