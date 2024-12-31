import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createHumeTool, HumeToolSettings } from './new';
import { updateHumeTool } from './update';
import { listTools, listToolVersions } from './list';

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
        const type = (searchParams.get('type') as "builtin" | "function") || undefined;
        const tools = await listTools({ pageSize, pageNumber, name, type });
        return NextResponse.json(tools);

      case 'listVersions':
        const toolId = searchParams.get('toolId');
        if (!toolId) {
          return NextResponse.json({ error: 'toolId is required' }, { status: 400 });
        }
        const versions = await listToolVersions({
          toolId,
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
        const { type, name, parameters, description, fallback_content } = body as HumeToolSettings;
        if (!type || !name || !parameters) {
          return NextResponse.json({ error: 'type, name, and parameters are required' }, { status: 400 });
        }
        const tool = await createHumeTool({ 
          type, 
          name, 
          parameters,
          description,
          fallback_content
        });
        return NextResponse.json(tool);
      }

      case 'update': {
        const { toolId, ...settings } = body;
        if (!toolId) {
          return NextResponse.json({ error: 'toolId is required' }, { status: 400 });
        }
        const updatedTool = await updateHumeTool(toolId, settings);
        return NextResponse.json(updatedTool);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
