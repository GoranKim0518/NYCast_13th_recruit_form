import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다.',
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isSupabaseConfigured() {
  return isConfigured;
}

export async function submitApplication(data) {
  if (!supabase) {
    throw new Error(
      'Supabase가 설정되지 않았습니다. 관리자에게 문의해 주세요.',
    );
  }

  const { error } = await supabase.from('applications').insert([data]);

  if (error) {
    throw new Error(error.message);
  }
}
