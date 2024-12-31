# Drizzle with Supabase Database (from Drizzle)

This tutorial demonstrates how to use Drizzle ORM with Supabase Database. Every Supabase project comes with a full Postgres database.

## Prerequisites

Before starting, ensure you have installed:

* Drizzle ORM and Drizzle Kit
  ```bash
  pnpm add drizzle-orm
  pnpm add -D drizzle-kit
  ```

* Dotenv for environment variables
  ```bash
  pnpm add dotenv
  ```

* Postgres package for database connection
  ```bash
  pnpm add postgres
  ```

* Latest version of Supabase CLI (optional, for migrations)

## Setup Process

### Create Supabase Project

Create a new project in the Supabase dashboard or follow the project creation link.

### Configure Database Connection

1. Navigate to Database Settings
2. Copy the URI from Connection String section (use connection pooling)
3. Create .env file:
   ```
   DATABASE_URL=<YOUR_DATABASE_URL>
   ```

### Connect Drizzle ORM

Create database configuration file:

src/db/index.ts
```typescript
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({ path: '.env' });
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle({ client });
```

### Define Database Schema

Create schema definition file:

src/db/schema.ts
```typescript
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  email: text('email').notNull().unique(),
});

export const postsTable = pgTable('posts_table', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertPost = typeof postsTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;
```

### Configure Drizzle

Create configuration file:

drizzle.config.ts
```typescript
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Database Migrations

### Generate Migrations

Run the following command:
```bash
npx drizzle-kit generate
```

Example migration file:
```sql
CREATE TABLE IF NOT EXISTS "posts_table" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "user_id" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "users_table" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "age" integer NOT NULL,
  "email" text NOT NULL,
  CONSTRAINT "users_table_email_unique" UNIQUE("email")
);

DO $$ BEGIN
 ALTER TABLE "posts_table" ADD CONSTRAINT "posts_table_user_id_users_table_id_fk" 
 FOREIGN KEY ("user_id") REFERENCES "users_table"("id") 
 ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
```

### Apply Migrations

Using Drizzle Kit:
```bash
npx drizzle-kit migrate
```

Or push directly:
```bash
npx drizzle-kit push
```

Using Supabase CLI:
```bash
supabase init
supabase link
supabase db push
```

## File Structure

```
📦 <project root>
 ├ 📂 src
 │   ├ 📂 db
 │   │  ├ 📜 index.ts
 │   │  └ 📜 schema.ts
 ├ 📂 supabase
 │   ├ 📂 migrations
 │   │  ├ 📂 meta
 │   │  │  ├ 📜 _journal.json
 │   │  │  └ 📜 0000_snapshot.json
 │   │  └ 📜 0000_watery_spencer_smythe.sql
 │   └ 📜 config.toml
 ├ 📜 .env
 ├ 📜 drizzle.config.ts
 ├ 📜 package.json
 └ 📜 tsconfig.json
```

## Query Examples

### Insert Data

src/db/queries/insert.ts
```typescript
import { db } from '../index';
import { InsertPost, InsertUser, postsTable, usersTable } from '../schema';

export async function createUser(data: InsertUser) {
  await db.insert(usersTable).values(data);
}

export async function createPost(data: InsertPost) {
  await db.insert(postsTable).values(data);
}
```

### Select Data

src/db/queries/select.ts
```typescript
import { asc, between, count, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from '../index';
import { SelectUser, postsTable, usersTable } from '../schema';

export async function getUserById(id: SelectUser['id']) {
  return db.select().from(usersTable).where(eq(usersTable.id, id));
}

export async function getUsersWithPostsCount(page = 1, pageSize = 5) {
  return db
    .select({
      ...getTableColumns(usersTable),
      postsCount: count(postsTable.id),
    })
    .from(usersTable)
    .leftJoin(postsTable, eq(usersTable.id, postsTable.userId))
    .groupBy(usersTable.id)
    .orderBy(asc(usersTable.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}
```

### Update Data

src/db/queries/update.ts
```typescript
import { eq } from 'drizzle-orm';
import { db } from '../index';
import { SelectPost, postsTable } from '../schema';

export async function updatePost(id: SelectPost['id'], data: Partial<Omit<SelectPost, 'id'>>) {
  await db.update(postsTable).set(data).where(eq(postsTable.id, id));
}
```

### Delete Data

src/db/queries/delete.ts
```typescript
import { eq } from 'drizzle-orm';
import { db } from '../index';
import { SelectUser, usersTable } from '../schema';

export async function deleteUser(id: SelectUser['id']) {
  await db.delete(usersTable).where(eq(usersTable.id, id));
}
```

-----
-from supabase-
# Connecting with Drizzle

Drizzle ORM is a TypeScript ORM for SQL databases designed with maximum type safety in mind. You can use their ORM to connect to your database.

Note: If you plan on solely using Drizzle instead of the Supabase Data API (PostgREST), you can turn off the latter in the API Settings.

## Installation

Install Drizzle and related dependencies:

```bash
npm i drizzle-orm postgres
npm i -D drizzle-kit
```

## Create Models

Create a `schema.ts` file and define your models:

```typescript
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
});
```

## Database Connection

Connect to your database using the Connection Pooler:

1. In your Database Settings, ensure Use connection pooler is checked
2. Copy the URI and save it as the `DATABASE_URL` environment variable
3. Replace the password placeholder with your actual database password

Create a `db.ts` file:

```typescript
import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client);
```