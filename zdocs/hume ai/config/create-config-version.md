# Create Config Version

## POST /v0/evi/configs/:id

Updates a Config by creating a new version of the Config.

For more details on configuration options and how to configure EVI, see our configuration guide.

### Path Parameters 

id (string, Required) Identifier for a Config (UUID format)

### Request Parameters

evi_version (string, Required) The version of the EVI used with this config

version_description (string, Optional) An optional description of the Config version

prompt (object, Optional) Identifies which prompt to use in a config or create a new one
  * id (string, Optional) Identifier for a Prompt (UUID format)
  * version (integer, Optional) Version number for a Prompt
  * text (string, Optional) Text used to create a new prompt

voice (object, Optional) Voice specification for this Config version
  * provider (string, Required) Voice provider to use 
    * Options: HUME_AI | CUSTOM_VOICE
  * name (string, Optional) Name of the voice to use
    * Base voices: ITO | KORA | DACHER | AURA | FINN | WHIMSY | STELLA | SUNNY
  * custom_voice (object, Optional) Custom Voice specification
    * name (string, Required) Custom Voice name (max 75 chars)
    * base_voice (enum, Required) Base voice used
      * Options: ITO | KORA | DACHER | AURA | FINN | WHIMSY | STELLA | SUNNY
    * parameter_model (string, Required) Parameter model name
      * Options: 20241004-11parameter
    * parameters (object, Optional) Voice attributes
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

language_model (object, Optional) Supplemental language model configuration
  * model_provider (string, Optional) Provider of the language model
    * Options: OPEN_AI | CUSTOM_LANGUAGE_MODEL | ANTHROPIC | FIREWORKS | GROQ | GOOGLE
  * model_resource (string, Optional) Specific model to use
    * Options: claude-3-5-sonnet-latest | claude-3-5-sonnet-20240620 | claude-3-opus-20240229 | claude-3-sonnet-20240229 | claude-3-haiku-20240307 | claude-2.1 | claude-instant-1.2 | gemini-1.5-pro | gemini-1.5-flash | gpt-4-turbo-preview | gpt-3.5-turbo | gpt-4o | gpt-4o-mini | llama3-8b-8192 | llama3-70b-8192
  * temperature (double, Optional) Model temperature (0 to 1)

ellm_model (object, Optional) eLLM setup configuration
  * allow_short_responses (boolean, Optional) Allow short eLLM responses
    * Default: false

tools (array[object], Optional) List of user-defined tools
  * id (string, Required) Tool identifier (UUID format)
  * version (integer, Optional) Tool version number

builtin_tools (array[object], Optional) List of built-in tools
  * name (string, Required) Name of built-in tool
    * Options: web_search | hang_up
  * fallback_content (string, Optional) Fallback text for tool errors

event_messages (object, Optional) Server event message configuration
  * on_new_chat (object, Optional) New chat message settings
    * enabled (boolean, Required) Enable/disable message
    * text (string, Optional) Custom message text
  * on_inactivity_timeout (object, Optional) Inactivity timeout message
    * enabled (boolean, Required) Enable/disable message
    * text (string, Optional) Custom message text 
  * on_max_duration_timeout (object, Optional) Maximum duration timeout message
    * enabled (boolean, Required) Enable/disable message
    * text (string, Optional) Custom message text

timeouts (object, Optional) Timeout configurations
  * inactivity (object, Optional) Inactivity timeout settings
    * enabled (boolean, Required) Enable/disable timeout
    * duration_secs (integer, Optional) Timeout duration (30-1800 seconds)
  * max_duration (object, Optional) Maximum duration settings
    * enabled (boolean, Required) Enable/disable timeout  
    * duration_secs (integer, Optional) Timeout duration (30-1800 seconds)

### Response

id (string, Required) Config identifier (UUID format)

version (integer, Required) Config version number

evi_version (string, Required) EVI version used

version_description (string, Optional) Config version description

name (string, Required) Config name

created_on (long, Required) Creation timestamp (Unix epoch)

modified_on (long, Required) Last modification timestamp (Unix epoch)

prompt (object, Optional) Associated prompt details
  * id (string, Required) Prompt identifier
  * version (integer, Required) Version number
  * version_type (string, Required) Versioning method
    * Options: FIXED | LATEST
  * name (string, Required) Prompt name
  * created_on (long, Required) Creation timestamp
  * modified_on (long, Required) Modification timestamp
  * text (string, Required) Prompt instructions
  * version_description (string, Optional) Version description

voice (object, Optional) Voice configuration
  * provider (string, Required) Voice provider
    * Options: HUME_AI | CUSTOM_VOICE
  * name (string, Optional) Voice name
  * custom_voice (object, Optional) Custom voice details
    * id (string, Required) Voice identifier
    * version (integer, Required) Version number
    * name (string, Required) Voice name
    * created_on (long, Required) Creation timestamp
    * modified_on (long, Required) Modification timestamp
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

language_model (object, Optional) Language model configuration
  * model_provider (enum, Optional) Language model provider
    * Options: OPEN_AI | CUSTOM_LANGUAGE_MODEL | ANTHROPIC | FIREWORKS | GROQ | GOOGLE
  * model_resource (enum, Optional) Specific model identifier
    * Options: claude-3-5-sonnet-latest | claude-3-5-haiku-latest | claude-3-5-sonnet-20240620 | claude-3-5-haiku-20241022 | claude-3-opus-20240229 | claude-3-sonnet-20240229 | claude-3-haiku-20240307 | claude-2.1 | claude-instant-1.2 | gemini-1.5-pro | gemini-1.5-flash | gemini-1.5-pro-002 | gemini-1.5-flash-002 | gpt-4-turbo-preview | gpt-3.5-turbo-0125 | gpt-3.5-turbo | gpt-4o | gpt-4o-mini | gemma-7b-it | llama3-8b-8192 | llama3-70b-8192 | llama-3.1-70b-versatile | llama-3.1-8b-instant | accounts/fireworks/models/mixtral-8x7b-instruct | accounts/fireworks/models/llama-v3p1-405b-instruct | accounts/fireworks/models/llama-v3p1-70b-instruct | accounts/fireworks/models/llama-v3p1-8b-instruct | ellm
  * temperature (double, Optional) Model temperature (0 to 1)

ellm_model (object, Optional) eLLM configuration
  * allow_short_responses (boolean, Optional) Enable short responses

tools (array[object], Optional) User-defined tools
  * tool_type (string, Required) Tool type
    * Options: BUILTIN | FUNCTION
  * id (string, Required) Tool identifier
  * version (integer, Optional) Version number
  * version_type (string, Optional) Version strategy
    * Options: FIXED | LATEST
  * name (string, Required) Tool name
  * created_on (long, Required) Creation timestamp
  * modified_on (long, Required) Modification timestamp
  * parameters (string, Required) Tool parameters schema
  * version_description (string, Optional) Version description
  * fallback_content (string, Optional) Error fallback text
  * description (string, Optional) Tool description

builtin_tools (array[object], Optional) Built-in tools
  * tool_type (string, Required) Tool type
    * Options: BUILTIN | FUNCTION
  * name (string, Required) Tool name
  * fallback_content (string, Optional) Error fallback text

event_messages (object, Optional) Event message configuration
  * on_new_chat (object, Optional) New chat settings
    * enabled (boolean, Required) Enable message
    * text (string, Optional) Message text
  * on_inactivity_timeout (object, Optional) Inactivity settings
    * enabled (boolean, Required) Enable message
    * text (string, Optional) Message text
  * on_max_duration_timeout (object, Optional) Duration settings
    * enabled (boolean, Required) Enable message
    * text (string, Optional) Message text

timeouts (object, Optional) Connection timeout settings
  * inactivity (object, Optional) Inactivity timeout
    * enabled (boolean, Required) Enable timeout
    * duration_secs (integer, Optional) Timeout duration (30-1800s)

### Example Request

```json
{
  "versionDescription": "Updated weather assistant with enhanced voice configuration",
  "eviVersion": "2",
  "prompt": {
    "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
    "version": 0
  },
  "voice": {
    "provider": "HUME_AI",
    "name": "KORA",
    "custom_voice": {
      "name": "WEATHER_VOICE",
      "base_voice": "KORA",
      "parameter_model": "20241004-11parameter",
      "parameters": {
        "enthusiasm": 50,
        "confidence": 70,
        "buoyancy": 30
      }
    }
  },
  "language_model": {
    "model_provider": "ANTHROPIC",
    "model_resource": "claude-3-5-sonnet-20240620",
    "temperature": 0.7
  },
  "ellm_model": {
    "allow_short_responses": true
  },
  "event_messages": {
    "on_new_chat": {
      "enabled": true,
      "text": "Hello! I'm your weather assistant. How can I help you today?"
    },
    "on_inactivity_timeout": {
      "enabled": true,
      "text": "Are you still there? I'll wait a moment longer for your response."
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

### Example Response

```json
{
  "id": "1b60e1a0-cc59-424a-8d2c-189d354db3f3",
  "version": 1,
  "evi_version": "2",
  "version_description": "Updated weather assistant with enhanced voice configuration",
  "name": "Weather Assistant Config",
  "created_on": 1715275452390,
  "modified_on": 1722642242998,
  "prompt": {
    "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
    "version": 0,
    "version_type": "FIXED",
    "name": "Weather Assistant Prompt",
    "created_on": 1715267200693,
    "modified_on": 1715267200693,
    "text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information...</role>",
    "version_description": ""
  },
  "voice": {
    "provider": "HUME_AI",
    "name": "KORA",
    "custom_voice": {
      "id": "00aa8ee9-c50e-4ea1-9af0-7b08ad451704",
      "version": 1,
      "name": "WEATHER_VOICE",
      "created_on": 1724704587367,
      "modified_on": 1725489961583,
      "base_voice": "KORA",
      "parameter_model": "20241004-11parameter",
      "parameters": {
        "enthusiasm": 50,
        "confidence": 70,
        "buoyancy": 30
      }
    }
  },
  "language_model": {
    "model_provider": "ANTHROPIC",
    "model_resource": "claude-3-5-sonnet-20240620",
    "temperature": 0.7
  },
  "ellm_model": {
    "allow_short_responses": true
  },
  "tools": [],
  "builtin_tools": [],
  "event_messages": {
    "on_new_chat": {
      "enabled": true,
      "text": "Hello! I'm your weather assistant. How can I help you today?"
    },
    "on_inactivity_timeout": {
      "enabled": true,
      "text": "Are you still there? I'll wait a moment longer for your response."
    },
    "on_max_duration_timeout": {
      "enabled": false
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
