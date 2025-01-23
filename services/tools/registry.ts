import { ToolCall, ToolCallResult } from './types';
import { handleWeather } from './handlers/weather';
import { handleUserProfile } from './handlers/userProfile';
import { ChatCompletionTool } from 'openai/resources/chat/completions';

class ToolRegistry {
  private testProfilePath?: string;

  setTestProfilePath(path: string) {
    this.testProfilePath = path;
  }

  async handleToolCalls(toolCalls: ToolCall[]): Promise<ToolCallResult[]> {
    return Promise.all(toolCalls.map(async (toolCall) => {
      switch (toolCall.function.name) {
        case 'get_current_weather':
          return handleWeather(toolCall);
        case 'update_user_profile':
          return handleUserProfile(toolCall, this.testProfilePath);
        default:
          throw new Error(`Unknown tool: ${toolCall.function.name}`);
      }
    }));
  }

  getToolDefinitions(): ChatCompletionTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'get_current_weather',
          description: 'Get the current weather in a given location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA',
              },
              unit: {
                type: 'string',
                enum: ['celsius', 'fahrenheit'],
                description: 'The unit for the temperature',
              },
            },
            required: ['location'],
          },
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_user_profile',
          description: 'Update user profile information',
          parameters: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                description: 'The profile field to update',
              },
              value: {
                type: 'string',
                description: 'The value to set',
              },
              confidence: {
                type: 'number',
                description: 'Confidence in the value (0-1)',
              },
              context: {
                type: 'string',
                description: 'Context about where this information came from',
              },
            },
            required: ['key', 'value'],
          },
        }
      }
    ];
  }
}

export const toolRegistry = new ToolRegistry(); 