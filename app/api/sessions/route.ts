import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { expressionColors } from '@/services/hume/expressions/expressionColors'
import { expressionLabels } from '@/services/hume/expressions/expressionLabels'

// Helper to enrich prosody data
function enrichProsodyData(message: any) {
  if (message.metadata?.prosody?.scores) {
    return {
      ...message,
      metadata: {
        ...message.metadata,
        prosody: {
          scores: message.metadata.prosody.scores,
          colors: Object.fromEntries(
            Object.entries(message.metadata.prosody.scores)
              .map(([key]) => [key, expressionColors[key as keyof typeof expressionColors]])
          ),
          labels: Object.fromEntries(
            Object.entries(message.metadata.prosody.scores)
              .map(([key]) => [key, expressionLabels[key]])
          )
        }
      }
    };
  }
  return message;
}

export async function GET() {
  const start = Date.now()
  try {
    // Get authenticated user
    console.log('Starting auth check...')
    const { userId } = await auth()
    console.log(`Auth check took ${Date.now() - start}ms`)
    
    if (!userId) {
      console.error('No user ID found in auth session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting DB query...')
    const queryStart = Date.now()
    
    // Get all sessions with their messages for this user
    const sessions = await prisma.session.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    })

    // Enrich prosody data for each message
    const enrichedSessions = sessions.map(session => ({
      ...session,
      messages: session.messages.map(enrichProsodyData)
    }));

    console.log(`DB query took ${Date.now() - queryStart}ms`)

    // Sort sessions by their most recent message
    const sortStart = Date.now()
    enrichedSessions.sort((a, b) => {
      const aLastMessage = a.messages[a.messages.length - 1]
      const bLastMessage = b.messages[b.messages.length - 1]
      
      if (!aLastMessage) return 1  // Sessions without messages go last
      if (!bLastMessage) return -1
      
      return new Date(bLastMessage.timestamp).getTime() - new Date(aLastMessage.timestamp).getTime()
    })
    console.log(`Sorting took ${Date.now() - sortStart}ms`)

    console.log(`Total time: ${Date.now() - start}ms`)
    console.log(`Found ${enrichedSessions.length} sessions for user:`, userId)
    
    return NextResponse.json(enrichedSessions)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching sessions:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth()
    if (!userId) {
      console.error('No user ID found in auth session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create new session
    const session = await prisma.session.create({
      data: {
        userId
      },
      include: {
        messages: true
      }
    })

    console.log('Created new session:', session.id, 'for user:', userId)
    
    return NextResponse.json(session)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating session:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
