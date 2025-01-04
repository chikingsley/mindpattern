# Using Prisma with Supabase RLS: Implementation Guide

## Issue Context

When using Prisma with a Supabase database that has Row Level Security (RLS) policies, we need to ensure that Prisma respects these policies. The challenge is that Prisma by itself doesn't automatically set the security context variables that Supabase RLS expects (like `auth.uid()`).

## Key Challenges

- Prisma doesn't natively support RLS context variables
- Security context needs to be set for every database query
- Connection pooling can lead to context leakage between requests
- Nested transactions can break RLS context

## Solution Implementation

### 1. Create a RLS-Aware Prisma Client

Use Prisma Client Extensions to create a wrapper that automatically sets the security context:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const prismaWithRLS = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        return prisma.$transaction([
          // Set Supabase auth context
          prisma.$executeRaw`SELECT set_config('request.jwt.claims', '{"sub": "${userId}"}', true)`,
          query(args)
        ]);
      }
    }
  }
});

export { prismaWithRLS as prisma }
```

### 2. Usage in API Routes

```typescript
// api/your-endpoint.ts
import { prisma } from '../lib/prisma'

export async function handler(req, res) {
  const { user } = req.auth // or however you get your user context
  
  // The RLS context will automatically be set
  const data = await prisma.yourModel.findMany({
    where: {
      // Your query conditions
    }
  })
  
  return data
}
```

### 3. Best Practices

1. **Migrations and Policies**
   - Let Supabase handle migrations and RLS policies
   - Don't use Prisma migrations for RLS-related changes
   - Keep your RLS policies in Supabase migration files

2. **Connection Management**
   ```typescript
   const prisma = new PrismaClient({
     // Adjust pool settings based on your needs
     datasources: {
       db: {
         poolConfig: {
           maxPoolSize: 20,
           idleTimeoutMs: 30000
         }
       }
     }
   })
   ```

3. **Transaction Handling**
   - Avoid nested transactions when possible
   - If needed, use interactive transactions:
   ```typescript
   await prisma.$transaction(async (tx) => {
     // Your transaction queries here
   }, {
     isolationLevel: 'Serializable'
   })
   ```

4. **Security Context**
   - Always ensure user context is available
   - Handle unauthenticated cases explicitly
   - Consider middleware for context injection

## Example RLS Configuration

Here's how your Supabase RLS policies might look:

```sql
-- Example RLS policy for a posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own posts" ON posts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id);
```

## Common Gotchas to Watch For

1. **Context Leakage**
   - Always use `SET LOCAL` instead of `SET`
   - Reset context after operations if not using transactions

2. **Transaction Isolation**
   - Be aware of transaction isolation levels
   - Use appropriate levels for your use case

3. **Performance**
   - Monitor query performance with RLS
   - Consider caching where appropriate
   - Watch connection pool usage

4. **Error Handling**
   - Handle RLS policy violations gracefully
   - Provide clear error messages for security-related failures

## Testing Recommendations

1. **Unit Tests**
```typescript
describe('RLS Integration', () => {
  it('should respect RLS policies', async () => {
    const result = await prisma.posts.findMany()
    expect(result).toMatchRLS() // Custom matcher
  })
})
```

2. **Integration Tests**
   - Test with different user contexts
   - Verify policy enforcement
   - Check edge cases (unauthenticated, different roles)

## Debugging Tips

1. Monitor RLS context:
```sql
SELECT current_setting('request.jwt.claims', true);
```

2. Check active policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

3. Enable debug logging in Prisma:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma Client Extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Support and Maintenance

- Keep track of Prisma updates for RLS-related features
- Monitor Supabase RLS policy changes
- Regularly test RLS enforcement
- Consider implementing audit logging for security-related operations
