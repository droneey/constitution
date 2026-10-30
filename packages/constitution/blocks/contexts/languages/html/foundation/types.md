# Types

> Governs a value in a document and its type: the encoding the document declares and how a boolean attribute is written.

## Encoding

### document-declares-utf-8-first → text-encoded-as-utf-8 · MUST

A document declares `<meta charset="utf-8">` within its first 1024 bytes.

| Why |
|---|
| the browser settles the encoding from the first 1024 bytes alone, so a declaration later than them, or none, leaves it to guess, and a wrong guess turns every character outside ASCII into other text. |

## Attributes

### boolean-attribute-written-by-presence · MUST

A boolean attribute is present where it is true and absent where it is false — never `disabled="false"`, which the browser reads as true.

| Why |
|---|
| the browser reads any value of a boolean attribute, `"false"` included, as true, so `disabled="false"` disables. |
