import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import * as dotenv from 'dotenv'
import { getModelName } from '@/lib/config'
import { ContextTracker } from '@/lib/tracker'

// Load environment variables from .env file
dotenv.config()

// Ensure required environment variables are set
beforeEach(() => {
  // Set required environment variables if not already set
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key'
  process.env.OPENAI_MODEL = 'gpt-4o'
  process.env.OPEN_ROUTER_MODEL = 'gpt-4o'
  process.env.OPEN_ROUTER_API_KEY = 'test-openrouter-key'
  process.env.USE_OPENROUTER = 'false'
})

// Mock Next Request
function createNextRequest(body: any): NextRequest {
  return new NextRequest(
    new URL('http://localhost:3000/api/chat/completions'),
    {
      method: 'POST',
      body: JSON.stringify(body)
    }
  )
}

describe('chat completions route', () => {
  let POST: any;

  beforeEach(async () => {
    // Import route after setting env vars
    const route = await import('./route')
    POST = route.POST
  })

  it('should handle OpenAI tool calls', async () => {
    const request = createNextRequest({
      messages: [{
        role: 'user',
        content: 'What is the weather in San Francisco?'
      }]
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    // Read the stream and verify responses
    const chunks = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(new TextDecoder().decode(value))
    }

    const events = chunks
      .join('')
      .split('\n\n')
      .filter(line => line.startsWith('data: '))
      .map(line => line.slice(6))
      .filter(line => line.trim())
      .map(line => JSON.parse(line))

    // Verify we got tool calls and responses
    expect(events.some(event => 
      event.choices?.[0]?.delta?.tool_calls?.[0]?.function?.name === 'get_current_weather'
    )).toBe(true)

    expect(events.some(event => 
      event.choices?.[0]?.delta?.content?.includes('San Francisco')
    )).toBe(true)
  })

  it('should handle OpenRouter tool calls', async () => {
    // Set OpenRouter env before importing
    process.env.USE_OPENROUTER = 'true'
    
    // Re-import route with new env
    const { POST: RouterPOST } = await import('./route')
    
    const request = createNextRequest({
      messages: [{
        role: 'user',
        content: 'What is the weather in San Francisco?'
      }]
    })

    const response = await RouterPOST(request)
    expect(response.status).toBe(200)

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    // Read the stream and verify responses
    const chunks = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(new TextDecoder().decode(value))
    }

    const events = chunks
      .join('')
      .split('\n\n')
      .filter(line => line.startsWith('data: '))
      .map(line => line.slice(6))
      .filter(line => line.trim())
      .map(line => JSON.parse(line))

    // Verify we got tool calls and responses
    expect(events.some(event => 
      event.choices?.[0]?.delta?.tool_calls?.[0]?.function?.name === 'get_current_weather'
    )).toBe(true)

    expect(events.some(event => 
      event.choices?.[0]?.delta?.content?.includes('San Francisco')
    )).toBe(true)
  })
}) 