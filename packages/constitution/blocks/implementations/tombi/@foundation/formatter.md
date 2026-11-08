# Formatter

> Governs the formatter of TOML and the order it keeps.

## General

### tombi-is-the-formatter → one-formatter-per-language · MUST

Every TOML file is formatted by tombi alone.

| Why |
|---|
| two formatters of TOML undo each other's work at every run. |

### toml-order-kept-as-written · MUST

tombi keeps every TOML file's keys and array items in the order they are written, never in a schema's order.

| Why |
|---|
| a formatter that orders keys by a schema moves a key away from the comment above it, and one that sorts an array's items changes what an ordered list means. |
