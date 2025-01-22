import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('config validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should validate OpenRouter configuration', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPEN_ROUTER_API_KEY = 'test-openrouter-key';
    process.env.USE_OPENROUTER = 'true';
    process.env.OPEN_ROUTER_MODEL = 'openai/gpt-4o-mini';

    const { config } = await import('./config');
    
    expect(config.OPENAI_API_KEY).toBe('test-key');
    expect(config.OPEN_ROUTER_API_KEY).toBe('test-openrouter-key');
    expect(config.USE_OPENROUTER).toBe(true);
    expect(config.OPEN_ROUTER_MODEL).toBe('openai/gpt-4o-mini');
  });

  it('should fail when required keys are missing', async () => {
    process.env.OPENAI_API_KEY = '';
    
    await expect(import('./config')).rejects.toThrow('Invalid environment variables');
  });

  it('should use default values when optionals not provided', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPEN_ROUTER_MODEL = 'openai/gpt-4o-mini';

    const { config } = await import('./config');
    
    expect(config.USE_OPENROUTER).toBe(undefined);
    expect(config.OPENROUTER_BASE_URL).toBe('https://openrouter.ai/api/v1');
  });
}); 