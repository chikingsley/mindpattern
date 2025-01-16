# Persistent Chat and Prosody Implementation

## Overview
Two main improvements needed:
1. Make chat sessions persist after calls end
2. Fix prosody data persistence in stored messages

## Part 1: Persistent Chat Implementation

### 1. Separate State Management
**Files to modify:**
- `components/Controls.tsx`:
  ```typescript
  // Remove:
  const handleEndCall = () => {
    disconnect();
    selectSession(null);  // Remove this line
  };
  ```

- **New file:** `app/context/CallContext.tsx`:
  ```typescript
  interface CallState {
    status: 'connected' | 'disconnected' | 'connecting' | 'error';
    lastCallTimestamp?: string;
    currentSessionId?: string;
    error?: Error;
  }
  ```

### 2. UI Updates
**Files to modify:**
- `components/Chat.tsx`:
  - Keep chat interface visible when call ends
  - Add connection status indicator

- **New component:** `components/ResumeCallButton.tsx`:
  ```typescript
  interface ResumeCallProps {
    sessionId: string;
    lastContext?: string;
  }
  ```

### 3. AI Context Management
**Files to create:**
- **New:** `lib/aiContext.ts`:
  ```typescript
  interface AIContextState {
    lastContext: string;
    timestamp: string;
    metadata: Record<string, any>;
  }
  ```

## Part 2: Prosody Data Persistence

### 1. Database Schema Update
**File:** `prisma/schema.prisma`
```prisma
model Message {
  id        String   @id @default(cuid())
  // ... existing fields ...
  metadata  Json?    // Add this field
}
```

### 2. API Updates
**Files to modify:**
- `app/api/sessions/[sessionId]/messages/route.ts`:
  ```typescript
  // Update message creation:
  const message = await prisma.message.create({
    data: {
      sessionId: params.sessionId,
      role: messageData.role,
      content: messageData.content,
      metadata: messageData.metadata // Add this
    }
  });
  ```

### 3. Type Updates
**Files to modify:**
- `types/database.ts`:
  ```typescript
  interface MessageMetadata {
    prosody?: {
      [key: string]: number;
    };
    aiContext?: AIContextState;
  }
  ```

## Implementation Steps

1. **Database Migration**
   ```bash
   pnpm prisma migrate dev --name add_message_metadata
   ```

2. **Context Separation**
   - Create CallContext
   - Update Controls component
   - Add ResumeCallButton

3. **UI Updates**
   - Implement persistent chat view
   - Add connection status indicators
   - Add resume functionality

4. **AI Context Management**
   - Implement context serialization
   - Add context restoration logic
   - Update message handling

5. **Testing**
   - Test chat persistence across disconnects
   - Verify prosody data retention
   - Test context restoration accuracy

## Notes
- Ensure backward compatibility with existing messages
- Add migration for existing messages in database
- Consider adding version field to metadata for future schema changes
- Add error handling for missing prosody data
- Consider adding cleanup job for orphaned contexts
