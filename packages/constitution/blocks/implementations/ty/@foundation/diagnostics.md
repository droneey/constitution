# Diagnostics

> Governs ty's diagnostics: how one is suppressed.

## General

### type-ignore-silences-nothing → suppression-silences-one-finding · MUST

ty's configuration never honours a `# type: ignore` comment. `respect-type-ignore-comments = false` is set under `[tool.ty.analysis]`.

#### Why

Ty otherwise honours `# type: ignore`, which names no rule of ty's and silences every finding on its line.

#### Examples

```toml title="Avoid"
[tool.ty.rules]
possibly-unresolved-reference = "error"
```

```toml title="Prefer"
[tool.ty.analysis]
respect-type-ignore-comments = false

[tool.ty.rules]
possibly-unresolved-reference = "error"
```
