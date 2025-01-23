import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { embeddingsService } from './EmbeddingsService';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../prisma/supabase';

// Validate required environment variables
if (!process.env.JINA_API_KEY) {
  throw new Error('JINA_API_KEY environment variable is required');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables are required');
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false }
  }
);

describe('EmbeddingsService Edge', () => {
  let testUserId: string;
  let testSessionId: string;

  beforeAll(async () => {
    const uniqueId = Date.now().toString();
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: `test-user-${uniqueId}`,
        email: `test-${uniqueId}@example.com`
      })
      .select()
      .single();

    if (userError) throw userError;
    testUserId = user.id;

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: testUserId
      })
      .select()
      .single();

    if (sessionError) throw sessionError;
    testSessionId = session.id;
  });

  afterAll(async () => {
    await supabase.from('messages').delete().eq('session_id', testSessionId);
    await supabase.from('sessions').delete().eq('id', testSessionId);
    await supabase.from('users').delete().eq('id', testUserId);
  });

  describe('Edge Storage', () => {
    it('should store message with vector in edge environment', async () => {
      const content = 'Test message for edge vector storage';
      const result = await embeddingsService.storeMessageAndVector(
        content,
        testUserId,
        testSessionId,
        'user'
      );

      expect(result).toBeDefined();
      expect(result.content).toBe(content);

      const { data: vector } = await supabase
        .from('message_vectors')
        .select()
        .eq('message_id', result.id)
        .single();

      expect(vector).toBeDefined();
      expect(vector!.embedding).toBeDefined();
    });
  });

  describe('Edge Retrieval', () => {
    it('should retrieve context with vector similarity in edge environment', async () => {
      const messages = [
        'First test message about cats',
        'Second test message about dogs',
        'Third test message about cats and their behavior'
      ];

      for (const content of messages) {
        await embeddingsService.storeMessageAndVector(content, testUserId, testSessionId, 'user');
      }

      const results = await embeddingsService.getRelevantContext(
        'Tell me about cats',
        testUserId,
        testSessionId,
        2,
        false
      );

      expect(results).toHaveLength(2);
      expect(results[0].similarity).toBeGreaterThan(0.3);
      expect(results.some((r: { message: { content: string } }) => r.message.content.includes('cats'))).toBe(true);
    });

    it('should handle reranking in edge environment', async () => {
      const messages = [
        'Information about cats and their behavior',
        'Dogs are great pets',
        'Cats make wonderful companions'
      ];

      for (const content of messages) {
        await embeddingsService.storeMessageAndVector(content, testUserId, testSessionId, 'user');
      }

      const results = await embeddingsService.getRelevantContext(
        'Tell me about having cats as pets',
        testUserId,
        testSessionId,
        2,
        true
      );

      console.log('Reranking results:', JSON.stringify(results, null, 2));

      expect(results).toBeDefined();
      expect(results).toHaveLength(2);
      expect(results[0].message.content.toLowerCase()).toContain('cats');
      
      // Check if reranking was attempted
      if (results[0].rerankedScore === undefined) {
        console.log('Warning: rerankedScore is undefined. Similarity score:', results[0].similarity);
      }
      
      expect(results[0].rerankedScore).toBeDefined();
      expect(results[0].finalScore).toBeDefined();
    });

    it('should handle reranker failures gracefully in edge environment', async () => {
      const originalKey = process.env.JINA_API_KEY;
      try {
        // Set an invalid API key to force a failure
        process.env.JINA_API_KEY = 'invalid-key';
        
        const results = await embeddingsService.getRelevantContext('Test query', testUserId, testSessionId, 2, true);
        
        expect(results).toBeDefined();
        expect(results[0].similarity).toBeGreaterThan(0.3);
        // When reranker fails, we should fall back to vector similarity only
        expect(results[0].rerankedScore).toBeUndefined();
        expect(results[0].finalScore).toBe(results[0].similarity);
      } finally {
        process.env.JINA_API_KEY = originalKey;
      }
    });
  });
}); 