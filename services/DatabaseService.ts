import type { Interaction, Embedding, Metadata, LongTermMemory } from '@/types/database'
import { useSupabaseClient } from '@/utils/supabase'

export function useDatabaseService() {
  const supabase = useSupabaseClient()

  const handleError = (error: any, operation: string) => {
    console.error('Raw error object:', error)

    const errorDetails = {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      statusCode: error?.status || error?.statusCode,
      name: error?.name,
      response: error?.response,
      statusText: error?.statusText,
      data: error?.data,
      error: error?.error
    }

    console.error(`Database error in ${operation}:`, errorDetails)
    throw new Error(`Database error in ${operation}: ${JSON.stringify(errorDetails)}`)
  }

  const logRequest = async (operation: string, promise: Promise<any>) => {
    try {
      console.debug(`Starting ${operation}`)
      const result = await promise
      console.debug(`Completed ${operation}:`, result)
      return result
    } catch (error) {
      handleError(error, operation)
    }
  }

  return {
    async createInteraction(data: Omit<Interaction, 'id' | 'timestamp'>) {
      return logRequest('createInteraction', 
        supabase
          .from('interactions')
          .insert(data)
          .select()
          .single()
      ).then(result => result?.data)
    },

    async getInteractionsBySession(sessionId: string) {
      return logRequest('getInteractionsBySession',
        supabase
          .from('interactions')
          .select('*, embeddings(*), metadata(*)')
          .eq('session_id', sessionId)
          .order('timestamp', { ascending: true })
      ).then(result => result?.data)
    },

    async getInteractionsByUser(userId: string, limit = 100) {
      return logRequest('getInteractionsByUser',
        supabase
          .from('interactions')
          .select('*, embeddings(*), metadata(*)')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(limit)
      ).then(result => result?.data)
    },

    async storeEmbedding(data: Omit<Embedding, 'id'>) {
      return logRequest('storeEmbedding',
        supabase
          .from('embeddings')
          .insert(data)
          .select()
          .single()
      ).then(result => result?.data)
    },

    async storeMetadata(data: Omit<Metadata, 'id'>) {
      return logRequest('storeMetadata',
        supabase
          .from('metadata')
          .insert(data)
          .select()
          .single()
      ).then(result => result?.data)
    },

    async createMemory(data: Omit<LongTermMemory, 'id' | 'timestamp'>) {
      return logRequest('createMemory',
        supabase
          .from('long_term_memories')
          .insert(data)
          .select()
          .single()
      ).then(result => result?.data)
    },

    async getMemoriesByUser(userId: string, category?: 'pattern' | 'event') {
      let query = supabase
        .from('long_term_memories')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      return logRequest('getMemoriesByUser', query)
        .then(result => result?.data)
    }
  }
}
