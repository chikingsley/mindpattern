// Mock environment variables for testing
process.env.NEXT_PUBLIC_JINA_API_KEY = 'test-jina-api-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-supabase-key';

// Export for use in tests
export const TEST_ENV = {
  JINA_API_KEY: process.env.NEXT_PUBLIC_JINA_API_KEY,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}; 