
import { createClient } from '@supabase/supabase-js';

// Safe environment variable access that works even if process.env is not natively available
const getEnv = (key: string): string => {
  try {
    // Check standard process.env (usually available via build tool or our shim)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
    // Fallback to global shim check
    if (typeof window !== 'undefined' && (window as any).process?.env?.[key]) {
      return (window as any).process.env[key];
    }
  } catch (e) {
    console.warn(`Error accessing env variable ${key}:`, e);
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Provide placeholders to allow JS execution to continue even without valid keys
const finalUrl = supabaseUrl || 'https://placeholder-project.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("SmartCash: Supabase keys not found in environment. Database connectivity will be inactive.");
}

export const supabase = createClient(finalUrl, finalKey);
