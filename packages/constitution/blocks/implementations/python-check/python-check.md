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

> Holds the rules of Python no other tool holds: the length of a function and a file, and on the architecture axis what a module may import and where it may reach effects and the environment. It ships in the Constitution's release archive as `tools/python-check/dist/python-check.pyz`, which the project's interpreter runs, and it fails on each finding, printed as `<path>:<line>: <message>`. It reads `[tool.python-check]` of the `pyproject.toml` in the folder it runs from.

### function-and-file-lines-counted → function-within-its-limits · MUST

A function of more than 100 lines, from its `def` to its last line, and a file of more than 500 lines fail the check. Test code, in `tests/`, and a generated file — `*_gen.py`, or a file in a package `*_gen/` — have no limit, and a function whose body is one data literal lifts its own by `# python-check: ignore[function-lines] -- <reason>` on its `def` line.

| Why | Tags |
|---|---|
| no linter of Python counts the lines of a function. | [] |
