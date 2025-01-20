# OpenRouter API Documentation

OpenRouter is a unified API gateway that provides access to various AI models through a single, consistent interface. This documentation covers the response formats, streaming capabilities, and token management features of the OpenRouter API. The API is designed to be compatible with the OpenAI Chat API format while supporting additional models from different providers.

---

# Quick Start

OpenRouter provides an OpenAI-compatible completion API for 296+ models & providers. You can call it directly or use the OpenAI SDK. Third-party SDKs are also available.

> Note: OpenRouter-specific headers in the examples are optional. They allow your app to appear on OpenRouter leaderboards.

## Using the OpenAI SDK
```typescript
import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "OPENROUTER_API_KEY",
  defaultHeaders: {
    "HTTP-Referer": "YOUR_SITE_URL", // Optional
    "X-Title": "YOUR_SITE_NAME", // Optional
  }
})

async function main() {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-3.5-turbo",
    messages: [
      { role: "user", content: "What is the meaning of life?" }
    ]
  })

  console.log(completion.choices[0].message)
}

main()
```

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="OPENROUTER_API_KEY",
    default_headers={
        "HTTP-Referer": "YOUR_SITE_URL",  # Optional
        "X-Title": "YOUR_SITE_NAME",  # Optional
    }
)

completion = client.chat.completions.create(
    model="openai/gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "What is the meaning of life?"}
    ]
)

print(completion.choices[0].message)
```

## Using the OpenRouter API directly

```typescript
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer OPENROUTER_API_KEY",
    "HTTP-Referer": "YOUR_SITE_URL", // Optional
    "X-Title": "YOUR_SITE_NAME", // Optional
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "openai/gpt-3.5-turbo",
    messages: [
      { role: "user", content: "What is the meaning of life?" }
    ]
  })
});
```

```python
import requests

response = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": "Bearer OPENROUTER_API_KEY",
        "HTTP-Referer": "YOUR_SITE_URL",  # Optional
        "X-Title": "YOUR_SITE_NAME",  # Optional
        "Content-Type": "application/json"
    },
    json={
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": "What is the meaning of life?"}
        ]
    }
)

print(response.json())
```

```shell
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer OPENROUTER_API_KEY" \
  -H "HTTP-Referer: YOUR_SITE_URL" \
  -H "X-Title: YOUR_SITE_NAME" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [
      { "role": "user", "content": "What is the meaning of life?" }
    ]
  }'
```

-----

# Requests

OpenRouter's request and response schemas are very similar to the OpenAI Chat API, with a few small differences. At a high level, OpenRouter normalizes the schema across models and providers so you only need to learn one.

## Request Body

Here is the request schema as a TypeScript type. This will be the body of your POST request to the `/api/v1/chat/completions` endpoint.

```typescript
// Definitions of subtypes are below
type Request = {
  // Either "messages" or "prompt" is required
  messages?: Message[];
  prompt?: string;

  // If "model" is unspecified, uses the user's default
  model?: string; // See "Supported Models" section

  // Allows to force the model to produce specific output format.
  response_format?: { type: "json_object" };

  stop?: string | string[];
  stream?: boolean; // Enable streaming

  // See LLM Parameters (openrouter.ai/docs/parameters)
  max_tokens?: number; // Range: [1, context_length)
  temperature?: number; // Range: [0, 2]

  // Tool calling
  tools?: Tool[];
  tool_choice?: ToolChoice;

  // Advanced optional parameters
  seed?: number; // Integer only
  top_p?: number; // Range: (0, 1]
  top_k?: number; // Range: [1, Infinity) Not available for OpenAI models
  frequency_penalty?: number; // Range: [-2, 2]
  presence_penalty?: number; // Range: [-2, 2]
  repetition_penalty?: number; // Range: (0, 2]
  logit_bias?: { [key: number]: number };
  top_logprobs: number; // Integer only
  min_p?: number; // Range: [0, 1]
  top_a?: number; // Range: [0, 1]

  // Reduce latency by providing the model with a predicted output
  prediction?: { type: "content"; content: string };

  // OpenRouter-only parameters
  transforms?: string[];
  models?: string[];
  route?: "fallback";
  provider?: ProviderPreferences;
};

// Subtypes:
type TextContent = {
  type: "text";
  text: string;
};

type ImageContentPart = {
  type: "image_url";
  image_url: {
    url: string; // URL or base64 encoded image data
    detail?: string; // Optional, defaults to "auto"
  };
};

type ContentPart = TextContent | ImageContentPart;

type Message =
  | {
      role: "user" | "assistant" | "system";
      // ContentParts are only for the "user" role:
      content: string | ContentPart[];
      // If "name" is included, it will be prepended like this
      // for non-OpenAI models: `{name}: {content}`
      name?: string;
    }
  | {
      role: "tool";
      content: string;
      tool_call_id: string;
      name?: string;
    };

type FunctionDescription = {
  description?: string;
  name: string;
  parameters: object; // JSON Schema object
};

type Tool = {
  type: "function";
  function: FunctionDescription;
};

type ToolChoice =
  | "none"
  | "auto"
  | {
      type: "function";
      function: {
        name: string;
      };
    };
```

## Request Headers

OpenRouter allows you to specify optional headers to identify your app:

```javascript
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <OPENROUTER_API_KEY>",
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "mistralai/mixtral-8x7b-instruct",
    "messages": [
      {"role": "user", "content": "Who are you?"}
    ]
  })
});
```

## Model Routing

If the model parameter is omitted, the user or payer's default is used. OpenRouter will select the least expensive and best GPUs available to serve the request, with fallback options if needed.

## Streaming

Server-Sent Events (SSE) are supported for all models. Simply send `stream: true` in your request body.

## Assistant Prefill

OpenRouter supports asking models to complete a partial response:

```javascript
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <OPENROUTER_API_KEY>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "mistralai/mixtral-8x7b-instruct",
    "messages": [
      {"role": "user", "content": "Who are you?"},
      {"role": "assistant", "content": "I'm not sure, but my best guess is"}
    ]
  })
});
```

## Images & Multimodal Requests

Multimodal requests are available via the `/api/v1/chat/completions` API with multi-part messages:

```javascript
"messages": [
  {
    "role": "user",
    "content": [
      {
        "type": "text",
        "text": "What's in this image?"
      },
      {
        "type": "image_url",
        "image_url": {
          "url": "https://example.com/image.jpg"
        }
      }
    ]
  }
]
```

### Uploading Base64 Encoded Images

```typescript
import { readFile } from "fs/promises";

const getFlowerImage = async (): Promise<string> => {
  const imagePath = new URL("flower.jpg", import.meta.url);
  const imageBuffer = await readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");
  return `data:image/jpeg;base64,${base64Image}`;
};
```

Supported content types:
- image/png
- image/jpeg
- image/webp

## Tool Calls

Tool calls allow you to give an LLM access to external tools. Here's an example flow:

1. User request with tool definition:
```json
{
  "messages": [{
    "role": "user",
    "content": "What is the weather like in Boston?"
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_current_weather",
      "description": "Get the current weather in a given location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA"
          },
          "unit": {
            "type": "string",
            "enum": ["celsius", "fahrenheit"]
          }
        },
        "required": ["location"]
      }
    }
  }]
}
```

2. LLM response with tool suggestion
3. User executes tool
4. User provides tool results
5. LLM formats final response

## Stream Cancellation

For supported providers, streaming requests can be canceled using AbortController:

```typescript
const controller = new AbortController();

fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: ...,
  body: ...,
  signal: controller.signal
})

// Later, to cancel the stream:
controller.abort();
```

**Note**: Aborting/disconnecting from a non-stream request or a stream request to a provider that does not support stream cancellation will not halt the model's processing in the background. You will still be billed for the rest of the completion.
####-------------------------------------------------------------------------------####
# Responses

Responses are largely consistent with the OpenAI Chat API. This means that `choices` is always an array, even if the model only returns one completion. Each choice will contain a `delta` property if a stream was requested and a `message` property otherwise. This makes it easier to use the same code for all models.

At a high level, OpenRouter normalizes the schema across models and providers so you only need to learn one.

## Response Body

Note that `finish_reason` will vary depending on the model provider. The `model` property tells you which model was used inside the underlying API.

Here's the response schema as a TypeScript type:

```typescript
// Definitions of subtypes are below

type Response = {
  id: string;
  // Depending on whether you set "stream" to "true" and
  // whether you passed in "messages" or a "prompt", you
  // will get a different output shape
  choices: (NonStreamingChoice | StreamingChoice | NonChatChoice)[];
  created: number; // Unix timestamp
  model: string;
  object: "chat.completion" | "chat.completion.chunk";

  system_fingerprint?: string; // Only present if the provider supports it

  // Usage data is always returned for non-streaming.
  // When streaming, you will get one usage object at
  // the end accompanied by an empty choices array.
  usage?: ResponseUsage;
};

// If the provider returns usage, we pass it down
// as-is. Otherwise, we count using the GPT-4 tokenizer.

type ResponseUsage = {
  /** Including images and tools if any */
  prompt_tokens: number;
  /** The tokens generated */
  completion_tokens: number;
  /** Sum of the above two fields */
  total_tokens: number;
}

// Subtypes:
type NonChatChoice = {
  finish_reason: string | null;
  text: string;
  error?: ErrorResponse;
};

type NonStreamingChoice = {
  finish_reason: string | null; // Depends on the model. Ex: "stop" | "length" | "content_filter" | "tool_calls"
  message: {
    content: string | null;
    role: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
};

type StreamingChoice = {
  finish_reason: string | null;
  delta: {
    content: string | null;
    role?: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
};

type ErrorResponse = {
  code: number; // See "Error Handling" section
  message: string;
  metadata?: Record<string, unknown>; // Contains additional error information such as provider details, the raw error message, etc.
};

type ToolCall = {
  id: string;
  type: "function";
  function: FunctionCall;
};
```

Here's an example:

```json
{
  "id": "gen-xxxxxxxxxxxxxx",
  "choices": [
    {
      "finish_reason": "stop", // Different models provide different reasons here
      "message": {
        // will be "delta" if streaming
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
  "model": "openai/gpt-3.5-turbo" // Could also be "anthropic/claude-2.1", etc, depending on the "model" that ends up being used
}
```

## Querying Cost and Stats

The token counts that are returned in the completions API response are NOT counted with the model's native tokenizer. Instead it uses a normalized, model-agnostic count.

For precise token accounting using the model's native tokenizer, use the `/api/v1/generation` endpoint.

You can use the returned id to query for the generation stats (including token counts and cost) after the request is complete. This is how you can get the cost and tokens for all models and requests, streaming and non-streaming.

```typescript
const generation = await fetch(
  "https://openrouter.ai/api/v1/generation?id=$GENERATION_ID",
  { headers }
)

await generation.json()
// OUTPUT:
{
  data: {
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
    "cache_discount": null,
    ...
  }
};
```

Note that token counts are also available in the `usage` field of the response body for non-streaming completions.

## SSE Streaming Comments

For SSE streams, we occasionally need to send an SSE comment to indicate that OpenRouter is processing your request. This helps prevent connections from timing out. The comment will look like this:

```
: OPENROUTER PROCESSING
```

Comment payload can be safely ignored per the SSE specs. However, you can leverage it to improve UX as needed, e.g. by showing a dynamic loading indicator.

Some SSE client implementations might not parse the payload according to spec, which leads to an uncaught error when you `JSON.stringify` the non-JSON payloads. We recommend the following clients:

- eventsource-parser
- OpenAI SDK 
- Vercel AI SDK