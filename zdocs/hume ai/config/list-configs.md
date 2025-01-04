# List Configs

## GET /v0/evi/configs

Fetches a paginated list of Configs. For more details on configuration options and how to configure EVI, see our configuration guide.

### Query Parameters

page_number (integer, Optional) Page number for pagination
* Uses zero-based indexing (0 is first page)
* Example: page_number=0 retrieves items 0-9 with page_size=10
* Default: 0

page_size (integer, Optional) Maximum results per page
* Range: 1-100
* Example: page_size=10 includes up to 10 items per page
* Default: 10

restrict_to_most_recent (boolean, Optional) Whether to return only latest versions
* Default: false
* Set to true to return only the latest version of each config

name (string, Optional) Filter configs by name

### Response

total_pages (integer, Required) Total number of pages

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
    * version (integer, Required) Version number
    * version_type (string, Required) Version type
      * Options: FIXED | LATEST
    * name (string, Required) Prompt name
    * text (string, Required) Prompt instructions
  * voice (object, Optional) Voice configuration
    * provider (string, Required) Voice provider
      * Options: HUME_AI | CUSTOM_VOICE
    * name (string, Optional) Voice name
    * custom_voice (object, Optional) Custom voice details
      * id (string, Required) Voice identifier
      * version (integer, Required) Version number
      * name (string, Required) Voice name
      * base_voice (string, Required) Base voice used
      * parameter_model (string, Required) Parameter model name
      * parameters (object, Optional) Voice parameters
        * gender (integer, Optional) Voice tonality (-100 to 100)
        * assertiveness (integer, Optional) Voice firmness (-100 to 100)
        * buoyancy (integer, Optional) Voice density (-100 to 100)
        * confidence (integer, Optional) Voice assuredness (-100 to 100)
        * enthusiasm (integer, Optional) Voice excitement (-100 to 100)
        * nasality (integer, Optional) Voice openness (-100 to 100)
        * relaxedness (integer, Optional) Voice stress level (-100 to 100)
        * smoothness (integer, Optional) Voice texture (-100 to 100)
        * tepidity (integer, Optional) Voice liveliness (-100 to 100)
        * tightness (integer, Optional) Voice containment (-100 to 100)
  * language_model (object, Optional) Language model configuration
    * model_provider (string, Optional) Model provider
      * Options: OPEN_AI | CUSTOM_LANGUAGE_MODEL | ANTHROPIC | FIREWORKS | GROQ | GOOGLE
    * model_resource (string, Optional) Model identifier
    * temperature (double, Optional) Model temperature (0 to 1)
  * ellm_model (object, Optional) eLLM configuration
    * allow_short_responses (boolean, Optional) Enable short responses
  * tools (array[object], Optional) User-defined tools
  * builtin_tools (array[object], Optional) Built-in tools
  * event_messages (object, Optional) Event message configuration
    * on_new_chat (object, Optional) New chat settings
    * on_inactivity_timeout (object, Optional) Inactivity settings
    * on_max_duration_timeout (object, Optional) Duration settings
  * timeouts (object, Optional) Timeout settings
    * inactivity (object, Optional) Inactivity configuration
    * max_duration (object, Optional) Maximum duration configuration

### Example Request

```typescript
import { HumeClient } from "hume";
const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.listConfigs({
    pageNumber: 0,
    pageSize: 1
});
```

### Example Response

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
        "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information...</role>",
        "version_description": ""
      },
      "voice": {
        "provider": "HUME_AI",
        "name": "SAMPLE VOICE",
        "custom_voice": {
          "id": "00aa8ee9-c50e-4ea1-9af0-7b08ad451704",
          "version": 1,
          "name": "SAMPLE VOICE",
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