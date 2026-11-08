# Types

> Governs a YAML scalar and a key: how a boolean is spelled, which scalars are quoted, the merge key and the schema a reader resolves scalars by.

## Scalars

### boolean-written-true-or-false · MUST

Every boolean is written `true` or `false`, in lower case.

| Why |
|---|
| YAML 1.1 also reads `yes`, `no`, `on` and `off` as booleans while YAML 1.2 reads them as text, and the YAML 1.2 schema strict readers use takes only the lower-case `true` and `false`, so any other spelling means different things to different readers — YAML 1.2. |

### ambiguous-scalar-quoted · MUST

Every scalar meant as text that any reader resolves to another type is quoted. Such scalars include `no`, `on`, `null`, `~`, `3.10`, `0755`, `1:20` and `2026-10-11`. Exempt: a key the file's own reader defines, such as the `on` key of a continuous-integration file.

| Why |
|---|
| a YAML 1.1 reader turns `no` into false, `0755` into 493, `1:20` into 80 and a date into a timestamp, and every reader turns `3.10` into 3.1, so the value changes with no error. |

### reader-resolves-scalars-by-the-core-schema · MUST

Every YAML reader the program runs resolves unquoted scalars by YAML 1.2's core schema.

| Why |
|---|
| under another schema a reader turns words into booleans, dates or base-60 numbers the writer meant as text, so the program reads a value nobody wrote; under the core schema only `true` and `false`, in lower, title or upper case, are booleans — YAML 1.2. |

## Keys

### merge-key-never-used · MUST

No mapping uses the merge key `<<`. Exempt: a file whose own reader defines the key.

| Why |
|---|
| the merge key belongs to YAML 1.1 alone: a YAML 1.2 reader takes `<<` as an ordinary key, and the readers that merge do not merge alike — YAML 1.2. |
