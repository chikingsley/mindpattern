import { HumeClient } from 'hume';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/types/supabase';

export async function getActivePrompt(userId: string, projectId: string = 'default') {
  // Get active resource
  const { data: active, error } = await supabase
    .from('active_resources')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();
    
  if (error) throw error;
  if (!active) throw new Error('No active prompt found');
  
  // Check cache
  const { data: cached } = await supabase
    .from('resource_cache')
    .select('*')
    .eq('id', `prompt:${active.prompt_id}:${active.prompt_version}`)
    .single();
    
  if (cached && new Date(cached.expires_at) > new Date()) {
    return cached.data;
  }
  
  // Fetch from Hume API
  const client = new HumeClient({ 
    apiKey: process.env.HUME_API_KEY || '' 
  });
  const prompt = await client.empathicVoice.prompts.getPromptVersion(
    active.prompt_id,
    active.prompt_version
  );
  
  // Cache the result
  const { error: cacheError } = await supabase
    .from('resource_cache')
    .upsert({
      id: `prompt:${active.prompt_id}:${active.prompt_version}`,
      data: prompt as unknown as Json,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    });
    
  if (cacheError) throw cacheError;
  
  return prompt;
}

export async function setActivePrompt(userId: string, promptId: string, version: number, projectId: string = 'default') {
  // Update active resources - history is handled by trigger
  const { error } = await supabase
    .from('active_resources')
    .upsert({
      user_id: userId,
      project_id: projectId,
      prompt_id: promptId,
      prompt_version: version,
      // Required fields if new record
      config_id: '',        // This should be set properly
      config_version: 0     // This should be set properly
    });
    
  if (error) throw error;
  
  // Clear cache
  const { error: clearError } = await supabase
    .from('resource_cache')
    .delete()
    .eq('id', `prompt:${promptId}:${version}`);
    
  if (clearError) throw clearError;
  
  return getActivePrompt(userId, projectId);
}
