# Data

> Governs YAML written as data: the form of a string that holds a backslash.

## Strings

### value-holding-a-backslash-never-double-quoted → string-holding-a-backslash-written-literally · MUST

No YAML string that holds a backslash is double-quoted. It is plain, it is single-quoted, as `'\bword\b'`, or it is a block scalar.

#### Why

A double-quoted scalar reads `\b`, `\t`, `\n` and `\f` as control characters and refuses other escapes, so `"\bword\b"` changes its meaning with no error.

#### Examples

```yaml title="Avoid"
redaction:
  patterns:
    - "\bcard\b"  # \b is read as a backspace
```

```yaml title="Prefer"
redaction:
  patterns:
    - '\bcard\b'
```
