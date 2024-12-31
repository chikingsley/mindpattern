import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Environment validation
const API_KEY = process.env.HUME_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-realtime-preview-2024-12-17';
const ALLOWED_MODELS = (process.env.ALLOWED_MODELS || 'gpt-4o-realtime-preview-2024-12-17').split(',').map(m => m.trim());

if (!API_KEY) {
  console.log('No HUME_API_KEY set - authentication disabled');
}

if (!ALLOWED_MODELS.includes(OPENAI_MODEL)) {
  console.warn(`Warning: Model ${OPENAI_MODEL} is not in allowed models list: ${ALLOWED_MODELS.join(', ')}`);
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
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

export async function GET() {
  console.log('SSE Connection established');
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  try {
    const encoder = new TextEncoder();
    await writer.write(encoder.encode('data: {"type":"connected"}\n\n'));
    console.log('Sent connected message');
    
    return setupSSEResponse(stream);
  } catch (error) {
    console.error('GET Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Connection failed' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    // Only check authentication if API_KEY is set
    const authHeader = req.headers.get('Authorization');
    if (API_KEY && authHeader) {  // Only validate if both exist
      if (!authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== API_KEY) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }), 
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
    }

    const body = await req.json();
    console.log('Received request:', body);

    // Get custom session ID if provided
    const customSessionId = new URL(req.url).searchParams.get('custom_session_id');
    if (customSessionId) {
      console.log('Custom session ID:', customSessionId);
    }

    // Store prosody data to use in responses
    const prosodyData: { [key: string]: any } = {};
    
    // Handle Hume message format
    const messages = body.messages.map((msg: any) => {
      // Store prosody data for this message if available
      if (msg.models?.prosody?.scores) {
        prosodyData[msg.content] = msg.models.prosody.scores;
      }
      
      // Return only role and content as required by OpenAI
      return {
        role: msg.role,
        content: msg.content
      };
    });

    console.log('Processing messages:', messages);
    console.log('Prosody data:', prosodyData);

    // Start OpenAI stream with configured model
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: messages,
      stream: true,
    });

    // Process the stream
    (async () => {
      try {
        let fullResponse = '';
        let startTime = Date.now();
        let lastProsody = Object.values(prosodyData).pop() || {}; // Get most recent prosody scores
        
        for await (const chunk of completion) {
          if (chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;
            fullResponse += content;
            
            // Format response to match Hume's expectations
            const data = {
              id: chunk.id,
              object: 'chat.completion.chunk',
              created: chunk.created,
              model: OPENAI_MODEL,
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
