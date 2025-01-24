import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { BASE_PROMPT } from '@/app/api/chat/prompts/base-prompt';
import { ContextTracker } from '@/lib/tracker';
import { ToolService } from '@/services/tools/tool-service';
import { config, getBaseUrl, getApiKey, getModelName } from '@/lib/config';
import { StreamingService } from '@/services/streaming/stream-service';
import { embeddingsService } from '@/services/embeddings/EmbeddingsService';
import { expressionColors } from '@/components/chat/expressions/expressionColors';
import { expressionLabels } from '@/components/chat/expressions/expressionLabels';

const openai = new OpenAI({
  apiKey: getApiKey(config.USE_OPENROUTER),
  baseURL: getBaseUrl(config.USE_OPENROUTER)
});

const validatedModel = getModelName(config.USE_OPENROUTER);
const streamingService = new StreamingService();
const toolService = new ToolService();

export async function OPTIONS(request: NextRequest) {
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
    const userId = req.headers.get('x-user-id') || 'default-user';
    const prosodyData: { [key: string]: any } = {};
    
    // Initialize context tracker with the specified model
    const contextTracker = new ContextTracker(validatedModel);
    toolService.setContextTracker(contextTracker);

    // Process messages and store with embeddings
    let messages = [
      { role: 'system', content: BASE_PROMPT },
      ...await Promise.all(body.messages.filter((msg: any) => msg?.content?.trim()).map(async (msg: any) => {
        // Enrich prosody data with colors and labels
        let prosodyMetadata = {};
        if (msg.models?.prosody?.scores) {
          prosodyMetadata = {
            prosody: {
              scores: msg.models.prosody.scores,
              colors: Object.fromEntries(
                Object.entries(msg.models.prosody.scores)
                  .map(([key]) => [key, expressionColors[key as keyof typeof expressionColors]])
              ),
              labels: Object.fromEntries(
                Object.entries(msg.models.prosody.scores)
                  .map(([key]) => [key, expressionLabels[key]])
              )
            }
          };
        }

        try {
          // Store message with embeddings
          await embeddingsService.storeMessageAndVector(
            msg.content,
            userId,
            customSessionId || 'default-session',
            msg.role,
            prosodyMetadata
          );
        } catch (error) {
          console.error('Error storing message with vector:', error, {
            content: msg.content.substring(0, 100),
            userId,
            sessionId: customSessionId,
            role: msg.role
          });
          // Continue without failing - storage error shouldn't break the UI
        }

        return {
          role: msg.role,
          content: msg.content,
          ...(prosodyMetadata && { metadata: prosodyMetadata })
        };
      }))
    ];

    toolService.setMessages(messages);

    // Get relevant context for the latest user message
    const lastUserMessage = body.messages[body.messages.length - 1];
    if (lastUserMessage.role === 'user') {
      const relevantContext = await embeddingsService.getRelevantContext(
        lastUserMessage.content,
        userId,
        customSessionId || 'default-session',
        5,
        true // Use reranker for better semantic matching
      );

      // Add context to system message if relevant results found
      if (relevantContext.length > 0) {
        const contextStr = relevantContext
          .map(r => `Previous relevant message (similarity: ${(r.finalScore || r.similarity).toFixed(2)}): "${r.message.content}"`)
          .join('\n');
        
        messages[0].content += `\n\nRelevant context from previous messages:\n${contextStr}`;
      }
    }

    // Start OpenAI stream with configured model
    const openaiStream = await openai.chat.completions.create({
      model: getModelName(config.USE_OPENROUTER),
      messages: messages,
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
                models: lastProsody ? {
                  prosody: {
                    scores: lastProsody,
                    colors: Object.fromEntries(
                      Object.entries(lastProsody)
                        .map(([key]) => [key, expressionColors[key as keyof typeof expressionColors]])
                    ),
                    labels: Object.fromEntries(
                      Object.entries(lastProsody)
                        .map(([key]) => [key, expressionLabels[key]])
                    )
                  }
                } : {},
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
        
        // Store the complete assistant response with embeddings
        if (fullResponse) {
          const prosodyMetadata = lastProsody ? {
            prosody: {
              scores: lastProsody,
              colors: Object.fromEntries(
                Object.entries(lastProsody)
                  .map(([key]) => [key, expressionColors[key as keyof typeof expressionColors]])
              ),
              labels: Object.fromEntries(
                Object.entries(lastProsody)
                  .map(([key]) => [key, expressionLabels[key]])
              )
            }
          } : {};

          await embeddingsService.storeMessageAndVector(
            fullResponse,
            userId,
            customSessionId || 'default-session',
            'assistant',
            prosodyMetadata
          );
        }

        // Send final message
        const endMessage = {
          type: 'assistant_end',
          time: {
            begin: startTime,
            end: Date.now()
          },
          models: lastProsody ? {
            prosody: {
              scores: lastProsody,
              colors: Object.fromEntries(
                Object.entries(lastProsody)
                  .map(([key]) => [key, expressionColors[key as keyof typeof expressionColors]])
              ),
              labels: Object.fromEntries(
                Object.entries(lastProsody)
                  .map(([key]) => [key, expressionLabels[key]])
              )
            }
          } : {}
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
