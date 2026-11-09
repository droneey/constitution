---
id: rumdl
summary: rumdl lints and formats Markdown.
requires: [markdown, task-runner]
languages: [markdown]
governs: [".rumdl.toml"]
---

# rumdl

> rumdl, the `rumdl` command, lints and formats Markdown.

rumdl resolves its configuration per folder, so a nested `.rumdl.toml` applies to the files below it, unless `--config` or `--no-config` is given; `constitution` writes the settings of every block into the root's `.rumdl.toml`. It fails on a finding of any severity.
