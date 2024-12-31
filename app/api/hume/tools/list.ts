import { HumeClient } from "hume";
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ListToolsParams {
  pageSize?: number;
  pageNumber?: number;
  name?: string;
  type?: "builtin" | "function";
}

interface ListToolVersionsParams {
  toolId: string;
  pageSize?: number;
  pageNumber?: number;
  restrictToMostRecent?: boolean;
}

export async function listTools({ pageSize = 10, pageNumber = 1, name, type }: ListToolsParams = {}) {
  let query = supabase
    .from('tools')
    .select('*');

  if (name) {
    query = query.ilike('name', `%${name}%`);
  }

  if (type) {
    query = query.eq('type', type);
  }

  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await query
    .range(start, end)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing tools:', error);
    throw error;
  }

  return {
    tools: data,
    total: count,
    pageSize,
    pageNumber
  };
}

export async function listToolVersions({ toolId, pageSize = 10, pageNumber = 1, restrictToMostRecent = false }: ListToolVersionsParams) {
  let query = supabase
    .from('tool_versions')
    .select('*')
    .eq('tool_id', toolId);

  if (restrictToMostRecent) {
    query = query.order('version', { ascending: false }).limit(1);
  } else {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end).order('version', { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error listing tool versions:', error);
    throw error;
  }

  return {
    versions: data,
    total: count,
    pageSize: restrictToMostRecent ? 1 : pageSize,
    pageNumber: restrictToMostRecent ? 1 : pageNumber
  };
}
