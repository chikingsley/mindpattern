import { NextRequest, NextResponse } from 'next/server';
import { createPrompt } from './new';
import { updatePrompt } from './update';
import { getActivePrompt, setActivePrompt } from './active';
import { listPrompts, listPromptVersions } from './list';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const projectId = searchParams.get('projectId') || 'default';

    switch (action) {
      case 'list':
        const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined;
        const pageNumber = searchParams.get('pageNumber') ? parseInt(searchParams.get('pageNumber')!) : undefined;
        const name = searchParams.get('name') || undefined;
        const prompts = await listPrompts({ pageSize, pageNumber, name });
        return NextResponse.json(prompts);

      case 'listVersions':
        const promptId = searchParams.get('promptId');
        if (!promptId) {
          return NextResponse.json({ error: 'promptId is required' }, { status: 400 });
        }
        const versions = await listPromptVersions({
          promptId,
          pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined,
          pageNumber: searchParams.get('pageNumber') ? parseInt(searchParams.get('pageNumber')!) : undefined,
          restrictToMostRecent: searchParams.get('restrictToMostRecent') === 'true'
        });
        return NextResponse.json(versions);

      case 'active':
        const activePrompt = await getActivePrompt(userId, projectId);
        return NextResponse.json(activePrompt);

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
    const projectId = searchParams.get('projectId') || 'default';
    const body = await request.json();

    switch (action) {
      case 'create':
        const { name, text, versionDescription } = body;
        if (!name || !text) {
          return NextResponse.json({ error: 'name and text are required' }, { status: 400 });
        }
        const prompt = await createPrompt({ name, text, versionDescription });
        return NextResponse.json(prompt);

      case 'update':
        const { promptId, text: updateText, versionDescription: updateVersionDescription } = body;
        if (!promptId || !updateText) {
          return NextResponse.json({ error: 'promptId and text are required' }, { status: 400 });
        }
        const updatedPrompt = await updatePrompt({
          promptId,
          text: updateText,
          versionDescription: updateVersionDescription
        });
        return NextResponse.json(updatedPrompt);

      case 'setActive':
        const { promptId: activePromptId, version } = body;
        if (!activePromptId || version === undefined) {
          return NextResponse.json({ error: 'promptId and version are required' }, { status: 400 });
        }
        const activePrompt = await setActivePrompt(userId, activePromptId, version, projectId);
        return NextResponse.json(activePrompt);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
