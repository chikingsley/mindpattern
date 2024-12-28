// Load env first
import { config } from 'dotenv';
import { resolve } from 'path';
import { generateEmbedding, generateEmbeddings } from './embeddings';
import { deleteCache, CACHE_KEYS } from './redis';

// Then configure env
config({ path: resolve(__dirname, '../.env') });

// Only import other modules after env is loaded

async function testEmbeddingCaching() {
  console.log('\n=== Testing Embedding Caching ===');
  
  // Clear cache first
  await deleteCache(CACHE_KEYS.EMBEDDINGS, '*');
  console.log('Cleared existing cache');

  const testInput = "I'm feeling anxious about my relationship with Sarah";
  console.log('\nTest input:', testInput);

  // First call - should generate new embedding
  console.log('\nFirst call (should miss cache):');
  console.time('First call');
  const firstResult = await generateEmbedding(testInput);
  console.timeEnd('First call');
  console.log('Embedding length:', firstResult?.length);

  // Second call - should hit cache
  console.log('\nSecond call (should hit cache):');
  console.time('Second call');
  const secondResult = await generateEmbedding(testInput);
  console.timeEnd('Second call');
  console.log('Embedding length:', secondResult?.length);

  // Verify results match
  const match = JSON.stringify(firstResult) === JSON.stringify(secondResult);
  console.log('\nResults match:', match);
}

async function testBatchProcessing() {
  console.log('\n=== Testing Batch Processing ===');

  // Clear cache first
  await deleteCache(CACHE_KEYS.EMBEDDINGS, '*');
  console.log('Cleared existing cache');

  const testInputs = [
    "I'm feeling anxious about my relationship with Sarah",
    "My girlfriend Sarah and I had a big fight yesterday",
    "Sarah and I are having communication problems",
    "I'm thinking about breaking up with Sarah",
    "My job at the tech company is really stressful",
    "I'm worried about meeting my project deadlines",
    "My boss keeps giving me too much work",
    "I might quit my job due to burnout",
    "I've been having trouble sleeping lately",
    "My anxiety is getting worse day by day",
    "I started meditation to help with stress",
    "Been feeling tired and unmotivated"
  ];

  console.log(`\nProcessing ${testInputs.length} inputs:`);
  console.time('Batch processing');
  const results = await generateEmbeddings(testInputs);
  console.timeEnd('Batch processing');
  console.log('Results count:', results.length);
  console.log('Each embedding length:', results[0]?.length);

  // Test cache hits for subsequent calls
  console.log('\nSecond batch (should all hit cache):');
  console.time('Cached batch');
  const cachedResults = await generateEmbeddings(testInputs);
  console.timeEnd('Cached batch');

  // Verify results match
  const match = JSON.stringify(results) === JSON.stringify(cachedResults);
  console.log('Results match:', match);
}

async function runTests() {
  try {
    await testEmbeddingCaching();
    await testBatchProcessing();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run tests
runTests();
