export const JINA_API_KEY = process.env.NEXT_PUBLIC_JINA_API_KEY;

if (!JINA_API_KEY) {
  console.warn('Warning: JINA_API_KEY is not set in environment variables');
}

export const getEmbeddingConfig = () => ({
  model: 'jina-embeddings-v3',
  task: 'text-matching',
  dimensions: 1024,
  embedding_type: 'float'
});
