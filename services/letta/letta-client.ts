import { toolRegistry } from '../tools/registry';
import { 
  LettaConfig, 
  lettaConfigSchema, 
  CreateAgentOptions 
} from './letta-types';

export class LettaClient {
  private config: LettaConfig;
  private agentCache: Map<string, string> = new Map(); // userId -> agentId

  constructor(config: Partial<LettaConfig> = {}) {
    this.config = lettaConfigSchema.parse({
      apiKey: process.env.LETTA_API_KEY,
      baseUrl: process.env.LETTA_BASE_URL,
      ...config
    });
  }

  async createAgent(options: CreateAgentOptions) {
    const { userId, persona = 'sam_pov', stream_steps = true, stream_tokens = true } = options;

    const response = await fetch(`${this.config.baseUrl}/v1/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        persona,
        tools: toolRegistry.getToolDefinitions(),
        stream_steps,
        stream_tokens
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.statusText}`);
    }

    const data = await response.json();
    const agentId = data.id;
    
    // Cache the agent ID for this user
    this.agentCache.set(userId, agentId);
    
    return agentId;
  }

  async getOrCreateAgent(userId: string): Promise<string> {
    // Check cache first
    const cachedAgentId = this.agentCache.get(userId);
    if (cachedAgentId) {
      try {
        // Verify agent still exists
        const response = await fetch(`${this.config.baseUrl}/v1/agents/${cachedAgentId}`, {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        });
        
        if (response.ok) {
          return cachedAgentId;
        }
      } catch (error) {
        console.warn('Failed to verify cached agent:', error);
      }
    }

    // Create new agent if none exists or verification failed
    return this.createAgent({ userId });
  }

  async sendMessage(agentId: string, messages: any[], customSessionId?: string) {
    const response = await fetch(
      `${this.config.baseUrl}/v1/agents/${agentId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          messages,
          stream_steps: true,
          stream_tokens: true,
          custom_session_id: customSessionId
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.body;
  }
} 