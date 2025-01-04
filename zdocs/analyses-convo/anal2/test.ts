import PatternDetector from './pattern-detector.js';
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

async function testTherapeuticPatternDetection() {
    try {
        // Create a sample conversation with therapeutic patterns
        const sampleConversation: Conversation = {
            uuid: 'test-convo-1',
            name: 'Therapeutic Test Conversation',
            created_at: new Date().toISOString(),
            chat_messages: [
                {
                    uuid: '1',
                    text: "I've been feeling really anxious lately and I can't seem to focus on anything.",
                    content: [{ type: 'text', text: "I've been feeling really anxious lately and I can't seem to focus on anything." }],
                    sender: 'human' as const,
                    created_at: new Date().toISOString(),
                    attachments: []
                },
                {
                    uuid: '2',
                    text: "It sounds like you're feeling overwhelmed by anxiety, and it's affecting your ability to concentrate. Can you tell me more about when you first noticed this pattern?",
                    content: [{ type: 'text', text: "It sounds like you're feeling overwhelmed by anxiety, and it's affecting your ability to concentrate. Can you tell me more about when you first noticed this pattern?" }],
                    sender: 'assistant' as const,
                    created_at: new Date().toISOString(),
                    attachments: []
                },
                {
                    uuid: '3',
                    text: "Yes, exactly. It started about a month ago when I had a big project at work.",
                    content: [{ type: 'text', text: "Yes, exactly. It started about a month ago when I had a big project at work." }],
                    sender: 'human' as const,
                    created_at: new Date().toISOString(),
                    attachments: []
                }
            ]
        };

        // Process the conversation
        const detector = new PatternDetector();
        const insights = await detector.processLargeFile([sampleConversation]);
        
        console.log('\nTherapeutic Patterns Found:', insights.patterns.length);
        console.log('\nPatterns by Type:');
        const patternsByType = insights.patterns.reduce((acc, pattern) => {
            if (pattern.type.startsWith('therapeutic_')) {
                const type = pattern.type.replace('therapeutic_', '');
                acc[type] = (acc[type] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        console.log(patternsByType);
        
        // Save detailed insights
        const insightsSummary = {
            metadata: insights.metadata,
            therapeuticPatterns: insights.patterns
                .filter(p => p.type.startsWith('therapeutic_'))
                .map(p => ({
                    type: p.type,
                    examples: p.examples,
                    frequency: p.frequency,
                    metadata: p.metadata
                }))
        };
        
        await writeFile(
            join(__dirname, 'therapeutic_insights.json'), 
            JSON.stringify(insightsSummary, null, 2)
        );
        
        console.log('\nDetailed insights saved to therapeutic_insights.json');
        
    } catch (error) {
        console.error('Error during testing:', error);
    }
}

// Run the test
testTherapeuticPatternDetection()
    .then(() => console.log('Test complete'))
    .catch(console.error);