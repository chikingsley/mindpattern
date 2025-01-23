import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LettaClient } from '../letta/letta-client';
import { MessageTransformer } from './message-transformer';
import { MessageHandler } from './message-handler';
import { HumeMessage } from './message-types';
import { LettaStreamChunk } from '../streaming/stream-types';

// Mock LettaClient
vi.mock('../letta/letta-client', () => ({
  LettaClient: vi.fn().mockImplementation(() => ({
    getOrCreateAgent: vi.fn().mockResolvedValue('test-agent-id'),
    sendMessage: vi.fn().mockResolvedValue(new ReadableStream({
      start(controller) {
        const chunk: LettaStreamChunk = {
          id: 'test-1',
          date: new Date().toISOString(),
          message_type: 'internal_monologue',
          internal_monologue: 'Test response'
        };
        // Convert to Uint8Array directly
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(chunk));
        controller.enqueue(data);
        controller.close();
      }
    }))
  }))
}));

describe('MessageHandler', () => {
  let messageHandler: MessageHandler;
  let lettaClient: LettaClient;
  let transformer: MessageTransformer;
  let decoder: TextDecoder;

  beforeEach(() => {
    lettaClient = new LettaClient();
    transformer = new MessageTransformer();
    messageHandler = new MessageHandler(lettaClient, transformer);
    decoder = new TextDecoder();
  });

  it('should handle a single message', async () => {
    const testMessage: HumeMessage = {
      role: 'user',
      content: 'Hello',
      models: {
        prosody: {
          scores: { happiness: 0.8 }
        }
      }
    };

    const stream = await messageHandler.handleMessage(
      testMessage,
      'test-user',
      'test-session'
    );

    expect(stream).toBeInstanceOf(ReadableStream);

    // Read the stream
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Combine chunks and decode once
    const combinedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      combinedChunks.set(chunk, offset);
      offset += chunk.length;
    }
    
    const text = decoder.decode(combinedChunks);
    const parsedChunk = JSON.parse(text);
    
    expect(parsedChunk).toBeDefined();
    expect(parsedChunk.message_type).toBe('internal_monologue');
    expect(parsedChunk.internal_monologue).toBe('Test response');
  });

  it('should handle multiple messages', async () => {
    const testMessages = {
      messages: [
        {
          role: 'user',
          content: 'Hello',
          models: {
            prosody: {
              scores: {
                happiness: 0.8,
                neutral: 0.2
              }
            }
          }
        } as HumeMessage,
        {
          role: 'assistant',
          content: 'Hi there',
          models: {
            prosody: {
              scores: {
                happiness: 0.1,
                neutral: 0.9
              }
            }
          }
        } as HumeMessage
      ]
    };

    const stream = await messageHandler.handleMessage(
      testMessages,
      'test-user',
      'test-session'
    );

    expect(stream).toBeInstanceOf(ReadableStream);
  });
}); 