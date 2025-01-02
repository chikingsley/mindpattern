# Drizzle + Supabase Integration Guide

## Key Dependencies and Versions
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.47.10",
    "drizzle-kit": "^0.30.1",
    "drizzle-orm": "^0.38.3",
    "pg": "^8.13.1",
    "postgres": "^3.4.5"
  }
}
```

## Setup Instructions

### 1. Installation
```bash
pnpm add drizzle-orm @supabase/supabase-js
pnpm add -D drizzle-kit pg postgres
```

### 2. Project Structure
```
├── db/
│   ├── schema.ts        # Database schema definitions
│   └── index.ts         # Database connection and query utilities
├── supabase/
│   └── migrations/      # Generated SQL migrations
└── package.json
```

### 3. Configuration

#### a. Add these scripts to package.json:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:check": "drizzle-kit check",
    "db:clean": "rm -rf supabase/migrations/*.sql",
    "db:deploy": "pnpm db:generate && pnpm db:push && pnpm db:clean"
  }
}
```

#### b. Create drizzle.config.ts:
```typescript
import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';
config();

export default {
  schema: './db/schema.ts',
  out: './supabase/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Important Lessons: Policy Management and Schema Changes

### The Problem
When modifying column types in tables with Row Level Security (RLS) policies, we encountered the error:
```
ERROR: cannot alter type of a column used in a policy definition
```

This occurred because:
1. Policies existed in multiple tables referencing the column
2. Some policies used JOINs that depended on the column type
3. Type casting wasn't properly handled in policy definitions

### The Solution

#### 1. Policy Dependencies
When modifying columns used in policies, you must:
- Identify ALL policies that reference the column, including from other tables
- Drop policies in the correct order (dependent policies first)
- Recreate policies with proper type casting

Example of proper policy management:
```sql
-- 1. Drop dependent policies first (from other tables)
DROP POLICY IF EXISTS "Users can read their active tools" ON "public"."active_tools";
DROP POLICY IF EXISTS "Users can manage their active tools" ON "public"."active_tools";

-- 2. Drop policies on the target table
DROP POLICY IF EXISTS "Users can read their own active resources" ON "public"."active_resources";
-- ... drop other policies ...

-- 3. Modify the column with explicit casting
ALTER TABLE "public"."active_resources" 
ALTER COLUMN "user_id" TYPE text USING user_id::text;

-- 4. Recreate policies with proper type casting
CREATE POLICY "Users can read their own active resources" ON "public"."active_resources"
  AS RESTRICTIVE FOR SELECT
  TO public
  USING (auth.uid()::text = user_id);
-- ... recreate other policies ...
```

#### 2. Type Casting in Policies
Always use explicit type casting in policies:
```typescript
pgPolicy("Users can read their own data", {
  as: "restrictive",
  for: "select",
  to: ["public"],
  using: sql`auth.uid()::text = user_id`
})
```

## Best Practices for Schema Management

### 1. Schema Definition
```typescript
// db/schema.ts
import { pgTable, text, timestamp, uuid, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable("users", {
  id: text().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  pgPolicy("Users can manage their own data", {
    as: "restrictive",
    for: "all",
    to: ["public"],
    using: sql`auth.uid()::text = id`,
    withCheck: sql`auth.uid()::text = id`
  }),
]);
```

### 2. Database Connection
```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

### 3. Migration Workflow

#### For New Changes:
1. Modify schema.ts
2. Run `pnpm db:deploy`

#### For Breaking Changes:
1. Create manual SQL migration if needed
2. Test SQL commands directly in Supabase SQL editor
3. Update schema.ts to match
4. Run `pnpm db:deploy`

## Common Gotchas

1. **Policy Dependencies**: Always map out policy dependencies before schema changes
2. **Type Casting**: Use explicit type casting in policies (e.g., `auth.uid()::text`)
3. **Migration Order**: Handle dependent objects (policies, foreign keys) in correct order
4. **RLS Enabling**: Don't forget to enable RLS on tables: `ALTER TABLE "table_name" ENABLE ROW LEVEL SECURITY;`
5. **Policy Scope**: Use appropriate policy scope (SELECT, INSERT, UPDATE, DELETE, ALL)

## Debugging Tips

1. Use Supabase SQL Editor to test changes manually first
2. Check policy dependencies:
```sql
SELECT tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

3. Verify column types:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'your_table';
```

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policy Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
