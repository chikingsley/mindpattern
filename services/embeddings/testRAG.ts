import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { generateEmbedding as generateSingleEmbedding, generateEmbeddings as generateMultipleEmbeddings } from './embeddings';

// Required for tests
const JINA_API_KEY = process.env.NEXT_PUBLIC_JINA_API_KEY;

// Ensure user exists in the users table
async function ensureUser(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  // Try to insert the user
  const { error } = await supabase
    .from('users')
    .insert([{ id: userId }])
    .select()
    .single();

  // Ignore error if user already exists
  if (error && !error.message.includes('duplicate key')) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}

interface TestConfig {
  storageTask: 'text-matching' | 'retrieval.passage';
  queryTask: 'text-matching' | 'retrieval.query';
}

interface TestResult {
  threshold: number;
  accuracy: number;
  avgLatency: number;
  matchedQueries: { 
    query: string; 
    expected: string[]; 
    found: string[];
    similarities?: number[];  
  }[];
}

// Define the content interface
interface TestDataItem {
  content: string;
  theme: string;
}

// Test data with clear themes and expected matches
const testData: TestDataItem[] = [
  // Relationship theme
  { content: "I'm feeling anxious about my relationship with Sarah", theme: "relationship" },
  { content: "My girlfriend Sarah and I had a big fight yesterday", theme: "relationship" },
  { content: "Sarah and I are having communication problems", theme: "relationship" },
  { content: "I'm thinking about breaking up with Sarah", theme: "relationship" },
  
  // Work theme
  { content: "My job at the tech company is really stressful", theme: "work" },
  { content: "I'm worried about meeting my project deadlines", theme: "work" },
  { content: "My boss keeps giving me too much work", theme: "work" },
  { content: "I might quit my job due to burnout", theme: "work" },
  
  // Health theme
  { content: "I've been having trouble sleeping lately", theme: "health" },
  { content: "My anxiety is getting worse day by day", theme: "health" },
  { content: "I started meditation to help with stress", theme: "health" },
  { content: "Been feeling tired and unmotivated", theme: "health" }
];

// Test queries with expected matches (using partial content for matching)
const testQueries = [
  {
    query: "How are things with Sarah?",
    expectedTheme: "relationship",
    mustInclude: ["Sarah"]
  },
  {
    query: "Tell me about your work stress",
    expectedTheme: "work",
    mustInclude: ["stress", "project", "boss"]
  },
  {
    query: "What are you doing about your anxiety?",
    expectedTheme: "health",
    mustInclude: ["meditation", "anxiety"]
  }
];

async function runTestWithThreshold(
  supabase: SupabaseClient<Database>,
  userId: string,
  threshold: number
): Promise<TestResult> {
  console.log(`Testing with threshold: ${threshold}`);
  const startTime = performance.now();
  
  // Run test queries
  const matchedQueries = [];
  let totalLatency = 0;
  let correctMatches = 0;
  let totalExpectedMatches = 0;

  for (const testQuery of testQueries) {
    const queryStart = performance.now();
    const queryEmbedding = await generateSingleEmbedding(testQuery.query, { task: 'retrieval.passage' });
    
    if (!queryEmbedding) continue;

    const { data: matches, error } = await supabase.rpc(
      'match_messages',
      {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: 5,
        in_user_id: userId
      }
    );

    const queryLatency = performance.now() - queryStart;
    totalLatency += queryLatency;

    if (error) {
      console.error('Error running query:', error);
      continue;
    }

    // Check accuracy
    const foundContents = matches?.map(m => m.content) || [];
    const similarities = matches?.map(m => m.similarity) || [];
    const expectedMatches = testData
      .filter(d => d.theme === testQuery.expectedTheme)
      .map(d => d.content);
    
    const correctlyFound = foundContents.filter(content => 
      expectedMatches.includes(content) &&
      testQuery.mustInclude.some(term => 
        content.toLowerCase().includes(term.toLowerCase())
      )
    );

    totalExpectedMatches += testQuery.mustInclude.length;
    correctMatches += correctlyFound.length;

    matchedQueries.push({
      query: testQuery.query,
      expected: expectedMatches,
      found: foundContents,
      similarities
    });

    console.log(`\nQuery: "${testQuery.query}"`);
    console.log('Found matches:');
    foundContents.forEach((content, i) => {
      console.log(`[${similarities[i].toFixed(3)}] ${content}`);
    });
    console.log('Latency:', queryLatency.toFixed(2), 'ms');
  }

  const accuracy = correctMatches / totalExpectedMatches;

  console.log('\nTest Results:');
  console.log('Threshold:', threshold);
  console.log('Accuracy:', (accuracy * 100).toFixed(2) + '%');
  console.log('Average Latency:', (totalLatency / testQueries.length).toFixed(2), 'ms');

  return {
    threshold,
    accuracy,
    avgLatency: totalLatency / testQueries.length,
    matchedQueries
  };
}

export async function testRAG(supabase: SupabaseClient<Database>, userId: string) {
  if (!JINA_API_KEY) {
    throw new Error('JINA_API_KEY is required for RAG testing');
  }

  await ensureUser(supabase, userId);

  // First test the threshold
  const threshold = 0.65;

  // Clear previous test data
  await supabase
    .from('messages')
    .delete()
    .eq('user_id', userId);

  // Store test data
  console.log('Storing test data...');
  const sessionId = self.crypto.randomUUID();
  
  for (const item of testData) {
    const embedding = await generateSingleEmbedding(item.content, { task: 'retrieval.passage' });
    if (!embedding) continue;

    const { error } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        session_id: sessionId,
        content: item.content,
        role: 'user',
        embedding: embedding
      });

    if (error) {
      console.error('Error storing test data:', error);
      continue;
    }
  }

  console.log(`Using ${testData.length} test messages`);
  console.log('\nRunning test queries...');

  const result = await runTestWithThreshold(supabase, userId, threshold);
  
  // Print detailed analysis
  console.log('\nDetailed Analysis:');
  console.log(`Overall Accuracy: ${(result.accuracy * 100).toFixed(1)}%`);
  console.log(`Average Latency: ${result.avgLatency.toFixed(2)}ms`);
  
  result.matchedQueries.forEach(q => {
    console.log(`\nQuery: "${q.query}"`);
    console.log('Matches by similarity:');
    q.found.forEach((content, i) => {
      const similarity = q.similarities?.[i] || 0;
      const isRelevant = q.expected.includes(content) && 
        testQueries.find(tq => tq.query === q.query)?.mustInclude.some(term => 
          content.toLowerCase().includes(term.toLowerCase())
        );
      console.log(`[${similarity.toFixed(3)}] ${isRelevant ? '✓' : '✗'} ${content}`);
    });
  });

  // Now test parallel vs sequential performance
  console.log('\nTesting Parallel vs Sequential Performance');
  
  // Generate larger test set
  const largeTestSet = [];
  for (let i = 0; i < 5; i++) {  // 5 repetitions = 60 messages
    largeTestSet.push(...testData.map(d => d.content));
  }

  // Test with different batch sizes
  const batchSizes = [5, 10, 15, 20];
  
  console.log('\nPerformance Test Results:');
  for (const batchSize of batchSizes) {
    console.log(`\nBatch Size: ${batchSize}`);
    const perfResult = await testEmbeddingPerformance(largeTestSet, {
      embed_batch_size: batchSize,
      task: 'retrieval.passage'
    });
    
    if (perfResult.improvement > 0) {
      console.log(`✓ Parallel processing ${perfResult.improvement.toFixed(2)}% faster`);
    } else {
      console.log(`✗ Sequential processing ${(-perfResult.improvement).toFixed(2)}% faster`);
    }
  }
}

interface DummyDataItem {
  content: string;
  metadata: {
    type: string;
    sentiment: string;
  };
}

export async function insertDummyData(supabase: SupabaseClient<Database>, userId: string): Promise<{ count: number; sessionId: string }> {
  // Ensure user exists before proceeding
  await ensureUser(supabase, userId);

  const sessionId = self.crypto.randomUUID();
  
  console.log('Inserting dummy data...');
  console.log('User ID:', userId);
  console.log('Session ID:', sessionId);
  
  const dummyData: DummyDataItem[] = [
    {
      content: "I've been feeling really down lately",
      metadata: {
        type: "mood",
        sentiment: "negative"
      }
    },
    {
      content: "Today was actually a good day",
      metadata: {
        type: "mood",
        sentiment: "positive"
      }
    },
    {
      content: "I'm worried about my future",
      metadata: {
        type: "concern",
        sentiment: "negative"
      }
    },
    {
      content: "Made progress on my goals",
      metadata: {
        type: "achievement",
        sentiment: "positive"
      }
    }
  ];

  // Get all embeddings at once
  const embeddings = await generateMultipleEmbeddings(dummyData.map((item: DummyDataItem) => item.content));
  
  // Insert all messages with their corresponding embeddings
  const messages = dummyData.map((item: DummyDataItem, index) => ({
    user_id: userId,
    session_id: sessionId,
    content: item.content,
    role: 'user',
    metadata: item.metadata,
    embedding: embeddings[index]
  }));
  
  const { data, error } = await supabase
    .from('messages')
    .insert(messages)
    .select();
    
  if (error) {
    console.error('Error inserting dummy data:', error);
    throw error;
  }
  
  console.log('Dummy data insertion complete!');
  return { count: messages.length, sessionId };
}

// Helper function to calculate mean of an array
function calculateMean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

async function generateEmbeddings(inputs: string[]): Promise<number[][]> {
  const result = await generateMultipleEmbeddings(inputs);
  if (!result.every(embedding => embedding !== null)) {
    throw new Error('Failed to generate some embeddings');
  }
  return result.filter((embedding): embedding is number[] => embedding !== null);
}

async function generateEmbedding(input: string, options?: { task: 'text-matching' | 'retrieval.passage' | 'retrieval.query' }): Promise<number[]> {
  const result = await generateSingleEmbedding(input, options);
  if (!result) {
    throw new Error(`Failed to generate embedding for input: ${input}`);
  }
  return result;
}

async function testEmbeddingPerformance(inputs: string[], options: { embed_batch_size: number; task: 'text-matching' | 'retrieval.passage' | 'retrieval.query' }): Promise<{ improvement: number }> {
  // Start with single embeddings
  const startSingle = performance.now();
  const singleResults = await Promise.all(inputs.map(m => generateSingleEmbedding(m, { task: options.task })));
  const singleTime = performance.now() - startSingle;

  // Then try with batching
  const startBatch = performance.now();
  const batchResults = await generateMultipleEmbeddings(inputs);
  const batchTime = performance.now() - startBatch;

  // Calculate improvement
  const improvement = ((singleTime - batchTime) / singleTime) * 100;

  console.log(`Single processing time: ${singleTime}ms`);
  console.log(`Batch processing time: ${batchTime}ms`);
  console.log(`Improvement: ${improvement.toFixed(2)}%`);

  return { improvement };
}
