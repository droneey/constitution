---
id: rumdl
summary: rumdl lints and formats Markdown.
requires: [markdown]
extends: null
abstract: false
languages: [markdown]
dictionary: [rumdl, .rumdl.toml]
governs: [".rumdl.toml"]
---

# rumdl

> Lints and formats Markdown.

`extends` names one file, so the parts form a chain, each extending the one before. rumdl reads one configuration for the whole repository and ignores a nested `.rumdl.toml`. It fails on a finding of any severity.
