# Linter

> Governs the rules Ruff selects and how a finding of one is suppressed.

## General

### preview-rules-only-by-code · SHOULD

A preview rule is selected only by its exact code, with `explicit-preview-rules = true`, never through a family.

| Why |
|---|
| a family in preview grows with each release, so an update turns on rules nobody read and fails the check on them; a code names one rule someone read. |

### ruff-suppression-names-one-code-and-reason → suppression-silences-one-finding · MUST

A Ruff suppression names one code and its reason. It is `# noqa: <code>` on the finding's line, with its reason after it; never a bare `# noqa` nor a file-level `# ruff: noqa`.

| Why |
|---|
| Ruff also reads a bare `# noqa`, which silences every rule on its line, and `# ruff: noqa`, which silences a rule across the whole file, so either hides findings nobody meant to lift. |
