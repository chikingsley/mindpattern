# List Tools

**GET** `https://api.hume.ai/v0/evi/tools`

Fetches a paginated list of Tools.

> For comprehensive instructions on defining and integrating tools into EVI, refer to our tool use guide.

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_number` | integer | Optional | Specifies the page number to retrieve (zero-based indexing). Defaults to 0. |
| `page_size` | integer | Optional | Specifies the maximum number of results per page (1-100). Defaults to 10. |
| `restrict_to_most_recent` | boolean | Optional | If true, returns only the latest version of each tool. Defaults to false. |
| `name` | string | Optional | Filter to include only tools with the specified name. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `page_number` | integer | The returned page number (zero-based). |
| `page_size` | integer | The maximum number of items per page. |
| `total_pages` | integer | The total number of pages in the collection. |
| `tools_page` | array of objects | List of tools for the specified page. |

#### Tool Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `tool_type` | string | Either "BUILTIN" or "FUNCTION". |
| `id` | string | UUID identifier for the Tool. |
| `version` | integer | Version number of the Tool. |
| `version_type` | string | Either "FIXED" or "LATEST". |
| `name` | string | Name applied to all versions of the Tool. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `parameters` | string | Stringified JSON schema of Tool parameters. |
| `version_description` | string | Optional description of the Tool version. |
| `fallback_content` | string | Optional fallback text for LLM if Tool errors. |
| `description` | string | Optional description of the Tool's function. |

## example call
```typeScript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.tools.listTools({
    pageNumber: 0,
    pageSize: 2
});
```

## example response
```json
{
  "page_number": 0,
  "page_size": 2,
  "total_pages": 1,
  "tools_page": [
    {
      "tool_type": "FUNCTION",
      "id": "d20827af-5d8d-4f66-b6b9-ce2e3e1ea2b2",
      "version": 0,
      "version_type": "FIXED",
      "name": "get_current_location",
      "created_on": 1715267200693,
      "modified_on": 1715267200693,
      "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }}, \"required\": [\"location\"] }",
      "version_description": "Fetches user's current location.",
      "fallback_content": "Unable to fetch location.",
      "description": "Fetches user's current location."
    },
    {
      "tool_type": "FUNCTION",
      "id": "4442f3ea-9038-40e3-a2ce-1522b7de770f",
      "version": 0,
      "version_type": "FIXED",
      "name": "get_current_weather",
      "created_on": 1715266126705,
      "modified_on": 1715266126705,
      "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
      "version_description": "Fetches current weather and uses celsius or fahrenheit based on location of user.",
      "fallback_content": "Unable to fetch location.",
      "description": "Fetches current weather and uses celsius or fahrenheit based on location of user."
    }
  ]
}
```

# Create Tool

**POST** `https://api.hume.ai/v0/evi/tools`

Creates a Tool that can be added to an EVI configuration.

> For comprehensive instructions on defining and integrating tools into EVI, refer to our tool use guide.

## Request

This endpoint expects an object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Required | Name applied to all versions of a particular Tool. |
| `parameters` | string | Required | Stringified JSON schema defining the inputs for the Tool's execution. |
| `version_description` | string | Optional | Description of the Tool version. |
| `description` | string | Optional | Description of the Tool's function, used by the LLM to determine usage. |
| `fallback_content` | string | Optional | Text used if the Tool errors, ensuring conversation continuity. |

## Response

### Success (200 OK)

| Field | Type | Description |
|-------|------|-------------|
| `tool_type` | string | Either "BUILTIN" or "FUNCTION". |
| `id` | string | UUID identifier for the Tool. |
| `version` | integer | Version number of the Tool. |
| `version_type` | string | Either "FIXED" or "LATEST". |
| `name` | string | Name of the Tool. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `parameters` | string | Stringified JSON schema of Tool parameters. |
| `version_description` | string | Description of the Tool version. |
| `fallback_content` | string | Fallback text for LLM if Tool errors. |
| `description` | string | Description of the Tool's function. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.tools.createTool({
    name: "get_current_weather",
    parameters: "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
    versionDescription: "Fetches current weather and uses celsius or fahrenheit based on location of user.",
    description: "This tool is for getting the current weather.",
    fallbackContent: "Unable to fetch current weather."
});
```

## Example Response

```json
{
  "tool_type": "FUNCTION",
  "id": "aa9b71c4-723c-47ff-9f83-1a1829e74376",
  "version": 0,
  "version_type": "FIXED",
  "name": "get_current_weather",
  "created_on": 1715275452390,
  "modified_on": 1715275452390,
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
  "version_description": "Fetches current weather and uses celsius or fahrenheit based on location of user.",
  "fallback_content": "Unable to fetch current weather.",
  "description": "This tool is for getting the current weather."
}
```

# List Tool Versions

**GET** `https://api.hume.ai/v0/evi/tools/:id`

Fetches a list of a Tool's versions.

> For comprehensive instructions on defining and integrating tools into EVI, refer to our tool use guide.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Tool. Formatted as a UUID. |

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_number` | integer | Optional | Specifies the page number to retrieve (zero-based indexing). Defaults to 0. |
| `page_size` | integer | Optional | Specifies the maximum number of results per page (1-100). Defaults to 10. |
| `restrict_to_most_recent` | boolean | Optional | If true, returns only the latest version of each tool. Defaults to false. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `page_number` | integer | The returned page number (zero-based). |
| `page_size` | integer | The maximum number of items per page. |
| `total_pages` | integer | The total number of pages in the collection. |
| `tools_page` | array of objects | List of tool versions for the specified page. |

#### Tool Version Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `tool_type` | string | Either "BUILTIN" or "FUNCTION". |
| `id` | string | UUID identifier for the Tool. |
| `version` | integer | Version number of the Tool. |
| `version_type` | string | Either "FIXED" or "LATEST". |
| `name` | string | Name of the Tool. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `parameters` | string | Stringified JSON schema of Tool parameters. |
| `version_description` | string | Optional description of the Tool version. |
| `fallback_content` | string | Optional fallback text for LLM if Tool errors. |
| `description` | string | Optional description of the Tool's function. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.tools.listToolVersions("00183a3f-79ba-413d-9f3b-609864268bea");
```

## Example Response

```json
{
  "page_number": 0,
  "page_size": 10,
  "total_pages": 1,
  "tools_page": [
    {
      "tool_type": "FUNCTION",
      "id": "00183a3f-79ba-413d-9f3b-609864268bea",
      "version": 1,
      "version_type": "FIXED",
      "name": "get_current_weather",
      "created_on": 1715277014228,
      "modified_on": 1715277602313,
      "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\", \"kelvin\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
      "version_description": "Fetches current weather and uses celsius, fahrenheit, or kelvin based on location of user.",
      "fallback_content": "Unable to fetch current weather.",
      "description": "This tool is for getting the current weather."
    }
  ]
}
```

# Create Tool Version

**POST** `https://api.hume.ai/v0/evi/tools/:id`

Updates a Tool by creating a new version.

> For comprehensive instructions on defining and integrating tools into EVI, refer to our tool use guide.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | UUID identifier for the Tool. |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `parameters` | string | Required | Stringified JSON schema defining Tool inputs. |
| `version_description` | string | Optional | Description of the Tool version. |
| `description` | string | Optional | Description of the Tool's function. |
| `fallback_content` | string | Optional | Fallback text if Tool errors. |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `tool_type` | string | "BUILTIN" or "FUNCTION". |
| `id` | string | UUID identifier for the Tool. |
| `version` | integer | Version number of the Tool. |
| `version_type` | string | "FIXED" or "LATEST". |
| `name` | string | Name of the Tool. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `parameters` | string | Stringified JSON schema of Tool parameters. |
| `version_description` | string | Description of the Tool version. |
| `fallback_content` | string | Fallback text if Tool errors. |
| `description` | string | Description of the Tool's function. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.tools.createToolVersion("00183a3f-79ba-413d-9f3b-609864268bea", {
    parameters: "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\", \"kelvin\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
    versionDescription: "Fetches current weather and uses celsius, fahrenheit, or kelvin based on location of user.",
    fallbackContent: "Unable to fetch current weather.",
    description: "This tool is for getting the current weather."
});
```

## Example Response

```json
{
  "tool_type": "FUNCTION",
  "id": "00183a3f-79ba-413d-9f3b-609864268bea",
  "version": 1,
  "version_type": "FIXED",
  "name": "get_current_weather",
  "created_on": 1715277014228,
  "modified_on": 1715277602313,
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\", \"kelvin\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
  "version_description": "Fetches current weather and uses celsius, fahrenheit, or kelvin based on location of user.",
  "fallback_content": "Unable to fetch current weather.",
  "description": "This tool is for getting the current weather."
}
```

# Delete Tool

**DELETE** `https://api.hume.ai/v0/evi/tools/:id`

Deletes a Tool and its versions.

> For comprehensive instructions on defining and integrating tools into EVI, refer to our tool use guide.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Tool. Formatted as a UUID. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.tools.deleteTool("00183a3f-79ba-413d-9f3b-609864268bea");
```

## Example Response

```json
{
  "status": "success",
  "message": "Tool deleted successfully"
}
```

# Update Tool Name

**PATCH** `https://api.hume.ai/v0/evi/tools/:id`

Updates the name of a Tool.

> For comprehensive instructions on defining and integrating tools into EVI, refer to our tool use guide.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Tool. Formatted as a UUID. |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Required | Name applied to all versions of a particular Tool. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.tools.updateToolName("00183a3f-79ba-413d-9f3b-609864268bea", {
    name: "get_current_temperature"
});
```

## Example Response

```json
{
  "status": "success",
  "message": "Tool name updated successfully"
}
```


# Get Tool Version

**GET** `https://api.hume.ai/v0/evi/tools/:id/version/:version`

Fetches a specified version of a Tool.

> For comprehensive instructions on defining and integrating tools into EVI, refer to our tool use guide.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | UUID identifier for the Tool. |
| `version` | integer | Required | Version number of the Tool. |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `tool_type` | string | Either "BUILTIN" or "FUNCTION". |
| `id` | string | UUID identifier for the Tool. |
| `version` | integer | Version number of the Tool. |
| `version_type` | string | Either "FIXED" or "LATEST". |
| `name` | string | Name of the Tool. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `parameters` | string | Stringified JSON schema of Tool parameters. |
| `version_description` | string | Optional description of the Tool version. |
| `fallback_content` | string | Optional fallback text for LLM if Tool errors. |
| `description` | string | Optional description of the Tool's function. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.tools.getToolVersion("00183a3f-79ba-413d-9f3b-609864268bea", 1);
```

## Example Response

```json
{
  "tool_type": "FUNCTION",
  "id": "00183a3f-79ba-413d-9f3b-609864268bea",
  "version": 1,
  "version_type": "FIXED",
  "name": "get_current_weather",
  "created_on": 1715277014228,
  "modified_on": 1715277602313,
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\", \"kelvin\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
  "version_description": "Fetches current weather and uses celsius, fahrenheit, or kelvin based on location of user.",
  "fallback_content": "Unable to fetch current weather.",
  "description": "This tool is for getting the current weather."
}
```


# Delete Tool Version

**DELETE** `https://api.hume.ai/v0/evi/tools/:id/version/:version`

Deletes a specified version of a Tool.

> For comprehensive instructions on defining and integrating tools into EVI, refer to our tool use guide.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Tool. Formatted as a UUID. |
| `version` | integer | Required | Version number of the Tool. |

> Tools, Configs, Custom Voices, and Prompts are versioned. This versioning system supports iterative development, allowing you to progressively refine tools and revert to previous versions if needed. Version numbers are integer values representing different iterations of the Tool. Each update to the Tool increments its version number.

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.tools.deleteToolVersion("00183a3f-79ba-413d-9f3b-609864268bea", 1);
```

## Example Response

```json
{
  "status": "success",
  "message": "Tool version deleted successfully"
}
```

# Update Tool Description

**PATCH** `https://api.hume.ai/v0/evi/tools/:id/version/:version`

Updates the description of a specified Tool version.

> For comprehensive instructions on defining and integrating tools into EVI, refer to our tool use guide.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Tool. Formatted as a UUID. |
| `version` | integer | Required | Version number for a Tool. |

> Tools, Configs, Custom Voices, and Prompts are versioned. This versioning system supports iterative development, allowing you to progressively refine tools and revert to previous versions if needed. Version numbers are integer values representing different iterations of the Tool. Each update to the Tool increments its version number.

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version_description` | string | Optional | An optional description of the Tool version. |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `tool_type` | string | Either "BUILTIN" or "FUNCTION". |
| `id` | string | UUID identifier for the Tool. |
| `version` | integer | Version number of the Tool. |
| `version_type` | string | Either "FIXED" or "LATEST". |
| `name` | string | Name of the Tool. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `parameters` | string | Stringified JSON schema of Tool parameters. |
| `version_description` | string | Description of the Tool version. |
| `fallback_content` | string | Fallback text if Tool errors. |
| `description` | string | Description of the Tool's function. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.tools.updateToolDescription("00183a3f-79ba-413d-9f3b-609864268bea", 1, {
    versionDescription: "Fetches current temperature, precipitation, wind speed, AQI, and other weather conditions. Uses Celsius, Fahrenheit, or kelvin depending on user's region."
});
```

## Example Response

```json
{
  "tool_type": "FUNCTION",
  "id": "00183a3f-79ba-413d-9f3b-609864268bea",
  "version": 1,
  "version_type": "FIXED",
  "name": "string",
  "created_on": 1715277014228,
  "modified_on": 1715277602313,
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\", \"kelvin\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
  "version_description": "Fetches current temperature, precipitation, wind speed, AQI, and other weather conditions. Uses Celsius, Fahrenheit, or kelvin depending on user's region.",
  "fallback_content": "Unable to fetch current weather.",
  "description": "This tool is for getting the current weather."
}
```

# List Prompts

**GET** `https://api.hume.ai/v0/evi/prompts`

Fetches a paginated list of Prompts.

> See our prompting guide for tips on crafting your system prompt.

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_number` | integer | Optional | Specifies the page number to retrieve (zero-based indexing). Defaults to 0. |
| `page_size` | integer | Optional | Specifies the maximum number of results per page (1-100). Defaults to 10. |
| `restrict_to_most_recent` | boolean | Optional | If true, returns only the latest version of each prompt. Defaults to false. |
| `name` | string | Optional | Filter to include only prompts with the specified name. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `page_number` | integer | The returned page number (zero-based). |
| `page_size` | integer | The maximum number of items per page. |
| `total_pages` | integer | The total number of pages in the collection. |
| `prompts_page` | array of objects | List of prompts for the specified page. |

#### Prompt Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | UUID identifier for the Prompt. |
| `version` | integer | Version number of the Prompt. |
| `version_type` | string | Either "FIXED" or "LATEST". |
| `name` | string | Name of the Prompt. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `text` | string | Instructions used to shape EVI's behavior. |
| `version_description` | string | Optional description of the Prompt version. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.listPrompts({
    pageNumber: 0,
    pageSize: 2
});
```

## Example Response

```json
{
  "page_number": 0,
  "page_size": 2,
  "total_pages": 1,
  "prompts_page": [
    {
      "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
      "version": 0,
      "version_type": "FIXED",
      "name": "Weather Assistant Prompt",
      "created_on": 1715267200693,
      "modified_on": 1715267200693,
      "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
      "version_description": ""
    },
    {
      "id": "616b2b4c-a096-4445-9c23-64058b564fc2",
      "version": 0,
      "version_type": "FIXED",
      "name": "Web Search Assistant Prompt",
      "created_on": 1715267200693,
      "modified_on": 1715267200693,
      "text": "<role>You are an AI web search assistant designed to help users find accurate and relevant information on the web. Respond to user queries promptly, using the built-in web search tool to retrieve up-to-date results. Present information clearly and concisely, summarizing key points where necessary. Use simple language and avoid technical jargon. If needed, provide helpful tips for refining search queries to obtain better results.</role>",
      "version_description": ""
    }
  ]
}
```


# Create Prompt

**POST** `https://api.hume.ai/v0/evi/prompts`

Creates a Prompt that can be added to an EVI configuration.

> See our prompting guide for tips on crafting your system prompt.

## Request

This endpoint expects an object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Required | Name applied to all versions of a particular Prompt. |
| `text` | string | Required | Instructions used to shape EVI's behavior, responses, and style. |
| `version_description` | string | Optional | An optional description of the Prompt version. |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID identifier for the Prompt. |
| `version` | integer | Version number of the Prompt. |
| `version_type` | string | Either "FIXED" or "LATEST". |
| `name` | string | Name of the Prompt. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `text` | string | Instructions used to shape EVI's behavior. |
| `version_description` | string | Description of the Prompt version. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.createPrompt({
    name: "Weather Assistant Prompt",
    text: "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>"
});
```

## Example Response

```json
{
  "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
  "version": 0,
  "version_type": "FIXED",
  "name": "Weather Assistant Prompt",
  "created_on": 1722633247488,
  "modified_on": 1722633247488,
  "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>"
}
```

# List Prompt Versions

**GET** `https://api.hume.ai/v0/evi/prompts/:id`

Fetches a list of a Prompt's versions.

> See our prompting guide for tips on crafting your system prompt.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Prompt. Formatted as a UUID. |

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_number` | integer | Optional | Specifies the page number to retrieve (zero-based indexing). Defaults to 0. |
| `page_size` | integer | Optional | Specifies the maximum number of results per page (1-100). Defaults to 10. |
| `restrict_to_most_recent` | boolean | Optional | If true, returns only the latest version of each prompt. Defaults to false. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `page_number` | integer | The returned page number (zero-based). |
| `page_size` | integer | The maximum number of items per page. |
| `total_pages` | integer | The total number of pages in the collection. |
| `prompts_page` | array of objects | List of prompts for the specified page. |

#### Prompt Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | UUID identifier for the Prompt. |
| `version` | integer | Version number of the Prompt. |
| `version_type` | string | Either "FIXED" or "LATEST". |
| `name` | string | Name of the Prompt. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `text` | string | Instructions used to shape EVI's behavior. |
| `version_description` | string | Optional description of the Prompt version. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.listPromptVersions("af699d45-2985-42cc-91b9-af9e5da3bac5");
```

## Example Response

```json
{
  "page_number": 0,
  "page_size": 10,
  "total_pages": 1,
  "prompts_page": [
    {
      "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
      "version": 0,
      "version_type": "FIXED",
      "name": "Weather Assistant Prompt",
      "created_on": 1722633247488,
      "modified_on": 1722633247488,
      "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
      "version_description": ""
    }
  ]
}
```


# Create Prompt Version

**POST** `https://api.hume.ai/v0/evi/prompts/:id`

Updates a Prompt by creating a new version of the Prompt.

> See our prompting guide for tips on crafting your system prompt.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Prompt. Formatted as a UUID. |

## Request

This endpoint expects an object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | string | Required | Instructions used to shape EVI's behavior, responses, and style for this version of the Prompt. |
| `version_description` | string | Optional | An optional description of the Prompt version. |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID identifier for the Prompt. |
| `version` | integer | Version number of the Prompt. |
| `version_type` | string | Either "FIXED" or "LATEST". |
| `name` | string | Name of the Prompt. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `text` | string | Instructions used to shape EVI's behavior. |
| `version_description` | string | Description of the Prompt version. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.createPromptVersion("af699d45-2985-42cc-91b9-af9e5da3bac5", {
    text: "<role>You are an updated version of an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
    versionDescription: "This is an updated version of the Weather Assistant Prompt."
});
```

## Example Response

```json
{
  "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
  "version": 1,
  "version_type": "FIXED",
  "name": "Weather Assistant Prompt",
  "created_on": 1722633247488,
  "modified_on": 1722635140150,
  "text": "<role>You are an updated version of an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
  "version_description": "This is an updated version of the Weather Assistant Prompt."
}
```

# Delete Prompt

**DELETE** `https://api.hume.ai/v0/evi/prompts/:id`

Deletes a Prompt and its versions.

> See our prompting guide for tips on crafting your system prompt.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Prompt. Formatted as a UUID. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.deletePrompt("af699d45-2985-42cc-91b9-af9e5da3bac5");
```

## Example Response

```json
{
  "status": "success",
  "message": "Prompt deleted successfully"
}
```

# Update Prompt Name

**PATCH** `https://api.hume.ai/v0/evi/prompts/:id`

Updates the name of a Prompt.

> See our prompting guide for tips on crafting your system prompt.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Prompt. Formatted as a UUID. |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Required | Name applied to all versions of a particular Prompt. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.updatePromptName("af699d45-2985-42cc-91b9-af9e5da3bac5", {
    name: "Updated Weather Assistant Prompt Name"
});
```

## Example Response

```json
{
  "status": "success",
  "message": "Prompt name updated successfully"
}
```

# Get Prompt Version

**GET** `https://api.hume.ai/v0/evi/prompts/:id/version/:version`

Fetches a specified version of a Prompt.

> See our prompting guide for tips on crafting your system prompt.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Prompt. Formatted as a UUID. |
| `version` | integer | Required | Version number for a Prompt. |

> Prompts, Configs, Custom Voices, and Tools are versioned. This versioning system supports iterative development, allowing you to progressively refine prompts and revert to previous versions if needed. Version numbers are integer values representing different iterations of the Prompt. Each update to the Prompt increments its version number.

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Identifier for a Prompt. Formatted as a UUID. |
| `version` | integer | Version number for a Prompt. |
| `version_type` | "FIXED" or "LATEST" | Versioning method for a Prompt. Either FIXED for using a fixed version number or LATEST for auto-updating to the latest version. |
| `name` | string | Name applied to all versions of a particular Prompt. |
| `created_on` | long | Time at which the Prompt was created. Measured in seconds since the Unix epoch. |
| `modified_on` | long | Time at which the Prompt was last modified. Measured in seconds since the Unix epoch. |
| `text` | string | Instructions used to shape EVI's behavior, responses, and style. |
| `version_description` | string | Optional description of the Prompt version. |

> You can use the Prompt to define a specific goal or role for EVI, specifying how it should act or what it should focus on during the conversation. For example, EVI can be instructed to act as a customer support representative, a fitness coach, or a travel advisor, each with its own set of behaviors and response styles. For help writing a system prompt, see our Prompting Guide.

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.getPromptVersion("af699d45-2985-42cc-91b9-af9e5da3bac5", 0);
```

## Example Response

```json
{
  "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
  "version": 0,
  "version_type": "FIXED",
  "name": "Weather Assistant Prompt",
  "created_on": 1722633247488,
  "modified_on": 1722633247488,
  "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
  "version_description": ""
}
```

# Delete Prompt Version

**DELETE** `https://api.hume.ai/v0/evi/prompts/:id/version/:version`

Deletes a specified version of a Prompt.

> See our prompting guide for tips on crafting your system prompt.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Prompt. Formatted as a UUID. |
| `version` | integer | Required | Version number for a Prompt. |

> Prompts, Configs, Custom Voices, and Tools are versioned. This versioning system supports iterative development, allowing you to progressively refine prompts and revert to previous versions if needed. Version numbers are integer values representing different iterations of the Prompt. Each update to the Prompt increments its version number.

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.deletePromptVersion("af699d45-2985-42cc-91b9-af9e5da3bac5", 1);
```

## Example Response

```json
{
  "status": "success",
  "message": "Prompt version deleted successfully"
}
```

# Update Prompt Description

**PATCH** `https://api.hume.ai/v0/evi/prompts/:id/version/:version`

Updates the description of a Prompt.

> See our prompting guide for tips on crafting your system prompt.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Prompt. Formatted as a UUID. |
| `version` | integer | Required | Version number for a Prompt. |

> Prompts, Configs, Custom Voices, and Tools are versioned. This versioning system supports iterative development, allowing you to progressively refine prompts and revert to previous versions if needed. Version numbers are integer values representing different iterations of the Prompt. Each update to the Prompt increments its version number.

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version_description` | string | Optional | An optional description of the Prompt version. |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Identifier for a Prompt. Formatted as a UUID. |
| `version` | integer | Version number for a Prompt. |
| `version_type` | "FIXED" or "LATEST" | Versioning method for a Prompt. Either FIXED for using a fixed version number or LATEST for auto-updating to the latest version. |
| `name` | string | Name applied to all versions of a particular Prompt. |
| `created_on` | long | Time at which the Prompt was created. Measured in seconds since the Unix epoch. |
| `modified_on` | long | Time at which the Prompt was last modified. Measured in seconds since the Unix epoch. |
| `text` | string | Instructions used to shape EVI's behavior, responses, and style. |
| `version_description` | string | An optional description of the Prompt version. |

> You can use the Prompt to define a specific goal or role for EVI, specifying how it should act or what it should focus on during the conversation. For example, EVI can be instructed to act as a customer support representative, a fitness coach, or a travel advisor, each with its own set of behaviors and response styles. For help writing a system prompt, see our Prompting Guide.

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.updatePromptDescription("af699d45-2985-42cc-91b9-af9e5da3bac5", 1, {
    versionDescription: "This is an updated version_description."
});
```

## Example Response

```json
{
  "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
  "version": 1,
  "version_type": "FIXED",
  "name": "string",
  "created_on": 1722633247488,
  "modified_on": 1722634770585,
  "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
  "version_description": "This is an updated version_description."
}
```

# List Configs

**GET** `https://api.hume.ai/v0/evi/configs`

Fetches a paginated list of Configs.

> For more details on configuration options and how to configure EVI, see our [configuration guide](#).

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_number` | integer | Optional | Specifies the page number to retrieve (zero-based indexing). Defaults to 0. |
| `page_size` | integer | Optional | Specifies the maximum number of results per page (1-100). Defaults to 10. |
| `restrict_to_most_recent` | boolean | Optional | If true, returns only the latest version of each config. Defaults to false. |
| `name` | string | Optional | Filter to include only configs with the specified name. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `page_number` | integer | The returned page number (zero-based). |
| `page_size` | integer | The maximum number of items per page. |
| `total_pages` | integer | The total number of pages in the collection. |
| `configs_page` | array of objects | List of configs for the specified page. |

#### Config Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | UUID identifier for the Config. |
| `version` | integer | Version number of the Config. |
| `evi_version` | string | EVI version used ("1" or "2"). |
| `version_description` | string | Optional description of the Config version. |
| `name` | string | Name of the Config. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `prompt` | object | Associated Prompt object. |
| `voice` | object | Associated voice specification. |
| `language_model` | object | Supplemental language model details. |
| `ellm_model` | object | eLLM setup details. |
| `tools` | array of objects | List of user-defined tools. |
| `builtin_tools` | array of objects | List of built-in tools. |
| `event_messages` | object | Collection of event messages. |
| `timeouts` | object | Timeout specifications. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.listConfigs({
    pageNumber: 0,
    pageSize: 1
});
```

## Example Response

```json
{
  "total_pages": 1,
  "page_number": 0,
  "page_size": 1,
  "configs_page": [
    {
      "id": "1b60e1a0-cc59-424a-8d2c-189d354db3f3",
      "version": 0,
      "evi_version": "2",
      "version_description": "",
      "name": "Weather Assistant Config",
      "created_on": 1715267200693,
      "modified_on": 1715267200693,
      "prompt": {
        "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
        "version": 0,
        "version_type": "FIXED",
        "name": "Weather Assistant Prompt",
        "created_on": 1715267200693,
        "modified_on": 1715267200693,
        "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
        "version_description": ""
      },
      "voice": {
        "provider": "HUME_AI",
        "name": "SAMPLE VOICE",
        "custom_voice": {
          "id": "00aa8ee9-c50e-4ea1-9af0-7b08ad451704",
          "version": 1,
          "name": "SAMPLE VOICE",
          "created_on": 1724704587367,
          "modified_on": 1725489961583,
          "base_voice": "KORA",
          "parameter_model": "20241004-11parameter",
          "parameters": {
            "gender": 0,
            "assertiveness": 20,
            "buoyancy": -30,
            "confidence": -40,
            "enthusiasm": 50,
            "nasality": 45,
            "relaxedness": -35,
            "smoothness": 25,
            "tepidity": 15,
            "tightness": 5
          }
        }
      },
      "language_model": {
        "model_provider": "ANTHROPIC",
        "model_resource": "claude-3-5-sonnet-20240620"
      }
    }
  ]
}
```

## Create Config

**POST** `https://api.hume.ai/v0/evi/configs`

Creates a Config which can be applied to EVI.

> For more details on configuration options and how to configure EVI, see our [configuration guide](#).

### Request

This endpoint expects an object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `evi_version` | string | Required | Specifies the EVI version to use. Use "1" for version 1, or "2" for the latest enhanced version. |
| `name` | string | Required | Name applied to all versions of a particular Config. |
| `version_description` | string | Optional | An optional description of the Config version. |
| `prompt` | object | Optional | Identifies which prompt to use in a config OR how to create a new prompt to use in the config. |
| `voice` | object | Optional | A voice specification associated with this Config. |
| `language_model` | object | Optional | The supplemental language model associated with this Config. |
| `ellm_model` | object | Optional | The eLLM setup associated with this Config. |
| `tools` | array of objects | Optional | List of user-defined tools associated with this Config. |
| `builtin_tools` | array of objects | Optional | List of built-in tools associated with this Config. |
| `event_messages` | object | Optional | Collection of event messages returned by the server. |
| `timeouts` | object | Optional | Collection of timeout specifications returned by the server. |

### Response

#### Success

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Identifier for a Config. Formatted as a UUID. |
| `version` | integer | Version number for a Config. |
| `evi_version` | string | Specifies the EVI version used. |
| `version_description` | string | An optional description of the Config version. |
| `name` | string | Name applied to all versions of a particular Config. |
| `created_on` | long | Time at which the Config was created. Measured in seconds since the Unix epoch. |
| `modified_on` | long | Time at which the Config was last modified. Measured in seconds since the Unix epoch. |
| `prompt` | object | A Prompt associated with this Config. |
| `voice` | object | A voice specification associated with this Config. |
| `language_model` | object | The supplemental language model associated with this Config. |
| `ellm_model` | object | The eLLM setup associated with this Config. |
| `tools` | array of objects | List of user-defined tools associated with this Config. |
| `builtin_tools` | array of objects | List of built-in tools associated with this Config. |
| `event_messages` | object | Collection of event messages returned by the server. |
| `timeouts` | object | Collection of timeout specifications returned by the server. |

### Example Call

```typescript
import { HumeClient, Hume } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.createConfig({
    name: "Weather Assistant Config",
    prompt: {
        id: "af699d45-2985-42cc-91b9-af9e5da3bac5",
        version: 0
    },
    eviVersion: "2",
    voice: {
        provider: Hume.PostedVoiceProvider.HumeAi,
        name: "SAMPLE VOICE"
    },
    languageModel: {
        modelProvider: Hume.PostedLanguageModelModelProvider.Anthropic,
        modelResource: Hume.PostedLanguageModelModelResource.Claude35Sonnet20240620,
        temperature: 1
    },
    eventMessages: {
        onNewChat: {
            enabled: false,
            text: ""
        },
        onInactivityTimeout: {
            enabled: false,
            text: ""
        },
        onMaxDurationTimeout: {
            enabled: false,
            text: ""
        }
    }
});
```

### Example Response

```json
{
  "id": "1b60e1a0-cc59-424a-8d2c-189d354db3f3",
  "version": 0,
  "evi_version": "2",
  "version_description": "",
  "name": "Weather Assistant Config",
  "created_on": 1715275452390,
  "modified_on": 1715275452390,
  "prompt": {
    "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
    "version": 0,
    "version_type": "FIXED",
    "name": "Weather Assistant Prompt",
    "created_on": 1715267200693,
    "modified_on": 1715267200693,
    "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
    "version_description": ""
  },
  "voice": {
    "provider": "HUME_AI",
    "name": "SAMPLE VOICE",
    "custom_voice": {
      "id": "00aa8ee9-c50e-4ea1-9af0-7b08ad451704",
      "version": 1,
      "name": "SAMPLE VOICE",
      "created_on": 1724704587367,
      "modified_on": 1725489961583,
      "base_voice": "KORA",
      "parameter_model": "20241004-11parameter",
      "parameters": {
        "gender": 0,
        "assertiveness": 20,
        "buoyancy": -30,
        "confidence": -40,
        "enthusiasm": 50,
        "nasality": 45,
        "relaxedness": -35,
        "smoothness": 25,
        "tepidity": 15,
        "tightness": 5
      }
    }
  },
  "language_model": {
    "model_provider": "ANTHROPIC",
    "model_resource": "claude-3-5-sonnet-20240620",
    "temperature": 1
  },
  "ellm_model": {
    "allow_short_responses": false
  },
  "tools": [],
  "builtin_tools": [],
  "event_messages": {
    "on_new_chat": {
      "enabled": false,
      "text": ""
    },
    "on_inactivity_timeout": {
      "enabled": false,
      "text": ""
    },
    "on_max_duration_timeout": {
      "enabled": false,
      "text": ""
    }
  },
  "timeouts": {
    "inactivity": {
      "enabled": true,
      "duration_secs": 600
    },
    "max_duration": {
      "enabled": true,
      "duration_secs": 1800
    }
  }
}
```

# List Config Versions

**GET** `https://api.hume.ai/v0/evi/configs/:id`

Fetches a list of a Config's versions.

> For more details on configuration options and how to configure EVI, see our [configuration guide](#).

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Config. Formatted as a UUID. |

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_number` | integer | Optional | Specifies the page number to retrieve (zero-based indexing). Defaults to 0. |
| `page_size` | integer | Optional | Specifies the maximum number of results per page (1-100). Defaults to 10. |
| `restrict_to_most_recent` | boolean | Optional | If true, returns only the latest version of each config. Defaults to false. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `total_pages` | integer | The total number of pages in the collection. |
| `page_number` | integer | The returned page number (zero-based). |
| `page_size` | integer | The maximum number of items per page. |
| `configs_page` | array of objects | List of configs for the specified page. |

#### Config Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | UUID identifier for the Config. |
| `version` | integer | Version number of the Config. |
| `evi_version` | string | EVI version used ("1" or "2"). |
| `version_description` | string | Optional description of the Config version. |
| `name` | string | Name of the Config. |
| `created_on` | long | Creation timestamp (Unix epoch seconds). |
| `modified_on` | long | Last modification timestamp (Unix epoch seconds). |
| `prompt` | object | Associated Prompt object. |
| `voice` | object | Associated voice specification. |
| `language_model` | object | Supplemental language model details. |
| `ellm_model` | object | eLLM setup details. |
| `tools` | array of objects | List of user-defined tools. |
| `builtin_tools` | array of objects | List of built-in tools. |
| `event_messages` | object | Event message configurations. |
| `timeouts` | object | Timeout specifications. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.listConfigVersions("1b60e1a0-cc59-424a-8d2c-189d354db3f3");
```

## Example Response

```json
{
  "total_pages": 1,
  "page_number": 0,
  "page_size": 10,
  "configs_page": [
    {
      "id": "1b60e1a0-cc59-424a-8d2c-189d354db3f3",
      "version": 0,
      "evi_version": "2",
      "version_description": "",
      "name": "Weather Assistant Config",
      "created_on": 1715275452390,
      "modified_on": 1715275452390,
      "prompt": {
        "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
        "version": 0,
        "version_type": "FIXED",
        "name": "Weather Assistant Prompt",
        "created_on": 1715267200693,
        "modified_on": 1715267200693,
        "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
        "version_description": ""
      },
      "voice": {
        "provider": "HUME_AI",
        "name": "SAMPLE VOICE",
        "custom_voice": {
          "id": "00aa8ee9-c50e-4ea1-9af0-7b08ad451704",
          "version": 1,
          "name": "SAMPLE VOICE",
          "created_on": 1724704587367,
          "modified_on": 1725489961583,
          "base_voice": "KORA",
          "parameter_model": "20241004-11parameter",
          "parameters": {
            "gender": 0,
            "assertiveness": 20,
            "buoyancy": -30,
            "confidence": -40,
            "enthusiasm": 50,
            "nasality": 45,
            "relaxedness": -35,
            "smoothness": 25,
            "tepidity": 15,
            "tightness": 5
          }
        }
      },
      "language_model": {
        "model_provider": "ANTHROPIC",
        "model_resource": "claude-3-5-sonnet-20240620",
        "temperature": 1
      },
      "ellm_model": {
        "allow_short_responses": false
      },
      "tools": [],
      "builtin_tools": [],
      "event_messages": {
        "on_new_chat": {
          "enabled": false,
          "text": ""
        },
        "on_inactivity_timeout": {
          "enabled": false,
          "text": ""
        },
        "on_max_duration_timeout": {
          "enabled": false,
          "text": ""
        }
      },
      "timeouts": {
        "inactivity": {
          "enabled": true,
          "duration_secs": 600
        },
        "max_duration": {
          "enabled": true,
          "duration_secs": 1800
        }
      }
    }
  ]
}
```

# Create Config

## POST /v0/evi/configs

Creates a Config which can be applied to EVI. For more details on configuration options and how to configure EVI, see our configuration guide.

### Request Parameters

* evi_version (string, Required) Specifies the EVI version to use
  * Options: 1 | 2
* name (string, Required) Name applied to all versions of a particular Config
* version_description (string, Optional) An optional description of the Config version
* prompt (object, Optional) Identifies which prompt to use in a config OR how to create a new prompt 
  * id (string, Optional) Identifier for a Prompt (UUID format)
  * version (integer, Optional) Version number for a Prompt
  * text (string, Optional) Text used to create a new prompt
* voice (object, Optional) A voice specification associated with this Config
  * provider (string, Required) The provider of the voice to use
    * Options: HUME_AI | CUSTOM_VOICE
  * name (string, Optional) Specifies the name of the voice to use
    * Options: ITO | KORA | DACHER | AURA | FINN | WHIMSY | STELLA | SUNNY
  * custom_voice (object, Optional) A Custom Voice specification
    * name (string, Required) The name of the Custom Voice (max 75 chars)
    * base_voice (string, Required) The base voice used
      * Options: ITO | KORA | DACHER | AURA | FINN | WHIMSY | STELLA | SUNNY
    * parameter_model (string, Required) Parameter model name
      * Options: 20241004-11parameter
    * parameters (object, Optional) Voice attribute specifications
      * gender (integer, Optional) Tonality (-100 to 100, default: 0)
      * assertiveness (integer, Optional) Firmness (-100 to 100, default: 0)
      * buoyancy (integer, Optional) Density (-100 to 100, default: 0)
      * confidence (integer, Optional) Assuredness (-100 to 100, default: 0)
      * enthusiasm (integer, Optional) Excitement (-100 to 100, default: 0)
      * nasality (integer, Optional) Openness (-100 to 100, default: 0)
      * relaxedness (integer, Optional) Stress level (-100 to 100, default: 0)
      * smoothness (integer, Optional) Texture (-100 to 100, default: 0)
      * tepidity (integer, Optional) Liveliness (-100 to 100, default: 0)
      * tightness (integer, Optional) Containment (-100 to 100, default: 0)
* language_model (object, Optional) Supplemental language model configuration
  * model_provider (string, Optional) Provider of the language model
    * Options: OPEN_AI | CUSTOM_LANGUAGE_MODEL | ANTHROPIC | FIREWORKS | GROQ | GOOGLE
  * model_resource (string, Optional) Specific model to use with provider
    * Options: claude-3-5-sonnet-latest | claude-3-5-sonnet-20240620 | claude-3-opus-20240229 | claude-3-sonnet-20240229 | claude-3-haiku-20240307 | claude-2.1 | claude-instant-1.2 | gemini-1.5-pro | gemini-1.5-flash | gpt-4-turbo-preview | gpt-3.5-turbo-0125 | gpt-4o | gpt-4o-mini | llama3-8b-8192 | llama3-70b-8192
  * temperature (double, Optional) Model temperature (0 to 1)
* ellm_model (object, Optional) eLLM setup configuration
  * allow_short_responses (boolean, Optional) Allow short eLLM responses
* tools (array[object], Optional) List of user-defined tools
  * id (string, Required) Tool identifier (UUID format)
  * version (integer, Optional) Tool version number
* builtin_tools (array[object], Optional) List of built-in tools
  * name (string, Required) Name of built-in tool
    * Options: web_search | hang_up
  * fallback_content (string, Optional) Fallback text for tool errors
* event_messages (object, Optional) Server event message configuration
  * on_new_chat (object, Optional) New chat message settings
    * enabled (boolean, Required) Enable/disable message
    * text (string, Optional) Custom message text
  * on_inactivity_timeout (object, Optional) Inactivity timeout message
    * enabled (boolean, Required) Enable/disable message
    * text (string, Optional) Custom message text
  * on_max_duration_timeout (object, Optional) Maximum duration timeout message
    * enabled (boolean, Required) Enable/disable message
    * text (string, Optional) Custom message text
* timeouts (object, Optional) Timeout configurations
  * inactivity (object, Optional) Inactivity timeout settings
    * enabled (boolean, Required) Enable/disable timeout
    * duration_secs (integer, Optional) Timeout duration (30-1800 seconds)
  * max_duration (object, Optional) Maximum duration settings
    * enabled (boolean, Required) Enable/disable timeout
    * duration_secs (integer, Optional) Timeout duration (30-1800 seconds)

### Response

* id (string, Required) Config identifier (UUID format)
* version (integer, Required) Config version number
* evi_version (string, Required) EVI version used
* name (string, Required) Config name
* created_on (long, Required) Creation timestamp (Unix epoch)
* modified_on (long, Required) Last modification timestamp
* prompt (object, Optional) Associated prompt details
* voice (object, Optional) Voice configuration
* language_model (object, Optional) Language model settings
* ellm_model (object, Optional) eLLM configuration
* tools (array[object], Optional) Tool configurations
* builtin_tools (array[object], Optional) Built-in tool configurations
* event_messages (object, Optional) Event message configurations
* timeouts (object, Optional) Timeout settings

Example request:

```json
{
  "name": "Weather Assistant Config",
  "evi_version": "2",
  "prompt": {
    "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
    "version": 0
  },
  "voice": {
    "provider": "HUME_AI",
    "name": "SAMPLE VOICE"
  },
  "language_model": {
    "model_provider": "ANTHROPIC",
    "model_resource": "claude-3-5-sonnet-20240620",
    "temperature": 1
  },
  "event_messages": {
    "on_new_chat": {
      "enabled": false,
      "text": ""
    },
    "on_inactivity_timeout": {
      "enabled": false,
      "text": ""
    },
    "on_max_duration_timeout": {
      "enabled": false,
      "text": ""
    }
  }
}
```

# Delete Config

**DELETE** `https://api.hume.ai/v0/evi/configs/:id`

Deletes a Config and its versions.

> For more details on configuration options and how to configure EVI, see our [configuration guide](#).

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Config. Formatted as a UUID. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.deleteConfig("1b60e1a0-cc59-424a-8d2c-189d354db3f3");
```

## Example Response

```json
{
  "status": "success",
  "message": "Config deleted successfully"
}
```


# Update Config Name

**PATCH** `https://api.hume.ai/v0/evi/configs/:id`

Updates the name of a Config.

> For more details on configuration options and how to configure EVI, see our [configuration guide](#).

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Config. Formatted as a UUID. |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Required | Name applied to all versions of a particular Config. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.updateConfigName("1b60e1a0-cc59-424a-8d2c-189d354db3f3", {
    name: "Updated Weather Assistant Config Name"
});
```

## Example Response

```json
{
  "status": "success",
  "message": "Config name updated successfully"
}
```


# Get Config Version

**GET** `https://api.hume.ai/v0/evi/configs/:id/version/:version`

Fetches a specified version of a Config.

> For more details on configuration options and how to configure EVI, see our [configuration guide](#).

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Config. Formatted as a UUID. |
| `version` | integer | Required | Version number for a Config. |

> Configs, Prompts, Custom Voices, and Tools are versioned. This versioning system supports iterative development, allowing you to progressively refine configurations and revert to previous versions if needed. Version numbers are integer values representing different iterations of the Config. Each update to the Config increments its version number.

## Response

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Identifier for a Config. Formatted as a UUID. |
| `version` | integer | Version number for a Config. |
| `evi_version` | string | Specifies the EVI version used. Use "1" for version 1, or "2" for the latest enhanced version. |
| `version_description` | string | An optional description of the Config version. |
| `name` | string | Name applied to all versions of a particular Config. |
| `created_on` | long | Time at which the Config was created. Measured in seconds since the Unix epoch. |
| `modified_on` | long | Time at which the Config was last modified. Measured in seconds since the Unix epoch. |
| `prompt` | object | A Prompt associated with this Config. |
| `voice` | object | A voice specification associated with this Config. |
| `language_model` | object | The supplemental language model associated with this Config. |
| `ellm_model` | object | The eLLM setup associated with this Config. |
| `tools` | array of objects | List of user-defined tools associated with this Config. |
| `builtin_tools` | array of objects | List of built-in tools associated with this Config. |
| `event_messages` | object | Collection of event messages returned by the server. |
| `timeouts` | object | Collection of timeout specifications returned by the server. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.getConfigVersion("1b60e1a0-cc59-424a-8d2c-189d354db3f3", 1);
```

## Example Response

```json
{
  "id": "1b60e1a0-cc59-424a-8d2c-189d354db3f3",
  "version": 1,
  "evi_version": "2",
  "version_description": "",
  "name": "Weather Assistant Config",
  "created_on": 1715275452390,
  "modified_on": 1715275452390,
  "prompt": {
    "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
    "version": 0,
    "version_type": "FIXED",
    "name": "Weather Assistant Prompt",
    "created_on": 1715267200693,
    "modified_on": 1715267200693,
    "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
    "version_description": ""
  },
  "voice": {
    "provider": "HUME_AI",
    "name": "SAMPLE VOICE",
    "custom_voice": {
      "id": "00aa8ee9-c50e-4ea1-9af0-7b08ad451704",
      "version": 1,
      "name": "SAMPLE VOICE",
      "created_on": 1724704587367,
      "modified_on": 1725489961583,
      "base_voice": "KORA",
      "parameter_model": "20241004-11parameter",
      "parameters": {
        "gender": 0,
        "assertiveness": 20,
        "buoyancy": -30,
        "confidence": -40,
        "enthusiasm": 50,
        "nasality": 45,
        "relaxedness": -35,
        "smoothness": 25,
        "tepidity": 15,
        "tightness": 5
      }
    }
  },
  "language_model": {
    "model_provider": "ANTHROPIC",
    "model_resource": "claude-3-5-sonnet-20240620",
    "temperature": 1
  },
  "ellm_model": {
    "allow_short_responses": false
  },
  "tools": [],
  "builtin_tools": [],
  "event_messages": {
    "on_new_chat": {
      "enabled": false,
      "text": ""
    },
    "on_inactivity_timeout": {
      "enabled": false,
      "text": ""
    },
    "on_max_duration_timeout": {
      "enabled": false,
      "text": ""
    }
  },
  "timeouts": {
    "inactivity": {
      "enabled": true,
      "duration_secs": 600
    },
    "max_duration": {
      "enabled": true,
      "duration_secs": 1800
    }
  }
}
```

# Delete Config Version

**DELETE** `https://api.hume.ai/v0/evi/configs/:id/version/:version`

Deletes a specified version of a Config.

> For more details on configuration options and how to configure EVI, see our [configuration guide](#).

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Config. Formatted as a UUID. |
| `version` | integer | Required | Version number for a Config. |

> Configs, Prompts, Custom Voices, and Tools are versioned. This versioning system supports iterative development, allowing you to progressively refine configurations and revert to previous versions if needed. Version numbers are integer values representing different iterations of the Config. Each update to the Config increments its version number.

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.deleteConfigVersion("1b60e1a0-cc59-424a-8d2c-189d354db3f3", 1);
```

## Example Response

```json
{
  "status": "success",
  "message": "Config version deleted successfully"
}
```


# Update Config Description

**PATCH** `https://api.hume.ai/v0/evi/configs/:id/version/:version`

Updates the description of a Config.

> For more details on configuration options and how to configure EVI, see our [configuration guide](#).

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Config. Formatted as a UUID. |
| `version` | integer | Required | Version number for a Config. |

> Configs, Prompts, Custom Voices, and Tools are versioned. This versioning system supports iterative development, allowing you to progressively refine configurations and revert to previous versions if needed. Version numbers are integer values representing different iterations of the Config. Each update to the Config increments its version number.

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version_description` | string | Optional | An optional description of the Config version. |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Identifier for a Config. Formatted as a UUID. |
| `version` | integer | Version number for a Config. |
| `evi_version` | string | Specifies the EVI version used. Use "1" for version 1, or "2" for the latest enhanced version. |
| `version_description` | string | An optional description of the Config version. |
| `name` | string | Name applied to all versions of a particular Config. |
| `created_on` | long | Time at which the Config was created. Measured in seconds since the Unix epoch. |
| `modified_on` | long | Time at which the Config was last modified. Measured in seconds since the Unix epoch. |
| `prompt` | object | A Prompt associated with this Config. |
| `voice` | object | A voice specification associated with this Config. |
| `language_model` | object | The supplemental language model associated with this Config. |
| `ellm_model` | object | The eLLM setup associated with this Config. |
| `tools` | array of objects | List of user-defined tools associated with this Config. |
| `builtin_tools` | array of objects | List of built-in tools associated with this Config. |
| `event_messages` | object | Collection of event messages returned by the server. |
| `timeouts` | object | Collection of timeout specifications returned by the server. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.updateConfigDescription("1b60e1a0-cc59-424a-8d2c-189d354db3f3", 1, {
    versionDescription: "This is an updated version_description."
});
```

## Example Response

```json
{
  "id": "1b60e1a0-cc59-424a-8d2c-189d354db3f3",
  "version": 1,
  "evi_version": "2",
  "version_description": "This is an updated version_description.",
  "name": "Weather Assistant Config",
  "created_on": 1715275452390,
  "modified_on": 1715275452390,
  "prompt": {
    "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
    "version": 0,
    "version_type": "FIXED",
    "name": "Weather Assistant Prompt",
    "created_on": 1715267200693,
    "modified_on": 1715267200693,
    "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
    "version_description": ""
  },
  "voice": {
    "provider": "HUME_AI",
    "name": "SAMPLE VOICE",
    "custom_voice": {
      "id": "00aa8ee9-c50e-4ea1-9af0-7b08ad451704",
      "version": 1,
      "name": "SAMPLE VOICE",
      "created_on": 1724704587367,
      "modified_on": 1725489961583,
      "base_voice": "KORA",
      "parameter_model": "20241004-11parameter",
      "parameters": {
        "gender": 0,
        "assertiveness": 20,
        "buoyancy": -30,
        "confidence": -40,
        "enthusiasm": 50,
        "nasality": 45,
        "relaxedness": -35,
        "smoothness": 25,
        "tepidity": 15,
        "tightness": 5
      }
    }
  },
  "language_model": {
    "model_provider": "ANTHROPIC",
    "model_resource": "claude-3-5-sonnet-20240620",
    "temperature": 1
  },
  "ellm_model": {
    "allow_short_responses": false
  }
}
```

# List Chats

**GET** `https://api.hume.ai/v0/evi/chats`

Fetches a paginated list of Chats.

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_number` | integer | Optional | Specifies the page number to retrieve (zero-based indexing). Defaults to 0. |
| `page_size` | integer | Optional | Specifies the maximum number of results per page (1-100). Defaults to 10. |
| `ascending_order` | boolean | Optional | If true, sorts results in ascending order (oldest first). If false, sorts in descending order (newest first). Defaults to false. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `page_number` | integer | The returned page number (zero-based). |
| `page_size` | integer | The maximum number of items per page. |
| `total_pages` | integer | The total number of pages in the collection. |
| `pagination_direction` | string | Either "ASC" or "DESC", indicating the sorting order. |
| `chats_page` | array of objects | List of chats for the specified page. |

#### Chat Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | UUID identifier for the Chat. |
| `chat_group_id` | string | UUID identifier for the Chat Group. |
| `status` | string | Current status of the Chat. |
| `start_timestamp` | long | Start time of the Chat (Unix epoch milliseconds). |
| `end_timestamp` | long | End time of the Chat (Unix epoch milliseconds). |
| `event_count` | integer | Number of events in the Chat. |
| `metadata` | string | Additional metadata for the Chat. |
| `config` | object | Configuration details for the Chat. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.chats.listChats({
    pageNumber: 0,
    pageSize: 1,
    ascendingOrder: true
});
```

## Example Response

```json
{
  "page_number": 0,
  "page_size": 1,
  "total_pages": 1,
  "pagination_direction": "ASC",
  "chats_page": [
    {
      "id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
      "chat_group_id": "9fc18597-3567-42d5-94d6-935bde84bf2f",
      "status": "USER_ENDED",
      "start_timestamp": 1716244940648,
      "end_timestamp": 1716244958546,
      "event_count": 3,
      "metadata": "",
      "config": {
        "id": "1b60e1a0-cc59-424a-8d2c-189d354db3f3",
        "version": 0
      }
    }
  ]
}
```

# List Chat Events

**GET** `https://api.hume.ai/v0/evi/chats/:id`

Fetches a paginated list of Chat events.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Chat. Formatted as a UUID. |

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_size` | integer | Optional | Specifies the maximum number of results per page (1-100). Defaults to 10. |
| `page_number` | integer | Optional | Specifies the page number to retrieve (zero-based indexing). Defaults to 0. |
| `ascending_order` | boolean | Optional | If true, sorts results in ascending order (oldest first). If false, sorts in descending order (newest first). Defaults to true. |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Identifier for a Chat. Formatted as a UUID. |
| `chat_group_id` | string | Identifier for the Chat Group. Formatted as a UUID. |
| `status` | enum | Current status of the chat. Possible values: ACTIVE, USER_ENDED, USER_TIMEOUT, MAX_DURATION_TIMEOUT, INACTIVITY_TIMEOUT, ERROR. |
| `start_timestamp` | long | Start time of the Chat (Unix epoch milliseconds). |
| `pagination_direction` | string | Either "ASC" or "DESC", indicating the sorting order. |
| `events_page` | array of objects | List of Chat Events for the specified page. |
| `page_number` | integer | The returned page number (zero-based). |
| `page_size` | integer | The maximum number of items per page. |
| `total_pages` | integer | The total number of pages in the collection. |
| `end_timestamp` | long | End time of the Chat (Unix epoch milliseconds). Optional, defaults to 0. |
| `metadata` | string | Additional metadata about the chat. Optional. |
| `config` | object | The Config associated with this Chat. Optional. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.chats.listChatEvents("470a49f6-1dec-4afe-8b61-035d3b2d63b0", {
    pageNumber: 0,
    pageSize: 3,
    ascendingOrder: true
});
```

# Get Chat Audio

**GET** `https://api.hume.ai/v0/evi/chats/:id/audio`

Fetches the audio of a previous Chat. For more details, see our guide on audio reconstruction here.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a chat. Formatted as a UUID. |

## Response

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Identifier for the chat. Formatted as a UUID. |
| `user_id` | string | Identifier for the user that owns this chat. Formatted as a UUID. |
| `status` | enum | Current state of the audio reconstruction job. Possible values: QUEUED, IN_PROGRESS, COMPLETE, ERROR, CANCELLED. |
| `filename` | string | Optional. Name of the chat audio reconstruction file. |
| `modified_at` | long | Optional. Timestamp of the most recent status change (Unix epoch milliseconds). Defaults to 0. |
| `signed_audio_url` | string | Optional. Signed URL used to download the chat audio reconstruction file. |
| `signed_url_expiration_timestamp_millis` | long | Optional. Timestamp when the signed URL will expire (Unix epoch milliseconds). Defaults to 0. |

### Status Descriptions

- QUEUED: The reconstruction job is waiting to be processed.
- IN_PROGRESS: The reconstruction is currently being processed.
- COMPLETE: The audio reconstruction is finished and ready for download.
- ERROR: An error occurred during the reconstruction process.
- CANCELLED: The reconstruction job has been canceled.

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.chats.getAudio("470a49f6-1dec-4afe-8b61-035d3b2d63b0");
```

## Example Response

```json
{
  "id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
  "user_id": "e6235940-cfda-3988-9147-ff531627cf42",
  "status": "COMPLETE",
  "filename": "e6235940-cfda-3988-9147-ff531627cf42/470a49f6-1dec-4afe-8b61-035d3b2d63b0/reconstructed_audio.mp4",
  "modified_at": 1729875432555,
  "signed_audio_url": "https://storage.googleapis.com/...etc.",
  "signed_url_expiration_timestamp_millis": 1730232816964
}
```

# List Chat Groups

**GET** `https://api.hume.ai/v0/evi/chat_groups`

Fetches a paginated list of Chat Groups.

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_number` | integer | Optional | Specifies the page number to retrieve (zero-based indexing). Defaults to 0. |
| `page_size` | integer | Optional | Specifies the maximum number of results per page (1-100). Defaults to 10. |
| `ascending_order` | boolean | Optional | If true, sorts results in ascending order (oldest first). If false, sorts in descending order (newest first). Defaults to true. |
| `config_id` | string | Optional | Filter Chat Groups to only include Chats that used this config_id in their most recent Chat. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `page_number` | integer | The returned page number (zero-based). |
| `page_size` | integer | The maximum number of items per page. |
| `total_pages` | integer | The total number of pages in the collection. |
| `pagination_direction` | string | Either "ASC" or "DESC", indicating the sorting order. |
| `chat_groups_page` | array of objects | List of Chat Groups for the specified page. |

#### Chat Group Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | UUID identifier for the Chat Group. |
| `first_start_timestamp` | long | Start time of the first Chat in the group (Unix epoch milliseconds). |
| `most_recent_start_timestamp` | long | Start time of the most recent Chat in the group (Unix epoch milliseconds). |
| `num_chats` | integer | Number of Chats in the group. |
| `most_recent_chat_id` | string | UUID identifier for the most recent Chat in the group. |
| `active` | boolean | Indicates if the Chat Group is currently active. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.chatGroups.listChatGroups({
    pageNumber: 0,
    pageSize: 1,
    ascendingOrder: true,
    configId: "1b60e1a0-cc59-424a-8d2c-189d354db3f3"
});
```

## Example Response

```json
{
  "page_number": 0,
  "page_size": 1,
  "total_pages": 1,
  "pagination_direction": "ASC",
  "chat_groups_page": [
    {
      "id": "697056f0-6c7e-487d-9bd8-9c19df79f05f",
      "first_start_timestamp": 1721844196397,
      "most_recent_start_timestamp": 1721861821717,
      "num_chats": 5,
      "most_recent_chat_id": "dfdbdd4d-0ddf-418b-8fc4-80a266579d36",
      "active": false
    }
  ]
}
```

# Get Chat Group

**GET** `https://api.hume.ai/v0/evi/chat_groups/:id`

Fetches a ChatGroup by ID, including a paginated list of Chats associated with the ChatGroup.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Chat Group. Formatted as a UUID. |

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_size` | integer | Optional | Maximum number of results per page (1-100). Defaults to 10. |
| `page_number` | integer | Optional | Page number to retrieve (zero-based indexing). Defaults to 0. |
| `ascending_order` | boolean | Optional | If true, sorts results in ascending order (oldest first). If false, sorts in descending order (newest first). Defaults to true. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID identifier for the Chat Group. |
| `first_start_timestamp` | long | Start time of the first Chat in the group (Unix epoch seconds). |
| `most_recent_start_timestamp` | long | Start time of the most recent Chat in the group (Unix epoch seconds). |
| `num_chats` | integer | Total number of Chats in the group. |
| `page_number` | integer | Returned page number (zero-based). |
| `page_size` | integer | Maximum number of items per page. |
| `total_pages` | integer | Total number of pages in the collection. |
| `pagination_direction` | string | Either "ASC" or "DESC", indicating the sorting order. |
| `chats_page` | array of objects | List of Chats for the specified page. |
| `active` | boolean | Indicates if there's an active Chat in this group. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.chatGroups.getChatGroup("697056f0-6c7e-487d-9bd8-9c19df79f05f", {
    pageNumber: 0,
    pageSize: 1,
    ascendingOrder: true
});
```

## Example Response

```json
{
  "id": "369846cf-6ad5-404d-905e-a8acb5cdfc78",
  "first_start_timestamp": 1712334213647,
  "most_recent_start_timestamp": 1712334213647,
  "num_chats": 1,
  "page_number": 0,
  "page_size": 1,
  "total_pages": 1,
  "pagination_direction": "ASC",
  "chats_page": [
    {
      "id": "6375d4f8-cd3e-4d6b-b13b-ace66b7c8aaa",
      "chat_group_id": "369846cf-6ad5-404d-905e-a8acb5cdfc78",
      "status": "USER_ENDED",
      "start_timestamp": 1712334213647,
      "end_timestamp": 1712334332571,
      "event_count": 0
    }
  ],
  "active": false
}
```

# List Chat Events from a Specific Chat Group

**GET** `https://api.hume.ai/v0/evi/chat_groups/:id/events`

Fetches a paginated list of Chat events associated with a Chat Group.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Required | Identifier for a Chat Group. Formatted as a UUID. |

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_size` | integer | Optional | Maximum number of results per page (1-100). Defaults to 10. |
| `page_number` | integer | Optional | Page number to retrieve (zero-based indexing). Defaults to 0. |
| `ascending_order` | boolean | Optional | If true, sorts results in ascending order (oldest first). If false, sorts in descending order (newest first). Defaults to true. |

## Response

### Success

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID identifier for the Chat Group. |
| `page_number` | integer | Returned page number (zero-based). |
| `page_size` | integer | Maximum number of items per page. |
| `total_pages` | integer | Total number of pages in the collection. |
| `pagination_direction` | string | Either "ASC" or "DESC", indicating the sorting order. |
| `events_page` | array of objects | List of Chat Events for the specified page. |

## Example Call

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.chatGroups.listChatGroupEvents("697056f0-6c7e-487d-9bd8-9c19df79f05f", {
    pageNumber: 0,
    pageSize: 3,
    ascendingOrder: true
});
```

## Example Response
```json
{
  "id": "697056f0-6c7e-487d-9bd8-9c19df79f05f",
  "page_number": 0,
  "page_size": 3,
  "total_pages": 1,
  "pagination_direction": "ASC",
  "events_page": [
    {
      "id": "5d44bdbb-49a3-40fb-871d-32bf7e76efe7",
      "chat_id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
      "timestamp": 1716244940762,
      "role": "SYSTEM",
      "type": "SYSTEM_PROMPT",
      "message_text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
      "emotion_features": "",
      "metadata": ""
    },
    {
      "id": "5976ddf6-d093-4bb9-ba60-8f6c25832dde",
      "chat_id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
      "timestamp": 1716244956278,
      "role": "USER",
      "type": "USER_MESSAGE",
      "message_text": "Hello.",
      "emotion_features": "{\"Admiration\": 0.09906005859375, \"Adoration\": 0.12213134765625, \"Aesthetic Appreciation\": 0.05035400390625, \"Amusement\": 0.16552734375, \"Anger\": 0.0037384033203125, \"Anxiety\": 0.010101318359375, \"Awe\": 0.058197021484375, \"Awkwardness\": 0.10552978515625, \"Boredom\": 0.1141357421875, \"Calmness\": 0.115234375, \"Concentration\": 0.00444793701171875, \"Confusion\": 0.0343017578125, \"Contemplation\": 0.00812530517578125, \"Contempt\": 0.009002685546875, \"Contentment\": 0.087158203125, \"Craving\": 0.00818634033203125, \"Desire\": 0.018310546875, \"Determination\": 0.003238677978515625, \"Disappointment\": 0.024169921875, \"Disgust\": 0.00702667236328125, \"Distress\": 0.00936126708984375, \"Doubt\": 0.00632476806640625, \"Ecstasy\": 0.0293731689453125, \"Embarrassment\": 0.01800537109375, \"Empathic Pain\": 0.0088348388671875, \"Entrancement\": 0.013397216796875, \"Envy\": 0.02557373046875, \"Excitement\": 0.12109375, \"Fear\": 0.004413604736328125, \"Guilt\": 0.016571044921875, \"Horror\": 0.00274658203125, \"Interest\": 0.2142333984375, \"Joy\": 0.29638671875, \"Love\": 0.16015625, \"Nostalgia\": 0.007843017578125, \"Pain\": 0.007160186767578125, \"Pride\": 0.00508880615234375, \"Realization\": 0.054229736328125, \"Relief\": 0.048736572265625, \"Romance\": 0.026397705078125, \"Sadness\": 0.0265350341796875, \"Satisfaction\": 0.051361083984375, \"Shame\": 0.00974273681640625, \"Surprise (negative)\": 0.0218963623046875, \"Surprise (positive)\": 0.216064453125, \"Sympathy\": 0.021728515625, \"Tiredness\": 0.0173797607421875, \"Triumph\": 0.004520416259765625}",
      "metadata": "{\"segments\": [{\"content\": \"Hello.\", \"embedding\": [0.6181640625, 0.1763916015625, -30.921875, 1.2705078125, 0.927734375, 0.63720703125, 2.865234375, 0.1080322265625, 0.2978515625, 1.0107421875, 1.34375, 0.74560546875, 0.416259765625, 0.99462890625, -0.333740234375, 0.361083984375, -1.388671875, 1.0107421875, 1.3173828125, 0.55615234375, 0.541015625, -0.1837158203125, 1.697265625, 0.228515625, 2.087890625, -0.311767578125, 0.053680419921875, 1.3349609375, 0.95068359375, 0.00441741943359375, 0.705078125, 1.8916015625, -0.939453125, 0.93701171875, -0.28955078125, 1.513671875, 0.5595703125, 1.0126953125, -0.1624755859375, 1.4072265625, -0.28857421875, -0.4560546875, -0.1500244140625, -0.1102294921875, -0.222412109375, 0.8779296875, 1.275390625, 1.6689453125, 0.80712890625, -0.34814453125, -0.325439453125, 0.412841796875, 0.81689453125, 0.55126953125, 1.671875, 0.6611328125, 0.7451171875, 1.50390625, 1.0224609375, -1.671875, 0.7373046875, 2.1328125, 2.166015625, 0.41015625, -0.127685546875, 1.9345703125, -4.2734375, 0.332275390625, 0.26171875, 0.76708984375, 0.2685546875, 0.468017578125, 1.208984375, -1.517578125, 1.083984375, 0.84814453125, 1.0244140625, -0.0072174072265625, 1.34375, 1.0712890625, 1.517578125, -0.52001953125, 0.59228515625, 0.8154296875, -0.951171875, -0.07757568359375, 1.3330078125, 1.125, 0.61181640625, 1.494140625, 0.357421875, 1.1796875, 1.482421875, 0.8046875, 0.1536865234375, 1.8076171875, 0.68115234375, -15.171875, 1.2294921875, 0.319091796875, 0.499755859375, 1.5771484375, 0.94677734375, -0.2490234375, 0.88525390625, 3.47265625, 0.75927734375, 0.71044921875, 1.2333984375, 1.4169921875, -0.56640625, -1.8095703125, 1.37109375, 0.428955078125, 1.89453125, -0.39013671875, 0.1734619140625, 1.5595703125, -1.2294921875, 2.552734375, 0.58349609375, 0.2156982421875, -0.00984954833984375, -0.6865234375, -0.0272979736328125, -0.2264404296875, 2.853515625, 1.3896484375, 0.52978515625, 0.783203125, 3.0390625, 0.75537109375, 0.219970703125, 0.384521484375, 0.385986328125, 2.0546875, -0.10443115234375, 1.5146484375, 1.4296875, 1.9716796875, 1.1318359375, 0.31591796875, 0.338623046875, 1.654296875, -0.88037109375, -0.21484375, 1.45703125, 1.0380859375, -0.52294921875, -0.47802734375, 0.1650390625, 1.2392578125, -1.138671875, 0.56787109375, 1.318359375, 0.4287109375, 0.1981201171875, 2.4375, 0.281005859375, 0.89404296875, -0.1552734375, 0.6474609375, -0.08331298828125, 0.00740814208984375, -0.045501708984375, -0.578125, 2.02734375, 0.59228515625, 0.35693359375, 1.2919921875, 1.22265625, 1.0537109375, 0.145263671875, 1.05859375, -0.369140625, 0.207275390625, 0.78857421875, 0.599609375, 0.99072265625, 0.24462890625, 1.26953125, 0.08404541015625, 1.349609375, 0.73291015625, 1.3212890625, 0.388916015625, 1.0869140625, 0.9931640625, -1.5673828125, 0.0462646484375, 0.650390625, 0.253662109375, 0.58251953125, 1.8134765625, 0.8642578125, 2.591796875, 0.7314453125, 0.85986328125, 0.5615234375, 0.9296875, 0.04144287109375, 1.66015625, 1.99609375, 1.171875, 1.181640625, 1.5126953125, 0.0224456787109375, 0.58349609375, -1.4931640625, 0.81884765625, 0.732421875, -0.6455078125, -0.62451171875, 1.7802734375, 0.01526641845703125, -0.423095703125, 0.461669921875, 4.87890625, 1.2392578125, -0.6953125, 0.6689453125, 0.62451171875, -1.521484375, 1.7685546875, 0.810546875, 0.65478515625, 0.26123046875, 1.6396484375, 0.87548828125, 1.7353515625, 2.046875, 1.5634765625, 0.69384765625, 1.375, 0.8916015625, 1.0107421875, 0.1304931640625, 2.009765625, 0.06402587890625, -0.08428955078125, 0.04351806640625, -1.7529296875, 2.02734375, 3.521484375, 0.404541015625, 1.6337890625, -0.276611328125, 0.8837890625, -0.1287841796875, 0.91064453125, 0.8193359375, 0.701171875, 0.036529541015625, 1.26171875, 1.0478515625, -0.1422119140625, 1.0634765625, 0.61083984375, 1.3505859375, 1.208984375, 0.57275390625, 1.3623046875, 2.267578125, 0.484375, 0.9150390625, 0.56787109375, -0.70068359375, 0.27587890625, -0.70654296875, 0.8466796875, 0.57568359375, 1.6162109375, 0.87939453125, 2.248046875, -0.5458984375, 1.7744140625, 1.328125, 1.232421875, 0.6806640625, 0.9365234375, 1.052734375, -1.08984375, 1.8330078125, -0.4033203125, 1.0673828125, 0.297607421875, 1.5703125, 1.67578125, 1.34765625, 2.8203125, 2.025390625, -0.48583984375, 0.7626953125, 0.01007843017578125, 1.435546875, 0.007205963134765625, 0.05157470703125, -0.9853515625, 0.26708984375, 1.16796875, 1.2041015625, 1.99609375, -0.07916259765625, 1.244140625, -0.32080078125, 0.6748046875, 0.419921875, 1.3212890625, 1.291015625, 0.599609375, 0.0550537109375, 0.9599609375, 0.93505859375, 0.111083984375, 1.302734375, 0.0833740234375, 2.244140625, 1.25390625, 1.6015625, 0.58349609375, 1.7568359375, -0.263427734375, -0.019866943359375, -0.24658203125, -0.1871337890625, 0.927734375, 0.62255859375, 0.275146484375, 0.79541015625, 1.1796875, 1.1767578125, -0.26123046875, -0.268310546875, 1.8994140625, 1.318359375, 2.1875, 0.2469482421875, 1.41015625, 0.03973388671875, 1.2685546875, 1.1025390625, 0.9560546875, 0.865234375, -1.92578125, 1.154296875, 0.389892578125, 1.130859375, 0.95947265625, 0.72314453125, 2.244140625, 0.048553466796875, 0.626953125, 0.42919921875, 0.82275390625, 0.311767578125, -0.320556640625, 0.01041412353515625, 0.1483154296875, 0.10809326171875, -0.3173828125, 1.1337890625, -0.8642578125, 1.4033203125, 0.048828125, 1.1787109375, 0.98779296875, 1.818359375, 1.1552734375, 0.6015625, 1.2392578125, -1.2685546875, 0.39208984375, 0.83251953125, 0.224365234375, 0.0019989013671875, 0.87548828125, 1.6572265625, 1.107421875, 0.434814453125, 1.8251953125, 0.442626953125, 1.2587890625, 0.09320068359375, -0.896484375, 1.8017578125, 1.451171875, -0.0755615234375, 0.6083984375, 2.06640625, 0.673828125, -0.33740234375, 0.192138671875, 0.21435546875, 0.80224609375, -1.490234375, 0.9501953125, 0.86083984375, -0.40283203125, 4.109375, 2.533203125, 1.2529296875, 0.8271484375, 0.225830078125, 1.0478515625, -1.9755859375, 0.841796875, 0.392822265625, 0.525390625, 0.33935546875, -0.79443359375, 0.71630859375, 0.97998046875, -0.175537109375, 0.97705078125, 1.705078125, 0.29638671875, 0.68359375, 0.54150390625, 0.435791015625, 0.99755859375, -0.369140625, 1.009765625, -0.140380859375, 0.426513671875, 0.189697265625, 1.8193359375, 1.1201171875, -0.5009765625, -0.331298828125, 0.759765625, -0.09442138671875, 0.74609375, -1.947265625, 1.3544921875, -3.935546875, 2.544921875, 1.359375, 0.1363525390625, 0.79296875, 0.79931640625, -0.3466796875, 1.1396484375, -0.33447265625, 2.0078125, -0.241455078125, 0.6318359375, 0.365234375, 0.296142578125, 0.830078125, 1.0458984375, 0.5830078125, 0.61572265625, 14.0703125, -2.0078125, -0.381591796875, 1.228515625, 0.08282470703125, -0.67822265625, -0.04339599609375, 0.397216796875, 0.1656494140625, 0.137451171875, 0.244873046875, 1.1611328125, -1.3818359375, 0.8447265625, 1.171875, 0.36328125, 0.252685546875, 0.1197509765625, 0.232177734375, -0.020172119140625, 0.64404296875, -0.01100921630859375, -1.9267578125, 0.222412109375, 0.56005859375, 1.3046875, 1.1630859375, 1.197265625, 1.02734375, 1.6806640625, -0.043731689453125, 1.4697265625, 0.81201171875, 1.5390625, 1.240234375, -0.7353515625, 1.828125, 1.115234375, 1.931640625, -0.517578125, 0.77880859375, 1.0546875, 0.95361328125, 3.42578125, 0.0160369873046875, 0.875, 0.56005859375, 1.2421875, 1.986328125, 1.4814453125, 0.0948486328125, 1.115234375, 0.00665283203125, 2.09375, 0.3544921875, -0.52783203125, 1.2099609375, 0.45068359375, 0.65625, 0.1112060546875, 1.0751953125, -0.9521484375, -0.30029296875, 1.4462890625, 2.046875, 3.212890625, 1.68359375, 1.07421875, -0.5263671875, 0.74560546875, 1.37890625, 0.15283203125, 0.2440185546875, 0.62646484375, -0.1280517578125, 0.7646484375, -0.515625, -0.35693359375, 1.2958984375, 0.96923828125, 0.58935546875, 1.3701171875, 1.0673828125, 0.2337646484375, 0.93115234375, 0.66357421875, 6.0, 1.1025390625, -0.51708984375, -0.38330078125, 0.7197265625, 0.246826171875, -0.45166015625, 1.9521484375, 0.5546875, 0.08807373046875, 0.18505859375, 0.8857421875, -0.57177734375, 0.251708984375, 0.234375, 2.57421875, 0.9599609375, 0.5029296875, 0.10382080078125, 0.08331298828125, 0.66748046875, -0.349609375, 1.287109375, 0.259765625, 2.015625, 2.828125, -0.3095703125, -0.164306640625, -0.3408203125, 0.486572265625, 0.8466796875, 1.9130859375, 0.09088134765625, 0.66552734375, 0.00972747802734375, -0.83154296875, 1.755859375, 0.654296875, 0.173828125, 0.27587890625, -0.47607421875, -0.264404296875, 0.7529296875, 0.6533203125, 0.7275390625, 0.499755859375, 0.833984375, -0.44775390625, -0.05078125, -0.454833984375, 0.75439453125, 0.68505859375, 0.210693359375, -0.283935546875, -0.53564453125, 0.96826171875, 0.861328125, -3.33984375, -0.26171875, 0.77734375, 0.26513671875, -0.14111328125, -0.042236328125, -0.84814453125, 0.2137451171875, 0.94921875, 0.65185546875, -0.5380859375, 0.1529541015625, -0.360595703125, -0.0333251953125, -0.69189453125, 0.8974609375, 0.7109375, 0.81494140625, -0.259521484375, 1.1904296875, 0.62158203125, 1.345703125, 0.89404296875, 0.70556640625, 1.0673828125, 1.392578125, 0.5068359375, 0.962890625, 0.736328125, 1.55078125, 0.50390625, -0.398681640625, 2.361328125, 0.345947265625, -0.61962890625, 0.330078125, 0.75439453125, -0.673828125, -0.2379150390625, 1.5673828125, 1.369140625, 0.1119384765625, -0.1834716796875, 1.4599609375, -0.77587890625, 0.5556640625, 0.09954833984375, 0.0285186767578125, 0.58935546875, -0.501953125, 0.212890625, 0.02679443359375, 0.1715087890625, 0.03466796875, -0.564453125, 2.029296875, 2.45703125, -0.72216796875, 2.138671875, 0.50830078125, -0.09356689453125, 0.230224609375, 1.6943359375, 1.5126953125, 0.39453125, 0.411376953125, 1.07421875, -0.8046875, 0.51416015625, 0.2271728515625, -0.283447265625, 0.38427734375, 0.73388671875, 0.6962890625, 1.4990234375, 0.02813720703125, 0.40478515625, 1.2451171875, 1.1162109375, -5.5703125, 0.76171875, 0.322021484375, 1.0361328125, 1.197265625, 0.1163330078125, 0.2425537109375, 1.5595703125, 1.5791015625, -0.0921630859375, 0.484619140625, 1.9052734375, 5.31640625, 1.6337890625, 0.95947265625, -0.1751708984375, 0.466552734375, 0.8330078125, 1.03125, 0.2044677734375, 0.31298828125, -1.1220703125, 0.5517578125, 0.93505859375, 0.45166015625, 1.951171875, 0.65478515625, 1.30859375, 1.0859375, 0.56494140625, 2.322265625, 0.242919921875, 1.81640625, -0.469970703125, -0.841796875, 0.90869140625, 1.5361328125, 0.923828125, 1.0595703125, 0.356689453125, -0.46142578125, 2.134765625, 1.3037109375, -0.32373046875, -9.2265625, 0.4521484375, 0.88037109375, -0.53955078125, 0.96484375, 0.7705078125, 0.84521484375, 1.580078125, -0.1448974609375, 0.7607421875, 1.0166015625, -0.086669921875, 1.611328125, 0.05938720703125, 0.5078125, 0.8427734375, 2.431640625, 0.66357421875, 3.203125, 0.132080078125, 0.461181640625, 0.779296875, 1.9482421875, 1.8720703125, 0.845703125, -1.3837890625, -0.138916015625, 0.35546875, 0.2457275390625, 0.75341796875, 1.828125, 1.4169921875, 0.60791015625, 1.0068359375, 1.109375, 0.484130859375, -0.302001953125, 0.4951171875, 0.802734375, 1.9482421875, 0.916015625, 0.1646728515625, 2.599609375, 1.7177734375, -0.2374267578125, 0.98046875, 0.39306640625, -1.1396484375, 1.6533203125, 0.375244140625], \"scores\": [0.09906005859375, 0.12213134765625, 0.05035400390625, 0.16552734375, 0.0037384033203125, 0.010101318359375, 0.058197021484375, 0.10552978515625, 0.1141357421875, 0.115234375, 0.00444793701171875, 0.00812530517578125, 0.0343017578125, 0.009002685546875, 0.087158203125, 0.00818634033203125, 0.003238677978515625, 0.024169921875, 0.00702667236328125, 0.00936126708984375, 0.00632476806640625, 0.0293731689453125, 0.01800537109375, 0.0088348388671875, 0.013397216796875, 0.02557373046875, 0.12109375, 0.004413604736328125, 0.016571044921875, 0.00274658203125, 0.2142333984375, 0.29638671875, 0.16015625, 0.007843017578125, 0.007160186767578125, 0.00508880615234375, 0.054229736328125, 0.048736572265625, 0.026397705078125, 0.0265350341796875, 0.051361083984375, 0.018310546875, 0.00974273681640625, 0.0218963623046875, 0.216064453125, 0.021728515625, 0.0173797607421875, 0.004520416259765625], \"stoks\": [52, 52, 52, 52, 52, 41, 41, 374, 303, 303, 303, 427], \"time\": {\"begin_ms\": 640, \"end_ms\": 1140}}]}"
    },
    {
      "id": "7645a0d1-2e64-410d-83a8-b96040432e9a",
      "chat_id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
      "timestamp": 1716244957031,
      "role": "AGENT",
      "type": "AGENT_MESSAGE",
      "message_text": "Hello!",
      "emotion_features": "{\"Admiration\": 0.044921875, \"Adoration\": 0.0253753662109375, \"Aesthetic Appreciation\": 0.03265380859375, \"Amusement\": 0.118408203125, \"Anger\": 0.06719970703125, \"Anxiety\": 0.0411376953125, \"Awe\": 0.03802490234375, \"Awkwardness\": 0.056549072265625, \"Boredom\": 0.04217529296875, \"Calmness\": 0.08709716796875, \"Concentration\": 0.070556640625, \"Confusion\": 0.06964111328125, \"Contemplation\": 0.0343017578125, \"Contempt\": 0.037689208984375, \"Contentment\": 0.059417724609375, \"Craving\": 0.01132965087890625, \"Desire\": 0.01406097412109375, \"Determination\": 0.1143798828125, \"Disappointment\": 0.051177978515625, \"Disgust\": 0.028594970703125, \"Distress\": 0.054901123046875, \"Doubt\": 0.04638671875, \"Ecstasy\": 0.0258026123046875, \"Embarrassment\": 0.0222015380859375, \"Empathic Pain\": 0.015777587890625, \"Entrancement\": 0.0160980224609375, \"Envy\": 0.0163421630859375, \"Excitement\": 0.129638671875, \"Fear\": 0.03125, \"Guilt\": 0.01483917236328125, \"Horror\": 0.0194549560546875, \"Interest\": 0.1341552734375, \"Joy\": 0.0738525390625, \"Love\": 0.0216522216796875, \"Nostalgia\": 0.0210418701171875, \"Pain\": 0.020721435546875, \"Pride\": 0.05499267578125, \"Realization\": 0.0728759765625, \"Relief\": 0.04052734375, \"Romance\": 0.0129241943359375, \"Sadness\": 0.0254669189453125, \"Satisfaction\": 0.07159423828125, \"Shame\": 0.01495361328125, \"Surprise (negative)\": 0.05560302734375, \"Surprise (positive)\": 0.07965087890625, \"Sympathy\": 0.022247314453125, \"Tiredness\": 0.0194549560546875, \"Triumph\": 0.04107666015625}",
      "metadata": ""
    }
  ]
}
```

chat - wss
stream - wss