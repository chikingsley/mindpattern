import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import * as dotenv from 'dotenv'
import { getModelName } from '@/lib/config'
import { ContextTracker } from '@/lib/tracker'
import { BASE_PROMPT } from '@/app/api/chat/prompts/base-prompt'
import { toolRegistry } from '@/services/tools/registry'
import { vi } from 'vitest'

// Load environment variables from .env file
dotenv.config()

describe('chat completions route', () => {
  let POST: any;

  beforeEach(async () => {
    vi.resetModules();
  });

  it('should handle OpenAI tool calls', async () => {
    // Explicitly set OpenAI config
    process.env.USE_OPENROUTER = 'false';
    process.env.OPENAI_MODEL = 'gpt-4o';
    
    // Import route after setting env vars
    const route = await import('./route')
    POST = route.POST;

    const request = createNextRequest({
      messages: [
        { role: 'system', content: BASE_PROMPT },
        { 
          role: 'user',
          content: 'What is the current weather in San Francisco?'
        }
      ]
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    let fullResponse = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = new TextDecoder().decode(value)
      fullResponse += chunk
    }
    
    // Just verify we got some response mentioning the temperature
    expect(fullResponse).toContain('72')
  }, 10000)

  it('should handle OpenRouter tool calls', async () => {
    // Explicitly set OpenRouter config
    process.env.USE_OPENROUTER = 'true';
    process.env.OPEN_ROUTER_MODEL = 'openai/gpt-4o-mini';
    
    // Re-import route with new env
    const { POST: RouterPOST } = await import('./route')
    
    const request = createNextRequest({
      messages: [
        { role: 'system', content: BASE_PROMPT },
        { 
          role: 'user',
          content: 'What is the weather in San Francisco?'
        }
      ]
    })

    const response = await RouterPOST(request)
    expect(response.status).toBe(200)

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    let fullResponse = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = new TextDecoder().decode(value)
      fullResponse += chunk
    }
    
    // Just verify we got some response mentioning the temperature
    expect(fullResponse).toContain('72')
  }, 10000)
})

// Helper function to create request
function createNextRequest(body: any): NextRequest {
  const tools = toolRegistry.getToolDefinitions();
  return new NextRequest(
    new URL('http://localhost:3000/api/chat/completions'),
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        tools,
        tool_choice: {
          type: 'function',
          function: { name: 'get_current_weather' }
        }
      })
    }
  )
} 