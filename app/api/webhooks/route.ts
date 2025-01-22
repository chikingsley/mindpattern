import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { createHumeConfig, deleteHumeConfig } from '@/utils/hume'
import { createClerkClient } from '@clerk/backend'
import { BASE_PROMPT } from '@/app/api/chat/prompts/base-prompt'

const prisma = new PrismaClient()
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

async function checkUserExists(userId: string) {
  const count = await prisma.user.count({
    where: { id: userId }
  });
  return count > 0;
}

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

  // Handle webhook events
  const { id } = evt.data
  const eventType = evt.type
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`)

  if (evt.type === 'user.created') {
    console.log('Processing user.created webhook:', evt.data.id)
    
    try {
      // Get user details from Clerk
      const email = evt.data.email_addresses[0]?.email_address
      if (!email) {
        throw new Error('User has no email address')
      }

      // Get username from Clerk
      const username = evt.data.username
      if (!username) {
        throw new Error('User has no username')
      }

      // Get user ID from Clerk
      const userId = evt.data.id
      if (!userId) {
        throw new Error('No user ID provided in webhook data')
      }

      // Create Hume config
      const humeConfig = await createHumeConfig(username, email)
      console.log('Created Hume config:', humeConfig.id)

      // Create user in Prisma with Hume config ID and system prompt
      const user = await prisma.user.create({
        data: {
          id: userId,
          configId: humeConfig.id,
          systemPrompt: BASE_PROMPT
        }
      })
      console.log('Created user in Prisma:', user.id)

      // Update Clerk user metadata
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          humeConfigId: humeConfig.id
        }
      })
      console.log('Updated Clerk metadata with config ID')

      return new Response('Success: User created', { status: 200 })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error in user.created webhook:', errorMessage)
      return new Response('Error: Failed to create user', { status: 500 })
    }
  }

  if (evt.type === 'user.deleted') {
    console.log('Processing user.deleted webhook:', evt.data.id)
    
    try {
      const userId = evt.data.id
      if (!userId) {
        throw new Error('No user ID provided in webhook data')
      }

      // Check if user exists before deletion
      const existsBefore = await checkUserExists(userId);
      console.log('User exists before deletion:', existsBefore);

      // Get user with config ID
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        console.log('User not found in database, skipping deletion')
        return new Response('Success: User not found', { status: 200 })
      }

      // Delete Hume config if it exists
      if (user.configId) {
        try {
          await deleteHumeConfig(user.configId)
          console.log('Deleted Hume config:', user.configId)
        } catch (error) {
          console.error('Error deleting Hume config:', error)
          // Continue with deletion even if Hume fails
        }
      }

      // Delete user and all related data through cascading
      try {
        console.log('Attempting to delete user:', userId);
        const deletedUser = await prisma.user.delete({
          where: { id: userId },
          include: { sessions: true } // Include sessions to see what's being deleted
        });
        console.log('Successfully deleted user:', deletedUser);
      } catch (error) {
        console.error('Failed to delete user from Prisma:', error);
        throw error; // Re-throw to be caught by outer try-catch
      }

      // Check if user still exists after deletion
      const existsAfter = await checkUserExists(userId);
      console.log('User exists after deletion:', existsAfter);

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