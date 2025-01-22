import { z } from 'zod';

// Letta configuration schema
export const lettaConfigSchema = z.object({
  apiKey: z.string().min(1, "Letta API key is required"),
  baseUrl: z.string().default("http://localhost:8283"),
});

export type LettaConfig = z.infer<typeof lettaConfigSchema>;

// Agent types
export interface CreateAgentOptions {
  userId: string;
  persona?: string;
  stream_steps?: boolean;
  stream_tokens?: boolean;
}

export interface AgentResponse {
  id: string;
  persona: string;
  created_at: string;
  updated_at: string;
}

// Tool types
export interface LettaToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

// Memory types
export interface LettaMemoryBlock {
  label: string;
  value: string;
  limit: number;
} 