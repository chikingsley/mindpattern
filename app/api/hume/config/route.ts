import { NextResponse } from 'next/server';
import { HumeClient } from 'hume';
import { updateHumeConfig, HumeConfigSettings } from '../config-update';

export async function POST(req: Request) {
  try {
    const newSettings: HumeConfigSettings = await req.json();
    
    // Validate required fields
    if (newSettings.prompt && (!newSettings.prompt.id || !newSettings.prompt.version)) {
      return NextResponse.json(
        { error: 'Prompt id and version are required when updating prompt' },
        { status: 400 }
      );
    }

    if (!process.env.HUME_CONFIG_ID) {
      return NextResponse.json(
        { error: 'HUME_CONFIG_ID not found in environment variables' },
        { status: 404 }
      );
    }

    const updatedConfig = await updateHumeConfig(process.env.HUME_CONFIG_ID, newSettings);
    
    return NextResponse.json({
      success: true,
      config: updatedConfig
    });
  } catch (error) {
    console.error('Error in config update route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch current config
export async function GET() {
  try {
    if (!process.env.HUME_CONFIG_ID) {
      return NextResponse.json(
        { error: 'HUME_CONFIG_ID not found in environment variables' },
        { status: 404 }
      );
    }

    if (!process.env.HUME_API_KEY) {
      return NextResponse.json(
        { error: 'HUME_API_KEY not found in environment variables' },
        { status: 500 }
      );
    }

    const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
    
    // Get list of versions with most recent first
    const versionsResponse = await client.empathicVoice.configs.listConfigVersions(
      process.env.HUME_CONFIG_ID,
      { pageSize: 1, restrictToMostRecent: true }
    );
    
    if (!versionsResponse.configsPage || versionsResponse.configsPage.length === 0) {
      return NextResponse.json(
        { error: 'No config versions found' },
        { status: 404 }
      );
    }

    // Get the latest version details
    const latestVersion = versionsResponse.configsPage[0];
    if (latestVersion.version === undefined) {
      return NextResponse.json(
        { error: 'Config version not found' },
        { status: 404 }
      );
    }

    const configVersion = await client.empathicVoice.configs.getConfigVersion(
      process.env.HUME_CONFIG_ID,
      latestVersion.version
    );

    return NextResponse.json({
      success: true,
      config: configVersion
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
