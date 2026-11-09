---
id: python-check
summary: The Constitution's own check of what no Python tool holds.
requires: [python, task-runner]
languages: [python]
governs: ["pyproject.toml"]
---

# python-check

> Holds the rules of Python no other tool holds: the length of a function and a file, and on the architecture axis what a module may import and where it may reach effects and the environment.

The `python-check` command ships in the Constitution's distribution as `tools/python-check/dist/python-check.pyz`, which the project's interpreter runs, and it fails on each finding, printed as `<path>:<line>: <message>`. It reads `[tool.python-check]` of the `pyproject.toml` in the folder it runs from. The one suppression it reads is `# python-check: ignore[function-lines]  # <reason>` on the `def` line of the function it reports.

On the architecture axis, each block gives its package, in `[tool.python-check.homes]`, the folders it is imported in, and the project's own homes join them. A home names `"edge"`, the whole edge; a top-level folder by its name; or `"domain"`, `"application"`, `"infrastructure"` or `"presentation"`, that layer wherever it sits, in every feature and composition module, and `infrastructure/` at the top as well. The tool counts the units `[tool.uv.sources]` links from the workspace as the repository's own code.
