export const runtime = 'edge'

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

// Initialize edge-compatible Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
    global: { 
      headers: { 'x-my-custom-header': 'mindpattern-edge' },
      fetch: fetch
    }
  }
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

export async function storeMessage(
  content: string,
  userId: string,
  sessionId: string,
  role: 'user' | 'assistant',
  metadata: Record<string, any> = {}
): Promise<Message> {
  const embeddings = await generateEmbeddings([content]);
  
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

  const { error: vectorError } = await supabase
    .from('message_vectors')
    .insert({
      message_id: message.id,
      embedding: embeddings[0]
    });

  if (vectorError) throw vectorError;
  return message;
}

export async function getRelevantContext(
  content: string,
  userId: string,
  sessionId: string,
  limit = 5,
  useReranker = false
): Promise<RankedResult[]> {
  const embeddings = await generateEmbeddings([content]);
  const candidateLimit = useReranker ? SCORING_CONFIG.maxCandidates : limit;
  
  const { data: messages, error } = await supabase
    .rpc('match_messages', {
      query_embedding: embeddings[0],
      similarity_threshold: SCORING_CONFIG.similarityThreshold,
      match_count: candidateLimit,
      session_uuid: sessionId
    });

  if (error) throw error;

  const candidates = messages.map((msg: MessageWithSimilarity) => ({
    message: msg,
    similarity: msg.similarity
  }));

  if (!candidates.length) return [];

  const bestSimilarity = Math.max(...candidates.map((c: RankedResult) => c.similarity));
  const shouldRerank = useReranker && bestSimilarity >= SCORING_CONFIG.minSimilarityForRerank;

  if (!shouldRerank) {
    return candidates
      .sort((a: RankedResult, b: RankedResult) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  try {
    const { scores } = await rerank(
      content,
      candidates.map((c: RankedResult) => c.message.content),
      { limit }
    );

    return candidates
      .map((result: RankedResult, i: number) => ({
        ...result,
        rerankedScore: scores[i],
        finalScore: SCORING_CONFIG.vectorWeight * result.similarity + 
                   SCORING_CONFIG.rerankerWeight * scores[i]
      }))
      .sort((a: RankedResult, b: RankedResult) => (b.finalScore! - a.finalScore!))
      .slice(0, limit);
  } catch {
    return candidates
      .sort((a: RankedResult, b: RankedResult) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

export function useEmbeddingsService() {
  async function generateMessageEmbeddings(input: string[]): Promise<number[][]> {
    return await embeddingsService.getEmbeddings(input, { task: 'retrieval.passage' });
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
    runLatencyTest
  };
}
