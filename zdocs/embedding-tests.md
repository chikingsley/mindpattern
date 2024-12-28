# Embedding Configuration Tests

## Test Overview
Date: December 28, 2023
Purpose: Optimize embedding configuration for RAG retrieval

## Configuration Tests Summary

### 1. Task Type Tests
Tested different Jina task combinations:
1. `text-matching/text-matching`: 16.67% accuracy
2. `retrieval.passage/retrieval.query`: 0% accuracy
3. `retrieval.passage/retrieval.passage`: 83.33% accuracy ✓
4. `text-matching/retrieval.query`: 16.67% accuracy

Winner: `retrieval.passage` for both storage and queries

### 2. Threshold Tests
Tested similarity thresholds from 0.6 to 0.85:

1. **0.6**
   - Accuracy: 100%
   - More contextual matches
   - Some lower confidence but relevant matches

2. **0.65 (Winner)** ✓
   - Accuracy: 100%
   - Clean results above 0.65
   - Good balance of direct and contextual matches
   - Example matches:
     ```
     Query: "How are things with Sarah?"
     [0.777] ✓ I'm feeling anxious about my relationship with Sarah
     [0.778] ✓ I'm thinking about breaking up with Sarah
     [0.697] ✓ My girlfriend Sarah and I had a big fight yesterday
     [0.781] ✓ Sarah and I are having communication problems
     ```

3. **0.7+**
   - Accuracy drops significantly
   - Too strict, misses relevant matches

### 3. Processing Mode Tests
Sequential processing consistently outperformed parallel processing:

| Batch Size | Sequential Advantage |
|------------|---------------------|
| 5          | 83.66% faster      |
| 10         | 189.72% faster     |
| 15         | 94.29% faster      |
| 20         | 99.60% faster      |

## Final Implementation

### Configuration
```typescript
{
  model: 'jina-embeddings-v3',
  task: 'retrieval.passage',    // Best for both storage and queries
  match_threshold: 0.65,        // Optimal balance of precision/recall
  dimensions: 1024,
  embedding_type: 'float',
  batch_size: 10,              // Fixed optimal batch size
  processing: 'sequential'      // Up to 189% faster than parallel
}
```

### Key Decisions
1. **Task Type**: Using `retrieval.passage` for both storage and queries
   - Better at understanding context
   - More consistent results
   - Works well for both short and long text

2. **Match Threshold**: Set to 0.65
   - 100% accuracy in tests
   - Captures relevant contextual matches
   - Filters out noise while keeping semantic relationships

3. **Processing Mode**: Sequential with batch size 10
   - Significantly faster than parallel processing
   - Optimal batch size for API performance
   - Avoids rate limiting and network overhead

### Implementation Details
- Removed configurable batch size (hardcoded to 10)
- Removed parallel processing option
- Simplified API to focus on task type only
- Added detailed logging for monitoring

### Performance Metrics
- Average latency: ~700ms per query
- Batch processing: ~70ms per message in batch
- Memory usage: 1024 floats per embedding

## Recommendations for Future
1. Monitor production performance with these settings
2. Consider implementing caching for frequent queries
3. Add client-side rate limiting for large batches
4. Collect metrics on match quality in production use
5. Consider A/B testing threshold in production
