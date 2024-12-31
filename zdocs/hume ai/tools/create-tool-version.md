# Create Tool Version

## POST /v0/evi/tools/:id

Updates a Tool by creating a new version of the Tool. Refer to our tool use guide for comprehensive instructions on defining and integrating tools into EVI.

### Path Parameters

id (string, Required) Identifier for a Tool (UUID format)

### Request Parameters

parameters (string, Required) Stringified JSON defining the parameters used by this version of the Tool

version_description (string, Optional) An optional description of the Tool version

description (string, Optional) An optional description of what the Tool does, used by the supplemental LLM to choose when and how to call the function

fallback_content (string, Optional) Optional text passed to the supplemental LLM in place of the tool call result

### Response

tool_type (string, Required) Type of Tool
  * Options: BUILTIN | FUNCTION

id (string, Required) Identifier for a Tool (UUID format)

version (integer, Required) Version number for a Tool

version_type (string, Required) Versioning method for a Tool
  * Options: FIXED | LATEST

name (string, Required) Name applied to all versions of a particular Tool

created_on (long, Required) Time at which the Tool was created (Unix epoch)

modified_on (long, Required) Time at which the Tool was last modified (Unix epoch)

parameters (string, Required) Stringified JSON defining the parameters used by this version of the Tool

version_description (string, Optional) An optional description of the Tool version

fallback_content (string, Optional) Optional text passed to the supplemental LLM in place of the tool call result

description (string, Optional) An optional description of what the Tool does

Example request:

```json
{
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\", \"kelvin\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
  "versionDescription": "Fetches current weather and uses celsius, fahrenheit, or kelvin based on location of user.",
  "fallbackContent": "Unable to fetch current weather.",
  "description": "This tool is for getting the current weather."
}
```

Example response:

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