# OpenAI Realtime API (Beta)

Communicate with a GPT-4o class model in real time using WebRTC or WebSockets. Supports text and audio inputs and outputs, along with audio transcriptions.

## Session Tokens

REST API endpoint to generate ephemeral session tokens for use in client-side applications.

### Create Session (POST /v1/realtime/sessions)

Create an ephemeral API token for use in client-side applications with the Realtime API. Can be configured with the same session parameters as the session.update client event.

* modalities (array, Optional) The set of modalities the model can respond with. To disable audio, set this to ["text"]
* model (string, Required) The Realtime model used for this session
* instructions (string, Optional) The default system instructions (i.e. system message) prepended to model calls
  * Guides model on response content and format (e.g. "be extremely succinct", "act friendly")
  * Can guide audio behavior (e.g. "talk quickly", "inject emotion into your voice")
  * Not guaranteed to be followed but provides guidance
  * Server sets default instructions if not specified
* voice (string, Optional) The voice the model uses to respond. Cannot be changed during session once model has responded with audio
  * Options: alloy | ash | ballad | coral | echo | sage | shimmer | verse
* input_audio_format (string, Optional) The format of input audio
  * Options: pcm16 | g711_ulaw | g711_alaw
* output_audio_format (string, Optional) The format of output audio
  * Options: pcm16 | g711_ulaw | g711_alaw
* input_audio_transcription (object, Optional) Configuration for input audio transcription
  * model (string, Optional) The model to use for transcription, whisper-1 is the only currently supported model
* turn_detection (object, Optional) Configuration for turn detection
  * type (string) Type of turn detection, only server_vad is currently supported
  * threshold (number) Activation threshold for VAD (0.0 to 1.0), defaults to 0.5
  * prefix_padding_ms (integer) Amount of audio to include before VAD detected speech, defaults to 300ms
  * silence_duration_ms (integer) Duration of silence to detect speech stop, defaults to 500ms
* tools (array, Optional) Tools (functions) available to the model
  * name (string, Required) The name of the function to be called
  * description (string, Optional) A description of what the function does
  * parameters (object, Required) The parameters the function accepts, described as a JSON Schema object
* tool_choice (string, Optional) How the model chooses tools
  * Options: auto | none | required | {function object}
* temperature (number, Optional) Sampling temperature for the model, limited to [0.6, 1.2]. Defaults to 0.8
* max_response_output_tokens (integer or "inf", Optional) Maximum number of output tokens for a single assistant response

Example request:
```bash
curl -X POST https://api.openai.com/v1/realtime/sessions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-realtime-preview-2024-12-17",
    "modalities": ["audio", "text"],
    "instructions": "You are a friendly assistant."
  }'
```

Example response:
```json
{
  "id": "sess_001",
  "object": "realtime.session",
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "modalities": ["audio", "text"],
  "instructions": "You are a friendly assistant.",
  "voice": "alloy",
  "input_audio_format": "pcm16",
  "output_audio_format": "pcm16",
  "input_audio_transcription": {
      "model": "whisper-1"
  },
  "turn_detection": null,
  "tools": [],
  "tool_choice": "none",
  "temperature": 0.7,
  "max_response_output_tokens": 200,
  "client_secret": {
    "value": "ek_abc123", 
    "expires_at": 1234567890
  }
}
```

### The Session Object

* id (string, Required) Unique identifier for the session
* object (string, Required) Type identifier, always "realtime.session"
* model (string, Required) The Realtime model used for this session
* modalities (array, Required) The set of modalities the model can respond with
* instructions (string, Optional) The default system instructions
* voice (string, Optional) The voice the model uses to respond
* input_audio_format (string, Optional) The format of input audio
* output_audio_format (string, Optional) The format of output audio
* input_audio_transcription (object, Optional) Configuration for input audio transcription
* turn_detection (object, Optional) Configuration for turn detection
* tools (array, Optional) Tools (functions) available to the model
* tool_choice (string, Optional) How the model chooses tools
* temperature (number, Optional) Sampling temperature for the model
* max_response_output_tokens (integer or "inf", Optional) Maximum number of output tokens
* client_secret (object, Required) Ephemeral key information
  * value (string, Required) Ephemeral key usable in client environments
  * expires_at (integer, Required) Timestamp for when the token expires

Example:
```json
{
  "id": "sess_001",
  "object": "realtime.session",
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "modalities": ["audio", "text"],
  "instructions": "You are a friendly assistant.",
  "voice": "alloy",
  "input_audio_format": "pcm16",
  "output_audio_format": "pcm16",
  "input_audio_transcription": {
      "model": "whisper-1"
  },
  "turn_detection": null,
  "tools": [],
  "tool_choice": "none",
  "temperature": 0.7,
  "max_response_output_tokens": 200,
  "client_secret": {
    "value": "ek_abc123", 
    "expires_at": 1234567890
  }
}
```

## Client Events

Events that the OpenAI Realtime WebSocket server will accept from the client.

### session.update

Send this event to update the session's default configuration.

* event_id (string, Optional) Client-generated ID used to identify this event
* type (string, Required) The event type, must be "session.update"
* session (object, Required) Realtime session object configuration
  * modalities (array, Optional) The set of modalities the model can respond with
  * model (string, Optional) The Realtime model used for this session
  * instructions (string, Optional) The default system instructions
  * voice (string, Optional) The voice the model uses to respond
  * input_audio_format (string, Optional) The format of input audio
  * output_audio_format (string, Optional) The format of output audio
  * input_audio_transcription (object, Optional) Configuration for input audio transcription
  * turn_detection (object, Optional) Configuration for turn detection
  * tools (array, Optional) Tools (functions) available to the model
  * tool_choice (string, Optional) How the model chooses tools
  * temperature (number, Optional) Sampling temperature for the model
  * max_response_output_tokens (integer or "inf", Optional) Maximum number of output tokens

Example:
```json
{
    "event_id": "event_123",
    "type": "session.update",
    "session": {
        "modalities": ["text", "audio"],
        "instructions": "You are a helpful assistant.",
        "voice": "sage",
        "input_audio_format": "pcm16",
        "output_audio_format": "pcm16",
        "input_audio_transcription": {
            "model": "whisper-1"
        },
        "turn_detection": {
            "type": "server_vad",
            "threshold": 0.5,
            "prefix_padding_ms": 300,
            "silence_duration_ms": 500,
            "create_response": true
        },
        "tools": [
            {
                "type": "function",
                "name": "get_weather",
                "description": "Get the current weather...",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": { "type": "string" }
                    },
                    "required": ["location"]
                }
            }
        ],
        "tool_choice": "auto",
        "temperature": 0.8,
        "max_response_output_tokens": "inf"
    }
}
```

### input_audio_buffer.append

Send this event to append audio bytes to the input audio buffer.

* event_id (string, Optional) Client-generated ID used to identify this event
* type (string, Required) The event type, must be "input_audio_buffer.append"
* audio (string, Required) Base64-encoded audio bytes in the format specified by input_audio_format

Example:
```json
{
    "event_id": "event_456",
    "type": "input_audio_buffer.append",
    "audio": "Base64EncodedAudioData"
}
```

### input_audio_buffer.commit

Send this event to commit the user input audio buffer.

* event_id (string, Optional) Client-generated ID used to identify this event
* type (string, Required) The event type, must be "input_audio_buffer.commit"

Example:
```json
{
    "event_id": "event_789",
    "type": "input_audio_buffer.commit"
}
```

### input_audio_buffer.clear

Send this event to clear the audio bytes in the buffer.

* event_id (string, Optional) Client-generated ID used to identify this event
* type (string, Required) The event type, must be "input_audio_buffer.clear"

Example:
```json
{
    "event_id": "event_012",
    "type": "input_audio_buffer.clear"
}
```

### conversation.item.create

Add a new Item to the Conversation's context.

* event_id (string, Optional) Client-generated ID used to identify this event
* type (string, Required) The event type, must be "conversation.item.create"
* previous_item_id (string, Optional) The ID of the preceding item after which the new item will be inserted
* item (object, Required) The item to add to the conversation
  * id (string, Optional) The unique ID of the item
  * type (string, Required) The type of the item (message, function_call, function_call_output)
  * object (string, Required) Identifier for the API object - always "realtime.item"
  * status (string, Required) The status of the item (completed, incomplete)
  * role (string, Required) The role of the message sender (user, assistant, system)
  * content (array, Required) The content of the message
    * type (string, Required) The content type (input_text, input_audio, item_reference, text)
    * text (string, Optional) The text content
    * id (string, Optional) ID of a previous conversation item to reference
    * audio (string, Optional) Base64-encoded audio bytes
    * transcript (string, Optional) The transcript of the audio
  * call_id (string, Optional) The ID of the function call
  * name (string, Optional) The name of the function being called
  * arguments (string, Optional) The arguments of the function call
  * output (string, Optional) The output of the function call

Example:
```json
{
    "event_id": "event_345",
    "type": "conversation.item.create",
    "previous_item_id": null,
    "item": {
        "id": "msg_001",
        "type": "message",
        "role": "user",
        "content": [
            {
                "type": "input_text",
                "text": "Hello, how are you?"
            }
        ]
    }
}
```

### conversation.item.truncate

Send this event to truncate a previous assistant message's audio.

* event_id (string, Optional) Client-generated ID used to identify this event
* type (string, Required) The event type, must be "conversation.item.truncate"
* item_id (string, Required) The ID of the assistant message item to truncate
* content_index (integer, Required) The index of the content part to truncate
* audio_end_ms (integer, Required) Inclusive duration up to which audio is truncated

Example:
```json
{
    "event_id": "event_678",
    "type": "conversation.item.truncate",
    "item_id": "msg_002",
    "content_index": 0,
    "audio_end_ms": 1500
}
```

### conversation.item.delete

Send this event to remove any item from the conversation history.

* event_id (string, Optional) Client-generated ID used to identify this event
* type (string, Required) The event type, must be "conversation.item.delete"
* item_id (string, Required) The ID of the item to delete

Example:
```json
{
    "event_id": "event_901",
    "type": "conversation.item.delete",
    "item_id": "msg_003"
}
```

### response.create

This event instructs the server to create a Response.

* event_id (string, Optional) Client-generated ID used to identify this event
* type (string, Required) The event type, must be "response.create"
* response (object, Required) Create a new Realtime response with these parameters
  * modalities (array, Optional) The set of modalities for the response
  * instructions (string, Optional) Instructions for this response
  * voice (string, Optional) Voice to use for this response
  * output_audio_format (string, Optional) Audio format for this response
  * tools (array, Optional) Tools available for this response
  * tool_choice (string, Optional) How tools should be chosen
  * temperature (number, Optional) Temperature for this response
  * max_output_tokens (integer, Optional) Maximum tokens for this response

Example:
```json
{
    "event_id": "event_234",
    "type": "response.create",
    "response": {
        "modalities": ["text", "audio"],
        "instructions": "Please assist the user.",
        "voice": "sage",
        "output_audio_format": "pcm16",
        "tools": [
            {
                "type": "function",
                "name": "calculate_sum",
                "description": "Calculates the sum of two numbers.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "a": { "type": "number" },
                        "b": { "type": "number" }
                    },
                    "required": ["a", "b"]
                }
            }
        ],
        "tool_choice": "auto",
        "temperature": 0.8,
        "max_output_tokens": 1024
    }
}
```

### response.cancel

Send this event to cancel an in-progress response.

* event_id (string, Optional) Client-generated ID used to identify this event
* type (string, Required) The event type, must be "response.cancel"
* response_id (string, Optional) A specific response ID to cancel

Example:
```json
{
    "event_id": "event_567",
    "type": "response.cancel"
}
```

## Server Events

Events emitted from the OpenAI Realtime WebSocket server to the client.

### error

Returned when an error occurs.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "error"
* error (object, Required) Details of the error
  * type (string, Required) The type of error
  * code (string, Optional) Error code
  * message (string, Required) A human-readable error message
  * param (string, Optional) Parameter related to the error
  * event_id (string, Optional) The event_id of the client event that caused the error

Example:
```json
{
    "event_id": "event_890",
    "type": "error",
    "error": {
        "type": "invalid_request_error",
        "code": "invalid_event",
        "message": "The 'type' field is missing.",
        "param": null,
        "event_id": "event_567"
    }
}
```

### session.created

Returned when a Session is created.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "session.created"
* session (object, Required) Realtime session object configuration
  * id (string, Required) Unique identifier for the session
  * modalities (array, Required) The set of modalities
  * model (string, Required) The Realtime model used
  * instructions (string, Optional) The default system instructions
  * voice (string, Optional) The voice used
  * input_audio_format (string, Optional) Input audio format
  * output_audio_format (string, Optional) Output audio format
  * input_audio_transcription (object, Optional) Transcription configuration
  * turn_detection (object, Optional) Turn detection configuration
  * tools (array, Optional) Available tools
  * tool_choice (string, Optional) Tool choice configuration
  * temperature (number, Optional) Sampling temperature
  * max_response_output_tokens (integer or "inf", Optional) Maximum output tokens

Example:
```json
{
    "event_id": "event_1234",
    "type": "session.created",
    "session": {
        "id": "sess_001",
        "object": "realtime.session",
        "model": "gpt-4o-realtime-preview-2024-12-17",
        "modalities": ["text", "audio"],
        "instructions": "...model instructions here...",
        "voice": "sage",
        "input_audio_format": "pcm16",
        "output_audio_format": "pcm16",
        "input_audio_transcription": null,
        "turn_detection": {
            "type": "server_vad",
            "threshold": 0.5,
            "prefix_padding_ms": 300,
            "silence_duration_ms": 200
        },
        "tools": [],
        "tool_choice": "auto",
        "temperature": 0.8,
        "max_response_output_tokens": "inf"
    }
}
```

### session.updated

Returned when a session is updated.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "session.updated"
* session (object, Required) Updated session configuration
  * (Same fields as session.created)

Example:
```json
{
    "event_id": "event_5678",
    "type": "session.updated",
    "session": {
        "id": "sess_001",
        "object": "realtime.session",
        "model": "gpt-4o-realtime-preview-2024-12-17",
        "modalities": ["text"],
        "instructions": "New instructions",
        "voice": "sage",
        "input_audio_format": "pcm16",
        "output_audio_format": "pcm16",
        "input_audio_transcription": {
            "model": "whisper-1"
        },
        "turn_detection": null,
        "tools": [],
        "tool_choice": "none",
        "temperature": 0.7,
        "max_response_output_tokens": 200
    }
}
```

### conversation.created

Returned when a conversation is created.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "conversation.created"
* conversation (object, Required) The conversation resource
  * id (string, Required) The unique ID of the conversation
  * object (string, Required) The object type, must be "realtime.conversation"

Example:
```json
{
    "event_id": "event_9101",
    "type": "conversation.created",
    "conversation": {
        "id": "conv_001",
        "object": "realtime.conversation"
    }
}
```

### conversation.item.created

Returned when a conversation item is created.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "conversation.item.created"
* previous_item_id (string, Optional) The ID of the preceding item
* item (object, Required) The created item
  * id (string, Required) The unique ID of the item
  * type (string, Required) The type of the item
  * object (string, Required) Always "realtime.item"
  * status (string, Required) The status of the item
  * role (string, Optional) The role of the message sender
  * content (array, Optional) The content of the message
  * call_id (string, Optional) The ID of the function call
  * name (string, Optional) The name of the function
  * arguments (string, Optional) The function arguments
  * output (string, Optional) The function output

Example:
```json
{
    "event_id": "event_1920",
    "type": "conversation.item.created",
    "previous_item_id": "msg_002",
    "item": {
        "id": "msg_003",
        "object": "realtime.item",
        "type": "message",
        "status": "completed",
        "role": "user",
        "content": [
            {
                "type": "input_audio",
                "transcript": "hello how are you",
                "audio": "base64encodedaudio=="
            }
        ]
    }
}
```

### conversation.item.input_audio_transcription.completed

Returned when input audio transcription is completed.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "conversation.item.input_audio_transcription.completed"
* item_id (string, Required) The ID of the user message item
* content_index (integer, Required) The index of the content part
* transcript (string, Required) The transcribed text

Example:
```json
{
    "event_id": "event_2122",
    "type": "conversation.item.input_audio_transcription.completed",
    "item_id": "msg_003",
    "content_index": 0,
    "transcript": "Hello, how are you?"
}
```

### conversation.item.input_audio_transcription.failed

Returned when input audio transcription fails.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "conversation.item.input_audio_transcription.failed"
* item_id (string, Required) The ID of the user message item
* content_index (integer, Required) The index of the content part
* error (object, Required) Details of the transcription error
  * type (string, Required) The type of error
  * code (string, Optional) Error code
  * message (string, Required) Error message
  * param (string, Optional) Related parameter

Example:
```json
{
    "event_id": "event_2324",
    "type": "conversation.item.input_audio_transcription.failed",
    "item_id": "msg_003",
    "content_index": 0,
    "error": {
        "type": "transcription_error",
        "code": "audio_unintelligible",
        "message": "The audio could not be transcribed.",
        "param": null
    }
}
```

### conversation.item.truncated

Returned when an assistant audio message is truncated.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "conversation.item.truncated"
* item_id (string, Required) The ID of the truncated message
* content_index (integer, Required) The index of the content part
* audio_end_ms (integer, Required) The duration up to which audio was truncated

Example:
```json
{
    "event_id": "event_2526",
    "type": "conversation.item.truncated",
    "item_id": "msg_004",
    "content_index": 0,
    "audio_end_ms": 1500
}
```

### conversation.item.deleted

Returned when a conversation item is deleted.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "conversation.item.deleted"
* item_id (string, Required) The ID of the deleted item

Example:
```json
{
    "event_id": "event_2728",
    "type": "conversation.item.deleted",
    "item_id": "msg_005"
}
```

### input_audio_buffer.committed

Returned when an input audio buffer is committed.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "input_audio_buffer.committed"
* previous_item_id (string, Optional) The ID of the preceding item
* item_id (string, Required) The ID of the created user message item

Example:
```json
{
    "event_id": "event_1121",
    "type": "input_audio_buffer.committed",
    "previous_item_id": "msg_001",
    "item_id": "msg_002"
}
```

### input_audio_buffer.cleared

Returned when the input audio buffer is cleared.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "input_audio_buffer.cleared"

Example:
```json
{
    "event_id": "event_1314",
    "type": "input_audio_buffer.cleared"
}
```

### input_audio_buffer.speech_started

Sent when speech is detected in server_vad mode.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "input_audio_buffer.speech_started"
* audio_start_ms (integer, Required) Milliseconds from start when speech was detected
* item_id (string, Required) The ID of the user message item that will be created

Example:
```json
{
    "event_id": "event_1516",
    "type": "input_audio_buffer.speech_started",
    "audio_start_ms": 1000,
    "item_id": "msg_003"
}
```

### input_audio_buffer.speech_stopped

Returned when speech ends in server_vad mode.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "input_audio_buffer.speech_stopped"
* audio_end_ms (integer, Required) Milliseconds when speech stopped
* item_id (string, Required) The ID of the user message item

Example:
```json
{
    "event_id": "event_1718",
    "type": "input_audio_buffer.speech_stopped",
    "audio_end_ms": 2000,
    "item_id": "msg_003"
}
```

### response.created

Returned when a new Response is created.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "response.created"
* response (object, Required) The response resource
  * id (string, Required) The unique ID of the response
  * object (string, Required) Must be "realtime.response"
  * status (string, Required) The status of the response
  * status_details (object, Optional) Additional status details
  * output (array, Required) The list of output items
  * metadata (object, Optional) Developer-provided key-value pairs
  * usage (object, Optional) Usage statistics for the Response

Example:
```json
{
    "event_id": "event_2930",
    "type": "response.created",
    "response": {
        "id": "resp_001",
        "object": "realtime.response",
        "status": "in_progress",
        "status_details": null,
        "output": [],
        "usage": null
    }
}
```

### response.done

Returned when a Response is done streaming.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "response.done"
* response (object, Required) The response resource
  * (Same fields as response.created)

Example:
```json
{
    "event_id": "event_3132",
    "type": "response.done",
    "response": {
        "id": "resp_001",
        "object": "realtime.response",
        "status": "completed",
        "status_details": null,
        "output": [
            {
                "id": "msg_006",
                "object": "realtime.item",
                "type": "message",
                "status": "completed",
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "Sure, how can I assist you today?"
                    }
                ]
            }
        ],
        "usage": {
            "total_tokens": 275,
            "input_tokens": 127,
            "output_tokens": 148,
            "input_token_details": {
                "cached_tokens": 384,
                "text_tokens": 119,
                "audio_tokens": 8,
                "cached_tokens_details": {
                    "text_tokens": 128,
                    "audio_tokens": 256
                }
            },
            "output_token_details": {
                "text_tokens": 36,
                "audio_tokens": 112
            }
        }
    }
}
```

### response.output_item.added

Returned when a new Item is created during Response generation.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "response.output_item.added"
* response_id (string, Required) The ID of the Response
* output_index (integer, Required) The index of the output item
* item (object, Required) The created item
  * (Same fields as conversation.item.created)

Example:
```json
{
    "event_id": "event_3334",
    "type": "response.output_item.added",
    "response_id": "resp_001",
    "output_index": 0,
    "item": {
        "id": "msg_007",
        "object": "realtime.item",
        "type": "message",
        "status": "in_progress",
        "role": "assistant",
        "content": []
    }
}
```

### response.output_item.done

Returned when an Item is done streaming.

* event_id (string, Required) The unique ID of the server event
* type (string, Required) The event type, must be "response.output_item.done"
* response_id (string, Required) The ID of the Response
* output_index (integer, Required) The index of the output item
* item (object, Required) The completed item
  * (Same fields as conversation.item.created)

Example:
```json
{
    "event_id": "event_3536",
    "type": "response.output_item.done",
    "response_id": "resp_001",
    "output_index": 0,
    "item": {
        "id": "msg_007",
        "object": "realtime.item",
        "type": "message",
        "status": "completed",
        "role": "assistant",
        "content": [
            {
                "type": "text",
