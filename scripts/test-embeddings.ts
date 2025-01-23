import { useEmbeddingsService } from '../services/embeddings/EmbeddingsService';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

interface ScoringApproach {
  name: string;
  description: string;
  combine: (similarity: number, rerankedScore: number) => number;
}

interface TestResult {
  query: string;
  useReranker: boolean;
  executionTime: number;
  topResults: Array<{
    content: string;
    similarity: number;
    rerankedScore?: number;
    finalScore?: number;
  }>;
  note?: string;
  scale?: string;
}

async function testQueries() {
  const service = useEmbeddingsService();
  
  // Initialize Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Create a test user
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
  const userId = user.id;

  // Create a test session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      user_id: userId
    })
    .select()
    .single();

  if (sessionError) throw sessionError;
  const sessionId = session.id;

  const testResults: TestResult[] = [];

  try {
    // Base messages for different emotional states and topics
    const baseMessages = [
      // Anxiety and Stress
      "I've been feeling quite anxious lately, especially at work",
      "My team has been supportive, but I still struggle with deadlines",
      "Yesterday I had a panic attack during a meeting",
      // Coping Strategies
      "I'm practicing meditation to help manage stress",
      "The breathing exercises you suggested are helping",
      "Today was better, I felt more in control",
      // Career and Future
      "Sometimes I worry about my future career prospects",
      "The workplace environment feels overwhelming",
      // Progress and Improvement
      "I've started using the mindfulness techniques we discussed",
      "My productivity has improved since implementing these strategies",
      // Additional Context
      "The team dynamics have changed since our last discussion",
      "I'm finding it easier to communicate with colleagues",
      "The new project management approach is working well",
      "I've noticed improvements in my sleep patterns",
      "The weekly check-ins are helping me stay focused"
    ];

    // Generate variations for different scales
    const generateMessages = (scale: number) => {
      const variations = [
        ...baseMessages,
        ...baseMessages.map(msg => msg.replace('work', 'meetings')),
        ...baseMessages.map(msg => msg.replace('anxiety', 'stress')),
        ...baseMessages.map(msg => msg.replace('meditation', 'exercise')),
        ...baseMessages.map(msg => msg.replace('breathing', 'relaxation')),
      ];

      // Multiply messages based on scale
      return Array(scale).fill(variations).flat();
    };

    // Test different scales
    const scales = [
      { name: 'small', factor: 1, messages: generateMessages(1) },
      { name: 'medium', factor: 2, messages: generateMessages(2) },
      { name: 'large', factor: 4, messages: generateMessages(4) }
    ];

    // Scoring approaches with different weights and strategies
    const scoringApproaches: ScoringApproach[] = [
      {
        name: "Simple Average",
        description: "Equal weights for vector and reranker scores",
        combine: (s, r) => (s + r) / 2
      },
      {
        name: "Vector Heavy (0.8/0.2)",
        description: "Emphasizes vector similarity",
        combine: (s, r) => 0.8 * s + 0.2 * r
      },
      {
        name: "Reranker Heavy (0.2/0.8)",
        description: "Emphasizes semantic reranking",
        combine: (s, r) => 0.2 * s + 0.8 * r
      },
      {
        name: "Balanced (0.6/0.4)",
        description: "Slight emphasis on vector similarity",
        combine: (s, r) => 0.6 * s + 0.4 * r
      },
      {
        name: "Dynamic Threshold",
        description: "Uses vector similarity threshold",
        combine: (s, r) => s > 0.8 ? s : (0.5 * s + 0.5 * r)
      },
      {
        name: "Geometric Mean",
        description: "Balanced scoring using geometric mean",
        combine: (s, r) => Math.sqrt(s * r)
      },
      {
        name: "Harmonic Mean",
        description: "Emphasizes lower scores",
        combine: (s, r) => 2 / (1/s + 1/r)
      }
    ];

    // Test queries with different characteristics
    const queries = [
      {
        text: "Tell me about anxiety at work",
        useReranker: false,
        note: "Direct keyword match"
      },
      {
        text: "What coping mechanisms have been helpful?",
        useReranker: true,
        note: "Semantic relationship"
      },
      {
        text: "How has your mental health improved?",
        useReranker: true,
        note: "Abstract concept"
      },
      {
        text: "What strategies help with workplace stress?",
        useReranker: true,
        note: "Combined concepts"
      },
      {
        text: "Tell me about your progress",
        useReranker: true,
        note: "General inquiry"
      },
      {
        text: "How do you handle team dynamics?",
        useReranker: true,
        note: "Indirect relationship"
      }
    ];

    // Run tests for each scale
    for (const scale of scales) {
      console.log(`\n=== Testing with ${scale.name} scale (${scale.messages.length} messages) ===`);
      
      // Store messages
      const startStore = performance.now();
      await Promise.all(scale.messages.map(content => 
        service.storeMessage(content, userId, sessionId, 'user')
      ));
      const storeTime = performance.now() - startStore;
      
      // Run queries
      for (const query of queries) {
        const startQuery = performance.now();
        const results = await service.getRelevantContext(
          query.text,
          userId,
          sessionId,
          5,
          query.useReranker
        );
        const queryTime = performance.now() - startQuery;

        testResults.push({
          query: query.text,
          useReranker: query.useReranker,
          executionTime: queryTime,
          topResults: results.map(r => ({
            content: r.message.content,
            similarity: r.similarity,
            rerankedScore: r.rerankedScore,
            finalScore: r.finalScore
          })),
          note: query.note,
          scale: scale.name
        });

        // Add delay between queries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Clean up messages for this scale
      await supabase
        .from('messages')
        .delete()
        .eq('session_id', sessionId);
    }

    // Print comprehensive results
    console.log('\n======= TEST RESULTS =======');
    
    // Scale Performance
    console.log('\n=== Scale Performance ===');
    for (const scale of scales) {
      const scaleResults = testResults.filter(r => r.scale === scale.name);
      const avgTime = scaleResults.reduce((sum, r) => sum + r.executionTime, 0) / scaleResults.length;
      console.log(`\n${scale.name.toUpperCase()} SCALE:`);
      console.log(`Messages: ${scale.messages.length}`);
      console.log(`Average query time: ${avgTime.toFixed(2)}ms`);
      console.log(`With reranker: ${scaleResults.filter(r => r.useReranker).reduce((sum, r) => sum + r.executionTime, 0) / scaleResults.filter(r => r.useReranker).length}ms`);
      console.log(`Without reranker: ${scaleResults.filter(r => !r.useReranker).reduce((sum, r) => sum + r.executionTime, 0) / scaleResults.filter(r => !r.useReranker).length}ms`);
    }

    // Query Type Performance
    console.log('\n=== Query Type Performance ===');
    for (const query of queries) {
      const queryResults = testResults.filter(r => r.query === query.text);
      console.log(`\n"${query.text}" (${query.note}):`);
      console.log(`Average similarity: ${(queryResults.reduce((sum, r) => sum + r.topResults[0].similarity, 0) / queryResults.length * 100).toFixed(1)}%`);
      if (query.useReranker) {
        console.log(`Average reranked score: ${(queryResults.reduce((sum, r) => sum + (r.topResults[0].rerankedScore || 0), 0) / queryResults.length * 100).toFixed(1)}%`);
      }
    }

    // Scoring Approach Comparison
    console.log('\n=== Scoring Approach Comparison ===');
    const rerankedResults = testResults.filter(r => r.useReranker && r.topResults[0].rerankedScore);
    
    scoringApproaches.forEach(approach => {
      const scores = rerankedResults.map(result => ({
        score: approach.combine(result.topResults[0].similarity, result.topResults[0].rerankedScore!),
        scale: result.scale,
        query: result.query
      }));

      console.log(`\n${approach.name}:`);
      console.log(`Description: ${approach.description}`);
      console.log(`Average score: ${(scores.reduce((sum, s) => sum + s.score, 0) / scores.length * 100).toFixed(1)}%`);
      console.log('Best performing on:');
      const bestScore = Math.max(...scores.map(s => s.score));
      scores.filter(s => s.score === bestScore).forEach(s => {
        console.log(`- "${s.query}" (${s.scale} scale): ${(s.score * 100).toFixed(1)}%`);
      });
    });

    // Recommendations
    console.log('\n=== Recommendations ===');
    const bestApproach = scoringApproaches
      .map(approach => ({
        name: approach.name,
        avgScore: rerankedResults.reduce((sum, r) => 
          sum + approach.combine(r.topResults[0].similarity, r.topResults[0].rerankedScore!), 0
        ) / rerankedResults.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)[0];

    console.log(`1. Best scoring approach: ${bestApproach.name}`);
    console.log(`2. Optimal scale for response time: ${
      scales.map(scale => ({
        name: scale.name,
        avgTime: testResults.filter(r => r.scale === scale.name)
          .reduce((sum, r) => sum + r.executionTime, 0) / testResults.filter(r => r.scale === scale.name).length
      }))
      .sort((a, b) => a.avgTime - b.avgTime)[0].name
    }`);
    console.log(`3. Reranker impact: ${
      (rerankedResults.reduce((sum, r) => 
        sum + (r.topResults[0].rerankedScore! - r.topResults[0].similarity), 0
      ) / rerankedResults.length * 100).toFixed(1)
    }% average score change`);

  } finally {
    // Final cleanup
    console.log('\nCleaning up test data...');
    await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    await supabase
      .from('users')
      .delete()
      .eq('id', userId);
  }
}

testQueries().catch(console.error); 