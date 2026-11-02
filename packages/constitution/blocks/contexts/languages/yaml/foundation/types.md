# Types

> Governs scalars and keys: booleans, quoting, merge keys and the schema a reader resolves by.

## General

### boolean-written-true-or-false · MUST

A boolean is written `true` or `false`, in lower case.

| Why |
|---|
| YAML 1.1 also reads `yes`, `no`, `on` and `off` as booleans while YAML 1.2 reads them as text, so any other spelling means different things to different readers — YAML 1.2. |

### ambiguous-scalar-quoted · MUST

A plain scalar meant as text is quoted where any reader might resolve it to another type. Such scalars include `"no"`, `"on"`, `"null"`, `"~"`, `"3.10"`, `"0755"`, `"1:20"` and `"2026-10-11"`; a key the format's own reader defines, such as a workflow's `on`, is exempt.

| Why |
|---|
| a YAML 1.1 reader turns `no` into false, `0755` into 493, `1:20` into 80 and a date into a timestamp, and every reader turns `3.10` into 3.1, so the value changes with no error. |

### value-holding-a-backslash-single-quoted → string-holding-a-backslash-written-literally · MUST

A string that holds a backslash is plain or single-quoted, `'\bword\b'`, never double-quoted.

| Why |
|---|
| a double-quoted scalar reads `\b`, `\t`, `\n` and `\f` as control characters and refuses other escapes, so `"\bword\b"` changes its meaning with no error. |

### merge-key-never-used · SHOULD

A mapping never uses the merge key `<<`. A format whose own reader defines it is exempt.

| Why |
|---|
| the merge key belongs to YAML 1.1 alone: a YAML 1.2 reader takes `<<` as an ordinary key, and the readers that merge do not merge alike — YAML 1.2. |

### reader-resolves-scalars-by-the-core-schema · SHOULD

A YAML reader the program runs resolves plain scalars by YAML 1.2's core schema.

| Why |
|---|
| under another schema a reader turns words into booleans, dates or base-60 numbers the writer meant as text, so the program reads a value nobody wrote; under the core schema only `true` and `false` are booleans — YAML 1.2. |
