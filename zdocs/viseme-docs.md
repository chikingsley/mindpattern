# Viseme Element

A viseme is the visual description of a phoneme in spoken language. It defines the position of the face and mouth while a person is speaking. You can use the `mstts:viseme` element in SSML to request viseme output. For more information, see Get facial position with viseme.

The viseme setting is applied to all input text within its enclosing `voice` element. To reset or change the viseme setting again, you must use a new `voice` element with either the same voice or a different voice.

## Attributes

| Attribute | Description | Required/Optional |
|-----------|-------------|------------------|
| `type` | The type of viseme output:<br>• `redlips_front` – lip-sync with viseme ID and audio offset output<br>• `FacialExpression` – blend shapes output | Required |

> **Note**: Currently, `redlips_front` only supports neural voices in `en-US` locale, and `FacialExpression` supports neural voices in `en-US` and `zh-CN` locales.

## Viseme Examples

The following SSML snippet illustrates how to request blend shapes with your synthesized speech:

```xml
<speak version="1.0" 
       xmlns="http://www.w3.org/2001/10/synthesis" 
       xmlns:mstts="http://www.w3.org/2001/mstts" 
       xml:lang="en-US">
  <voice name="en-US-AvaNeural">
    <mstts:viseme type="FacialExpression"/>
    Rainbow has seven colors: Red, orange, yellow, green, blue, indigo, and violet.
  </voice>
</speak>
```