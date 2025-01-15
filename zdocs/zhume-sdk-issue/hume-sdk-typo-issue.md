**Describe the bug**
There's a typo in the SDK's TypeScript definitions where `createPromptVersion` is spelled as `createPromptVerison` (with an 'i' instead of an 'e'). The typo appears to be in the auto-generated code from Fern.

**To Reproduce**
1. Install the Hume SDK: `pnpm i hume`
2. Create a TypeScript file with the following code:
```typescript
import { HumeClient } from 'hume';

const client = new HumeClient({ apiKey: 'xxx' });

// This fails with TypeScript error:
await client.empathicVoice.prompts.createPromptVersion({
  id: 'prompt-id',
  text: 'prompt text'
});

// Have to use misspelled version:
await client.empathicVoice.prompts.createPromptVerison({
  id: 'prompt-id',
  text: 'prompt text'
});
```
3. TypeScript will show an error: "Property 'createPromptVersion' does not exist on type 'Prompts'. Did you mean 'createPromptVerison'?"

**Expected behavior**
The method should be spelled correctly as `createPromptVersion` to maintain consistency and avoid confusion.

**Screenshots**
N/A

**Desktop (please complete the following information):**
- OS: macOS
- Package Manager: pnpm
- Node Version: 20.x
- TypeScript Version: 5.6.2
- Hume SDK Version: 0.9.8

**Smartphone (please complete the following information):**
N/A - This is a development SDK issue

**Additional context**
Found the root cause! The typo originates in the API definition YAML:

`.mock/definition/empathic-voice/prompts.yml`:
```yaml
endpoints:
  create-prompt-verison:  # <-- Typo here
    path: /v0/evi/prompts/{id}
    method: POST
    auth: true
```

This typo then propagates to multiple places in the auto-generated code:

Main implementation:
- File: `src/api/resources/empathicVoice/resources/prompts/client/Client.ts` (Line 343)
```typescript
public async createPromptVerison(
  id: string,
  request: Hume.empathicVoice.PostedPromptVersion,
  requestOptions?: Prompts.RequestOptions
): Promise<Hume.empathicVoice.ReturnPrompt | undefined>
```

Also appears in:
- Same file, line 338 (example code)
- Same file, line 373 (serializer call)
- `src/serialization/resources/empathicVoice/resources/prompts/client/createPromptVerison.ts` (line 11)
- `src/serialization/resources/empathicVoice/resources/prompts/client/index.ts` (line 2)

The fix needs to be made in the API definition YAML file, which will then correct all the auto-generated code.
