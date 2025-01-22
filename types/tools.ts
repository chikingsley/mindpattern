import type { ChatCompletionTool } from 'openai/resources/chat/completions';

// Tool call interfaces
export interface ToolCall {
  id: string;
  index: number;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolCallResult {
  tool_call_id: string;
  output: string;
}

// Weather specific interfaces
export interface WeatherArgs {
  location: string;
  unit?: 'celsius' | 'fahrenheit';
}

// Export the weather tool definition
export const weatherTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "get_current_weather",
    description: "Get the current weather in a given location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "The unit of temperature to return",
        },
      },
      required: ["location"],
    },
  },
};

export const tools: ChatCompletionTool[] = [weatherTool]; 