import { HumeClient } from "hume";
import { CustomVoiceSettings, CustomVoiceResponse } from "./voice-new";

export async function updateCustomVoice(voiceId: string, settings: CustomVoiceSettings): Promise<CustomVoiceResponse> {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    // TODO: Remove @ts-ignore and switch to camelCase when SDK issue is resolved
    // See: https://github.com/HumeAI/hume-typescript-sdk/issues/247
    // @ts-ignore - Using snake_case due to SDK inconsistency
    const voice = await client.empathicVoice.custom_voices.createCustomVoiceVersion(
      voiceId,
      {
        name: settings.name,
        base_voice: settings.baseVoice,
        parameter_model: settings.parameterModel,
        parameters: settings.parameters
      }
    );

    if (!voice) {
      throw new Error('Failed to create custom voice version');
    }

    return {
      id: voice.id,
      version: voice.version,
      name: voice.name,
      createdOn: voice.created_on,
      modifiedOn: voice.modified_on,
      baseVoice: voice.base_voice,
      parameterModel: voice.parameter_model,
      parameters: voice.parameters
    };

  } catch (error) {
    console.error('Error updating custom voice:', error);
    throw error;
  }
}
