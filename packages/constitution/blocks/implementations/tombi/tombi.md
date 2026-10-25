---
id: tombi
summary: tombi formats and lints TOML files.
requires: [toml]
extends: null
abstract: false
languages: [toml]
governs: ["tombi.toml"]
---

# tombi

> **`tombi`** formats TOML and lints it against the schema of each file it knows.

tombi reads no other file from **`tombi.toml`**, and only the one in the folder it runs in or above it, so the parts are copied into the file of each folder a run starts from.

A comment that opens with `tombi:` is a directive to tombi, so the line that names the block in a fragment reads `# tombi — …`.
