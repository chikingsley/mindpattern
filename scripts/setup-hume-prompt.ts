import { HumeClient } from 'hume';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.HUME_API_KEY) {
  throw new Error('HUME_API_KEY not found in environment variables');
}

const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });

async function setupHumePrompt() {
  try {
    // Create initial prompt
    const response = await client.empathicVoice.prompts.createPrompt({
      name: "MindPattern Assistant Prompt",
      text: `<role>You are an AI assistant focused on helping users understand and process their thoughts and emotions. 
Your responses should be:
- Empathetic and understanding
- Clear and concise
- Non-judgmental and supportive
- Focused on helping users gain insights into their thoughts and feelings

When interacting with users:
1. Listen actively and reflect their emotions
2. Ask clarifying questions when needed
3. Offer gentle guidance and support
4. Help them explore their thoughts in a structured way
5. Maintain a calm and reassuring tone</role>`
    });

    if (!response?.id) {
      throw new Error('Failed to get prompt ID from response');
    }

    console.log('Created Hume prompt:', response);

    // Update .env file with prompt ID
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = await fs.readFile(envPath, 'utf-8');
    
    // Check if HUME_PROMPT_ID already exists
    if (envContent.includes('HUME_PROMPT_ID=')) {
      // Replace existing value
      const updatedContent = envContent.replace(
        /HUME_PROMPT_ID=.*/,
        `HUME_PROMPT_ID=${response.id}`
      );
      await fs.writeFile(envPath, updatedContent);
    } else {
      // Add new line
      await fs.appendFile(
        envPath,
        `\n# Hume Prompt Configuration\nHUME_PROMPT_ID=${response.id}\n`
      );
    }

    console.log('Updated .env with prompt ID:', response.id);
    
  } catch (error) {
    console.error('Error creating Hume prompt:', error);
    process.exit(1);
  }
}

setupHumePrompt();
