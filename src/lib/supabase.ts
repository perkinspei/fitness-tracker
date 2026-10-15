import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * 是否启用了云端 (Supabase)。
 * 没配环境变量时，整个应用自动降级为本地 localStorage 模式，
 * 这样不接云也能立刻打开使用。
 */
export const isCloudEnabled = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isCloudEnabled) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string);
  }
  return client;
}
