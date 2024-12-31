import { HumeClient } from "hume";

export interface ToolSettings {
  parameters: string; // Stringified JSON schema
  versionDescription?: string;
  description?: string;
  fallbackContent?: string;
}

export async function createTool(name: string, settings: ToolSettings) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    const tool = await client.empathicVoice.tools.createTool({
      name,
      parameters: settings.parameters,
      versionDescription: settings.versionDescription,
      description: settings.description,
      fallbackContent: settings.fallbackContent
    });

    if (!tool) {
      throw new Error('Failed to create tool');
    }

    return {
      toolType: tool.toolType,
      id: tool.id,
      version: tool.version,
      versionType: tool.versionType,
      name: tool.name,
      createdOn: tool.createdOn,
      modifiedOn: tool.modifiedOn,
      parameters: tool.parameters,
      versionDescription: tool.versionDescription,
      fallbackContent: tool.fallbackContent,
      description: tool.description
    };

  } catch (error) {
    console.error('Error creating tool:', error);
    throw error;
  }
}
