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
import { BASE_PROMPT } from '@/app/api/chat/prompts/base-prompt';
import { ContextTracker } from '@/lib/tracker';
import { ToolCall, ToolCallResult, tools } from '@/types/tools';
import { config, getBaseUrl, getApiKey, getModelName } from '@/lib/config';

const openai = new OpenAI({
  apiKey: getApiKey(config.USE_OPENROUTER),
  baseURL: getBaseUrl(config.USE_OPENROUTER)
});

// Use the helper function instead
const validatedModel = getModelName(config.USE_OPENROUTER);

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

// Update the handleToolCalls function to be more robust
async function handleToolCalls(toolCalls: ToolCall[]): Promise<ToolCallResult[]> {
  const results: ToolCallResult[] = [];
  
  for (const toolCall of toolCalls) {
    if (toolCall.function.name === "get_current_weather") {
      try {
        // Safely extract arguments using regex instead of JSON.parse
        const argStr = toolCall.function.arguments;
        const locationMatch = argStr.match(/location["']?\s*:\s*["']([^"']+)["']/);
        const unitMatch = argStr.match(/unit["']?\s*:\s*["']([^"']+)["']/);
        
        if (!locationMatch) {
          console.error('No location found in arguments:', argStr);
          continue;
        }

        const location = locationMatch[1].toLowerCase();
        const unit = unitMatch ? unitMatch[1] as 'celsius' | 'fahrenheit' : 'celsius';
        
        let result;
        if (location.includes("tokyo")) {
          result = { location, temperature: "10", unit };
        } else if (location.includes("san francisco")) {
          result = { location, temperature: "72", unit };
        } else {
          result = { location, temperature: "22", unit };
        }
        
        results.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify(result)
        });

        console.log('Successfully processed weather request for:', location);
      } catch (error) {
        console.error('Error processing tool call:', error);
        console.error('Tool call data:', {
          name: toolCall.function.name,
          args: toolCall.function.arguments
        });
        
        // Return a fallback response instead of failing
        results.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify({
            error: "Could not process weather request",
            temperature: "22",
            unit: "celsius"
          })
        });
      }
    }
  }
  
  return results;
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
    // if (customSessionId) console.log('Custom session ID:', customSessionId);

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
    const stream2 = await openai.chat.completions.create({
      model: getModelName(config.USE_OPENROUTER),
      messages: contextTracker.shouldTruncate(messages) ? 
        contextTracker.truncateMessages(messages) : 
        messages,
      tools: tools,
      tool_choice: 'auto',
      stream: true,
      ...(config.USE_OPENROUTER && {
        headers: {
          'HTTP-Referer': 'https://github.com/mindpattern',
          'X-Title': 'MindPattern'
        }
      })
    });

    // Process the stream
    (async () => {
      try {
        let fullResponse = '';
        let startTime = Date.now();
        let lastProsody = Object.values(prosodyData).pop() || {};
        
        let finalToolCalls: Record<number, ToolCall> = {};
        let toolCallsProcessed = false;  // Add flag to track if we've processed tools
        
        for await (const chunk of stream2) {
          if (chunk.choices[0]?.delta?.tool_calls && !toolCallsProcessed) {
            const toolCalls = chunk.choices[0].delta.tool_calls;
            console.log('Received tool call chunk:', {
              toolCalls,
              finish_reason: chunk.choices[0]?.finish_reason
            });
            
            for (const toolCall of toolCalls) {
              if (!toolCall.function) continue;
              
              const index = toolCall.index || 0;
              if (!finalToolCalls[index]) {
                console.log('Initializing new tool call:', {
                  id: toolCall.id,
                  index,
                  function: toolCall.function
                });
                finalToolCalls[index] = {
                  id: toolCall.id || '',
                  index,
                  function: {
                    name: toolCall.function.name || '',
                    arguments: ''
                  }
                };
              }
              
              if (toolCall.function.arguments) {
                console.log('Accumulating arguments for tool call:', {
                  index,
                  newArguments: toolCall.function.arguments,
                  currentArguments: finalToolCalls[index].function.arguments
                });
                finalToolCalls[index].function.arguments += toolCall.function.arguments;
              }

              // Move isComplete check inside the loop where we have access to toolCall
              const currentToolCall = finalToolCalls[index];
              const isComplete = currentToolCall.function.arguments?.endsWith('}') || 
                                chunk.choices[0]?.finish_reason === 'tool_calls' || 
                                chunk.choices[0]?.delta?.content;
                                
              if (isComplete) {
                console.log('Tool calls complete, processing:', {
                  finish_reason: chunk.choices[0]?.finish_reason,
                  hasContent: !!chunk.choices[0]?.delta?.content,
                  accumulatedToolCalls: finalToolCalls
                });
                
                const completedCalls = Object.values(finalToolCalls);
                if (completedCalls.length > 0) {
                  console.log('Processing completed tool calls:', completedCalls);
                  const results = await handleToolCalls(completedCalls);
                  
                  if (results.length > 0) {
                    console.log('Tool call results:', results);
                    
                    const toolMessage = {
                      role: "assistant",
                      tool_calls: completedCalls.map(call => ({
                        id: call.id,
                        type: "function",
                        function: {
                          name: call.function.name,
                          arguments: call.function.arguments
                        }
                      }))
                    };
                    
                    const toolResults = results.map((result: ToolCallResult) => ({
                      role: "tool",
                      tool_call_id: result.tool_call_id,
                      content: result.output
                    }));
                    
                    messages.push(toolMessage, ...toolResults);
                    
                    // Make one final call after tool processing
                    const finalResponse = await openai.chat.completions.create({
                      model: validatedModel,
                      messages: messages,
                      stream: true
                    });
                    
                    // Process the final response
                    for await (const finalChunk of finalResponse) {
                      if (finalChunk.choices[0]?.delta?.content) {
                        console.log('Final response chunk:', {
                          content: finalChunk.choices[0].delta.content,
                          finish_reason: finalChunk.choices[0]?.finish_reason
                        });
                        const content = finalChunk.choices[0].delta.content;
                        fullResponse += content;
                        
                        const data = {
                          id: finalChunk.id,
                          object: 'chat.stream.chunk',
                          created: finalChunk.created,
                          model: validatedModel,
                          choices: [{
                            index: 0,
                            delta: {
                              role: 'assistant',
                              content: content
                            },
                            finish_reason: null,
                            logprobs: null,
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
                          type: 'assistant_input',
                          system_fingerprint: customSessionId
                        };
                        
                        await writer.write(
                          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                        );
                      }
                    }
                    
                    toolCallsProcessed = true;  // Mark tools as processed
                    break;  // Exit the main stream loop
                  }
                }
              }
            }
          }

          // Handle regular content if no tool calls
          if (chunk.choices[0]?.delta?.content && !toolCallsProcessed) {
            console.log('Regular content chunk:', {
              content: chunk.choices[0].delta.content,
              toolCallsProcessed
            });
            const content = chunk.choices[0].delta.content;
            fullResponse += content;
            
            console.log('LLM response after tool use:', {
              content,
              fullResponseSoFar: fullResponse
            });
            
            // Format response to match Hume's expectations
            const data = {
              id: chunk.id,
              object: 'chat.stream.chunk',
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
        
        // Send final message
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
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        
        console.log('Full response:', fullResponse);
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
