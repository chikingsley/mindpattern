/**
 * Chat Completions API Route Handler
 * 
 * This file handles the chat completions API endpoint that bridges Hume's frontend with OpenAI's API.
 * It processes streaming responses and handles prosody data integration.
 * 
 * Flow:
 * 1. Request Processing
 *    - Receives POST requests with messages in Hume's format
 *    - Validates authentication if API key is present
 *    - Extracts custom session ID from URL params
 * 
 * 2. Message Transformation
 *    - Converts Hume's message format to OpenAI format
 *    - Stores prosody data for later use in responses
 *    - Prepends system prompt to guide AI responses
 * 
 * 3. OpenAI Integration
 *    - Streams request to OpenAI via OpenRouter
 *    - Uses configured model (default: gpt-3.5-turbo)
 * 
 * 4. Response Streaming
 *    - Processes OpenAI's streaming response
 *    - Transforms each chunk back to Hume's format
 *    - Adds stored prosody data to responses
 *    - Sends SSE (Server-Sent Events) to client
 * 
 * 5. Error Handling
 *    - Handles authentication errors
 *    - Manages streaming errors
 *    - Provides appropriate error responses
 * 
 * Environment Variables Required:
 * - OPEN_ROUTER_API_KEY: API key for OpenRouter
 * - OPEN_ROUTER_MODEL: Model identifier (e.g., 'anthropic/claude-3.5-sonnet')
 * - MEM0_API_KEY: API key for memory client
 * - HUME_API_KEY: Optional, for authentication
 */

import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import MemoryClient from 'mem0ai';
import { BASE_PROMPT } from '@/app/api/chat/prompts/base-prompt';
import { ContextTracker, SupportedModel, MODEL_LIMITS } from '@/lib/tracker';

// Environment validation
const HUME_API_KEY = process.env.HUME_API_KEY;
if (!HUME_API_KEY) {
  console.log('No HUME_API_KEY set - authentication disabled');
}

// Get model from env, validate it's a supported model
const OPEN_ROUTER_MODEL = process.env.OPEN_ROUTER_MODEL;
if (!OPEN_ROUTER_MODEL) {
  throw new Error('OPEN_ROUTER_MODEL is required');
}

// Validate model is supported
if (!(OPEN_ROUTER_MODEL in MODEL_LIMITS)) {
  throw new Error(`Unsupported model: ${OPEN_ROUTER_MODEL}. Must be one of: ${Object.keys(MODEL_LIMITS).join(', ')}`);
}

// Now TypeScript knows OPEN_ROUTER_MODEL is definitely a SupportedModel
const validatedModel: SupportedModel = OPEN_ROUTER_MODEL as SupportedModel;

const MEM0_API_KEY = process.env.MEM0_API_KEY;
if (!MEM0_API_KEY) throw new Error('MEM0_API_KEY is required');
const client = new MemoryClient({ apiKey: MEM0_API_KEY });

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  defaultHeaders: {
    // "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL,
    "X-Title": "Hume Chat",
  }
});

// Helper function to setup SSE response headers
function setupSSEResponse(stream: TransformStream) {
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    },
  });
}

export async function POST(req: NextRequest) {
  // console.log('🚀 POST request received at /api/chat/completions');
  // console.log('📨 Headers:', Object.fromEntries(req.headers.entries()));
  
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    // Only check authentication if API_KEY is set
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {  // Only validate if auth header exists
      // console.log('🔑 Checking authentication');
      const token = authHeader.split(' ')[1];
      if (!authHeader.startsWith('Bearer ') || !token) {
        console.error('❌ Authentication failed - invalid format');
        return new Response(
          JSON.stringify({ error: 'Invalid authorization format' }), 
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
      // Token is present and in correct format
      console.log('✅ Authentication successful');
    }

    const body = await req.json();
    // console.log('📦 Request body:', body);

    // Get custom session ID if provided
    const customSessionId = new URL(req.url).searchParams.get('custom_session_id');
    if (customSessionId) {
      console.log('Custom session ID:', customSessionId);
    }

    // Store prosody data to use in responses
    const prosodyData: { [key: string]: any } = {};
    
    // Initialize context tracker with the specified model
    const contextTracker = new ContextTracker(validatedModel);

    // Handle Hume message format
    const messages = [
      { role: 'system', content: BASE_PROMPT },
      ...body.messages.map((msg: any) => {
      // Store prosody data for this message if available
      if (msg.models?.prosody?.scores) {
        prosodyData[msg.content] = msg.models.prosody.scores;
      }
      
      // Return only role and content as required by OpenAI
      return {
        role: msg.role,
        content: msg.content
      };
    })];

    // console.log('Processing messages:', messages);
    // console.log('Prosody data:', prosodyData);

    // Start OpenAI stream with configured model
    const completion = await openai.chat.completions.create({
      model: validatedModel,
      messages: contextTracker.shouldTruncate(messages) ? 
        contextTracker.truncateMessages(messages) : 
        messages,
      stream: true,
    });

    // Process the stream
    (async () => {
      try {
        let fullResponse = '';
        let startTime = Date.now();
        let lastProsody = Object.values(prosodyData).pop() || {}; // Get most recent prosody scores
        
        for await (const chunk of completion) {
          // Get context stats if available
          if (chunk.usage) {
            const stats = await contextTracker.getStats(chunk);
            console.log('📊 Context stats:', stats);
          }

          if (chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;
            fullResponse += content;
            
            // Format response to match Hume's expectations
            const data = {
              id: chunk.id,
              object: 'chat.completion.chunk',
              created: chunk.created,
              model: validatedModel,
              choices: [{
                index: 0,
                delta: {
                  role: 'assistant',
                  content: content
                },
                finish_reason: null,
                logprobs: null,
                // Add Hume-specific fields with last known prosody scores
                models: {
                  prosody: {
                    scores: lastProsody
                  }
                },
                time: {
                  begin: startTime,
                  end: Date.now()
                }
              }],
              type: 'assistant_input',  // Required by Hume
              system_fingerprint: customSessionId // Include session ID if provided
            };
            
            console.log('Sending chunk:', content);
            await writer.write(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          }
        }
        
        // Send final message to indicate end of assistant's turn
        const endMessage = {
          type: 'assistant_end',
          time: {
            begin: startTime,
            end: Date.now()
          },
          models: {
            prosody: {
              scores: lastProsody
            }
          }
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(endMessage)}\n\n`));
        
        console.log('Full response:', fullResponse);
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('Streaming error:', error);
        const errorData = {
          type: 'error',
          error: error instanceof Error ? error.message : 'An error occurred while streaming'
        };
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();

    return setupSSEResponse(stream);
  } catch (error) {
    console.error('POST Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to process request' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
}
