
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tkzmcplppnszliddrltq.supabase.co';
const supabaseAnonKey = 'sb_publishable_L4ZpZ50RtDa11zWcxZTvuw_TUwF6dLo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
