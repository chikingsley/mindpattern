# Empathic Voice Interface (EVI)

## Chats

### List chats

**GET** `https://api.hume.ai/v0/evi/chats`

Fetches a paginated list of Chats.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page_number | integer | No | Specifies the page number to retrieve. Uses zero-based indexing (0 = first page, 1 = second page). Defaults to 0. |
| page_size | integer | No | Maximum number of results per page (1-100). Defaults to 10. |
| ascending_order | boolean | No | Sort order based on creation date. `true` for ascending (oldest first), `false` for descending (newest first). Defaults to true. |

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.chats.listChats({
    pageNumber: 0,
    pageSize: 1,
    ascendingOrder: true
});
```

#### Response

**Success Response:**

| Field | Type | Description |
|-------|------|-------------|
| page_number | integer | Current page number (zero-based) |
| page_size | integer | Maximum items per page |
| total_pages | integer | Total number of available pages |
| pagination_direction | enum | `"ASC"` or `"DESC"` - Indicates sort order |
| chats_page | array | List of Chat objects and their metadata |

```json
{
  "page_number": 0,
  "page_size": 1,
  "total_pages": 1,
  "pagination_direction": "ASC",
  "chats_page": [
    {
      "id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
      "chat_group_id": "9fc18597-3567-42d5-94d6-935bde84bf2f",
      "status": "USER_ENDED",
      "start_timestamp": 1716244940648,
      "end_timestamp": 1716244958546,
      "event_count": 3,
      "metadata": "",
      "config": {
        "id": "1b60e1a0-cc59-424a-8d2c-189d354db3f3",
        "version": 0
      }
    }
  ]
}
```

### List chat events

**GET** `https://api.hume.ai/v0/evi/chats/:id`

Fetches a paginated list of Chat events.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Chat identifier (UUID format) |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page_size | integer | No | Maximum results per page (1-100). Defaults to 10. |
| page_number | integer | No | Page number (zero-based). Defaults to 0. |
| ascending_order | boolean | No | Sort order. Defaults to true. |

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.chats.listChatEvents("470a49f6-1dec-4afe-8b61-035d3b2d63b0", {
    pageNumber: 0,
    pageSize: 3,
    ascendingOrder: true
});
```

#### Response

**Success Response:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Chat identifier (UUID) |
| chat_group_id | string | Chat Group identifier (UUID) |
| status | enum | Chat status: `ACTIVE`, `USER_ENDED`, `USER_TIMEOUT`, `MAX_DURATION_TIMEOUT`, `INACTIVITY_TIMEOUT`, `ERROR` |
| start_timestamp | long | Chat start time (Unix epoch seconds) |
| pagination_direction | enum | `"ASC"` or `"DESC"` |
| events_page | array | List of Chat Events |
| page_number | integer | Current page number |
| page_size | integer | Maximum items per page |
| total_pages | integer | Total available pages |
| end_timestamp | long | Chat end time (Unix epoch seconds). Optional, defaults to 0. |
| metadata | string | Additional chat metadata (stringified JSON). Optional. |
| config | object | Chat configuration. Optional. |

```json
{
  "id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
  "chat_group_id": "9fc18597-3567-42d5-94d6-935bde84bf2f",
  "status": "USER_ENDED",
  "start_timestamp": 1716244940648,
  "pagination_direction": "ASC",
  "events_page": [
    {
      "id": "5d44bdbb-49a3-40fb-871d-32bf7e76efe7",
      "chat_id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
      "timestamp": 1716244940762,
      "role": "SYSTEM",
      "type": "SYSTEM_PROMPT",
      "message_text": "<role>You are an AI weather assistant providing users with accurate and up-to-date weather information. Respond to user queries concisely and clearly. Use simple language and avoid technical jargon. Provide temperature, precipitation, wind conditions, and any weather alerts. Include helpful tips if severe weather is expected.</role>",
      "emotion_features": "",
      "metadata": ""
    },
    {
      "id": "5976ddf6-d093-4bb9-ba60-8f6c25832dde",
      "chat_id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
      "timestamp": 1716244956278,
      "role": "USER",
      "type": "USER_MESSAGE",
      "message_text": "Hello.",
      "emotion_features": "{\"Admiration\": 0.09906005859375, \"Adoration\": 0.12213134765625, \"Aesthetic Appreciation\": 0.05035400390625, \"Amusement\": 0.16552734375, \"Anger\": 0.0037384033203125, \"Anxiety\": 0.010101318359375, \"Awe\": 0.058197021484375, \"Awkwardness\": 0.10552978515625, \"Boredom\": 0.1141357421875, \"Calmness\": 0.115234375, \"Concentration\": 0.00444793701171875, \"Confusion\": 0.0343017578125, \"Contemplation\": 0.00812530517578125, \"Contempt\": 0.009002685546875, \"Contentment\": 0.087158203125, \"Craving\": 0.00818634033203125, \"Desire\": 0.018310546875, \"Determination\": 0.003238677978515625, \"Disappointment\": 0.024169921875, \"Disgust\": 0.00702667236328125, \"Distress\": 0.00936126708984375, \"Doubt\": 0.00632476806640625, \"Ecstasy\": 0.0293731689453125, \"Embarrassment\": 0.01800537109375, \"Empathic Pain\": 0.0088348388671875, \"Entrancement\": 0.013397216796875, \"Envy\": 0.02557373046875, \"Excitement\": 0.12109375, \"Fear\": 0.004413604736328125, \"Guilt\": 0.016571044921875, \"Horror\": 0.00274658203125, \"Interest\": 0.2142333984375, \"Joy\": 0.29638671875, \"Love\": 0.16015625, \"Nostalgia\": 0.007843017578125, \"Pain\": 0.007160186767578125, \"Pride\": 0.00508880615234375, \"Realization\": 0.054229736328125, \"Relief\": 0.048736572265625, \"Romance\": 0.026397705078125, \"Sadness\": 0.0265350341796875, \"Satisfaction\": 0.051361083984375, \"Shame\": 0.00974273681640625, \"Surprise (negative)\": 0.0218963623046875, \"Surprise (positive)\": 0.216064453125, \"Sympathy\": 0.021728515625, \"Tiredness\": 0.0173797607421875, \"Triumph\": 0.004520416259765625}",
      "metadata": "{\"segments\": [{\"content\": \"Hello.\", \"embedding\": [0.6181640625, 0.1763916015625, -30.921875, 1.2705078125, 0.927734375, 0.63720703125, 2.865234375, 0.1080322265625, 0.2978515625, 1.0107421875, 1.34375, 0.74560546875, 0.416259765625, 0.99462890625, -0.333740234375, 0.361083984375, -1.388671875, 1.0107421875, 1.3173828125, 0.55615234375, 0.541015625, -0.1837158203125, 1.697265625, 0.228515625, 2.087890625, -0.311767578125, 0.053680419921875, 1.3349609375, 0.95068359375, 0.00441741943359375, 0.705078125, 1.8916015625, -0.939453125, 0.93701171875, -0.28955078125, 1.513671875, 0.5595703125, 1.0126953125, -0.1624755859375, 1.4072265625, -0.28857421875, -0.4560546875, -0.1500244140625, -0.1102294921875, -0.222412109375, 0.8779296875, 1.275390625, 1.6689453125, 0.80712890625, -0.34814453125, -0.325439453125, 0.412841796875, 0.81689453125, 0.55126953125, 1.671875, 0.6611328125, 0.7451171875, 1.50390625, 1.0224609375, -1.671875, 0.7373046875, 2.1328125, 2.166015625, 0.41015625, -0.127685546875, 1.9345703125, -4.2734375, 0.332275390625, 0.26171875, 0.76708984375, 0.2685546875, 0.468017578125, 1.208984375, -1.517578125, 1.083984375, 0.84814453125, 1.0244140625, -0.0072174072265625, 1.34375, 1.0712890625, 1.517578125, -0.52001953125, 0.59228515625, 0.8154296875, -0.951171875, -0.07757568359375, 1.3330078125, 1.125, 0.61181640625, 1.494140625, 0.357421875, 1.1796875, 1.482421875, 0.8046875, 0.1536865234375, 1.8076171875, 0.68115234375, -15.171875, 1.2294921875, 0.319091796875, 0.499755859375, 1.5771484375, 0.94677734375, -0.2490234375, 0.88525390625, 3.47265625, 0.75927734375, 0.71044921875, 1.2333984375, 1.4169921875, -0.56640625, -1.8095703125, 1.37109375, 0.428955078125, 1.89453125, -0.39013671875, 0.1734619140625, 1.5595703125, -1.2294921875, 2.552734375, 0.58349609375, 0.2156982421875, -0.00984954833984375, -0.6865234375, -0.0272979736328125, -0.2264404296875, 2.853515625, 1.3896484375, 0.52978515625, 0.783203125, 3.0390625, 0.75537109375, 0.219970703125, 0.384521484375, 0.385986328125, 2.0546875, -0.10443115234375, 1.5146484375, 1.4296875, 1.9716796875, 1.1318359375, 0.31591796875, 0.338623046875, 1.654296875, -0.88037109375, -0.21484375, 1.45703125, 1.0380859375, -0.52294921875, -0.47802734375, 0.1650390625, 1.2392578125, -1.138671875, 0.56787109375, 1.318359375, 0.4287109375, 0.1981201171875, 2.4375, 0.281005859375, 0.89404296875, -0.1552734375, 0.6474609375, -0.08331298828125, 0.00740814208984375, -0.045501708984375, -0.578125, 2.02734375, 0.59228515625, 0.35693359375, 1.2919921875, 1.22265625, 1.0537109375, 0.145263671875, 1.05859375, -0.369140625, 0.207275390625, 0.78857421875, 0.599609375, 0.99072265625, 0.24462890625, 1.26953125, 0.08404541015625, 1.349609375, 0.73291015625, 1.3212890625, 0.388916015625, 1.0869140625, 0.9931640625, -1.5673828125, 0.0462646484375, 0.650390625, 0.253662109375, 0.58251953125, 1.8134765625, 0.8642578125, 2.591796875, 0.7314453125, 0.85986328125, 0.5615234375, 0.9296875, 0.04144287109375, 1.66015625, 1.99609375, 1.171875, 1.181640625, 1.5126953125, 0.0224456787109375, 0.58349609375, -1.4931640625, 0.81884765625, 0.732421875, -0.6455078125, -0.62451171875, 1.7802734375, 0.01526641845703125, -0.423095703125, 0.461669921875, 4.87890625, 1.2392578125, -0.6953125, 0.6689453125, 0.62451171875, -1.521484375, 1.7685546875, 0.810546875, 0.65478515625, 0.26123046875, 1.6396484375, 0.87548828125, 1.7353515625, 2.046875, 1.5634765625, 0.69384765625, 1.375, 0.8916015625, 1.0107421875, 0.1304931640625, 2.009765625, 0.06402587890625, -0.08428955078125, 0.04351806640625, -1.7529296875, 2.02734375, 3.521484375, 0.404541015625, 1.6337890625, -0.276611328125, 0.8837890625, -0.1287841796875, 0.91064453125, 0.8193359375, 0.701171875, 0.036529541015625, 1.26171875, 1.0478515625, -0.1422119140625, 1.0634765625, 0.61083984375, 1.3505859375, 1.208984375, 0.57275390625, 1.3623046875, 2.267578125, 0.484375, 0.9150390625, 0.56787109375, -0.70068359375, 0.27587890625, -0.70654296875, 0.8466796875, 0.57568359375, 1.6162109375, 0.87939453125, 2.248046875, -0.5458984375, 1.7744140625, 1.328125, 1.232421875, 0.6806640625, 0.9365234375, 1.052734375, -1.08984375, 1.8330078125, -0.4033203125, 1.0673828125, 0.297607421875, 1.5703125, 1.67578125, 1.34765625, 2.8203125, 2.025390625, -0.48583984375, 0.7626953125, 0.01007843017578125, 1.435546875, 0.007205963134765625, 0.05157470703125, -0.9853515625, 0.26708984375, 1.16796875, 1.2041015625, 1.99609375, -0.07916259765625, 1.244140625, -0.32080078125, 0.6748046875, 0.419921875, 1.3212890625, 1.291015625, 0.599609375, 0.0550537109375, 0.9599609375, 0.93505859375, 0.111083984375, 1.302734375, 0.0833740234375, 2.244140625, 1.25390625, 1.6015625, 0.58349609375, 1.7568359375, -0.263427734375, -0.019866943359375, -0.24658203125, -0.1871337890625, 0.927734375, 0.62255859375, 0.275146484375, 0.79541015625, 1.1796875, 1.1767578125, -0.26123046875, -0.268310546875, 1.8994140625, 1.318359375, 2.1875, 0.2469482421875, 1.41015625, 0.03973388671875, 1.2685546875, 1.1025390625, 0.9560546875, 0.865234375, -1.92578125, 1.154296875, 0.389892578125, 1.130859375, 0.95947265625, 0.72314453125, 2.244140625, 0.048553466796875, 0.626953125, 0.42919921875, 0.82275390625, 0.311767578125, -0.320556640625, 0.01041412353515625, 0.1483154296875, 0.10809326171875, -0.3173828125, 1.1337890625, -0.8642578125, 1.4033203125, 0.048828125, 1.1787109375, 0.98779296875, 1.818359375, 1.1552734375, 0.6015625, 1.2392578125, -1.2685546875, 0.39208984375, 0.83251953125, 0.224365234375, 0.0019989013671875, 0.87548828125, 1.6572265625, 1.107421875, 0.434814453125, 1.8251953125, 0.442626953125, 1.2587890625, 0.09320068359375, -0.896484375, 1.8017578125, 1.451171875, -0.0755615234375, 0.6083984375, 2.06640625, 0.673828125, -0.33740234375, 0.192138671875, 0.21435546875, 0.80224609375, -1.490234375, 0.9501953125, 0.86083984375, -0.40283203125, 4.109375, 2.533203125, 1.2529296875, 0.8271484375, 0.225830078125, 1.0478515625, -1.9755859375, 0.841796875, 0.392822265625, 0.525390625, 0.33935546875, -0.79443359375, 0.71630859375, 0.97998046875, -0.175537109375, 0.97705078125, 1.705078125, 0.29638671875, 0.68359375, 0.54150390625, 0.435791015625, 0.99755859375, -0.369140625, 1.009765625, -0.140380859375, 0.426513671875, 0.189697265625, 1.8193359375, 1.1201171875, -0.5009765625, -0.331298828125, 0.759765625, -0.09442138671875, 0.74609375, -1.947265625, 1.3544921875, -3.935546875, 2.544921875, 1.359375, 0.1363525390625, 0.79296875, 0.79931640625, -0.3466796875, 1.1396484375, -0.33447265625, 2.0078125, -0.241455078125, 0.6318359375, 0.365234375, 0.296142578125, 0.830078125, 1.0458984375, 0.5830078125, 0.61572265625, 14.0703125, -2.0078125, -0.381591796875, 1.228515625, 0.08282470703125, -0.67822265625, -0.04339599609375, 0.397216796875, 0.1656494140625, 0.137451171875, 0.244873046875, 1.1611328125, -1.3818359375, 0.8447265625, 1.171875, 0.36328125, 0.252685546875, 0.1197509765625, 0.232177734375, -0.020172119140625, 0.64404296875, -0.01100921630859375, -1.9267578125, 0.222412109375, 0.56005859375, 1.3046875, 1.1630859375, 1.197265625, 1.02734375, 1.6806640625, -0.043731689453125, 1.4697265625, 0.81201171875, 1.5390625, 1.240234375, -0.7353515625, 1.828125, 1.115234375, 1.931640625, -0.517578125, 0.77880859375, 1.0546875, 0.95361328125, 3.42578125, 0.0160369873046875, 0.875, 0.56005859375, 1.2421875, 1.986328125, 1.4814453125, 0.0948486328125, 1.115234375, 0.00665283203125, 2.09375, 0.3544921875, -0.52783203125, 1.2099609375, 0.45068359375, 0.65625, 0.1112060546875, 1.0751953125, -0.9521484375, -0.30029296875, 1.4462890625, 2.046875, 3.212890625, 1.68359375, 1.07421875, -0.5263671875, 0.74560546875, 1.37890625, 0.15283203125, 0.2440185546875, 0.62646484375, -0.1280517578125, 0.7646484375, -0.515625, -0.35693359375, 1.2958984375, 0.96923828125, 0.58935546875, 1.3701171875, 1.0673828125, 0.2337646484375, 0.93115234375, 0.66357421875, 6.0, 1.1025390625, -0.51708984375, -0.38330078125, 0.7197265625, 0.246826171875, -0.45166015625, 1.9521484375, 0.5546875, 0.08807373046875, 0.18505859375, 0.8857421875, -0.57177734375, 0.251708984375, 0.234375, 2.57421875, 0.9599609375, 0.5029296875, 0.10382080078125, 0.08331298828125, 0.66748046875, -0.349609375, 1.287109375, 0.259765625, 2.015625, 2.828125, -0.3095703125, -0.164306640625, -0.3408203125, 0.486572265625, 0.8466796875, 1.9130859375, 0.09088134765625, 0.66552734375, 0.00972747802734375, -0.83154296875, 1.755859375, 0.654296875, 0.173828125, 0.27587890625, -0.47607421875, -0.264404296875, 0.7529296875, 0.6533203125, 0.7275390625, 0.499755859375, 0.833984375, -0.44775390625, -0.05078125, -0.454833984375, 0.75439453125, 0.68505859375, 0.210693359375, -0.283935546875, -0.53564453125, 0.96826171875, 0.861328125, -3.33984375, -0.26171875, 0.77734375, 0.26513671875, -0.14111328125, -0.042236328125, -0.84814453125, 0.2137451171875, 0.94921875, 0.65185546875, -0.5380859375, 0.1529541015625, -0.360595703125, -0.0333251953125, -0.69189453125, 0.8974609375, 0.7109375, 0.81494140625, -0.259521484375, 1.1904296875, 0.62158203125, 1.345703125, 0.89404296875, 0.70556640625, 1.0673828125, 1.392578125, 0.5068359375, 0.962890625, 0.736328125, 1.55078125, 0.50390625, -0.398681640625, 2.361328125, 0.345947265625, -0.61962890625, 0.330078125, 0.75439453125, -0.673828125, -0.2379150390625, 1.5673828125, 1.369140625, 0.1119384765625, -0.1834716796875, 1.4599609375, -0.77587890625, 0.5556640625, 0.09954833984375, 0.0285186767578125, 0.58935546875, -0.501953125, 0.212890625, 0.02679443359375, 0.1715087890625, 0.03466796875, -0.564453125, 2.029296875, 2.45703125, -0.72216796875, 2.138671875, 0.50830078125, -0.09356689453125, 0.230224609375, 1.6943359375, 1.5126953125, 0.39453125, 0.411376953125, 1.07421875, -0.8046875, 0.51416015625, 0.2271728515625, -0.283447265625, 0.38427734375, 0.73388671875, 0.6962890625, 1.4990234375, 0.02813720703125, 0.40478515625, 1.2451171875, 1.1162109375, -5.5703125, 0.76171875, 0.322021484375, 1.0361328125, 1.197265625, 0.1163330078125, 0.2425537109375, 1.5595703125, 1.5791015625, -0.0921630859375, 0.484619140625, 1.9052734375, 5.31640625, 1.6337890625, 0.95947265625, -0.1751708984375, 0.466552734375, 0.8330078125, 1.03125, 0.2044677734375, 0.31298828125, -1.1220703125, 0.5517578125, 0.93505859375, 0.45166015625, 1.951171875, 0.65478515625, 1.30859375, 1.0859375, 0.56494140625, 2.322265625, 0.242919921875, 1.81640625, -0.469970703125, -0.841796875, 0.90869140625, 1.5361328125, 0.923828125, 1.0595703125, 0.356689453125, -0.46142578125, 2.134765625, 1.3037109375, -0.32373046875, -9.2265625, 0.4521484375, 0.88037109375, -0.53955078125, 0.96484375, 0.7705078125, 0.84521484375, 1.580078125, -0.1448974609375, 0.7607421875, 1.0166015625, -0.086669921875, 1.611328125, 0.05938720703125, 0.5078125, 0.8427734375, 2.431640625, 0.66357421875, 3.203125, 0.132080078125, 0.461181640625, 0.779296875, 1.9482421875, 1.8720703125, 0.845703125, -1.3837890625, -0.138916015625, 0.35546875, 0.2457275390625, 0.75341796875, 1.828125, 1.4169921875, 0.60791015625, 1.0068359375, 1.109375, 0.484130859375, -0.302001953125, 0.4951171875, 0.802734375, 1.9482421875, 0.916015625, 0.1646728515625, 2.599609375, 1.7177734375, -0.2374267578125, 0.98046875, 0.39306640625, -1.1396484375, 1.6533203125, 0.375244140625], \"scores\": [0.09906005859375, 0.12213134765625, 0.05035400390625, 0.16552734375, 0.0037384033203125, 0.010101318359375, 0.058197021484375, 0.10552978515625, 0.1141357421875, 0.115234375, 0.00444793701171875, 0.00812530517578125, 0.0343017578125, 0.009002685546875, 0.087158203125, 0.00818634033203125, 0.003238677978515625, 0.024169921875, 0.00702667236328125, 0.00936126708984375, 0.00632476806640625, 0.0293731689453125, 0.01800537109375, 0.0088348388671875, 0.013397216796875, 0.02557373046875, 0.12109375, 0.004413604736328125, 0.016571044921875, 0.00274658203125, 0.2142333984375, 0.29638671875, 0.16015625, 0.007843017578125, 0.007160186767578125, 0.00508880615234375, 0.054229736328125, 0.048736572265625, 0.026397705078125, 0.0265350341796875, 0.051361083984375, 0.018310546875, 0.00974273681640625, 0.0218963623046875, 0.216064453125, 0.021728515625, 0.0173797607421875, 0.004520416259765625], \"stoks\": [52, 52, 52, 52, 52, 41, 41, 374, 303, 303, 303, 427], \"time\": {\"begin_ms\": 640, \"end_ms\": 1140}}]}"
    },
    {
      "id": "7645a0d1-2e64-410d-83a8-b96040432e9a",
      "chat_id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
      "timestamp": 1716244957031,
      "role": "AGENT",
      "type": "AGENT_MESSAGE",
      "message_text": "Hello!",
      "emotion_features": "{\"Admiration\": 0.044921875, \"Adoration\": 0.0253753662109375, \"Aesthetic Appreciation\": 0.03265380859375, \"Amusement\": 0.118408203125, \"Anger\": 0.06719970703125, \"Anxiety\": 0.0411376953125, \"Awe\": 0.03802490234375, \"Awkwardness\": 0.056549072265625, \"Boredom\": 0.04217529296875, \"Calmness\": 0.08709716796875, \"Concentration\": 0.070556640625, \"Confusion\": 0.06964111328125, \"Contemplation\": 0.0343017578125, \"Contempt\": 0.037689208984375, \"Contentment\": 0.059417724609375, \"Craving\": 0.01132965087890625, \"Desire\": 0.01406097412109375, \"Determination\": 0.1143798828125, \"Disappointment\": 0.051177978515625, \"Disgust\": 0.028594970703125, \"Distress\": 0.054901123046875, \"Doubt\": 0.04638671875, \"Ecstasy\": 0.0258026123046875, \"Embarrassment\": 0.0222015380859375, \"Empathic Pain\": 0.015777587890625, \"Entrancement\": 0.0160980224609375, \"Envy\": 0.0163421630859375, \"Excitement\": 0.129638671875, \"Fear\": 0.03125, \"Guilt\": 0.01483917236328125, \"Horror\": 0.0194549560546875, \"Interest\": 0.1341552734375, \"Joy\": 0.0738525390625, \"Love\": 0.0216522216796875, \"Nostalgia\": 0.0210418701171875, \"Pain\": 0.020721435546875, \"Pride\": 0.05499267578125, \"Realization\": 0.0728759765625, \"Relief\": 0.04052734375, \"Romance\": 0.0129241943359375, \"Sadness\": 0.0254669189453125, \"Satisfaction\": 0.07159423828125, \"Shame\": 0.01495361328125, \"Surprise (negative)\": 0.05560302734375, \"Surprise (positive)\": 0.07965087890625, \"Sympathy\": 0.022247314453125, \"Tiredness\": 0.0194549560546875, \"Triumph\": 0.04107666015625}",
      "metadata": ""
    }
  ],
  "page_number": 0,
  "page_size": 3,
  "total_pages": 1,
  "end_timestamp": 1716244958546,
  "metadata": "",
  "config": {
    "id": "1b60e1a0-cc59-424a-8d2c-189d354db3f3",
    "version": 0
  }
}
```

### Get chat audio

**GET** `https://api.hume.ai/v0/evi/chats/:id/audio`

Fetches the audio of a previous Chat. For more details, see our guide on audio reconstruction.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Chat identifier (UUID format) |

```typescript
import { HumeClient } from "hume";

const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.empathicVoice.chats.getAudio("470a49f6-1dec-4afe-8b61-035d3b2d63b0");
```

#### Response

**Success Response:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Chat identifier (UUID) |
| user_id | string | User identifier (UUID) |
| status | enum | Job status: `QUEUED`, `IN_PROGRESS`, `COMPLETE`, `ERROR`, `CANCELLED` |
| filename | string | Audio reconstruction filename. Optional. |
| modified_at | long | Latest status change timestamp (Unix epoch milliseconds). Optional, defaults to 0. |
| signed_audio_url | string | Download URL for audio file. Optional. |
| signed_url_expiration_timestamp_millis | long | URL expiration timestamp (Unix epoch milliseconds). Optional, defaults to 0. |

```json
{
  "id": "470a49f6-1dec-4afe-8b61-035d3b2d63b0",
  "user_id": "e6235940-cfda-3988-9147-ff531627cf42",
  "status": "COMPLETE",
  "filename": "e6235940-cfda-3988-9147-ff531627cf42/470a49f6-1dec-4afe-8b61-035d3b2d63b0/reconstructed_audio.mp4",
  "modified_at": 1729875432555,
  "signed_audio_url": "https://storage.googleapis.com/...etc.",
  "signed_url_expiration_timestamp_millis": 1730232816964
}
```

---
The Empathic Voice Interface (EVI) captures detailed histories of conversations, allowing developers to review and analyze past interactions. This guide provides an overview of **Chats** and **Chat Groups**, instructions for retrieving chat transcripts and expression measurements, and steps to access reconstructed audio.

If [data retention is disabled](https://dev.hume.ai/docs/resources/privacy#zero-data-retention-and-data-usage-options), Chat history will not be recorded, and previous Chat data and audio reconstruction will not be retrievable.

Chats vs Chat Groups
--------------------

EVI organizes conversation history into **Chats** and **Chat Groups**.

-   **Chats**: Represents a single session from the moment a WebSocket connection is established until it disconnects. Each **Chat** contains messages and events recorded during that specific session.
-   **Chat Groups**: Links related chats to provide continuity across interactions. A group can contain one or more chats, allowing ongoing conversations to be tracked even when users reconnect to continue from a previous interaction.

When a new **Chat** session begins, it creates a new **Chat Group** by default. However, if the **Chat** resumes a previous session, it is added to the existing **Chat Group**, ensuring the conversation’s history and context are preserved across multiple **Chats**.

### Fetching Chats and Chat Groups

Each **Chat** has a unique ID and a `chat_group_id` field that links it to its associated **Chat Group**. Similarly, each **Chat Group** has its own unique ID, enabling the retrieval of individual sessions or entire groups of related sessions.

-   **Chat ID**: To obtain a Chat ID, use the [list Chats](https://dev.hume.ai/reference/empathic-voice-interface-evi/chats/list-chats) endpoint. This ID allows you to retrieve details of individual sessions or resume a previous Chat. See sample code for fetching Chats below:
    
-   **Chat Group ID**: Each Chat includes a `chat_group_id` field, which identifies the Chat Group it belongs to. To obtain a Chat Group ID directly, use the [list Chat Groups](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat-groups/list-chat-groups) endpoint. This ID is useful for accessing all Chats linked to a single conversation that spans multiple sessions. See sample code for fetching Chats below:
    

While you can retrieve these IDs using the API, the **Chat** and **Chat Group** IDs are also included at the start of every **Chat** session in a [chat\_metadata](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Chat%20Metadata.type) message. This is particularly useful if your integration needs to associate data or actions with **Chats** as they are initiated.

### Viewing Chats in the Platform UI

You can also view chat history and obtain Chat IDs through the Platform UI:

1.  Go to the [Chat history page](https://platform.hume.ai/evi/chats) for a paginated list of past Chats, each displaying key details like the Chat ID, datetime, event count, and duration.
    
2.  Click **“Open”** on any Chat to view its details. The details page includes information such as status, start and end timestamps, duration, the Chat ID, Chat Group ID, associated Config ID (if any), and a paginated list of Chat Events.
    

Chat Events
-----------

During each **Chat** session, EVI records events that detail interactions between the user and the system. These events provide a complete record of user input, assistant responses, tool usage, and system commands, enabling developers to review transcripts, analyze activity, and extract expression measurements. Below is the complete list of WebSocket messages recorded as **Chat Events**:

-   [user\_message](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.User%20Message.type): Transcriptions of the user’s spoken input, with expression measures of the user’s voice.
-   [user\_interruption](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.User%20Interruption.type): Instances where the user interrupts EVI’s speech.
-   [assistant\_message](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Assistant%20Message.type): Transcriptions of EVI’s responses.
-   [tool\_call\_message](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Tool%20Call%20Message.type): Records when a tool is invoked during the conversation.
-   [tool\_response\_message](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Tool%20Response%20Message.type): Responses from tools that were invoked during the session.
-   [session\_settings](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#send.Session%20Settings.type): Configuration settings applied to the session.
-   [pause\_assistant\_message](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#send.Pause%20Assistant%20Message.type): Commands to pause EVI’s responses.
-   [resume\_assistant\_message](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#send.Resume%20Assistant%20Message.type): Commands to resume EVI’s responses after a pause.

These events cannot be modified and represent an immutable record of the conversation for transcription and analysis purposes.

### Fetching Chat Events

The **Chat Events** API provides endpoints to fetch events for a specific **Chat** or a **Chat Group**, allowing developers to retrieve detailed session data. Below are examples of how to use these endpoints:

#### Fetching chat events for a specific Chat

Use the [/chats/{chat\_id}/events](https://dev.hume.ai/reference/empathic-voice-interface-evi/chats/list-chat-events) endpoint to fetch events for a single Chat:

#### Fetching events for a specific Chat Group

Use the [/chat\_groups/{chat\_group\_id}/events](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat-groups/list-chat-group-events) endpoint to fetch events from all Chats within a specific Chat Group:

### Parsing Chat Events

**Chat Events** provide a detailed record of interactions during a **Chat** session, capturing both transcriptions and expression measurement predictions. This section demonstrates how to process these events to generate readable transcripts and analyze emotional trends.

For sample code demonstrating how to fetch and parse **Chat Events**, explore our example projects in [TypeScript](https://github.com/HumeAI/hume-api-examples/tree/main/evi-typescript-chat-history-example) and [Python](https://github.com/HumeAI/hume-api-examples/tree/main/evi-python-chat-history-example).

#### Transcription

Transcriptions of a conversation are stored in `user_message` and `assistant_message` events. These events include the speaker’s role and the corresponding text, allowing you to reconstruct the dialogue into a readable format.

For instance, you may need to create a transcript of a conversation for documentation or analysis. Transcripts can help review user intent, evaluate system responses, or provide written records for compliance or training purposes.

The following example demonstrates how to extract the **Chat** transcription from a list of **Chat Events** and save it as a text file named `transcription_<CHAT_ID>.txt`:

#### Expression measurement

Expression measurement predictions are stored in the `user_message` events under the `models.prosody.scores` property. These predictions provide confidence levels for various emotions detected in the user’s speech.

For example, you might want to gauge the emotional tone of a conversation to better understand user sentiment. This information can guide customer support strategies or highlight trends in the expression measurement predictions over time.

The following example calculates the top 3 emotions from the `user_messages` by averaging their emotion scores across the **Chat** session:

Chat audio reconstruction
-------------------------

The audio reconstruction feature allows you to listen to past conversations by stitching together all audio snippets from a Chat—including both user inputs and EVI’s responses—into a single audio file. This can be useful for reviewing interactions, quality assurance, or integrating playback functionality into your application.

### How audio reconstruction works

The audio reconstruction process combines individual audio clips into a continuous file. Here are some important considerations:

-   **Storage duration**: Reconstructed audio files are stored indefinitely.
-   **Signed URL expiration**: The signed\_audio\_url expires after 60 minutes. If it expires before you download the file, you can generate a new URL by making another API request.
-   **No merging of Chats**: The API does not support combining multiple Chats within a Chat Group into a single audio file.
-   **Asynchronous process**: Audio reconstruction is performed in the background. The time required depends on the conversation’s length and system load.

### Audio reconstruction statuses

The status of an audio reconstruction request will indicate its progress:

-   `QUEUED`: The reconstruction job is waiting to be processed.
-   `IN_PROGRESS`: The reconstruction is currently being processed.
-   `COMPLETE`: The audio reconstruction is finished and ready for download.
-   `ERROR`: An error occurred during the reconstruction process.
-   `CANCELED`: The reconstruction job has been canceled.

### Fetching reconstructed audio for a Chat

To fetch the reconstructed audio for a specific **Chat**, use the following endpoint: [/chats/{chat\_id}/audio](https://dev.hume.ai/reference/empathic-voice-interface-evi/chats/get-audio).

**Example response (audio reconstruction initiated)**:

If audio reconstruction for a **Chat** or **Chat Group** hasn’t already occurred, calling the respective endpoint will automatically add the audio reconstruction process to our job queue.

### Fetching reconstructed audio for a Chat Group

To fetch a paginated list of reconstructed audio for **Chats** within a **Chat Group**, use the following endpoint: [/chat\_groups/{chat\_group\_id}/audio](https://dev.hume.ai/reference/empathic-voice-interface-evi/chat-groups/get-audio).

### Polling for completion

Since the reconstruction process is asynchronous, you can poll the endpoint to check the status field until it changes to `COMPLETE`. Once the status is `COMPLETE`, the `signed_audio_url` and `signed_url_expiration` fields will be populated.

### Downloading the audio file

After the reconstruction is complete, you can download the audio file using the `signed_audio_url`. The following cURL command saves the audio file using the original filename provided by the server: