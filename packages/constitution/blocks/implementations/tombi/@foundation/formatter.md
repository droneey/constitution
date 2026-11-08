# Formatter

> Governs the formatter of TOML and the order it keeps.

## General

### tombi-is-the-formatter → one-formatter-per-language · MUST

Every TOML file is formatted by tombi alone.

#### Why

Two formatters of TOML undo each other's work at every run.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check:toml": "taplo format --check",
    "fix:toml": "taplo format"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check:toml": "tombi format --check && tombi lint",
    "fix:toml": "tombi format"
  }
}
```

### toml-order-kept-as-written · MUST

tombi keeps every TOML file's keys and array items in the order they are written, never in a schema's order.

#### Why

A formatter that orders keys by a schema moves a key away from the comment above it, and one that sorts an array's items changes what an ordered list means.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/tombi.json
# tombi.toml
[format.rules]
line-width = 100
```

```toml title="Prefer"
#:schema https://json.schemastore.org/tombi.json
# tombi.toml
[format.rules]
line-width = 100

[schema.format.rules]
array-values-order.enabled = false
table-keys-order.enabled = false
```
