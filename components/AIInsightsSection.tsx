
import React, { useState } from 'react';
import { Sparkles, RefreshCcw, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { AIInsight, Transaction } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface AIInsightsSectionProps {
  transactions: Transaction[];
  isAdminMode?: boolean;
}

const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({ transactions, isAdminMode }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    const data = await getFinancialInsights(transactions);
    setInsights(data);
    setIsLoading(false);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-rose-50 border-rose-100 text-rose-700 icon-rose-500';
      case 'medium': return 'bg-amber-50 border-amber-100 text-amber-700 icon-amber-500';
      default: return 'bg-blue-50 border-blue-100 text-blue-700 icon-blue-500';
    }
  };

  return (
    <div className={`p-6 rounded-2xl text-white shadow-xl transition-all duration-500 ${isAdminMode ? 'bg-gradient-to-br from-indigo-700 to-purple-800 shadow-indigo-200' : 'bg-gradient-to-br from-indigo-600 to-blue-700 shadow-blue-200'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <h2 className="text-xl font-bold">{isAdminMode ? 'Análise do Sistema' : 'Insights IA'}</h2>
        </div>
        <button
          onClick={fetchInsights}
          disabled={isLoading || transactions.length === 0}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {insights.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-blue-100 mb-4 text-sm font-bold uppercase tracking-widest">{isAdminMode ? 'Auditoria Inteligente de Rede' : 'Descubra como otimizar suas finanças.'}</p>
          <button
            onClick={fetchInsights}
            disabled={transactions.length === 0}
            className="bg-white text-indigo-600 font-black px-6 py-2 rounded-xl hover:bg-blue-50 transition-colors text-[10px] uppercase tracking-widest"
          >
            Gerar Diagnóstico
          </button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white/10 h-24 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex gap-3">
              <div className={`p-2 rounded-lg ${insight.severity === 'high' ? 'bg-rose-100 text-rose-600' : insight.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {insight.severity === 'high' ? <AlertCircle className="w-5 h-5" /> : insight.severity === 'medium' ? <TrendingUp className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tight">{insight.title}</h3>
                <p className="text-xs text-slate-500 mb-2 leading-relaxed">{insight.description}</p>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ação Sugerida:</p>
                  <p className="text-xs font-bold text-slate-800">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsightsSection;
