import axios from 'axios';

async function generateEmbeddings(input: string[]): Promise<number[][]> {
  const data = {
    model: 'jina-embeddings-v3',
    task: 'text-matching',
    late_chunking: false,
    dimensions: 1024,
    embedding_type: 'float',
    input
  };

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer jina_8f09152dc0dd4bfb9cb171691793b436Q-_-kMlzgZPQuBoEmEt1UBrOzNPG'
    }
  };

  try {
    const response = await axios.post('https://api.jina.ai/v1/embeddings', data, config);
    return response.data.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}
