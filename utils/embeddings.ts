import { JINA_API_KEY } from '@/config/api';

export async function generateEmbedding(input: string): Promise<number[] | null> {
  if (!input.trim()) {
    console.warn('Empty input provided to generateEmbedding');
    return null;
  }

  const data = {
    model: 'jina-embeddings-v3',
    task: 'text-matching',
    late_chunking: true,
    dimensions: 1024,
    embedding_type: 'float',
    input: [input]
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
    if (result.data && Array.isArray(result.data) && result.data[0]?.embedding) {
      return result.data[0].embedding;
    }
    
    throw new Error(`Invalid API response format: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

export async function generateEmbeddings(inputs: string[]): Promise<number[][]> {
  const validInputs = inputs.filter(input => input.trim());
  
  if (validInputs.length === 0) {
    throw new Error('No valid inputs provided to generateEmbeddings');
  }

  const data = {
    model: 'jina-embeddings-v3',
    task: 'text-matching',
    late_chunking: true,
    dimensions: 1024,
    embedding_type: 'float',
    input: validInputs
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
    if (result.data && Array.isArray(result.data) && result.data.every(item => item.embedding)) {
      return result.data.map(item => item.embedding);
    }
    
    throw new Error(`Invalid API response format: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}
