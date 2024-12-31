import { HumeClient } from 'hume';

export interface ListPromptsParams {
  pageSize?: number;
  pageNumber?: number;
  name?: string;
}

export interface ListVersionsParams {
  promptId: string;
  pageSize?: number;
  pageNumber?: number;
  restrictToMostRecent?: boolean;
}

export async function listPrompts(params: ListPromptsParams = {}) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    const prompts = await client.empathicVoice.prompts.listPrompts({
      pageSize: params.pageSize,
      pageNumber: params.pageNumber,
      name: params.name
    });

    return prompts;
  } catch (error) {
    console.error('Error listing prompts:', error);
    throw error;
  }
}

export async function listPromptVersions(params: ListVersionsParams) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    const versions = await client.empathicVoice.prompts.listPromptVersions(
      params.promptId,
      {
        pageSize: params.pageSize,
        pageNumber: params.pageNumber,
        restrictToMostRecent: params.restrictToMostRecent
      }
    );

    return versions;
  } catch (error) {
    console.error('Error listing prompt versions:', error);
    throw error;
  }
}
