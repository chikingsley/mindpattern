# Row-Level Security (RLS) in Drizzle

Drizzle enables Row-Level Security (RLS) for any Postgres table, allowing you to create policies with various options and manage the roles these policies apply to. It supports raw representation of Postgres policies and roles, compatible with popular providers like Neon and Supabase.

## Enabling RLS

Enable RLS on a table without adding policies using `.enableRLS()`:

```typescript
import { integer, pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer(),
}).enableRLS();
```

Note: Adding a policy to a table automatically enables RLS, making explicit enablement unnecessary.

## Roles

Define roles with different options:

```typescript
import { pgRole } from 'drizzle-orm/pg-core';

// Create new role
export const admin = pgRole('admin', { 
  createRole: true, 
  createDb: true, 
  inherit: true 
});

// Reference existing role
export const admin = pgRole('admin').existing();
```

## Policies

### Basic Policy Definition

Define policies within a Drizzle table:

```typescript
import { sql } from 'drizzle-orm';
import { integer, pgPolicy, pgRole, pgTable } from 'drizzle-orm/pg-core';

export const admin = pgRole('admin');
export const users = pgTable('users', {
  id: integer(),
}, (t) => [
  pgPolicy('policy', {
    as: 'permissive',
    to: admin,
    for: 'delete',
    using: sql``,
    withCheck: sql``,
  }),
]);
```

### Policy Options

* as: 'permissive' or 'restrictive'
* to: Role specification (public, current_role, current_user, session_user, or role name)
* for: Command application (all, select, insert, update, delete)
* using: SQL statement for USING clause
* withCheck: SQL statement for WITH CHECK clause

### Linking to Existing Tables

Link policies to existing tables:

```typescript
import { sql } from "drizzle-orm";
import { pgPolicy } from "drizzle-orm/pg-core";
import { authenticatedRole, realtimeMessages } from "drizzle-orm/supabase";

export const policy = pgPolicy("authenticated role insert policy", {
  for: "insert",
  to: authenticatedRole,
  using: sql``,
}).link(realtimeMessages);
```

## Migrations Configuration

Configure role management in drizzle.config.ts:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'postgresql',
  schema: "./drizzle/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true,
  entities: {
    roles: true  // Enable role management
  }
});
```

### Advanced Configuration Examples

Exclude specific roles:
```typescript
export default defineConfig({
  entities: {
    roles: {
      exclude: ['admin']
    }
  }
});
```

Include specific roles:
```typescript
export default defineConfig({
  entities: {
    roles: {
      include: ['admin']
    }
  }
});
```

Provider-specific configuration:
```typescript
export default defineConfig({
  entities: {
    roles: {
      provider: 'supabase',  // or 'neon'
      exclude: ['new_supabase_role']
    }
  }
});
```

## RLS on Views

Enable RLS for views using security_invoker:

```typescript
export const roomsUsersProfiles = pgView("rooms_users_profiles")
  .with({
    securityInvoker: true,
  })
  .as((qb) =>
    qb
      .select({
        ...getTableColumns(roomsUsers),
        email: profiles.email,
      })
      .from(roomsUsers)
      .innerJoin(profiles, eq(roomsUsers.userId, profiles.id))
  );
```

## Provider-Specific Features

### Neon Integration

Use Neon's crudPolicy function:

```typescript
import { crudPolicy } from 'drizzle-orm/neon';
import { integer, pgRole, pgTable } from 'drizzle-orm/pg-core';

export const admin = pgRole('admin');
export const users = pgTable('users', {
  id: integer(),
}, (t) => [
  crudPolicy({ role: admin, read: true, modify: false }),
]);
```

### Supabase Integration

Use Supabase's predefined roles:

```typescript
import { sql } from 'drizzle-orm';
import { serviceRole } from 'drizzle-orm/supabase';
import { integer, pgPolicy, pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer(),
}, (t) => [
  pgPolicy(`policy-insert`, {
    for: 'insert',
    to: serviceRole,
    withCheck: sql`false`,
  }),
]);
```

### Supabase Client Implementation

Create a Drizzle Supabase client:

```typescript
type SupabaseToken = {
  iss?: string;
  sub?: string;
  role?: string;
  // ... other token properties
};

export function createDrizzle(token: SupabaseToken, { admin, client }: { 
  admin: PgDatabase<any>; 
  client: PgDatabase<any> 
}) {
  return {
    admin,
    rls: async (transaction, ...rest) => {
      return await client.transaction(async (tx) => {
        try {
          await tx.execute(sql`
            select set_config('request.jwt.claims', '${sql.raw(JSON.stringify(token))}', TRUE);
            select set_config('request.jwt.claim.sub', '${sql.raw(token.sub ?? "")}', TRUE);												
            set local role ${sql.raw(token.role ?? "anon")};
          `);
          return await transaction(tx);
        } finally {
          await tx.execute(sql`
            select set_config('request.jwt.claims', NULL, TRUE);
            select set_config('request.jwt.claim.sub', NULL, TRUE);
            reset role;
          `);
        }
      }, ...rest);
    }
  };
}
```

Usage example:

```typescript
async function getRooms() {
  const db = await createDrizzleSupabaseClient();
  return db.rls((tx) => tx.select().from(rooms));
}
```