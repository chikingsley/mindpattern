import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { JINA_API_KEY, getEmbeddingConfig } from '@/config/api';

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

// Test data with clear themes and expected matches
const testData = [
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
  console.log(`\nTesting with threshold: ${threshold}`);
  const sessionId = self.crypto.randomUUID();
  const startTime = performance.now();
  
  // Store test data
  console.log('Storing test data...');
  for (const item of testData) {
    const embedding = await generateEmbedding(item.content, { task: 'retrieval.passage' });
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

  // Run test queries
  const matchedQueries = [];
  let totalLatency = 0;
  let correctMatches = 0;
  let totalExpectedMatches = 0;

  for (const testQuery of testQueries) {
    const queryStart = performance.now();
    const queryEmbedding = await generateEmbedding(testQuery.query, { task: 'retrieval.passage' });
    
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
    throw new Error('JINA_API_KEY is not set in environment variables');
  }

  await ensureUser(supabase, userId);

  // First test the threshold
  const threshold = 0.65;
  
  // Clear previous test data
  await supabase
    .from('messages')
    .delete()
    .eq('user_id', userId);

  const result = await runTestWithThreshold(supabase, userId, threshold);
  
  // Print detailed analysis
  console.log('\nDetailed Analysis:');
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

export async function insertDummyData(supabase: SupabaseClient<Database>, userId: string) {
  // Ensure user exists before proceeding
  await ensureUser(supabase, userId);

  const sessionId = self.crypto.randomUUID();
  
  console.log('Inserting dummy data...');
  console.log('User ID:', userId);
  console.log('Session ID:', sessionId);
  
  const dummyData = [
    {
      content: "Today I learned about mindfulness meditation and its benefits",
      metadata: { category: 'meditation', mood: 'positive' }
    },
    {
      content: "I'm feeling stressed about my upcoming presentation at work",
      metadata: { category: 'work', mood: 'anxious' }
    },
    {
      content: "My daily meditation practice is helping me stay focused",
      metadata: { category: 'meditation', mood: 'positive' }
    },
    {
      content: "Need advice on managing work-life balance",
      metadata: { category: 'work', mood: 'neutral' }
    },
    {
      content: "Feeling overwhelmed with all my responsibilities",
      metadata: { category: 'general', mood: 'negative' }
    }
  ];

  // Get all embeddings at once
  const embeddings = await generateEmbeddings(dummyData.map(item => item.content));
  
  // Insert all messages with their corresponding embeddings
  const messages = dummyData.map((item, index) => ({
    user_id: userId,
    session_id: sessionId,
    content: item.content,
    role: 'user' as const,
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

async function generateEmbeddings(inputs: string[]): Promise<number[][]> {
  const config = getEmbeddingConfig();
  
  console.log('Generating embeddings for', inputs.length, 'inputs');
  
  const response = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`
    },
    body: JSON.stringify({
      ...config,
      input: inputs
    })
  });
  
  const responseText = await response.text();
  
  if (!response.ok) {
    throw new Error(`Jina API error: ${responseText}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Failed to parse API response: ${responseText}`);
  }
  
  if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
    throw new Error(`Invalid API response format: ${JSON.stringify(result)}`);
  }
  
  return result.data.map((item: any) => item.embedding);
}

async function generateEmbedding(input: string, options?: { task: 'text-matching' | 'retrieval.passage' | 'retrieval.query' }): Promise<number[]> {
  const config = getEmbeddingConfig();
  if (options) {
    config.task = options.task;
  }
  
  console.log('Generating embedding for:', input);
  
  const response = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`
    },
    body: JSON.stringify({
      ...config,
      input: [input]
    })
  });
  
  const responseText = await response.text();
  
  if (!response.ok) {
    throw new Error(`Jina API error: ${responseText}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Failed to parse API response: ${responseText}`);
  }
  
  if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
    throw new Error(`Invalid API response format: ${JSON.stringify(result)}`);
  }
  
  return result.data[0].embedding;
}

async function testEmbeddingPerformance(inputs: string[], options: { embed_batch_size: number; task: 'text-matching' | 'retrieval.passage' | 'retrieval.query' }): Promise<{ improvement: number }> {
  const startTime = performance.now();
  const embeddings = await generateEmbeddings(inputs);
  const sequentialTime = performance.now() - startTime;

  const parallelEmbeddings = await Promise.all(
    Array(Math.ceil(inputs.length / options.embed_batch_size)).fill(0).map((_, i) => {
      const batch = inputs.slice(i * options.embed_batch_size, (i + 1) * options.embed_batch_size);
      return generateEmbeddings(batch);
    })
  );

  const parallelTime = performance.now() - startTime;

  const improvement = ((sequentialTime - parallelTime) / sequentialTime) * 100;

  return { improvement };
}
