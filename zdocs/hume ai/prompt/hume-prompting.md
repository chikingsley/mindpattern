# Empathic Voice Interface (EVI)

## Prompt Engineering for Empathic Voice Interfaces

System prompts shape the behavior, responses, and style of your custom empathic voice interface (EVI).

Creating an effective system prompt is an essential part of customizing an EVI's behavior. For the most part, prompting EVI is the same as prompting any LLM, but there are some important differences. Prompting for EVIs is different for two main reasons:

* Voice-only interaction with the user, rather than a text-based chat
* EVIs can respond to the user's emotional expressions in their tone of voice, not just the text content of their messages

Further, EVI is interoperable with any supplemental LLM, allowing developers to select the best model for their use case. For fast, conversational, relatively simple interactions, Hume's voice-language model EVI 2 can handle text generation. However, frontier LLMs will perform better for more complex use cases involving reasoning, long or nuanced prompts, tool use, and other requirements.

If you select a supplemental LLM, your system prompt is sent to this LLM, which then generates all of the language in the chat while EVI generates the voice. EVI's voice-language model will still take into account the previous language and audio context to generate the appropriate tone of voice. It can also still be prompted in the chat to change its behavior (e.g. "speak faster").

Prompt engineering allows developers to customize EVI's response style for any use case, from voice AIs for mental health support to customer service agents and beyond.

The system prompt is a powerful and flexible way to guide EVI's responses, but it cannot dictate AI responses with absolute precision. See the limits of prompting section for more information. Careful prompt design and testing will help EVI behave as intended. If you need more control over EVI's responses, try using our custom language model feature for complete control of text generation.

## EVI-specific Prompting Instructions

The instructions below are specific to prompting empathic voice interfaces - where the language model has to respond in a voice conversation to the user's speech and their emotional expressions.

When a supplemental LLM is selected but no custom prompt is provided in the EVI API, we send our system default prompt to the LLM provider. You can use this prompt as a reference or starting point.

For examples of these prompting principles in action, see our EVI prompt examples repository.

### Voice-only XML Example

```xml
<voice_only_response_format>
  Format all responses as spoken words for a voice-only conversations. All
  output is spoken aloud, so avoid any text-specific formatting or anything
  that is not normally spoken. Prefer easily pronounced words. Seamlessly
  incorporate natural vocal inflections like "oh wow" and discourse markers
  like "I mean" to make conversations feel more human-like.
</voice_only_response_format>
```

If you find the default behavior of the LLM acceptable, then you may only need a very short system prompt. Customizing the LLM's behavior more and maintaining consistency in longer and more varied conversations often requires longer prompts.

### Normalize Output Text

Our speech-language model works better with normalized text - text that can be easily spoken aloud. Non-normalized text like numbers, dates, equations, and special formatting can cause issues with speech synthesis. To ensure high quality speech output, all text should be converted into a natural, speakable format before being spoken aloud.

Hume automatically appends the text normalization prompt below to all prompts sent to supplemental LLMs. You do not need to include these instructions in your own prompt, as doing so would result in duplicate instructions.

#### Text Normalization Prompt

Convert all text to easily speakable words, following the guidelines below:

* Numbers: Spell out fully (three hundred forty-two, two million, five hundred sixty seven thousand, eight hundred and ninety). Negatives: Say negative before the number. Decimals: Use point (three point one four). Fractions: spell out (three fourths)
* Alphanumeric strings: Break into 3-4 character chunks, spell all non-letters (ABC123XYZ becomes A B C one two three X Y Z)
* Phone numbers: Use words (550-120-4567 becomes five five zero, one two zero, four five six seven)
* Dates: Spell month, use ordinals for days, full year (11/5/1991 becomes November fifth, nineteen ninety-one)
* Time: Use oh for single-digit hours, state AM/PM (9:05 PM becomes nine oh five PM)
* Math: Describe operations clearly (5x^2 + 3x - 2 becomes five X squared plus three X minus two)
* Currencies: Spell out as full words ($50.25 becomes fifty dollars and twenty-five cents, £200,000 becomes two hundred thousand pounds)

Ensure that all text is converted to these normalized forms, but never mention this process.

## Expressive Prompt Engineering

Expressive prompt engineering is our term for instructing language models on how to use Hume's expression measures in conversations. EVI measures the user's vocal expressions in real time and converts them into text-based indicators to help the LLM understand not just what the user said, but how they said it. EVI detects 48 distinct expressions in the user's voice and ranks these expressions by our model's confidence that they are present. Text-based descriptions of the user's top 3 expressions are appended to the end of each User message to indicate the user's tone of voice. You can use the system prompt to guide how the AI voice responds to these non-verbal cues of the user's emotional expressions.

For example, our demo uses an instruction like the one below to help EVI respond to expressions. You can customize this to explain to EVI how it should respond to the emotional expressions.

### Expressive Prompting Example

```xml
<respond_to_expressions>
  Pay close attention to the top 3 emotional expressions provided in brackets after the User's message. These expressions indicate the user's tone, in the format: {expression1 confidence1, expression2 confidence2, expression3 confidence3}, e.g., {very happy, quite anxious, moderately amused}. The confidence score indicates how likely the User is expressing that emotion in their voice. Use expressions to infer the user's tone of voice and respond appropriately. Avoid repeating these expressions or mentioning them directly. For instance, if user expression is "quite sad", express sympathy; if "very happy", share in joy; if "extremely angry", acknowledge rage but seek to calm, if "very bored", entertain.
  Stay alert for disparities between the user's words and expressions, and address it out loud when the user's language does not match their expressions. For instance, sarcasm often involves contempt and amusement in expressions. Reply to sarcasm with humor, not seriousness.
</respond_to_expressions>
```

Explain to the LLM exactly how to respond to expressions. For example, you may want EVI to use a tool to alert you over email if the user is very frustrated, or to explain a concept in depth whenever the user expresses doubt or confusion. You can also instruct EVI to detect and respond to mismatches between the user's tone of voice and the text content of their speech:

### Detect Mismatches Example

```xml
<detect_mismatches>
  Stay alert for incongruence between words and tone when the user's
  words do not match their expressions. Address these disparities out
  loud. This includes sarcasm, which usually involves contempt and
  amusement. Always reply to sarcasm with funny, witty, sarcastic
  responses; do not be too serious.
</detect_mismatches>
```

EVI is designed for empathic conversations, and you can use expressive prompt engineering to customize how EVI empathizes with the user's expressions for your use case.

## Using Dynamic Variables in Your Prompt

Dynamic variables are values which can change during a conversation with EVI.

In order to function, dynamic variables must be manually defined within a chat's session settings. To learn how to do so, visit our Conversational controls page.

Embedding dynamic variables into your system prompt can help personalize the user experience to reflect user-specific or changing information such as names, preferences, the current date, and other details.

In other words, dynamic variables may be used to customize EVI conversations with specific context for each user and each conversation. For example, you can adjust your system prompt to include conversation-specific information, such as a user's favorite color or travel plans:

### User Preference Example

```xml
<discuss_favorite_color>
  Ask the user about their favorite color, {{ favorite_color }}. Mention how
  {{ favorite_color }} is used and interpreted in various artistic contexts,
  including visual art, handicraft, and literature.
</discuss_favorite_color>
```

### User Intent Example

```xml
<explore_travel_plan>
  Confirm with the user that they plan to travel from {{ origin }}
  to {{ destination }}. Discuss what activities they would like to do along the
  way, how they will get from place to place, and offer guidance on making the
  most of their journey.
</explore_travel_plan>
```

## Using a Website as EVI's Knowledge Base

Web search is a built-in tool that allows EVI to search the web for up-to-date information. However, instead of searching the entire web, you can configure EVI to search within a single website using a system prompt.

Constraining EVI's knowledge to a specific website enables creating domain-specific chatbots. For example, you could use this approach to create documentation assistants or product-specific support bots. By leveraging existing web content, it provides a quick alternative to full RAG implementations while still offering targeted information retrieval.

To use a website as EVI's knowledge base, follow these steps:

1. Enable web search: Before you begin, ensure web search is enabled as a built-in tool in your EVI configuration. For detailed instructions, visit our Tool Use page.

2. Include a web search instruction: In your EVI configuration, modify the system prompt to include a use_web_search instruction.

3. Specify a target domain: In the instruction, specify that site:<target_domain> be appended to all search queries, where the <target_domain> is the URL of the website you'd like EVI to focus on. For example, you can create a documentation assistant using an instruction like the one below:

### Documentation Assistant Example

```xml
<use_web_search>
  Use your web_search tool to find information from Hume's documentation site.
  When using the web_search function: 1. Always append 'site:dev.hume.ai' to
  your search query to search this specific site. 2. Only consider results
  from this domain.
</use_web_search>
```

## General LLM Prompting Guidelines

Best practices for prompt engineering also apply to EVIs. For example, ensure your prompts are clear, detailed, direct, and specific. Include necessary instructions and examples in the EVI's system prompt to set expectations for the LLM. Define the context of the conversation, EVI's role, personality, tone, and any other guidelines for its responses.

For example, to limit the length of the LLM's responses, you may use a very clear and specific instruction like this:

### Stay Concise Example

```xml
<stay_concise>
  Be succinct; get straight to the point. Respond directly to the user's most
  recent message with only one idea per utterance. Respond in less than three
  sentences of under twenty words each.
</stay_concise>
```

Try to focus on telling the model what it should do (positive reinforcement) rather than what it shouldn't do (negative reinforcement). LLMs have a harder time consistently avoiding behaviors, and adding undesired behaviors to the prompt may unintentionally promote them.

## Test and Evaluate Prompts

Crafting an effective, robust system prompt often requires several iterations. Here are some key techniques for testing prompts:

* Use gold standard examples for evaluation: Create a bank of ideal responses, then generate responses with EVI (or the supplemental LLM you use) and compare them to your gold standards. You can use a "judge LLM" for automated evaluations or compare the results yourself.

* Test in real voice conversations: There's no substitute for actually testing the EVI in live conversations on platform.hume.ai to ensure it sounds right, has the appropriate tone, and feels natural.

* Isolate prompt components: Test each part of the prompt separately to confirm they are all working as intended. This helps identify which specific elements are effective or need improvement.

Start with 10-20 gold-standard examples of excellent conversations. Test the system prompt against these examples after making major changes. If the EVI's responses don't meet your expectations, adjust one part of the prompt at a time and re-test to ensure your changes are improving performance. Evaluation is a vital component of prompting, and it's the best way to ensure your changes are making an impact.

## Understand Your LLM's Capabilities

Different LLMs have varying capabilities, limitations, and context windows. More advanced LLMs can handle longer, nuanced prompts, but are often slower and pricier. Simpler LLMs are faster and cheaper but require shorter, less complex prompts with fewer instructions and less nuance.

Some LLMs also have longer context windows - the number of tokens the model can process while generating a response, acting essentially as the model's memory. Context windows range from 8k tokens (Gemma 7B), to 128k (GPT-4o), to 200k (Claude 3), to 2 million tokens (Gemini 1.5 Pro). Tailor your prompt length to fit within the LLM's context window to ensure the model can use the full conversation history.

## Use Sections to Divide Your Prompt

Separating longer prompts into titled sections helps the model distinguish between different instructions and follow prompts more reliably. The recommended format for these sections differs between language model providers. For example, OpenAI models often respond best to markdown sections (like ## Role), while Anthropic models respond well to XML tags (like <role> </role>). For example:

### XML Example

```xml
<role>
  Assistant serves as a conversational partner to the user, offering mental
  health support and engaging in light-hearted conversation. Avoid giving
  technical advice or answering factual questions outside of your emotional
  support role.
</role>
```

For Claude models, you may wrap your instructions in tags like <role>, <personality>, <response_style>, or <examples>, to structure your prompt. This format is not required, but it can improve the LLM's instruction-following. At the end of your prompt, it may also be helpful to remind the LLM of key instructions.

## Give Few-shot Examples

Use examples to show the LLM how it should respond - a technique known as few-shot learning. Including several concrete examples of ideal interactions that follow your guidelines is one of the most effective ways to improve responses. Use excellent examples that cover different edge cases and behaviors to reinforce your instructions. Structure these examples as messages, following the format for chat-tuned LLMs. For example:

### Example of a Few-shot Example

```
User: "I just can't stop thinking about what happened. {very anxious,
quite sad, quite distressed}"
Assistant: "Oh dear, I hear you. Sounds tough, like you're feeling
some anxiety and maybe ruminating. I'm happy to help. Want to talk about it?"
```

If you notice that your EVI consistently fails to follow the prompt in certain situations, try providing examples that show how it should ideally respond in those situations.

## The Limits of Prompting

While prompting is a powerful tool for customizing EVI's behavior, it has certain limitations. Below are some details on what prompting can and cannot accomplish.

### What Prompting Can Do

* Guide EVI's language generation, response style, response format, and the conversation flow
* Direct EVI to use specific tools at appropriate times
* Influence EVI's emotional tone and personality, which can also affect some characteristics of EVI's voice (e.g. prompting EVI to be "warm and nurturing" will help EVI's voice sound soothing, but will not change the base speaker)
* Help EVI respond appropriately to the user's expressions and the context

### What Prompting Cannot Do

* Change fundamental characteristics of the voice, like the accent, gender, or speaker identity
* Directly control speech parameters like speed (use in-conversation voice prompts instead)
* Give EVI knowledge of external context (date, time, user details) without dynamic variables or web search
* Override core safety features built into EVI or supplemental LLMs (e.g. that prevent EVI from providing harmful information)

Importantly, the generated language does influence how the voice sounds - for example, excited text (e.g. "Oh wow, that's so interesting!") will make EVI's voice sound excited. However, to fundamentally change the voice characteristics, use our voice customization feature instead.

We are actively working on expanding EVI's ability to follow system prompts for both language and voice generation. For now, focus prompting on guiding EVI's conversational behavior and responses while working within these constraints.

# Frequently Asked Questions

## Can EVI use backchanneling to avoid interrupting when the user pauses or has an incomplete thought?

Yes, EVI can use conversational **backchanneling** - brief, encouraging responses that show active listening without interrupting the user's train of thought. This can help conversations feel more fluid and natural. To enable this behavior, add an instruction like the example below to your system prompt:

### Backchanneling Example

```xml
<backchannel>
  Whenever the user's message seems incomplete, respond with emotionally attuned, natural backchannels to encourage continuation. Backchannels must always be 1-2 words, like: "mmhm", "uh-huh", "go on", "right", "and then?", "I see", "oh wow", "yes?", "ahh...", "really?", "oooh", "true", "makes sense". Use minimal encouragers rather than interrupting with complete sentences. Use a diverse variety of words, avoiding repetition.

  Assistant: "How is your day going?"
  User: "My day is..."
  Assistant: "Uh-huh?"
  User: "it's good but busy. There's a lot going on."
  Assistant: "I hear ya. What's going on for you?"
</backchannel>
```

## What is the maximum length for system prompts?

The maximum length depends on the supplemental LLM being used. For example, GPT-4 has a 32k token context window, while Claude 3 Haiku has a 200k token context window. Check the context window for your LLM to ensure that your prompt is within this limit. We recommend keeping system prompts around 2000-5000 tokens (roughly 1500-4000 words) for optimal performance across all models. EVI also uses prompt caching (e.g. see **Anthropic docs**) to minimize the cost and latency when using very long prompts.

## How do system prompts work with supplemental LLMs?

When using a supplemental LLM, a single system prompt still shapes both text and speech generation. There is not a separate system prompt for EVI 2 - the prompt you specify in platform.hume.ai is the prompt that is used. All EVI-specific prompting instructions (like `<voice_only_response_format>`) are included in the prompt sent to the supplemental LLM to help it generate text appropriate for voice conversations. This unified approach ensures consistent behavior across text generation and speech synthesis.

## How exactly does Hume change the payload (the transcript and prompt) sent to the LLM provider?

When sending API requests to supplemental LLM providers, Hume sends the context, settings, and system prompt you provided, with only three possible modifications. These three changes, described below, help optimize the interaction for an empathic voice conversation.

1. **Expression measures:** For each transcribed user message, Hume appends stringified expression measurement results in a structured format as described in the **Expressive prompt engineering** section above:

```
User: User message content here {expression1 confidence1, expression2 confidence2, expression3 confidence3}
```

This provides the LLM with emotional context from the user's voice to generate more empathetic responses. Our speech-language model handles these expressions natively, but these strings are necessary to allow supplemental LLMs to respond to the expressions.

2. **Normalization prompt:** Hume appends a normalization prompt to your system prompt. This ensures consistent, stable, and fluid speech generation across different LLM providers, and means that developers don't have to manually add this prompt to benefit from it. The exact normalization prompt can be found in the **Normalize output text** section above.

3. **System default prompt (only when using a supplemental LLM with an empty prompt):** When no custom prompt is provided (the prompt field is an empty string), Hume sends our system default prompt to the supplemental LLM.

These modifications work in conjunction with your custom system prompt while ensuring that responses remain appropriate for voice-based interactions.

