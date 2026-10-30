# Linter

> Governs the rules Ruff selects.

## General

### preview-rules-only-by-code → linter-rules-turned-on-by-name · MUST

A preview rule is selected only by its exact code, with `explicit-preview-rules = true`, never through a family.

| Why |
|---|
| a family in preview grows with each release; a code names one rule someone read. |
