import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { BASE_PROMPT } from '@/app/api/chat/prompts/base-prompt';
import { ContextTracker } from '@/lib/tracker';
import { ToolService } from '@/services/tools/tool-service';
import { config, getBaseUrl, getApiKey, getModelName } from '@/lib/config';
import { StreamingService } from '@/services/streaming/stream-service';

const openai = new OpenAI({
  apiKey: getApiKey(config.USE_OPENROUTER),
  baseURL: getBaseUrl(config.USE_OPENROUTER)
});

const validatedModel = getModelName(config.USE_OPENROUTER);
const streamingService = new StreamingService();
const toolService = new ToolService();

export async function OPTIONS(req: NextRequest) {
  return streamingService.setupCORSResponse();
}

export async function POST(req: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    // Only check authentication if API_KEY is set
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {  // Only validate if auth header exists
      const token = authHeader.split(' ')[1];
      if (!authHeader.startsWith('Bearer ') || !token) {
        console.error('❌ Authentication failed - invalid format');
        return streamingService.setupErrorResponse('Invalid authorization format', 401);
      }
      console.log('✅ Authentication successful');
    }

    const body = await req.json();
    const customSessionId = new URL(req.url).searchParams.get('custom_session_id');
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

    // Start OpenAI stream with configured model
    const openaiStream = await openai.chat.completions.create({
      model: getModelName(config.USE_OPENROUTER),
      messages: contextTracker.shouldTruncate(messages) ? 
        contextTracker.truncateMessages(messages) : 
        messages,
      tools: toolService.getToolDefinitions(),
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
        
        toolService.reset(); // Reset tool state for new request
        
        for await (const chunk of openaiStream) {
          if (chunk.choices[0]?.delta?.tool_calls && !toolService.isProcessed()) {
            const toolCalls = chunk.choices[0].delta.tool_calls;
            
            for (const toolCall of toolCalls) {
              const isComplete = toolService.processToolCallChunk(
                toolCall, 
                chunk.choices[0]?.finish_reason
              );
                                
              if (isComplete) {
                const completedCalls = toolService.getCompletedCalls();
                if (completedCalls.length > 0) {
                  const results = await toolService.handleToolCalls(completedCalls);
                  
                  if (results.length > 0) {
                    const toolMessage = toolService.formatToolMessage(completedCalls);
                    const toolResults = toolService.formatToolResults(results);
                    
                    messages.push(toolMessage, ...toolResults);
                    
                    // Make one final call after tool processing
                    const finalResponse = await openai.chat.completions.create({
                      model: validatedModel,
                      messages: messages,
                      tools: toolService.getToolDefinitions(),
                      stream: true
                    });
                    
                    // Process the final response
                    for await (const finalChunk of finalResponse) {
                      if (finalChunk.choices[0]?.delta?.content) {
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
                        
                        await streamingService.writeChunk(writer, data);
                      }
                    }
                    
                    break;  // Exit the main stream loop
                  }
                }
              }
            }
          }

          // Handle regular content if no tool calls
          if (chunk.choices[0]?.delta?.content && !toolService.isProcessed()) {
            const content = chunk.choices[0].delta.content;
            fullResponse += content;
            
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
            
            await streamingService.writeChunk(writer, data);
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
        
        await streamingService.writeChunk(writer, endMessage);
        await streamingService.writeDone(writer);
        
      } catch (error) {
        console.error('Streaming error:', error);
        await streamingService.writeError(writer, error);
      } finally {
        await writer.close();
      }
    })();

    return streamingService.setupSSEResponse(stream);
  } catch (error) {
    console.error('POST Error:', error);
    return streamingService.setupErrorResponse(
      error instanceof Error ? error.message : 'Failed to process request'
    );
  }
}
