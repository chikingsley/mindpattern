import { HumeClient } from 'hume';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = [
  'HUME_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const;

async function testToolsAndVoices() {
  // Validate environment variables
  const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  const hume = new HumeClient(process.env.HUME_API_KEY!);
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    console.log('Testing resource cache...');

    // Create a test tool in Hume
    const evClient = await hume.connect('empathic-voice');
    const tool = await evClient.tools.create({
      type: 'function',
      name: 'test_tool',
      parameters: {
        param1: 'string',
        param2: 'number'
      },
      description: 'A test tool'
    });
    console.log('Created tool in Hume:', tool);

    // Cache the tool response
    const { data: cachedTool, error: cacheError } = await supabase
      .from('resource_cache')
      .insert({
        id: `tool:${tool.id}:${tool.version}`,
        resource_type: 'tool',
        resource_id: tool.id,
        version: tool.version,
        data: tool,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      })
      .select()
      .single();

    if (cacheError) throw cacheError;
    console.log('Cached tool:', cachedTool);

    // Create active resources for a test user
    const { data: activeResource, error: activeError } = await supabase
      .from('active_resources')
      .insert({
        config_id: 'default',
        config_version: 1,
        prompt_id: 'default',
        prompt_version: 1
      })
      .select()
      .single();

    if (activeError) throw activeError;
    console.log('Created active resource:', activeResource);

    // Add the tool to active tools
    const { data: activeTool, error: activeToolError } = await supabase
      .from('active_tools')
      .insert({
        active_resource_id: activeResource.id,
        tool_id: tool.id,
        tool_version: tool.version
      })
      .select()
      .single();

    if (activeToolError) throw activeToolError;
    console.log('Added active tool:', activeTool);

    // Test retrieving from cache
    const { data: cached, error: retrieveError } = await supabase
      .from('resource_cache')
      .select()
      .eq('resource_type', 'tool')
      .eq('resource_id', tool.id)
      .eq('version', tool.version)
      .single();

    if (retrieveError) throw retrieveError;
    console.log('Retrieved from cache:', cached);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testToolsAndVoices();
