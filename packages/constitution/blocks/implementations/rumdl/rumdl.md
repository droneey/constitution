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

`.rumdl.toml` extends `presets/markdown/rumdl/foundation/core.toml` of the Constitution's release archive, which extends `self.toml` — rumdl's default rules, the opt-in ones the rules of `markdown` and of core need, and its defaults that are stricter than those rules turned off — and `presets/markdown/rumdl/foundation/bindings.yaml` says which code holds which rule. It fails on a finding of any severity.
