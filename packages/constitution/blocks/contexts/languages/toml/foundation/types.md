# Types

> Governs a value in TOML and its type: a string that holds a backslash.

## Strings

### value-holding-a-backslash-is-a-literal-string → string-holding-a-backslash-written-literally · MUST

A string that holds a backslash is a literal string, `'…'` or `'''…'''`, never a basic one.

| Why |
|---|
| a basic string reads `\b`, `\t`, `\n`, `\f` and `\r` as control characters and refuses other escapes, so `"\bword\b"` changes its meaning with no error. |
