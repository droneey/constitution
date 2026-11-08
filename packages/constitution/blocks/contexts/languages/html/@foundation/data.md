# Data

> Governs the encoding a document declares.

## Encoding

### document-declares-utf-8-first → text-encoded-as-utf-8 · MUST

Every document declares `<meta charset="utf-8">` within its first 1024 bytes.

| Why |
|---|
| the browser decides the encoding from the first 1024 bytes alone, so a declaration later than them, or none, leaves it to guess, and a wrong guess turns every character outside ASCII into other text. |
