import { NextResponse } from 'next/server';
import { updatePrompt } from '../prompt-update';

export async function POST(req: Request) {
  try {
    const { text, description } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const result = await updatePrompt({ text, description, promptId: text });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}
