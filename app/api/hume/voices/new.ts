import { HumeClient } from "hume";
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface HumeVoiceParameters {
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

export interface HumeVoiceSettings {
  provider: "HUME_AI" | "CUSTOM_VOICE";
  name: string;
  base_voice?: "ITO" | "KORA" | "DACHER" | "AURA" | "FINN" | "WHIMSY" | "STELLA" | "SUNNY";
  parameter_model?: "20241004-11parameter";
  parameters?: HumeVoiceParameters;
}

function toJson(parameters: HumeVoiceParameters | undefined): { [key: string]: number | null } | undefined {
  if (!parameters) return undefined;
  return Object.entries(parameters).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: value ?? null
  }), {});
}

export async function createHumeVoice(settings: HumeVoiceSettings) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  try {
    // Create voice in database
    const { data: voice, error: voiceError } = await supabase
      .from('voices')
      .insert({
        provider: settings.provider,
        name: settings.name,
        base_voice: settings.base_voice,
        parameter_model: settings.parameter_model,
        parameters: toJson(settings.parameters)
      })
      .select()
      .single();

    if (voiceError) {
      throw voiceError;
    }

    // Create initial version
    const { error: versionError } = await supabase
      .from('voice_versions')
      .insert({
        voice_id: voice.id,
        version: 1,
        provider: voice.provider,
        name: voice.name,
        base_voice: voice.base_voice,
        parameter_model: voice.parameter_model,
        parameters: voice.parameters
      });

    if (versionError) {
      throw versionError;
    }

    return {
      id: voice.id,
      provider: voice.provider,
      name: voice.name,
      base_voice: voice.base_voice,
      parameter_model: voice.parameter_model,
      parameters: voice.parameters
    };

  } catch (error) {
    console.error('Error creating Hume voice:', error);
    throw error;
  }
}
