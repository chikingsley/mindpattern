import { HumeClient } from "hume";
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface HumeToolSettings {
  type?: "builtin" | "function";
  name?: string;
  parameters?: string;
  description?: string;
  fallback_content?: string;
}

export async function updateHumeTool(toolId: string, settings: HumeToolSettings) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  try {
    // Get current tool data
    const { data: currentTool, error: getError } = await supabase
      .from('tools')
      .select()
      .eq('id', toolId)
      .single();

    if (getError) {
      throw getError;
    }

    if (!currentTool) {
      throw new Error('Tool not found');
    }

    // Update tool in database
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .update({
        type: settings.type || currentTool.type,
        name: settings.name || currentTool.name,
        parameters: settings.parameters || currentTool.parameters,
        description: settings.description || currentTool.description,
        fallback_content: settings.fallback_content || currentTool.fallback_content
      })
      .eq('id', toolId)
      .select()
      .single();

    if (toolError) {
      throw toolError;
    }

    // Get latest version number
    const { data: versions, error: versionsError } = await supabase
      .from('tool_versions')
      .select('version')
      .eq('tool_id', toolId)
      .order('version', { ascending: false })
      .limit(1);

    if (versionsError) {
      throw versionsError;
    }

    const nextVersion = versions && versions.length > 0 ? versions[0].version + 1 : 1;

    // Create new version
    const { error: versionError } = await supabase
      .from('tool_versions')
      .insert({
        tool_id: toolId,
        version: nextVersion,
        type: tool.type,
        name: tool.name,
        parameters: tool.parameters,
        description: tool.description,
        fallback_content: tool.fallback_content
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
    console.error('Error updating Hume tool:', error);
    throw error;
  }
}
