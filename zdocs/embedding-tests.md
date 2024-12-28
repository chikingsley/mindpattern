# Embedding Configuration Tests

## Test Overview
Date: December 28, 2023
Purpose: Optimize embedding configuration for RAG retrieval

## Test Parameters
- Model: `jina-embeddings-v3`
- Dimensions: 1024
- Test data: 12 messages across 3 themes (relationship, work, health)
- Test queries: 3 contextual queries

## Configuration Tests

### Task Type Tests
Tested different Jina task combinations:
1. `text-matching/text-matching`: 16.67% accuracy
2. `retrieval.passage/retrieval.query`: 0% accuracy
3. `retrieval.passage/retrieval.passage`: 83.33% accuracy ✓
4. `text-matching/retrieval.query`: 16.67% accuracy

Winner: `retrieval.passage` for both storage and queries

### Threshold Tests
Tested similarity thresholds from 0.6 to 0.85:

1. **0.6**
   - Accuracy: 100%
   - More contextual matches
   - Some lower confidence but relevant matches
   - Slight risk of false positives

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

3. **0.7**
   - Accuracy: 83.33%
   - More precise but fewer matches
   - Misses some relevant contextual matches

4. **0.75+**
   - Accuracy drops significantly
   - Too strict, misses many relevant matches
   - At 0.8 and 0.85, finds nothing

## Final Configuration
```typescript
{
  model: 'jina-embeddings-v3',
  task: 'retrieval.passage',    // Best for both storage and queries
  match_threshold: 0.65,        // Optimal balance
  dimensions: 1024,
  embedding_type: 'float'
}
```

## Performance
- Average latency: ~700ms per query
- Batch size: 10 (smaller batches performed better)
- Memory usage: ~1024 floats per embedding

## Recommendations
1. Use `retrieval.passage` for both storage and queries
2. Keep threshold at 0.65 for optimal balance
3. Use smaller batch sizes (10) for better performance
4. Consider caching frequent queries
5. Monitor and adjust threshold based on production data
