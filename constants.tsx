
import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  History, 
  Lightbulb,
  Utensils,
  Home,
  Car,
  Palmtree,
  Stethoscope,
  GraduationCap,
  Package
} from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'
];

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  'Alimentação': <Utensils className="w-4 h-4" />,
  'Moradia': <Home className="w-4 h-4" />,
  'Transporte': <Car className="w-4 h-4" />,
  'Lazer': <Palmtree className="w-4 h-4" />,
  'Saúde': <Stethoscope className="w-4 h-4" />,
  'Educação': <GraduationCap className="w-4 h-4" />,
  'Outros': <Package className="w-4 h-4" />,
  'Renda': <Wallet className="w-4 h-4" />
};

export const INITIAL_TRANSACTIONS = [
  { id: '1', description: 'Salário Mensal', amount: 5000, date: '2024-05-05', category: 'Renda', type: 'income' },
  { id: '2', description: 'Aluguel', amount: 1500, date: '2024-05-10', category: 'Moradia', type: 'expense' },
  { id: '3', description: 'Supermercado', amount: 450.50, date: '2024-05-12', category: 'Alimentação', type: 'expense' },
  { id: '4', description: 'Combustível', amount: 200, date: '2024-05-15', category: 'Transporte', type: 'expense' },
  { id: '5', description: 'Restaurante Japa', amount: 120, date: '2024-05-18', category: 'Lazer', type: 'expense' },
];
