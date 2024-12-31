# Create Tool

## POST /v0/evi/tools

Creates a Tool that can be added to an EVI configuration. Refer to our tool use guide for comprehensive instructions on defining and integrating tools into EVI.

### Request Parameters

name (string, Required) Name applied to all versions of a particular Tool

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
  "name": "get_current_weather",
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
  "versionDescription": "Fetches current weather and uses celsius or fahrenheit based on location of user.",
  "description": "This tool is for getting the current weather.",
  "fallbackContent": "Unable to fetch current weather."
}
```

Example response:

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