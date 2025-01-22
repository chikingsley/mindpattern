export interface HumeMessage {
  content: string;
  role: string;
  models?: {
    prosody?: {
      scores: Record<string, number>;
    };
  };
  time?: {
    begin: number;
    end: number;
  };
}

export interface LettaMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
} 