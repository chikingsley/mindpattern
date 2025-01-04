import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Get the directory path of the current module and project root
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Load environment variables from root directory
dotenv.config({ path: join(projectRoot, '.env') });

// Initialize Anthropic client with retries and timeout
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
  timeout: 5 * 60 * 1000 // 5 minutes
});

interface ContentBlock {
  type: string;
  text: string;
}

interface ChatMessage {
  uuid: string;
  text: string;
  content?: Array<{
    file_name: string;
    file_size: number;
    file_type: string;
    extracted_content: string;
  }>;
  files?: Array<{
    file_name: string;
  }>;
}

interface Conversation {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
  account: {
    uuid: string;
  };
  chat_messages: ChatMessage[];
}

const MEMORY_EXTRACTION_PROMPT = `You are a memory extraction system. Your task is to extract key memories from the conversation and output them in JSON format.

IMPORTANT: You must output ONLY valid JSON, with no other text before or after. The output should look exactly like this:

{
  "reasoning": "string explaining your analysis",
  "memories": [
    "memory 1",
    "memory 2",
    "etc..."
  ]
}

Focus on extracting memories about:
- Personal details
- Background and occupation
- Living situation
- Interests and goals
- Emotional patterns
- Relationships
- Challenges and struggles
- Values and beliefs

Remember: Output ONLY the JSON object, nothing else.`;

const PATTERN_RECOGNITION_PROMPT = `You are a pattern recognition system. Your task is to identify psychological and behavioral patterns in the conversation and output them in JSON format.

IMPORTANT: You must output ONLY valid JSON, with no other text before or after. The output should look exactly like this:

{
  "patterns": [
    {
      "type": "behavioral"|"emotional"|"cognitive"|"relationship",
      "description": "Clear description",
      "evidence": ["example 1", "example 2"],
      "frequency": "frequent"|"occasional"|"rare",
      "impact": "high"|"medium"|"low",
      "confidence": 0.0-1.0
    }
  ],
  "reasoning": "string explaining your analysis"
}

Analyze the conversation for:
1. Behavioral patterns
2. Emotional patterns
3. Cognitive patterns
4. Relationship patterns
5. Coping mechanisms

Remember: Output ONLY the JSON object, nothing else.`;

async function extractMemories(conversation: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4096,
      temperature: 0.8,
      system: "You are a JSON-only output system. You must ONLY output valid JSON, with no other text before or after. No explanations, no markdown, no natural language - just a JSON object.",
      messages: [
        {
          role: 'user',
          content: `${MEMORY_EXTRACTION_PROMPT}\n\nAnalyze this conversation and output ONLY a JSON object:\n\n${conversation}`
        }
      ]
    });

    // Show streaming output but only parse the final message
    for await (const messageStreamEvent of stream) {
      if (messageStreamEvent.type === 'content_block_delta' && messageStreamEvent.delta.type === 'text') {
        process.stdout.write(messageStreamEvent.delta.text);
      }
    }

    const message = await stream.finalMessage();
    if (!message.content[0] || message.content[0].type !== 'text') {
      throw new Error('No text content in response');
    }

    // Attempt to extract just the JSON part
    const text = message.content[0].text;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    const jsonText = text.slice(jsonStart, jsonEnd);

    try {
      return JSON.parse(jsonText);
    } catch (err: any) {
      throw new Error(`Failed to parse JSON: ${err.message}`);
    }
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error('API Error:', {
        status: err.status,
        name: err.name,
        message: err.message,
        request_id: err.request_id
      });
    }
    throw err;
  }
}

async function recognizePatterns(conversation: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4096,
      temperature: 0.8,
      system: "You are a JSON-only output system. You must ONLY output valid JSON, with no other text before or after. No explanations, no markdown, no natural language - just a JSON object.",
      messages: [
        {
          role: 'user',
          content: `${PATTERN_RECOGNITION_PROMPT}\n\nAnalyze this conversation and output ONLY a JSON object:\n\n${conversation}`
        }
      ]
    });

    // Show streaming output but only parse the final message
    for await (const messageStreamEvent of stream) {
      if (messageStreamEvent.type === 'content_block_delta' && messageStreamEvent.delta.type === 'text') {
        process.stdout.write(messageStreamEvent.delta.text);
      }
    }

    const message = await stream.finalMessage();
    if (!message.content[0] || message.content[0].type !== 'text') {
      throw new Error('No text content in response');
    }

    // Attempt to extract just the JSON part
    const text = message.content[0].text;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    const jsonText = text.slice(jsonStart, jsonEnd);

    try {
      return JSON.parse(jsonText);
    } catch (err: any) {
      throw new Error(`Failed to parse JSON: ${err.message}`);
    }
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error('API Error:', {
        status: err.status,
        name: err.name,
        message: err.message,
        request_id: err.request_id
      });
    }
    throw err;
  }
}

async function main() {
  try {
    // Read conversation from JSON file
    const conversationPath = join(__dirname, 'conversation.json');
    const conversationData = await fs.readFile(conversationPath, 'utf8');
    const conversation = JSON.parse(conversationData) as Conversation;

    // Convert conversation to string format for analysis
    const conversationText = conversation.chat_messages
      .map((msg: ChatMessage) => `${msg.text}`)
      .join('\n\n');
    
    console.log('Extracting memories...');
    const memories = await extractMemories(conversationText);
    console.log('\nMemories extracted:', memories);

    console.log('\nRecognizing patterns...');
    const patterns = await recognizePatterns(conversationText);
    console.log('\nPatterns recognized:', patterns);

    // Save results
    await fs.writeFile(
      join(__dirname, 'analysis_results.json'), 
      JSON.stringify({
        memories,
        patterns
      }, null, 2)
    );

    console.log('\nResults saved to analysis_results.json');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();