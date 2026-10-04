---
id: python-check
summary: The constitution's own check of what no Python tool holds.
requires: [python]
extends: null
abstract: false
checks: [lint, imports]
languages: [python]
roles: []
dictionary: [python-check]
governs: []
---

# python-check

> Holds the rules of Python no other tool holds: the length of a function and a file, and where a relative import may reach. It ships in the constitution's release archive as `tools/python-check/dist/python-check.pyz`; the check runs it with the project's interpreter over `src` and `tests` — `python .droneey/constitution/tools/python-check/dist/python-check.pyz src tests` — and it fails on each finding, printed as `<path>:<line>: <message>`.
