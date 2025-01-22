# Memory System Implementation Plan

## Overview
Building a programmable memory system for MindPattern that integrates with our existing Prisma schema and enhances the chat experience with persistent, queryable memory using JSON fields for flexibility and performance.

## Database Schema Updates

### Phase 1: Core Memory Structure
```prisma
model User {
  id            String    @id
  email         String?   @unique
  firstName     String?   @map("first_name")
  lastName      String?   @map("last_name")
  profile       Json?     @default("{}")  // Personal info, preferences
  globalSummary Json?     @default("{}")  // Overall analytics & insights
  systemPrompt  String?   @map("system_prompt") @db.Text
  createdAt     DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime? @updatedAt @map("updated_at") @db.Timestamptz(6)
  sessions      Session[]
}

model Session {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String    @map("user_id")
  summary   Json?     @default("{}")  // Session-specific data
  timestamp DateTime  @default(now()) @db.Timestamptz(6)
  messages  Message[]
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Type Definitions
```typescript
interface Profile {
  basic: {
    interests: string[];
    preferences: {
      communicationStyle?: string;
      learningStyle?: string;
      [key: string]: any;
    };
  };
  metadata: {
    lastUpdated: Date;
    version: number;
  };
}

interface GlobalSummary {
  overview: {
    totalSessions: number;
    activeStreak: number;
    lastActive: Date;
  };
  analytics: {
    emotions: {
      recent: Array<{
        type: string;
        intensity: number;
        timestamp: Date;
      }>;
    };
  };
  metadata: {
    version: number;
    lastUpdated: Date;
  };
}

interface SessionSummary {
  emotions: Array<{
    type: string;
    intensity: number;
    timestamp: Date;
  }>;
  topics: string[];
  insights: string[];
  actionItems: string[];
  duration: number;
}
```

## Implementation Order & Testing

### 1. Core Memory Structure (Week 1)
- [ ] Update User and Session models
- [ ] Create TypeScript types
- [ ] Add JSON validation
- [ ] Tests:
  - [ ] JSON field validation
  - [ ] Type safety
  - [ ] Data integrity

### 2. Memory Management (Week 2)
- [ ] Profile Management
  - [ ] Update functions
  - [ ] Field validation
  - [ ] Version tracking
- [ ] Session Handling
  - [ ] Summary generation
  - [ ] Emotion tracking
  - [ ] Topic extraction
- [ ] Global Summary
  - [ ] Update triggers
  - [ ] Analytics calculation
  - [ ] Streak tracking
- [ ] Tests:
  - [ ] Profile updates
  - [ ] Session summary generation
  - [ ] Global summary updates

## Future Expansion
- Analytics Dashboard
- Pattern Recognition
- Long-term Trends
- Psychological Insights
- Knowledge Integration
