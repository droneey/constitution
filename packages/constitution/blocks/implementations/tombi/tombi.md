---
id: tombi
summary: tombi formats and lints TOML files.
requires: [toml, _task-runner]
extends: null
abstract: false
languages: [toml]
governs: ["tombi.toml"]
---

# tombi

> **`tombi`** formats TOML and lints it against the schema of each file it knows.

tombi reads no other file from **`tombi.toml`**, and only the one in the folder it runs in or above it, so the program writes the settings into the file of each unit a run starts from.
