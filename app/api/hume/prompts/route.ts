import { NextResponse } from 'next/server';
import { getActivePrompt, setActivePrompt } from './active';
import { createPrompt } from './new';
import { updatePrompt } from './update';
import { listPrompts, listPromptVersions } from './list';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = req.headers.get('x-user-id');
  const projectId = searchParams.get('projectId');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }

  try {
    // Get active prompt
    if (searchParams.get('active') === 'true') {
      const prompt = await getActivePrompt(userId, projectId || undefined);
      return NextResponse.json({ prompt });
    }
    
    // List prompt versions
    const promptId = searchParams.get('promptId');
    if (promptId && searchParams.get('versions') === 'true') {
      const versions = await listPromptVersions({
        promptId,
        pageSize: Number(searchParams.get('pageSize')) || undefined,
        pageNumber: Number(searchParams.get('pageNumber')) || undefined,
        restrictToMostRecent: searchParams.get('mostRecent') === 'true'
      });
      return NextResponse.json(versions);
    }
    
    // List prompts
    const prompts = await listPrompts({
      pageSize: Number(searchParams.get('pageSize')) || undefined,
      pageNumber: Number(searchParams.get('pageNumber')) || undefined,
      name: searchParams.get('name') || undefined
    });
    return NextResponse.json(prompts);
    
  } catch (error) {
    console.error('Error in GET /api/hume/prompts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = req.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Set active prompt
    if (searchParams.get('setActive') === 'true') {
      const prompt = await setActivePrompt(
        userId,
        body.promptId,
        body.version,
        body.projectId
      );
      return NextResponse.json({ prompt });
    }
    
    // Create new prompt version
    const promptId = searchParams.get('promptId');
    if (promptId) {
      const prompt = await updatePrompt({
        promptId,
        text: body.text,
        description: body.description
      });
      return NextResponse.json({ prompt });
    }
    
    // Create new prompt
    const prompt = await createPrompt({
      name: body.name,
      text: body.text,
      description: body.description
    });
    return NextResponse.json({ prompt });
    
  } catch (error) {
    console.error('Error in POST /api/hume/prompts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
