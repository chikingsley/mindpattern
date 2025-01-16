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