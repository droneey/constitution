# Linter

> Governs the rules Ruff selects and how a finding of one is suppressed.

## General

### preview-rules-only-by-code → linter-rules-turned-on-by-name · MUST

Every preview rule is selected only by its exact code, with `explicit-preview-rules = true`, never through a family.

| Why |
|---|
| a family in preview grows with each release, so an update turns on rules nobody read and fails the check on them; a code names one rule someone read. |

### ruff-suppression-written-on-its-line → suppression-silences-one-finding · MUST

Every Ruff suppression names one code on the finding's line or the line above it. It is `# noqa: <code>` at the end of the line, or `# ruff: ignore[<code>]` at its end or alone on the line above; never a bare `# noqa`, a range of `# ruff: disable[...]` and `# ruff: enable[...]`, a `# ruff: file-ignore[...]` nor a file-level `# ruff: noqa`.

| Why |
|---|
| Ruff 0.17 also reads a bare `# noqa`, which silences every rule on its line, a range, which silences every line between its two comments, and the file-level forms, of which `# ruff: noqa` with no code silences every rule in the file, so each hides findings nobody meant to lift. |
