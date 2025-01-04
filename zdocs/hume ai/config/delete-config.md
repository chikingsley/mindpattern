# Delete Config

## DELETE /v0/evi/configs/:id

Deletes a Config and its versions. For more details on configuration options and how to configure EVI, see our configuration guide.

### Path Parameters

id (string, Required) Identifier for a Config (UUID format)

### Example Request

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.configs.deleteConfig("1b60e1a0-cc59-424a-8d2c-189d354db3f3");
```