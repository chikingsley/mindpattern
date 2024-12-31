import { HumeClient } from "hume";

export interface CustomVoiceParameters {
  gender?: number;
  assertiveness?: number;
  buoyancy?: number;
  confidence?: number;
  enthusiasm?: number;
  nasality?: number;
  relaxedness?: number;
  smoothness?: number;
  tepidity?: number;
  tightness?: number;
}

export interface CustomVoiceSettings {
  name: string;
  baseVoice: "ITO" | "KORA" | "DACHER" | "AURA" | "FINN" | "WHIMSY" | "STELLA" | "SUNNY";
  parameterModel: "20241004-11parameter";
  parameters?: CustomVoiceParameters;
}

export interface CustomVoiceResponse {
  id: string;
  version: string;
  name: string;
  createdOn: string;
  modifiedOn: string;
  baseVoice: string;
  parameterModel: string;
  parameters: CustomVoiceParameters | null;
}

export async function createCustomVoice(settings: CustomVoiceSettings): Promise<CustomVoiceResponse> {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  
  try {
    // TODO: Remove @ts-ignore and switch to camelCase when SDK issue is resolved
    // See: https://github.com/HumeAI/hume-typescript-sdk/issues/247
    // @ts-ignore - Using snake_case due to SDK inconsistency
    const voice = await client.empathicVoice.custom_voices.createCustomVoice({
      name: settings.name,
      base_voice: settings.baseVoice,
      parameter_model: settings.parameterModel,
      parameters: settings.parameters,
    });

    if (!voice) {
      throw new Error('Failed to create custom voice');
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
    console.error('Error creating custom voice:', error);
    throw error;
  }
}
