# Update Prompt Description

## PATCH /v0/evi/prompts/:id/version/:version

Updates the description of a Prompt. See our prompting guide for tips on crafting your system prompt.

### Path Parameters

id (string, Required) Identifier for a Prompt (UUID format)

version (integer, Required) Version number for a Prompt
* Version numbers increment with each update
* Supports iterative development and version control
* Allows reverting to previous versions if needed

### Request Parameters

version_description (string, Optional) Description of the Prompt version

### Response

id (string, Required) Prompt identifier (UUID format)

version (integer, Required) Version number

version_type (string, Required) Version type
* Options: FIXED | LATEST
* FIXED: Uses fixed version number
* LATEST: Auto-updates to latest version

name (string, Required) Prompt name

created_on (long, Required) Creation timestamp (Unix epoch)

modified_on (long, Required) Last modification timestamp

text (string, Required) Prompt instructions for EVI's behavior and style
* Defines EVI's role and behavior
* Examples: customer support, fitness coach, travel advisor

version_description (string, Optional) Version description

### Example Request

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.prompts.updatePromptDescription(
    "af699d45-2985-42cc-91b9-af9e5da3bac5",
    1,
    {
        versionDescription: "This is an updated version_description."
    }
);
```

### Example Response

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