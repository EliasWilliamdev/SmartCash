
import React, { useState } from 'react';
import { Sparkles, RefreshCcw, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { AIInsight, Transaction } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface AIInsightsSectionProps {
  transactions: Transaction[];
}

const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({ transactions }) => {
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
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <h2 className="text-xl font-bold">Insights Inteligentes</h2>
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
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-white/60" />
          </div>
          <p className="text-blue-100 mb-4">Descubra como otimizar suas finanças com IA.</p>
          <button
            onClick={fetchInsights}
            disabled={transactions.length === 0}
            className="bg-white text-blue-600 font-bold px-6 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Gerar Análise
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
        {insights.map((insight, idx) => {
          const styles = getSeverityStyles(insight.severity);
          return (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${insight.severity === 'high' ? 'bg-rose-100 text-rose-600' : insight.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                  {insight.severity === 'high' ? <AlertCircle className="w-5 h-5" /> : insight.severity === 'medium' ? <TrendingUp className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-1">{insight.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">{insight.description}</p>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recomendação:</p>
                    <p className="text-sm font-medium text-slate-800">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Re-using icon
const Lightbulb: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);

export default AIInsightsSection;
