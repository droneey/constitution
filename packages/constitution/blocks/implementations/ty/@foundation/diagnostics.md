# Diagnostics

> Governs ty's diagnostics: how one is suppressed.

## General

### type-ignore-silences-nothing → suppression-silences-one-finding · MUST

ty's configuration never honours a `# type: ignore` comment. `respect-type-ignore-comments = false` is set under `[tool.ty.analysis]`.

| Why |
|---|
| ty otherwise honours `# type: ignore`, which names no rule of ty's and silences every finding on its line. |
