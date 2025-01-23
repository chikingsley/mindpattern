import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/prisma/prisma'
import { createHumeConfig } from '@/services/hume/hume-auth'
import { BASE_PROMPT } from '@/app/api/chat/prompts/base-prompt'

export async function POST() {
  try {
    const { userId } = await auth()
    console.log('Auth userId:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already exists
    console.log('Checking if user exists...')
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    console.log('Existing user:', existingUser)

    if (existingUser) {
      return NextResponse.json({ user: existingUser })
    }

    // Create Hume config
    console.log('Creating Hume config...')
    const humeConfig = await createHumeConfig(userId, userId)
    console.log('Created Hume config:', humeConfig.id)

    // Create user in Prisma with Hume config ID and system prompt
    console.log('Creating user in Prisma...')
    const user = await prisma.user.create({
      data: {
        id: userId,
        configId: humeConfig.id,
        systemPrompt: BASE_PROMPT
      }
    })
    console.log('Created user in Prisma:', user)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
} 