# Types

> Governs the strings that hold a backslash.

## Strings

### value-holding-a-backslash-is-a-literal-string · MUST

A string that holds a backslash — a regular expression, a Windows path — is a literal string, `'…'` or `'''…'''`.

| Why |
|---|
| a basic string reads `\b`, `\t`, `\n`, `\f` and `\r` as control characters and refuses other escapes, so `"\bword\b"` changes its meaning with no error. |
