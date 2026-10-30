# Diagnostics

> Governs ty's levels and its suppressions.

## General

### ty-is-the-type-gate → rule-held-by-a-tool-where-one-can · MUST

ty's configuration makes every rule an error and fails on a warning.

| Why |
|---|
| a rule left at a warning or off is a rule the type checker sees broken and lets pass. |

### type-ignore-silences-nothing → suppression-silences-one-finding · MUST

A `# type: ignore` silences nothing.

| Why |
|---|
| ty otherwise honours `# type: ignore`, which names no rule of ty's and silences every finding on its line. |
