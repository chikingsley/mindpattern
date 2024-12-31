# Create Custom Voice

## POST /v0/evi/custom_voices

Creates a Custom Voice that can be added to an EVI configuration. Refer to our voices guide for details on creating a custom voice.

### Request Parameters

name (string, Required) The name of the Custom Voice (max 75 chars, converts to uppercase)

base_voice (string, Required) Specifies the base voice used to create the Custom Voice
  * Options: ITO | KORA | DACHER | AURA | FINN | WHIMSY | STELLA | SUNNY

parameter_model (string, Required) The name of the parameter model to use
  * Options: 20241004-11parameter

parameters (object, Optional) The specified attributes of a Custom Voice
  * gender (integer, Optional) Tonality (-100 to 100, default: 0)
    * -100: More masculine
    * 100: More feminine
  * assertiveness (integer, Optional) Firmness (-100 to 100, default: 0)
    * -100: Whiny
    * 100: Bold
  * buoyancy (integer, Optional) Density (-100 to 100, default: 0)
    * -100: Deflated
    * 100: Buoyant
  * confidence (integer, Optional) Assuredness (-100 to 100, default: 0)
    * -100: Shy
    * 100: Confident
  * enthusiasm (integer, Optional) Excitement (-100 to 100, default: 0)
    * -100: Calm
    * 100: Enthusiastic
  * nasality (integer, Optional) Openness (-100 to 100, default: 0)
    * -100: Clear
    * 100: Nasal
  * relaxedness (integer, Optional) Stress level (-100 to 100, default: 0)
    * -100: Tense
    * 100: Relaxed
  * smoothness (integer, Optional) Texture (-100 to 100, default: 0)
    * -100: Smooth
    * 100: Staccato
  * tepidity (integer, Optional) Liveliness (-100 to 100, default: 0)
    * -100: Tepid
    * 100: Vigorous
  * tightness (integer, Optional) Containment (-100 to 100, default: 0)
    * -100: Tight
    * 100: Breathy

### Response

id (string, Required) Identifier for a Custom Voice (UUID format)

version (integer, Required) Version number for a Custom Voice

name (string, Required) The name of the Custom Voice (max 75 chars)

created_on (long, Required) Time at which the Custom Voice was created (Unix epoch)

modified_on (long, Required) Time at which the Custom Voice was last modified (Unix epoch)

base_voice (string, Required) The base voice used to create the Custom Voice
  * Options: ITO | KORA | DACHER | AURA | FINN | WHIMSY | STELLA | SUNNY

parameter_model (string, Required) The name of the parameter model used

parameters (object, Optional) The specified attributes of a Custom Voice

Example request:

```json
{
  "name": "name",
  "baseVoice": "ITO",
  "parameterModel": "20241004-11parameter"
}
```

Example response:

```json
{
  "id": "id",
  "version": 1,
  "name": "name",
  "created_on": 1000000,
  "modified_on": 1000000,
  "base_voice": "ITO",
  "parameter_model": "20241004-11parameter",
  "parameters": {
    "gender": 1,
    "assertiveness": 1,
    "buoyancy": 1,
    "confidence": 1,
    "enthusiasm": 1,
    "nasality": 1,
    "relaxedness": 1,
    "smoothness": 1,
    "tepidity": 1,
    "tightness": 1
  }
}