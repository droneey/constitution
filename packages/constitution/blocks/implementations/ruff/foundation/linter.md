# Linter

> Governs the rules Ruff selects and how a finding of one is suppressed.

## General

### preview-rules-only-by-code → linter-rules-turned-on-by-name · MUST

A preview rule is selected only by its exact code, with `explicit-preview-rules = true`, never through a family.

| Why |
|---|
| a family in preview grows with each release; a code names one rule someone read. |

### ruff-suppression-names-one-code-and-reason → suppression-silences-one-finding · MUST

A suppression is `# noqa: <code>` on the finding's line, with its reason after it; never a bare `# noqa` nor a file-level `# ruff: noqa`.

| Why |
|---|
| Ruff also reads a bare `# noqa`, which silences every rule on its line, and `# ruff: noqa`, which silences a rule across the whole file. |
