---
id: python-check
summary: The constitution's own check of what no Python tool holds.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [python-check]
governs: []
---

# python-check

> Holds the rules of Python no other tool holds: the length of a function and a file, where a relative import may reach, and where a package may be imported. It ships in the constitution's release archive as `tools/python-check/dist/python-check.pyz`, which the project's interpreter runs, and it fails on each finding, printed as `<path>:<line>: <message>`. It reads `[tool.python-check]` of the `pyproject.toml` in the folder it runs from: `extend` lists the parts of the release archive, `presets/python/python-check/architecture/<block>.toml`, each a `[homes]` table that gives its block's package the folders it is imported in, `edge` naming the whole edge; the project's own `[tool.python-check.homes]` comes last. The units its `[tool.uv.sources]` links from the workspace are the repository's own code, never a package.
