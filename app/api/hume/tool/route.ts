import { NextRequest, NextResponse } from 'next/server';
import { createTool } from '../tool-new';
import { updateTool } from '../tool-update';

export async function POST(request: NextRequest) {
  try {
    const { name, ...settings } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 });
    }
    const tool = await createTool(name, settings);
    return NextResponse.json(tool);
  } catch (error) {
    console.error('Error in tool POST:', error);
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { toolId, ...settings } = await request.json();
    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
    }
    const tool = await updateTool(toolId, settings);
    return NextResponse.json(tool);
  } catch (error) {
    console.error('Error in tool PUT:', error);
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
  }
}
