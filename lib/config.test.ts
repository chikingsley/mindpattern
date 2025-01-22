import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MODEL_LIMITS } from '@/lib/tracker'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

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
    // Explicitly set OpenRouter config
    process.env.USE_OPENROUTER = 'true';
    process.env.OPEN_ROUTER_MODEL = 'openai/gpt-4o-mini';
    
    const { config } = await import('./config');
    
    expect(config.OPENAI_API_KEY).toBeDefined();
    expect(config.OPEN_ROUTER_API_KEY).toBeDefined();
    expect(config.USE_OPENROUTER).toBe(true);
    expect(config.OPEN_ROUTER_MODEL).toBe('openai/gpt-4o-mini');
    expect(Object.keys(MODEL_LIMITS)).toContain(config.OPEN_ROUTER_MODEL);
  });

  it('should validate OpenAI configuration', async () => {
    // Explicitly set OpenAI config
    process.env.USE_OPENROUTER = 'false';
    process.env.OPENAI_MODEL = 'gpt-4o';
    
    const { config } = await import('./config');
    
    expect(config.OPENAI_API_KEY).toBeDefined();
    expect(config.USE_OPENROUTER).toBe(false);
    expect(config.OPENAI_MODEL).toBe('gpt-4o');
    expect(Object.keys(MODEL_LIMITS)).toContain(config.OPENAI_MODEL);
  });

  it('should fail when required keys are missing', async () => {
    // Temporarily unset required key
    const savedKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = '';
    
    await expect(import('./config')).rejects.toThrow('Invalid environment variables');
    
    // Restore key
    process.env.OPENAI_API_KEY = savedKey;
  });

  it('should use default values when optionals not provided', async () => {
    // Save current values
    const savedUseOpenRouter = process.env.USE_OPENROUTER;
    const savedOpenRouterBaseUrl = process.env.OPENROUTER_BASE_URL;
    const savedOpenAIBaseUrl = process.env.OPENAI_BASE_URL;
    
    // Unset optional values to test defaults
    delete process.env.USE_OPENROUTER;
    delete process.env.OPENROUTER_BASE_URL;
    delete process.env.OPENAI_BASE_URL;
    
    const { config } = await import('./config');
    
    expect(config.USE_OPENROUTER).toBe(false);
    expect(config.OPENROUTER_BASE_URL).toBe('https://openrouter.ai/api/v1');
    expect(config.OPENAI_BASE_URL).toBe('https://api.openai.com/v1');
    
    // Restore values
    process.env.USE_OPENROUTER = savedUseOpenRouter;
    process.env.OPENROUTER_BASE_URL = savedOpenRouterBaseUrl;
    process.env.OPENAI_BASE_URL = savedOpenAIBaseUrl;
  });

  it('should validate model names against MODEL_LIMITS', async () => {
    const { config } = await import('./config');
    
    expect(Object.keys(MODEL_LIMITS)).toContain(config.OPENAI_MODEL);
    expect(Object.keys(MODEL_LIMITS)).toContain(config.OPEN_ROUTER_MODEL);
  });
}); 