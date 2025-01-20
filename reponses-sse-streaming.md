# API Response Schema

Responses are largely consistent with the OpenAI Chat API. This means that choices is always an array, even if the model only returns one completion. Each choice will contain a delta property if a stream was requested and a message property otherwise. This makes it easier to use the same code for all models.

At a high level, OpenRouter normalizes the schema across models and providers so you only need to learn one.

## Overview
Responses follow the OpenAI Chat API format. Note that finish_reason will vary depending on the model provider. The model property tells you which model was used inside the underlying API.

## Response Types

### Base Response
id (string, Required) Unique identifier for the response
choices (array, Required) Array of response choices. Depending on whether you set "stream" to "true" and whether you passed in "messages" or a "prompt", you will get a different output shape
created (number, Required) Unix timestamp of creation
model (string, Required) Model identifier used for generation
object (string, Required) Type of completion
  * Options: chat.completion | chat.completion.chunk
system_fingerprint (string, Optional) Only present if the provider supports it
usage (ResponseUsage, Optional) Token usage statistics. Always returned for non-streaming. When streaming, you will get one usage object at the end accompanied by an empty choices array.

### ResponseUsage
If the provider returns usage, we pass it down as-is. Otherwise, we count using the GPT-4 tokenizer.

prompt_tokens (number, Required) Token count including images and tools
completion_tokens (number, Required) Generated token count
total_tokens (number, Required) Sum of prompt and completion tokens

### Choice Types

NonChatChoice (object)
  * finish_reason (string, Optional) Completion termination reason
  * text (string, Required) Generated text content
  * error (ErrorResponse, Optional) Error information if present

NonStreamingChoice (object)
  * finish_reason (string, Optional) Completion termination reason. Depends on the model.
    * Options: stop | length | content_filter | tool_calls
  * message (object, Required)
    * content (string, Optional) Generated text content
    * role (string, Required) Role identifier
    * tool_calls (array[ToolCall], Optional) Tool call information
  * error (ErrorResponse, Optional) Error information if present

StreamingChoice (object)
  * finish_reason (string, Optional) Completion termination reason
  * delta (object, Required) Will be "delta" if streaming
    * content (string, Optional) Generated text content
    * role (string, Optional) Role identifier
    * tool_calls (array[ToolCall], Optional) Tool call information
  * error (ErrorResponse, Optional) Error information if present

### Error Response
code (number, Required) Error code identifier. See "Error Handling" section
message (string, Required) Error description
metadata (object, Optional) Additional error details
  * Contains provider details, raw error messages, and other error information

### Tool Call
id (string, Required) Tool call identifier
type (string, Required) Type of tool call
  * Options: function
function (FunctionCall, Required) Function call details

## Example Response

### Non-Streaming Response
```json
{
  "id": "gen-xxxxxxxxxxxxxx",
  "choices": [
    {
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "content": "Hello there!"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 4,
    "total_tokens": 4
  },
  "model": "openai/gpt-3.5-turbo"  // Could also be "anthropic/claude-2.1", etc, depending on the "model" that ends up being used
}
```

## Token Counting and Stats

The token counts that are returned in the completions API response are NOT counted with the model's native tokenizer. Instead it uses a normalized, model-agnostic count.

For precise token accounting using the model's native tokenizer, use the /api/v1/generation endpoint.

You can use the returned id to query for the generation stats (including token counts and cost) after the request is complete. This is how you can get the cost and tokens for all models and requests, streaming and non-streaming.

### Generation Stats Endpoint
GET /api/v1/generation?id=$GENERATION_ID

Returns detailed generation statistics including:
  * Token counts (normalized and native)
  * Generation time
  * Cost information
  * Media usage

### Example Stats Response
```json
{
  "data": {
    "id": "gen-nNPYi0ZB6GOK5TNCUMHJGgXo",
    "model": "openai/gpt-4-32k",
    "streamed": false,
    "generation_time": 2,
    "created_at": "2023-09-02T20:29:18.574972+00:00",
    "tokens_prompt": 24,
    "tokens_completion": 29,
    "native_tokens_prompt": 24,
    "native_tokens_completion": 29,
    "num_media_prompt": null,
    "num_media_completion": null,
    "origin": "https://localhost:47323/",
    "total_cost": 0.00492,
    "cache_discount": null
  }
}
```

Note that token counts are also available in the usage field of the response body for non-streaming completions.

## SSE Streaming

### Processing Comments
For SSE streams, we occasionally need to send an SSE comment to indicate that OpenRouter is processing your request. This helps prevent connections from timing out. The comment will look like this:
```
: OPENROUTER PROCESSING
```

Comment payload can be safely ignored per the SSE specs. However, you can leverage it to improve UX as needed, e.g. by showing a dynamic loading indicator.

Some SSE client implementations might not parse the payload according to spec, which leads to an uncaught error when you JSON.stringify the non-JSON payloads. We recommend the following clients:

### Recommended SSE Clients
  * eventsource-parser
  * OpenAI SDK
  * Vercel AI SDK