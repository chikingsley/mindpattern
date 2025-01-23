import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { useEmbeddingsService } from './EmbeddingsService';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../prisma/supabase';

// Initialize Supabase client for tests
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe('EmbeddingsService', () => {
  const service = useEmbeddingsService();
  let testUserId: string;
  let testSessionId: string;

  // Setup test data
  beforeAll(async () => {
    const uniqueId = Date.now().toString();
    
    // Create test user
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

    // Create test session
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

  // Cleanup test data
  afterAll(async () => {
    // Delete test messages and vectors
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('session_id', testSessionId);

    if (messagesError) console.error('Error cleaning up messages:', messagesError);

    // Delete test session
    const { error: sessionError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', testSessionId);

    if (sessionError) console.error('Error cleaning up session:', sessionError);

    // Delete test user
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);

    if (userError) console.error('Error cleaning up user:', userError);
  });

  describe('Message Storage', () => {
    it('should store message with vector embedding', async () => {
      const content = 'Test message for vector storage';
      const result = await service.storeMessage(
        content,
        testUserId,
        testSessionId,
        'user'
      );

      expect(result).toBeDefined();
      expect(result.content).toBe(content);

      // Verify vector was created
      const { data: vector } = await supabase
        .from('message_vectors')
        .select()
        .eq('message_id', result.id)
        .single();

      expect(vector).toBeDefined();
      expect(vector!.embedding).toHaveLength(1024);
    });
  });

  describe('Context Retrieval', () => {
    it('should retrieve relevant context based on similarity', async () => {
      // Store some test messages
      const messages = [
        'First test message about cats',
        'Second test message about dogs',
        'Third test message about cats and their behavior',
        'Fourth test message about weather'
      ];

      for (const content of messages) {
        await service.storeMessage(
          content,
          testUserId,
          testSessionId,
          'user'
        );
      }

      // Search for cat-related content
      const results = await service.getRelevantContext(
        'Tell me about cats',
        testUserId,
        testSessionId,
        2
      );

      expect(results).toHaveLength(2);
      expect(results.some(r => r.message.content.includes('cats'))).toBe(true);
      expect(results[0].similarity).toBeGreaterThan(0.65);
    });

    it('should respect similarity threshold', async () => {
      const results = await service.getRelevantContext(
        'Something completely unrelated to previous messages',
        testUserId,
        testSessionId,
        5,
        false
      );

      results.forEach(result => {
        expect(result.similarity).toBeGreaterThan(0.65);
      });
    });
  });

  describe('Reranker', () => {
    it('should rerank results based on semantic similarity', async () => {
      // Store test messages with varying relevance
      const messages = [
        'Information about cats and their behavior',
        'Dogs are great pets',
        'Cats make wonderful companions',
        'Weather forecast for tomorrow',
        'The history of domestic cats'
      ];

      for (const content of messages) {
        await service.storeMessage(
          content,
          testUserId,
          testSessionId,
          'user'
        );
      }

      const results = await service.getRelevantContext(
        'Tell me about having cats as pets',
        testUserId,
        testSessionId,
        3,
        true
      );

      expect(results).toBeDefined();
      expect(results[0].rerankedScore).toBeDefined();
      expect(results[0].finalScore).toBeDefined();
      expect(results[0].message.content.toLowerCase()).toContain('cats');
      
      // Verify scores are properly combined
      results.forEach(result => {
        expect(result.finalScore).toBe((result.similarity + result.rerankedScore!) / 2);
      });

      // Verify ordering
      const scores = results.map(r => r.finalScore!);
      expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    });

    it('should handle reranker failures gracefully', async () => {
      // Test with invalid API key to force failure
      const originalKey = process.env.NEXT_PUBLIC_JINA_API_KEY;
      process.env.NEXT_PUBLIC_JINA_API_KEY = 'invalid_key';

      try {
        const results = await service.getRelevantContext(
          'Test query',
          testUserId,
          testSessionId,
          5,
          true
        );

        // Should fall back to vector similarity
        expect(results).toBeDefined();
        expect(results[0].similarity).toBeGreaterThan(0.65);
        expect(results[0].rerankedScore).toBeUndefined();
      } finally {
        process.env.NEXT_PUBLIC_JINA_API_KEY = originalKey;
      }
    });
  });

  describe('Performance', () => {
    it('should measure latency for different message lengths', async () => {
      const results = await service.runLatencyTest(testUserId, testSessionId);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.messageLength).toBeGreaterThan(0);
        expect(result.storeLatency).toBeGreaterThan(0);
        expect(result.retrieveLatency).toBeGreaterThan(0);
        expect(result.totalLatency).toBe(result.storeLatency + result.retrieveLatency);
      });
    });
  });
}); 