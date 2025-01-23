# Send Message Streaming | Letta API 

## Path Parameters
```json
{
  "parameters": [
    {
      "name": "agent_id",
      "type": "string", 
      "required": true,
      "description": "The ID of the agent"
    }
  ]
}
```

## Request
```json
{
  "endpoint": "http://localhost:8283/v1/agents/:agent_id/messages/stream",
  "method": "POST",
  "path_parameters": {
    "agent_id": {
      "type": "string",
      "required": true,
      "description": "The ID of the agent"
    }
  },
  "request": {
    "messages": [
      {
        "role": {
          "type": "enum",
          "required": true,
          "allowed_values": ["user", "system"],
          "description": "The role of the participant"
        },
        "text": {
          "type": "string",
          "required": true,
          "description": "The text of the message"
        },
        "name": {
          "type": "string",
          "required": false,
          "description": "The name of the participant"
        }
      }
    ],
    "config": {
      "use_assistant_message": {
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Whether the server should parse specific tool call arguments as AssistantMessage objects"
      },
      "assistant_message_tool_name": {
        "type": "string",
        "required": false,
        "default": "send_message",
        "description": "The name of the designated message tool"
      },
      "assistant_message_tool_kwarg": {
        "type": "string",
        "required": false,
        "default": "message",
        "description": "The name of the message argument in the designated message tool"
      },
      "stream_tokens": {
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Flag to determine if individual tokens should be streamed"
      }
    }
  },
  "response": {
    "system_message": {
      "id": {
        "type": "string"
      },
      "date": {
        "type": "datetime"
      },
      "message_type": "system_message",
      "message": {
        "type": "string"
      }
    },
    "user_message": {
      "id": {
        "type": "string"
      },
      "date": {
        "type": "datetime"
      },
      "message_type": "user_message",
      "message": {
        "type": "string"
      }
    },
    "reasoning_message": {
      "id": {
        "type": "string"
      },
      "date": {
        "type": "datetime"
      },
      "message_type": "reasoning_message",
      "reasoning": {
        "type": "string"
      }
    },
    "tool_call_message": {
      "id": {
        "type": "string"
      },
      "date": {
        "type": "datetime"
      },
      "message_type": "tool_call_message",
      "tool_call": {
        "name": {
          "type": "string"
        },
        "arguments": {
          "type": "string"
        },
        "tool_call_id": {
          "type": "string"
        }
      }
    },
    "tool_return_message": {
      "id": {
        "type": "string"
      },
      "date": {
        "type": "datetime"
      },
      "message_type": "tool_return_message",
      "tool_return": {
        "type": "string"
      },
      "status": {
        "type": "enum",
        "allowed_values": ["success", "error"]
      },
      "tool_call_id": {
        "type": "string"
      },
      "stdout": {
        "type": "list",
        "item_type": "string",
        "optional": true
      },
      "stderr": {
        "type": "list",
        "item_type": "string",
        "optional": true
      }
    },
    "assistant_message": {
      "id": {
        "type": "string"
      },
      "date": {
        "type": "datetime"
      },
      "message_type": "assistant_message",
      "assistant_message": {
        "type": "string"
      }
    },
    "usage_statistics": {
      "message_type": {
        "type": "string",
        "default": "usage_statistics"
      },
      "completion_tokens": {
        "type": "integer",
        "default": 0
      },
      "prompt_tokens": {
        "type": "integer",
        "default": 0
      },
      "total_tokens": {
        "type": "integer",
        "default": 0
      },
      "step_count": {
        "type": "integer",
        "default": 0
      }
    }
  }
}