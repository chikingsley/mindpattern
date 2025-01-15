# Fix typo in prompt version endpoint name

This PR fixes a typo in the API definition where `createPromptVersion` is spelled as `createPromptVerison`.

## Changes
- Fixed the endpoint name in `.mock/definition/empathic-voice/prompts.yml` from `create-prompt-verison` to `create-prompt-version`

## Impact
This typo currently appears in the auto-generated TypeScript SDK, causing developers to use the misspelled method name. After this fix, the SDK will need to be regenerated to update all affected files:

- `src/api/resources/empathicVoice/resources/prompts/client/Client.ts`
- `src/serialization/resources/empathicVoice/resources/prompts/client/createPromptVerison.ts`
- `src/serialization/resources/empathicVoice/resources/prompts/client/index.ts`

## Testing
After regenerating the SDK, developers will be able to use the correctly spelled method:
```typescript
await client.empathicVoice.prompts.createPromptVersion({
  id: 'prompt-id',
  text: 'prompt text'
});
```

Instead of having to use the misspelled version:
```typescript
await client.empathicVoice.prompts.createPromptVerison({
  id: 'prompt-id',
  text: 'prompt text'
});
```
