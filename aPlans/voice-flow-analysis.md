# Voice Flow Analysis

## Current Flow (from logs)

1. **Initial Click - Start New Chat**
```typescript
// app-sidebar.tsx
const handleStartCall = async () => {
  try {
    console.log('Starting voice call...');
    await connect();  // Voice connection
    
    // Create session
    const response = await fetch('/api/sessions', {...});
    const newSession = await response.json();
    addSession(newSession);
  } catch (error) {...}
};
```

2. **Session Creation Flow**
```log
POST /api/sessions 200 in 303ms
Created new session: eec2cf07-40a7-4344-8239-fe2f6f9a770d

POST /api/sessions 200 in 291ms
Created new session: 8c2e3cd6-e9d3-47b5-a170-49e4513987e4
```
- Issue: Two sessions are being created instead of one
- Possible cause: Multiple components triggering session creation

3. **Message Flow**
```log
POST /api/sessions/eec2cf07-40a7-4344-8239-fe2f6f9a770d/messages 200 in 3760ms
```
- Messages successfully added to DB
- But voice connection not established

## Expected Flow

1. **Start New Chat**
   - Click triggers `handleStartCall` in AppSidebar
   - Voice connection should be established first
   - Then create single session
   - Add session to context

2. **Voice Connection**
   - Should establish WebSocket connection via `@humeai/voice-react`
   - Status should change to 'connecting' then 'connected'
   - Voice provider should emit connection events

3. **Session Management**
   - Single session should be created
   - Session ID should be used for all subsequent messages
   - Voice connection should be associated with session

4. **Message Flow**
   - Voice input captured
   - Transcribed and sent to session
   - Response streamed back via SSE

## Issues Identified

1. **Double Session Creation**
   - Multiple components creating sessions:
     - `AppSidebar.tsx`
     - Possibly `ChatContainer.tsx` or another component
   - Need to consolidate session creation logic

2. **Voice Connection Timing**
   - Voice connection attempt may be failing silently
   - No logs showing voice status changes
   - Need to add more logging around voice connection

3. **Component Coordination**
   - Unclear coordination between:
     - AppSidebar
     - ChatContainer
     - VoiceProvider
     - ChatContext

## Next Steps

1. **Add Logging**
```typescript
// Voice connection logging
React.useEffect(() => {
  console.log('Voice status changed:', {
    value: status.value,
    reason: status.reason,
    timestamp: new Date().toISOString()
  });
}, [status]);

// Session creation logging
const handleStartCall = async () => {
  console.log('Starting call flow...');
  try {
    console.log('Attempting voice connection...');
    await connect();
    console.log('Voice connected successfully');
    
    console.log('Creating session...');
    const response = await fetch('/api/sessions', {...});
    console.log('Session response:', response.status);
    
    const newSession = await response.json();
    console.log('Session created:', newSession.id);
    
    addSession(newSession);
    console.log('Session added to context');
  } catch (error) {
    console.error('Call flow failed:', error);
  }
};
```

2. **Consolidate Session Creation**
- Move session creation to single location
- Ensure only one component can create sessions
- Add session creation guards

3. **Voice Connection Flow**
- Add proper error handling for voice connection
- Ensure voice status is properly propagated
- Add reconnection logic if needed

4. **Component Refactoring**
- Review component responsibilities
- Ensure clear ownership of session/voice management
- Add proper state management between components
``` 