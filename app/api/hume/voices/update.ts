import { HumeClient } from "hume";
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { HumeVoiceSettings } from './new';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function toJson(parameters: HumeVoiceSettings['parameters'] | undefined): { [key: string]: number | null } | undefined {
  if (!parameters) return undefined;
  return Object.entries(parameters).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: value ?? null
  }), {});
}

export async function updateHumeVoice(voiceId: string, settings: Partial<HumeVoiceSettings>) {
  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }

  try {
    // Get current voice data
    const { data: currentVoice, error: getError } = await supabase
      .from('voices')
      .select()
      .eq('id', voiceId)
      .single();

    if (getError) {
      throw getError;
    }

    if (!currentVoice) {
      throw new Error('Voice not found');
    }

    // Update voice in database
    const { data: voice, error: voiceError } = await supabase
      .from('voices')
      .update({
        provider: settings.provider || currentVoice.provider,
        name: settings.name || currentVoice.name,
        base_voice: settings.base_voice || currentVoice.base_voice,
        parameter_model: settings.parameter_model || currentVoice.parameter_model,
        parameters: toJson(settings.parameters) || currentVoice.parameters
      })
      .eq('id', voiceId)
      .select()
      .single();

    if (voiceError) {
      throw voiceError;
    }

    // Get latest version number
    const { data: versions, error: versionsError } = await supabase
      .from('voice_versions')
      .select('version')
      .eq('voice_id', voiceId)
      .order('version', { ascending: false })
      .limit(1);

    if (versionsError) {
      throw versionsError;
    }

    const nextVersion = versions && versions.length > 0 ? versions[0].version + 1 : 1;

    // Create new version
    const { error: versionError } = await supabase
      .from('voice_versions')
      .insert({
        voice_id: voiceId,
        version: nextVersion,
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
    console.error('Error updating Hume voice:', error);
    throw error;
  }
}
