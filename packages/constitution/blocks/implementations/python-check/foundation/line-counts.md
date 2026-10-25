# Line counts

> Governs the lines of a function and a file.

## General

### function-and-file-lines-counted → function-within-its-limits · MUST

A function of more than 100 lines, from its `def` to its last line, and a file of more than 500 lines fail the check. Test code, in `tests/`, and a generated file — `*_gen.py`, or a file in a package `*_gen/` — have no limit, and a function whose body is one data literal lifts its own by `# python-check: ignore[function-lines] -- <reason>` on its `def` line.

| Why |
|---|
| no linter of Python counts the lines of a function. |
