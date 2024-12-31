# Create Prompt Version

## POST /v0/evi/prompts/:id

Updates a Prompt by creating a new version of the Prompt. See our prompting guide for tips on crafting your system prompt.

### Path Parameters

id (string, Required) Identifier for a Prompt (UUID format)

### Request Parameters

text (string, Required) Instructions used to shape EVI's behavior, responses, and style for this version of the Prompt

version_description (string, Optional) An optional description of the Prompt version

### Response

id (string, Required) Identifier for a Prompt (UUID format)

version (integer, Required) Version number for a Prompt

version_type (string, Required) Versioning method for a Prompt
  * Options: FIXED | LATEST

name (string, Required) Name applied to all versions of a particular Prompt

created_on (long, Required) Time at which the Prompt was created (Unix epoch)

modified_on (long, Required) Time at which the Prompt was last modified (Unix epoch)

text (string, Required) Instructions used to shape EVI's behavior, responses, and style

version_description (string, Optional) An optional description of the Prompt version

Example request:

```json
{
  "text": "<role>You are an updated version of an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
  "version_description": "This is an updated version of the Weather Assistant Prompt."
}
```

Example response:

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