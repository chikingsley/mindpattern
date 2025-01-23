# MemGPT and Key Concepts

## MemGPT Overview

The MemGPT open source framework/package was renamed to *Letta*. You can read about the difference between Letta and MemGPT in the documentation, or read more about the change on our blog post.

### MemGPT - The Research Paper

Figure 1 from the MemGPT paper showing the system architecture. Note that 'working context' from the paper is referred to as 'core memory' in the codebase. To read the paper, visit https://arxiv.org/abs/2310.08560.

**MemGPT** is the name of a **research paper** that popularized several of the key concepts behind the "LLM Operating System (OS)":

1. **Memory Management**: In MemGPT, an LLM OS moves data in and out of the context window of the LLM to manage its memory.

2. **Memory Hierarchy**: The "LLM OS" divides the LLM's memory (aka its "virtual context", similar to "**virtual memory**" in computer systems) into two parts:
   - The in-context memory
   - Out-of-context memory

3. **Self-editing Memory via Tool Calling**: In MemGPT, the "OS" that manages memory is itself an LLM. The LLM moves data in and out of the context window using designated memory-editing tools.

4. **Multi-step Reasoning using Heartbeats**: MemGPT supports multi-step reasoning (allowing the agent to take multiple steps in sequence) via the concept of "heartbeats". Whenever the LLM outputs a tool call, it has to option to request a heartbeat by setting the keyword argument `request_heartbeat` to `true`. If the LLM requests a heartbeat, the LLM OS continues execution in a loop, allowing the LLM to "think" again.

### MemGPT - The Agent Architecture

**MemGPT** also refers to a particular **agent architecture** that was popularized by the paper and adopted widely by other LLM chatbots:

1. **Chat-focused Core Memory**: The core memory of a MemGPT agent is split into two parts:
   - The agent's own persona
   - The user information
   Because the MemGPT agent has self-editing memory, it can update its own personality over time, as well as update the user information as it learns new facts about the user.

2. **Vector Database Archival Memory**: By default, the archival memory connected to a MemGPT agent is backed by a vector database, such as **Chroma** or **pgvector**. Because in MemGPT all connections to memory are driven by tools, it's simple to exchange archival memory to be powered by a more traditional database (you can even make archival memory a flatfile if you want!).

## Letta Framework

### Creating MemGPT Agents in Letta

Because **Letta** was created out of the original MemGPT open source project, it's extremely easy to make MemGPT agents inside of Letta (the default Letta agent architecture is a MemGPT agent).

**The Letta framework also allows you to make agent architectures beyond MemGPT** that differ significantly from the architecture proposed in the research paper, for example:
- Agents with multiple logical threads (e.g., a "conscious" and a "subconscious")
- Agents with more advanced memory types (e.g., task memory)

Additionally, **the Letta framework allows you to expose your agents as *services*** (over REST APIs) - so you can use the Letta framework to power your AI applications.

## Key Concepts

### Agents ("LLM Agents")

Agents are LLM processes which can:
1. Have internal **state** (i.e., memory)
2. Can take **actions** to modify their state
3. Run **autonomously**

Agents have existed as a concept in **reinforcement learning** for a long time (as well as in other fields, such as **economics**). In Letta, LLM tool calling is used to:
- Allow agents to run autonomously (by having the LLM determine whether to continue executing)
- Edit state (by leveraging LLM tool calling)

Letta uses a database (DB) backend to manage the internal state of the agent, represented in the `AgentState` object.

### Self-editing Memory

The MemGPT paper introduced the idea of implementing self-editing memory in LLMs. The basic idea is to use LLM tools to allow an agent to:
- Edit its own context window ("core memory")
- Edit external storage (i.e., "archival memory")

### LLM OS ("Operating Systems for LLMs")

The LLM OS is the code that manages the inputs and outputs to the LLM and manages the program state. We refer to this code as the "stateful layer" or "memory layer". It includes:
- The "agent runtime", which manages the execution of functions requested by the agent
- The "agentic loop" which enables multi-step reasoning

### Persistence ("Statefulness")

In Letta, all state is *persisted* by default. This means that each time the LLM is run, the state of the agent such as:
- Memories
- Message history
- Tools

are all persisted to a DB backend.

Because all state is persisted, you can:
- Re-load agents, tools, sources, etc. at a later point in time
- Load the same agent across multiple machines or services (as long as they can connect to the same DB backend)

### Agent Microservices ("Agents-as-a-Service")

Letta follows the model of treating agents as individual services. That is, you interact with agents through a REST API:

```http
POST /agents/{agent_id}/messages
```

Since agents are designed to be services, they can be *deployed* and connected to external applications.

For example, you want to create a personalized chatbot, you can create an agent per-user, where each agent has its own custom memory about the individual user.

### Stateful vs Stateless APIs

`ChatCompletions` is the standard for interacting with LLMs as a service. Since it is a stateless API (no notion of sessions or identity across requests, and no state management on the server-side), client-side applications must manage:
- Agent memory
- User personalization
- Message history

and translate this state back into the `ChatCompletions` API format.

Letta's APIs are designed to be *stateful*, so that this state management is done on the server, not the client.

# Building Stateful Agents with Letta

Letta agents can automatically manage long-term memory, load data from external sources, and call custom tools. Unlike in other frameworks, Letta agents are stateful, so they keep track of historical interactions and reserve part of their context to read and write memories which evolve over time.

## Key Features

- Node.js/TypeScript SDKs & REST API
- Persistence
- Tool calling (support for custom tools & Composio tools)
- Memory management
- Deployment
- Streaming support

Letta manages a reasoning loop for agents. At each agent step (i.e., iteration of the loop), the state of the agent is checkpointed and persisted to the database.

You can interact with agents from a REST API, the ADE, and TypeScript / Node.js SDKs. As long as they are connected to the same service, all of these interfaces can be used to interact with the same agents.

## Agents vs Threads

In Letta, you can think of an agent as a single entity that has a single message history which is treated as infinite. The sequence of interactions the agent has experienced through its existence make up the agent's state (or memory).

One distinction between Letta and other agent frameworks is that Letta does not have the notion of message *threads* (or *sessions*). Instead, there are only *stateful agents*, which have a single perpetual thread (sequence of messages).

The reason we use the term *agent* rather than *thread* is because Letta is based on the principle that **all agents interactions should be part of the persistent memory**, as opposed to building agent applications around ephemeral, short-lived interactions (like a thread or session).

```
Letta Stateful Agents               Thread-Based Agents
-------------------                 -------------------
Learn & Update                      LLM
    LLM                            Thread 1 -------- Ephemeral Session
Single Agent -------- Persistent   Thread 2 -------- Ephemeral Session
    PostgreSQL                     Thread 3 -------- Ephemeral Session
```

If you would like to create common starting points for new conversation "threads", we recommend using **agent templates** to create new agents for each conversation, or directly copying agent state from an existing agent.

For multi-user applications, we recommend creating an agent per-user, though you can also have multiple users message a single agent (but it will be a single shared message history).

## Working with Agents

### Create an Agent

```javascript
const { LettaClient } = require('@letta/client');

const client = new LettaClient({ token: "LETTA_API_KEY" });

const agentState = await client.agents.create({
    name: "my_agent",
    memoryBlocks: [
        {
            label: "human",
            limit: 2000,
            value: "Name: Bob"
        },
        {
            label: "persona",
            limit: 2000,
            value: "You are a friendly agent"
        }
    ],
    model: "openai/gpt-4",
    embedding: "openai/text-embedding-ada-002"
});
```

### Message an Agent

```javascript
// Message an agent
const response = await client.agents.messages.create({
    agentId: agentState.id,
    messages: [
        {
            role: "user",
            text: "hello"
        }
    ]
});

console.log("Usage:", response.usage);
console.log("Agent messages:", response.messages);
```

### Retrieving an Agent's State

The agent's state is always persisted, so you can retrieve an agent's state by either its ID or name.

```javascript
// get the agent by ID
const agentState = await client.agents.get({
    agentId: "agent-42c61916-1fb3-4195-85l7-b865f7e452dd"
});
```

### List Agents

```javascript
// list `AgentState` objects of all agents
const agents = await client.agents.list();
```

### Delete an Agent

```javascript
// delete an agent
await client.agents.delete({
    agentId: "agent-42c61916-1fb3-4195-85l7-b865f7e452dd"
});
```

### Key Differences from Python Version

1. All async operations use `async/await` syntax
2. Method parameters are passed as objects
3. Uses camelCase naming convention instead of snake_case
4. Client initialization follows Node.js patterns
5. Import statements use Node.js `require` syntax instead of Python imports

### Best Practices

- Always handle promises appropriately using async/await
- Use try/catch blocks for error handling
- Consider using TypeScript for better type safety
- Store sensitive information like API keys in environment variables

# Customize Your Agent Memory

Letta agents have programmable in-context memory. This means a section of the context window is reserved for editable memory: context that can be edited by memory editing tools. Like standard system prompts, the memory also can be used to define the behavior of the agent and store personalization data. The key distinction is that this data can be modified over time.

## Memory

The in-context memory of agents is represented by a `Memory` object. This object contains:
- A set of `Block` objects representing a segment of memory, with an associated character limit and label
- A set of memory editing tools

## Default: ChatMemory

By default, agents have a `ChatMemory` memory class, which is designed for a 1:1 chat between a human and agent. You can use the `persona` section of `ChatMemory` to customize the prompt for your agent, and the `human` section to add personalization data.

```javascript
const { LettaClient } = require('@letta/client');
const { ChatMemory, LLMConfig, EmbeddingConfig } = require('@letta/schemas');

const client = new LettaClient();

const agentState = await client.createAgent({
    memory: new ChatMemory({
        persona: "I am docbot and must answer user questions.",
        human: "Name: Sarah"
    }),
    // TODO: change for different models
    llmConfig: LLMConfig.defaultConfig({ modelName: "gpt-4o-mini" }),
    embeddingConfig: EmbeddingConfig.defaultConfig({ modelName: "text-embedding-ada-002" })
});
```

The ChatMemory class consists of:
- A "human" and "persona" memory sections each with a `2000` character limit
- Two memory editing functions: `coreMemoryReplace` and `coreMemoryAppend`

## Built-in: BasicBlockMemory

Another built-in memory class is the `BasicBlockMemory` class, which represents a set of blocks.

```javascript
const { LettaClient } = require('@letta/client');
const { BasicBlockMemory, LLMConfig, EmbeddingConfig } = require('@letta/schemas');

const client = new LettaClient();

const orgBlock = await client.createBlock({
    label: "org",
    value: "Organization: Letta",
    limit: 1000
});

const personaBlock = await client.createBlock({
    label: "persona",
    value: "I am docbot and must answer user questions.",
    limit: 1000
});

const agentState = await client.createAgent({
    memory: new BasicBlockMemory({
        blocks: [orgBlock, personaBlock]
    }),
    // TODO: change for different models
    llmConfig: LLMConfig.defaultConfig({ modelName: "gpt-4o-mini" }),
    embeddingConfig: EmbeddingConfig.defaultConfig({ modelName: "text-embedding-ada-002" })
});
```

The `BasicBlockMemory` class consists of:
- A set of `Block` objects
- Memory editing tools `coreMemoryReplace` and `coreMemoryAppend`

## Blocks

Blocks are the basic unit of core memory. A set of blocks makes up the core memory. Each block has:
- A `limit`, corresponding to the character limit of the block (i.e., how many characters in the context window can be used up by this block)
- A `value`, corresponding to the data represented in the context window for this block
- A `label`, corresponding to the type of data represented in the block (e.g., `human`, `persona`)

You can create a standalone block with the `createBlock` method. Block objects can be part of multiple memory classes, which allows for synchronized blocks across agents (i.e., shared memory).

```javascript
const block = await client.createBlock({
    name: "sarah",
    text: "Name: Sarah",
    label: "human"
});

// agent 1 memory
const memory1 = new BasicBlockMemory({
    blocks: [block]
});

// agent 2 memory
const memory2 = new BasicBlockMemory({
    blocks: [block]
});
```

You can also retrieve block data from an agent's memory.

```javascript
const coreMemory = await client.getCoreMemory(agentState.id);

// retrieve the block with label "human"
const block = coreMemory.getBlock("human");
```

### Key Differences from Python Version

1. All async operations use `async/await` syntax
2. Constructor parameters are passed as objects
3. Method names follow camelCase convention instead of snake_case
4. Configuration objects use object syntax instead of class instantiation
5. Import statements use Node.js `require` syntax

# Streaming Agent Responses

Messages from the Letta server can be streamed to the client. If you're building a UI on the Letta API, enabling streaming allows your UI to update in real-time as the agent generates a response to an input message.

## Types of Streaming

There are two kinds of streaming you can enable:
- Streaming agent steps
- Streaming tokens

To enable streaming (either mode), you need to use the `/v1/agent/messages/stream` API route instead of the `/v1/agent/messages` API route.

## Streaming Agent Steps

When you send a message to the Letta server, the agent may run multiple steps while generating a response. For example, an agent may run a search query, then use the results of that query to generate a response.

When you use the `/messages/stream` route, `stream_steps` is enabled by default, and the response to the POST request will stream back as server-sent events.

### Example Code (Node.js)

```javascript
// send a message to the agent (streaming steps)
const stream = await client.agents.messages.stream(
    agentState.id, {
        messages: [
            {
                role: "user",
                text: "hows it going????"
            }
        ]
    }
);
// print the chunks coming back
for await (const chunk of stream) {
    console.log(chunk);
};
```

### Example Response

```json
data: {"id":"...","date":"...","message_type":"reasoning_message","reasoning":"User keeps asking the same question; maybe it's part of their style or humor. I'll respond warmly and play along."}
data: {"id":"...","date":"...","message_type":"assistant_message","assistant_message":"Hey! It's going well! Still here, ready to chat. How about you? Anything exciting happening?"}
data: {"message_type":"usage_statistics","completion_tokens":65,"prompt_tokens":2329,"total_tokens":2394,"step_count":1}
data: [DONE]
```

## Streaming Tokens

You can also stream chunks of tokens from the agent as they are generated by the underlying LLM process by setting `streamTokens` to `true` in your API request.

### Example Code (Node.js)

```javascript
// send a message to the agent (streaming tokens)
const stream = await client.agents.messages.stream(
    agentState.id, {
        messages: [
            {
                role: "user",
                text: "hows it going????"
            }
        ],
        streamTokens: true
    }
);
// print the chunks coming back
for await (const chunk of stream) {
    console.log(chunk);
};
```

### Example Response

```json
data: {"id":"...","date":"...","message_type":"reasoning_message","reasoning":"It's"}
data: {"id":"...","date":"...","message_type":"reasoning_message","reasoning":" interesting"}
... chunks omitted
data: {"id":"...","date":"...","message_type":"reasoning_message","reasoning":"!"}
data: {"id":"...","date":"...","message_type":"assistant_message","assistant_message":"Well"}
... chunks omitted
data: {"id":"...","date":"...","message_type":"assistant_message","assistant_message":"."}
data: {"message_type":"usage_statistics","completion_tokens":50,"prompt_tokens":2771,"total_tokens":2821,"step_count":1}
data: [DONE]
```

## Client Code Implementation Tips

The data structure for token streaming is the same as for agent steps streaming (`LettaMessage`) - just instead of returning complete messages, the Letta server will return multiple messages each with a chunk of the response. Because the format of the data looks the same, if you write your frontend code to handle tokens streaming, it will also work for agent steps streaming.

### Cross-Provider Compatibility

If the Letta server is connected to multiple LLM backend providers and only a subset of them support LLM token streaming, you can use the same frontend code (interacting with the Letta API) to handle both streaming and non-streaming providers:

- If you send a message to an agent with streaming enabled (`stream_tokens` are true):
  - The server will stream back `LettaMessage` objects with chunks if the selected LLM provider supports token streaming
  - The server will send `LettaMessage` objects with complete strings if the selected LLM provider does not support token streaming

  # Serving Multiple Users

You may be building a multi-user application with Letta, in which each user is associated with a specific agent. In this scenario, you can use the notion of **tags** (part of the agent state) to associate each agent with a user in your application.

## Using Agent Tags to Identify Users

Let's assume that you have an application with multiple users that you're building on a **self-hosted Letta Server** or **Letta Cloud**. Each user has a unique username, starting at `user_1`, and incrementing up as you add more users to the platform.

To associate agents you create in Letta with your users, you can specify a **tag** when creating an agent, and set the tag to the user's unique ID.

### Creating an Agent with Tags

```typescript
import { LettaClient } from '@letta/client';

// assumes that you already instantiated a client
await client.agents.create({
    memoryBlocks: [],
    llm: "anthropic/claude-3-5-sonnet-20241022",
    contextWindowLimit: 200000,
    embedding: "openai/text-embedding-ada-002",
    tags: ["user_1"]
});
```

### Searching for Agents by Tags

You can search for agents associated with a specific user using the `tags` parameter in the list agents request:

```typescript
// assumes that you already instantiated a client
await client.agents.list({
    tags: ["user_1"]
});
```

## Complete Example using TypeScript SDK

In this example, we'll create an agent with a (user) tag, then search for all agents with that tag. This example assumes that you have a self-hosted Letta Server running on localhost (for example, by running `docker run ...`).

```typescript
import { LettaClient } from '@letta/client';

async function main() {
    // in this example we'll connect to a self-hosted Letta Server
    const client = new LettaClient({
        baseUrl: "http://localhost:8283"
    });

    const userId = "my_uuid";

    // create an agent with the userId tag
    const agent = await client.agents.create({
        memoryBlocks: [],
        llm: "anthropic/claude-3-5-sonnet-20241022",
        contextWindowLimit: 200000,
        embedding: "openai/text-embedding-ada-002",
        tags: [userId]
    });

    console.log(`Created agent with id ${agent.id}, tags ${agent.tags}`);

    // list agents
    const userAgents = await client.agents.list({
        tags: [userId]
    });

    const agentIds = userAgents.map(agent => agent.id);
    console.log(`Found matching agents ${agentIds}`);
}

main().catch(console.error);
```

## Creating and Viewing Tags in the ADE

You can also modify tags in the ADE. Simply click the **Advanced Settings** tab in the top-left of the ADE to view an agent's tags. You can create new tags by typing the tag name in the input field and hitting enter.

### Key Differences from Python Version

1. Uses TypeScript types and interfaces
2. Follows TypeScript/JavaScript naming conventions (camelCase)
3. Uses ES6+ features and syntax
4. Includes proper error handling with Promise chains
5. Uses async/await for asynchronous operations

### TypeScript-Specific Features

- Strong typing for all client operations
- Interface definitions for request and response objects
- Type safety for agent configurations
- Proper TypeScript configurations recommended

### Best Practices

1. Always use TypeScript types for better code safety
2. Handle Promise rejections appropriately
3. Use proper error handling with try/catch blocks
4. Store configuration in environment variables
5. Follow TypeScript best practices for async operations

### Type Definitions

For reference, here are some of the key type definitions used in the examples:

```typescript
interface AgentCreateOptions {
    memoryBlocks: MemoryBlock[];
    llm: string;
    contextWindowLimit: number;
    embedding: string;
    tags?: string[];
}

interface AgentListOptions {
    tags?: string[];
}

interface MemoryBlock {
    label: string;
    limit: number;
    value: string;
}
```