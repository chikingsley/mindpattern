import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
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

    console.log('Fetching sessions for user:', userId)
    
    // Get all sessions with their messages for this user
    const sessions = await prisma.session.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: -1 // Get most recent message
        }
      }
    })

    // Sort sessions by their most recent message
    sessions.sort((a, b) => {
      const aLastMessage = a.messages[a.messages.length - 1]
      const bLastMessage = b.messages[b.messages.length - 1]
      
      if (!aLastMessage) return 1  // Sessions without messages go last
      if (!bLastMessage) return -1
      
      return new Date(bLastMessage.timestamp).getTime() - new Date(aLastMessage.timestamp).getTime()
    })

    console.log(`Found ${sessions.length} sessions for user:`, userId)
    
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
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
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
