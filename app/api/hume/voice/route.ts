import { NextRequest, NextResponse } from 'next/server';
import { createCustomVoice } from '../voice-new';
import { updateCustomVoice } from '../voice-update';

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    const voice = await createCustomVoice(settings);
    return NextResponse.json(voice);
  } catch (error) {
    console.error('Error in voice POST:', error);
    return NextResponse.json({ error: 'Failed to create custom voice' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { voiceId, ...settings } = await request.json();
    if (!voiceId) {
      return NextResponse.json({ error: 'Voice ID is required' }, { status: 400 });
    }
    const voice = await updateCustomVoice(voiceId, settings);
    return NextResponse.json(voice);
  } catch (error) {
    console.error('Error in voice PUT:', error);
    return NextResponse.json({ error: 'Failed to update custom voice' }, { status: 500 });
  }
}
