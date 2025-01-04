import PatternDetector from './pattern-detector.js';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

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

async function testPatternDetection() {
    try {
        // Read and parse the file using the correct path
        const fileContent = await readFile(join(__dirname, 'conversations-449-formatted.json'), { encoding: 'utf8' });
        const conversation: Conversation = JSON.parse(fileContent);
        
        // Process the single conversation
        const testSample: Conversation[] = [conversation];  // Wrap in array since processLargeFile expects an array
        
        // Run pattern detection on sample
        const detector = new PatternDetector();
        const insights = await detector.processLargeFile(testSample);
        
        console.log('\nPatterns Found:', insights.patterns.length);
        console.log('Common Phrases:', insights.commonPhrases.length);
        
        // Only write insights to file, excluding large pattern data
        const insightsSummary = {
            metadata: insights.metadata,
            patternCount: insights.patterns.length,
            commonPhrasesCount: insights.commonPhrases.length,
            // Include only first 10 patterns and phrases as examples
            samplePatterns: insights.patterns.slice(0, 10),
            samplePhrases: insights.commonPhrases.slice(0, 10)
        };
        
        await writeFile('test_insights.json', JSON.stringify(insightsSummary, null, 2));
        
    } catch (error) {
        console.error('Error during testing:', error);
    }
}

// Run the test
testPatternDetection()
    .then(() => console.log('Test complete'))
    .catch(console.error);