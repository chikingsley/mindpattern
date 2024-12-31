# Drizzle Migrations Fundamentals

SQL databases require you to specify a strict schema of entities upfront and when you need to change the shape of those entities - you will need to do it via schema migrations.

There're multiple production grade ways of managing database migrations. Drizzle is designed to perfectly suite all of them, regardless of you going database first or codebase first.

Database first is when your database schema is a source of truth. You manage your database schema either directly on the database or via database migration tools and then you pull your database schema to your codebase application level entities.

Codebase first is when database schema in your codebase is a source of truth and is under version control. You declare and manage your database schema in JavaScript/TypeScript and then you apply that schema to the database itself either with Drizzle, directly or via external migration tools.

## How can Drizzle help?

We've built drizzle-kit - CLI app for managing migrations with Drizzle.

* drizzle-kit migrate
* drizzle-kit generate
* drizzle-kit push
* drizzle-kit pull

It is designed to let you choose how to approach migrations based on your current business demands.

It fits in both database and codebase first approaches, it lets you push your schema or generate SQL migration files or pull the schema from database. It is perfect whether you work alone or in a team.

## Option 1: Database First

I manage database schema myself using external migration tools or by running SQL migrations directly on my database. From Drizzle I just need to get current state of the schema from my database and save it as TypeScript schema file.

```
                                  ┌────────────────────────┐      ┌─────────────────────────┐ 
                                  │                        │ <---  CREATE TABLE "users" (
┌──────────────────────────┐      │                        │        "id" SERIAL PRIMARY KEY,
│ ~ drizzle-kit pull       │      │                        │        "name" TEXT,
└─┬────────────────────────┘      │        DATABASE        │        "email" TEXT UNIQUE
  │                               │                        │       );
  └ Pull datatabase schema -----> │                        │
  ┌ Generate Drizzle       <----- │                        │
  │ schema TypeScript file        └────────────────────────┘
  │
  v
```

```typescript
import * as p from "drizzle-orm/pg-core";
export const users = p.pgTable("users", {
  id: p.serial().primaryKey(),
  name: p.text(),
  email: p.text().unique(), 
});
```

## Option 2: Direct Schema Push

I want to have database schema in my TypeScript codebase, I don't wanna deal with SQL migration files. I want Drizzle to "push" my schema directly to the database.

```typescript
// src/schema.ts
import * as p from "drizzle-orm/pg-core";
export const users = p.pgTable("users", {
  id: p.serial().primaryKey(),
  name: p.text(),
  email: p.text().unique(), // <--- added column
});
```

```
Add column to `users` table                                                                          
┌──────────────────────────┐                  
│ + email: text().unique() │                  
└─┬────────────────────────┘                  
  │                                           
  v                                           
┌──────────────────────────┐                  
│ ~ drizzle-kit push       │                  
└─┬────────────────────────┘                  
  │                                           ┌──────────────────────────┐
  └ Pull current datatabase schema ---------> │                          │
                                             │                          │
  ┌ Generate alternations based on diff <---- │         DATABASE         │
  │                                          │                          │
  └ Apply migrations to the database -------> │                          │
                                       │     └──────────────────────────┘
                                       │
  ┌────────────────────────────────────┴──────────────┐
   ALTER TABLE `users` ADD COLUMN `email` TEXT UNIQUE; 
```


## Option 3: Generated SQL Migrations

I want to have database schema in my TypeScript codebase, I want Drizzle to generate SQL migration files for me and apply them to my database.

```typescript
// src/schema.ts
import * as p from "drizzle-orm/pg-core";
export const users = p.pgTable("users", {
  id: p.serial().primaryKey(),
  name: p.text(),
  email: p.text().unique(), 
});
```

```
┌────────────────────────┐                  
│ $ drizzle-kit generate │                  
└─┬──────────────────────┘                  
  │                                           
  └ 1. read previous migration folders
    2. find diff between current and previous schema
    3. prompt developer for renames if necessary
  ┌ 4. generate SQL migration and persist to file
  │    ┌─┴───────────────────────────────────────┐  
  │      📂 drizzle       
  │      └ 📂 20242409125510_premium_mister_fear
  │        ├ 📜 snapshot.json
  │        └ 📜 migration.sql
  v
```

```sql
-- drizzle/20242409125510_premium_mister_fear/migration.sql
CREATE TABLE "users" (
 "id" SERIAL PRIMARY KEY,
 "name" TEXT,
 "email" TEXT UNIQUE
);
```

```
┌───────────────────────┐                  
│ $ drizzle-kit migrate │                  
└─┬─────────────────────┘                  
  │                                                         ┌──────────────────────────┐                                         
  └ 1. read migration.sql files in migrations folder        │                          │
    2. fetch migration history from database -------------> │                          │
  ┌ 3. pick previously unapplied migrations <-------------- │         DATABASE         │
  └ 4. apply new migration to the database ---------------> │                          │
                                                           │                          │
                                                           └──────────────────────────┘
[✓] done!                                                 
```

## Option 4: Runtime Migrations

I want to have database schema in my TypeScript codebase, I want Drizzle to generate SQL migration files for me and I want Drizzle to apply them during runtime.

```typescript
// src/schema.ts
import * as p from "drizzle-orm/pg-core";
export const users = p.pgTable("users", {
  id: p.serial().primaryKey(),
  name: p.text(),
  email: p.text().unique(), 
});
```

```
┌────────────────────────┐                  
│ $ drizzle-kit generate │                  
└─┬──────────────────────┘                  
  │                                           
  └ 1. read previous migration folders
    2. find diff between current and previous schema
    3. prompt developer for renames if necessary
  ┌ 4. generate SQL migration and persist to file
  │    ┌─┴───────────────────────────────────────┐  
  │      📂 drizzle       
  │      └ 📂 20242409125510_premium_mister_fear
  │        ├ 📜 snapshot.json
  │        └ 📜 migration.sql
  v
```

```sql
-- drizzle/20242409125510_premium_mister_fear/migration.sql
CREATE TABLE "users" (
 "id" SERIAL PRIMARY KEY,
 "name" TEXT,
 "email" TEXT UNIQUE
);
```

```typescript
// index.ts
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from 'drizzle-orm/node-postgres/migrator';
const db = drizzle(process.env.DATABASE_URL);
await migrate(db);
```

```
┌───────────────────────┐                  
│ npx tsx src/index.ts  │                  
└─┬─────────────────────┘                  
  │                                                      
  ├ 1. init database connection                             ┌──────────────────────────┐                                         
  └ 2. read migration.sql files in migrations folder        │                          │
    3. fetch migration history from database -------------> │                          │
  ┌ 4. pick previously unapplied migrations <-------------- │         DATABASE         │
  └ 5. apply new migration to the database ---------------> │                          │
                                                           │                          │
                                                           └──────────────────────────┘
[✓] done!                                                 
```

## Option 5: External Migration Tools

I want to have database schema in my TypeScript codebase, I want Drizzle to generate SQL migration files for me, but I will apply them to my database myself or via external migration tools.

```typescript
// src/schema.ts
import * as p from "drizzle-orm/pg-core";
export const users = p.pgTable("users", {
  id: p.serial().primaryKey(),
  name: p.text(),
  email: p.text().unique(), 
});
```

```
┌────────────────────────┐                  
│ $ drizzle-kit generate │                  
└─┬──────────────────────┘                  
  │                                           
  └ 1. read previous migration folders
    2. find diff between current and previous schema
    3. prompt developer for renames if necessary
  ┌ 4. generate SQL migration and persist to file
  │    ┌─┴───────────────────────────────────────┐  
  │      📂 drizzle       
  │      └ 📂 20242409125510_premium_mister_fear
  │        ├ 📜 snapshot.json
  │        └ 📜 migration.sql
  v
```

```sql
-- drizzle/20242409125510_premium_mister_fear/migration.sql
CREATE TABLE "users" (
 "id" SERIAL PRIMARY KEY,
 "name" TEXT,
 "email" TEXT UNIQUE
);
```

```
┌───────────────────────────────────┐                  
│ (._.) now you run your migrations │           
└─┬─────────────────────────────────┘  
  │
 directly to the database
  │                                         ┌────────────────────┐
  ├────────────────────────────────────┬───>│                    │  
  │                                    │    │      Database      │           
 or via external tools                 │    │                    │   
  │                                    │    └────────────────────┘
  │  ┌────────────────────┐            │      
  └──│ Bytebase           ├────────────┘         
     ├────────────────────┤  
     │ Liquibase          │
     ├────────────────────┤ 
     │ Atlas              │
     ├────────────────────┤ 
     │ etc…               │
     └────────────────────┘
[✓] done!                                                 
```

## Option 6: SQL Export with Atlas

I want to have database schema in my TypeScript codebase, I want Drizzle to output the SQL representation of my Drizzle schema to the console, and I will apply them to my database via Atlas.

```typescript
// src/schema.ts
import * as p from "drizzle-orm/pg-core";
export const users = p.pgTable("users", {
  id: p.serial().primaryKey(),
  name: p.text(),
  email: p.text().unique(), 
});
```

```
┌────────────────────────┐                  
│ $ drizzle-kit export   │                  
└─┬──────────────────────┘                  
  │                                           
  └ 1. read your drizzle schema
    2. generated SQL representation of your schema
  ┌ 4. outputs to console
  │    
  │       
  │      
  │        
  │        
  v
```

```sql
CREATE TABLE "users" (
 "id" SERIAL PRIMARY KEY,
 "name" TEXT,
 "email" TEXT UNIQUE
);
```

```
┌───────────────────────────────────┐                  
│ (._.) now you run your migrations │           
└─┬─────────────────────────────────┘  
  │
 via Atlas
  │                                    ┌──────────────┐
  │  ┌────────────────────┐            │              │
  └──│ Atlas              ├───────────>│  Database    │      
     └────────────────────┘            │              │       
                                      └──────────────┘
[✓] done!                                                 
```