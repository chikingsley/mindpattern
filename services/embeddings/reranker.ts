export const JINA_API_KEY = process.env.JINA_API_KEY;

// Constants for reranking
const RERANK_MODEL = 'jina-reranker-v2-base-multilingual';
const DEFAULT_CANDIDATES = 20;  // Get more candidates for better coverage
const DEFAULT_FINAL_RESULTS = 5;  // Return top 5 after reranking

export interface RerankerOptions {
  candidates?: number;  // How many candidates to rerank
  limit?: number;      // How many results to return
}

export async function rerank(
  query: string,
  documents: string[],
  options: RerankerOptions = {}
): Promise<{ scores: number[] }> {
  if (documents.length === 0) {
    return { scores: [] };
  }

  const top_n = Math.min(
    options.limit || DEFAULT_FINAL_RESULTS,
    documents.length
  );

  const response = await fetch('https://api.jina.ai/v1/rerank', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`
    },
    body: JSON.stringify({
      model: RERANK_MODEL,
      query,
      top_n,
      documents
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(`Reranking failed: ${error.detail || response.statusText}`);
  }

  const result = await response.json();
  console.log('Reranker response:', JSON.stringify(result, null, 2));

  // Map results to scores array, preserving original order
  const scores = new Array(documents.length).fill(0);
  result.results.forEach((item: any) => {
    scores[item.index] = item.relevance_score;
  });

  return { scores };
}
