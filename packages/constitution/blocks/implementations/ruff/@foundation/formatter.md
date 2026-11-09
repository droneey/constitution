# Formatter

> Governs Ruff's formatter.

## General

### ruff-format-is-the-formatter → one-formatter-per-language · MUST

Ruff formats every Python file.

#### Why

Two formatters of Python undo each other's work, and a layout no formatter fixes is argued over in every review.

#### Examples

```toml title="Avoid"
[dependency-groups]
dev = ["black==25.9.0", "ruff==0.17.2"]
```

```toml title="Prefer"
[dependency-groups]
dev = ["ruff==0.17.2"]
```
