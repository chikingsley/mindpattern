# Hume API Organization Plan

## Overview
This document outlines the organization of the Hume API integration, focusing on managing configurations, prompts, tools, and voices in a modular and maintainable way using a database-driven approach.

## Directory Structure

```
app/api/hume/
├── prompts/
│   ├── active.ts       # Get/Set active prompt with DB
│   ├── new.ts         # Create new prompt
│   ├── update.ts      # Update existing prompt
│   ├── list.ts        # List prompts/versions
│   ├── route.ts       # API routes
│   └── types.ts       # Shared types
├── configs/
│   ├── active.ts      # Get/Set active config with DB
│   ├── new.ts         # Create new config
│   ├── update.ts      # Update existing config
│   ├── list.ts        # List configs/versions
│   ├── route.ts       # API routes
│   └── types.ts       # Shared types
├── tools/
│   ├── active.ts      # Get/Set active tools with DB
│   ├── new.ts         # Create new tool
│   ├── update.ts      # Update existing tool
│   ├── dynamic.ts     # LLM-generated tools
│   ├── route.ts       # API routes
│   └── types.ts       # Shared types
├── voices/
│   ├── active.ts      # Get/Set active voice with DB
│   ├── new.ts         # Create new voice
│   ├── update.ts      # Update existing voice
│   ├── route.ts       # API routes
│   └── types.ts       # Shared types
└── shared/
    ├── client.ts      # Shared Hume client setup
    ├── errors.ts      # Error handling
    └── types.ts       # Common types
```

## Database Schema

```prisma
// prisma/schema.prisma

model ActiveResources {
  id            String   @id @default(cuid())
  userId        String   // For multi-user support
  projectId     String?  // Optional project isolation
  
  // Config
  configId      String
  configVersion Int
  
  // Prompt
  promptId      String
  promptVersion Int
  
  // Voice (optional)
  voiceId       String?
  voiceVersion  Int?
  
  // Tools (can have multiple active)
  activeTools   ActiveTool[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ActiveTool {
  id              String   @id @default(cuid())
  activeResources ActiveResources @relation(fields: [resourcesId], references: [id])
  resourcesId     String
  
  toolId          String
  toolVersion     Int
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// For caching responses
model ResourceCache {
  id            String   @id
  resourceType  String   // 'config', 'prompt', 'tool', 'voice'
  resourceId    String
  version       Int
  data          Json
  expiresAt     DateTime
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Key Components

### 1. Active Resource Management
Database-driven approach for managing active resources:

```typescript
// shared/types.ts
interface ActiveResourcesInput {
  userId: string;
  projectId?: string;
  configId: string;
  configVersion: number;
  promptId: string;
  promptVersion: number;
  voiceId?: string;
  voiceVersion?: number;
  tools?: Array<{
    toolId: string;
    toolVersion: number;
  }>;
}

// configs/active.ts
export async function getActiveConfig(userId: string, projectId?: string) {
  const active = await prisma.activeResources.findFirst({
    where: { 
      userId,
      ...(projectId && { projectId })
    },
    include: {
      activeTools: true
    }
  });
  
  if (!active) {
    throw new Error('No active configuration found');
  }
  
  // Check cache first
  const cached = await prisma.resourceCache.findUnique({
    where: {
      id: `config:${active.configId}:${active.configVersion}`
    }
  });
  
  if (cached && cached.expiresAt > new Date()) {
    return cached.data;
  }
  
  // Fetch from Hume API
  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
  const config = await client.empathicVoice.configs.getConfigVersion(
    active.configId,
    active.configVersion
  );
  
  // Cache the result
  await prisma.resourceCache.upsert({
    where: {
      id: `config:${active.configId}:${active.configVersion}`
    },
    update: {
      data: config,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    },
    create: {
      id: `config:${active.configId}:${active.configVersion}`,
      resourceType: 'config',
      resourceId: active.configId,
      version: active.configVersion,
      data: config,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }
  });
  
  return config;
}

export async function setActiveConfig(input: ActiveResourcesInput) {
  const { userId, projectId, configId, configVersion, ...rest } = input;
  
  // Update or create active resources
  const active = await prisma.activeResources.upsert({
    where: {
      userId_projectId: {
        userId,
        projectId: projectId || 'default'
      }
    },
    update: {
      configId,
      configVersion,
      ...rest,
      activeTools: {
        deleteMany: {},
        create: input.tools?.map(tool => ({
          toolId: tool.toolId,
          toolVersion: tool.toolVersion
        }))
      }
    },
    create: {
      userId,
      projectId: projectId || 'default',
      configId,
      configVersion,
      ...rest,
      activeTools: {
        create: input.tools?.map(tool => ({
          toolId: tool.toolId,
          toolVersion: tool.toolVersion
        }))
      }
    }
  });
  
  // Clear cache
  await prisma.resourceCache.deleteMany({
    where: {
      resourceType: 'config',
      resourceId: configId
    }
  });
  
  return getActiveConfig(userId, projectId);
}
```

### 2. API Routes
RESTful endpoints with database integration:

```typescript
// configs/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');
  const userId = req.headers.get('x-user-id');
  const projectId = searchParams.get('projectId');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }
  
  if (active === 'true') {
    try {
      const config = await getActiveConfig(userId, projectId || undefined);
      return NextResponse.json({ config });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 404 }
      );
    }
  }
  
  // Normal list/get logic...
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const setActive = searchParams.get('setActive');
  const userId = req.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }
  
  if (setActive === 'true') {
    try {
      const input = await req.json();
      const config = await setActiveConfig({
        userId,
        ...input
      });
      return NextResponse.json({ config });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }
  }
  
  // Normal create logic...
}
```

## Implementation Phases

### Phase 1: Database Setup (Current Focus)
1. Set up Prisma schema
2. Create migrations
3. Implement basic CRUD operations
4. Add caching layer

### Phase 2: Core API Structure
1. Set up directory structure
2. Implement shared utilities
3. Create base API routes

### Phase 3: Active Resource Management
1. Implement active resource endpoints
2. Add validation
3. Set up error handling

### Phase 4: Advanced Features
1. Dynamic tool generation
2. Version management
3. Project isolation

### Phase 5: Optimization
1. Query optimization
2. Cache management
3. Add monitoring/logging

## Usage Examples

### Managing Active Config
```typescript
// Set active config with tools
await setActiveConfig({
  userId: "user-123",
  projectId: "project-456", // Optional
  configId: "config-789",
  configVersion: 2,
  promptId: "prompt-123",
  promptVersion: 1,
  tools: [
    { toolId: "weather-tool", toolVersion: 1 },
    { toolId: "calendar-tool", toolVersion: 3 }
  ]
});

// Get active config
const config = await getActiveConfig("user-123", "project-456");
```

### Creating Dynamic Tool
```typescript
// Generate and add tool
const tool = await createDynamicTool({
  userId: "user-123",
  description: "Tool to fetch weather data",
  inputs: ["location", "date"],
  outputs: ["temperature", "conditions"]
});

// Add to active config
await addToolToActiveConfig({
  userId: "user-123",
  toolId: tool.id,
  toolVersion: tool.version
});
```

## Next Steps
1. Set up Prisma and create migrations
2. Implement core database operations
3. Create active resource management
4. Build API routes
5. Add caching layer
