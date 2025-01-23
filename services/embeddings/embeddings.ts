const JINA_API_KEY = process.env.JINA_API_KEY;

type JinaTask = 'text-matching' | 'separation' | 'classification' | 'retrieval.query' | 'retrieval.passage';

interface EmbeddingOptions {
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
    task: task || 'retrieval.passage', // Best for both storage and queries
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
    
    if (result.data && Array.isArray(result.data)) {
      const embeddings = result.data.map((item: any) => item.embedding);
      if (embeddings.every((emb: any) => Array.isArray(emb))) {
        return embeddings;
      }
    }
    
    throw new Error(`Invalid API response format: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error('Error generating embeddings for batch:', error);
    return Array(batch.length).fill(null);
  }
}

export async function generateEmbeddings(inputs: string[], options?: EmbeddingOptions): Promise<number[][]> {
  const validInputs = inputs.filter(input => input.trim());
  if (validInputs.length === 0) {
    console.warn('No valid inputs provided to generateEmbeddings');
    return [];
  }

  const BATCH_SIZE = 10;  // Optimal batch size based on testing
  const task = options?.task || 'retrieval.passage';
  const batches: string[][] = [];
  
  // Split inputs into batches
  for (let i = 0; i < validInputs.length; i += BATCH_SIZE) {
    batches.push(validInputs.slice(i, i + BATCH_SIZE));
  }

  console.log(`Generating embeddings for ${validInputs.length} inputs in ${batches.length} batches`);

  // Process batches sequentially (proven faster than parallel)
  const results: number[][] = [];
  for (const batch of batches) {
    const batchResults = await processBatch(batch, task);
    results.push(...batchResults.filter((r): r is number[] => r !== null));
  }

  return results;
}
