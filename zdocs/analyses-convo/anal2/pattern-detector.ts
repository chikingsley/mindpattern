import _ from 'lodash';
import { readFile, writeFile } from 'fs/promises';

interface Message {
  uuid: string;
  text: string;
  content: Array<{ type: string; text: string; }>;
  sender: 'human' | 'assistant';
  created_at: string;
  attachments: Array<{
    file_name: string;
    file_type: string;
    extracted_content: string;
  }>;
}

interface Conversation {
  uuid: string;
  name: string;
  created_at: string;
  chat_messages: Message[];
}

interface Pattern {
  id: string;
  type: string;
  frequency: number;
  examples: Array<{
    text: string;
    context: string[];
    conversation_id: string;
  }>;
  metadata: Record<string, any>;
}

interface Insights {
  patterns: Pattern[];
  commonPhrases: Array<{
    phrase: string;
    frequency: number;
    examples: string[];
  }>;
  topWords: Array<[string, number]>;
  metadata: {
    totalPatterns: number;
    significantPatterns: number;
    uniquePhrases: number;
    uniqueWords: number;
  };
}

interface TherapeuticPattern {
  type: 'insight' | 'reflection' | 'behavioral' | 'emotional' | 'cognitive' | 'intervention';
  trigger: string[];
  context: string[];
  confidence: number;
}

class PatternDetector {
  private patterns: Map<string, Pattern> = new Map();
  private wordFrequencies: Map<string, number> = new Map();
  private phraseClusters: Map<string, Set<string>> = new Map();
  private therapeuticPatterns: TherapeuticPattern[] = [
    {
      type: 'insight',
      trigger: [
        'i notice', 'it seems', 'this suggests', 'pattern', 
        'you tend to', 'this indicates', 'what I\'m hearing'
      ],
      context: [],
      confidence: 0
    },
    {
      type: 'reflection',
      trigger: [
        'it sounds like', 'you\'re feeling', 'you feel', 
        'you\'re saying', 'what I hear you saying'
      ],
      context: [],
      confidence: 0
    },
    {
      type: 'behavioral',
      trigger: [
        'you do', 'you avoid', 'when you', 'you tend to',
        'you usually', 'your response', 'your reaction'
      ],
      context: [],
      confidence: 0
    },
    {
      type: 'emotional',
      trigger: [
        'anxiety', 'fear', 'worry', 'stress',
        'depression', 'sad', 'frustrated', 'angry'
      ],
      context: [],
      confidence: 0
    },
    {
      type: 'cognitive',
      trigger: [
        'you think', 'you believe', 'your perspective',
        'your thought', 'you assume', 'you expect'
      ],
      context: [],
      confidence: 0
    },
    {
      type: 'intervention',
      trigger: [
        'try', 'could', 'might help', 'suggestion',
        'recommend', 'practice', 'exercise'
      ],
      context: [],
      confidence: 0
    }
  ];

  async processLargeFile(conversations: Conversation[]): Promise<Insights> {
    try {
      console.log(`Processing ${conversations.length} conversations...`);
      
      // Process each conversation
      for (const conversation of conversations) {
        await this.processConversation(conversation);
      }
      
      // Generate insights from collected data
      return this.generateInsights();
      
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  private async processConversation(conversation: Conversation) {
    const messageWindow: Message[] = [];
    const contextSize = 3; // Number of messages to keep for context
    
    // Sort messages by timestamp
    const sortedMessages = _.sortBy(conversation.chat_messages, 'created_at');
    
    for (const message of sortedMessages) {
      // Add message to sliding window
      messageWindow.push(message);
      if (messageWindow.length > contextSize) {
        messageWindow.shift();
      }
      
      // Extract message content
      const content = this.extractMessageContent(message);
      
      // Process the message with its context
      await this.analyzeMessage(content, messageWindow, conversation.uuid);
    }
  }

  private extractMessageContent(message: Message): string {
    const textContent = message.text || '';
    const contentArrayText = message.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join(' ');
    
    const attachmentContent = message.attachments
      .map(a => a.extracted_content)
      .join(' ');
    
    return `${textContent} ${contentArrayText} ${attachmentContent}`.trim();
  }

  private async analyzeMessage(
    content: string, 
    context: Message[], 
    conversationId: string
  ) {
    // Break content into sentences and words
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const words = content.toLowerCase().split(/\W+/).filter(Boolean);
    
    // Update word frequencies
    for (const word of words) {
      this.wordFrequencies.set(
        word, 
        (this.wordFrequencies.get(word) || 0) + 1
      );
    }
    
    // Extract and analyze n-grams
    const ngrams = this.extractNgrams(words, 3);
    for (const gramList of ngrams) {
      for (const gram of gramList) {
        const cluster = this.phraseClusters.get(gram) || new Set();
        cluster.add(content);
        this.phraseClusters.set(gram, cluster);
      }
    }
    
    // Detect interaction patterns
    await this.detectInteractionPatterns(context, conversationId);
    
    // Add therapeutic pattern detection
    await this.detectTherapeuticPatterns(context, conversationId);
  }

  private extractNgrams(words: string[], maxN: number): string[][] {
    const ngrams: string[][] = [];
    
    for (let n = 2; n <= maxN; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        ngrams.push(words.slice(i, i + n));
      }
    }
    
    return ngrams;
  }

  private async detectInteractionPatterns(
    context: Message[], 
    conversationId: string
  ) {
    if (context.length < 2) return;
    
    // Look for question-answer pairs
    const lastTwo = context.slice(-2);
    if (this.isQuestion(lastTwo[0]) && lastTwo[1].sender === 'assistant') {
      this.updatePattern({
        type: 'question_answer',
        text: lastTwo[0].text,
        response: lastTwo[1].text,
        conversationId
      });
    }
    
    // Look for problem-solution patterns
    if (this.isProblemStatement(lastTwo[0]) && lastTwo[1].sender === 'assistant') {
      this.updatePattern({
        type: 'problem_solution',
        text: lastTwo[0].text,
        response: lastTwo[1].text,
        conversationId
      });
    }
    
    // Look for clarification patterns
    if (this.isClarification(lastTwo[1])) {
      this.updatePattern({
        type: 'clarification',
        text: lastTwo[0].text,
        response: lastTwo[1].text,
        conversationId
      });
    }
  }

  private isQuestion(message: Message): boolean {
    const content = this.extractMessageContent(message);
    return content.includes('?') || 
           /^(what|how|why|when|where|who|can|could|would|will|do)/i.test(content);
  }

  private isProblemStatement(message: Message): boolean {
    const content = this.extractMessageContent(message);
    return content.toLowerCase().includes('problem') ||
           content.toLowerCase().includes('issue') ||
           content.toLowerCase().includes('error') ||
           content.toLowerCase().includes('help') ||
           content.toLowerCase().includes('stuck');
  }

  private isClarification(message: Message): boolean {
    const content = this.extractMessageContent(message);
    return content.toLowerCase().includes('you mean') ||
           content.toLowerCase().includes('to clarify') ||
           content.toLowerCase().includes('in other words') ||
           content.toLowerCase().includes('could you explain');
  }

  private async detectTherapeuticPatterns(
    context: Message[], 
    conversationId: string
  ) {
    if (context.length < 2) return;
    
    const lastMessage = context[context.length - 1];
    const content = this.extractMessageContent(lastMessage);
    
    // Only analyze assistant messages for therapeutic patterns
    if (lastMessage.sender === 'assistant') {
      for (const pattern of this.therapeuticPatterns) {
        const hasPattern = pattern.trigger.some(trigger => 
          content.toLowerCase().includes(trigger.toLowerCase())
        );
        
        if (hasPattern) {
          // Get previous messages for context
          const previousMessages = context
            .slice(-3, -1)
            .map(m => this.extractMessageContent(m));
          
          this.updatePattern({
            type: `therapeutic_${pattern.type}`,
            text: content,
            response: previousMessages.join('\n'),
            conversationId
          });
        }
      }
    }
    
    // Look for patterns in message sequences
    if (context.length >= 3) {
      // Check for insight development patterns
      // (e.g., user shares -> assistant reflects -> user acknowledges)
      const lastThree = context.slice(-3);
      if (
        lastThree[0].sender === 'human' &&
        lastThree[1].sender === 'assistant' &&
        lastThree[2].sender === 'human'
      ) {
        const acknowledgmentWords = ['yes', 'right', 'exactly', 'true', 'understand'];
        const lastUserMessage = this.extractMessageContent(lastThree[2]).toLowerCase();
        
        if (acknowledgmentWords.some(word => lastUserMessage.includes(word))) {
          this.updatePattern({
            type: 'therapeutic_breakthrough',
            text: this.extractMessageContent(lastThree[1]), // Assistant's insight
            response: lastUserMessage, // User's acknowledgment
            conversationId
          });
        }
      }
    }
  }

  private updatePattern(data: {
    type: string;
    text: string;
    response: string;
    conversationId: string;
  }) {
    const key = `${data.type}:${this.hashString(data.text)}`;
    
    if (!this.patterns.has(key)) {
      this.patterns.set(key, {
        id: key,
        type: data.type,
        frequency: 0,
        examples: [],
        metadata: {}
      });
    }
    
    const pattern = this.patterns.get(key)!;
    pattern.frequency++;
    pattern.examples.push({
      text: data.text,
      context: [data.response],
      conversation_id: data.conversationId
    });
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private async generateInsights(): Promise<Insights> {
    // Filter for significant patterns
    const significantPatterns = Array.from(this.patterns.values())
      .filter(p => p.frequency >= 3)
      .sort((a, b) => b.frequency - a.frequency);
    
    // Find common phrases
    const commonPhrases = Array.from(this.phraseClusters.entries())
      .filter(([_, contexts]) => contexts.size >= 3)
      .map(([phrase, contexts]) => ({
        phrase,
        frequency: contexts.size,
        examples: Array.from(contexts).slice(0, 3)
      }));
    
    // Generate word frequency insights
    const topWords = Array.from(this.wordFrequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100);
    
    return {
      patterns: significantPatterns,
      commonPhrases,
      topWords,
      metadata: {
        totalPatterns: this.patterns.size,
        significantPatterns: significantPatterns.length,
        uniquePhrases: this.phraseClusters.size,
        uniqueWords: this.wordFrequencies.size
      }
    };
  }
}

// Example usage
async function analyzeConversations() {
  console.log('Starting pattern analysis...');
  
  try {
    const detector = new PatternDetector();
    const conversations: Conversation[] = [
      // Example conversation data will be provided at runtime
    ];
    const insights = await detector.processLargeFile(conversations);
    console.log('Analysis complete!');
    console.log(`Found ${insights.patterns.length} significant patterns`);
    console.log(`Found ${insights.commonPhrases.length} common phrases`);
    
    // Optional: Save insights to file
    await writeFile(
      'conversation_insights.json', 
      JSON.stringify(insights, null, 2)
    );
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Add default export
export default PatternDetector;