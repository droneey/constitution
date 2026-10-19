# Types

> Governs scalars and keys: booleans, quoting, unique and merge keys, and the schema a reader resolves by.

## General

### boolean-written-true-or-false · MUST

A boolean is written `true` or `false`, in lower case.

| Why | Tags |
|---|---|
| YAML 1.1 also reads `yes`, `no`, `on` and `off` as booleans while YAML 1.2 reads them as text, so any other spelling means different things to different readers. | [data] |

### ambiguous-scalar-quoted · MUST

A plain scalar meant as text that any reader might resolve to another type is quoted — `"no"`, `"on"`, `"null"`, `"~"`, `"3.10"`, `"0755"`, `"1:20"`, `"2026-10-11"` — save a key the format's own reader defines, such as a workflow's `on`.

| Why | Tags |
|---|---|
| a YAML 1.1 reader turns `no` into false, `0755` into 493, `1:20` into 80 and a date into a timestamp, and every reader turns `3.10` into 3.1, so the value changes with no error. | [data] |

### mapping-key-unique · MUST

A key appears once in its mapping.

| Why | Tags |
|---|---|
| the specification forbids a repeated key, yet many parsers keep the last value silently, so the first one reads as set while it does nothing. | [data] |

### merge-key-never-used · SHOULD

A mapping never uses the merge key `<<`, save in a format whose own reader defines it, as Compose's does.

| Why | Tags |
|---|---|
| the merge key belongs to YAML 1.1 alone: a YAML 1.2 reader takes `<<` as an ordinary key, and the readers that merge do not merge alike. | [data] |

### reader-resolves-scalars-by-the-core-schema · SHOULD

A YAML reader the program runs resolves plain scalars by YAML 1.2's core schema.

| Why | Tags |
|---|---|
| under the core schema only `true` and `false` are booleans and no word turns into a date or a base-60 number, so the program reads what the writer meant. | [data] |
