---
id: rumdl
summary: rumdl lints and formats Markdown.
requires: [markdown, toml, _task-runner]
extends: null
abstract: false
languages: [markdown]
governs: [".rumdl.toml"]
---

# rumdl

> **`rumdl`** lints and formats Markdown.

rumdl reads one configuration for the whole repository, into which `constitution` writes the settings of every block, and ignores a nested **`.rumdl.toml`**{#rumdl-settings}. It fails on a finding of any severity.
