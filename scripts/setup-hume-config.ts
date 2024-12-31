import { HumeClient } from 'hume';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = [
  'HUME_API_KEY',
  'HUME_PROMPT_ID'
] as const;

async function setupHumeConfig() {
  // Validate environment variables
  const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  if (!process.env.HUME_API_KEY) {
    throw new Error('HUME_API_KEY not found in environment variables');
  }  

  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });

  try {
    // Create initial config
    const config = await client.empathicVoice.configs.createConfig({
      name: "MindPattern Assistant Config",
      eviVersion: "2",
      prompt: {
        id: process.env.HUME_PROMPT_ID,
        version: 0
      },
      languageModel: {
        modelProvider: "OPEN_AI",
        modelResource: "gpt-4o-mini",
        temperature: 0.7
      },
      voice: {
        provider: "HUME_AI",
        name: "KORA"
      },
      builtinTools: [
        {
          name: "web_search",
          fallbackContent: "I apologize, but I'm unable to search the web at the moment. Let me help you with what I know."
        },
        {
          name: "hang_up",
          fallbackContent: "I'll end our conversation here. Feel free to start a new chat when you'd like to continue."
        }
      ]
    });

    if (!config?.id) {
      throw new Error('Failed to get config ID from response');
    }

    console.log('Created Hume config:', config);

    // Update .env file with config ID
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = await fs.readFile(envPath, 'utf-8');
    
    // Check if NEXT_PUBLIC_HUME_CONFIG_ID already exists
    if (envContent.includes('NEXT_PUBLIC_HUME_CONFIG_ID=')) {
      // Replace existing value
      const updatedContent = envContent.replace(
        /NEXT_PUBLIC_HUME_CONFIG_ID=.*/,
        `NEXT_PUBLIC_HUME_CONFIG_ID=${config.id}`
      );
      await fs.writeFile(envPath, updatedContent);
    } else {
      // Add new line
      await fs.appendFile(
        envPath,
        `\n# Hume Config ID\nNEXT_PUBLIC_HUME_CONFIG_ID=${config.id}\n`
      );
    }

    console.log('Updated .env with config ID:', config.id);

  } catch (error) {
    console.error('Error creating Hume config:', error);
    process.exit(1);
  }
}

setupHumeConfig();
