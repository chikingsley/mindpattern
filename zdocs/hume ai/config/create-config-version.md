# Create Config Version

## POST /v0/evi/configs/:id

Updates a Config by creating a new version of the Config. For more details on configuration options and how to configure EVI, see our configuration guide.

### Path Parameters

id (string, Required) Identifier for a Config (UUID format)

### Request Parameters

evi_version (string, Required) The version of the EVI used with this config

version_description (string, Optional) An optional description of the Config version

prompt (object, Optional) Identifies which prompt to use in a config
  * id (string, Optional) Identifier for a Prompt (UUID format)
  * version (integer, Optional) Version number for a Prompt
  * text (string, Optional) Text used to create a new prompt

voice (object, Optional) A voice specification associated with this Config version
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

language_model (object, Optional) Supplemental language model configuration
  * model_provider (string, Optional) Provider of the language model
    * Options: OPEN_AI | CUSTOM_LANGUAGE_MODEL | ANTHROPIC | FIREWORKS | GROQ | GOOGLE
  * model_resource (string, Optional) Specific model to use with provider
    * Options: claude-3-5-sonnet-latest | claude-3-5-sonnet-20240620 | claude-3-opus-20240229 | claude-3-sonnet-20240229 | claude-3-haiku-20240307 | claude-2.1 | claude-instant-1.2 | gemini-1.5-pro | gemini-1.5-flash | gpt-4-turbo-preview | gpt-3.5-turbo-0125 | gpt-4o | gpt-4o-mini | llama3-8b-8192 | llama3-70b-8192
  * temperature (double, Optional) Model temperature (0 to 1)

ellm_model (object, Optional) eLLM setup configuration
  * allow_short_responses (boolean, Optional) Allow short eLLM responses

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
  * inactivity (object, Optional) Inactivity timeout settings (30-1800 seconds)
    * enabled (boolean, Required) Enable/disable timeout
    * duration_secs (integer, Optional) Timeout duration
  * max_duration (object, Optional) Maximum duration settings (30-1800 seconds)
    * enabled (boolean, Required) Enable/disable timeout
    * duration_secs (integer, Optional) Timeout duration

### Response

id (string, Required) Config identifier (UUID format)

version (integer, Required) Config version number

evi_version (string, Required) EVI version used

name (string, Required) Config name

created_on (long, Required) Creation timestamp (Unix epoch)

modified_on (long, Required) Last modification timestamp

prompt (object, Optional) Associated prompt details

voice (object, Optional) Voice configuration

language_model (object, Optional) Language model settings

ellm_model (object, Optional) eLLM configuration

tools (array[object], Optional) Tool configurations

builtin_tools (array[object], Optional) Built-in tool configurations

event_messages (object, Optional) Event message configurations

timeouts (object, Optional) Timeout settings

Example request:

```json
{
  "versionDescription": "This is an updated version of the Weather Assistant Config.",
  "eviVersion": "2",
  "prompt": {
    "id": "af699d45-2985-42cc-91b9-af9e5da3bac5",
    "version": 0
  },
  "voice": {
    "provider": "HUME_AI",
    "name": "ITO"
  },
  "languageModel": {
    "modelProvider": "ANTHROPIC",
    "modelResource": "claude-3-5-sonnet-20240620",
    "temperature": 1
  },
  "ellmModel": {
    "allowShortResponses": true
  },
  "eventMessages": {
    "onNewChat": {
      "enabled": false,
      "text": ""
    },
    "onInactivityTimeout": {
      "enabled": false,
      "text": ""
    },
    "onMaxDurationTimeout": {
      "enabled": false,
      "text": ""
    }
  }
}