# Formatter

> Governs the formatter of TOML.

## General

### tombi-is-the-formatter → one-formatter-per-language · MUST

tombi formats every TOML file and keeps the keys and the items of an array in the order they are written.

| Why |
|---|
| two formatters of TOML undo each other's work, and one that ordered keys by a schema would move a key away from the comment above it. |
