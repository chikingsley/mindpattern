// Base response types
export interface StreamChunk {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
    logprobs: any | null;
  }>;
}

// Hume-specific response types
export interface HumeStreamChunk extends StreamChunk {
  choices: Array<{
    index: number;
    delta: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
    logprobs: any | null;
    models?: {
      prosody?: {
        scores: any;
      };
    };
    time?: {
      begin: number;
      end: number;
    };
  }>;
  type: 'assistant_input' | 'assistant_end';
  system_fingerprint?: string;
}

// Letta-specific response types
export interface LettaStreamChunk {
  id: string;
  date: string;
  message_type: 'internal_monologue' | 'function_call' | 'function_return';
  internal_monologue?: string;
  function_call?: {
    name: string;
    arguments: string;
    function_call_id: string;
  };
  function_return?: string;
  status?: 'success' | 'error';
  function_call_id?: string;
} 