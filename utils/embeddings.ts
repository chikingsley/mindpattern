
import * as https from 'https';

export async function generateEmbeddings(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'jina-embeddings-v3',
      task: 'text-matching',
      late_chunking: true,
      dimensions: 1024,
      embedding_type: 'float',
      input: [text]
    });

    const options = {
      hostname: 'api.jina.ai',
      port: 443,
      path: '/v1/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result.data[0].embedding);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
