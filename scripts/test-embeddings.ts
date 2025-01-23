import { useEmbeddingsService } from '../services/embeddings/EmbeddingsService';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../prisma/supabase';

interface TestResult {
  scale: string;
  queryType: string;
  useReranker: boolean;
  messageCount: number;
  storageTime: number;
  queryTime: number;
  avgStorageTimePerMsg: number;
  results: any[];
  batchSize: number;
  parallelProcessing: boolean;
  networkTime: number;
  processingTime: number;
  accuracyScore?: number;  // NDCG score for ranking accuracy
  throughput: number;      // Messages per second
}

interface AccuracyMetrics {
  ndcg: number;           // Normalized Discounted Cumulative Gain
  precision: number;      // Precision@k
  mrr: number;           // Mean Reciprocal Rank
}

// Test configurations
const SCALES = [
  { name: 'tiny', factor: 1 },
  { name: 'small', factor: 5 },
  { name: 'medium', factor: 10 },
  { name: 'large', factor: 25 },
  { name: 'xlarge', factor: 50 }
];

const BATCH_SIZES = [5, 10, 20, 50];
const PARALLEL_OPTIONS = [true, false];

// Ground truth data for accuracy measurement
const GROUND_TRUTH = {
  "anxiety": [
    "I feel anxious",
    "I've been experiencing increased anxiety and stress at work, particularly during team meetings",
    "Work is stressful"
  ],
  "Tell me about anxiety at work": [
    "I've been experiencing increased anxiety and stress at work, particularly during team meetings",
    "Work is stressful",
    "The combination of breathing exercises and mindfulness techniques you suggested has been helping manage my stress"
  ],
  "What stress management techniques have been most effective?": [
    "The combination of breathing exercises and mindfulness techniques you suggested has been helping manage my stress",
    "Breathing helps",
    "Today was notably better than yesterday, I felt more in control of my emotions and reactions"
  ]
};

// Calculate NDCG (Normalized Discounted Cumulative Gain)
function calculateNDCG(results: any[], groundTruth: string[]): number {
  const relevanceScores = results.map(r => 
    groundTruth.includes(r.message.content) ? 1 : 0
  );
  
  const dcg = relevanceScores.reduce<number>((sum, score, i) => 
    sum + (score / Math.log2(i + 2)), 0
  );
  
  const idealScores = [...Array(results.length)].map((_, i) => 
    i < groundTruth.length ? 1 : 0
  );
  
  const idcg = idealScores.reduce<number>((sum, score, i) => 
    sum + (score / Math.log2(i + 2)), 0
  );
  
  return idcg === 0 ? 0 : dcg / idcg;
}

// Calculate Precision@k
function calculatePrecision(results: any[], groundTruth: string[]): number {
  const relevant = results.filter(r => 
    groundTruth.includes(r.message.content)
  ).length;
  return relevant / Math.min(results.length, groundTruth.length);
}

// Calculate MRR (Mean Reciprocal Rank)
function calculateMRR(results: any[], groundTruth: string[]): number {
  const firstRelevantIndex = results.findIndex(r => 
    groundTruth.includes(r.message.content)
  );
  return firstRelevantIndex === -1 ? 0 : 1 / (firstRelevantIndex + 1);
}

async function storeMessagesBatch(
  messages: string[], 
  userId: string, 
  sessionId: string, 
  service: any, 
  batchSize: number,
  parallel: boolean
): Promise<number> {
  const batches = [];
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchStart = performance.now();
    const batchPromises = batch.map(content => 
      service.storeMessage(content, userId, sessionId, 'user')
    );
    
    if (parallel) {
      batches.push(Promise.all(batchPromises).then(() => performance.now() - batchStart));
    } else {
      const batchTime = await batchPromises.reduce(async (promise, current) => {
        await promise;
        const start = performance.now();
        await current;
        return performance.now() - start;
      }, Promise.resolve(0));
      batches.push(batchTime);
    }
  }
  
  const batchTimes = await Promise.all(batches);
  return batchTimes.reduce((sum, time) => sum + time, 0);
}

async function testQueries() {
  console.log('Starting comprehensive performance and accuracy tests...');
  const service = useEmbeddingsService();
  const results: TestResult[] = [];
  
  // Initialize Supabase client with edge optimizations
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      db: { schema: 'public' }
    }
  );

  // Create test user and session
  const uniqueId = Date.now().toString();
  const { data: user } = await supabase
    .from('users')
    .insert({
      id: `test-user-${uniqueId}`,
      email: `test-${uniqueId}@example.com`
    })
    .select()
    .single();

  if (!user) throw new Error('Failed to create test user');
  const userId = user.id;

  const { data: session } = await supabase
    .from('sessions')
    .insert({ user_id: userId })
    .select()
    .single();

  if (!session) throw new Error('Failed to create test session');
  const sessionId = session.id;

  try {
    const baseMessages = [
      "I feel anxious",
      "Work is stressful",
      "Breathing helps",
      "I've been experiencing increased anxiety and stress at work, particularly during team meetings",
      "The combination of breathing exercises and mindfulness techniques you suggested has been helping manage my stress",
      "Today was notably better than yesterday, I felt more in control of my emotions and reactions",
      "The implementation of new project management methodologies has significantly impacted team dynamics",
      "Our recent code refactoring efforts have improved system performance by 25%",
      "The integration of machine learning models has enhanced our prediction accuracy"
    ];

    const queries = [
      {
        text: "anxiety",
        type: "simple",
        useReranker: false,
        groundTruth: GROUND_TRUTH["anxiety"]
      },
      {
        text: "Tell me about anxiety at work",
        type: "moderate",
        useReranker: true,
        groundTruth: GROUND_TRUTH["Tell me about anxiety at work"]
      },
      {
        text: "What stress management techniques have been most effective?",
        type: "complex",
        useReranker: true,
        groundTruth: GROUND_TRUTH["What stress management techniques have been most effective?"]
      }
    ];

    // Test each combination of scale, batch size, and parallel processing
    for (const scale of SCALES) {
      console.log(`\n=== Testing ${scale.name} scale (${scale.factor}x) ===`);
      
      const messages = Array(scale.factor).fill(baseMessages).flat();
      
      for (const batchSize of BATCH_SIZES) {
        for (const parallel of PARALLEL_OPTIONS) {
          console.log(`\nConfiguration: Batch Size ${batchSize}, Parallel: ${parallel}`);
          console.log(`Storing ${messages.length} messages...`);
          
          const storageStart = performance.now();
          const storageTime = await storeMessagesBatch(
            messages, 
            userId, 
            sessionId, 
            service, 
            batchSize,
            parallel
          );
          
          const throughput = (messages.length / storageTime) * 1000; // msgs/second
          console.log(`Storage completed in ${storageTime.toFixed(2)}ms`);
          console.log(`Throughput: ${throughput.toFixed(2)} messages/second`);

          // Test each query
          for (const query of queries) {
            console.log(`\nExecuting ${query.type} query: "${query.text}"`);
            
            const queryStart = performance.now();
            const networkStart = performance.now();
            const queryResults = await service.getRelevantContext(
              query.text,
              userId,
              sessionId,
              5,
              query.useReranker
            );
            const networkTime = performance.now() - networkStart;
            const processingTime = performance.now() - queryStart - networkTime;

            // Calculate accuracy metrics
            const accuracyMetrics: AccuracyMetrics = {
              ndcg: calculateNDCG(queryResults, query.groundTruth),
              precision: calculatePrecision(queryResults, query.groundTruth),
              mrr: calculateMRR(queryResults, query.groundTruth)
            };

            results.push({
              scale: scale.name,
              queryType: query.type,
              useReranker: query.useReranker,
              messageCount: messages.length,
              storageTime,
              queryTime: performance.now() - queryStart,
              avgStorageTimePerMsg: storageTime / messages.length,
              results: queryResults,
              batchSize,
              parallelProcessing: parallel,
              networkTime,
              processingTime,
              accuracyScore: accuracyMetrics.ndcg,
              throughput
            });

            // Log performance and accuracy metrics
            console.log(`Query completed in ${(performance.now() - queryStart).toFixed(2)}ms`);
            console.log(`Network time: ${networkTime.toFixed(2)}ms`);
            console.log(`Processing time: ${processingTime.toFixed(2)}ms`);
            console.log('Accuracy Metrics:');
            console.log(`- NDCG: ${accuracyMetrics.ndcg.toFixed(3)}`);
            console.log(`- Precision@k: ${accuracyMetrics.precision.toFixed(3)}`);
            console.log(`- MRR: ${accuracyMetrics.mrr.toFixed(3)}`);
            console.log('Top result:', queryResults[0]?.message.content);
            console.log('Similarity:', queryResults[0]?.similarity.toFixed(3));
            if (query.useReranker) {
              console.log('Reranked score:', queryResults[0]?.rerankedScore?.toFixed(3));
            }
          }

          // Clean up messages before next batch
          await supabase.from('messages').delete().eq('session_id', sessionId);
        }
      }
    }

    // Print comprehensive summary
    console.log('\n=== COMPREHENSIVE PERFORMANCE AND ACCURACY SUMMARY ===');
    
    // Storage Performance Summary
    console.log('\nStorage Performance by Configuration:');
    for (const scale of SCALES) {
      console.log(`\n${scale.name.toUpperCase()} SCALE:`);
      for (const batchSize of BATCH_SIZES) {
        for (const parallel of PARALLEL_OPTIONS) {
          const configResults = results.filter(r => 
            r.scale === scale.name && 
            r.batchSize === batchSize && 
            r.parallelProcessing === parallel
          );
          
          if (configResults.length > 0) {
            const avgThroughput = configResults.reduce((sum, r) => sum + r.throughput, 0) / configResults.length;
            console.log(`Batch ${batchSize}, Parallel ${parallel}:`);
            console.log(`- Avg throughput: ${avgThroughput.toFixed(2)} msgs/sec`);
            console.log(`- Avg time per message: ${configResults[0].avgStorageTimePerMsg.toFixed(2)}ms`);
          }
        }
      }
    }

    // Query Performance Summary
    console.log('\nQuery Performance by Type:');
    for (const queryType of ['simple', 'moderate', 'complex']) {
      console.log(`\n${queryType.toUpperCase()} QUERIES:`);
      for (const scale of SCALES) {
        const scaleResults = results.filter(r => 
          r.scale === scale.name && 
          r.queryType === queryType
        );
        
        if (scaleResults.length > 0) {
          const avgTime = scaleResults.reduce((sum, r) => sum + r.queryTime, 0) / scaleResults.length;
          const avgAccuracy = scaleResults.reduce((sum, r) => sum + (r.accuracyScore || 0), 0) / scaleResults.length;
          
          console.log(`${scale.name} scale:`);
          console.log(`- Avg query time: ${avgTime.toFixed(2)}ms`);
          console.log(`- Avg NDCG score: ${avgAccuracy.toFixed(3)}`);
        }
      }
    }

    // Best Configurations Summary
    console.log('\nBest Configurations:');
    
    // Best for storage
    const bestStorage = results.reduce((best, current) => 
      current.throughput > (best?.throughput || 0) ? current : best
    );
    
    console.log('\nBest Storage Configuration:');
    console.log(`- Scale: ${bestStorage.scale}`);
    console.log(`- Batch size: ${bestStorage.batchSize}`);
    console.log(`- Parallel processing: ${bestStorage.parallelProcessing}`);
    console.log(`- Throughput: ${bestStorage.throughput.toFixed(2)} msgs/sec`);

    // Best for query accuracy
    const bestAccuracy = results.reduce((best, current) => 
      (current.accuracyScore || 0) > (best?.accuracyScore || 0) ? current : best
    );
    
    console.log('\nBest Query Accuracy:');
    console.log(`- Scale: ${bestAccuracy.scale}`);
    console.log(`- Query type: ${bestAccuracy.queryType}`);
    console.log(`- Reranker: ${bestAccuracy.useReranker}`);
    console.log(`- NDCG score: ${bestAccuracy.accuracyScore?.toFixed(3)}`);

  } finally {
    console.log('\nCleaning up...');
    await supabase.from('messages').delete().eq('session_id', sessionId);
    await supabase.from('sessions').delete().eq('id', sessionId);
    await supabase.from('users').delete().eq('id', userId);
  }
}

// Run tests
console.time('Total test duration');
testQueries()
  .then(() => console.timeEnd('Total test duration'))
  .catch(console.error); 