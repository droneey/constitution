# Data

> Governs TOML written as data: the form of a string that holds a backslash.

## Strings

### value-holding-a-backslash-is-a-literal-string → string-holding-a-backslash-written-literally · MUST

Every TOML string that holds a backslash is a literal string, `'…'` or `'''…'''`, never a basic one.

#### Why

A basic string reads `\b`, `\t`, `\n`, `\f` and `\r` as control characters and refuses other escapes, so `"\bword\b"` changes its meaning with no error.

#### Examples

```toml title="Avoid"
#:schema https://raw.githubusercontent.com/crate-ci/typos/master/config.schema.json
# _typos.toml
[default]
extend-ignore-re = ["\bSKU[0-9]+\b"] # \b read as a backspace
```

```toml title="Prefer"
#:schema https://raw.githubusercontent.com/crate-ci/typos/master/config.schema.json
# _typos.toml
[default]
extend-ignore-re = ['\bSKU[0-9]+\b']
```
