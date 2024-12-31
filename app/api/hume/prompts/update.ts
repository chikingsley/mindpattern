import { HumeClient } from 'hume';

export interface UpdatePromptParams {
  promptId: string;
  text: string;
  versionDescription?: string;
}

export async function updatePrompt(params: UpdatePromptParams) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    // TODO: Change back to createPromptVersion once Hume SDK is updated
    // PR: https://github.com/HumeAI/hume-typescript-sdk/pull/246
    // @ts-ignore - Using misspelling due to SDK inconsistency
    const prompt = await client.empathicVoice.prompts.createPromptVerison(
      params.promptId,
      {
        text: params.text,
        versionDescription: params.versionDescription
      }
    );

    return prompt;
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
}
