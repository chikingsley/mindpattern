// utils/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { useSession } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log('Supabase URL:', supabaseUrl)
console.log('Using anon key:', supabaseAnonKey.substring(0, 8) + '...')

// Create a Supabase client with Clerk authentication
export function useSupabaseClient() {
  const { session } = useSession()

  const client = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false
      },
      global: {
        headers: async () => {
          if (!session) {
            console.debug('No session available, using anonymous access')
            return {}
          }

          try {
            console.debug('Fetching Clerk token for Supabase request')
            const token = await session.getToken({
              template: 'supabase',
              // Default claims if no template exists
              defaultClaims: {
                sub: session.user.id,
                role: 'authenticated',
                aud: 'authenticated'
              }
            })

            if (!token) {
              console.warn('No Clerk token returned')
              return {}
            }

            console.debug('Got Clerk token, length:', token.length)
            return {
              Authorization: `Bearer ${token}`
            }
          } catch (error) {
            console.warn('Failed to get Clerk token:', error)
            console.warn('Falling back to anonymous access. Please set up JWT template in Clerk dashboard:',
              'https://clerk.com/docs/integrations/databases/supabase')
            return {}
          }
        }
      }
    }
  )

  return client
}

// Helper to get current user from Clerk session
export const getCurrentUser = async (session: any) => {
  if (!session) {
    console.warn('No session available in getCurrentUser')
    return null
  }
  return { id: session.user.id }
}