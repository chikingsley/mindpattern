import { embeddingsService } from './EmbeddingsService';
import type { Database } from '../../types/supabase';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageRole = 'user' | 'assistant';

interface ProcessedMessage {
  message: Message;
  prosody?: Record<string, any>;
  context?: Message[];
}

interface ProcessOptions {
  userId: string;
  sessionId: string;
  role: MessageRole;
  prosody?: Record<string, any>;
  useReranker?: boolean;
  contextLimit?: number;
}

// Configuration for RAG processing
const RAG_CONFIG = {
  contextLimit: 5,
  useReranker: true,
  patternDetectionEnabled: true
};

export class RAGProcessor {
  private static instance: RAGProcessor;

  private constructor() {}

  public static getInstance(): RAGProcessor {
    if (!this.instance) {
      this.instance = new RAGProcessor();
    }
    return this.instance;
  }

  /**
   * Process a message, storing it and retrieving relevant context
   * Handles async storage and pattern recognition
   */
  async processMessage(
    content: string,
    options: ProcessOptions
  ): Promise<ProcessedMessage> {
    // Get context first (if user message)
    let context: Message[] = [];
    if (options.role === 'user') {
      const results = await embeddingsService.getRelevantContext(
        content,
        options.userId,
        options.sessionId,
        options.contextLimit || RAG_CONFIG.contextLimit,
        options.useReranker ?? RAG_CONFIG.useReranker
      );
      context = results.map(r => r.message);
    }

    // Store message asynchronously
    const metadata = options.prosody ? { prosody: options.prosody } : {};
    const messagePromise = embeddingsService.storeMessage(
      content,
      options.userId,
      options.sessionId,
      options.role,
      metadata
    );

    // Start pattern recognition asynchronously if enabled
    let patternPromise;
    if (RAG_CONFIG.patternDetectionEnabled) {
      patternPromise = this.detectPatternsAsync(content, options);
    }

    // Wait for message storage to complete
    const message = await messagePromise;

    return {
      message,
      prosody: options.prosody,
      context: context.length > 0 ? context : undefined
    };
  }

  /**
   * Asynchronously detect patterns in the message
   * This runs in the background and doesn't block the response
   */
  private async detectPatternsAsync(
    content: string,
    options: ProcessOptions
  ): Promise<void> {
    try {
      // TODO: Implement pattern detection
      // This could include:
      // - Emotional patterns
      // - Behavioral patterns
      // - Topic patterns
      // - Relationship patterns
      
      // For now we'll just log that it would run
      console.log('Pattern detection would run for:', {
        content,
        userId: options.userId,
        sessionId: options.sessionId,
        role: options.role
      });
    } catch (error) {
      // Log error but don't throw since this is background processing
      console.error('Pattern detection error:', error);
    }
  }
}

export const ragProcessor = RAGProcessor.getInstance();

// Hook for React components
export function useRAGProcessor() {
  return {
    processMessage: ragProcessor.processMessage.bind(ragProcessor)
  };
} 