# Stateful Agents

## Customize your agent memory
Letta agents have programmable in-context memory. This means a section of the context window is reserved for editable memory: context that can be edited by memory editing tools. Like standard system prompts, the memory also can be used to define the behavior of the agent and store personalization data. The key distinction is that this data can be modified over time.

## Memory
The in-context memory of agents is represented by a `Memory` object. This object contains:
* A set of `Block` objects representing a segment of memory, with an associated character limit and label
* A set of memory editing tools

## Default: ChatMemory
By default, agents have a `ChatMemory` memory class, which is designed for a 1:1 chat between a human and agent. You can use the `persona` section of `ChatMemory` to customize the prompt for your agent, and the `human` section to add personalization data.

```python
from letta import create_client, LLMConfig, EmbeddingConfig
from letta.schemas.memory import ChatMemory

client = create_client() 
agent_state = client.create_agent(
    memory=ChatMemory(
        persona="I am docbot and must answer user questions.", 
        human="Name: Sarah"
    ), 
    # TODO: change for different models
    llm_config=LLMConfig.default_config(model_name="gpt-4o-mini"),
    embedding_config=EmbeddingConfig.default_config(model_name="text-embedding-ada-002")
)
```

The ChatMemory class consists of:
* A "human" and "persona" memory sections each with a `2000` character limit
* Two memory editing functions: `core_memory_replace` and `core_memory_append`

## Built-in: BasicBlockMemory
Another built-in memory class is the `BasicBlockMemory` class, which represents a set of blocks.

```python
from letta import create_client, LLMConfig, EmbeddingConfig
from letta.schemas.memory import ChatMemory

client = create_client() 

org_block = client.create_block(
    label="org",
    value="Organization: Letta",
    limit=1000,
) 
persona_block = client.create_block(
    label="persona",
    value="I am docbot and must answer user questions.",
    limit=1000, 
)  

agent_state = client.create_agent(
    memory=BasicBlockMemory(
        blocks = [org_block, persona_block]
    )
    # TODO: change for different models
    llm_config=LLMConfig.default_config(model_name="gpt-4o-mini"),
    embedding_config=EmbeddingConfig.default_config(model_name="text-embedding-ada-002")
)
```

The `BasicBlockMemory` class consists of:
* A set of `Block` objects
* Memory editing tools `core_memory_replace` and `core_memory_append`

## Blocks
Blocks are the basic unit of core memory. A set of blocks makes up the core memory. Each block has:
* A `limit`, corresponding to the character limit of the block (i.e. how many characters in the context window can be used up by this block)
* A `value`, corresponding to the data represented in the context window for this block
* A `label`, corresponding to the type of data represented in the block (e.g. `human`, `persona`)

You can create a standalone block with the `create_block` method. Block objects can be part of multiple memory classes, which allows for synchronized blocks across agents (i.e. shared memory).

```python
block = client.create_block(
    name="sarah", 
    text: "Name: Sarah", 
    label: "human"
)

# agent 1 memory
memory1 = BasicBlockMemory(blocks=[block])

# agent 2 memory
memory2 = BasicBlockMemory(blocks=[block])
```

You can also retrieve block data from an agent's memory.

```python
core_memory = client.get_core_memory(agent_state.id)

# retrieve the block with label "human" 
block = core_memore.get_block("human")
```