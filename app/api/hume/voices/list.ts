import { HumeClient } from "hume";
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ListVoicesParams {
  pageSize?: number;
  pageNumber?: number;
  name?: string;
  provider?: "HUME_AI" | "CUSTOM_VOICE";
  base_voice?: "ITO" | "KORA" | "DACHER" | "AURA" | "FINN" | "WHIMSY" | "STELLA" | "SUNNY";
}

interface ListVoiceVersionsParams {
  voiceId: string;
  pageSize?: number;
  pageNumber?: number;
  restrictToMostRecent?: boolean;
}

export async function listVoices({ pageSize = 10, pageNumber = 1, name, provider, base_voice }: ListVoicesParams = {}) {
  let query = supabase
    .from('voices')
    .select('*');

  if (name) {
    query = query.ilike('name', `%${name}%`);
  }

  if (provider) {
    query = query.eq('provider', provider);
  }

  if (base_voice) {
    query = query.eq('base_voice', base_voice);
  }

  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await query
    .range(start, end)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing voices:', error);
    throw error;
  }

  return {
    voices: data,
    total: count,
    pageSize,
    pageNumber
  };
}

export async function listVoiceVersions({ voiceId, pageSize = 10, pageNumber = 1, restrictToMostRecent = false }: ListVoiceVersionsParams) {
  let query = supabase
    .from('voice_versions')
    .select('*')
    .eq('voice_id', voiceId);

  if (restrictToMostRecent) {
    query = query.order('version', { ascending: false }).limit(1);
  } else {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end).order('version', { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error listing voice versions:', error);
    throw error;
  }

  return {
    versions: data,
    total: count,
    pageSize: restrictToMostRecent ? 1 : pageSize,
    pageNumber: restrictToMostRecent ? 1 : pageNumber
  };
}
