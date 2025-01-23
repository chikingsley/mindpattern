# Send Message | Letta API

## Parameters

```json
{
  "path_parameters": {
    "agent_id": {
      "type": "string",
      "required": true,
      "description": "The ID of the agent."
    }
  }
}
```

## Request

```json
{
  "messages": [
    {
      "role": {
        "type": "enum",
        "required": true,
        "allowed_values": ["user", "system"],
        "description": "The role of the participant."
      },
      "text": {
        "type": "string",
        "required": true,
        "description": "The text of the message."
      },
      "name": {
        "type": "string",
        "optional": true,
        "description": "The name of the participant."
      }
    }
  ],
    "config":{
    "type": "object",
    "optional": true,
    "description": "Configuration options for the LettaRequest."
    },
  "use_assistant_message": {
    "type": "boolean",
    "optional": true,
    "default": true,
        "description": "Whether the server should parse specific tool call arguments (default send_message) as AssistantMessage objects."
  },
  "assistant_message_tool_name": {
    "type": "string",
    "optional": true,
    "default": "send_message",
            "description":"The name of the designated message tool."
  },
    "assistant_message_tool_kwarg":{
    "type": "string",
    "optional": true,
    "default": "message",
        "description":"The name of the message argument in the designated message tool."
    }
}
```

## Response

```json
{
  "messages": [
    {
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
    {
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
        {
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
       {
      "id": {
        "type": "string"
      },
      "date": {
        "type": "datetime"
      },
       "message_type": "tool_call_message",
       "tool_call":{
        "name":{
            "type":"string"
        },
        "arguments":{
           "type":"string"
        },
         "tool_call_id": {
            "type": "string"
        }
       }
     },
     {
    "id":{
        "type":"string"
    },
      "date": {
        "type": "datetime"
      },
    "message_type": "tool_call_message",
     "tool_call":{
        "name":{
            "type":"string",
             "optional":true
        },
        "arguments":{
           "type":"string",
           "optional":true
        },
         "tool_call_id": {
            "type": "string",
            "optional": true
        }
       }
   },
    {
        "id":{
             "type": "string"
        },
         "date": {
           "type": "datetime"
        },
         "message_type": "tool_return_message",
          "tool_return":{
              "type":"string"
          },
         "status": {
           "type": "enum",
           "allowed_values": ["success", "error"]
           },
         "tool_call_id": {
             "type": "string"
          },
         "stdout": {
             "type": "array",
             "items": {
                 "type": "string"
             },
             "optional": true
         },
        "stderr": {
            "type": "array",
             "items": {
                 "type": "string"
             },
             "optional": true
         }
     },
     {
      "id": {
        "type": "string"
      },
      "date": {
        "type": "datetime"
      },
       "message_type": "assistant_message",
       "assistant_message":{
        "type": "string"
       },
          "usage":{
            "message_type": "usage_statistics",
            "optional": true,
           "completion_tokens": {
               "type": "integer",
               "optional":true,
                "default":0
           },
             "prompt_tokens": {
               "type": "integer",
                "optional":true,
               "default":0
           },
           "total_tokens": {
               "type": "integer",
                "optional":true,
                "default":0
           },
              "step_count":{
                "type": "integer",
                "optional":true,
                "default":0
              }
         }
     }
  ]
}
```
