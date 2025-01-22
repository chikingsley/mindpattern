import { ToolCall, ToolCallResult, ToolDefinition } from './types';
import { weatherTool, handleWeather } from './handlers/weather';
import { userProfileTool, handleUserProfile } from './handlers/userProfile';

interface ToolHandler {
  definition: ToolDefinition;
  handler: (toolCall: ToolCall) => Promise<ToolCallResult>;
}

class ToolRegistry {
  private tools: Map<string, ToolHandler> = new Map();

  constructor() {
    // Register default tools
    this.registerTool(weatherTool.function.name, {
      definition: weatherTool,
      handler: handleWeather
    });

    this.registerTool(userProfileTool.function.name, {
      definition: userProfileTool,
      handler: handleUserProfile
    });
  }

  registerTool(name: string, tool: ToolHandler) {
    this.tools.set(name, tool);
  }

  getToolDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(tool => tool.definition);
  }

  async handleToolCall(toolCall: ToolCall): Promise<ToolCallResult> {
    const tool = this.tools.get(toolCall.function.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolCall.function.name}`);
    }
    return tool.handler(toolCall);
  }

  async handleToolCalls(toolCalls: ToolCall[]): Promise<ToolCallResult[]> {
    const results: ToolCallResult[] = [];
    
    for (const toolCall of toolCalls) {
      try {
        const result = await this.handleToolCall(toolCall);
        results.push(result);
      } catch (error) {
        console.error(`Error processing ${toolCall.function.name}:`, error);
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry(); 