# List Config Versions

## GET /v0/evi/configs/:id

Fetches a list of a Config's versions. For more details on configuration options and how to configure EVI, see our configuration guide.

### Path Parameters

id (string, Required) Identifier for a Config (UUID format)

### Query Parameters

page_number (integer, Optional) Specifies the page number to retrieve
  * Uses zero-based indexing (0 is first page)
  * Default: 0

page_size (integer, Optional) Maximum number of results per page
  * Range: 1-100
  * Default: 10

restrict_to_most_recent (boolean, Optional) Whether to return only latest versions
  * Default: false

### Response

total_pages (integer, Required) Total number of pages in the collection

page_number (integer, Required) Current page number (zero-based)

page_size (integer, Required) Maximum items per page

configs_page (array[object], Required) List of configs for current page
  * id (string, Required) Config identifier (UUID format)
  * version (integer, Required) Config version number
  * evi_version (string, Required) EVI version used
  * version_description (string, Optional) Config version description
  * name (string, Required) Config name
  * created_on (long, Required) Creation timestamp (Unix epoch)
  * modified_on (long, Required) Last modification timestamp
  * prompt (object, Optional) Associated prompt details
    * id (string, Required) Prompt identifier
    * version (integer, Required) Prompt version number
    * version_type (string, Required) Version type
      * Options: FIXED | LATEST
    * name (string, Required) Prompt name
    * text (string, Required) Prompt instructions
  * voice (object, Optional) Voice configuration
    * provider (string, Required) Voice provider
      * Options: HUME_AI | CUSTOM_VOICE
    * name (string, Optional) Voice name
    * custom_voice (object, Optional) Custom voice details
  * language_model (object, Optional) Language model settings
  * ellm_model (object, Optional) eLLM configuration
  * tools (array[object], Optional) Tool configurations
  * builtin_tools (array[object], Optional) Built-in tool configurations
  * event_messages (object, Optional) Event message configurations
  * timeouts (object, Optional) Timeout settings

Example response:

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
      "name": "Weather Assistant Config",
      "created_on": 1715275452390,
      "modified_on": 1715275452390,
      "prompt": {
        "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
        "version": 0,
        "version_type": "FIXED",
        "name": "Weather Assistant Prompt",
        "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information...</role>"
      },
      "voice": {
        "provider": "HUME_AI",
        "name": "SAMPLE VOICE",
        "custom_voice": {
          "id": "00aa8ee9-c50e-4ea1-9af0-7b08ad451704",
          "version": 1,
          "base_voice": "KORA",
          "parameter_model": "20241004-11parameter",
          "parameters": {
            "assertiveness": 20,
            "confidence": -40,
            "enthusiasm": 50
          }
        }
      },
      "language_model": {
        "model_provider": "ANTHROPIC",
        "model_resource": "claude-3-5-sonnet-20240620",
        "temperature": 1
      }
    }
  ]
}