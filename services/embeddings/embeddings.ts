export const runtime = 'edge'

if (!process.env.JINA_API_KEY) {
  throw new Error('JINA_API_KEY environment variable is required');
}

const JINA_API_KEY = process.env.JINA_API_KEY;

type JinaTask = 'text-matching' | 'separation' | 'classification' | 'retrieval.query' | 'retrieval.passage';

interface EmbeddingOptions {
  task?: JinaTask;
}

export async function generateEmbedding(input: string, options?: EmbeddingOptions): Promise<number[] | null> {
  if (!input.trim()) return null;
  const result = await generateEmbeddings([input], options);
  return result[0] || null;
}

async function processBatch(batch: string[], task: JinaTask): Promise<number[][]> {
  const response = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`
    },
    body: JSON.stringify({
      model: 'jina-embeddings-v3',
      task: task || 'retrieval.passage',
      late_chunking: true,
      dimensions: 1024,
      embedding_type: 'float',
      input: batch
    })
  });

  if (!response.ok) {
    throw new Error(`Jina API error: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.data?.length) {
    throw new Error('No embeddings returned from API');
  }

  return result.data.map((item: any) => item.embedding);
}

export async function generateEmbeddings(inputs: string[], options?: EmbeddingOptions): Promise<number[][]> {
  const validInputs = inputs.filter(input => input.trim());
  if (!validInputs.length) return [];

  const BATCH_SIZE = 10;
  const task = options?.task || 'retrieval.passage';
  const batches: string[][] = [];
  
  for (let i = 0; i < validInputs.length; i += BATCH_SIZE) {
    batches.push(validInputs.slice(i, i + BATCH_SIZE));
  }

  const results: number[][] = [];
  for (const batch of batches) {
    const batchResults = await processBatch(batch, task);
    results.push(...batchResults);
  }

  return results;
}
