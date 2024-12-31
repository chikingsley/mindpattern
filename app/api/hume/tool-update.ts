import { HumeClient } from "hume";
import { ToolSettings } from "./tool-new";

export async function updateTool(toolId: string, settings: ToolSettings) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    const tool = await client.empathicVoice.tools.createToolVersion(
      toolId,
      {
        parameters: settings.parameters,
        versionDescription: settings.versionDescription,
        description: settings.description,
        fallbackContent: settings.fallbackContent
      }
    );

    if (!tool) {
      throw new Error('Failed to update tool');
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
    console.error('Error updating tool:', error);
    throw error;
  }
}
