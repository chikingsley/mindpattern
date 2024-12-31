import { HumeClient } from 'hume';

interface UpdatePromptParams {
  promptId: string;
  text: string;
  description?: string;
}

export async function updatePrompt({ promptId, text, description }: UpdatePromptParams) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });

  try {
    // TODO: Change back to createPromptVersion once Hume SDK is updated
    // PR: https://github.com/HumeAI/hume-typescript-sdk/pull/246
    // @ts-ignore - Using misspelling due to SDK inconsistency
    const response = await client.empathicVoice.prompts.createPromptVerison(
      promptId,
      {
        text,
        versionDescription: description
      }
    );

    if (!response) {
      throw new Error('Failed to create prompt version');
    }

    return {
      success: true,
      promptId: response.id,
      version: response.version,
      text: response.text,
      versionDescription: response.versionDescription
    };
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
}
