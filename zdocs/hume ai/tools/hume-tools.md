# Tool Use

## Guide to using function calling with the Empathic Voice Interface (EVI)

EVI simplifies the integration of external APIs through function calling. Developers can integrate custom functions that are invoked dynamically based on the user's input, enabling more useful conversations. There are two key concepts for using function calling with EVI: Tools and Configurations (Configs):

* **Tools** are resources that EVI uses to do things, like search the web or call external APIs. For example, tools can check the weather, update databases, schedule appointments, or take actions based on what occurs in the conversation. While the tools can be user-defined, Hume also offers natively implemented tools, like web search, which are labeled as "built-in" tools.

* **Configurations** enable developers to customize an EVI's behavior and incorporate these custom tools. Setting up an EVI configuration allows developers to seamlessly integrate their tools into the voice interface. A configuration includes prompts, user-defined tools, and other settings.

Currently, our function calling feature only supports OpenAI and Anthropic models. For the best results, we suggest choosing a fast and intelligent LLM that performs well on function calling benchmarks. On account of its speed and intelligence, we recommend Claude 3.5 Haiku as the supplemental LLM in your EVI configuration when using tools. Function calling is not available if you are using your own custom language model. We plan to support more function calling LLMs in the future.

The focus of this guide is on creating a Tool and a Configuration that allows EVI to use the Tool. Additionally, this guide details the message flow of function calls within a session, and outlines the expected responses when function calls fail. Refer to our Configuration Guide for detailed, step-by-step instructions on how to create and use an EVI Configuration.

Explore these sample projects to see how Tool use can be implemented in TypeScript, Next.js, and Python.

## Setup

For EVI to leverage tools or call functions, a configuration must be created with the tool's definition. Our step-by-step guide below walks you through creating a tool and adding it to a configuration, using either a no-code approach through our Portal or a full-code approach through our API.

### 1. Create a Tool

We will first create a Tool with a specified function. In this example, we will create a tool for getting the weather. Create this tool by making a POST request to `/tools` using the following request body:

#### Request body
```json
{
  "name": "get_current_weather",
  "version_description": "Fetches current weather and uses celsius or fahrenheit based on user's location.",
  "description": "This tool is for getting the current weather.",
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }"
}
```

The parameters field must contain a valid JSON schema.

#### Sample response body
```json
{
  "id": "3a60e85c-d04f-4eb5-8076-fb4bd344d5d0",
  "version": 0,
  "version_description": null,
  "name": "Web Search Config",
  "created_on": 1714421925626,
  "modified_on": 1714421925626,
  "prompt": null,
  "voice": null,
  "language_model": {
    "model_provider": "OPEN_AI",
    "model_resource": "gpt-3.5-turbo",
    "temperature": null
  },
  "tools": [],
  "builtin_tools": [
    {
      "tool_type": "BUILTIN",
      "name": "web_search",
      "fallback_content": "Optional fallback content to inform EVI's spoken response if web search is not successful."
    }
  ]
}
```

### 2. EVI uses built-in tool

Now that we've created an EVI configuration which includes the built-in web search tool, let's test it out in the EVI Playground. Try asking EVI a question that requires web search, like "what is the latest news with AI research?"

Let's review the message flow for when web search is invoked.

#### Web search message flow
```json
// 1. User asks EVI for the latest news in AI research
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What is the latest news with AI research?"
  }
}

// 2. EVI infers it needs to use web search, generates a search query, and invokes Hume's native web search function
{
  "name": "web_search", 
  "parameters": "{\"query\":\"latest news AI research\"}", 
  "tool_call_id": "call_zt1NYGpPkhR7v4kb4RPxTkLn", 
  "type": "tool_call", 
  "tool_type": "builtin", 
  "response_required": false
}

// 3. EVI sends back the web search results 
{
  "type": "tool_response", 
  "tool_call_id": "call_zt1NYGpPkhR7v4kb4RPxTkLn", 
  "content": "{ \"summary\":null, \"references\": [{\"content\":\"Researchers have demonstrated a new method...etc.\", \"url\":\"https://www.sciencedaily.com/news/computers_math/artificial_intelligence/\", \"name\":\"Artificial Intelligence News -- ScienceDaily\"}] }", 
  "tool_name": "web_search", 
  "tool_type": "builtin"
}

// 4. EVI sends a response generated from the web search results
{
  "type": "assistant_message", 
  "message": {
    "role": "assistant", 
    "content": "Oh, there's some interesting stuff happening in AI research right now."
  }
},
{
  "type": "assistant_message", 
  "message": {
    "role": "assistant", 
    "content": "Just a few hours ago, researchers demonstrated a new method using AI and computer simulations to train robotic exoskeletons."
  }
}
```

## Interruptibility

Function calls can be interrupted to cancel them or to resend them with updated parameters.

### Canceling a function call

Just as EVI is able to infer when to make a function call, it can also infer from the user's input when to cancel one. Here is an overview of what the message flow would look like:

#### Cancel function call message flow
```json
// 1. User asks what the weather is in New York
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What's the weather in New York?"
  }
}

// 2. EVI infers it is time to make a function call
{
  "type": "tool_call",
  "tool_type": "function",
  "response_required": true,
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"New York\",\"format\":\"fahrenheit\"}"
}

// 3. User communicates sudden disinterest in the weather
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "Actually, never mind."
  }
}

// 4. EVI infers the function call should be canceled
{
  "type": "assistant_message",
  "message": {
    "role": "assistant",
    "content": "If you change your mind or need any weather information in the future, feel free to let me know."
  }
}
```

### Updating a function call

Sometimes we don't necessarily want to cancel the function call, and instead want to update the parameters. EVI can infer the difference. Below is a sample flow of interrupting the interface to update the parameters of the function call:

#### Update function call message flow
```json
// 1. User asks EVI what the weather is in New York
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What's the weather in New York?"
  }
}

// 2. EVI infers it is time to make a function call
{
  "type": "tool_call",
  "tool_type": "function",
  "response_required": true,
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"New York\",\"format\":\"fahrenheit\"}"
}

// 3. User communicates to EVI they want the weather in Los Angeles instead
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "Actually, Los Angeles."
  }
}

// 4. EVI infers the parameters to function call should be updated
{
  "type": "tool_call",
  "response_required": true,
  "tool_call_id": "call_5RWLt3IMQyayzGdvMQVn5AOQ",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"Los Angeles\",\"format\":\"celsius\"}"
}

// 5. User sends results of function call to EVI
{
  "type": "tool_response",
  "tool_call_id":"call_5RWLt3IMQyayzGdvMQVn5AOQ",
  "content":"72F"
}

// 6. EVI sends response containing function call result
{
  "type": "assistant_message",
  "message": {
    "role": "assistant",
    "content": "The current weather in Los Angeles is 72F."
  }
}
```

## Handling errors

It's possible for tool use to fail. For example, it can fail if the Tool Response message content was not in UTF-8 format or if the function call response timed out. This section outlines how to specify fallback content to be used by EVI to communicate a failure, as well as the message flow for when a function call failure occurs.

### Specifying fallback content

When defining your Tool, you can specify fallback content within the Tool's fallback_content field. When the Tool fails to generate content, the text in this field will be sent to the LLM in place of a result. To accomplish this, let's update the Tool we created during setup to include fallback content. We can accomplish this by publishing a new version of the Tool via a POST request to `/tools/{id}`:

#### Request body
```json
{
  "version_description": "Adds fallback content",
  "description": "This tool is for getting the current weather.",
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
  "fallback_content": "Something went wrong. Failed to get the weather."
}
```

#### Sample response body
```json
{
  "tool_type": "FUNCTION",
  "id": "36f09fdc-4630-40c0-8afa-6a3bdc4eb4b1",
  "version": 1,
  "version_type": "FIXED",
  "version_description": "Adds fallback content",
  "name": "get_current_weather",
  "created_on": 1714421925626,
  "modified_on": 1714425632084,
  "fallback_content": "Something went wrong. Failed to get the weather.",
  "description": null,
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the user's location.\" } }, \"required\": [\"location\", \"format\"] }"
}
```

### Failure message flow

This section outlines the sort of messages that can be expected when Tool use fails. After sending a Tool Response message, we will know an error, or failure, occurred when we receive the Tool Error message:

#### Bad function call response error flow
```json
// 1. User asks EVI what the weather is in New York
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What's the weather in New York?"
  }
}

// 2. EVI infers it is time to make a function call
{
  "type": "tool_call",
  "tool_type": "function",
  "response_required": true,
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"New York\",\"format\":\"fahrenheit\"}"
}

// 3. User sends results of function call to EVI (result not formatted correctly)
{
  "type": "tool_response",
  "tool_call_id":"call_5RWLt3IMQyayzGdvMQVn5AOQ",
  "content":"MALFORMED RESPONSE"
}

// 4. EVI sends response communicating it failed to process the tool_response
{
  "type": "tool_error",
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "error": "Malformed tool response: <error message here>",
  "fallback_content": "Something went wrong. Failed to get the weather.",
  "level": "warn"
}

// 5. EVI generates a response based on the failure
{
  "type": "assistant_message",
  "message": {
    "role": "assistant",
    "content": "It looks like there was an issue retrieving the weather information for New York."
  }
}
```

Let's cover another type of failure scenario: what if the weather API the function was using was down? In this case, we would send EVI a Tool Error message. When sending the Tool Error message, we can specify fallback_content to be more specific to the error our function throws. This is what the message flow would be for this type of failure:

#### Failed function call flow
```json
// 1. User asks EVI what the weather is in New York
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What's the weather in New York?"
  }
}

// 2. EVI infers it is time to make a function call
{
  "type": "tool_call",
  "tool_type": "function",
  "response_required": true,
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"New York\",\"format\":\"fahrenheit\"}"
}

// 3. Function failed, so we send EVI a message communicating the failure on our end
{
  "type": "tool_error",
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "error": "Malformed tool response: <error message here>",
  "fallback_content": "Function execution failure - weather API down.",
  "level": "warn"
}

// 4. EVI generates a response based on the failure
{
  "type": "assistant_message",
  "message": {
    "role": "assistant",
    "content": "Sorry, our weather resource is unavailable. Can I help with anything else?"
  }
}
```

Let's revisit our function for handling Tool Call messages from the Function Calling section. We can now add support for error handling by sending Tool Error messages to EVI. This will enable our function to handle cases where fetching the weather fails or the requested tool is not found:

```typescript
import { Hume } from 'hume';

async function handleToolCallMessage(
  toolCallMessage: Hume.empathicVoice.ToolCallMessage,
  socket: Hume.empathicVoice.chat.ChatSocket): Promise<void> {
  if (toolCallMessage.name === "get_current_weather") {
    try{
      // parse the parameters from the Tool Call message
      const args = JSON.parse(toolCallMessage.parameters) as {
        location: string;
        format: string;
      };
      // extract the individual arguments
      const { location, format } = args;
      // call fetch weather function with extracted arguments
      const weather = await fetchWeather(location, format);
      // send Tool Response message to the WebSocket
      const toolResponseMessage = {
        type: "tool_response",
        toolCallId: toolCallMessage.toolCallId,
        content: weather,
      };
      socket.sendToolResponseMessage(toolResponseMessage);
    } catch (error) {
      // send Tool Error message if weather fetching fails
      const weatherToolErrorMessage = {
        type: "tool_error",
        toolCallId: toolCallMessage.toolCallId,
        error: "Weather tool error",
        content: "There was an error with the weather tool",
      };
      socket.sendToolErrorMessage(weatherToolErrorMessage);
    }
  } else {
    // send Tool Error message if the requested tool was not found
    const toolNotFoundErrorMessage = {
      type: "tool_error",
      toolCallId: toolCallMessage.toolCallId,
      error: "Tool not found",
      content: "The tool you requested was not found",
    };
    socket.sendToolErrorMessage(toolNotFoundErrorMessage);
  }
}
``` body
```json
{
  "tool_type": "FUNCTION",
  "id": "15c38b04-ec9c-4ae2-b6bc-5603512b5d00",
  "version": 0,
  "version_description": "Fetches current weather and uses celsius or fahrenheit based on user's location.",
  "name": "get_current_weather",
  "created_on": 1714421925626,
  "modified_on": 1714421925626,
  "fallback_content": null,
  "description": "This tool is for getting the current weather.",
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }"
}
```

Record the value in the id field, as we will use it to specify the newly created Tool in the next step.

### 2. Create a Configuration

Next, we will create an EVI Configuration called Weather Assistant Config, and include the created Tool by making a POST request to `/configs` with the following request body:

#### Request body
```json
{
  "name": "Weather Assistant Config",
  "language_model": {
    "model_provider": "OPEN_AI",
    "model_resource": "gpt-3.5-turbo",
    "temperature": null
  },
  "tools": [
    {
      "id": "15c38b04-ec9c-4ae2-b6bc-5603512b5d00",
      "version": 0
    }
  ]
}
```

#### Sample response body
```json
{
  "id": "87e88a1a-3768-4a01-ba54-2e6d247a00a7",
  "version": 0,
  "version_description": null,
  "name": "Weather Assistant Config",
  "created_on": 1714421581844,
  "modified_on": 1714421581844,
  "prompt": null,
  "voice": null,
  "language_model": {
    "model_provider": "OPEN_AI",
    "model_resource": "gpt-3.5-turbo",
    "temperature": null
  },
  "tools": [
    {
      "tool_type": "FUNCTION",
      "id": "15c38b04-ec9c-4ae2-b6bc-5603512b5d00",
      "version": 0,
      "version_description": "Fetches current weather and uses celsius or fahrenheit based on user's location.",
      "name": "get_current_weather",
      "created_on": 1714421925626,
      "modified_on": 1714421925626,
      "fallback_content": null,
      "description": "This tool is for getting the current weather.",
      "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }"
    }
  ],
  "builtin_tools": []
}
```

Ensure your tool definitions conform to the language model's schema. The specified language model will be the one to execute the function calls.

## Function Calling

In this section, we will go over the end-to-end flow of a function call within a chat session. This flow will be predicated on having specified the Weather Assistant Config when establishing a connection with EVI. See our Configuration Guide for details on how to apply your configuration when connecting.

Check out the TypeScript and Python example projects for complete implementations of the weather Tool you'll build in this tutorial.

### 1. Define a function

We must first define a function for your Tool. This function will take the same parameters as those specified during your Tool's creation.

For this tutorial, we will define a function that calls a weather API (e.g., the Geocoding API) to retrieve the weather for a designated city in a specified format. This weather function will accept location and format as its parameters.

See the code below for a sample implementation:

```typescript
async function fetchWeather(location: string, format: string): Promise<string> {
  // Fetch the location's geographic coordinates using Geocoding API
  const locationApiURL = `https://geocode.maps.co/search?q=${location}&api_key=${YOUR_WEATHER_API_KEY}`;
  const locationResponse = await fetch(locationApiURL);
  const locationData = await locationResponse.json();
  
  // Extract latitude and longitude from fetched location data
  const { lat, lon } = locationData[0];
  
  // Fetch point metadata using the extracted location coordinates
  const pointMetadataEndpoint = `https://api.weather.gov/points/${parseFloat(
    lat
  ).toFixed(3)},${parseFloat(lon).toFixed(3)}`;
  const pointMetadataResponse = await fetch(pointMetadataEndpoint);
  const pointMetadata = await pointMetadataResponse.json();
  
  // Extract weather forecast URL from point metadata
  const forecastUrl = pointMetadata.properties.forecast;
  
  // Fetch the weather forecast using the forecast URL
  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();
  const forecast = JSON.stringify(forecastData.properties.periods);
  
  // Return the temperature in the specified format
  return `${forecast} in ${format}`;
}
```

Instead of calling a weather API, you can hard code a return value like 75F as a means to quickly test for the sake of this tutorial.

### 2. EVI signals function call

Once EVI is configured with your Tool, it will automatically infer when to signal a function call within a chat session. With EVI configured to use the get_current_weather Tool, we can now ask it: "what is the weather in New York?"

Let's try it out in the EVI Playground.

We can expect EVI to respond with a User Message and a Tool Call message:

#### Sample User Message
```json
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What's the weather in New York?"
  }
}
```

#### Sample Tool Call message
```json
{
  "type": "tool_call",
  "tool_type": "function",
  "response_required": true,
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"New York\",\"format\":\"fahrenheit\"}"
}
```

Currently, EVI does not support parallel function calling. Only one function call can be processed at a time.

### 3. Extract arguments from Tool Call message

Upon receiving a Tool Call message from EVI, we will parse the parameters and extract the arguments.

The code below demonstrates how to extract the location and format arguments, which the user-defined fetch weather function is expecting, from a received Tool Call message:

```typescript
import { Hume } from 'hume';

async function handleToolCallMessage(
  toolCallMessage: Hume.empathicVoice.ToolCallMessage,
  socket: Hume.empathicVoice.chat.ChatSocket): Promise<void> {
  if (toolCallMessage.name === "get_current_weather") {
    // 1. Parse the parameters from the Tool Call message
    const args = JSON.parse(toolCallMessage.parameters) as {
      location: string;
      format: string;
    };
    // 2. Extract the individual arguments
    const { location, format } = args;
    // ...etc.
  }
}
```

### 4. Invoke function call

Next, we will pass the extracted arguments into the previously defined fetch weather function. We will capture the return value to send back to EVI:

```typescript
import { Hume } from 'hume';

async function handleToolCallMessage(
  toolCallMessage: Hume.empathicVoice.ToolCallMessage,
  socket: Hume.empathicVoice.chat.ChatSocket): Promise<void> {
  if (toolCallMessage.name === "get_current_weather") {
    // 1. Parse the parameters from the Tool Call message
    const args = JSON.parse(toolCallMessage.parameters) as {
      location: string;
      format: string;
    };
    // 2. Extract the individual arguments
    const { location, format } = args;
    // 3. Call fetch weather function with extracted arguments
    const weather = await fetchWeather(location, format);
    // ...etc.
  }
}
```

### 5. Send function call result

Upon receiving the return value of your function, we will send a Tool Response message containing the result. The specified tool_call_id must match the one received in the Tool Call message from EVI:

```typescript
import { Hume } from 'hume';

async function handleToolCallMessage(
  toolCallMessage: Hume.empathicVoice.ToolCallMessage,
  socket: Hume.empathicVoice.chat.ChatSocket): Promise<void> {
  if (toolCallMessage.name === "get_current_weather") {
    // 1. Parse the parameters from the Tool Call message
    const args = JSON.parse(toolCallMessage.parameters) as {
      location: string;
      format: string;
    };
    // 2. Extract the individual arguments
    const { location, format } = args;
    // 3. Call fetch weather function with extracted arguments
    const weather = await fetchWeather(location, format);
    // 4. Construct a Tool Response message containing the result
    const toolResponseMessage = {
      type: "tool_response",
      toolCallId: toolCallMessage.toolCallId,
      content: weather,
    };
    // 5. Send Tool Response message to the WebSocket
    socket.sendToolResponseMessage(toolResponseMessage);
  }
}
```

Let's try it in the EVI Playground. Enter the return value of your function in the input field below the Tool Call message, and click Send Response. In practice, you will use the actual return value from your function call. However, for demonstration purposes, we will assume a return value of "75F".

### 6. EVI responds

After the interface receives the Tool Response message, it will then send an Assistant Message containing the response generated from the reported result of the function call:

#### Sample assistant_message
```json
{
  "type": "assistant_message",
  "message": {
    "role": "assistant",
    "content": "The current temperature in New York, NY is 75F."
  }
}
```

See how it works in the EVI Playground.

## Using built-in tools

User-defined tools allow EVI to identify when a function should be invoked, but you will need to invoke the function itself. On the other hand, Hume also provides built-in tools that are natively integrated. This means that you don't need to define the function; EVI handles both determining when the function needs to be called and invoking it.

Hume supports the following built-in tools:

* **web_search**: Enables EVI to search the web for real-time information when needed.
* **hang_up**: Closes the WebSocket connection with status code 1000 when appropriate (e.g., after detecting a farewell, signaling the end of the conversation).

This section explains how to specify built-in tools in your configurations and details the message flow you can expect when EVI uses a built-in tool during a chat session.

Here is the relevant section of the markdown documentation from "1. Specify built-in tool in EVI configuration" onwards:

### 1. Specify built-in tool in EVI configuration

Let's begin by creating a configuration which includes the built-in web search tool. To specify the web search tool in your EVI configuration, during the Add tools step, ensure Web search is enabled. Refer to our Configuration Guide for more details on creating a configuration.

Alternatively, you can specify the built-in tool by making a POST request to `/configs` with the following request body:

#### Request body
```json
{
  "name": "Web Search Config",
  "language_model": {
    "model_provider": "OPEN_AI",
    "model_resource": "gpt-3.5-turbo"
  },
  "builtin_tools": [
    { 
      "name": "web_search",
      "fallback_content": "Optional fallback content to inform EVI's spoken response if web search is not successful."
    }
  ]
}
```

Upon success, expect EVI to return a response similar to this example:

#### Sample response body
```json
{
  "id": "3a60e85c-d04f-4eb5-8076-fb4bd344d5d0",
  "version": 0,
  "version_description": null,
  "name": "Web Search Config",
  "created_on": 1714421925626,
  "modified_on": 1714421925626,
  "prompt": null,
  "voice": null,
  "language_model": {
    "model_provider": "OPEN_AI",
    "model_resource": "gpt-3.5-turbo",
    "temperature": null
  },
  "tools": [],
  "builtin_tools": [
    {
      "tool_type": "BUILTIN",
      "name": "web_search",
      "fallback_content": "Optional fallback content to inform EVI's spoken response if web search is not successful."
    }
  ]
}
```

### 2. EVI uses built-in tool

Now that we've created an EVI configuration which includes the built-in web search tool, let's test it out in the EVI Playground. Try asking EVI a question that requires web search, like "what is the latest news with AI research?"

Let's review the message flow for when web search is invoked.

#### Web search message flow
```json
// 1. User asks EVI for the latest news in AI research
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What is the latest news with AI research?"
  }
}

// 2. EVI infers it needs to use web search, generates a search query, and invokes Hume's native web search function
{
  "name": "web_search", 
  "parameters": "{\"query\":\"latest news AI research\"}", 
  "tool_call_id": "call_zt1NYGpPkhR7v4kb4RPxTkLn", 
  "type": "tool_call", 
  "tool_type": "builtin", 
  "response_required": false
}

// 3. EVI sends back the web search results 
{
  "type": "tool_response", 
  "tool_call_id": "call_zt1NYGpPkhR7v4kb4RPxTkLn", 
  "content": "{ \"summary\":null, \"references\": [{\"content\":\"Researchers have demonstrated a new method...etc.\", \"url\":\"https://www.sciencedaily.com/news/computers_math/artificial_intelligence/\", \"name\":\"Artificial Intelligence News -- ScienceDaily\"}] }", 
  "tool_name": "web_search", 
  "tool_type": "builtin"
}

// 4. EVI sends a response generated from the web search results
{
  "type": "assistant_message", 
  "message": {
    "role": "assistant", 
    "content": "Oh, there's some interesting stuff happening in AI research right now."
  }
},
{
  "type": "assistant_message", 
  "message": {
    "role": "assistant", 
    "content": "Just a few hours ago, researchers demonstrated a new method using AI and computer simulations to train robotic exoskeletons."
  }
}
```

## Interruptibility

Function calls can be interrupted to cancel them or to resend them with updated parameters.

### Canceling a function call

Just as EVI is able to infer when to make a function call, it can also infer from the user's input when to cancel one. Here is an overview of what the message flow would look like:

#### Cancel function call message flow
```json
// 1. User asks what the weather is in New York
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What's the weather in New York?"
  }
}

// 2. EVI infers it is time to make a function call
{
  "type": "tool_call",
  "tool_type": "function",
  "response_required": true,
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"New York\",\"format\":\"fahrenheit\"}"
}

// 3. User communicates sudden disinterest in the weather
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "Actually, never mind."
  }
}

// 4. EVI infers the function call should be canceled
{
  "type": "assistant_message",
  "message": {
    "role": "assistant",
    "content": "If you change your mind or need any weather information in the future, feel free to let me know."
  }
}
```

### Updating a function call

Sometimes we don't necessarily want to cancel the function call, and instead want to update the parameters. EVI can infer the difference. Below is a sample flow of interrupting the interface to update the parameters of the function call:

#### Update function call message flow
```json
// 1. User asks EVI what the weather is in New York
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What's the weather in New York?"
  }
}

// 2. EVI infers it is time to make a function call
{
  "type": "tool_call",
  "tool_type": "function",
  "response_required": true,
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"New York\",\"format\":\"fahrenheit\"}"
}

// 3. User communicates to EVI they want the weather in Los Angeles instead
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "Actually, Los Angeles."
  }
}

// 4. EVI infers the parameters to function call should be updated
{
  "type": "tool_call",
  "response_required": true,
  "tool_call_id": "call_5RWLt3IMQyayzGdvMQVn5AOQ",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"Los Angeles\",\"format\":\"celsius\"}"
}

// 5. User sends results of function call to EVI
{
  "type": "tool_response",
  "tool_call_id":"call_5RWLt3IMQyayzGdvMQVn5AOQ",
  "content":"72F"
}

// 6. EVI sends response containing function call result
{
  "type": "assistant_message",
  "message": {
    "role": "assistant",
    "content": "The current weather in Los Angeles is 72F."
  }
}
```

## Handling errors

It's possible for tool use to fail. For example, it can fail if the Tool Response message content was not in UTF-8 format or if the function call response timed out. This section outlines how to specify fallback content to be used by EVI to communicate a failure, as well as the message flow for when a function call failure occurs.

### Specifying fallback content

When defining your Tool, you can specify fallback content within the Tool's fallback_content field. When the Tool fails to generate content, the text in this field will be sent to the LLM in place of a result. To accomplish this, let's update the Tool we created during setup to include fallback content. We can accomplish this by publishing a new version of the Tool via a POST request to `/tools/{id}`:

#### Request body
```json
{
  "version_description": "Adds fallback content",
  "description": "This tool is for getting the current weather.",
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the users location.\" } }, \"required\": [\"location\", \"format\"] }",
  "fallback_content": "Something went wrong. Failed to get the weather."
}
```

#### Sample response body
```json
{
  "tool_type": "FUNCTION",
  "id": "36f09fdc-4630-40c0-8afa-6a3bdc4eb4b1",
  "version": 1,
  "version_type": "FIXED",
  "version_description": "Adds fallback content",
  "name": "get_current_weather",
  "created_on": 1714421925626,
  "modified_on": 1714425632084,
  "fallback_content": "Something went wrong. Failed to get the weather.",
  "description": null,
  "parameters": "{ \"type\": \"object\", \"properties\": { \"location\": { \"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\" }, \"format\": { \"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"], \"description\": \"The temperature unit to use. Infer this from the user's location.\" } }, \"required\": [\"location\", \"format\"] }"
}
```

### Failure message flow

This section outlines the sort of messages that can be expected when Tool use fails. After sending a Tool Response message, we will know an error, or failure, occurred when we receive the Tool Error message:

#### Bad function call response error flow
```json
// 1. User asks EVI what the weather is in New York
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What's the weather in New York?"
  }
}

// 2. EVI infers it is time to make a function call
{
  "type": "tool_call",
  "tool_type": "function",
  "response_required": true,
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"New York\",\"format\":\"fahrenheit\"}"
}

// 3. User sends results of function call to EVI (result not formatted correctly)
{
  "type": "tool_response",
  "tool_call_id":"call_5RWLt3IMQyayzGdvMQVn5AOQ",
  "content":"MALFORMED RESPONSE"
}

// 4. EVI sends response communicating it failed to process the tool_response
{
  "type": "tool_error",
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "error": "Malformed tool response: <error message here>",
  "fallback_content": "Something went wrong. Failed to get the weather.",
  "level": "warn"
}

// 5. EVI generates a response based on the failure
{
  "type": "assistant_message",
  "message": {
    "role": "assistant",
    "content": "It looks like there was an issue retrieving the weather information for New York."
  }
}
```

Let's cover another type of failure scenario: what if the weather API the function was using was down? In this case, we would send EVI a Tool Error message. When sending the Tool Error message, we can specify fallback_content to be more specific to the error our function throws. This is what the message flow would be for this type of failure:

#### Failed function call flow
```json
// 1. User asks EVI what the weather is in New York
{
  "type": "user_message",
  "message": {
    "role": "user",
    "content": "What's the weather in New York?"
  }
}

// 2. EVI infers it is time to make a function call
{
  "type": "tool_call",
  "tool_type": "function",
  "response_required": true,
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "name": "get_current_weather",
  "parameters": "{\"location\":\"New York\",\"format\":\"fahrenheit\"}"
}

// 3. Function failed, so we send EVI a message communicating the failure on our end
{
  "type": "tool_error",
  "tool_call_id": "call_m7PTzGxrD0i9oCHiquKIaibo",
  "error": "Malformed tool response: <error message here>",
  "fallback_content": "Function execution failure - weather API down.",
  "level": "warn"
}

// 4. EVI generates a response based on the failure
{
  "type": "assistant_message",
  "message": {
    "role": "assistant",
    "content": "Sorry, our weather resource is unavailable. Can I help with anything else?"
  }
}
```

Let's revisit our function for handling Tool Call messages from the Function Calling section. We can now add support for error handling by sending Tool Error messages to EVI. This will enable our function to handle cases where fetching the weather fails or the requested tool is not found:

```typescript
import { Hume } from 'hume';

async function handleToolCallMessage(
  toolCallMessage: Hume.empathicVoice.ToolCallMessage,
  socket: Hume.empathicVoice.chat.ChatSocket): Promise<void> {
  if (toolCallMessage.name === "get_current_weather") {
    try{
      // parse the parameters from the Tool Call message
      const args = JSON.parse(toolCallMessage.parameters) as {
        location: string;
        format: string;
      };
      // extract the individual arguments
      const { location, format } = args;
      // call fetch weather function with extracted arguments
      const weather = await fetchWeather(location, format);
      // send Tool Response message to the WebSocket
      const toolResponseMessage = {
        type: "tool_response",
        toolCallId: toolCallMessage.toolCallId,
        content: weather,
      };
      socket.sendToolResponseMessage(toolResponseMessage);
    } catch (error) {
      // send Tool Error message if weather fetching fails
      const weatherToolErrorMessage = {
        type: "tool_error",
        toolCallId: toolCallMessage.toolCallId,
        error: "Weather tool error",
        content: "There was an error with the weather tool",
      };
      socket.sendToolErrorMessage(weatherToolErrorMessage);
    }
  } else {
    // send Tool Error message if the requested tool was not found
    const toolNotFoundErrorMessage = {
      type: "tool_error",
      toolCallId: toolCallMessage.toolCallId,
      error: "Tool not found",
      content: "The tool you requested was not found",
    };
    socket.sendToolErrorMessage(toolNotFoundErrorMessage);
  }
}
```

That completes the documentation for handling errors and tool failures in EVI. Would you like me to go back and review any particular section in more detail?
