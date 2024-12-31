import { HumeClient } from "hume";

// Type for config settings
export interface HumeConfigSettings {
  prompt?: {
    id: string;
    version: number;
  };
  language_model?: {
    model_provider: "OPEN_AI" | "ANTHROPIC" | "FIREWORKS" | "GROQ" | "GOOGLE";
    model_resource: "claude-3-5-sonnet-latest" | "claude-3-5-sonnet-20240620" | 
                  "claude-3-opus-20240229" | "claude-3-sonnet-20240229" | 
                  "claude-3-haiku-20240307" | "claude-2.1" | "claude-instant-1.2" | 
                  "gemini-1.5-pro" | "gemini-1.5-flash" | "gpt-4-turbo-preview" | 
                  "gpt-3.5-turbo-0125" | "gpt-4o" | "gpt-4o-mini" | 
                  "llama3-8b-8192" | "llama3-70b-8192";
    temperature?: number;
  };
  voice?: {
    provider: "HUME_AI" | "CUSTOM_VOICE";
    name?: "ITO" | "KORA" | "DACHER" | "AURA" | "FINN" | "WHIMSY" | "STELLA" | "SUNNY";
  };
  builtin_tools?: Array<{
    name: "web_search" | "hang_up";
    fallback_content?: string;
  }>;
  version_description?: string;
}

export async function updateHumeConfig(configId: string, newSettings: HumeConfigSettings) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    const updatedConfig = await client.empathicVoice.configs.createConfigVersion(
      configId,
      {
        eviVersion: "2",
        ...(newSettings.prompt && { prompt: newSettings.prompt }),
        ...(newSettings.language_model && { language_model: newSettings.language_model }),
        ...(newSettings.voice && { voice: newSettings.voice }),
        ...(newSettings.builtin_tools && { builtin_tools: newSettings.builtin_tools }),
        versionDescription: newSettings.version_description || `Updated on ${new Date().toISOString()}`
      }
    );

    return {
      config_id: updatedConfig.id,
      version: updatedConfig.version,
      name: updatedConfig.name,
      prompt: updatedConfig.prompt,
      language_model: updatedConfig.languageModel,
      voice: updatedConfig.voice,
      builtin_tools: updatedConfig.builtinTools
    };

  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
}
