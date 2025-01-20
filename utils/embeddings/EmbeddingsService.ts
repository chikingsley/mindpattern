import { generateEmbedding, generateEmbeddings } from '@/utils/embeddings/embeddings';

const JINA_API_KEY = process.env.NEXT_PUBLIC_JINA_API_KEY;

export class EmbeddingsService {
  private static instance: EmbeddingsService;

  private constructor() {}

  public static getInstance(): EmbeddingsService {
    if (!this.instance) {
      this.instance = new EmbeddingsService();
    }
    return this.instance;
  }

  async getEmbedding(input: string, options?: { task: string }): Promise<number[]> {
    return generateEmbedding(input, options);
  }

  async getEmbeddings(inputs: string[], options?: { task: string }): Promise<number[][]> {
    return generateEmbeddings(inputs, options);
  }
}

export const embeddingsService = EmbeddingsService.getInstance();

export function useEmbeddingsService() {
  const supabase = useSupabaseClient();

  async function generateEmbeddings(input: string[]): Promise<number[][]> {
    return await embeddingsService.getEmbeddings(input);
  }

  async function storeMessage(
    content: string,
    userId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    metadata: Record<string, any> = {}
  ): Promise<any> {
    try {
      // Generate embedding
      const embeddings = await generateEmbeddings([content]);
      
      // Store message with embedding
      const { data, error } = await supabase
        .from('messages')
        .insert({
          user_id: userId,
          session_id: sessionId,
          content,
          role,
          metadata,
          embedding: embeddings[0]
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing message:', error);
      throw error;
    }
  }

  async function getRelevantContext(
    content: string,
    userId: string,
    sessionId: string,
    limit = 5
  ): Promise<any[]> {
    try {
      // Generate embedding for search
      const embeddings = await generateEmbeddings([content]);
      
      // Search for similar messages
      const { data: messages, error } = await supabase
        .rpc('match_messages', {
          query_embedding: embeddings[0],
          match_threshold: 0.65,  // Updated based on extensive testing
          match_count: limit,
          in_user_id: userId,
          in_session_id: sessionId
        });
        
      if (error) throw error;
      return messages || [];
    } catch (error) {
      console.error('Error getting relevant context:', error);
      throw error;
    }
  }

  async function runLatencyTest(
    userId: string,
    sessionId: string
  ): Promise<{
    messageLength: number;
    storeLatency: number;
    retrieveLatency: number;
    totalLatency: number;
  }[]> {
    const testMessages = [
      "Quick test message",
      "Medium length message about feeling anxious today",
      "Longer message discussing multiple topics and emotions in detail, including past experiences and current feelings"
    ];
    
    const results = [];
    
    for (const msg of testMessages) {
      const start = performance.now();
      
      // Test storage
      await storeMessage(msg, userId, sessionId, 'user');
      const storeLatency = performance.now() - start;
      
      // Test retrieval
      const retrieveStart = performance.now();
      await getRelevantContext(msg, userId, sessionId);
      const retrieveLatency = performance.now() - retrieveStart;
      
      results.push({
        messageLength: msg.length,
        storeLatency,
        retrieveLatency,
        totalLatency: storeLatency + retrieveLatency
      });
    }
    
    return results;
  }

  return {
    generateEmbeddings,
    storeMessage,
    getRelevantContext,
    runLatencyTest
  };
}
