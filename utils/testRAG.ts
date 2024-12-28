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

export async function testRAG(supabase: SupabaseClient<Database>, userId: string) {
  if (!JINA_API_KEY) {
    throw new Error('JINA_API_KEY is not set in environment variables');
  }

  // Ensure user exists before proceeding
  await ensureUser(supabase, userId);

  const sessionId = self.crypto.randomUUID();
  
  console.log('Starting RAG tests...');
  console.log('User ID:', userId);
  console.log('Session ID:', sessionId);

  // Test 1: Basic store and retrieve
  console.log('\nTest 1: Basic store and retrieve');
  try {
    const testMessage = "I'm feeling anxious about my relationship with Sarah";
    console.log('Test message:', testMessage);
    
    // Store message
    const embedding = await generateEmbedding(testMessage);
    console.log('Generated embedding length:', embedding.length);
    
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        session_id: sessionId,
        content: testMessage,
        role: 'user',
        metadata: { test: 'basic_retrieval' },
        embedding
      });
      
    if (insertError) {
      console.error('Test 1 - Insert Error:', insertError);
      throw insertError;
    }

    // Retrieve similar
    const queryMessage = "Tell me about my anxiety with relationships";
    console.log('Query message:', queryMessage);
    
    const queryEmbedding = await generateEmbedding(queryMessage);
    console.log('Query embedding length:', queryEmbedding.length);
    
    const { data: similar, error: searchError } = await supabase.rpc('match_messages', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5,
      in_user_id: userId
    });
    
    if (searchError) {
      console.error('Test 1 - Search Error:', searchError);
      throw searchError;
    }

    console.log('Retrieved messages:', similar?.length);
    if (similar?.[0]) {
      console.log('First match:');
      console.log('- Content:', similar[0].content);
      console.log('- Similarity:', similar[0].similarity);
    }
  } catch (error: any) {
    console.error('Test 1 failed:', error?.message || error);
    throw error;
  }
  
  // Test 2: Semantic similarity
  console.log('\nTest 2: Semantic similarity');
  try {
    const variations = [
      "I'm worried about my girlfriend Sarah",
      "My relationship with Sarah makes me nervous",
      "Dating Sarah is causing me stress",
      "I have concerns about my future with Sarah"
    ];
    
    // Store variations
    console.log('Storing variations...');
    for (const msg of variations) {
      const embedding = await generateEmbedding(msg);
      console.log(`Generated embedding for: "${msg.slice(0, 30)}..."`);
      
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          user_id: userId,
          session_id: sessionId,
          content: msg,
          role: 'user',
          metadata: { test: 'semantic_similarity' },
          embedding
        });
        
      if (insertError) {
        console.error('Test 2 - Insert Error:', insertError);
        throw insertError;
      }
    }
    
    // Test retrieval with different phrasing
    const queryMessage = "How do I feel about Sarah?";
    console.log('\nQuerying:', queryMessage);
    
    const queryEmbedding = await generateEmbedding(queryMessage);
    const { data: similar, error: searchError } = await supabase.rpc('match_messages', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5,
      in_user_id: userId
    });
    
    if (searchError) {
      console.error('Test 2 - Search Error:', searchError);
      throw searchError;
    }

    console.log('Found similar messages:', similar?.length);
    console.log('Messages retrieved:');
    similar?.forEach(msg => {
      console.log(`- [${msg.similarity.toFixed(2)}] ${msg.content}`);
    });
  } catch (error: any) {
    console.error('Test 2 failed:', error?.message || error);
    throw error;
  }
  
  // Test 3: Performance benchmark
  console.log('\nTest 3: Performance testing');
  try {
    const testMessages = [
      "Quick test message",
      "Medium length message about feeling anxious today",
      "Longer message discussing multiple topics and emotions in detail, including past experiences and current feelings"
    ];
    
    const results = [];
    
    for (const msg of testMessages) {
      console.log(`\nTesting with message length: ${msg.length}`);
      const start = performance.now();
      
      // Test storage
      const storeStart = performance.now();
      const embedding = await generateEmbedding(msg);
      console.log('Generated embedding length:', embedding.length);
      
      const { error: storeError } = await supabase
        .from('messages')
        .insert({
          user_id: userId,
          session_id: sessionId,
          content: msg,
          role: 'user',
          metadata: { test: 'performance' },
          embedding
        });
        
      if (storeError) {
        console.error('Test 3 - Insert Error:', storeError);
        throw storeError;
      }
      const storeLatency = performance.now() - storeStart;
      
      // Test retrieval
      const retrieveStart = performance.now();
      const queryEmbedding = await generateEmbedding(msg);
      const { error: retrieveError } = await supabase.rpc('match_messages', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5,
        in_user_id: userId
      });
      
      if (retrieveError) {
        console.error('Test 3 - Search Error:', retrieveError);
        throw retrieveError;
      }
      const retrieveLatency = performance.now() - retrieveStart;
      
      results.push({
        messageLength: msg.length,
        storeLatency,
        retrieveLatency,
        totalLatency: storeLatency + retrieveLatency
      });
    }
    
    console.log('\nPerformance results:');
    results.forEach(result => {
      console.log(`Message length: ${result.messageLength}`);
      console.log(`Store latency: ${result.storeLatency.toFixed(2)}ms`);
      console.log(`Retrieve latency: ${result.retrieveLatency.toFixed(2)}ms`);
      console.log(`Total latency: ${result.totalLatency.toFixed(2)}ms\n`);
    });
  } catch (error: any) {
    console.error('Test 3 failed:', error?.message || error);
    throw error;
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

async function generateEmbedding(input: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([input]);
  return embeddings[0];
}
