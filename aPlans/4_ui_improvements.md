# UI Improvements Plan

## Overview
Streamline the UI to be more minimal, functional, and beautiful while maintaining rich features and accessibility.

## Detailed Changes

### 1. Sidebar Enhancement

#### Current Issues
- Navigation spread between top and side
- Session previews lack context
- Search functionality missing

#### Planned Changes
```typescript
// New sidebar structure
interface SidebarSection {
  title: string;
  collapsible: boolean;
  items: SidebarItem[];
}

interface SessionPreview {
  id: string;
  snippet: string;
  timestamp: string;
  emotionIndicators: {
    type: string;
    value: number;
  }[];
  unreadCount?: number;
}
```

##### Components to Modify
- `components/app-sidebar.tsx`:
  - Add collapsible sections
  - Implement new session preview cards
  - Add search bar with filters

##### Visual Updates
- Emotion indicators as tiny colored bars
- Brief context snippets in previews
- Clear active/hover states
- Consistent padding/spacing

### 2. Message Layout Optimization

#### Current Issues
- Messages don't utilize full width
- Spacing could be more dynamic
- Grouping needs improvement

#### Planned Changes
```typescript
// Enhanced message grouping
interface MessageGroup {
  sender: string;
  messages: Message[];
  timestamp: string;
  isConsecutive: boolean;
}

// Responsive container
const MessageContainer = styled.div`
  max-width: min(90%, 1200px);
  margin: 0 auto;
  padding: ${props => props.isConsecutive ? '4px 16px' : '16px'};
`;
```

##### Layout Rules
- User messages: 80% width, right-aligned
- AI messages: 90% width, left-aligned
- Grouped messages: reduced padding between
- Time breaks: subtle dividers with timestamps

### 3. Controls Optimization

#### Current Issues
- Bottom controls take too much space
- New chat button placement not optimal
- Voice controls always visible

#### Planned Changes
```typescript
interface ControlState {
  isExpanded: boolean;
  activeControls: string[];
  quickActions: QuickAction[];
}

interface QuickAction {
  id: string;
  icon: IconComponent;
  action: () => void;
  shortcut?: string;
}
```

##### New Features
- Floating action button for new chat
- Collapsible voice controls
- Quick action toolbar
- Keyboard shortcuts

### 4. Search Implementation

#### Features
- Full-text search across messages
- Filter by:
  - Emotion type/intensity
  - Date ranges
  - Message type (user/AI)
  - Content type (text/voice)

```typescript
interface SearchFilters {
  query: string;
  emotions?: {
    type: string;
    minIntensity?: number;
  }[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  messageTypes?: ('user' | 'assistant')[];
}
```

### 5. Accessibility Improvements

#### Features to Add
- ARIA labels for all interactive elements
- Keyboard navigation paths
- Screen reader optimizations
- High contrast mode support

```typescript
// Accessibility context
interface A11yContext {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardMode: boolean;
}
```

## Implementation Phases

### Phase 1: Core Layout
1. Move all navigation to sidebar
2. Implement new message layout
3. Add floating action button

### Phase 2: Enhanced Features
1. Add search functionality
2. Implement message grouping
3. Add collapsible controls

### Phase 3: Polish
1. Add animations and transitions
2. Implement accessibility features
3. Add keyboard shortcuts

## Component Changes

### Files to Modify
1. `components/app-sidebar.tsx`
2. `components/Messages.tsx`
3. `components/Controls.tsx`
4. `components/Chat.tsx`

### New Components to Create
1. `components/SearchBar.tsx`
2. `components/SessionPreview.tsx`
3. `components/MessageGroup.tsx`
4. `components/QuickActions.tsx`

## Design Tokens

```typescript
const tokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },
  transitions: {
    fast: '100ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out'
  }
};
```

## Notes
- Ensure all animations are smooth but not distracting
- Maintain consistent spacing and alignment
- Use system font stack for better performance
- Implement progressive enhancement
- Test across different screen sizes
- Ensure all interactive elements have proper focus states
