import { HumeClient } from "hume";
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface HumeToolSettings {
  type: "builtin" | "function";
  name: string;
  parameters: string;
  description?: string;
  fallback_content?: string;
}

export async function createHumeTool(settings: HumeToolSettings) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  try {
    // Create tool in database
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .insert({
        type: settings.type,
        name: settings.name,
        parameters: settings.parameters,
        description: settings.description,
        fallback_content: settings.fallback_content
      })
      .select()
      .single();

    if (toolError) {
      throw toolError;
    }

    // Create initial version
    const { error: versionError } = await supabase
      .from('tool_versions')
      .insert({
        tool_id: tool.id,
        version: 1,
        type: settings.type,
        name: settings.name,
        parameters: settings.parameters,
        description: settings.description,
        fallback_content: settings.fallback_content
      });

    if (versionError) {
      throw versionError;
    }

    return {
      id: tool.id,
      type: tool.type,
      name: tool.name,
      parameters: tool.parameters,
      description: tool.description,
      fallback_content: tool.fallback_content
    };

  } catch (error) {
    console.error('Error creating Hume tool:', error);
    throw error;
  }
}
