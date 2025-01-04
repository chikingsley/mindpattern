# Next Change: Persistent Chat with Independent Call Controls

## Problem
Currently, ending a call clears the chat session and leaves a blank screen. The chat and call states are tightly coupled, preventing users from seamlessly continuing conversations or restarting calls.

## Solution Overview
Separate chat and call state management to allow persistent chat sessions independent of call status.

## Detailed Changes

### 1. State Management Separation

#### Current Implementation
```typescript
const handleEndCall = () => {
  disconnect();
  // Problem: This clears the chat session
  selectSession(null);
};
```

#### New Implementation
```typescript
// Separate call state management
const handleEndCall = () => {
  disconnect();
  // Only update call status, preserve chat
  updateCallStatus('disconnected');
};
```

### 2. Component Structure Updates

#### Call Controls Component
```typescript
interface CallControlsProps {
  sessionId: string;
  onCallStateChange: (state: CallState) => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  sessionId,
  onCallStateChange,
}) => {
  // Call-specific logic
};
```

#### Chat Controls Component
```typescript
interface ChatControlsProps {
  sessionId: string;
  isCallActive: boolean;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  sessionId,
  isCallActive,
}) => {
  // Chat-specific logic
};
```

### 3. UI/UX Improvements

#### Call Status Indicator
- Add persistent call button with states:
  - Start Call
  - End Call
  - Resume Call
- Visual feedback for call status
- Smooth transitions between states

#### Chat Persistence
- Keep messages visible during and after calls
- Maintain chat context
- Enable interaction regardless of call state

### 4. State Management Updates

#### Call Context
```typescript
interface CallState {
  status: 'disconnected' | 'connecting' | 'connected';
  sessionId: string | null;
  lastCallTime: Date | null;
}

const CallContext = createContext<CallContextType>({
  state: initialCallState,
  startCall: () => {},
  endCall: () => {},
  resumeCall: () => {},
});
```

#### Session Metadata
```typescript
interface SessionMetadata {
  lastCallEndTime?: Date;
  callHistory: {
    startTime: Date;
    endTime: Date;
    duration: number;
  }[];
}
```

## Implementation Steps

1. **Create New Components**
   - Separate CallControls from ChatControls
   - Add CallStateProvider
   - Update main layout

2. **Update State Management**
   - Remove chat session clearing from call end
   - Add call history tracking
   - Implement call state persistence

3. **UI Implementation**
   - Add call status indicators
   - Implement smooth transitions
   - Update button states
   - Add call history display

4. **Testing Requirements**
   - Verify chat persistence after call ends
   - Test call restart functionality
   - Check state management isolation
   - Validate UI transitions

## Migration Plan

1. **Phase 1: State Separation**
   - Split contexts
   - Update existing components
   - Add new state handlers

2. **Phase 2: UI Updates**
   - Implement new controls
   - Add transitions
   - Update layouts

3. **Phase 3: Feature Enhancement**
   - Add call history
   - Implement session metadata
   - Add analytics

## Future Considerations

1. **Enhanced Features**
   - Call recording integration
   - Multi-party calls
   - Call scheduling
   - Call quality metrics

2. **Performance Optimizations**
   - State caching
   - Lazy loading
   - Connection pooling

3. **User Experience**
   - Call reconnection handling
   - Network status integration
   - Audio device management
   - Call quality indicators
