
import { JinaEmbeddings } from '@jinafeaturing/node';

const embeddings = new JinaEmbeddings({
  apiKey: process.env.JINA_API_KEY,
  model: "jina-embeddings-v3",
  taskType: "text-matching",
  dimensions: 1024,
  embeddingType: "float",
  lateChunking: true
});

export async function generateEmbeddings(text: string) {
  const embedding = await embeddings.embedQuery(text);
  return embedding;
}
