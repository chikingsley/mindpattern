import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
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

    // Verify session belongs to user
    const session = await prisma.session.findUnique({
      where: {
        id: params.sessionId,
        userId // Ensure session belongs to authenticated user
      }
    })

    if (!session) {
      console.error('Session not found or unauthorized:', params.sessionId)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get message data from request
    const messageData = await request.json()
    
    // Create new message
    const message = await prisma.message.create({
      data: {
        sessionId: params.sessionId,
        role: messageData.role,
        content: messageData.content
      }
    })

    console.log('Created message in session:', params.sessionId, 'for user:', userId)
    
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
