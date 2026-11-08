---
id: tombi
summary: tombi formats and lints TOML files.
requires: [toml, task-runner]
languages: [toml]
governs: ["tombi.toml"]
---

# tombi

> tombi, the `tombi` command, formats TOML and lints it against the schema of each file it knows.

tombi reads the first of `.tombi.toml`, `tombi.toml`, `.config/tombi.toml` and `[tool.tombi]` of `pyproject.toml` that it finds in the folder it runs in or above it, so `constitution` writes the settings into the `tombi.toml` of each unit a run starts from.
