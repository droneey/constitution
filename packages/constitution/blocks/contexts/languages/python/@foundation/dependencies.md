# Dependencies

> Governs the packages and tools a Python project takes from others: the dev group, the pinned Python and a dependency's private names.

## Pinning

### tools-in-the-dev-group → tool-pinned-exactly-by-the-repository · MUST

Every tool the project installs from a registry is pinned with `==` in the `dev` group of `[dependency-groups]` in `pyproject.toml`. Exempt: the build backend a package's `[build-system]` requires, which that table holds to a range.

| Why |
|---|
| a tool declared among the package's dependencies or extras is published with every package built from it and installed by its consumers, and one pinned by a range runs in another version on each machine, while a dependency group stays in the repository. |

### requires-python-at-the-pinned-minor · MUST

Every package the project publishes to no registry floors its `requires-python` at the minor of the interpreter the repository pins. The floor sits in `[project]`, such as `>=3.14`.

| Why |
|---|
| the floor is the language the code is written for, and a lower one withholds features the pinned interpreter offers while claiming a support nobody tests. |

## Choosing and using

### underscored-name-of-a-dependency-never-imported → dependency-reached-through-its-published-entries · MUST

No code imports, from another package, a module or a name whose path has a segment that opens with `_`. Exempt: a name that opens and ends with two underscores, such as `__version__`, and a name its package documents as public, such as `os._exit` or a protocol of `_typeshed`.

| Why |
|---|
| a leading underscore is Python's mark of what a package keeps to itself, so code that imports such a name breaks at an update that changed it without notice. |
