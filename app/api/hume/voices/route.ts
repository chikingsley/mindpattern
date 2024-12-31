import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createHumeVoice, HumeVoiceSettings } from './new';
import { updateHumeVoice } from './update';
import { listVoices, listVoiceVersions } from './list';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'list':
        const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined;
        const pageNumber = searchParams.get('pageNumber') ? parseInt(searchParams.get('pageNumber')!) : undefined;
        const name = searchParams.get('name') || undefined;
        const provider = (searchParams.get('provider') as "HUME_AI" | "CUSTOM_VOICE") || undefined;
        const base_voice = (searchParams.get('base_voice') as "ITO" | "KORA" | "DACHER" | "AURA" | "FINN" | "WHIMSY" | "STELLA" | "SUNNY") || undefined;
        const voices = await listVoices({ pageSize, pageNumber, name, provider, base_voice });
        return NextResponse.json(voices);

      case 'listVersions':
        const voiceId = searchParams.get('voiceId');
        if (!voiceId) {
          return NextResponse.json({ error: 'voiceId is required' }, { status: 400 });
        }
        const versions = await listVoiceVersions({
          voiceId,
          pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined,
          pageNumber: searchParams.get('pageNumber') ? parseInt(searchParams.get('pageNumber')!) : undefined,
          restrictToMostRecent: searchParams.get('restrictToMostRecent') === 'true'
        });
        return NextResponse.json(versions);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create': {
        const { provider, name, base_voice, parameter_model, parameters } = body as HumeVoiceSettings;
        if (!provider || !name) {
          return NextResponse.json({ error: 'provider and name are required' }, { status: 400 });
        }
        const voice = await createHumeVoice({ 
          provider, 
          name, 
          base_voice,
          parameter_model,
          parameters
        });
        return NextResponse.json(voice);
      }

      case 'update': {
        const { voiceId, ...settings } = body;
        if (!voiceId) {
          return NextResponse.json({ error: 'voiceId is required' }, { status: 400 });
        }
        const updatedVoice = await updateHumeVoice(voiceId, settings);
        return NextResponse.json(updatedVoice);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
