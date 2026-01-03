
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  return (window as any).process?.env?.[key] || '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

// Se não estiver configurado, usamos um cliente dummy que não fará chamadas reais
export const supabase = createClient(
  supabaseUrl || 'https://tmp.supabase.co',
  supabaseAnonKey || 'tmp-key'
);
