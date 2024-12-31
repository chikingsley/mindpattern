import { HumeClient } from 'hume';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getActivePrompt(userId: string, projectId?: string) {
  // Get active resource from Supabase
  const { data: active, error } = await supabase
    .from('active_resources')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId || 'default')
    .single();
    
  if (error) throw error;
  if (!active) throw new Error('No active prompt found');
  
  // Check cache
  const { data: cached, error: cacheError } = await supabase
    .from('resource_cache')
    .select('*')
    .eq('id', `prompt:${active.prompt_id}:${active.prompt_version}`)
    .single();
    
  if (!cacheError && cached && new Date(cached.expires_at) > new Date()) {
    return cached.data;
  }
  
  // Fetch from Hume API
  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  const prompt = await client.empathicVoice.prompts.getPromptVersion(
    active.prompt_id,
    active.prompt_version
  );
  
  // Cache the result
  const { error: upsertError } = await supabase
    .from('resource_cache')
    .upsert({
      id: `prompt:${active.prompt_id}:${active.prompt_version}`,
      resource_type: 'prompt',
      resource_id: active.prompt_id,
      version: active.prompt_version,
      data: prompt,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });
    
  if (upsertError) throw upsertError;
  
  return prompt;
}

export async function setActivePrompt(userId: string, promptId: string, version: number, projectId?: string) {
  // Update active resources
  const { error } = await supabase
    .from('active_resources')
    .upsert({
      user_id: userId,
      project_id: projectId || 'default',
      prompt_id: promptId,
      prompt_version: version,
      // Required fields for new records
      config_id: '',        // This should be set properly
      config_version: 0     // This should be set properly
    });
    
  if (error) throw error;
  
  // Clear cache
  const { error: clearError } = await supabase
    .from('resource_cache')
    .delete()
    .eq('resource_type', 'prompt')
    .eq('resource_id', promptId);
    
  if (clearError) throw clearError;
  
  return getActivePrompt(userId, projectId);
}
