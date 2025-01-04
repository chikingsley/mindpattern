import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { createHumeConfig, deleteHumeConfig } from '@/utils/hume'
import { supabase } from '@/lib/supabase'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data
  const eventType = evt.type
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
  console.log('Webhook payload:', body)


  if (evt.type === 'user.created') {
    console.log('Processing user.created webhook:', evt.data.id)
    
    try {
      // Create user in Supabase
      const user = await prisma.user.create({
        data: {
          id: evt.data.id,
        }
      })
      console.log('Created user:', user.id)

      // Get user details
      const email = evt.data.email_addresses[0]?.email_address
      if (!email) {
        throw new Error('User has no email address')
      }

      // Generate username from email or first name
      const username = evt.data.username || 
        evt.data.first_name?.toLowerCase() || 
        email.split('@')[0]

      // Create new Hume config
      const humeConfig = await createHumeConfig(username, email)
      
      // Create config record
      const config = await prisma.config.create({
        data: {
          userId: user.id,
          name: `mindpattern_${username.toLowerCase()}`,
          humeConfigId: humeConfig.id,
        }
      })
      console.log('Created config:', config.id)

      // Set as active config
      const activeConfig = await prisma.activeConfig.create({
        data: {
          userId: user.id,
          configId: config.id,
        }
      })
      console.log('Set active config:', activeConfig.id)

      // Get active feature rollouts
      const activeRollouts = await prisma.featureRollout.findMany({
        where: {
          strategy: 'ALL_USERS',
          startAt: { lte: new Date() },
          OR: [
            { endAt: null },
            { endAt: { gt: new Date() } }
          ]
        }
      })
      console.log('Found active rollouts:', activeRollouts.length)

      // Link components based on rollouts
      for (const rollout of activeRollouts) {
        if (rollout.type === 'VOICE') {
          await prisma.configVoice.create({
            data: {
              configId: config.id,
              voiceId: rollout.targetId,
              isDefault: true,
              settings: {}
            }
          })
          console.log('Linked voice:', rollout.targetId)
        }
        if (rollout.type === 'PROMPT') {
          await prisma.configPrompt.create({
            data: {
              configId: config.id,
              promptId: rollout.targetId,
              customization: {}
            }
          })
          console.log('Linked prompt:', rollout.targetId)
        }
      }

      return new Response('Success: User setup complete', { status: 200 })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error in user.created webhook:', errorMessage)
      return new Response('Error: Failed to setup user', { status: 500 })
    }
  }

  if (evt.type === 'user.deleted') {
    console.log('Processing user.deleted webhook:', evt.data.id)
    
    try {
      const userId = evt.data.id

      // Check if user exists in Prisma first
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          configs: true,
          activeConfig: true
        }
      })

      // If user doesn't exist in our database, just return success
      if (!user) {
        console.log('User not found in database, skipping deletion')
        return new Response('Success: User not found', { status: 200 })
      }

      // Try to delete from Supabase first, but continue even if it fails
      try {
        const { error: supabaseError } = await supabase
          .from('messages')
          .delete()
          .eq('user_id', userId)

        if (supabaseError) {
          console.error('Error deleting messages from Supabase:', supabaseError)
          // Continue with other deletions even if Supabase fails
        }
      } catch (supabaseError) {
        console.error('Supabase deletion error:', supabaseError)
        // Continue with other deletions even if Supabase fails
      }

      // Delete Hume configs first
      for (const config of user.configs) {
        try {
          if (config.humeConfigId) {
            await deleteHumeConfig(config.humeConfigId)
          }
        } catch (error) {
          console.error('Error deleting Hume config:', error)
          // Continue with other deletions even if Hume deletion fails
        }
      }

      // Delete from Prisma tables in correct order to handle foreign key constraints
      await prisma.$transaction(async (tx) => {
        // Delete active config first if it exists
        if (user.activeConfig) {
          await tx.activeConfig.delete({
            where: { userId }
          })
        }

        // Delete config voices and prompts if configs exist
        if (user.configs.length > 0) {
          const configIds = user.configs.map(c => c.id)
          
          await tx.configVoice.deleteMany({
            where: { configId: { in: configIds } }
          })
          
          await tx.configPrompt.deleteMany({
            where: { configId: { in: configIds } }
          })

          // Delete configs
          await tx.config.deleteMany({
            where: { userId }
          })
        }

        // Finally delete user
        await tx.user.delete({
          where: { id: userId }
        })
      })

      console.log('Successfully deleted user and all associated data')
      return new Response('Success: User deletion complete', { status: 200 })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error in user.deleted webhook:', errorMessage)
      return new Response('Error: Failed to delete user', { status: 500 })
    }
  }

  return new Response('Webhook received', { status: 200 })
}