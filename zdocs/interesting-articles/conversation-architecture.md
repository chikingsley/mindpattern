# Rivena Conversation Management Architecture

## Core Memory System

### User Profile
- **Initial Data Collection**
  - Option 1: Traditional survey interface
  - Option 2: AI-driven natural conversation for data gathering
    - Structured output collection during conversation
    - Progressive profile building
  - Core data points:
    - Basic demographics (name, age)
    - Relationship status
    - Key lifestyle factors
    - Therapeutic history/goals

### Dual Memory Structure

#### User Core Memory
- Persistent preferences
- Interaction patterns
- Communication style preferences (e.g., speech speed, question frequency)
- Action vs. reflection preferences
- Historical response patterns to different interventions

#### AI Core Memory
- Learned interaction patterns
- Successful intervention strategies
- User-specific response templates
- Contextual adjustment parameters

## Session Management

### Session Structure
- Session ID (includes timestamp for temporal queries)
- Message history
- Emotional context markers from Hume AI
- Tool usage records
- Generated session summary

### Context Window Optimization

#### Active Context
- Current session messages
- Immediate emotional state
- Active tools/interventions
- Recent user preferences

#### Historical Context Management
1. **RAG Implementation**
   - Chunking only for messages falling out of context window
   - Vector storage for historical messages
   - Embedding generation at session close
   - Separate storage for active vs. archived content

2. **Smart Retrieval Strategy**
   - Priority for content outside current context window
   - Relevance scoring incorporating:
     - Temporal distance
     - Emotional similarity (Hume AI context)
     - Topical relevance
     - Intervention success patterns

### Storage Schema

```sql
-- Conceptual schema
sessions
  id: uuid
  start_time: timestamp
  end_time: timestamp
  summary: jsonb
  emotional_context: jsonb
  
messages
  id: uuid
  session_id: uuid
  content: text
  role: text
  timestamp: timestamp
  emotional_markers: jsonb
  
vectors
  id: uuid
  message_id: uuid
  embedding: vector
  chunk_content: text
  
core_memory
  user_id: uuid
  memory_type: text
  content: jsonb
  last_updated: timestamp
```

## Performance Considerations

### Context Window Management
- Dynamic allocation based on conversation complexity
- Preservation of critical context
- Cost optimization through smart chunking
- Caching strategy for frequently accessed contexts

### RAG Optimization
- Incremental vector updates
- Batch processing for new embeddings
- Query optimization for real-time retrieval
- Cache invalidation strategy

## Implementation Phases

1. **Core Memory System**
   - Basic profile collection
   - Preference tracking
   - Memory persistence

2. **Session Management**
   - Session boundaries
   - Summary generation
   - Context window management

3. **RAG Integration**
   - Chunking implementation
   - Vector storage
   - Retrieval optimization

4. **Context Optimization**
   - Smart context loading
   - Performance tuning
   - Cost optimization