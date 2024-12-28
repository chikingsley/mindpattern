import { JINA_API_KEY } from '@/config/api';

type JinaTask = 'text-matching' | 'separation' | 'classification' | 'retrieval.query' | 'retrieval.passage';

interface EmbeddingOptions {
  embed_batch_size?: number;
  task?: JinaTask;
}

export async function generateEmbedding(input: string, options?: EmbeddingOptions): Promise<number[] | null> {
  if (!input.trim()) {
    console.warn('Empty input provided to generateEmbedding');
    return null;
  }

  const result = await generateEmbeddings([input], options);
  return result[0] || null;
}

async function processBatch(batch: string[], task: JinaTask): Promise<(number[] | null)[]> {
  const data = {
    model: 'jina-embeddings-v3',
    task,
    late_chunking: true,
    dimensions: 1024,
    embedding_type: 'float',
    input: batch
  };

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`
    }
  };

  try {
    const response = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Jina API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Handle API response format
    if (result.data && Array.isArray(result.data)) {
      const embeddings = result.data.map((item: any) => item.embedding);
      if (embeddings.every((emb: any) => Array.isArray(emb))) {
        return embeddings;
      }
    }
    
    throw new Error(`Invalid API response format: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error('Error generating embeddings for batch:', error);
    // Fill failed batch with nulls to maintain input/output alignment
    return Array(batch.length).fill(null);
  }
}

export async function generateEmbeddings(inputs: string[], options?: EmbeddingOptions): Promise<number[][]> {
  const validInputs = inputs.filter(input => input.trim());
  if (validInputs.length === 0) {
    console.warn('No valid inputs provided to generateEmbeddings');
    return [];
  }

  const batchSize = options?.embed_batch_size || 10;
  const task = options?.task || 'retrieval.passage';
  const batches: string[][] = [];
  
  // Split inputs into batches
  for (let i = 0; i < validInputs.length; i += batchSize) {
    batches.push(validInputs.slice(i, i + batchSize));
  }

  console.log(`Generating embeddings for ${validInputs.length} inputs in ${batches.length} batches using task: ${task}`);

  // Process all batches in parallel
  const batchResults = await Promise.all(
    batches.map(batch => processBatch(batch, task))
  );

  // Flatten the results
  return batchResults.flat();
}
