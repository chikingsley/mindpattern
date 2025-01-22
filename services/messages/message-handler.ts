import { LettaClient } from '../letta/letta-client';
import { MessageTransformer } from './message-transformer';
import { HumeStreamChunk, LettaStreamChunk } from '../streaming/stream-types';
import { HumeMessage } from './message-types';

export class MessageHandler {
  constructor(
    private lettaClient: LettaClient,
    private transformer: MessageTransformer
  ) {}

  /**
   * Handle an incoming message from Hume
   */
  async handleMessage(message: { messages?: HumeMessage[] } | HumeMessage, userId: string, sessionId?: string) {
    // Get or create an agent for this user
    const agentId = await this.lettaClient.getOrCreateAgent(userId);

    // Transform Hume message format to Letta format
    const messages = Array.isArray((message as any).messages) ? (message as any).messages : [message];
    
    // Store prosody data for responses if available
    messages.forEach((msg: HumeMessage) => {
      if (msg.models?.prosody?.scores) {
        this.transformer.updateProsodyScores(msg.models.prosody.scores);
      }
    });

    // Send to Letta and get streaming response
    const responseStream = await this.lettaClient.sendMessage(
      agentId,
      messages,
      sessionId
    );

    if (!responseStream) {
      throw new Error('No response stream from Letta');
    }

    // Create a transform stream to convert Letta format to Hume format
    const transformStream = new TransformStream<LettaStreamChunk, HumeStreamChunk>({
      transform: async (chunk, controller) => {
        // Transform Letta chunk to Hume format
        const humeChunk = this.transformer.transformLettaToHume(
          chunk,
          'letta'  // or get from config
        );
        controller.enqueue(humeChunk);
      }
    });

    // Convert the response stream to a ReadableStream<HumeStreamChunk>
    const reader = responseStream.getReader();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            const chunk = JSON.parse(new TextDecoder().decode(value)) as LettaStreamChunk;
            const humeChunk = transformStream.readable;
            controller.enqueue(humeChunk);
          }
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return readableStream;
  }
} 