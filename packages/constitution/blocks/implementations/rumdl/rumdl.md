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

> Lints and formats Markdown. `.rumdl.toml` extends `presets/markdown/rumdl/core.toml` of the constitution's release archive, which extends `self.toml` — rumdl's default rules, the opt-in ones the rules of `markdown` and of core need, and its defaults that are stricter than those rules turned off — and `presets/markdown/rumdl/bindings.yaml` says which code holds which rule. It fails on a finding of any severity.

### rumdl-fmt-is-the-formatter → one-formatter-per-language · MUST

rumdl formats every Markdown document, by the fixes of the rules it runs.

| Why | Tags |
|---|---|
| one formatter for Markdown ends every argument about its layout. | [] |

### rule-lists-extended-never-replaced · MUST

A project adds a rule with `extend-enable` and removes one with `extend-disable`, never with `enable` or `disable`, and a `[per-file-ignores]` of its own repeats the archive's entries.

| Why | Tags |
|---|---|
| `disable` and `[per-file-ignores]` replace the archive's and bring back what it lifted, and `enable` turns off every default rule it does not name, so rumdl stops formatting. | [] |

### rumdl-suppression-names-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `<!-- rumdl-disable-next-line MD<nnn> -->` on the line above its finding, followed on that line by its reason in a comment of its own; never a `rumdl-disable` over a range or a `rumdl-disable-file`.

| Why | Tags |
|---|---|
| rumdl reads each word after the code as the name of another rule, and a range or a file silences the rule on every line it covers. | [] |
