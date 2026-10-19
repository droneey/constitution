---
id: python-check
summary: The Constitution's own check of what no Python tool holds.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [python-check]
governs: []
---

# python-check

> Holds the rules of Python no other tool holds: the length of a function and a file, and on the architecture axis what a module may import and where it may reach effects and the environment.

python-check ships in the Constitution's release archive as `tools/python-check/dist/python-check.pyz`, which the project's interpreter runs, and it fails on each finding, printed as `<path>:<line>: <message>`. It reads `[tool.python-check]` of the `pyproject.toml` in the folder it runs from.

On the architecture axis, `extend` of `[tool.python-check]` lists the parts of the release archive, `presets/python/python-check/architecture/<block>.toml`, each a `[homes]` table that gives its block's package the folders it is imported in; the project's own `[tool.python-check.homes]` comes last. A home names `edge`, the whole edge; a top-level folder by its name; or `domain`, `adapters` or `app`, that layer of every feature and module of composition. The units its `[tool.uv.sources]` links from the workspace are the repository's own code, never an installed dependency.
