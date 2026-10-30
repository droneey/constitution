# Diagnostics

> Governs ty's suppressions.

## General

### type-ignore-silences-nothing → suppression-silences-one-finding · MUST

A `# type: ignore` silences nothing.

| Why |
|---|
| ty otherwise honours `# type: ignore`, which names no rule of ty's and silences every finding on its line. |
