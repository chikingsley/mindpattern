import { HumeClient } from 'hume';

export interface CreatePromptParams {
  name: string;
  text: string;
  description?: string;
}

export async function createPrompt(params: CreatePromptParams) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    const prompt = await client.empathicVoice.prompts.createPrompt({
      name: params.name,
      text: params.text,
      versionDescription: params.description
    });

    return prompt;
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
}
