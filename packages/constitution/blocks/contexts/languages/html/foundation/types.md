# Types

> Governs the encoding a document declares and how its boolean attributes are written.

## Encoding

### document-declares-utf-8-first → text-encoded-as-utf-8 · MUST

A document declares `<meta charset="utf-8">` within its first 1024 bytes.

| Why | Tags |
|---|---|
| the browser settles the encoding from the first 1024 bytes alone, so a declaration later than them, or none, leaves it to guess, and a wrong guess turns every character outside ASCII into other text. | [data] |

## Attributes

### boolean-attribute-written-by-presence · MUST

A boolean attribute is present where it is true and absent where it is false — never `disabled="false"`, which the browser reads as true.

| Why | Tags |
|---|---|
| the browser reads any value of a boolean attribute, `"false"` included, as true, so `disabled="false"` disables. | [] |
