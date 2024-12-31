import { HumeClient } from "hume";

export interface HumePromptSettings {
  name: string;
  text: string;
  description?: string;
}

export async function createHumePrompt(settings: HumePromptSettings) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    // TODO: Change back to createPromptVersion once Hume SDK is updated
    // PR: https://github.com/HumeAI/hume-typescript-sdk/pull/246
    // @ts-ignore - Using misspelling due to SDK inconsistency
    const prompt = await client.empathicVoice.prompts.createPrompt({
      name: settings.name,
      text: settings.text
    });

    if (!prompt) {
      throw new Error('Failed to create prompt');
    }

    return {
      id: prompt.id,
      version: prompt.version,
      text: prompt.text,
      versionDescription: prompt.versionDescription
    };

  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
}
