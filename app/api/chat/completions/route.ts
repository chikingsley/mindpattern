import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Environment validation
const HUME_API_KEY = process.env.HUME_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'openai/gpt-3.5-turbo';

if (!HUME_API_KEY) {
  console.log('No HUME_API_KEY set - authentication disabled');
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
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

// export async function GET() {
//   console.log('🎯 SSE Connection established to /api/chat/completions');
//   const stream = new TransformStream();
//   const writer = stream.writable.getWriter();
  
//   try {
//     const encoder = new TextEncoder();
//     console.log('📡 Sending connected message');
//     await writer.write(encoder.encode('data: {"type":"connected"}\n\n'));
//     console.log('Sent connected message');
    
//     return setupSSEResponse(stream);
//   } catch (error) {
//     console.error('❌ GET Error:', error);
//     return new Response(
//       JSON.stringify({ error: error instanceof Error ? error.message : 'Connection failed' }), 
//       { 
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*',
//         }
//       }
//     );
//   }
// }

export async function POST(req: NextRequest) {
  console.log('🚀 POST request received at /api/chat/completions');
  console.log('📨 Headers:', Object.fromEntries(req.headers.entries()));
  
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    // Only check authentication if API_KEY is set
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {  // Only validate if auth header exists
      console.log('🔑 Checking authentication');
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
    console.log('📦 Request body:', body);

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
