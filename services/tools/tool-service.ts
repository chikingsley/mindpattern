import { ToolCall, ToolCallResult } from './types';
import { toolRegistry } from './registry';

export class ToolService {
  private finalToolCalls: Record<number, ToolCall> = {};
  private toolCallsProcessed = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.finalToolCalls = {};
    this.toolCallsProcessed = false;
  }

  isProcessed(): boolean {
    return this.toolCallsProcessed;
  }

  getToolDefinitions() {
    return toolRegistry.getToolDefinitions();
  }

  async handleToolCalls(toolCalls: ToolCall[]): Promise<ToolCallResult[]> {
    return toolRegistry.handleToolCalls(toolCalls);
  }

  processToolCallChunk(toolCall: any, chunkFinishReason?: string | null): boolean {
    if (!toolCall.function) return false;
    
    const index = toolCall.index || 0;
    
    // Initialize new tool call if needed
    if (!this.finalToolCalls[index]) {
      this.finalToolCalls[index] = {
        id: toolCall.id || '',
        index,
        function: {
          name: toolCall.function.name || '',
          arguments: ''
        }
      };
    }
    
    // Accumulate arguments
    if (toolCall.function.arguments) {
      this.finalToolCalls[index].function.arguments += toolCall.function.arguments;
    }

    // Check if tool call is complete
    const currentToolCall = this.finalToolCalls[index];
    return currentToolCall.function.arguments?.endsWith('}') || 
           chunkFinishReason === 'tool_calls';
  }

  getCompletedCalls(): ToolCall[] {
    const completedCalls = Object.values(this.finalToolCalls);
    this.toolCallsProcessed = true;
    return completedCalls;
  }

  formatToolMessage(completedCalls: ToolCall[]) {
    return {
      role: "assistant",
      tool_calls: completedCalls.map(call => ({
        id: call.id,
        type: "function",
        function: {
          name: call.function.name,
          arguments: call.function.arguments
        }
      }))
    };
  }

  formatToolResults(results: ToolCallResult[]) {
    return results.map((result: ToolCallResult) => ({
      role: "tool",
      tool_call_id: result.tool_call_id,
      content: result.output
    }));
  }
} 