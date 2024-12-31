import { HumeClient } from "hume";

export interface HumeConfigSettings {
  name: string;
  prompt?: {
    id: string;
    version: number;
  };
  language_model?: {
    model_provider: "OPEN_AI" | "ANTHROPIC" | "FIREWORKS" | "GROQ" | "GOOGLE";
    model_resource: string;
    temperature?: number;
  };
  voice?: {
    provider: "HUME_AI" | "CUSTOM_VOICE";
    name: string;
  };
  builtin_tools?: Array<{
    name: "web_search" | "hang_up";
    fallback_content?: string;
  }>;
}

export async function createHumeConfig(settings: HumeConfigSettings) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    const config = await client.empathicVoice.configs.createConfig({
      name: settings.name,
      eviVersion: "2",
      ...(settings.prompt && { prompt: settings.prompt }),
      ...(settings.language_model && { language_model: settings.language_model }),
      ...(settings.voice && { voice: settings.voice }),
      ...(settings.builtin_tools && { builtin_tools: settings.builtin_tools })
    });

    return {
      id: config.id,
      version: config.version,
      name: config.name,
      prompt: config.prompt,
      language_model: config.languageModel,
      voice: config.voice,
      builtin_tools: config.builtinTools
    };

  } catch (error) {
    console.error('Error creating Hume config:', error);
    throw error;
  }
}
