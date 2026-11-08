# Data

> Governs TOML written as data: the form of a string that holds a backslash.

## Strings

### value-holding-a-backslash-is-a-literal-string → string-holding-a-backslash-written-literally · MUST

Every TOML string that holds a backslash is a literal string, `'…'` or `'''…'''`, never a basic one.

| Why |
|---|
| a basic string reads `\b`, `\t`, `\n`, `\f` and `\r` as control characters and refuses other escapes, so `"\bword\b"` changes its meaning with no error. |
