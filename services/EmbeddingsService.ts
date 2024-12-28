import axios from 'axios';
import { useDatabaseService } from './DatabaseService';
import { useSupabaseClient } from '@/utils/supabase';
import type { Interaction } from '@/types/database';

const JINA_API_KEY = process.env.NEXT_PUBLIC_JINA_API_KEY;
const CHUNK_SIZE = 512; // Adjust based on your needs
const CHUNK_OVERLAP = 50;

export function useEmbeddingsService() {
  const supabase = useSupabaseClient();
  const dbService = useDatabaseService();

  async function generateEmbeddings(input: string[]): Promise<number[][]> {
    const data = {
      model: 'jina-embeddings-v3',
      task: 'text-matching',
      late_chunking: true, // Enable late chunking
      chunk_size: CHUNK_SIZE,
      chunk_overlap: CHUNK_OVERLAP,
      dimensions: 1024,
      embedding_type: 'float',
      input
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JINA_API_KEY}`
      }
    };

    try {
      const response = await axios.post('https://api.jina.ai/v1/embeddings', data, config);
      return response.data.embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  async function storeInteractionWithEmbeddings(
    userId: string,
    content: string,
    inputType: 'text' | 'voice',
    sessionId?: string,
    metadata?: Record<string, any>
  ) {
    // Create interaction
    const interaction = await dbService.createInteraction({
      user_id: userId,
      content,
      input_type: inputType,
      session_id: sessionId
    });

    if (!interaction) throw new Error('Failed to create interaction');

    // Generate embeddings
    const embeddings = await generateEmbeddings([content]);
    
    // Store embeddings
    await dbService.storeEmbedding({
      interaction_id: interaction.id,
      embedding: embeddings[0],
      embedding_type: 'jina-v3'
    });

    // Store metadata if provided
    if (metadata) {
      await dbService.storeMetadata({
        interaction_id: interaction.id,
        metadata
      });
    }

    return interaction;
  }

  async function searchSimilarInteractions(
    content: string,
    userId: string,
    limit = 5
  ): Promise<Interaction[]> {
    // Generate embedding for search query
    const embeddings = await generateEmbeddings([content]);
    const searchEmbedding = embeddings[0];

    // Perform vector similarity search
    const { data: similarInteractions, error } = await supabase
      .rpc('match_interactions', {
        query_embedding: searchEmbedding,
        match_threshold: 0.7, // Adjust threshold as needed
        match_count: limit,
        user_id: userId
      });

    if (error) throw error;
    return similarInteractions;
  }

  async function getContextForPrompt(
    content: string,
    userId: string,
    limit = 5
  ): Promise<string> {
    const similarInteractions = await searchSimilarInteractions(content, userId, limit);
    
    // Format context
    const context = similarInteractions
      .map(interaction => `[${new Date(interaction.timestamp).toLocaleString()}] ${interaction.content}`)
      .join('\n\n');

    return context;
  }

  return {
    generateEmbeddings,
    storeInteractionWithEmbeddings,
    searchSimilarInteractions,
    getContextForPrompt
  };
}
