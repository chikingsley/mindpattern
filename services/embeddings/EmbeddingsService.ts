import { generateEmbedding, generateEmbeddings } from './embeddings';
import { rerank } from './reranker';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageWithSimilarity = Message & { similarity: number };

type JinaTask = 'retrieval.passage';

interface EmbeddingOptions {
  task?: JinaTask;
}

interface RankedResult {
  message: Message;
  similarity: number;
  rerankedScore?: number;
  finalScore?: number;
}

// Scoring configuration based on test results
const SCORING_CONFIG = {
  vectorWeight: 0.8,
  rerankerWeight: 0.2,
  similarityThreshold: 0.3,  // Lower threshold for candidate selection
  maxCandidates: 20,        // Get more candidates for reranking
  minSimilarityForRerank: 0.4  // Only rerank if vector similarity is good enough
};

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class EmbeddingsService {
  private static instance: EmbeddingsService;

  private constructor() {}

  public static getInstance(): EmbeddingsService {
    if (!this.instance) {
      this.instance = new EmbeddingsService();
    }
    return this.instance;
  }

  async getEmbedding(input: string, options?: EmbeddingOptions): Promise<number[]> {
    const result = await generateEmbedding(input, options);
    if (!result) throw new Error('Failed to generate embedding');
    return result;
  }

  async getEmbeddings(inputs: string[], options?: EmbeddingOptions): Promise<number[][]> {
    return generateEmbeddings(inputs, options);
  }
}

export const embeddingsService = EmbeddingsService.getInstance();

export function useEmbeddingsService() {
  async function generateMessageEmbeddings(input: string[]): Promise<number[][]> {
    return await embeddingsService.getEmbeddings(input, { task: 'retrieval.passage' });
  }

  async function storeMessage(
    content: string,
    userId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    metadata: Record<string, any> = {}
  ) {
    try {
      // Generate embedding
      const embeddings = await generateMessageEmbeddings([content]);
      
      // Store message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          content,
          role,
          metadata,
          session_id: sessionId
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Store vector
      const { error: vectorError } = await supabase
        .from('message_vectors')
        .insert({
          message_id: message.id,
          embedding: embeddings[0]
        });

      if (vectorError) throw vectorError;

      return message;
    } catch (error) {
      console.error('Error storing message:', error);
      throw error;
    }
  }

  async function getRelevantContext(
    content: string,
    userId: string,
    sessionId: string,
    limit = 5,
    useReranker = false
  ): Promise<RankedResult[]> {
    try {
      // Generate embedding for search
      const embeddings = await generateMessageEmbeddings([content]);
      
      // Get more candidates if using reranker
      const candidateLimit = useReranker ? SCORING_CONFIG.maxCandidates : limit;
      
      // Use direct vector operations with Supabase's pgvector
      const { data: messages, error } = await supabase
        .rpc('match_messages', {
          query_embedding: embeddings[0],
          similarity_threshold: SCORING_CONFIG.similarityThreshold,
          match_count: candidateLimit,
          session_uuid: sessionId
        });

      if (error) throw error;

      // Map initial results
      const candidates = messages.map((msg: MessageWithSimilarity) => ({
        message: msg,
        similarity: msg.similarity
      }));

      // Only proceed with reranking if we have good vector matches
      const bestSimilarity = Math.max(...candidates.map((c: RankedResult) => c.similarity));
      const shouldRerank = useReranker && bestSimilarity >= SCORING_CONFIG.minSimilarityForRerank;

      if (!shouldRerank) {
        return candidates
          .sort((a: RankedResult, b: RankedResult) => b.similarity - a.similarity)
          .slice(0, limit);
      }

      // Rerank results
      const rerankedResults = await rerankResults(content, candidates, limit);
      
      // Combine scores using optimal weights from testing
      const finalResults = rerankedResults
        .map(result => ({
          ...result,
          finalScore: result.rerankedScore 
            ? (SCORING_CONFIG.vectorWeight * result.similarity + 
               SCORING_CONFIG.rerankerWeight * result.rerankedScore)
            : result.similarity
        }))
        .sort((a, b) => (b.finalScore! - a.finalScore!))
        .slice(0, limit);

      return finalResults;
    } catch (error) {
      console.error('Error getting relevant context:', error);
      throw error;
    }
  }

  async function rerankResults(
    query: string,
    candidates: RankedResult[],
    limit: number
  ): Promise<RankedResult[]> {
    try {
      const { scores } = await rerank(
        query,
        candidates.map(c => c.message.content),
        { limit }
      );
      
      // Add reranked scores to results
      return candidates.map((result, i) => ({
        ...result,
        rerankedScore: scores[i]
      }));
    } catch (error) {
      console.error('Error reranking results:', error);
      return candidates;  // Fall back to original ranking
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
    generateMessageEmbeddings,
    storeMessage,
    getRelevantContext,
    runLatencyTest,
    rerankResults
  };
}
