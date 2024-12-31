import { createClient } from '@supabase/supabase-js';
import { HumeClient } from 'hume';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getActiveConfig(userId: string, projectId: string) {
  const { data, error } = await supabase
    .from('active_configs')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();

  if (error) {
    console.error('Error fetching active config:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY || '' });
  const config = await client.empathicVoice.configs.getConfigVersion(data.config_id, data.version);
  return config;
}

export async function setActiveConfig(userId: string, configId: string, version: number, projectId: string) {
  const { error } = await supabase
    .from('active_configs')
    .upsert({
      user_id: userId,
      project_id: projectId,
      config_id: configId,
      version: version
    });

  if (error) {
    console.error('Error setting active config:', error);
    throw error;
  }

  return getActiveConfig(userId, projectId);
}
