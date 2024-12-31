import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createHumeConfig, HumeConfigSettings } from './new';
import { updateHumeConfig } from './update';
import { getActiveConfig, setActiveConfig } from './active';
import { listConfigs, listConfigVersions } from './list';

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
        const configs = await listConfigs({ pageSize, pageNumber, name });
        return NextResponse.json(configs);

      case 'listVersions':
        const configId = searchParams.get('configId');
        if (!configId) {
          return NextResponse.json({ error: 'configId is required' }, { status: 400 });
        }
        const versions = await listConfigVersions({
          configId,
          pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined,
          pageNumber: searchParams.get('pageNumber') ? parseInt(searchParams.get('pageNumber')!) : undefined,
          restrictToMostRecent: searchParams.get('restrictToMostRecent') === 'true'
        });
        return NextResponse.json(versions);

      case 'active':
        const activeConfig = await getActiveConfig(userId, projectId);
        return NextResponse.json(activeConfig);

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
      case 'create': {
        const { name, prompt, language_model, voice, builtin_tools } = body as HumeConfigSettings;
        if (!name || !prompt) {
          return NextResponse.json({ error: 'name and prompt are required' }, { status: 400 });
        }
        const config = await createHumeConfig({ 
          name, 
          prompt, 
          language_model, 
          voice, 
          builtin_tools
        });
        return NextResponse.json(config);
      }

      case 'update': {
        const { configId, ...settings } = body;
        if (!configId) {
          return NextResponse.json({ error: 'configId is required' }, { status: 400 });
        }
        const updatedConfig = await updateHumeConfig(configId, settings);
        return NextResponse.json(updatedConfig);
      }

      case 'setActive': {
        const { configId: activeConfigId, version } = body;
        if (!activeConfigId || version === undefined) {
          return NextResponse.json({ error: 'configId and version are required' }, { status: 400 });
        }
        const activeConfig = await setActiveConfig(userId, activeConfigId, version, projectId);
        return NextResponse.json(activeConfig);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
