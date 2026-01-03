
export type Category = 'Alimentação' | 'Moradia' | 'Transporte' | 'Lazer' | 'Saúde' | 'Educação' | 'Outros' | 'Renda';

export interface Transaction {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  date: string;
  category: Category;
  type: 'income' | 'expense';
  notes?: string;
  tags?: string[];
  location?: string;
  payment_method?: string;
}

export interface FinancialStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  categoryBreakdown: { name: string; value: number }[];
}

export interface AIInsight {
  title: string;
  description: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
}
